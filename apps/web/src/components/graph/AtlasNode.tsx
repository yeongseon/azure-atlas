import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import { NODE_HEIGHT, NODE_WIDTH } from "./graphTheme";

export interface AtlasNodeData extends Record<string, unknown> {
	label: string;
	nodeType: string;
	evidenceCount: number;
	color: string;
	isDimmed: boolean;
	isNeighbor: boolean;
	isSelected: boolean;
}

export type AtlasFlowNode = Node<AtlasNodeData, "atlasNode">;

export function AtlasNode({ data, selected }: NodeProps<AtlasFlowNode>) {
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
					background:
						"linear-gradient(160deg, var(--node-bg-gradient-start) 0%, var(--node-bg-gradient-end) 100%)",
					boxShadow: selected
						? `0 0 0 1px rgba(255,255,255,0.08), 0 0 30px ${data.color}55, 0 16px 34px var(--node-shadow-selected)`
						: data.isNeighbor
							? "0 10px 28px var(--node-shadow-neighbor)"
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
