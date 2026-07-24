// ============================================================
// CreatorAI Studio — Script Planner Agent
// ============================================================
// Upgrades the basic script generation into a full ScriptPackage.
// Produces structured hook, story, CTA, scene breakdown with
// camera suggestions, emotion, and visual notes.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, CostTracker } from '@creatorai/agents';
import type { ILLMProvider } from '@creatorai/providers';
import { ProviderRegistry } from '@creatorai/providers';
import type { IAutomationAgent, ProgressCallback, CancellationToken } from '../interfaces/automation-agent.interface';
import type { AutomationRequest, ContentPlan, ContentIdea, ScriptPackage } from '../types/automation.types';
import { AutomationStage } from '../types/automation.types';

const log = Logger.for('ScriptPlanner');

interface ScriptPlannerInput {
  request: AutomationRequest;
  planning: ContentPlan;
  ideaIndex: number;
}

export class ScriptPlannerAgent implements IAutomationAgent<ScriptPlannerInput, ScriptPackage> {
  readonly agentId = 'automation.script_planner';
  readonly agentName = 'Script Planner';
  readonly stage = AutomationStage.SCRIPTING;

  validate(input: ScriptPlannerInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.request?.topic) errors.push('Request required');
    if (!input.planning?.ideas?.length) errors.push('Content plan with ideas required');
    return { valid: errors.length === 0, errors };
  }

  estimateCost(_input: ScriptPlannerInput): { costUsd: number; breakdown: string[] } {
    return { costUsd: 0.03, breakdown: ['LLM script generation: ~3000 tokens @ $0.01/1K = $0.03'] };
  }

  async healthCheck(): Promise<{ healthy: boolean; details: string }> {
    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    return { healthy: !!llm, details: llm ? 'Ready' : 'No LLM provider' };
  }

  async execute(
    input: ScriptPlannerInput,
    onProgress: ProgressCallback,
    cancellation: CancellationToken,
  ): Promise<ScriptPackage> {
    const { request, planning, ideaIndex } = input;
    const idea = planning.ideas[ideaIndex] ?? planning.ideas[0];
    if (!idea) throw new Error('No content idea available');

    log.info('Script planning starting', { title: idea.title, ideaIndex });
    onProgress(10, `Writing script for "${idea.title}"`);

    const llm = await ProviderRegistry.getInstance().getPrimary<ILLMProvider>('llm');
    if (!llm) throw new Error('No LLM provider available');
    if (cancellation.isCancelled) throw new Error('Script planning cancelled');

    const duration = request.duration ?? (request.platform.includes('short') || request.platform === 'tiktok' ? 60 : 300);
    const sceneCount = Math.max(3, Math.min(15, Math.round(duration / 8)));

    onProgress(25, 'Generating structured script with scene breakdown');

    const response = await llm.complete({
      systemPrompt: `You are an elite viral scriptwriter. Write scripts that hook viewers in 1.5 seconds, maintain attention with pattern interrupts, and drive action with CTAs. Respond ONLY with valid JSON.`,
      messages: [{ role: 'user', content: `Write a complete script package for this video:

Title: "${idea.title}"
Description: ${idea.description}
Angle: ${idea.angle}
Hook idea: ${idea.hook}
Platform: ${request.platform.replace(/_/g, ' ')}
Duration: ~${duration} seconds
Tone: ${request.tone}
Language: ${request.language}
Keywords: ${idea.targetKeywords.join(', ')}
Scene count: ${sceneCount}

Respond with JSON:
{
  "hook": {"text":"the first 2 sentences that grab attention","type":"question|statistic|story|bold_claim|controversy","estimatedAttentionGrab":0},
  "story": {"text":"the main content body","structure":"problem_solution|journey|listicle|comparison|revelation","keyPoints":["string"]},
  "cta": {"text":"call to action text","type":"subscribe|comment|share|visit|follow|like","placement":"end|middle_and_end"},
  "fullNarration": "complete narration from start to finish",
  "scenes": [{"id":"scene-1","order":1,"narration":"text spoken","visualNotes":"what to show","cameraAngle":"close-up|medium|wide|overhead|low-angle","cameraMovement":"static|slow-zoom|pan-left|pan-right|tracking","emotion":"curiosity|surprise|excitement|empathy|determination","duration":${Math.round(duration / sceneCount)},"transition":"cut|crossfade|zoom|fade-black"}],
  "metadata": {"wordCount":0,"estimatedDuration":${duration},"readabilityScore":0,"emotionalArc":["string"],"hookStrength":0,"ctaStrength":0,"tone":"${request.tone}"}
}` }],
      temperature: 0.8,
      maxTokens: 4096,
      responseFormat: 'json',
    });

    CostTracker.getInstance().trackLLMUsage({
      userId: 'system', projectId: null, pipelineId: null,
      agentId: this.agentId, providerId: llm.id, model: response.model, tokens: response.usage,
    });

    onProgress(80, 'Parsing script package');

    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(response.content); } catch { throw new Error('Script Planner LLM returned invalid JSON'); }

    const pkg: ScriptPackage = {
      id: generateId(ID_PREFIXES.step),
      contentIdeaId: idea.id,
      contentPlanId: planning.id,
      hook: (parsed.hook as ScriptPackage['hook']) ?? { text: '', type: 'question', estimatedAttentionGrab: 50 },
      story: (parsed.story as ScriptPackage['story']) ?? { text: '', structure: 'problem_solution', keyPoints: [] },
      cta: (parsed.cta as ScriptPackage['cta']) ?? { text: '', type: 'subscribe', placement: 'end' },
      fullNarration: (parsed.fullNarration as string) ?? '',
      scenes: ((parsed.scenes as ScriptPackage['scenes']) ?? []).map((s, i) => ({
        id: s.id ?? `scene-${i + 1}`,
        order: s.order ?? i + 1,
        narration: s.narration ?? '',
        visualNotes: s.visualNotes ?? '',
        cameraAngle: s.cameraAngle ?? 'medium',
        cameraMovement: s.cameraMovement ?? 'static',
        emotion: s.emotion ?? 'neutral',
        duration: s.duration ?? Math.round(duration / sceneCount),
        transition: s.transition ?? 'cut',
      })),
      metadata: (parsed.metadata as ScriptPackage['metadata']) ?? {
        wordCount: 0, estimatedDuration: duration, readabilityScore: 75,
        emotionalArc: [], hookStrength: 75, ctaStrength: 75, tone: request.tone,
      },
    };

    onProgress(100, 'Script package complete');
    log.info('Script package created', { title: idea.title, sceneCount: pkg.scenes.length, wordCount: pkg.metadata.wordCount });
    return pkg;
  }
}
