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
}

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
	background: "#0f172a",
	"--xy-background-color-default": "#0f172a",
	"--xy-node-background-color-default": "#1e293b",
	"--xy-node-border-default": "#334155",
	"--xy-edge-stroke-default": "#334155",
	"--xy-edge-stroke-selected-default": "#60a5fa",
	"--xy-controls-button-background-color-default": "#1e293b",
	"--xy-controls-button-background-color-hover-default": "#334155",
	"--xy-controls-button-color-default": "#cbd5e1",
	"--xy-controls-button-border-color-default": "#334155",
	"--xy-minimap-background-color-default": "rgba(15, 23, 42, 0.92)",
	"--xy-minimap-mask-background-color-default": "rgba(15, 23, 42, 0.76)",
};

const graphChrome = `
.atlas-flow .react-flow__renderer,
.atlas-flow .react-flow__pane,
.atlas-flow .react-flow__viewport {
	background: #0f172a;
}

.atlas-flow .react-flow__attribution {
	display: none;
}

.atlas-flow .react-flow__controls {
	border: 1px solid #334155;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 18px 40px rgba(15, 23, 42, 0.42);
	backdrop-filter: blur(10px);
}

.atlas-flow .react-flow__controls button {
	width: 32px;
	height: 32px;
	border-bottom: 1px solid #334155;
}

.atlas-flow .react-flow__controls button:last-child {
	border-bottom: 0;
}

.atlas-flow .react-flow__minimap {
	border: 1px solid #334155;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 18px 40px rgba(15, 23, 42, 0.42);
}
`;

function AtlasNode({ data, selected }: NodeProps<AtlasFlowNode>) {
	const borderColor = selected ? "#e2e8f0" : data.color;
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
					background: `linear-gradient(160deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.98) 100%)`,
					boxShadow: selected
						? `0 0 0 1px rgba(255,255,255,0.08), 0 0 30px ${data.color}55, 0 16px 34px rgba(2, 6, 23, 0.62)`
						: data.isNeighbor
							? `0 10px 28px rgba(2, 6, 23, 0.42)`
							: "0 8px 24px rgba(2, 6, 23, 0.32)",
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
							color: "#e2e8f0",
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
							background: "rgba(15, 23, 42, 0.9)",
							border: "1px solid #334155",
							color: "#cbd5e1",
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
					<span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>
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
		const color = NODE_COLORS[node.node_type] ?? NODE_COLORS.default;

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
}: Props) {
	const flowRef = useRef<ReactFlowInstance<AtlasFlowNode, Edge> | null>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
		centerNodeId ?? null,
	);
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);

	useEffect(() => {
		setSelectedNodeId(centerNodeId ?? null);
	}, [centerNodeId]);

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

		return getLayoutedNodes(nodes, edges).map((node) => {
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
	}, [edges, neighborMap, nodes, selectedNodeId]);

	const flowEdges = useMemo<Edge[]>(
		() =>
			edges.map((edge) => {
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
						color: isSelected ? "#60a5fa" : "#334155",
					},
					style: {
						stroke: isSelected ? "#60a5fa" : "#334155",
						strokeWidth: isSelected ? 2.5 : 1.6,
						opacity: isDimmed ? 0.2 : 1,
					},
					labelStyle: {
						fill: isSelected ? "#93c5fd" : "#cbd5e1",
						fontSize: 11,
						fontWeight: 600,
					},
					labelBgStyle: {
						fill: "#1e293b",
						stroke: isSelected ? "#60a5fa" : "#334155",
						strokeWidth: 1,
						fillOpacity: isSelected ? 0.94 : 0.86,
						rx: 6,
						ry: 6,
					},
					labelBgPadding: [6, 3],
					labelBgBorderRadius: 6,
				};
			}),
		[edges, selectedNodeId],
	);

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
						maskColor="rgba(15, 23, 42, 0.72)"
						style={{ background: "rgba(15, 23, 42, 0.92)" }}
					/>
					<Controls showInteractive={false} position="top-right" />
					<Background color="#1e293b" gap={28} size={1.1} />
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
						background: "rgba(15, 23, 42, 0.94)",
						border: "1px solid #334155",
						boxShadow: "0 14px 30px rgba(2, 6, 23, 0.52)",
						color: "#e2e8f0",
						fontSize: 12,
						pointerEvents: "none",
						zIndex: 20,
						whiteSpace: "nowrap",
						display: "grid",
						gap: 4,
					}}
				>
					<div style={{ fontSize: 13, fontWeight: 700 }}>{tooltip.label}</div>
					<div style={{ color: "#94a3b8" }}>
						Type{" "}
						<span style={{ color: "#e2e8f0", textTransform: "capitalize" }}>
							{tooltip.type}
						</span>
					</div>
					<div style={{ color: "#94a3b8" }}>
						Evidence{" "}
						<span style={{ color: "#e2e8f0" }}>{tooltip.evidenceCount}</span>
					</div>
				</div>
			)}
		</div>
	);
}
