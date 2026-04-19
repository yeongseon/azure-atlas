import { MarkerType, type Edge } from "@xyflow/react";
import type { CSSProperties } from "react";

export const MARKER_COLORS = {
	light: { edge: "#cbd5e1", selected: "#3b82f6" },
	dark: { edge: "#334155", selected: "#60a5fa" },
} as const;

export const NODE_COLORS: Record<string, string> = {
	service: "#3b82f6",
	concept: "#8b5cf6",
	feature: "#10b981",
	pattern: "#f59e0b",
	default: "#64748b",
};

export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 116;

type FlowCssVars = CSSProperties & Record<`--${string}`, string>;

export const wrapperStyle: FlowCssVars = {
	width: "100%",
	height: "100%",
	background: "var(--graph-bg)",
	"--xy-background-color-default": "var(--graph-bg)",
	"--xy-node-background-color-default": "var(--surface-1)",
	"--xy-node-border-default": "var(--border)",
	"--xy-edge-stroke-default": "var(--graph-edge-color)",
	"--xy-edge-stroke-selected-default": "var(--graph-edge-selected)",
	"--xy-controls-button-background-color-default": "var(--graph-controls-bg)",
	"--xy-controls-button-background-color-hover-default": "var(--graph-controls-hover)",
	"--xy-controls-button-color-default": "var(--graph-controls-text)",
	"--xy-controls-button-border-color-default": "var(--graph-controls-border)",
	"--xy-minimap-background-color-default": "var(--graph-minimap-bg)",
	"--xy-minimap-mask-background-color-default": "var(--graph-minimap-mask)",
};

export const graphChrome = `
.atlas-flow .react-flow__renderer,
.atlas-flow .react-flow__pane,
.atlas-flow .react-flow__viewport {
	background: var(--graph-bg);
}

.atlas-flow .react-flow__attribution {
	display: none;
}

.atlas-flow .react-flow__controls {
	border: 1px solid var(--graph-controls-border);
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 18px 40px var(--node-shadow-base);
	backdrop-filter: blur(10px);
}

.atlas-flow .react-flow__controls button {
	width: 32px;
	height: 32px;
	border-bottom: 1px solid var(--graph-controls-border);
}

.atlas-flow .react-flow__controls button:last-child {
	border-bottom: 0;
}

.atlas-flow .react-flow__minimap {
	border: 1px solid var(--graph-controls-border);
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 18px 40px var(--node-shadow-base);
}
`;

interface GraphEdgeLike {
	edge_id: string;
	source_id: string;
	target_id: string;
	relation_type: string;
}

export function createFlowEdges(
	edges: GraphEdgeLike[],
	selectedNodeId: string | null,
	colorMode: "light" | "dark",
): Edge[] {
	const markerColors = MARKER_COLORS[colorMode];

	return edges.map((edge) => {
		const isSelected =
			selectedNodeId !== null &&
			(edge.source_id === selectedNodeId || edge.target_id === selectedNodeId);
		const isDimmed = selectedNodeId !== null && !isSelected;

		return {
			id: edge.edge_id,
			source: edge.source_id,
			target: edge.target_id,
			animated: isSelected,
			label: isSelected ? edge.relation_type : undefined,
			markerEnd: {
				type: MarkerType.ArrowClosed,
				width: 18,
				height: 18,
				color: isSelected ? markerColors.selected : markerColors.edge,
			},
			style: {
				stroke: isSelected
					? "var(--graph-edge-selected)"
					: "var(--graph-edge-color)",
				strokeWidth: isSelected ? 2.5 : 1.4,
				opacity: isDimmed ? 0.15 : 0.9,
			},
			...(isSelected
				? {
						labelStyle: {
							fill: "var(--graph-edge-label-selected-text)",
							fontSize: 11,
							fontWeight: 600,
						},
						labelBgStyle: {
							fill: "var(--graph-edge-label-bg)",
							stroke: "var(--graph-edge-selected)",
							strokeWidth: 1,
							fillOpacity: 0.94,
							rx: 6,
							ry: 6,
						},
						labelBgPadding: [6, 3] as [number, number],
						labelBgBorderRadius: 6,
					}
				: {}),
		};
	});
}
