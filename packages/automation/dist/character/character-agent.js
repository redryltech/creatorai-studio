// ============================================================
// CreatorAI Studio — Character Agent
// ============================================================
// Pipeline: Storyboard → CharacterAgent → PromptOptimizer
// ============================================================
import { Logger } from '@creatorai/agents';
import { CharacterPlanner } from './character-planner';
import { CharacterValidator } from './character-validator';
import { CharacterMemory } from './character-memory';
const log = Logger.for('CharacterAgent');
export class CharacterAgent {
    agentId = 'automation.character';
    agentName = 'Character Consistency Engine';
    stage = 'character_planning';
    validate(input) {
        const errors = [];
        if (!input.storyboard)
            errors.push('Storyboard is required');
        if (!input.storyboard?.frames?.length)
            errors.push('Storyboard must have frames');
        return { valid: errors.length === 0, errors };
    }
    estimateCost() {
        return { costUsd: 0, breakdown: ['Character planning is local — $0.00'] };
    }
    async healthCheck() {
        return { healthy: true, details: 'CharacterPlanner is local — always available' };
    }
    async execute(input, onProgress, cancellation) {
        const { storyboard, directorPlan, baseSeed } = input;
        log.info('Character consistency engine starting', { frames: storyboard.frames.length });
        onProgress(10, 'Scanning storyboard for entities');
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(30, 'Building entity profiles and identity blocks');
        const database = CharacterPlanner.plan(storyboard, directorPlan, baseSeed);
        if (cancellation.isCancelled)
            throw new Error('Cancelled');
        onProgress(60, 'Analyzing continuity across scenes');
        const continuity = CharacterPlanner.analyzeContinuity(storyboard, database, baseSeed);
        onProgress(80, 'Validating character database');
        const validation = CharacterValidator.validate(database);
        if (!validation.valid) {
            log.warn('Character validation issues', { errors: validation.errors });
        }
        onProgress(90, 'Recording in character memory');
        CharacterMemory.getInstance().record({
            productionTitle: storyboard.title,
            databaseId: database.id,
            entityCount: database.entities.length,
            continuityScore: continuity.overallScore,
        });
        onProgress(100, `Character engine complete — ${database.entities.length} entities, continuity ${continuity.overallScore}/100`);
        log.info('Character database complete', {
            id: database.id,
            entities: database.entities.length,
            continuityScore: continuity.overallScore,
            continuityIssues: continuity.issues.length,
            validationScore: validation.score,
        });
        return database;
    }
}
//# sourceMappingURL=character-agent.js.map