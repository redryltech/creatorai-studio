// ============================================================
// CreatorAI Studio — Scene Graph Validator
// ============================================================
export class SceneGraphValidator {
    static validate(pkg) {
        const errors = [];
        const warnings = [];
        let score = 100;
        if (!pkg.id) {
            errors.push('No package ID');
            score -= 10;
        }
        if (pkg.scenes.length === 0) {
            errors.push('No scenes');
            score -= 50;
        }
        for (const graph of pkg.scenes) {
            const nodeMap = graph.nodes instanceof Map ? graph.nodes : new Map(Object.entries(graph.nodes));
            const gPrefix = `Graph ${graph.graphId}`;
            // Root exists
            if (!nodeMap.has(graph.rootNodeId)) {
                errors.push(`${gPrefix}: root node missing`);
                score -= 10;
            }
            // Duplicate node IDs
            const ids = new Set();
            for (const [id] of nodeMap) {
                if (ids.has(id)) {
                    errors.push(`${gPrefix}: duplicate node ${id}`);
                    score -= 5;
                }
                ids.add(id);
            }
            // Broken parent references
            for (const [, node] of nodeMap) {
                if (node.parentId && !nodeMap.has(node.parentId)) {
                    errors.push(`${gPrefix}: node ${node.id} references missing parent ${node.parentId}`);
                    score -= 5;
                }
            }
            // Broken child references
            for (const [, node] of nodeMap) {
                for (const childId of node.childrenIds) {
                    if (!nodeMap.has(childId)) {
                        warnings.push(`${gPrefix}: node ${node.id} references missing child ${childId}`);
                        score -= 2;
                    }
                }
            }
            // Cycle detection (simplified — check if any node is its own ancestor)
            for (const [, node] of nodeMap) {
                let current = node.parentId;
                const visited = new Set();
                while (current) {
                    if (visited.has(current)) {
                        errors.push(`${gPrefix}: cycle detected at ${node.id}`);
                        score -= 10;
                        break;
                    }
                    visited.add(current);
                    current = nodeMap.get(current)?.parentId ?? null;
                }
            }
            // Relationship validation
            for (const rel of graph.relationships) {
                if (!nodeMap.has(rel.sourceNodeId)) {
                    errors.push(`${gPrefix}: relationship ${rel.id} has invalid source`);
                    score -= 3;
                }
                if (!nodeMap.has(rel.targetNodeId)) {
                    errors.push(`${gPrefix}: relationship ${rel.id} has invalid target`);
                    score -= 3;
                }
            }
            // Camera validation
            if (!graph.cameraNode) {
                errors.push(`${gPrefix}: no camera node`);
                score -= 10;
            }
            else {
                if (graph.cameraNode.targetNodeId && !nodeMap.has(graph.cameraNode.targetNodeId)) {
                    warnings.push(`${gPrefix}: camera target node missing`);
                    score -= 3;
                }
                if (graph.cameraNode.fieldOfView <= 0 || graph.cameraNode.fieldOfView > 180) {
                    warnings.push(`${gPrefix}: invalid camera FOV: ${graph.cameraNode.fieldOfView}`);
                    score -= 2;
                }
            }
            // Light validation
            if (graph.lightNodes.length === 0) {
                warnings.push(`${gPrefix}: no lights`);
                score -= 3;
            }
            // Invalid positions (NaN check)
            for (const [, node] of nodeMap) {
                if (isNaN(node.position.x) || isNaN(node.position.y) || isNaN(node.position.z)) {
                    errors.push(`${gPrefix}: node ${node.id} has NaN position`);
                    score -= 5;
                }
            }
            // Metrics sanity
            if (graph.metrics.objectCount === 0) {
                warnings.push(`${gPrefix}: zero objects`);
                score -= 2;
            }
        }
        // Disconnected graphs (every node should be reachable from root)
        for (const graph of pkg.scenes) {
            const nodeMap = graph.nodes instanceof Map ? graph.nodes : new Map(Object.entries(graph.nodes));
            const visited = new Set();
            const queue = [graph.rootNodeId];
            while (queue.length > 0) {
                const id = queue.shift();
                if (visited.has(id))
                    continue;
                visited.add(id);
                const node = nodeMap.get(id);
                if (node)
                    queue.push(...node.childrenIds);
            }
            const unreachable = [...nodeMap.keys()].filter((id) => !visited.has(id));
            if (unreachable.length > 0) {
                warnings.push(`Graph ${graph.graphId}: ${unreachable.length} disconnected nodes`);
                score -= unreachable.length;
            }
        }
        return { valid: errors.length === 0, score: Math.max(0, Math.min(100, score)), errors, warnings };
    }
}
//# sourceMappingURL=scene-graph-validator.js.map