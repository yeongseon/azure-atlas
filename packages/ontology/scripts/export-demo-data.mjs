import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../../..')

const seedFiles = [
  path.join(repoRoot, 'packages/ontology/seed_network.sql'),
  path.join(repoRoot, 'packages/ontology/seed_storage.sql'),
  path.join(repoRoot, 'packages/ontology/seed_compute.sql'),
]

const outputDir = path.join(repoRoot, 'apps/web/public/data')
const outputFile = path.join(outputDir, 'atlas.json')
const tablesToExport = new Set(['domains', 'nodes', 'edges', 'evidence', 'journeys', 'journey_steps'])

function extractInsertStatements(sql) {
  const statements = []
  const headerRegex = /INSERT INTO\s+([a-z_]+)\s*\(([^)]+)\)\s*VALUES\s*/gi

  let match = headerRegex.exec(sql)
  while (match !== null) {
    const [, table, columnsRaw] = match
    const valuesStart = headerRegex.lastIndex
    const statementEnd = findStatementTerminator(sql, valuesStart)

    if (!tablesToExport.has(table)) {
      headerRegex.lastIndex = statementEnd + 1
      continue
    }

    const valuesRaw = sql.slice(valuesStart, statementEnd)
    statements.push({
      table,
      columns: columnsRaw.split(',').map(column => column.trim()),
      rows: parseValues(valuesRaw),
    })

    headerRegex.lastIndex = statementEnd + 1
    match = headerRegex.exec(sql)
  }

  return statements
}

function findStatementTerminator(sql, startIndex) {
  let index = startIndex
  let inString = false

  while (index < sql.length) {
    const char = sql[index]

    if (char === "'") {
      if (inString && sql[index + 1] === "'") {
        index += 2
        continue
      }

      inString = !inString
      index += 1
      continue
    }

    if (!inString && char === ';') {
      return index
    }

    index += 1
  }

  throw new Error('Could not find INSERT statement terminator')
}

function parseValues(valuesRaw) {
  const rows = []
  let index = 0

  while (index < valuesRaw.length) {
    index = skipSeparators(valuesRaw, index)
    if (index >= valuesRaw.length) break

    if (valuesRaw[index] !== '(') {
      throw new Error(`Expected "(" while parsing VALUES at index ${index}`)
    }

    const { row, nextIndex } = parseRow(valuesRaw, index)
    rows.push(row)
    index = nextIndex
  }

  return rows
}

function skipSeparators(input, startIndex) {
  let index = startIndex
  while (index < input.length) {
    const char = input[index]
    if (char === ',' || /\s/.test(char)) {
      index += 1
      continue
    }
    break
  }
  return index
}

function parseRow(input, startIndex) {
  const row = []
  let index = startIndex + 1

  while (index < input.length) {
    index = skipWhitespace(input, index)
    const { value, nextIndex } = parseValue(input, index)
    row.push(value)
    index = skipWhitespace(input, nextIndex)

    if (input[index] === ',') {
      index += 1
      continue
    }

    if (input[index] === ')') {
      return { row, nextIndex: index + 1 }
    }

    throw new Error(`Unexpected token "${input[index] ?? 'EOF'}" while parsing row at index ${index}`)
  }

  throw new Error('Unterminated row while parsing VALUES')
}

function skipWhitespace(input, startIndex) {
  let index = startIndex
  while (index < input.length && /\s/.test(input[index])) {
    index += 1
  }
  return index
}

function parseValue(input, startIndex) {
  if (input[startIndex] === "'") {
    return parseQuotedString(input, startIndex)
  }

  let index = startIndex
  while (index < input.length && input[index] !== ',' && input[index] !== ')') {
    index += 1
  }

  const rawValue = input.slice(startIndex, index).trim()

  if (/^null$/i.test(rawValue)) {
    return { value: null, nextIndex: index }
  }

  if (/^-?\d+(?:\.\d+)?$/.test(rawValue)) {
    return { value: Number(rawValue), nextIndex: index }
  }

  throw new Error(`Unsupported SQL value: ${rawValue}`)
}

function parseQuotedString(input, startIndex) {
  let index = startIndex + 1
  let value = ''

  while (index < input.length) {
    const char = input[index]

    if (char === "'") {
      if (input[index + 1] === "'") {
        value += "'"
        index += 2
        continue
      }

      return { value, nextIndex: index + 1 }
    }

    value += char
    index += 1
  }

  throw new Error('Unterminated SQL string literal')
}

function rowsToObjects(columns, rows) {
  return rows.map((row) => {
    if (row.length !== columns.length) {
      throw new Error(`Column/value length mismatch: expected ${columns.length}, got ${row.length}`)
    }

    return Object.fromEntries(columns.map((column, index) => [column, row[index]]))
  })
}

function buildAtlas(records) {
  const duplicateNodeIds = new Set()
  const nodeMap = new Map()
  const domains = []
  const edges = []
  const evidence = []
  const journeys = []
  const journeySteps = []
  const evidenceCounters = new Map()

  for (const domain of records.domains) {
    domains.push({
      domain_id: domain.domain_id,
      label: domain.label,
      description: domain.description,
      icon_url: null,
      display_order: domain.display_order,
    })
  }

  for (const node of records.nodes) {
    if (nodeMap.has(node.node_id)) {
      duplicateNodeIds.add(node.node_id)
      continue
    }

    const atlasNode = {
      node_id: node.node_id,
      domain_id: node.domain_id,
      label: node.label,
      node_type: node.node_type,
      summary: node.summary,
      detail_md: null,
    }

    nodeMap.set(node.node_id, atlasNode)
  }

  for (const edge of records.edges) {
    edges.push({
      edge_id: `e-${edge.source_id}-${edge.target_id}-${edge.relation_type}`,
      source_id: edge.source_id,
      target_id: edge.target_id,
      relation_type: edge.relation_type,
      weight: edge.weight,
    })
  }

  for (const item of records.evidence) {
    const nextIndex = (evidenceCounters.get(item.node_id) ?? 0) + 1
    evidenceCounters.set(item.node_id, nextIndex)
    evidence.push({
      evidence_id: `ev-${item.node_id}-${nextIndex}`,
      node_id: item.node_id,
      excerpt: item.excerpt,
      source_url: item.source_url,
      source_title: item.source_title,
      confidence_score: item.confidence_score,
    })
  }

  for (const journey of records.journeys) {
    journeys.push({
      journey_id: journey.journey_id,
      domain_id: journey.domain_id,
      title: journey.title,
      description: journey.description,
    })
  }

  for (const step of records.journey_steps) {
    const node = nodeMap.get(step.node_id)
    if (!node) {
      throw new Error(`Journey step references missing node_id: ${step.node_id}`)
    }

    journeySteps.push({
      journey_id: step.journey_id,
      node_id: step.node_id,
      step_order: step.step_order,
      label: node.label,
      narrative: step.narrative,
    })
  }

  const atlas = {
    meta: {
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      counts: {
        domains: domains.length,
        nodes: nodeMap.size,
        edges: edges.length,
        evidence: evidence.length,
        journeys: journeys.length,
        journey_steps: journeySteps.length,
      },
    },
    domains: domains.sort((a, b) => a.display_order - b.display_order),
    nodes: [...nodeMap.values()],
    edges,
    evidence,
    journeys,
    journeySteps,
  }

  return { atlas, duplicateNodeIds: [...duplicateNodeIds].sort() }
}

async function main() {
  const records = {
    domains: [],
    nodes: [],
    edges: [],
    evidence: [],
    journeys: [],
    journey_steps: [],
  }

  for (const seedFile of seedFiles) {
    const sql = await readFile(seedFile, 'utf8')

    for (const statement of extractInsertStatements(sql)) {
      records[statement.table].push(...rowsToObjects(statement.columns, statement.rows))
    }
  }

  const { atlas, duplicateNodeIds } = buildAtlas(records)

  await mkdir(outputDir, { recursive: true })
  await writeFile(outputFile, `${JSON.stringify(atlas, null, 2)}\n`, 'utf8')

  console.log(`Exported demo data to ${path.relative(repoRoot, outputFile)}`)
  console.log(`Domains: ${atlas.meta.counts.domains}`)
  console.log(`Nodes: ${atlas.meta.counts.nodes}`)
  console.log(`Edges: ${atlas.meta.counts.edges}`)
  console.log(`Evidence: ${atlas.meta.counts.evidence}`)
  console.log(`Journeys: ${atlas.meta.counts.journeys}`)
  console.log(`Journey steps: ${atlas.meta.counts.journey_steps}`)

  if (duplicateNodeIds.length > 0) {
    console.warn(`Deduplicated ${duplicateNodeIds.length} duplicate node_id values: ${duplicateNodeIds.join(', ')}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
