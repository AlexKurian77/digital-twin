"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  ControlButton,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ImpactPanel } from "./ImpactPanel";
import { API_BASE_URL } from '../config';
import { Sparkles, ArrowRight, Activity, Search, Loader2 } from "lucide-react";

import CausalNode from "./nodes/CausalNode";
import { initialNodes } from "../data/nodes";
import { initialEdges } from "../data/edges";
import { runSimulation } from "./simulation";
import { EmissionForecast } from "./EmissionForecast";
import { AQITrends } from "./AQITrends";
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

  // Callback to handle slider changes from custom nodes
  const handleNodeValueChange = (id: string, value: number) => {
    setNodes((nds) => {
      const updated = nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, value } };
        }
        return node;
      });
      return runSimulation(updated, edges);
    });
  };

  // Attach the handler to nodes on mount
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: (val: number) => handleNodeValueChange(node.id, val),
        },
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [impactMessage, setImpactMessage] = useState(
    "System activity and emissions propagate through connected sectors."
  );
  const [impact, setImpact] = useState<Impact | null>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [researchQuery, setResearchQuery] = useState(
    "Generate a policy based on the graph"
  );

  const applyPolicyFromAPI = async () => {
    setLoading(true);
    try {

      // Step 1: Generate policy from research query
      const graphContext = {
        nodes: nodes.map((n) => ({
          id: n.id,
          enabled: n.data.enabled,
          label: n.data.label
        })),
        edges: edges.map((e) => ({
          source: e.source,
          target: e.target,
          weight: e.data?.weight || 0.5,
        })),
      };

      const generateResponse = await fetch(
        `${API_BASE_URL}/api/generate-policy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            research_query: researchQuery,
            graph_context: graphContext
          }),
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
        `${API_BASE_URL}/api/apply-policy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ policy, graph_context: graphContext }),
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

  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <div className={`w-full min-h-screen ${isFullScreen ? 'relative z-[100]' : ''}`}>

      {/* Graph Container - scrollable, natural height */}
      <div
        className={`${isFullScreen
          ? 'fixed inset-0 z-60 w-screen h-screen bg-slate-900'
          : 'w-full h-[500px] border-b border-white/10'
          }`}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
        >
          <Background color="#94a3b8" gap={20} size={1} />
          <Controls
            className="!bg-slate-800/80 !border-slate-700 !backdrop-blur-md"
            style={{
              padding: '4px',
              borderRadius: '8px',
            } as React.CSSProperties}
          >
            <ControlButton
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
              className="!bg-slate-700/50 hover:!bg-slate-600 !text-slate-200 !border-none"
            >
              {isFullScreen ? "↙" : "↗"}
            </ControlButton>
          </Controls>
        </ReactFlow>

      </div>

      {/* Instructions */}
      <div className="bg-blue-900/20 border-y border-blue-500/10 p-3">
        <p className="text-xs text-blue-200/80 text-center flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3" />
          <strong>Tip:</strong> Click on nodes in the graph to disable/enable sectors.
        </p>
      </div>

      {/* Bottom Section - Control Panel & Results */}
      <div className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left: Policy Generator */}
          <div className="lg:col-span-1 glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Search className="w-24 h-24 text-blue-400" />
            </div>

            <div className="flex items-center mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-400/20">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Policy Cloud
              </h3>
            </div>

            <div className="space-y-4 relative z-10">
              <div>
                <label className="text-xs font-semibold block mb-2 text-blue-200/60 uppercase tracking-widest">
                  Research Query
                </label>
                <textarea
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  placeholder="e.g. How can we reduce transport emissions by 20%?"
                  className="w-full text-sm rounded-xl p-4 min-h-[120px] resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium leading-relaxed"
                />
              </div>
              <button
                onClick={applyPolicyFromAPI}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn ${loading
                  ? "bg-slate-700 cursor-not-allowed opacity-60"
                  : "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5"
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Analyzing System...
                  </>
                ) : (
                  <>
                    Generate Policy
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
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
              <div className="glass-panel rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700/50">
                  <Activity className="w-8 h-8 text-slate-500" />
                </div>
                <h4 className="font-bold text-white mb-2 text-lg">
                  System Status
                </h4>
                <p className="text-slate-400/80 leading-relaxed max-w-md mx-auto">
                  {impactMessage}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 mt-4 space-y-6">
            <EmissionForecast />
            <AQITrends />
          </div>
        </div>
      </div>
    </div>
  );
}


