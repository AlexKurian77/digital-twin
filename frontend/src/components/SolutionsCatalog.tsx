"use client";

import { useState } from "react";
import { solutionCategories, type Solution, type SolutionCategory } from "../data/solutionsData";

interface ImpactResult {
  co2: { baseline: number; post_policy: number; change_pct: number };
  aqi: { baseline: number; post_policy: number; change_pct: number };
}

function CategoryTabs({
  categories,
  selected,
  onSelect,
}: {
  categories: SolutionCategory[];
  selected: SolutionCategory;
  onSelect: (cat: SolutionCategory) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      {categories.map((cat) => {
        const isSelected = selected.id === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 border-2 ${
              isSelected
                ? "scale-105 shadow-xl text-white"
                : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border-slate-600 hover:border-slate-500"
            }`}
            style={{
              backgroundColor: isSelected ? cat.color : undefined,
              borderColor: isSelected ? cat.color : undefined,
            }}
          >
            <span className="text-xl">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function SolutionCard({
  solution,
  categoryColor,
  onApply,
  isApplying,
}: {
  solution: Solution;
  categoryColor: string;
  onApply: (solution: Solution) => void;
  isApplying: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-all duration-300 hover:shadow-xl group"
      style={{ borderLeftColor: categoryColor, borderLeftWidth: "4px" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{solution.icon}</span>
          <h3 className="text-lg font-bold text-white">{solution.name}</h3>
        </div>
        <button
          onClick={() => onApply(solution)}
          disabled={isApplying}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
            isApplying
              ? "bg-slate-600 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          }`}
        >
          {isApplying ? "⏳ Applying..." : "▶ Apply"}
        </button>
      </div>

      {/* Concept */}
      <p className="text-slate-300 text-sm mb-3">{solution.concept}</p>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-400 hover:text-blue-300 mb-3"
      >
        {expanded ? "▼ Hide details" : "▶ Show mechanism & barriers"}
      </button>

      {expanded && (
        <div className="space-y-3 mt-3 pt-3 border-t border-slate-700/50">
          <div>
            <span className="text-xs font-semibold text-green-400 uppercase">Mechanism</span>
            <p className="text-slate-400 text-sm mt-1">{solution.mechanism}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-orange-400 uppercase">Barrier</span>
            <p className="text-slate-400 text-sm mt-1">{solution.barrier}</p>
          </div>
        </div>
      )}

      {/* Expected Impact Preview */}
      <div className="flex gap-4 mt-4 pt-3 border-t border-slate-700/30">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-xs">CO₂</span>
          <span className="text-white font-semibold text-sm">
            -{solution.policy.estimated_impacts.co2_reduction_pct}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-xs">AQI</span>
          <span className="text-white font-semibold text-sm">
            -{solution.policy.estimated_impacts.aqi_improvement_pct}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">Confidence</span>
          <span className="text-slate-300 text-sm">
            {Math.round(solution.policy.estimated_impacts.confidence * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function ImpactModal({
  solution,
  impact,
  onClose,
}: {
  solution: Solution;
  impact: ImpactResult;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{solution.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{solution.name}</h3>
              <p className="text-sm text-slate-400">Policy Applied Successfully</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Impact Results */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">
              {impact.co2.change_pct.toFixed(1)}%
            </div>
            <div className="text-sm text-green-300 mt-1">CO₂ Change</div>
            <div className="text-xs text-slate-400 mt-2">
              {impact.co2.baseline.toFixed(0)} → {impact.co2.post_policy.toFixed(0)}
            </div>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">
              {impact.aqi.change_pct.toFixed(1)}%
            </div>
            <div className="text-sm text-cyan-300 mt-1">AQI Change</div>
            <div className="text-xs text-slate-400 mt-2">
              {impact.aqi.baseline.toFixed(0)} → {impact.aqi.post_policy.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Policy Details */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-semibold text-white mb-2">Policy Applied</h4>
          <p className="text-slate-300 text-sm">{solution.policy.description}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl font-semibold transition-all duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function SolutionsCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<SolutionCategory>(
    solutionCategories[0]
  );
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [showImpact, setShowImpact] = useState<{
    solution: Solution;
    impact: ImpactResult;
  } | null>(null);

  const applySolution = async (solution: Solution) => {
    setApplyingId(solution.id);
    try {
      // Create policy object matching backend format
      const policy = {
        policy_id: solution.id,
        name: solution.policy.name,
        description: solution.policy.description,
        mutations: solution.policy.mutations.map((m) => ({
          ...m,
          reversible: true,
        })),
        estimated_impacts: solution.policy.estimated_impacts,
        trade_offs: [],
        source_research: {
          paper_ids: [],
          key_quotes: [solution.mechanism],
          confidence: solution.policy.estimated_impacts.confidence,
        },
      };

      // Call backend apply-policy endpoint
      const response = await fetch("http://localhost:5000/api/apply-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const impact = data.snapshot.impact;

      setShowImpact({ solution, impact });
    } catch (error) {
      console.error("Error applying solution:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            🔬 Innovative Solutions Catalog
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore cutting-edge technologies and approaches for urban air quality improvement. 
            Click "Apply" to simulate each solution's impact on the city.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Category Tabs */}
        <CategoryTabs
          categories={solutionCategories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Category Description */}
        <div
          className="bg-gradient-to-r rounded-xl p-4 mb-8 border"
          style={{
            backgroundColor: `${selectedCategory.color}15`,
            borderColor: `${selectedCategory.color}40`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCategory.icon}</span>
            <div>
              <h3 className="font-bold text-white">{selectedCategory.name}</h3>
              <p className="text-slate-400 text-sm">{selectedCategory.description}</p>
            </div>
          </div>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedCategory.solutions.map((solution) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              categoryColor={selectedCategory.color}
              onApply={applySolution}
              isApplying={applyingId === solution.id}
            />
          ))}
        </div>
      </div>

      {/* Impact Modal */}
      {showImpact && (
        <ImpactModal
          solution={showImpact.solution}
          impact={showImpact.impact}
          onClose={() => setShowImpact(null)}
        />
      )}
    </div>
  );
}
