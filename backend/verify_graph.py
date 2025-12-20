#!/usr/bin/env python3
import json

with open('graph_state.json', 'r') as f:
    data = json.load(f)

print(f'✓ Graph state is valid JSON')
print(f'  Total nodes: {len(data["nodes"])}')
print(f'  Total edges: {len(data["edges"])}')
print(f'\nSector nodes (emission sources):')
for node in data['nodes']:
    if node['data']['type'] == 'sector':
        print(f'  - {node["id"]:20s}: value={node["data"]["value"]}')

print(f'\nEdge connections:')
node_ids = {n['id'] for n in data['nodes']}
for edge in data['edges'][:5]:
    src = edge['source']
    tgt = edge['target']
    w = edge['data']['weight']
    valid = '✓' if (src in node_ids and tgt in node_ids) else '✗'
    print(f'  {valid} {src:20s} -> {tgt:20s} (w={w})')
print(f'  ... and {len(data["edges"]) - 5} more edges')

# Check for missing nodes referenced in edges
referenced = set()
for edge in data['edges']:
    referenced.add(edge['source'])
    referenced.add(edge['target'])

defined = {n['id'] for n in data['nodes']}
missing_from_definition = referenced - defined
missing_from_edges = defined - referenced

if missing_from_definition:
    print(f'\n⚠️  Edges reference undefined nodes: {missing_from_definition}')
if missing_from_edges:
    print(f'\n⚠️  Nodes not used in any edges: {missing_from_edges}')
if not missing_from_definition and not missing_from_edges:
    print(f'\n✓ All nodes are properly connected')
