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
      className={`relative rounded-md transition-all duration-200
    ${!data.enabled ? "opacity-50 grayscale" : ""}
    ${data.type === "intermediate"
          ? "px-3 py-1 bg-slate-800/80 border border-slate-700/50 text-slate-300 text-xs shadow-sm backdrop-blur-sm"
          : "px-5 py-3 bg-slate-100 text-slate-900 border-2 border-slate-300 shadow-xl font-bold min-w-[140px] text-center" // Real Block
        }
    ${data.type === "output" ? "border-slate-300 ring-2 ring-slate-100/20" : ""}
  `}
    >
      {/* Incoming */}
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />

      <div className={`${data.type === "intermediate" ? "font-normal" : "text-lg tracking-tight"}`}>
        {data.label}
      </div>

      {data.type !== "intermediate" && (
        <div className="text-xs text-slate-500 font-normal mt-1 border-t border-slate-200 pt-1">
          Activity: {data.value.toFixed(0)}%
        </div>
      )}

      {/* Outgoing */}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}
