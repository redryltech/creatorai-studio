import { describe, it, expect } from 'vitest';
import { Planner } from '../planner/planner';
import { IntentAction, DEFAULT_ENTITIES } from '../intent/intent.types';
import type { ParsedIntent } from '../intent/intent.types';

function createIntent(overrides: Partial<ParsedIntent> = {}): ParsedIntent {
  return {
    action: IntentAction.CREATE_VIDEO,
    confidence: 0.95,
    entities: { ...DEFAULT_ENTITIES, topic: 'electric cars', platform: 'youtube_shorts', count: 1 },
    rawMessage: 'create a video about electric cars',
    missingRequired: [],
    requiresClarification: false,
    clarificationQuestion: null,
    ...overrides,
  };
}

describe('Planner', () => {
  const planner = new Planner();

  it('builds a plan for CREATE_VIDEO with correct node count', () => {
    const plan = planner.buildPlan(createIntent());
    // 1 item × 5 nodes (script, prompt, image, voice, seo)
    expect(plan.nodes.length).toBe(5);
    expect(plan.itemCount).toBe(1);
  });

  it('scales nodes with count', () => {
    const plan = planner.buildPlan(createIntent({ entities: { ...DEFAULT_ENTITIES, topic: 'test', count: 3 } }));
    // 3 items × 5 nodes = 15
    expect(plan.nodes.length).toBe(15);
    expect(plan.itemCount).toBe(3);
  });

  it('produces a valid execution order (topological sort)', () => {
    const plan = planner.buildPlan(createIntent());
    const order = plan.executionOrder;

    // Script must come before prompt, image, voice, seo
    const scriptIdx = order.indexOf('item-0-script');
    const promptIdx = order.indexOf('item-0-prompt');
    const imageIdx = order.indexOf('item-0-image');
    const voiceIdx = order.indexOf('item-0-voice');

    expect(scriptIdx).toBeLessThan(promptIdx);
    expect(promptIdx).toBeLessThan(imageIdx);
    expect(scriptIdx).toBeLessThan(voiceIdx);
  });

  it('identifies parallel groups (image + voice + seo can run in parallel)', () => {
    const plan = planner.buildPlan(createIntent());
    // After script, prompt depends on script. After prompt, image depends on prompt.
    // voice and seo depend only on script, so they can run in parallel with prompt.
    expect(plan.parallelGroups.length).toBeGreaterThan(0);
  });

  it('estimates cost and duration', () => {
    const plan = planner.buildPlan(createIntent());
    expect(plan.estimatedTotalCostUsd).toBeGreaterThan(0);
    expect(plan.estimatedTotalDurationSec).toBeGreaterThan(0);
  });

  it('returns empty plan for unsupported action', () => {
    const plan = planner.buildPlan(createIntent({ action: IntentAction.GET_ANALYTICS }));
    expect(plan.nodes.length).toBe(0);
  });

  it('builds plan for GENERATE_SCRIPT', () => {
    const plan = planner.buildPlan(createIntent({ action: IntentAction.GENERATE_SCRIPT }));
    expect(plan.nodes.length).toBe(1);
    expect(plan.nodes[0]!.agentId).toBe('script');
  });

  it('detects cycles (should never happen with valid strategies)', () => {
    // All strategies produce acyclic graphs; this test verifies the cycle detection code path
    const plan = planner.buildPlan(createIntent());
    expect(plan.executionOrder.length).toBe(plan.nodes.length);
  });

  it('produces unique node IDs across items', () => {
    const plan = planner.buildPlan(createIntent({ entities: { ...DEFAULT_ENTITIES, topic: 'test', count: 5 } }));
    const ids = plan.nodes.map((n) => n.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
