import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.policy_engine import PolicyEngine

# Mock config to avoid loading real paths/keys if not needed, 
# but PolicyEngine needs them. assuming env is set.
import backend.config as config

print("Initializing PolicyEngine...")
engine = PolicyEngine()

graph_context = {
    'node_ids': ['industries', 'transport', 'vehicle-emissions', 'co2'],
    'edges': [
        {'source': 'transport', 'target': 'vehicle-emissions', 'weight': 0.7},
        {'source': 'vehicle-emissions', 'target': 'co2', 'weight': 0.8}
    ]
}

query = "increase transport emissions by 12%"
print(f"Testing Query: {query}")

# Mock research chunks (simulation what FAISS would return)
chunks = [
    "To reduce emissions, we should switch to electric vehicles.",
    "Banning diesel cars reduces CO2 by 20%."
]

print("Extracting policy...")
# Pass user_query explicitly as per my fix
policy = engine.extract_policy(chunks, graph_context, is_direct_query=False, user_query=query)

print(f"\nPolicy Name: {policy.name}")
print(f"Description: {policy.description}")
print("Mutations:")
for m in policy.mutations:
    print(f"  {m.type}: {m.source}->{m.target} (New: {m.new_weight})")

print(f"\nEstimated CO2 Change: {policy.estimated_impacts.co2_reduction_pct}%")
