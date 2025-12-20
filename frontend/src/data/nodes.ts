import type { Node } from "@xyflow/react"
import type { NodeData } from "../components/nodes/CausalNode"

export const initialNodes: Node<NodeData>[] = [
  // ===== CORE SECTORS =====
  { id: "industries", type: "causal", position: { x: 600, y: 0 },
    data: { label: "Industries", value: 100, enabled: true, type: "sector" } },

  { id: "transport", type: "causal", position: { x: 600, y: 150 },
    data: { label: "Transport", value: 35, enabled: true, type: "sector" } },

  { id: "energy", type: "causal", position: { x: 900, y: 320 },
    data: { label: "Energy", value: 0, enabled: true, type: "sector" } },

  { id: "infrastructure", type: "causal", position: { x: 200, y: 420 },
    data: { label: "Infrastructure", value: 0, enabled: true, type: "sector" } },

  // ===== INDUSTRY CAUSAL PATHS =====
  { id: "moves-goods", type: "causal", position: { x: 600, y: 80 },
    data: { label: "Moves goods → ↑ CO₂ & particulates", value: 0, enabled: true, type: "intermediate" } },

  { id: "uses-power", type: "causal", position: { x: 850, y: 120 },
    data: { label: "Uses power → ↑ CO₂ & pollutants", value: 0, enabled: true, type: "intermediate" } },

  { id: "powers-industry", type: "causal", position: { x: 1050, y: 120 },
    data: { label: "Powers industry → ↑ CO₂", value: 0, enabled: true, type: "intermediate" } },

  { id: "industrial-pollutants", type: "causal", position: { x: 1150, y: 320 },
    data: { label: "Industrial pollutants (PM, NOx, SO₂)", value: 0, enabled: true, type: "intermediate" } },

  // ===== TRANSPORT PATHS =====
  { id: "fuels-transport", type: "causal", position: { x: 750, y: 240 },
    data: { label: "Fuels transport → ↑ CO₂", value: 0, enabled: true, type: "intermediate" } },

  { id: "fuel-refining", type: "causal", position: { x: 950, y: 240 },
    data: { label: "Fuel refining → ↑ CO₂", value: 0, enabled: true, type: "intermediate" } },

  { id: "vehicle-emissions", type: "causal", position: { x: 1150, y: 450 },
    data: { label: "Vehicle emissions (PM, NOx)", value: 0, enabled: true, type: "intermediate" } },

  { id: "urban-sprawl", type: "causal", position: { x: 600, y: 280 },
    data: { label: "Urban sprawl → ↑ CO₂ & emissions", value: 0, enabled: true, type: "intermediate" } },

  // ===== INFRASTRUCTURE PATHS =====
  { id: "drives-construction", type: "causal", position: { x: 100, y: 240 },
    data: { label: "Drives construction → ↑ CO₂", value: 0, enabled: true, type: "intermediate" } },

  { id: "enables-industry", type: "causal", position: { x: 300, y: 240 },
    data: { label: "Enables industry → ↑ CO₂", value: 0, enabled: true, type: "intermediate" } },

  { id: "needs-roads", type: "causal", position: { x: 400, y: 300 },
    data: { label: "Needs roads/airports → ↑ CO₂", value: 0, enabled: true, type: "intermediate" } },

  { id: "embodied-use", type: "causal", position: { x: 200, y: 540 },
    data: { label: "Embodied + use", value: 0, enabled: true, type: "intermediate" } },

  // ===== ENERGY PATHS =====
  { id: "energy-demand", type: "causal", position: { x: 700, y: 360 },
    data: { label: "Energy demand → ↑ CO₂", value: 0, enabled: true, type: "intermediate" } },

  { id: "generation", type: "causal", position: { x: 900, y: 420 },
    data: { label: "Generation", value: 0, enabled: true, type: "intermediate" } },

  { id: "power-generation", type: "causal", position: { x: 900, y: 540 },
    data: { label: "Power generation (SO₂, NOx)", value: 0, enabled: true, type: "intermediate" } },

  // ===== OUTPUTS =====
  { id: "direct-indirect", type: "causal", position: { x: 50, y: 340 },
    data: { label: "Direct + indirect", value: 0, enabled: true, type: "intermediate" } },

  { id: "fuel-travel", type: "causal", position: { x: 50, y: 420 },
    data: { label: "Fuel & travel", value: 0, enabled: true, type: "intermediate" } },

  { id: "co2", type: "causal", position: { x: 300, y: 650 },
    data: { label: "CO₂ Emissions", value: 0, enabled: true, type: "output" } },

  { id: "contributes", type: "causal", position: { x: 300, y: 720 },
    data: { label: "Contributes to", value: 0, enabled: true, type: "intermediate" } },

  { id: "aqi", type: "causal", position: { x: 300, y: 800 },
    data: { label: "Air Quality Index (AQI)", value: 0, enabled: true, type: "output" } },

  { id: "poor-aqi", type: "causal", position: { x: 700, y: 650 },
    data: { label: "Poor AQI → Urban health/stability", value: 0, enabled: true, type: "intermediate" } },
]
