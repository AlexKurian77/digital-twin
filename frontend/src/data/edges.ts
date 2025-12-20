import type { Edge } from "@xyflow/react"

export const initialEdges: Edge[] = [
  // Industries → Transport / Energy
  { id: "i-mg", source: "industries", target: "moves-goods", data: { weight: 0.6 }, type: "smoothstep" },
  { id: "mg-t", source: "moves-goods", target: "transport", data: { weight: 0.6 }, type: "smoothstep" },
  { id: "i-up", source: "industries", target: "uses-power", data: { weight: 0.5 }, type: "smoothstep" },
  { id: "i-pi", source: "industries", target: "powers-industry", data: { weight: 0.4 }, type: "smoothstep" },
  { id: "pi-e", source: "powers-industry", target: "energy", data: { weight: 0.6 }, type: "smoothstep" },

  // Transport effects
  { id: "t-ft", source: "transport", target: "fuels-transport", data: { weight: 0.5 }, type: "smoothstep" },
  { id: "t-fr", source: "transport", target: "fuel-refining", data: { weight: 0.5 }, type: "smoothstep" },
  { id: "ft-e", source: "fuels-transport", target: "energy", data: { weight: 0.6 }, type: "smoothstep" },
  { id: "fr-e", source: "fuel-refining", target: "energy", data: { weight: 0.6 }, type: "smoothstep" },
  { id: "t-us", source: "transport", target: "urban-sprawl", data: { weight: 0.4 }, type: "smoothstep" },
  { id: "t-ve", source: "transport", target: "vehicle-emissions", data: { weight: 0.7 }, type: "smoothstep" },

  // Infrastructure
  { id: "t-dc", source: "transport", target: "drives-construction", data: { weight: 0.4 }, type: "smoothstep" },
  { id: "t-ei", source: "transport", target: "enables-industry", data: { weight: 0.4 }, type: "smoothstep" },
  { id: "t-nr", source: "transport", target: "needs-roads", data: { weight: 0.4 }, type: "smoothstep" },
  { id: "dc-inf", source: "drives-construction", target: "infrastructure", data: { weight: 0.6 }, type: "smoothstep" },
  { id: "ei-inf", source: "enables-industry", target: "infrastructure", data: { weight: 0.6 }, type: "smoothstep" },
  { id: "nr-inf", source: "needs-roads", target: "infrastructure", data: { weight: 0.6 }, type: "smoothstep" },
  { id: "us-inf", source: "urban-sprawl", target: "infrastructure", data: { weight: 0.6 }, type: "smoothstep" },

  // Infrastructure → emissions
  { id: "inf-eu", source: "infrastructure", target: "embodied-use", data: { weight: 0.5 }, type: "smoothstep" },

  // Energy
  { id: "us-ed", source: "urban-sprawl", target: "energy-demand", data: { weight: 0.5 }, type: "smoothstep" },
  { id: "ed-g", source: "energy-demand", target: "generation", data: { weight: 0.6 }, type: "smoothstep" },
  { id: "e-g", source: "energy", target: "generation", data: { weight: 0.7 }, type: "smoothstep" },
  { id: "g-pg", source: "generation", target: "power-generation", data: { weight: 0.6 }, type: "smoothstep" },

  // Emissions aggregation
  { id: "eu-co2", source: "embodied-use", target: "co2", data: { weight: 0.6 }, type: "smoothstep" },
  { id: "pg-co2", source: "power-generation", target: "co2", data: { weight: 0.7 }, type: "smoothstep" },
  { id: "ve-co2", source: "vehicle-emissions", target: "co2", data: { weight: 0.7 }, type: "smoothstep" },
  { id: "ip-co2", source: "industrial-pollutants", target: "co2", data: { weight: 0.8 }, type: "smoothstep" },
  { id: "di-co2", source: "direct-indirect", target: "co2", data: { weight: 0.8 }, type: "smoothstep" },
  { id: "ft-co2", source: "fuel-travel", target: "co2", data: { weight: 0.7 }, type: "smoothstep" },

  // AQI
  { id: "co2-c", source: "co2", target: "contributes", data: { weight: 0.8 }, type: "smoothstep" },
  { id: "c-aqi", source: "contributes", target: "aqi", data: { weight: 0.8 }, type: "smoothstep" },
  { id: "aqi-pa", source: "aqi", target: "poor-aqi", data: { weight: 0.8 }, type: "smoothstep" },
]
