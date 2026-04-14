import type {
  DomainSummary,
  EdgeSummary,
  EvidenceItem,
  JourneyStep,
  JourneySummary,
} from './types'

interface AtlasMeta {
  version: string
  generated_at: string
  counts: {
    domains: number
    nodes: number
    edges: number
    evidence: number
    journeys: number
    journey_steps: number
  }
}

export interface AtlasNodeRecord {
  node_id: string
  domain_id: string
  label: string
  node_type: string
  summary: string | null
  detail_md: string | null
}

export interface AtlasJourneyStepRecord extends JourneyStep {
  journey_id: string
}

export interface AtlasDataset {
  meta: AtlasMeta
  domains: DomainSummary[]
  nodes: AtlasNodeRecord[]
  edges: EdgeSummary[]
  evidence: EvidenceItem[]
  journeys: JourneySummary[]
  journeySteps: AtlasJourneyStepRecord[]
}

export interface LoadedAtlasDataset extends AtlasDataset {
  nodesById: Map<string, AtlasNodeRecord>
  edgesByNodeId: Map<string, EdgeSummary[]>
  evidenceByNodeId: Map<string, EvidenceItem[]>
  journeyStepsById: Map<string, JourneyStep[]>
  evidenceCountByNodeId: Map<string, number>
}

const DATA_URL = `${import.meta.env.BASE_URL}data/atlas.json`

let datasetPromise: Promise<LoadedAtlasDataset> | null = null

function pushMapValue<T>(map: Map<string, T[]>, key: string, value: T): void {
  const existing = map.get(key)
  if (existing) {
    existing.push(value)
    return
  }
  map.set(key, [value])
}

function buildLookupMaps(dataset: AtlasDataset): LoadedAtlasDataset {
  const nodesById = new Map<string, AtlasNodeRecord>()
  const edgesByNodeId = new Map<string, EdgeSummary[]>()
  const evidenceByNodeId = new Map<string, EvidenceItem[]>()
  const journeyStepsById = new Map<string, JourneyStep[]>()
  const evidenceCountByNodeId = new Map<string, number>()

  dataset.nodes.forEach(node => {
    nodesById.set(node.node_id, node)
  })

  dataset.edges.forEach(edge => {
    pushMapValue(edgesByNodeId, edge.source_id, edge)
    pushMapValue(edgesByNodeId, edge.target_id, edge)
  })

  dataset.evidence.forEach(item => {
    pushMapValue(evidenceByNodeId, item.node_id, item)
  })

  dataset.nodes.forEach(node => {
    evidenceCountByNodeId.set(node.node_id, evidenceByNodeId.get(node.node_id)?.length ?? 0)
  })

  dataset.journeySteps.forEach(step => {
    pushMapValue(journeyStepsById, step.journey_id, {
      step_order: step.step_order,
      node_id: step.node_id,
      label: step.label,
      narrative: step.narrative,
    })
  })

  journeyStepsById.forEach(steps => {
    steps.sort((left, right) => left.step_order - right.step_order)
  })

  return {
    ...dataset,
    nodesById,
    edgesByNodeId,
    evidenceByNodeId,
    journeyStepsById,
    evidenceCountByNodeId,
  }
}

async function fetchAtlasDataset(): Promise<LoadedAtlasDataset> {
  const res = await fetch(DATA_URL)
  if (!res.ok) throw new Error(`API error ${res.status}: ${DATA_URL}`)
  const dataset = (await res.json()) as AtlasDataset
  return buildLookupMaps(dataset)
}

export function loadAtlasDataset(): Promise<LoadedAtlasDataset> {
  if (!datasetPromise) {
    datasetPromise = fetchAtlasDataset()
  }
  return datasetPromise
}
