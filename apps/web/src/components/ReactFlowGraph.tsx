import {
	Background,
	Controls,
	type Edge,
	MiniMap,
	type NodeMouseHandler,
	ReactFlow,
	type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
	GraphTooltip,
	AtlasNode,
	createFlowEdges,
	getLayoutedNodes,
	graphChrome,
	NODE_HEIGHT,
	NODE_WIDTH,
	type AtlasFlowNode,
	type TooltipState,
	wrapperStyle,
} from "./graph";

const nodeTypes = {
	atlasNode: AtlasNode,
};

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
	preLayoutedNodes?: AtlasFlowNode[];
}

export default function ReactFlowGraph({ nodes, edges, centerNodeId, onNodeClick, domainColors, preLayoutedNodes }: Props) {
	const flowRef = useRef<ReactFlowInstance<AtlasFlowNode, Edge> | null>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [selectedNodeId, setSelectedNodeId] = useState<string | null>(centerNodeId ?? null);
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);
	const [colorMode, setColorMode] = useState<"light" | "dark">(() => {
		if (typeof document === "undefined") return "light";
		return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
	});

	useEffect(() => {
		setSelectedNodeId(centerNodeId ?? null);
	}, [centerNodeId]);

	useEffect(() => {
		const root = document.documentElement;
		const syncTheme = () => setColorMode(root.getAttribute("data-theme") === "light" ? "light" : "dark");
		syncTheme();
		const observer = new MutationObserver(syncTheme);
		observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
		return () => observer.disconnect();
	}, []);

	const neighborMap = useMemo(() => {
		const map = new Map<string, Set<string>>();
		for (const node of nodes) map.set(node.node_id, new Set());
		for (const edge of edges) {
			map.get(edge.source_id)?.add(edge.target_id);
			map.get(edge.target_id)?.add(edge.source_id);
		}
		return map;
	}, [nodes, edges]);

	const flowNodes = useMemo<AtlasFlowNode[]>(() => {
		const selectedNeighbors = selectedNodeId ? (neighborMap.get(selectedNodeId) ?? new Set<string>()) : null;
		const baseNodes = preLayoutedNodes ?? getLayoutedNodes(nodes, edges, domainColors);
		return baseNodes.map((node) => {
			const isSelected = node.id === selectedNodeId;
			const isNeighbor = selectedNeighbors?.has(node.id) ?? false;
			const isDimmed = selectedNodeId !== null && !isSelected && !isNeighbor;
			return { ...node, selected: isSelected, data: { ...node.data, isSelected, isNeighbor, isDimmed } };
		});
	}, [domainColors, edges, neighborMap, nodes, preLayoutedNodes, selectedNodeId]);

	const flowEdges = useMemo(() => createFlowEdges(edges, selectedNodeId, colorMode), [colorMode, edges, selectedNodeId]);

	useEffect(() => {
		if (!flowRef.current || flowNodes.length === 0) return;
		window.requestAnimationFrame(() => {
			flowRef.current?.fitView({ padding: 0.16, duration: 450 });
			if (!centerNodeId) return;
			const node = flowNodes.find((entry) => entry.id === centerNodeId);
			if (!node) return;
			flowRef.current?.setCenter(node.position.x + NODE_WIDTH / 2, node.position.y + NODE_HEIGHT / 2, {
				zoom: Math.min(flowRef.current?.getZoom() ?? 1, 1),
				duration: 450,
			});
		});
	}, [centerNodeId, flowNodes]);

	const updateTooltip = useCallback((clientX: number, clientY: number, node: AtlasFlowNode) => {
		const bounds = wrapperRef.current?.getBoundingClientRect();
		if (!bounds) return;
		setTooltip({
			x: clientX - bounds.left,
			y: clientY - bounds.top - 18,
			label: node.data.label,
			type: node.data.nodeType,
			evidenceCount: node.data.evidenceCount,
		});
	}, []);

	const handleNodeClick: NodeMouseHandler<AtlasFlowNode> = useCallback((_, node) => {
		setSelectedNodeId(node.id);
		onNodeClick?.(node.id);
	}, [onNodeClick]);
const handleNodeMouseEnter: NodeMouseHandler<AtlasFlowNode> = useCallback((event, node) => {
		updateTooltip(event.clientX, event.clientY, node);
	}, [updateTooltip]);
	const handleNodeMouseMove: NodeMouseHandler<AtlasFlowNode> = useCallback((event, node) => {
		updateTooltip(event.clientX, event.clientY, node);
	}, [updateTooltip]);
	const clearSelection = useCallback(() => {
		setSelectedNodeId(null);
		setTooltip(null);
	}, []);

	return (
		<div ref={wrapperRef} style={{ position: "relative", width: "100%", height: "100%" }}>
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
						nodeColor={(node) => (node as AtlasFlowNode).data.color}
						maskColor="var(--graph-minimap-mask)"
						style={{ background: "var(--graph-minimap-bg)" }}
					/>
					<Controls showInteractive={false} position="top-right" />
					<Background color="var(--graph-grid-color)" gap={28} size={1.1} />
				</ReactFlow>
			</div>
			<GraphTooltip tooltip={tooltip} />
		</div>
	);
}
