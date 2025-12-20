// src/components/policyMapper.ts

export function mapResearchToPolicy(chunks: string[]) {
  const text = chunks.join(" ").toLowerCase();

  const actions = {
    disable_nodes: [] as string[],
    reduce_edges: [] as {
      source: string;
      target: string;
      new_weight: number;
    }[],
    reason: "",
  };

  if (text.includes("vehicle") || text.includes("transport")) {
    actions.disable_nodes.push("transport");
    actions.reduce_edges.push({
      source: "transport",
      target: "vehicle-emissions",
      new_weight: 0.3,
    });
    actions.reason =
      "Research emphasizes vehicle emission control and transport restriction as the most effective AQI policy.";
  }

  if (text.includes("coal") || text.includes("power generation")) {
    actions.reduce_edges.push({
      source: "generation",
      target: "power-generation",
      new_weight: 0.4,
    });
    actions.reason += " Coal and power generation controls further reduce particulate pollution.";
  }

  return actions;
}
