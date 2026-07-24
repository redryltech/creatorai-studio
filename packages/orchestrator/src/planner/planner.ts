// ============================================================
// CreatorAI Studio — Workflow Planner
// ============================================================
// The Planner receives a ParsedIntent and produces a WorkflowPlan.
// It decides WHICH agents are needed, in WHAT order, with WHAT
// inputs, and estimates cost + duration.
//
// The Planner NEVER executes anything. It only produces a plan.
//
// Architecture:
// - Each IntentAction has a PlanStrategy that builds the DAG
// - PlanStrategies are registered in a map (Strategy Pattern)
// - Adding a new action = adding a new strategy function
// - The Planner handles topological sorting and parallel grouping
// ============================================================

import { AgentId, generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { ParsedIntent } from '../intent/intent.types';
import { IntentAction } from '../intent/intent.types';
import type { WorkflowPlan, WorkflowNode } from './workflow.types';

const log = Logger.for('Planner');

/**
 * A PlanStrategy produces the list of nodes for a given intent.
 * It does NOT resolve execution order — the Planner does that
 * from the dependency graph.
 */
type PlanStrategy = (intent: ParsedIntent, itemIndex: number) => WorkflowNode[];

/**
 * Registry of plan strategies keyed by IntentAction.
 */
const STRATEGIES: Map<IntentAction, PlanStrategy> = new Map();

// ---- Strategy Registration ----

/**
 * Full video creation pipeline.
 * Script → Prompt → [Image + Voice] (parallel) → SEO
 * The EditorAgent (video composition) will be added in Phase 5.
 */
STRATEGIES.set(IntentAction.CREATE_VIDEO, (intent, idx) => {
  const prefix = `item-${idx}`;
  const e = intent.entities;

  return [
    {
      id: `${prefix}-script`,
      agentId: AgentId.SCRIPT,
      label: `Write script #${idx + 1}`,
      dependsOn: [],
      inputMapping: {
        topic:          { source: 'intent', key: 'topic' },
        contentType:    { source: 'intent', key: 'contentType', fallback: 'faceless' },
        targetPlatform: { source: 'intent', key: 'platform', fallback: 'youtube_shorts' },
        duration:       { source: 'intent', key: 'duration' },
        style:          { source: 'intent', key: 'style', fallback: 'hook_story_cta' },
        tone:           { source: 'intent', key: 'tone', fallback: 'professional' },
        language:       { source: 'intent', key: 'language', fallback: 'en' },
      },
      retry: { maxAttempts: 2, backoffMs: 3000 },
      timeoutMs: 60000,
      expectedArtifacts: ['script'],
      estimatedCostUsd: 0.03,
      estimatedDurationSec: 15,
      optional: false,
      priority: 0,
    },
    {
      id: `${prefix}-prompt`,
      agentId: AgentId.PROMPT,
      label: `Generate image prompts #${idx + 1}`,
      dependsOn: [`${prefix}-script`],
      inputMapping: {
        scenes:     { source: 'artifact', key: `${prefix}-script.scenes` },
        artStyle:   { source: 'intent', key: 'artStyle', fallback: 'cinematic' },
        aspectRatio: { source: 'static', key: '9:16' },
        targetModel: { source: 'static', key: 'flux' },
        characterConsistency: { source: 'static', key: 'true' },
      },
      retry: { maxAttempts: 2, backoffMs: 3000 },
      timeoutMs: 45000,
      expectedArtifacts: ['scene_prompts'],
      estimatedCostUsd: 0.02,
      estimatedDurationSec: 10,
      optional: false,
      priority: 0,
    },
    {
      id: `${prefix}-image`,
      agentId: AgentId.IMAGE,
      label: `Generate images #${idx + 1}`,
      dependsOn: [`${prefix}-prompt`],
      inputMapping: {
        scenePrompts: { source: 'artifact', key: `${prefix}-prompt.scenePrompts` },
      },
      retry: { maxAttempts: 3, backoffMs: 5000 },
      timeoutMs: 300000,  // 5 minutes — image gen can be slow
      expectedArtifacts: ['images'],
      estimatedCostUsd: 0.35, // ~7 scenes × $0.05/image
      estimatedDurationSec: 45,
      optional: false,
      priority: 0,
    },
    {
      id: `${prefix}-voice`,
      agentId: AgentId.VOICE,
      label: `Generate voiceover #${idx + 1}`,
      dependsOn: [`${prefix}-script`], // Parallel with image gen
      inputMapping: {
        scenes:   { source: 'artifact', key: `${prefix}-script.scenes` },
        voiceId:  { source: 'intent', key: 'voiceId', fallback: 'adam' },
        language: { source: 'intent', key: 'language', fallback: 'en' },
      },
      retry: { maxAttempts: 2, backoffMs: 3000 },
      timeoutMs: 120000,
      expectedArtifacts: ['voiceovers'],
      estimatedCostUsd: 0.10,
      estimatedDurationSec: 25,
      optional: false,
      priority: 0,
    },
    // Video composition — depends on BOTH images and voiceovers
    {
      id: `${prefix}-editor`,
      agentId: AgentId.EDITOR,
      label: `Compose video #${idx + 1}`,
      dependsOn: [`${prefix}-image`, `${prefix}-voice`],
      inputMapping: {
        projectId:  { source: 'context', key: 'projectId' },
        userId:     { source: 'context', key: 'userId' },
        scenes:     { source: 'artifact', key: `${prefix}-script.scenes` },
        images:     { source: 'artifact', key: `${prefix}-image.images` },
        voiceovers: { source: 'artifact', key: `${prefix}-voice.voiceovers` },
        settings:   { source: 'static', key: JSON.stringify({ width: 1080, height: 1920, fps: 30, format: 'mp4', codec: 'h264' }) },
        subtitles:  { source: 'static', key: JSON.stringify({ enabled: true, fontSize: 48, fontColor: '#FFFFFF', strokeColor: '#000000', position: 'bottom' }) },
        music:      { source: 'static', key: JSON.stringify({ enabled: false, volume: 0.15 }) },
        transition: { source: 'static', key: JSON.stringify({ type: 'crossfade', durationSec: 0.5 }) },
      },
      retry: { maxAttempts: 2, backoffMs: 5000 },
      timeoutMs: 600000, // 10 minutes — video composition is slow
      expectedArtifacts: ['composed_video'],
      estimatedCostUsd: 0,
      estimatedDurationSec: 45,
      optional: false,
      priority: 0,
    },
    // SEO runs in parallel with image+voice+editor (depends only on script)
    {
      id: `${prefix}-seo`,
      agentId: AgentId.SEO,
      label: `Generate SEO metadata #${idx + 1}`,
      dependsOn: [`${prefix}-script`],
      inputMapping: {
        topic:    { source: 'intent', key: 'topic' },
        platform: { source: 'intent', key: 'platform', fallback: 'youtube_shorts' },
        script:   { source: 'artifact', key: `${prefix}-script.fullText` },
        language: { source: 'intent', key: 'language', fallback: 'en' },
      },
      retry: { maxAttempts: 2, backoffMs: 2000 },
      timeoutMs: 30000,
      expectedArtifacts: ['seo_metadata'],
      estimatedCostUsd: 0.01,
      estimatedDurationSec: 8,
      optional: true,
      priority: 1,
    },
  ];
});

STRATEGIES.set(IntentAction.GENERATE_SCRIPT, (intent, idx) => {
  return [{
    id: `item-${idx}-script`,
    agentId: AgentId.SCRIPT,
    label: 'Write script',
    dependsOn: [],
    inputMapping: {
      topic:          { source: 'intent', key: 'topic' },
      contentType:    { source: 'intent', key: 'contentType', fallback: 'faceless' },
      targetPlatform: { source: 'intent', key: 'platform', fallback: 'youtube_shorts' },
      duration:       { source: 'intent', key: 'duration' },
      style:          { source: 'intent', key: 'style', fallback: 'hook_story_cta' },
      tone:           { source: 'intent', key: 'tone', fallback: 'professional' },
      language:       { source: 'intent', key: 'language', fallback: 'en' },
    },
    retry: { maxAttempts: 2, backoffMs: 3000 },
    timeoutMs: 60000,
    expectedArtifacts: ['script'],
    estimatedCostUsd: 0.03,
    estimatedDurationSec: 15,
    optional: false,
    priority: 0,
  }];
});

STRATEGIES.set(IntentAction.GENERATE_IMAGE, (intent, idx) => {
  return [{
    id: `item-${idx}-image`,
    agentId: AgentId.IMAGE,
    label: 'Generate image',
    dependsOn: [],
    inputMapping: {
      scenePrompts: { source: 'static', key: 'provided_at_runtime' },
    },
    retry: { maxAttempts: 3, backoffMs: 5000 },
    timeoutMs: 120000,
    expectedArtifacts: ['images'],
    estimatedCostUsd: 0.05,
    estimatedDurationSec: 15,
    optional: false,
    priority: 0,
  }];
});

STRATEGIES.set(IntentAction.GENERATE_VOICEOVER, (intent, idx) => {
  return [{
    id: `item-${idx}-voice`,
    agentId: AgentId.VOICE,
    label: 'Generate voiceover',
    dependsOn: [],
    inputMapping: {
      scenes:   { source: 'static', key: 'provided_at_runtime' },
      voiceId:  { source: 'intent', key: 'voiceId', fallback: 'adam' },
      language: { source: 'intent', key: 'language', fallback: 'en' },
    },
    retry: { maxAttempts: 2, backoffMs: 3000 },
    timeoutMs: 120000,
    expectedArtifacts: ['voiceovers'],
    estimatedCostUsd: 0.10,
    estimatedDurationSec: 20,
    optional: false,
    priority: 0,
  }];
});

// ============================================================
// Planner
// ============================================================

export class Planner {
  /**
   * Build a WorkflowPlan from a ParsedIntent.
   *
   * For batch operations (count > 1), the strategy is invoked
   * once per item, producing independent sub-DAGs that can
   * execute in parallel across items.
   */
  buildPlan(intent: ParsedIntent): WorkflowPlan {
    const strategy = STRATEGIES.get(intent.action);

    if (!strategy) {
      log.warn('No plan strategy for action, returning empty plan', { action: intent.action });
      return this.emptyPlan(intent);
    }

    const count = intent.entities.count;
    const allNodes: WorkflowNode[] = [];

    for (let i = 0; i < count; i++) {
      const itemNodes = strategy(intent, i);
      allNodes.push(...itemNodes);
    }

    // Compute execution order via topological sort
    const executionOrder = this.topologicalSort(allNodes);

    // Identify parallel groups
    const parallelGroups = this.findParallelGroups(allNodes);

    // Aggregate estimates
    const estimatedTotalCostUsd = allNodes.reduce((s, n) => s + n.estimatedCostUsd, 0);
    const estimatedTotalDurationSec = this.estimateTotalDuration(allNodes, parallelGroups);

    const plan: WorkflowPlan = {
      id: generateId(ID_PREFIXES.pipeline),
      name: this.generatePlanName(intent),
      intentAction: intent.action,
      nodes: allNodes,
      parallelGroups,
      executionOrder,
      estimatedTotalCostUsd,
      estimatedTotalDurationSec,
      itemCount: count,
      createdAt: new Date(),
    };

    log.info('Workflow plan created', {
      planId: plan.id,
      action: intent.action,
      nodeCount: allNodes.length,
      itemCount: count,
      estimatedCostUsd: estimatedTotalCostUsd.toFixed(4),
      estimatedDurationSec: estimatedTotalDurationSec,
      parallelGroups: parallelGroups.length,
    });

    return plan;
  }

  /**
   * Topological sort using Kahn's algorithm.
   * Returns node IDs in valid execution order.
   */
  private topologicalSort(nodes: WorkflowNode[]): string[] {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    for (const node of nodes) {
      inDegree.set(node.id, node.dependsOn.length);
      if (!adjacency.has(node.id)) adjacency.set(node.id, []);
      for (const dep of node.dependsOn) {
        if (!adjacency.has(dep)) adjacency.set(dep, []);
        adjacency.get(dep)!.push(node.id);
      }
    }

    const queue: string[] = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id);
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      // Sort by priority within the queue
      queue.sort((a, b) => {
        const na = nodes.find((n) => n.id === a);
        const nb = nodes.find((n) => n.id === b);
        return (na?.priority ?? 0) - (nb?.priority ?? 0);
      });

      const current = queue.shift()!;
      sorted.push(current);

      for (const neighbor of (adjacency.get(current) ?? [])) {
        const degree = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, degree);
        if (degree === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Cycle detection
    if (sorted.length !== nodes.length) {
      const missing = nodes.filter((n) => !sorted.includes(n.id)).map((n) => n.id);
      throw new Error(`Workflow DAG has cycles involving nodes: ${missing.join(', ')}`);
    }

    return sorted;
  }

  /**
   * Find groups of nodes that can execute in parallel.
   * Two nodes can be parallel if neither depends on the other.
   */
  private findParallelGroups(nodes: WorkflowNode[]): string[][] {
    // Group by "depth" in the DAG (max distance from any root)
    const depth = new Map<string, number>();
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const getDepth = (id: string): number => {
      if (depth.has(id)) return depth.get(id)!;
      const node = nodeMap.get(id);
      if (!node || node.dependsOn.length === 0) {
        depth.set(id, 0);
        return 0;
      }
      const maxDepParent = Math.max(...node.dependsOn.map((d) => getDepth(d)));
      const d = maxDepParent + 1;
      depth.set(id, d);
      return d;
    };

    for (const node of nodes) getDepth(node.id);

    // Group by depth level
    const levels = new Map<number, string[]>();
    for (const [id, d] of depth) {
      if (!levels.has(d)) levels.set(d, []);
      levels.get(d)!.push(id);
    }

    // Only return groups with more than one node (actual parallelism)
    return Array.from(levels.values()).filter((g) => g.length > 1);
  }

  /**
   * Estimate total wall-clock duration considering parallelism.
   * For each depth level, take the max duration (parallel nodes overlap).
   */
  private estimateTotalDuration(nodes: WorkflowNode[], parallelGroups: string[][]): number {
    if (nodes.length === 0) return 0;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const depth = new Map<string, number>();

    const getDepth = (id: string): number => {
      if (depth.has(id)) return depth.get(id)!;
      const node = nodeMap.get(id);
      if (!node || node.dependsOn.length === 0) { depth.set(id, 0); return 0; }
      const d = Math.max(...node.dependsOn.map((dep) => getDepth(dep))) + 1;
      depth.set(id, d);
      return d;
    };
    for (const n of nodes) getDepth(n.id);

    const levels = new Map<number, WorkflowNode[]>();
    for (const node of nodes) {
      const d = depth.get(node.id) ?? 0;
      if (!levels.has(d)) levels.set(d, []);
      levels.get(d)!.push(node);
    }

    let total = 0;
    for (const [, levelNodes] of levels) {
      total += Math.max(...levelNodes.map((n) => n.estimatedDurationSec));
    }

    return total;
  }

  private generatePlanName(intent: ParsedIntent): string {
    const topic = intent.entities.topic ?? 'content';
    const count = intent.entities.count;
    const platform = intent.entities.platform ?? '';
    return `${intent.action}: ${count}x "${topic}" ${platform}`.trim();
  }

  private emptyPlan(intent: ParsedIntent): WorkflowPlan {
    return {
      id: generateId(ID_PREFIXES.pipeline),
      name: `${intent.action}: no plan`,
      intentAction: intent.action,
      nodes: [],
      parallelGroups: [],
      executionOrder: [],
      estimatedTotalCostUsd: 0,
      estimatedTotalDurationSec: 0,
      itemCount: 0,
      createdAt: new Date(),
    };
  }
}
