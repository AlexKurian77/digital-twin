"use client";

import { Handle, Position } from "@xyflow/react";

export type NodeData = {
  label: string;
  value: number;
  enabled: boolean;
  type: "sector" | "intermediate" | "output";
  onChange?: (value: number) => void;
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

      {data.type === "sector" && (
        <div className="mt-2 w-full">
          <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
            <span>Activity</span>
            <span>{Math.round(data.value)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={data.value}
            className="nodrag w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
            onChange={(e) => {
              data.onChange?.(Number(e.target.value));
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Outgoing */}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}
