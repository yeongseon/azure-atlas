import dagre from "@dagrejs/dagre";
import { Position } from "@xyflow/react";

import type { AtlasFlowNode } from "./AtlasNode";
import { NODE_COLORS, NODE_HEIGHT, NODE_WIDTH } from "./graphTheme";

interface GraphNodeLike {
	node_id: string;
	label: string;
	node_type: string;
	evidence_count?: number;
	domain_id?: string;
}

interface GraphEdgeLike {
	source_id: string;
	target_id: string;
}

export const GRAPH_LAYOUT_CONFIG = {
	nodesep: 72,
	ranksep: 160,
	marginx: 48,
	marginy: 48,
} as const;

export function getLayoutedNodes(
	nodes: GraphNodeLike[],
	edges: GraphEdgeLike[],
	domainColors?: Record<string, string>,
): AtlasFlowNode[] {
	const graph = new dagre.graphlib.Graph();
	graph.setGraph({
		rankdir: nodes.length > 10 ? "LR" : "TB",
		...GRAPH_LAYOUT_CONFIG,
	});
	graph.setDefaultEdgeLabel(() => ({}));

	for (const node of nodes) {
		graph.setNode(node.node_id, { width: NODE_WIDTH, height: NODE_HEIGHT });
	}

	for (const edge of edges) {
		graph.setEdge(edge.source_id, edge.target_id);
	}

	dagre.layout(graph);

	return nodes.map((node) => {
		const position = graph.node(node.node_id);
		const color =
			domainColors && node.domain_id
				? (domainColors[node.domain_id] ?? NODE_COLORS.default)
				: (NODE_COLORS[node.node_type] ?? NODE_COLORS.default);

		return {
			id: node.node_id,
			type: "atlasNode",
			position: {
				x: position.x - NODE_WIDTH / 2,
				y: position.y - NODE_HEIGHT / 2,
			},
			sourcePosition: Position.Right,
			targetPosition: Position.Left,
			data: {
				label: node.label,
				nodeType: node.node_type,
				evidenceCount: node.evidence_count ?? 0,
				color,
				isDimmed: false,
				isNeighbor: false,
				isSelected: false,
			},
		};
	});
}
