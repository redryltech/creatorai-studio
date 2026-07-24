// ============================================================
// CreatorAI Studio — Scene Graph Agent
// ============================================================
// Pipeline: Character → SceneGraphAgent → PromptOptimizer
// ============================================================
import { Logger } from '@creatorai/agents';
import { SceneGraphPlanner } from './scene-graph-planner';
import { SceneGraphValidator } from './scene-graph-validator';
import { SceneGraphMemory } from './scene-graph-memory';
const log = Logger.for('SceneGraphAgent');
export class SceneGraphAgent {
    agentId = 'automation.scene_graph';
    agentName = 'Scene Graph Engine';
    stage = 'scene_graph';
    validate(input) {
        const errors = [];
        if (!input.storyboard)
            errors.push('Storyboard required');
        if (!input.characterDatabase)
            errors.push('CharacterDatabase required');
        if (!input.storyboard?.frames?.length)
            errors.push('Storyboard must have frames');
        return { valid: errors.length === 0, errors };
    }
    estimateCost() {
        return { costUsd: 0, breakdown: ['Scene graph is local computation — $0.00'] };
    }
    async healthCheck() {
        return { healthy: true, details: 'SceneGraphPlanner is local — always available' };
    }
    async execute(input, onProgress, cancellation) {
        const { storyboard, characterDatabase, directorPlan } = input;
        log.info('Scene graph building', { frames: storyboard.frames.length, entities: characterDatabase.entities.length });
        onProgress(10, 'Building scene graphs from storyboard');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(40, 'Constructing 3D node hierarchies and relationships');
        const pkg = SceneGraphPlanner.plan(storyboard, characterDatabase, directorPlan);
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(75, 'Validating scene graph integrity');
        const validation = SceneGraphValidator.validate(pkg);
        if (!validation.valid) {
            log.warn('Scene graph validation issues', { errors: validation.errors });
        }
        onProgress(90, 'Recording in memory');
        SceneGraphMemory.getInstance().record({
            productionTitle: storyboard.title,
            packageId: pkg.id,
            sceneCount: pkg.scenes.length,
            avgComplexity: pkg.metadata.avgComplexity,
        });
        onProgress(100, `Scene graph complete — ${pkg.metadata.totalNodes} nodes, ${pkg.metadata.totalRelationships} relationships`);
        log.info('Scene graph package complete', {
            id: pkg.id, scenes: pkg.scenes.length,
            totalNodes: pkg.metadata.totalNodes, totalRelationships: pkg.metadata.totalRelationships,
            avgComplexity: pkg.metadata.avgComplexity, validationScore: validation.score,
        });
        return pkg;
    }
}
//# sourceMappingURL=scene-graph-agent.js.map