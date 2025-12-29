import React from "react";
import { ClipboardList, Target, BarChart2 } from "lucide-react";

interface Impact {
  co2: {
    baseline: number;
    post_policy: number;
    change_pct: number;
    change_absolute: number;
  };
  aqi: {
    baseline: number;
    post_policy: number;
    change_pct: number;
    change_absolute: number;
  };
  cascade_analysis: {
    most_affected_nodes: [string, number][];
    summary: {
      nodes_with_reduction: number;
      nodes_with_increase: number;
      avg_change_pct: number;
    };
  };
}

interface ImpactPanelProps {
  impact: Impact | null;
  policy?: {
    name: string;
    description: string;
    mutations: Array<{
      type: string;
      reason: string;
    }>;
  } | null;
}

export function ImpactPanel({ impact, policy }: ImpactPanelProps) {
  if (!impact) {
    return null;
  }

  const co2Change = impact.co2.change_pct;
  const aiqChange = impact.aqi.change_pct;

  return (
    <div className="w-full p-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Policy Details */}
      {policy && (
        <div className="mb-4 p-4 bg-slate-900/50 border border-slate-600 rounded-lg">
          <div className="flex items-start gap-3 mb-2">
            <ClipboardList className="w-6 h-6 text-slate-400" />
            <div className="flex-1">
              <h4 className="font-bold text-white text-md">{policy.name}</h4>
              <p className="text-slate-300 text-sm mt-1">{policy.description}</p>
              {policy.mutations && policy.mutations.length > 0 && (
                <div className="mt-2 text-xs text-slate-400">
                  <span className="font-semibold">Actions:</span> {policy.mutations.length} mutation{policy.mutations.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center mb-4 gap-2">
        <Target className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Impact Analysis</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* CO₂ Impact */}
        <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/10 rounded-lg border border-blue-700/50 hover:border-blue-600 transition-all duration-200">
          <div className="flex justify-between items-start mb-3">
            <span className="font-semibold text-sm text-blue-300 uppercase tracking-wide">CO₂ Emissions</span>
            <span
              className={`text-lg font-bold tabular-nums ${co2Change < 0 ? "text-emerald-400" : "text-rose-400"
                }`}
            >
              {co2Change > 0 ? "+" : ""}
              {co2Change.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono mb-3">
            {impact.co2.baseline.toFixed(0)} → {impact.co2.post_policy.toFixed(0)}
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
              style={{ width: Math.min(100, Math.max(20, (impact.co2.post_policy / Math.max(impact.co2.baseline, impact.co2.post_policy)) * 100)) + '%' }}
            ></div>
          </div>
        </div>

        {/* AQI Impact */}
        <div className="p-4 bg-gradient-to-br from-orange-900/30 to-orange-800/10 rounded-lg border border-orange-700/50 hover:border-orange-600 transition-all duration-200">
          <div className="flex justify-between items-start mb-3">
            <span className="font-semibold text-sm text-orange-300 uppercase tracking-wide">Air Quality Index</span>
            <span
              className={`text-lg font-bold tabular-nums ${aiqChange < 0 ? "text-emerald-400" : "text-rose-400"
                }`}
            >
              {aiqChange > 0 ? "+" : ""}
              {aiqChange.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono mb-3">
            {impact.aqi.baseline.toFixed(0)} → {impact.aqi.post_policy.toFixed(0)}
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
              style={{ width: Math.min(100, Math.max(20, (impact.aqi.post_policy / Math.max(impact.aqi.baseline, impact.aqi.post_policy)) * 100)) + '%' }}
            ></div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/10 rounded-lg border border-purple-700/50 hover:border-purple-600 transition-all duration-200">
          <div className="text-sm font-semibold mb-3 text-purple-300 uppercase tracking-wide">Cascade Effects</div>
          <div className="text-xs text-slate-300 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Improved:</span>
              <span className="text-emerald-400 font-bold text-sm">
                {impact.cascade_analysis.summary.nodes_with_reduction}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Affected:</span>
              <span className="text-rose-400 font-bold text-sm">
                {impact.cascade_analysis.summary.nodes_with_increase}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-700">
              <span className="text-slate-400">Avg Change:</span>
              <span className={`font-bold text-sm tabular-nums ${impact.cascade_analysis.summary.avg_change_pct < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {impact.cascade_analysis.summary.avg_change_pct > 0 ? '+' : ''}
                {impact.cascade_analysis.summary.avg_change_pct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Most Affected Sectors */}
      {impact.cascade_analysis.most_affected_nodes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" /> Most Affected Sectors
          </h4>
          <div className="flex flex-wrap gap-2">
            {impact.cascade_analysis.most_affected_nodes.slice(0, 10).map(
              ([nodeId, change]) => (
                <div
                  key={nodeId}
                  className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all duration-200 ${change < 0
                      ? "bg-emerald-900/30 border-emerald-700/50 text-emerald-300"
                      : "bg-rose-900/30 border-rose-700/50 text-rose-300"
                    }`}
                >
                  <div className="font-semibold">{nodeId}</div>
                  <div className="text-xs opacity-90">
                    {change > 0 ? "+" : ""}
                    {change.toFixed(1)}%
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ProgressBar component not currently used
/*
interface ProgressBarProps {
  from: number;
  to: number;
  label?: string;
}

function ProgressBar({ from, to, label }: ProgressBarProps) {
  const maxVal = Math.max(from, to) * 1.1;
  const fromPercent = (from / maxVal) * 100;
  const toPercent = (to / maxVal) * 100;

  return (
    <div className="space-y-1">
      {label && <div className="text-xs text-gray-500">{label}</div>}
      <div className="flex gap-2 items-center">
        <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-blue-400 transition-all duration-300"
            style={{ width: `${fromPercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 w-6 text-right">
          {from.toFixed(0)}
        </span>
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex-1 h-4 bg-gray-200 rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              to < from ? "bg-green-400" : "bg-red-400"
            }`}
            style={{ width: `${toPercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 w-6 text-right">
          {to.toFixed(0)}
        </span>
      </div>
    </div>
  );
}
*/
