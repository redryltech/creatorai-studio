// ============================================================
// CreatorAI Studio — Prompt Compiler (Core)
// ============================================================
// Compiles all upstream planning data into provider-ready prompts.
// This is the final planning stage before any generation begins.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import { PromptAssembler } from './prompt-assembler';
import { NegativePromptEngine } from './negative-prompt-engine';
import { ProviderCompiler } from './provider-compiler';
import { TokenOptimizer } from './token-optimizer';
import { QualityScorer } from './quality-scorer';
import { ConflictResolver } from './conflict-resolver';
const log = Logger.for('PromptCompiler');
export class PromptCompilerCore {
    /**
     * Compile all prompts from the complete planning pipeline.
     */
    static compile(directorPlan, storyboard, charDb, sceneGraphPkg, worldStatePkg, assetMemoryPkg, promptLength = 'detailed') {
        const startTime = performance.now();
        log.info('Prompt compilation starting', {
            scenes: storyboard.frames.length,
            entities: charDb.entities.length,
            promptLength,
        });
        const canonicalPrompts = [];
        const negativeSpecs = [];
        const qualityScores = [];
        const allConflicts = [];
        const providerPrompts = {};
        // Initialize provider prompt arrays
        for (const provider of ProviderCompiler.getProviders()) {
            providerPrompts[provider.id] = [];
        }
        for (let i = 0; i < storyboard.frames.length; i++) {
            const frame = storyboard.frames[i];
            const dirScene = i < directorPlan.scenes.length ? directorPlan.scenes[i] : undefined;
            const worldSnap = i < worldStatePkg.snapshots.length ? worldStatePkg.snapshots[i] : undefined;
            const seed = charDb.entities[0]?.globalSeed ?? 42;
            // ── Step 1: Assemble prompt blocks ──
            const blocks = PromptAssembler.assemble(frame, dirScene, charDb, worldSnap, assetMemoryPkg.brandKit, assetMemoryPkg.styleGuide);
            // ── Step 2: Compile master prompt from blocks ──
            // Sort by priority (highest first) and join
            const sortedBlocks = [...blocks].sort((a, b) => b.priority - a.priority);
            const masterPrompt = sortedBlocks.map((b) => b.content).join(', ');
            // ── Step 3: Build negative prompt ──
            const negSpec = NegativePromptEngine.build(frame.sceneId, charDb);
            negativeSpecs.push(negSpec);
            // ── Step 4: Detect and resolve conflicts ──
            const conflicts = ConflictResolver.resolve(blocks, masterPrompt);
            allConflicts.push(...conflicts);
            // ── Step 5: Build canonical prompt ──
            const tokenCount = TokenOptimizer.estimateTokens(masterPrompt);
            const canonical = {
                sceneId: frame.sceneId,
                sceneOrder: frame.sceneOrder,
                sceneSummary: frame.sceneSummary,
                visualObjective: frame.visualGoal,
                blocks,
                masterPrompt,
                negativePrompt: negSpec.compiled,
                tokenCount,
                estimatedComplexity: Math.min(100, tokenCount / 3),
            };
            canonicalPrompts.push(canonical);
            // ── Step 6: Score quality ──
            const quality = QualityScorer.score(canonical);
            qualityScores.push(quality);
            // ── Step 7: Compile for all providers ──
            const providerResults = ProviderCompiler.compileAll(canonical, negSpec, dirScene, seed, promptLength);
            for (const pp of providerResults) {
                providerPrompts[pp.providerId].push(pp);
            }
        }
        const processingTimeMs = Math.round(performance.now() - startTime);
        const avgTokens = Math.round(canonicalPrompts.reduce((s, p) => s + p.tokenCount, 0) / Math.max(canonicalPrompts.length, 1));
        const avgScore = Math.round(qualityScores.reduce((s, q) => s + q.overallScore, 0) / Math.max(qualityScores.length, 1));
        log.info('Prompt compilation complete', {
            scenes: canonicalPrompts.length,
            providers: Object.keys(providerPrompts).length,
            avgTokens,
            avgScore,
            conflicts: allConflicts.length,
            processingTimeMs,
        });
        return {
            id: generateId(ID_PREFIXES.pipeline),
            productionTitle: directorPlan.title,
            canonicalPrompts,
            providerPrompts,
            negativeSpecs,
            qualityScores,
            conflicts: allConflicts,
            metadata: {
                totalScenes: canonicalPrompts.length,
                totalProviders: Object.keys(providerPrompts).length,
                avgTokenCount: avgTokens,
                avgQualityScore: avgScore,
                totalConflicts: allConflicts.length,
                promptLength,
                generatedAt: new Date().toISOString(),
                engine: 'prompt-compiler-v1',
                processingTimeMs,
            },
        };
    }
}
//# sourceMappingURL=prompt-compiler.js.map