import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { useEffect, useRef, useState } from "react";

let fcoseRegistered = false;
if (!fcoseRegistered) {
	cytoscape.use(fcose);
	fcoseRegistered = true;
}

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

interface TooltipState {
	visible: boolean;
	x: number;
	y: number;
	label: string;
	type: string;
	evidenceCount: number;
}

export default function CytoscapeGraph({
	nodes,
	edges,
	centerNodeId,
	onNodeClick,
}: Props) {
	const containerRef = useRef<HTMLDivElement>(null);
	const cyRef = useRef<cytoscape.Core | null>(null);
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const container = containerRef.current;

		const elements: cytoscape.ElementDefinition[] = [
			...nodes.map((n) => ({
				data: {
					id: n.node_id,
					label: n.label,
					node_type: n.node_type,
					evidence_count: n.evidence_count ?? 0,
					isCenter: n.node_id === centerNodeId,
				},
			})),
			...edges.map((e) => ({
				data: {
					id: e.edge_id,
					source: e.source_id,
					target: e.target_id,
					relation_type: e.relation_type,
					weight: e.weight ?? 1,
				},
			})),
		];

		const cy = cytoscape({
			container: containerRef.current,
			elements,
			style: [
				{
					selector: "node",
					style: {
						label: "data(label)",
						"background-color": (ele: cytoscape.NodeSingular) =>
							NODE_COLORS[ele.data("node_type")] ?? NODE_COLORS.default,
						shape: (ele: cytoscape.NodeSingular) => {
							const t = ele.data("node_type");
							if (t === "service") return "roundrectangle";
							if (t === "concept") return "ellipse";
							if (t === "feature") return "diamond";
							if (t === "pattern") return "hexagon";
							return "ellipse";
						},
						color: "#e2e8f0",
						"font-size": 11,
						"text-valign": "bottom",
						"text-halign": "center",
						"text-margin-y": 6,
						"text-outline-color": "#0f172a",
						"text-outline-width": 2,
						width: 44,
						height: 44,
						"transition-property":
							"width, height, background-color, border-width, opacity",
						"transition-duration": 200,
					},
				},
				{
					selector: "node.selected",
					style: {
						width: 60,
						height: 60,
						"border-width": 4,
						"border-color": "#ffffff",
						"border-opacity": 0.8,
						"underlay-color": "#ffffff",
						"underlay-padding": 8,
						"underlay-opacity": 0.3,
					},
				},
				{
					selector: "node.dimmed",
					style: {
						opacity: 0.2,
					},
				},
				{
					selector: "node.neighbor",
					style: {
						opacity: 1,
					},
				},
				{
					selector: "edge",
					style: {
						width: 1.5,
						"line-color": "#334155",
						"target-arrow-color": "#334155",
						"target-arrow-shape": "triangle",
						"curve-style": "bezier",
						label: "data(relation_type)",
						"font-size": 9,
						color: "#cbd5e1",
						"text-rotation": "none",
						"text-opacity": 0,
						"text-background-opacity": 1,
						"text-background-color": "#1e293b",
						"text-background-padding": "2px",
						"text-background-shape": "roundrectangle",
						"transition-property":
							"opacity, line-color, target-arrow-color, text-opacity",
						"transition-duration": 200,
					},
				},
				{
					selector: "edge.dimmed",
					style: {
						opacity: 0.2,
					},
				},
				{
					selector: "edge.hover",
					style: {
						"text-opacity": 1,
						"line-color": "#94a3b8",
						"target-arrow-color": "#94a3b8",
					},
				},
				{
					selector: "edge.selected",
					style: {
						"text-opacity": 1,
						"line-color": "#60a5fa",
						"target-arrow-color": "#60a5fa",
						color: "#93c5fd",
					},
				},
			],
			layout: {
				name: "fcose",
				animate: true,
				animationDuration: 600,
				randomize: false,
				quality: "default",
				nodeSeparation: 150,
				idealEdgeLength: 200,
				fit: true,
				padding: 40,
			} as cytoscape.LayoutOptions,
		});

		cy.one("layoutstop", () => {
			cy.fit(undefined, 40);
		});

		// Events
		cy.on("mouseover", "node", (evt) => {
			const node = evt.target;
			const pos = node.renderedPosition();

			setTooltip({
				visible: true,
				x: pos.x,
				y: pos.y - 30, // Show above node
				label: node.data("label"),
				type: node.data("node_type"),
				evidenceCount: node.data("evidence_count"),
			});

			// Highlight connected edges slightly on node hover
			node.connectedEdges().addClass("hover");
		});

		cy.on("mouseout", "node", (evt) => {
			setTooltip(null);
			const node = evt.target;
			node.connectedEdges().removeClass("hover");
		});

		cy.on("mouseover", "edge", (evt) => {
			evt.target.addClass("hover");
		});

		cy.on("mouseout", "edge", (evt) => {
			evt.target.removeClass("hover");
		});

		cy.on("viewport", () => {
			setTooltip(null);
		});

		cy.on("tap", "node", (evt) => {
			const node = evt.target;

			// Reset classes
			cy.elements().removeClass("selected neighbor dimmed hover");

			// Set new selection
			node.addClass("selected");
			const neighbors = node.neighborhood();
			neighbors.addClass("neighbor");

			// Highlight connected edges as selected
			node.connectedEdges().addClass("selected");

			// Dim all others
			cy.elements().difference(node).difference(neighbors).addClass("dimmed");

			const nodeId: string = node.id();
			onNodeClick?.(nodeId);
		});

		cy.on("tap", (evt) => {
			if (evt.target === cy) {
				cy.elements().removeClass("selected neighbor dimmed hover");
			}
		});

		const resizeObserver = new ResizeObserver(() => {
			cy.resize();
		});

		resizeObserver.observe(container);

		cyRef.current = cy;
		return () => {
			resizeObserver.disconnect();
			cy.destroy();
			cyRef.current = null;
			setTooltip(null);
		};
	}, [nodes, edges, centerNodeId, onNodeClick]);

	const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.3);
	const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.77);
	const handleFit = () => cyRef.current?.fit();
	const handleReset = () => {
		cyRef.current?.reset();
		cyRef.current?.elements().removeClass("selected neighbor dimmed hover");
	};

	return (
		<div style={{ position: "relative", width: "100%", height: "100%" }}>
			<div
				ref={containerRef}
				style={{ width: "100%", height: "100%", background: "#0f172a" }}
			/>

			<div
				style={{
					position: "absolute",
					top: 16,
					right: 16,
					display: "flex",
					flexDirection: "column",
					gap: 4,
					background: "rgba(15,23,42,0.85)",
					border: "1px solid #334155",
					borderRadius: 8,
					padding: 4,
					zIndex: 10,
					backdropFilter: "blur(4px)",
				}}
			>
				<button
					type="button"
					onClick={handleFit}
					style={{
						width: 28,
						height: 28,
						background: "transparent",
						border: "none",
						color: "#cbd5e1",
						cursor: "pointer",
						fontSize: 12,
					}}
					title="Fit Graph"
					aria-label="Fit graph to view"
				>
					[ ]
				</button>
				<button
					type="button"
					onClick={handleZoomIn}
					style={{
						width: 28,
						height: 28,
						background: "transparent",
						border: "none",
						color: "#cbd5e1",
						cursor: "pointer",
						fontSize: 18,
					}}
					title="Zoom In"
					aria-label="Zoom in"
				>
					+
				</button>
				<button
					type="button"
					onClick={handleZoomOut}
					style={{
						width: 28,
						height: 28,
						background: "transparent",
						border: "none",
						color: "#cbd5e1",
						cursor: "pointer",
						fontSize: 22,
						lineHeight: 1,
					}}
					title="Zoom Out"
					aria-label="Zoom out"
				>
					-
				</button>
				<button
					type="button"
					onClick={handleReset}
					style={{
						width: 28,
						height: 28,
						background: "transparent",
						border: "none",
						color: "#cbd5e1",
						cursor: "pointer",
						fontSize: 12,
					}}
					title="Reset"
					aria-label="Reset graph view"
				>
					R
				</button>
			</div>

			{tooltip?.visible && (
				<div
					style={{
						position: "absolute",
						left: tooltip.x,
						top: tooltip.y,
						transform: "translate(-50%, -100%)",
						background: "rgba(15, 23, 42, 0.95)",
						border: "1px solid #334155",
						borderRadius: 6,
						padding: "8px 12px",
						color: "#f8fafc",
						fontSize: 12,
						pointerEvents: "none",
						zIndex: 20,
						whiteSpace: "nowrap",
						boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
						display: "flex",
						flexDirection: "column",
						gap: 4,
					}}
				>
					<div style={{ fontWeight: 600, fontSize: 13 }}>{tooltip.label}</div>
					<div style={{ color: "#94a3b8", fontSize: 11 }}>
						Type:{" "}
						<span style={{ color: "#e2e8f0", textTransform: "capitalize" }}>
							{tooltip.type}
						</span>
					</div>
					<div style={{ color: "#94a3b8", fontSize: 11 }}>
						Evidence:{" "}
						<span style={{ color: "#e2e8f0" }}>{tooltip.evidenceCount}</span>
					</div>
				</div>
			)}
		</div>
	);
}
