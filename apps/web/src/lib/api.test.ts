import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('api.listDomains', () => {
  it('fetches domains from /api/v1/domains', async () => {
    const payload = { domains: [{ domain_id: 'net', label: 'Network' }] }
    mockFetch.mockResolvedValueOnce(jsonResponse(payload))

    const result = await api.listDomains()

    expect(mockFetch).toHaveBeenCalledOnce()
    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('/domains')
    expect(result.domains).toHaveLength(1)
    expect(result.domains[0].domain_id).toBe('net')
  })
})

describe('api.getDomain', () => {
  it('fetches a single domain by id', async () => {
    const payload = { domain: { domain_id: 'net' }, nodes: [], edges: [], node_count: 0 }
    mockFetch.mockResolvedValueOnce(jsonResponse(payload))

    const result = await api.getDomain('net')

    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('/domains/net')
    expect(result.domain.domain_id).toBe('net')
  })
})

describe('api.getSubgraph', () => {
  it('sends depth and relation_types as query params', async () => {
    const payload = { center_node_id: 'vnet', nodes: [], edges: [] }
    mockFetch.mockResolvedValueOnce(jsonResponse(payload))

    await api.getSubgraph('vnet', 2, ['contains', 'depends_on'])

    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('/nodes/vnet/subgraph')
    expect(url).toContain('depth=2')
    expect(url).toContain('relation_types=contains')
    expect(url).toContain('relation_types=depends_on')
  })

  it('defaults depth to 1 without relation_types', async () => {
    const payload = { center_node_id: 'vnet', nodes: [], edges: [] }
    mockFetch.mockResolvedValueOnce(jsonResponse(payload))

    await api.getSubgraph('vnet')

    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('depth=1')
    expect(url).not.toContain('relation_types')
  })
})

describe('api.search', () => {
  it('sends q, limit, and optional node_type', async () => {
    const payload = { query: 'vnet', results: [], total: 0 }
    mockFetch.mockResolvedValueOnce(jsonResponse(payload))

    await api.search('vnet', 10, 'service')

    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('/search')
    expect(url).toContain('q=vnet')
    expect(url).toContain('limit=10')
    expect(url).toContain('node_type=service')
  })

  it('omits node_type when not provided', async () => {
    const payload = { query: 'subnet', results: [], total: 0 }
    mockFetch.mockResolvedValueOnce(jsonResponse(payload))

    await api.search('subnet')

    const url: string = mockFetch.mock.calls[0][0]
    expect(url).not.toContain('node_type')
  })
})

describe('api.getEvidence', () => {
  it('fetches evidence for a node', async () => {
    const payload = { node_id: 'vnet', evidence: [{ evidence_id: 'e1' }] }
    mockFetch.mockResolvedValueOnce(jsonResponse(payload))

    const result = await api.getEvidence('vnet')

    expect(result.node_id).toBe('vnet')
    expect(result.evidence).toHaveLength(1)
  })
})

describe('api.listJourneys', () => {
  it('fetches journeys list', async () => {
    const payload = { journeys: [{ journey_id: 'j1', title: 'Build VNet' }] }
    mockFetch.mockResolvedValueOnce(jsonResponse(payload))

    const result = await api.listJourneys()

    expect(result.journeys).toHaveLength(1)
  })
})

describe('api.getJourney', () => {
  it('fetches a single journey by id', async () => {
    const payload = { journey: { journey_id: 'j1' }, steps: [] }
    mockFetch.mockResolvedValueOnce(jsonResponse(payload))

    const result = await api.getJourney('j1')

    const url: string = mockFetch.mock.calls[0][0]
    expect(url).toContain('/journeys/j1')
    expect(result.journey.journey_id).toBe('j1')
  })
})

describe('error handling', () => {
  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(new Response('Not Found', { status: 404 }))

    await expect(api.getNode('nonexistent')).rejects.toThrow('API error 404')
  })
})
