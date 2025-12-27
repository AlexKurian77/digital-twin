"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ImpactPanel } from "./ImpactPanel";

import CausalNode from "./nodes/CausalNode";
import { initialNodes } from "../data/nodes";
import { initialEdges } from "../data/edges";
import { runSimulation } from "./simulation";
import { LiveAQI } from "./LiveAQI";
import type { NodeTypes } from "@xyflow/react";

const nodeTypes: NodeTypes = {
  causal: CausalNode as NodeTypes['causal'],
};

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

export default function CausalGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [impactMessage, setImpactMessage] = useState(
    "System activity and emissions propagate through connected sectors."
  );
  const [impact, setImpact] = useState<Impact | null>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [researchQuery, setResearchQuery] = useState(
    "How did Beijing reduce transport emissions?"
  );

  const applyPolicyFromAPI = async () => {
    setLoading(true);
    try {
      // Step 1: Generate policy from research query
      const generateResponse = await fetch(
        "http://localhost:5000/api/generate-policy",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ research_query: researchQuery }),
        }
      );

      if (!generateResponse.ok) {
        throw new Error(
          `API error: ${generateResponse.status} ${generateResponse.statusText}`
        );
      }

      const generateData = await generateResponse.json();
      const policy = generateData.policy;

      // Step 2: Apply policy to graph
      const applyResponse = await fetch(
        "http://localhost:5000/api/apply-policy",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ policy }),
        }
      );

      if (!applyResponse.ok) {
        throw new Error(
          `API error: ${applyResponse.status} ${applyResponse.statusText}`
        );
      }

      const applyData = await applyResponse.json();
      const snapshot = applyData.snapshot;

      // Step 3: Update frontend visualization
      const postPolicyGraph = snapshot.post_policy_graph;
      setNodes((nds) =>
        nds.map((n) => {
          const postNode = postPolicyGraph.nodes.find(
            (pn: { id: string }) => pn.id === n.id
          );
          return postNode ? { ...n, data: { ...n.data, ...postNode.data } } : n;
        })
      );

      setEdges((eds) =>
        eds.map((e) => {
          const postEdge = postPolicyGraph.edges.find(
            (pe: { source: string; target: string }) => pe.source === e.source && pe.target === e.target
          );
          return postEdge ? { ...e, data: postEdge.data } : e;
        })
      );

      // Step 4: Display impact
      setPolicy(policy);
      setImpact(snapshot.impact);
      setImpactMessage(
        `Policy: ${policy.name}. CO₂ change: ${snapshot.impact.co2.change_pct.toFixed(1)}%. ` +
          `AQI change: ${snapshot.impact.aqi.change_pct.toFixed(1)}%.`
      );
    } catch (error) {
      console.error("Error applying policy:", error);
      setImpactMessage(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const onNodeClick = (_event: unknown, node: { id: string }) => {
    setNodes((nds) => {
      const updated = nds.map((n) =>
        n.id === node.id
          ? {
              ...n,
              data: {
                ...n.data,
                enabled: !n.data.enabled,
              },
            }
          : n
      );

      const clicked = nds.find((n) => n.id === node.id);

      setImpactMessage(
        clicked?.data.enabled
          ? `${clicked.data.label} disabled. Downstream emissions, energy demand, and dependent sectors reduce due to loss of causal input.`
          : `${clicked?.data.label} re-enabled. System activity resumes and emissions propagate through connected sectors.`
      );

      return runSimulation(updated, edges);
    });
  };

  useEffect(() => {
    setNodes((nds) => runSimulation(nds, edges));
  }, [edges, setNodes]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Reset Button - Top Right */}
      <div className="flex justify-end px-6 py-4">
        <button
          onClick={() => {
            setNodes(initialNodes);
            setEdges(initialEdges);
            setImpact(null);
            setPolicy(null);
            setImpactMessage(
              "System reset to baseline. Graph ready for new policies."
            );
          }}
          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          🔄 Reset
        </button>
      </div>

      {/* Graph Container - scrollable, natural height */}
      <div className="w-full h-96 bg-slate-900 border-b border-slate-700">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* Bottom Section - Control Panel & Results */}
      <div className="bg-slate-900 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Controls & Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left: Policy Generator */}
            <div className="lg:col-span-1 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">🔬</span>
                <h3 className="text-lg font-bold text-white">
                  Policy Generator
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold block mb-2 text-slate-300 uppercase tracking-wide">
                    Research Query
                  </label>
                  <textarea
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    placeholder="What policy question do you want to explore?"
                    className="w-full text-sm border border-slate-600 rounded-lg p-3 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows={3}
                  />
                </div>
                <button
                  onClick={applyPolicyFromAPI}
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-lg font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-slate-600 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate & Apply
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Results (2 columns) */}
            <div className="lg:col-span-2">
              {impact ? (
                <ImpactPanel impact={impact} policy={policy} />
              ) : (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5 shadow-lg">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">ℹ️</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-2 uppercase text-sm tracking-wide">
                        System Status
                      </h4>
                      <p className="text-slate-300 leading-relaxed">
                        {impactMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* <LiveAQI /> */}
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 text-center">
              💡 <strong>Tip:</strong> Click on nodes in the graph to
              disable/enable sectors. Enter a research query and click Generate
              & Apply to test policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
