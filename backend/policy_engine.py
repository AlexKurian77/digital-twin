"""
Core policy engine: transforms research into structured policies.
Uses LLM with structured prompting and Pydantic validation.
"""
import json
import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ValidationError, Field
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

import config


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class PolicyMutation(BaseModel):
    """Represents a single mutation to the causal graph."""
    type: str = Field(..., description="disable_node | reduce_edge_weight | increase_edge_weight")
    node_id: Optional[str] = Field(None, description="For disable_node mutations")
    source: Optional[str] = Field(None, description="For edge mutations")
    target: Optional[str] = Field(None, description="For edge mutations")
    new_weight: Optional[float] = Field(None, description="New edge weight [0.0, 1.0]")
    original_weight: Optional[float] = Field(None, description="Original weight (optional)")
    reason: str = Field(..., description="Why this mutation is applied")
    reversible: bool = Field(True, description="Can this be undone?")


class SourceResearch(BaseModel):
    """Research evidence backing the policy."""
    paper_ids: List[str] = Field(default_factory=list)
    key_quotes: List[str] = Field(default_factory=list)
    confidence: float = Field(0.8, description="Confidence in policy [0.0, 1.0]")


class TradeOff(BaseModel):
    """Trade-off from policy implementation."""
    sector: str
    impact: str = Field(..., description="positive | negative | neutral")
    magnitude: str = Field(..., description="mild | moderate | strong")
    description: str


class EstimatedImpact(BaseModel):
    """Estimated system-wide impacts."""
    co2_reduction_pct: float = Field(0.0, description="% reduction in CO₂")
    aqi_improvement_pct: float = Field(0.0, description="% reduction in AQI")
    confidence: float = Field(0.7)


class Policy(BaseModel):
    """Complete structured policy JSON."""
    policy_id: str
    name: str
    description: Optional[str] = None
    mutations: List[PolicyMutation]
    estimated_impacts: EstimatedImpact
    trade_offs: List[TradeOff] = Field(default_factory=list)
    source_research: SourceResearch
    timestamp: Optional[str] = None


# ============================================================================
# POLICY ENGINE
# ============================================================================

class PolicyEngine:
    """Converts research insights into structured policies via LLM."""

    def __init__(self):
        """Initialize FAISS index and LLM."""
        self.embeddings = HuggingFaceEmbeddings(
            model_name=config.EMBEDDINGS_MODEL
        )
        
        try:
            self.db = FAISS.load_local(
                str(config.FAISS_INDEX_PATH),
                self.embeddings,
                allow_dangerous_deserialization=True
            )
        except Exception as e:
            print(f"Warning: FAISS index not found at {config.FAISS_INDEX_PATH}")
            print(f"Error: {e}")
            self.db = None
        
        self.llm = ChatGoogleGenerativeAI(
            model=config.LLM_MODEL,
            temperature=config.LLM_TEMPERATURE,
            google_api_key=config.GEMINI_API_KEY
        )
    
    def query_research(self, question: str, k: int = None) -> tuple[List[str], bool]:
        """
        Retrieve research chunks from FAISS.
        
        Args:
            question: Search query
            k: Number of results (default from config)
            
        Returns:
            Tuple of (research chunks or [question], is_direct_query)
        """
        if not self.db:
            print(f"FAISS DB not initialized, using direct query: {question}")
            # Return the user's query directly when FAISS is not available
            return [question], True
        
        k = k or config.FAISS_K_SEARCH
        results = self.db.similarity_search(question, k=k)
        return [r.page_content for r in results], False
    
    def extract_policy(
        self,
        research_chunks: List[str],
        graph_context: Dict[str, Any],
        is_direct_query: bool = False
    ) -> Policy:
        """
        Use LLM to extract structured policy from research.
        
        Args:
            research_chunks: List of research excerpts or [user_query] if direct
            graph_context: Dict with node/edge structure for validation
            is_direct_query: True if research_chunks contains user query (no FAISS)
            
        Returns:
            Validated Policy object
        """
        # Format content for prompt
        # Ensure all chunks are strings (handle potential nested lists)
        flat_chunks = []
        for chunk in research_chunks:
            if isinstance(chunk, list):
                flat_chunks.extend([str(c) for c in chunk])
            else:
                flat_chunks.append(str(chunk))
        
        if is_direct_query:
            user_query = flat_chunks[0] if flat_chunks else ""
            research_section = f"USER QUERY: {user_query}\n\nUse your knowledge to create a policy addressing this query."
        else:
            research_section = "RESEARCH FINDINGS:\n" + "\n---\n".join(flat_chunks)
        
        formatted_nodes = ", ".join(graph_context.get("node_ids", []))
        formatted_edges = "\n".join([
            f"  {e['source']}->{e['target']} (current weight: {e.get('weight', 0.5)})"
            for e in graph_context.get("edges", [])
        ])
        
        prompt = f"""You are a climate policy expert. Your task is to design policies that reduce CO₂ and air pollution.

{research_section}

CURRENT SYSTEM EDGES (with current weights):
{formatted_edges}

Available nodes: {formatted_nodes}

EMISSION REDUCTION MECHANICS - READ CAREFULLY:
The system propagates emissions through edges. Each edge has a weight (0.0 to 1.0):
  - target_value = source_value × weight
  - A weight of 0.7 means 70% of the source value flows to the target
  - A weight of 0.3 means 30% of the source value flows to the target

TO REDUCE EMISSIONS:
  - MUST decrease the edge weight to a SMALLER number
  - Example: 0.7 → 0.35 (50% reduction in flow)
  - Example: 0.5 → 0.25 (50% reduction in flow)
  - Example: 0.8 → 0.4 (50% reduction in flow)

CRITICAL: new_weight MUST BE LESS THAN current weight. Do not increase!

WRONG EXAMPLES (DO NOT DO THIS):
  ✗ Change 0.7 to 0.75 (increases from 0.7)
  ✗ Change 0.5 to 0.8 (increases from 0.5)
  ✗ Change 0.6 to 0.7 (increases from 0.6)

CORRECT EXAMPLES:
  ✓ Change transport→vehicle-emissions from 0.7 to 0.35 (cuts in half)
  ✓ Change transport→vehicle-emissions from 0.7 to 0.49 (30% reduction)
  ✓ Change energy→co2 from 0.8 to 0.48 (40% reduction)

TASK: Create ONE policy to address: "{flat_chunks[0][:100] if flat_chunks else 'emissions reduction'}..."

Return ONLY valid JSON:
{{
  "policy_id": "policy-slug",
  "name": "Policy Name",
  "description": "Description",
  "mutations": [
    {{
      "type": "reduce_edge_weight",
      "source": "transport",
      "target": "vehicle-emissions",
      "new_weight": 0.35,
      "original_weight": 0.7,
      "reason": "Research shows..."
    }}
  ],
  "estimated_impacts": {{
    "co2_reduction_pct": 15.0,
    "aqi_improvement_pct": 18.0,
    "confidence": 0.8
  }},
  "trade_offs": [],
  "source_research": {{
    "paper_ids": [],
    "key_quotes": [],
    "confidence": 0.85
  }}
}}"""
        
        # Call LLM
        response = self.llm.invoke(prompt)
        response_text = response.content
        
        # Extract JSON (handle markdown code blocks)
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if not json_match:
            raise ValueError(f"No JSON found in LLM response: {response_text}")
        
        json_str = json_match.group()
        policy_dict = json.loads(json_str)
        
        # Clean up trade_offs - LLM sometimes returns strings instead of objects
        if 'trade_offs' in policy_dict:
            cleaned_trade_offs = []
            for item in policy_dict['trade_offs']:
                if isinstance(item, str):
                    # Convert string to proper TradeOff object
                    cleaned_trade_offs.append({
                        'sector': 'general',
                        'impact': 'neutral',
                        'magnitude': 'mild',
                        'description': item
                    })
                elif isinstance(item, dict):
                    cleaned_trade_offs.append(item)
            policy_dict['trade_offs'] = cleaned_trade_offs
        
        # Validate against schema
        policy = Policy(**policy_dict)
        
        # Log the mutations for debugging
        print(f"\n[Policy Generated]")
        print(f"Policy: {policy.name}")
        print(f"Description: {policy.description}")
        print(f"Mutations: {len(policy.mutations)}")
        for i, mut in enumerate(policy.mutations):
            if mut.type in ["reduce_edge_weight", "increase_edge_weight"]:
                print(f"  {i+1}. {mut.type}: {mut.source} -> {mut.target}")
                print(f"     New weight: {mut.new_weight} (reason: {mut.reason})")
        print(f"Estimated CO₂ reduction: {policy.estimated_impacts.co2_reduction_pct}%")
        print(f"Estimated AQI improvement: {policy.estimated_impacts.aqi_improvement_pct}%\n")
        
        # Validate mutations reference real nodes/edges
        self._validate_mutations(policy, graph_context)
        
        return policy
    
    def _validate_mutations(self, policy: Policy, graph_context: Dict) -> None:
        """Ensure mutations reference real nodes/edges."""
        node_ids = set(graph_context.get("node_ids", []))
        edge_pairs = set((e['source'], e['target']) for e in graph_context.get("edges", []))
        
        for mutation in policy.mutations:
            if mutation.type == "disable_node":
                if mutation.node_id not in node_ids:
                    raise ValueError(f"Unknown node: {mutation.node_id}")
            
            elif mutation.type in ["reduce_edge_weight", "increase_edge_weight"]:
                if (mutation.source, mutation.target) not in edge_pairs:
                    raise ValueError(f"Unknown edge: {mutation.source} -> {mutation.target}")
                
                if mutation.new_weight is None or not (0.0 <= mutation.new_weight <= 1.0):
                    raise ValueError(f"Invalid weight: {mutation.new_weight}")


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_graph_context_from_file(filepath: str) -> Dict[str, Any]:
    """
    Load graph context (nodes, edges) from snapshot file.
    Used for validation during policy extraction.
    """
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        # Extract node IDs
        node_ids = [n['id'] for n in data.get('nodes', [])]
        
        # Extract edges with weights
        edges = [
            {
                'source': e['source'],
                'target': e['target'],
                'weight': e.get('data', {}).get('weight', 0.5)
            }
            for e in data.get('edges', [])
        ]
        
        return {
            'node_ids': node_ids,
            'edges': edges,
            'full_graph': data
        }
    except Exception as e:
        print(f"Could not load graph context: {e}")
        return {
            'node_ids': [
                'industries', 'transport', 'energy', 'infrastructure',
                'moves-goods', 'uses-power', 'fuels-transport', 'co2', 'aqi'
            ],
            'edges': [
                {'source': 'industries', 'target': 'transport', 'weight': 0.6},
                {'source': 'transport', 'target': 'vehicle-emissions', 'weight': 0.7},
                {'source': 'energy', 'target': 'co2', 'weight': 0.8},
                {'source': 'co2', 'target': 'aqi', 'weight': 0.9}
            ]
        }
