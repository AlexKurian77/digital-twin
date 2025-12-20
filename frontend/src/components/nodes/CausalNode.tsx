"use client";

import { Handle, Position } from "@xyflow/react";

export type NodeData = {
  label: string;
  value: number;
  enabled: boolean;
  type: "sector" | "intermediate" | "output";
};

export default function CausalNode({ data }: { data: NodeData }) {
  return (
    <div
      className={`relative px-4 py-2 rounded-md border shadow text-sm
    ${!data.enabled ? "opacity-30 grayscale" : ""}
    ${data.type === "output" ? "border-red-500" : "border-slate-400"}
  `}
      style={{ minWidth: data.type === "intermediate" ? 180 : 120 }}
    >
      {/* Incoming */}
      <Handle type="target" position={Position.Top} />

      <div className="font-medium">{data.label}</div>
      <div className="text-xs text-muted-foreground">
        Value: {data.value.toFixed(1)}
      </div>

      {/* Outgoing */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
