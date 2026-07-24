// ============================================================
// CreatorAI Studio — Director Engine Unit Tests
// ============================================================

import { DirectorPlanner } from '../director/director-planner';
import { DirectorValidator } from '../director/director-validator';
import { DirectorMemoryStore } from '../director/director-memory';
import type { ScriptPackage } from '../types/automation.types';

// ── Mock ScriptPackage ──

function createMockScript(overrides?: Partial<ScriptPackage>): ScriptPackage {
  return {
    id: 'script-001',
    contentIdeaId: 'idea-001',
    contentPlanId: 'plan-001',
    hook: { text: 'Test hook', type: 'bold_claim', estimatedAttentionGrab: 85 },
    story: { text: 'Test story', structure: 'problem_solution', keyPoints: ['point1'] },
    cta: { text: 'Subscribe now', type: 'subscribe', placement: 'end' },
    fullNarration: 'Full narration text about motivation and success.',
    scenes: [
      { id: 'scene-1', order: 1, narration: 'Opening hook narration', visualNotes: 'Dramatic studio reveal shot', cameraAngle: 'low', cameraMovement: 'dolly_in', emotion: 'curiosity', duration: 6, transition: 'fade' },
      { id: 'scene-2', order: 2, narration: 'Building the story', visualNotes: 'City street walking shot', cameraAngle: 'medium', cameraMovement: 'tracking', emotion: 'determination', duration: 7, transition: 'cut' },
      { id: 'scene-3', order: 3, narration: 'The climax moment', visualNotes: 'Mountain peak sunrise', cameraAngle: 'wide', cameraMovement: 'crane_up', emotion: 'inspiration', duration: 7, transition: 'cut' },
      { id: 'scene-4', order: 4, narration: 'Resolution', visualNotes: 'Walking into sunset', cameraAngle: 'wide', cameraMovement: 'pull_back', emotion: 'hope', duration: 6, transition: 'cut' },
      { id: 'scene-5', order: 5, narration: 'Subscribe and follow', visualNotes: 'CTA subscribe button', cameraAngle: 'medium', cameraMovement: 'zoom_in', emotion: 'excitement', duration: 4, transition: 'fade' },
    ],
    metadata: {
      wordCount: 50,
      estimatedDuration: 30,
      readabilityScore: 85,
      emotionalArc: ['curiosity', 'determination', 'inspiration', 'hope', 'excitement'],
      hookStrength: 90,
      ctaStrength: 85,
      tone: 'motivational',
    },
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════

describe('DirectorPlanner', () => {
  test('generates a valid plan from a script', () => {
    const script = createMockScript();
    const plan = DirectorPlanner.plan(script, 'Why Winners Never Quit');

    expect(plan).toBeDefined();
    expect(plan.id).toBeTruthy();
    expect(plan.scenes).toHaveLength(5);
    expect(plan.metadata.totalDuration).toBe(30);
    expect(plan.metadata.sceneCount).toBe(5);
  });

  test('detects automotive category', () => {
    const script = createMockScript({
      fullNarration: 'The Kawasaki Ninja 300 motorcycle has a powerful engine and great ride quality.',
    });
    const category = DirectorPlanner.detectCategory('Kawasaki Ninja 300', script);
    expect(category).toBe('automotive');
  });

  test('detects motivational category', () => {
    const script = createMockScript({
      fullNarration: 'Never give up. Success requires discipline and motivation.',
    });
    const category = DirectorPlanner.detectCategory('Why Winners Never Quit', script);
    expect(category).toBe('motivational');
  });

  test('detects technology category', () => {
    const script = createMockScript({
      fullNarration: 'Artificial intelligence and machine learning are transforming technology.',
    });
    const category = DirectorPlanner.detectCategory('AI Revolution', script);
    expect(category).toBe('technology');
  });

  test('assigns correct scene importance', () => {
    const script = createMockScript();
    const plan = DirectorPlanner.plan(script);

    expect(plan.scenes[0]!.sceneImportance).toBe('hook');
    expect(plan.scenes[4]!.sceneImportance).toBe('cta');
    // Middle scene should be climax
    expect(plan.scenes[2]!.sceneImportance).toBe('climax');
  });

  test('selects a thumbnail candidate', () => {
    const script = createMockScript();
    const plan = DirectorPlanner.plan(script);

    const thumbnailScenes = plan.scenes.filter((s) => s.thumbnailCandidate);
    expect(thumbnailScenes).toHaveLength(1);
    expect(thumbnailScenes[0]!.thumbnailReason).toBeTruthy();
  });

  test('harmonizes transitions', () => {
    const script = createMockScript();
    const plan = DirectorPlanner.plan(script);

    // First scene fades in
    expect(plan.scenes[0]!.transitionIn).toBe('fade');
    // Last scene fades out
    expect(plan.scenes[4]!.transitionOut).toBe('fade');
  });

  test('every scene has all required fields', () => {
    const script = createMockScript();
    const plan = DirectorPlanner.plan(script);

    for (const scene of plan.scenes) {
      expect(scene.sceneId).toBeTruthy();
      expect(scene.cameraStyle).toBeTruthy();
      expect(scene.lens).toBeTruthy();
      expect(scene.cameraMovement).toBeTruthy();
      expect(scene.environment).toBeTruthy();
      expect(scene.lighting).toBeTruthy();
      expect(scene.colorGrading).toBeTruthy();
      expect(scene.sceneGoal).toBeTruthy();
      expect(scene.narrationStyle).toBeTruthy();
      expect(scene.visualEffects.length).toBeGreaterThan(0);
      expect(scene.sceneDuration).toBeGreaterThan(0);
    }
  });

  test('generates color palette', () => {
    const script = createMockScript();
    const plan = DirectorPlanner.plan(script);

    expect(plan.colorPalette.length).toBeGreaterThan(0);
    expect(plan.colorPalette[0]).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe('DirectorValidator', () => {
  test('validates a correct plan', () => {
    const script = createMockScript();
    const plan = DirectorPlanner.plan(script);
    const result = DirectorValidator.validate(plan);

    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.errors).toHaveLength(0);
  });

  test('catches missing scenes', () => {
    const script = createMockScript();
    const plan = DirectorPlanner.plan(script);
    plan.scenes = [];
    const result = DirectorValidator.validate(plan);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('no scenes'))).toBe(true);
  });

  test('catches duplicate scene IDs', () => {
    const script = createMockScript();
    const plan = DirectorPlanner.plan(script);
    plan.scenes[1]!.sceneId = plan.scenes[0]!.sceneId;
    const result = DirectorValidator.validate(plan);

    expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
  });

  test('validates single scene', () => {
    const script = createMockScript();
    const plan = DirectorPlanner.plan(script);
    const result = DirectorValidator.validateScene(plan.scenes[0]!);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('DirectorMemoryStore', () => {
  beforeEach(() => {
    DirectorMemoryStore.resetInstance();
  });

  test('records and retrieves entries', () => {
    const store = DirectorMemoryStore.getInstance();
    store.record({
      topic: 'Kawasaki Ninja 300',
      planId: 'plan-001',
      decisions: {
        preset: 'automotive',
        colorGrading: 'teal_orange',
        pacing: 'dynamic',
        cameraStyles: ['tracking', 'orbit'],
        lighting: ['golden_hour', 'dramatic'],
      },
    });

    expect(store.size).toBe(1);
    expect(store.getAll()[0]!.topic).toBe('Kawasaki Ninja 300');
  });

  test('finds similar topics', () => {
    const store = DirectorMemoryStore.getInstance();
    store.record({
      topic: 'Kawasaki Ninja 300 motorcycle review',
      planId: 'plan-001',
      decisions: { preset: 'automotive', colorGrading: 'teal_orange', pacing: 'dynamic', cameraStyles: ['tracking'], lighting: ['golden_hour'] },
    });
    store.record({
      topic: 'Python programming tutorial',
      planId: 'plan-002',
      decisions: { preset: 'technology', colorGrading: 'cold', pacing: 'medium', cameraStyles: ['static'], lighting: ['studio'] },
    });

    const similar = store.findSimilar('Kawasaki Ninja bike');
    expect(similar.length).toBeGreaterThan(0);
    expect(similar[0]!.topic).toContain('Kawasaki');
  });

  test('updates performance metrics', () => {
    const store = DirectorMemoryStore.getInstance();
    store.record({
      topic: 'Test',
      planId: 'plan-001',
      decisions: { preset: 'cinematic', colorGrading: 'cinematic', pacing: 'dynamic', cameraStyles: [], lighting: [] },
    });

    store.updatePerformance('plan-001', { qualityScore: 95, viewCount: 10000 });

    const entry = store.getAll()[0]!;
    expect(entry.performance.qualityScore).toBe(95);
    expect(entry.performance.viewCount).toBe(10000);
  });
});
