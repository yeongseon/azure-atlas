export interface TooltipState {
	x: number;
	y: number;
	label: string;
	type: string;
	evidenceCount: number;
}

interface Props {
	tooltip: TooltipState | null;
}

export function GraphTooltip({ tooltip }: Props) {
	if (!tooltip) {
		return null;
	}

	return (
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
				Type <span style={{ color: "var(--tooltip-text)", textTransform: "capitalize" }}>{tooltip.type}</span>
			</div>
			<div style={{ color: "var(--tooltip-secondary)" }}>
				Evidence <span style={{ color: "var(--tooltip-text)" }}>{tooltip.evidenceCount}</span>
			</div>
		</div>
	);
}
