import { type Edge, MarkerType } from "@xyflow/react"

export const initialEdges: Edge[] = [
  // 1. Industries -> Transport
  { 
    id: "ind-trans", 
    source: "industries", 
    target: "transport", 
    label: "Moves goods → CO₂ & particulates",
    data: { label: "Moves goods → CO₂ & particulates", weight: 0.6 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 2. Industries -> Energy
  { 
    id: "ind-energy", 
    source: "industries", 
    target: "energy", 
    label: "Uses power → ↑ CO₂ & pollutants",
    data: { label: "Uses power → ↑ CO₂ & pollutants", weight: 0.5 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 3. Industries -> Infrastructure
  { 
    id: "ind-infra", 
    source: "industries", 
    target: "infrastructure", 
    label: "Drives construction → ↑ CO₂",
    data: { label: "Drives construction → ↑ CO₂", weight: 0.4 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 4. Industries -> CO2 Emissions (Corrected Label)
  { 
    id: "ind-co2", 
    source: "industries", 
    target: "co2", 
    label: "Direct + indirect",
    data: { label: "Direct + indirect", weight: 0.7 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },

  // 5. Industries -> AQI (New Connection)
  { 
    id: "ind-aqi", 
    source: "industries", 
    target: "aqi", 
    label: "Industrial pollutants (PM, NOx, SO₂)",
    data: { label: "Industrial pollutants (PM, NOx, SO₂)", weight: 0.8 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },

  // 6. Transport -> Energy
  { 
    id: "trans-energy", 
    source: "transport", 
    target: "energy", 
    label: "Fuel demand & refining → ↑ CO₂",
    data: { label: "Fuel demand & refining → ↑ CO₂", weight: 0.5 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 7. Transport -> Infrastructure
  { 
    id: "trans-infra", 
    source: "transport", 
    target: "infrastructure", 
    label: "Needs roads/airports → ↑ CO₂",
    data: { label: "Needs roads/airports → ↑ CO₂", weight: 0.4 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 8. Transport -> CO2 Emissions
  { 
    id: "trans-co2", 
    source: "transport", 
    target: "co2", 
    label: "Fuel & vehicle emissions",
    data: { label: "Fuel & vehicle emissions", weight: 0.7 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 9. Transport -> AQI
  { 
    id: "trans-aqi", 
    source: "transport", 
    target: "aqi", 
    label: "Vehicle emissions (PM, NOx)",
    data: { label: "Vehicle emissions (PM, NOx)", weight: 0.7 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },

  // 10. Energy -> Industries
  { 
    id: "energy-ind", 
    source: "energy", 
    target: "industries", 
    label: "Powers industry → ↑ CO₂",
    data: { label: "Powers industry → ↑ CO₂", weight: 0.6 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  { 
    id: "energy-trans", 
    source: "energy", 
    target: "transport", 
    label: "Fuel transport → ↑ CO₂",
    data: { label: "Fuel transport → ↑ CO₂", weight: 0.6 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 11. Energy -> CO2 Emissions
  { 
    id: "energy-co2", 
    source: "energy", 
    target: "co2", 
    label: "Power generation emissions",
    data: { label: "Power generation emissions", weight: 0.8 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 12. Energy -> AQI
  { 
    id: "energy-aqi", 
    source: "energy", 
    target: "aqi", 
    label: "Power Generation (SO₂ & NOx)",
    data: { label: "Power Generation (SO₂ & NOx)", weight: 0.7 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },

  // 13. Infrastructure -> Transport
  { 
    id: "infra-trans", 
    source: "infrastructure", 
    target: "transport", 
    label: "Urban Sprawl → ↑ CO₂ & emissions",
    data: { label: "Enables transport", weight: 0.5 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 14. Infrastructure -> Industries
  { 
    id: "infra-ind", 
    source: "infrastructure", 
    target: "industries", 
    label: "Enables industry → ↑ CO₂",
    data: { label: "Enables industry → ↑ CO₂", weight: 0.5 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  { 
    id: "infra-energy", 
    source: "infrastructure", 
    target: "energy", 
    label: "Energy demand → ↑ CO₂",
    data: { label: "Energy demand → ↑ CO₂", weight: 0.5 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 15. Infrastructure -> CO2 Emissions
  { 
    id: "infra-co2", 
    source: "infrastructure", 
    target: "co2", 
    label: "Embodied & use emissions",
    data: { label: "Embodied & use emissions", weight: 0.6 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },

  // 16. CO2 Emissions -> AQI
  { 
    id: "co2-aqi", 
    source: "co2", 
    target: "aqi", 
    label: "Contributes to air pollution",
    data: { label: "Contributes to air pollution", weight: 0.8 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  { 
    id: "aqi-infra", 
    source: "aqi", 
    target: "infrastructure", 
    label: "Poor AQI → Urban health/stability",
    data: { label: "Poor AQI → Urban health/stability", weight: 0.8 },
    type: "smoothstep", 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
]
