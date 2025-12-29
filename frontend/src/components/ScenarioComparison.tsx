"use client";

import { useEffect, useState } from "react";
import { ImpactPanel } from "./ImpactPanel";
import { BarChart2, Trophy, Loader2, Play, LineChart } from "lucide-react";
import { API_BASE_URL } from '../config';

interface Scenario {
  id: string;
  display_name: string;
  description: string;
  policy_queries: string[];
  tags: string[];
  expected_co2_reduction: string;
  expected_aqi_improvement: string;
  implementation_difficulty: string;
  timeline_years: number;
}

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

interface ComparisonResult {
  name: string;
  impact: Impact;
}

export function ScenarioComparison() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [ranking, setRanking] = useState<{
    best_co2_reduction: string;
    best_aqi_improvement: string;
  } | null>(null);

  useEffect(() => {
    // Load scenario presets
    fetch("/scenarios.json")
      .then((r) => r.json())
      .then((data) => setScenarios(data.presets))
      .catch((e) => console.error("Error loading scenarios:", e));
  }, []);

  const handleCompare = async () => {
    if (selectedScenarios.length === 0) {
      alert("Please select at least one scenario");
      return;
    }

    setLoading(true);
    try {
      // Build scenario request
      const scenariosToCompare = selectedScenarios
        .map((scenarioId) => {
          const scenario = scenarios.find((s) => s.id === scenarioId);
          if (!scenario) return null;

          return {
            name: scenario.display_name,
            policy_queries: scenario.policy_queries,
          };
        })
        .filter((s): s is { name: string; policy_queries: string[] } => s !== null);

      // For each scenario, generate policies and combine them
      const comparisonResults: ComparisonResult[] = [];

      for (const scenario of scenariosToCompare) {
        try {
          // Generate policies for each query in the scenario
          const policies = [];
          for (const query of scenario.policy_queries) {
            const genResponse = await fetch(
              `${API_BASE_URL}/api/generate-policy`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ research_query: query }),
              }
            );

            if (genResponse.ok) {
              const genData = await genResponse.json();
              policies.push(genData.policy);
            }
          }

          // Apply combined policies
          // For MVP, we'll apply the first policy (can be extended to combine)
          if (policies.length > 0) {
            const applyResponse = await fetch(
              `${API_BASE_URL}/api/apply-policy`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ policy: policies[0] }),
              }
            );

            if (applyResponse.ok) {
              const applyData = await applyResponse.json();
              comparisonResults.push({
                name: scenario.name,
                impact: applyData.snapshot.impact,
              });
            }
          }
        } catch (error) {
          console.error(`Error processing scenario:`, error);
        }
      }

      setComparison(comparisonResults);

      // Calculate ranking
      if (comparisonResults.length > 0) {
        const bestCO2 = comparisonResults.reduce((prev, current) =>
          Math.abs(current.impact.co2.change_pct) >
            Math.abs(prev.impact.co2.change_pct)
            ? current
            : prev
        );

        const bestAQI = comparisonResults.reduce((prev, current) =>
          Math.abs(current.impact.aqi.change_pct) >
            Math.abs(prev.impact.aqi.change_pct)
            ? current
            : prev
        );

        setRanking({
          best_co2_reduction: bestCO2.name,
          best_aqi_improvement: bestAQI.name,
        });
      }
    } catch (error) {
      console.error("Error comparing scenarios:", error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BarChart2 className="w-10 h-10 text-blue-600" /> Scenario Comparison
          </h1>
          <p className="text-gray-600">
            Compare different policy approaches side-by-side to understand
            their system-wide impact.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() =>
                  setSelectedScenarios((prev) =>
                    prev.includes(scenario.id)
                      ? prev.filter((id) => id !== scenario.id)
                      : [...prev, scenario.id]
                  )
                }
                className={`p-4 rounded-lg border-2 transition-all text-left ${selectedScenarios.includes(scenario.id)
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
              >
                <div className="text-lg font-bold mb-1">
                  {scenario.display_name}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {scenario.description}
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    <strong>CO₂:</strong> {scenario.expected_co2_reduction}
                  </div>
                  <div>
                    <strong>AQI:</strong> {scenario.expected_aqi_improvement}
                  </div>
                  <div>
                    <strong>Difficulty:</strong>{" "}
                    {scenario.implementation_difficulty}
                  </div>
                  <div>
                    <strong>Timeline:</strong> {scenario.timeline_years} years
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleCompare}
            disabled={loading || selectedScenarios.length === 0}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${loading || selectedScenarios.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg"
              }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Comparing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5" /> Compare Selected Scenarios
              </div>
            )}
          </button>
        </div>

        {/* Comparison Results */}
        {comparison && comparison.length > 0 && (
          <div className="space-y-8">
            {/* Ranking Summary */}
            {ranking && (
              <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" /> Rankings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded">
                    <div className="text-sm text-gray-600 mb-1">
                      Best CO₂ Reduction
                    </div>
                    <div className="font-bold text-lg text-blue-700">
                      {ranking.best_co2_reduction}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded">
                    <div className="text-sm text-gray-600 mb-1">
                      Best AQI Improvement
                    </div>
                    <div className="font-bold text-lg text-emerald-700">
                      {ranking.best_aqi_improvement}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Scenario Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {comparison.map((result, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-blue-500"
                >
                  <h3 className="text-lg font-bold mb-4">{result.name}</h3>
                  <ImpactPanel impact={result.impact} />
                </div>
              ))}
            </div>

            {/* Detailed Comparison Table */}
            <div className="bg-white rounded-lg p-6 shadow-lg overflow-x-auto">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <LineChart className="w-6 h-6 text-blue-500" /> Detailed Comparison
              </h3>
              <table className="w-full text-sm">
                <thead className="border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left font-bold p-3">Scenario</th>
                    <th className="text-center font-bold p-3">CO₂ Change</th>
                    <th className="text-center font-bold p-3">AQI Change</th>
                    <th className="text-center font-bold p-3">
                      Most Affected Sector
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((result, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-3 font-semibold">{result.name}</td>
                      <td
                        className={`text-center p-3 font-bold ${result.impact.co2.change_pct < 0
                          ? "text-green-600"
                          : "text-red-600"
                          }`}
                      >
                        {result.impact.co2.change_pct > 0 ? "+" : ""}
                        {result.impact.co2.change_pct.toFixed(1)}%
                      </td>
                      <td
                        className={`text-center p-3 font-bold ${result.impact.aqi.change_pct < 0
                          ? "text-green-600"
                          : "text-red-600"
                          }`}
                      >
                        {result.impact.aqi.change_pct > 0 ? "+" : ""}
                        {result.impact.aqi.change_pct.toFixed(1)}%
                      </td>
                      <td className="text-center p-3 text-gray-600">
                        {result.impact.cascade_analysis.most_affected_nodes[0]
                          ? result.impact.cascade_analysis.most_affected_nodes[0][0]
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!comparison && (
          <div className="bg-white rounded-lg p-12 shadow-lg text-center text-gray-500">
            <p className="text-lg">
              Select scenarios and click "Compare" to see results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
