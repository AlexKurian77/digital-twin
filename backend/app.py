"""
Flask API server for the policy engine.
Endpoints for generating policies, applying them, and analyzing impacts.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import traceback

from policy_engine import PolicyEngine, get_graph_context_from_file
from graph_engine import GraphState, ImpactAnalyzer
from explainability import generate_policy_explanation
from aqi import register_aqi_routes
import config


# ============================================================================
# SETUP
# ============================================================================

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Initialize policy engine
policy_engine = PolicyEngine()

# Register AQI routes
register_aqi_routes(app)


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_graph_state():
    """Load current graph state."""
    try:
        return GraphState.from_file(str(config.GRAPH_STATE_PATH))
    except Exception as e:
        print(f"Error loading graph: {e}")
        return None


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'service': 'policy-engine'
    })


@app.route('/api/graph-state', methods=['GET'])
def get_current_graph_state():
    """
    Get current graph state (nodes, edges, values).
    Used by frontend for validation and context.
    """
    try:
        graph = get_graph_state()
        if not graph:
            return jsonify({'error': 'Could not load graph'}), 500
        
        return jsonify({
            'status': 'success',
            'graph': graph.to_dict(),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-policy', methods=['POST'])
def generate_policy():
    """
    Generate policy from research query.
    
    Request body:
    {
        "research_query": "How to reduce transport emissions?"
    }
    
    Returns:
    {
        "policy": { Policy JSON },
        "research_evidence": ["chunk1", "chunk2", ...],
        "status": "success"
    }
    """
    try:
        data = request.json
        query = data.get('research_query')
        
        if not query:
            return jsonify({'error': 'Missing research_query'}), 400
        
        # Retrieve research (or use direct query if FAISS not available)
        research_chunks, is_direct_query = policy_engine.query_research(query, k=3)
        
        # Get graph context for validation
        graph_context = get_graph_context_from_file(str(config.GRAPH_STATE_PATH))
        
        # Extract policy via LLM
        policy = policy_engine.extract_policy(research_chunks, graph_context, is_direct_query)
        
        return jsonify({
            'status': 'success',
            'policy': policy.dict(),
            'research_evidence': research_chunks,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in generate_policy: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/apply-policy', methods=['POST'])
def apply_policy():
    """
    Apply policy to graph and calculate impact.
    
    Request body:
    {
        "policy": { Policy JSON from generate-policy }
    }
    
    Returns:
    {
        "snapshot": {
            "scenario_id": "id",
            "policy_id": "id",
            "impact": { CO2 and AQI changes },
            "cascade_analysis": { affected nodes },
            ...
        },
        "status": "success"
    }
    """
    try:
        data = request.json
        policy_dict = data.get('policy')
        
        if not policy_dict:
            return jsonify({'error': 'Missing policy'}), 400
        
        # Load baseline
        baseline = get_graph_state()
        if not baseline:
            return jsonify({'error': 'Could not load baseline graph'}), 500
        
        # Create post-policy state (deep copy baseline)
        import copy
        post_policy = GraphState(
            copy.deepcopy(baseline.nodes),
            copy.deepcopy(baseline.edges)
        )
        
        # Apply mutations
        mutation_results = post_policy.apply_policy(policy_dict)
        
        # Log mutations with before/after values
        print(f"\n[Policy Applied]")
        print(f"Baseline vehicle-emissions value: {baseline.get_node('vehicle-emissions')['data']['value']}")
        print(f"Baseline CO2 value: {baseline.get_node('co2')['data']['value']}")
        print(f"Baseline AQI value: {baseline.get_node('aqi')['data']['value']}")
        
        for i, mut in enumerate(mutation_results.get('mutations_applied', [])):
            print(f"Mutation {i+1}: {mut['type']}")
            if 'before' in mut and 'after' in mut:
                print(f"  Before: {mut['before']}")
                print(f"  After: {mut['after']}")
        
        # Calculate impact
        analyzer = ImpactAnalyzer(baseline, post_policy)
        impact = analyzer.calculate_impact()
        
        print(f"\nPost-policy vehicle-emissions value: {post_policy.get_node('vehicle-emissions')['data']['value']}")
        print(f"Post-policy CO2 value: {post_policy.get_node('co2')['data']['value']}")
        print(f"Post-policy AQI value: {post_policy.get_node('aqi')['data']['value']}")
        print(f"Impact: CO₂ change {impact['co2']['change_pct']:.1f}%, AQI change {impact['aqi']['change_pct']:.1f}%\n")
        
        # Create snapshot
        snapshot = {
            'scenario_id': f"snap-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            'policy_id': policy_dict.get('policy_id'),
            'policy_name': policy_dict.get('name'),
            'baseline_graph': baseline.to_dict(),
            'post_policy_graph': post_policy.to_dict(),
            'mutations_applied': mutation_results['mutations_applied'],
            'impact': impact,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify({
            'snapshot': snapshot,
            'status': 'success'
        })
    
    except Exception as e:
        print(f"Error in apply_policy: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/compare-scenarios', methods=['POST'])
def compare_scenarios():
    """
    Compare multiple scenarios side-by-side.
    
    Request body:
    {
        "scenarios": [
            { "name": "Scenario 1", "policy": { Policy JSON } },
            { "name": "Scenario 2", "policy": { Policy JSON } },
            ...
        ]
    }
    
    Returns:
    {
        "comparison": [ Snapshots for each scenario ],
        "ranking": {
            "best_co2_reduction": "Scenario name",
            "best_aqi_improvement": "Scenario name"
        }
    }
    """
    try:
        data = request.json
        scenarios = data.get('scenarios', [])
        
        if not scenarios:
            return jsonify({'error': 'Missing scenarios'}), 400
        
        results = []
        
        for scenario in scenarios:
            # Apply each policy
            baseline = get_graph_state()
            if not baseline:
                continue
            
            import copy
            post_policy = GraphState(
                copy.deepcopy(baseline.nodes),
                copy.deepcopy(baseline.edges)
            )
            
            post_policy.apply_policy(scenario.get('policy', {}))
            
            analyzer = ImpactAnalyzer(baseline, post_policy)
            impact = analyzer.calculate_impact()
            
            results.append({
                'name': scenario.get('name'),
                'impact': impact
            })
        
        # Rank by impact
        best_co2 = max(results, key=lambda r: abs(r['impact']['co2']['change_pct']), default={})
        best_aqi = max(results, key=lambda r: abs(r['impact']['aqi']['change_pct']), default={})
        
        return jsonify({
            'status': 'success',
            'comparison': results,
            'ranking': {
                'best_co2_reduction': best_co2.get('name'),
                'best_aqi_improvement': best_aqi.get('name')
            },
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in compare_scenarios: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/explain-policy', methods=['POST'])
def explain_policy():
    """
    Generate explanation for a policy.
    
    Request body:
    {
        "policy": { Policy JSON },
        "research_evidence": ["chunk1", "chunk2", ...]
    }
    
    Returns:
    {
        "explanation": {
            "policy_id": "...",
            "narrative_intro": "...",
            "mutations": [ { narrative, supporting_research, stakeholders } ],
            "overall_narrative": "..."
        }
    }
    """
    try:
        data = request.json
        policy = data.get('policy')
        research_evidence = data.get('research_evidence', [])
        
        if not policy:
            return jsonify({'error': 'Missing policy'}), 400
        
        # Generate explanation
        explanation = generate_policy_explanation(policy, research_evidence)
        
        return jsonify({
            'status': 'success',
            'explanation': explanation,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        print(f"Error in explain_policy: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print(f"🚀 Policy Engine API starting on port {config.FLASK_PORT}")
    app.run(debug=config.FLASK_DEBUG, port=config.FLASK_PORT, host='0.0.0.0')
