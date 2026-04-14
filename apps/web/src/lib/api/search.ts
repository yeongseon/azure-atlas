import type { LoadedAtlasDataset } from './dataset'
import type { NodePreview } from './types'

interface SearchMatch {
  node: NodePreview
  score: number
}

function getScore(label: string, summary: string | null, query: string): number {
  if (label === query) return 100
  if (label.startsWith(query)) return 80
  if (label.includes(query)) return 60
  if (summary?.includes(query)) return 40
  return -1
}

function collectMatches(
  dataset: LoadedAtlasDataset,
  query: string,
  nodeType?: string,
): SearchMatch[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery) return []

  return dataset.nodes
    .filter(node => !nodeType || node.node_type === nodeType)
    .map(node => {
      const score = getScore(
        node.label.toLocaleLowerCase(),
        node.summary?.toLocaleLowerCase() ?? null,
        normalizedQuery,
      )

      return score >= 0
        ? {
            node: {
              node_id: node.node_id,
              label: node.label,
              node_type: node.node_type,
              summary: node.summary,
            },
            score,
          }
        : null
    })
    .filter((match): match is SearchMatch => match !== null)
    .sort((left, right) => right.score - left.score || left.node.label.localeCompare(right.node.label))
}

export function searchNodes(
  dataset: LoadedAtlasDataset,
  query: string,
  limit: number,
  nodeType?: string,
): NodePreview[] {
  return collectMatches(dataset, query, nodeType)
    .slice(0, limit)
    .map(match => match.node)
}
