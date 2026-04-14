import dagre from "@dagrejs/dagre";
import {
	Background,
	Controls,
	type Edge,
	Handle,
	MarkerType,
	MiniMap,
	type Node,
	type NodeMouseHandler,
	type NodeProps,
	Position,
	ReactFlow,
	type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
	type CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

export interface GraphNode {
	node_id: string;
	label: string;
	node_type: string;
	summary?: string | null;
	evidence_count?: number;
	domain_id?: string;
}

export interface GraphEdge {
	edge_id: string;
	source_id: string;
	target_id: string;
	relation_type: string;
	weight?: number;
}

interface Props {
	nodes: GraphNode[];
	edges: GraphEdge[];
	centerNodeId?: string;
	onNodeClick?: (nodeId: string) => void;
	domainColors?: Record<string, string>;
}

const MARKER_COLORS = {
	light: { edge: "#cbd5e1", selected: "#3b82f6" },
	dark: { edge: "#334155", selected: "#60a5fa" },
} as const;

const NODE_COLORS: Record<string, string> = {
	service: "#3b82f6",
	concept: "#8b5cf6",
	feature: "#10b981",
	pattern: "#f59e0b",
	default: "#64748b",
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 92;

type FlowCssVars = CSSProperties & Record<`--${string}`, string>;

interface TooltipState {
	x: number;
	y: number;
	label: string;
	type: string;
	evidenceCount: number;
}

interface AtlasNodeData extends Record<string, unknown> {
	label: string;
	nodeType: string;
	evidenceCount: number;
	color: string;
	isDimmed: boolean;
	isNeighbor: boolean;
	isSelected: boolean;
}

type AtlasFlowNode = Node<AtlasNodeData, "atlasNode">;

const wrapperStyle: FlowCssVars = {
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

const graphChrome = `
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

function AtlasNode({ data, selected }: NodeProps<AtlasFlowNode>) {
	const borderColor = selected ? "var(--node-label-color)" : data.color;
	const badgeColor = data.color;

	return (
		<>
			<Handle
				type="target"
				position={Position.Left}
				style={{ opacity: 0, width: 8, height: 8 }}
			/>
			<div
				style={{
					width: NODE_WIDTH,
					minHeight: NODE_HEIGHT,
					padding: "14px 14px 12px",
					borderRadius: 18,
					border: `2px solid ${borderColor}`,
					background: `linear-gradient(160deg, var(--node-bg-gradient-start) 0%, var(--node-bg-gradient-end) 100%)`,
					boxShadow: selected
						? `0 0 0 1px rgba(255,255,255,0.08), 0 0 30px ${data.color}55, 0 16px 34px var(--node-shadow-selected)`
						: data.isNeighbor
							? `0 10px 28px var(--node-shadow-neighbor)`
							: "0 8px 24px var(--node-shadow-base)",
					opacity: data.isDimmed ? 0.25 : 1,
					transform: selected ? "scale(1.03)" : "scale(1)",
					transition:
						"opacity 160ms ease, transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
					backdropFilter: "blur(10px)",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						gap: 12,
						justifyContent: "space-between",
					}}
				>
					<div
						style={{
							color: "var(--node-label-color)",
							fontSize: 13,
							fontWeight: 700,
							lineHeight: 1.35,
							letterSpacing: "0.01em",
							maxWidth: 150,
						}}
					>
						{data.label}
					</div>
					<div
						style={{
							minWidth: 34,
							height: 34,
							padding: "0 10px",
							borderRadius: 999,
							display: "grid",
							placeItems: "center",
							background: "var(--node-badge-bg)",
							border: "1px solid var(--node-badge-border)",
							color: "var(--node-badge-text)",
							fontSize: 12,
							fontWeight: 700,
							boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
						}}
					>
						{data.evidenceCount}
					</div>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 10,
						marginTop: 12,
					}}
				>
					<span
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 8,
							padding: "5px 10px",
							borderRadius: 999,
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: "0.06em",
							textTransform: "uppercase",
							color: badgeColor,
							background: `${badgeColor}1a`,
							border: `1px solid ${badgeColor}33`,
						}}
					>
						<span
							style={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								background: badgeColor,
								boxShadow: `0 0 14px ${badgeColor}99`,
							}}
						/>
						{data.nodeType}
					</span>
					<span
						style={{
							color: "var(--node-evidence-label-color)",
							fontSize: 11,
							fontWeight: 600,
						}}
					>
						Evidence links
					</span>
				</div>
			</div>
			<Handle
				type="source"
				position={Position.Right}
				style={{ opacity: 0, width: 8, height: 8 }}
			/>
		</>
	);
}

const nodeTypes = {
	atlasNode: AtlasNode,
};

function getLayoutedNodes(
	nodes: GraphNode[],
	edges: GraphEdge[],
	domainColors?: Record<string, string>,
): AtlasFlowNode[] {
	const graph = new dagre.graphlib.Graph();
	graph.setGraph({
		rankdir: nodes.length > 10 ? "LR" : "TB",
		nodesep: 42,
		ranksep: 110,
		marginx: 32,
		marginy: 32,
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
		const color = domainColors && node.domain_id
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

export default function ReactFlowGraph({
	nodes,
	edges,
	centerNodeId,
	onNodeClick,
	domainColors,
}: Props) {
	const flowRef = useRef<ReactFlowInstance<AtlasFlowNode, Edge> | null>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
		centerNodeId ?? null,
	);
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);
	const [colorMode, setColorMode] = useState<"light" | "dark">(() => {
		if (typeof document === "undefined") {
			return "dark";
		}

		return document.documentElement.getAttribute("data-theme") === "light"
			? "light"
			: "dark";
	});

	useEffect(() => {
		setSelectedNodeId(centerNodeId ?? null);
	}, [centerNodeId]);

	useEffect(() => {
		const root = document.documentElement;
		const syncTheme = () => {
			setColorMode(root.getAttribute("data-theme") === "light" ? "light" : "dark");
		};

		syncTheme();

		const observer = new MutationObserver(syncTheme);
		observer.observe(root, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});

		return () => observer.disconnect();
	}, []);

	const neighborMap = useMemo(() => {
		const map = new Map<string, Set<string>>();

		for (const node of nodes) {
			map.set(node.node_id, new Set());
		}

		for (const edge of edges) {
			map.get(edge.source_id)?.add(edge.target_id);
			map.get(edge.target_id)?.add(edge.source_id);
		}

		return map;
	}, [nodes, edges]);

	const flowNodes = useMemo<AtlasFlowNode[]>(() => {
		const selectedNeighbors = selectedNodeId
			? (neighborMap.get(selectedNodeId) ?? new Set<string>())
			: null;

		return getLayoutedNodes(nodes, edges, domainColors).map((node) => {
			const isSelected = node.id === selectedNodeId;
			const isNeighbor = selectedNeighbors?.has(node.id) ?? false;
			const isDimmed = selectedNodeId !== null && !isSelected && !isNeighbor;

			return {
				...node,
				selected: isSelected,
				data: {
					...node.data,
					isSelected,
					isNeighbor,
					isDimmed,
				},
			};
		});
	}, [domainColors, edges, neighborMap, nodes, selectedNodeId]);

	const flowEdges = useMemo<Edge[]>(() => {
		const mc = MARKER_COLORS[colorMode];

		return edges.map((edge) => {
			const isSelected =
				selectedNodeId !== null &&
				(edge.source_id === selectedNodeId ||
					edge.target_id === selectedNodeId);
			const isDimmed = selectedNodeId !== null && !isSelected;

			return {
				id: edge.edge_id,
				source: edge.source_id,
				target: edge.target_id,
				animated: true,
				label: edge.relation_type,
				markerEnd: {
					type: MarkerType.ArrowClosed,
					width: 18,
					height: 18,
					color: isSelected ? mc.selected : mc.edge,
				},
				style: {
					stroke: isSelected
						? "var(--graph-edge-selected)"
						: "var(--graph-edge-color)",
					strokeWidth: isSelected ? 2.5 : 1.6,
					opacity: isDimmed ? 0.2 : 1,
				},
				labelStyle: {
					fill: isSelected
						? "var(--graph-edge-label-selected-text)"
						: "var(--graph-edge-label-text)",
					fontSize: 11,
					fontWeight: 600,
				},
				labelBgStyle: {
					fill: "var(--graph-edge-label-bg)",
					stroke: isSelected
						? "var(--graph-edge-selected)"
						: "var(--graph-edge-color)",
					strokeWidth: 1,
					fillOpacity: isSelected ? 0.94 : 0.86,
					rx: 6,
					ry: 6,
				},
				labelBgPadding: [6, 3],
				labelBgBorderRadius: 6,
			};
		});
	}, [colorMode, edges, selectedNodeId]);

	useEffect(() => {
		if (!flowRef.current || flowNodes.length === 0) return;

		window.requestAnimationFrame(() => {
			flowRef.current?.fitView({ padding: 0.16, duration: 450 });
			if (centerNodeId) {
				const node = flowNodes.find((entry) => entry.id === centerNodeId);
				if (!node) return;
				flowRef.current?.setCenter(
					node.position.x + NODE_WIDTH / 2,
					node.position.y + NODE_HEIGHT / 2,
					{
						zoom: Math.min(flowRef.current?.getZoom() ?? 1, 1),
						duration: 450,
					},
				);
			}
		});
	}, [centerNodeId, flowNodes]);

	const updateTooltip = useCallback(
		(clientX: number, clientY: number, node: AtlasFlowNode) => {
			const bounds = wrapperRef.current?.getBoundingClientRect();
			if (!bounds) return;

			setTooltip({
				x: clientX - bounds.left,
				y: clientY - bounds.top - 18,
				label: node.data.label,
				type: node.data.nodeType,
				evidenceCount: node.data.evidenceCount,
			});
		},
		[],
	);

	const handleNodeClick: NodeMouseHandler<AtlasFlowNode> = useCallback(
		(_, node) => {
			setSelectedNodeId(node.id);
			onNodeClick?.(node.id);
		},
		[onNodeClick],
	);

	const handleNodeMouseEnter: NodeMouseHandler<AtlasFlowNode> = useCallback(
		(event, node) => {
			updateTooltip(event.clientX, event.clientY, node);
		},
		[updateTooltip],
	);

	const handleNodeMouseMove: NodeMouseHandler<AtlasFlowNode> = useCallback(
		(event, node) => {
			updateTooltip(event.clientX, event.clientY, node);
		},
		[updateTooltip],
	);

	const clearSelection = useCallback(() => {
		setSelectedNodeId(null);
		setTooltip(null);
	}, []);

	return (
		<div
			ref={wrapperRef}
			style={{ position: "relative", width: "100%", height: "100%" }}
		>
			<style>{graphChrome}</style>
			<div className="atlas-flow" style={wrapperStyle}>
				<ReactFlow
					nodes={flowNodes}
					edges={flowEdges}
					colorMode={colorMode}
					nodeTypes={nodeTypes}
					onInit={(instance) => {
						flowRef.current = instance;
					}}
					onNodeClick={handleNodeClick}
					onNodeMouseEnter={handleNodeMouseEnter}
					onNodeMouseMove={handleNodeMouseMove}
					onNodeMouseLeave={() => setTooltip(null)}
					onPaneClick={clearSelection}
					onMoveStart={() => setTooltip(null)}
					fitView
					fitViewOptions={{ padding: 0.16 }}
					nodesDraggable={false}
					nodesConnectable={false}
					elementsSelectable={false}
					selectNodesOnDrag={false}
					panOnDrag
					minZoom={0.2}
					maxZoom={1.8}
					proOptions={{ hideAttribution: true }}
				>
					<MiniMap
						pannable
						zoomable
						nodeStrokeWidth={3}
						nodeColor={(node) => {
							const atlasNode = node as AtlasFlowNode;
							return atlasNode.data.color;
						}}
						maskColor="var(--graph-minimap-mask)"
						style={{ background: "var(--graph-minimap-bg)" }}
					/>
					<Controls showInteractive={false} position="top-right" />
					<Background color="var(--graph-grid-color)" gap={28} size={1.1} />
				</ReactFlow>
			</div>

			{tooltip && (
				<div
					style={{
						position: "absolute",
						left: tooltip.x,
						top: tooltip.y,
						transform: "translate(-50%, -100%)",
						padding: "8px 12px",
						borderRadius: 8,
						background: "var(--tooltip-bg)",
						border: "1px solid var(--tooltip-border)",
						boxShadow: "0 14px 30px var(--node-shadow-selected)",
						color: "var(--tooltip-text)",
						fontSize: 12,
						pointerEvents: "none",
						zIndex: 20,
						whiteSpace: "nowrap",
						display: "grid",
						gap: 4,
					}}
				>
					<div style={{ fontSize: 13, fontWeight: 700 }}>{tooltip.label}</div>
					<div style={{ color: "var(--tooltip-secondary)" }}>
						Type{" "}
						<span
							style={{ color: "var(--tooltip-text)", textTransform: "capitalize" }}
						>
							{tooltip.type}
						</span>
					</div>
					<div style={{ color: "var(--tooltip-secondary)" }}>
						Evidence{" "}
						<span style={{ color: "var(--tooltip-text)" }}>
							{tooltip.evidenceCount}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
