// ============================================================
// CreatorAI Studio — Storyboard Engine Unit Tests
// ============================================================

import { StoryboardPlanner } from '../storyboard/storyboard-planner';
import { StoryboardValidator } from '../storyboard/storyboard-validator';
import { StoryboardExporter } from '../storyboard/storyboard-exporter';
import { StoryboardMemory } from '../storyboard/storyboard-memory';
import type { DirectorPlan, DirectorScenePlan } from '../director/director.types';

function createMockDirectorPlan(): DirectorPlan {
  const scenes: DirectorScenePlan[] = [
    { sceneId: 'scene-1', sceneOrder: 1, sceneGoal: 'Hook', sceneEmotion: 'excitement', sceneImportance: 'hook', sceneDuration: 8, narration: 'Opening hook narration text', cameraStyle: 'hero_shot', lens: '35mm', cameraMovement: 'dolly_in', subjectPosition: 'center', shotDescription: 'Hero shot with 35mm', environment: 'studio', weather: 'clear', timeOfDay: 'night', environmentDetails: 'Dramatic studio reveal of green Kawasaki Ninja 300 motorcycle', lighting: 'dramatic', lightingIntensity: 'high', lightingDirection: 'front-side 45°', shadowStyle: 'dramatic', visualEffects: ['depth_of_field', 'bloom', 'lens_flare'], motionStyle: 'static_pose', colorGrading: 'teal_orange', motionIntensity: 'moderate', transitionIn: 'fade', transitionOut: 'cut', musicMood: 'excitement', narrationStyle: 'energetic', thumbnailCandidate: false, thumbnailReason: '', promptOverride: null },
    { sceneId: 'scene-2', sceneOrder: 2, sceneGoal: 'Build', sceneEmotion: 'determination', sceneImportance: 'buildup', sceneDuration: 10, narration: 'Engine performance narration', cameraStyle: 'push', lens: 'macro', cameraMovement: 'push_in', subjectPosition: 'center', shotDescription: 'Push in macro', environment: 'highway', weather: 'clear', timeOfDay: 'midday', environmentDetails: 'Close-up of motorcycle engine details, exhaust pipes', lighting: 'rim_light', lightingIntensity: 'medium', lightingDirection: 'side', shadowStyle: 'hard', visualEffects: ['depth_of_field', 'bokeh'], motionStyle: 'driving', colorGrading: 'teal_orange', motionIntensity: 'dynamic', transitionIn: 'cut', transitionOut: 'cut', musicMood: 'determination', narrationStyle: 'authoritative', thumbnailCandidate: false, thumbnailReason: '', promptOverride: null },
    { sceneId: 'scene-3', sceneOrder: 3, sceneGoal: 'Climax', sceneEmotion: 'inspiration', sceneImportance: 'climax', sceneDuration: 10, narration: 'Mountain cornering narration', cameraStyle: 'drone', lens: '24mm', cameraMovement: 'crane_up', subjectPosition: 'center', shotDescription: 'Drone aerial', environment: 'mountains', weather: 'clear', timeOfDay: 'golden_hour', environmentDetails: 'Motorcycle cornering on mountain road at golden hour sunset', lighting: 'golden_hour', lightingIntensity: 'high', lightingDirection: 'natural', shadowStyle: 'soft', visualEffects: ['god_rays', 'lens_flare', 'depth_of_field'], motionStyle: 'driving', colorGrading: 'teal_orange', motionIntensity: 'dynamic', transitionIn: 'cut', transitionOut: 'cut', musicMood: 'inspiration', narrationStyle: 'inspirational', thumbnailCandidate: true, thumbnailReason: 'Peak visual impact', promptOverride: null },
    { sceneId: 'scene-4', sceneOrder: 4, sceneGoal: 'CTA', sceneEmotion: 'excitement', sceneImportance: 'cta', sceneDuration: 7, narration: 'Subscribe and follow CTA', cameraStyle: 'dolly', lens: '50mm', cameraMovement: 'pull_back', subjectPosition: 'center', shotDescription: 'Dolly pull back', environment: 'countryside', weather: 'clear', timeOfDay: 'sunset', environmentDetails: 'Motorcycle parked at sunset, rider walking away', lighting: 'sunset' as any, lightingIntensity: 'medium', lightingDirection: 'behind', shadowStyle: 'soft', visualEffects: ['god_rays', 'depth_of_field'], motionStyle: 'walking', colorGrading: 'teal_orange', motionIntensity: 'subtle', transitionIn: 'cut', transitionOut: 'fade', musicMood: 'excitement', narrationStyle: 'energetic', thumbnailCandidate: false, thumbnailReason: '', promptOverride: null },
  ];

  return {
    id: 'plan-001',
    scriptId: 'script-001',
    title: 'Kawasaki Ninja 300',
    globalStyle: 'premium automotive commercial',
    globalColorGrading: 'teal_orange',
    globalMood: 'energetic',
    globalPacing: 'dynamic',
    targetAudience: 'bike enthusiasts',
    scenes,
    consistencyNotes: 'Maintain teal/orange grading throughout',
    characterDescription: 'motorcycle rider in full gear',
    recurringElements: ['green Kawasaki Ninja 300', 'cinematic lighting'],
    colorPalette: ['#00CED1', '#FF6347', '#1a2a3a', '#FFA07A'],
    metadata: { totalDuration: 35, sceneCount: 4, thumbnailSceneIndex: 2, generatedAt: new Date().toISOString(), model: 'test', processingTimeMs: 5 },
  };
}

// ═══════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════

describe('StoryboardPlanner', () => {
  test('generates a storyboard from a director plan', () => {
    const plan = createMockDirectorPlan();
    const sb = StoryboardPlanner.plan(plan);

    expect(sb).toBeDefined();
    expect(sb.id).toBeTruthy();
    expect(sb.frames).toHaveLength(4);
    expect(sb.metadata.totalDuration).toBe(35);
  });

  test('every frame has complete composition', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    for (const frame of sb.frames) {
      expect(frame.composition.foreground).toBeTruthy();
      expect(frame.composition.midground).toBeTruthy();
      expect(frame.composition.background).toBeTruthy();
      expect(frame.composition.mainSubject).toBeTruthy();
      expect(frame.composition.depthLayout).toBeTruthy();
      expect(frame.composition.ruleOfThirdsPosition).toBeTruthy();
      expect(frame.composition.eyeFocusPoint).toBeTruthy();
    }
  });

  test('every frame has complete camera info', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    for (const frame of sb.frames) {
      expect(frame.camera.position).toBeTruthy();
      expect(frame.camera.height).toBeTruthy();
      expect(frame.camera.distance).toBeTruthy();
      expect(frame.camera.path).toBeTruthy();
      expect(frame.camera.direction).toBeTruthy();
      expect(frame.camera.lens).toBeTruthy();
      expect(frame.camera.fov).toBeTruthy();
    }
  });

  test('every frame has motion plan', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    for (const frame of sb.frames) {
      expect(frame.motion.subjectMotion).toBeTruthy();
      expect(frame.motion.cameraMotion).toBeTruthy();
      expect(frame.motion.motionSpeed).toBeTruthy();
    }
  });

  test('timing is sequential and continuous', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    let expectedStart = 0;
    for (const frame of sb.frames) {
      expect(frame.timing.startTimeSec).toBeCloseTo(expectedStart, 1);
      expect(frame.timing.endTimeSec).toBeGreaterThan(frame.timing.startTimeSec);
      expect(frame.timing.durationSec).toBe(frame.expectedDuration);
      expectedStart = frame.timing.endTimeSec;
    }
  });

  test('every frame has image and video prompts', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    for (const frame of sb.frames) {
      expect(frame.prompts.imagePrompt.length).toBeGreaterThan(50);
      expect(frame.prompts.videoPrompt.length).toBeGreaterThan(50);
      expect(frame.prompts.negativePrompt.length).toBeGreaterThan(20);
      expect(frame.prompts.thumbnailPrompt.length).toBeGreaterThan(20);
      expect(frame.prompts.prompt3D.length).toBeGreaterThan(10);
      expect(frame.prompts.animationPrompt.length).toBeGreaterThan(10);
    }
  });

  test('provider hints cover major providers', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    const hints = sb.frames[0]!.prompts.providerHints;
    expect(hints.flux).toBeTruthy();
    expect(hints.runway).toBeTruthy();
    expect(hints.veo).toBeTruthy();
    expect(hints.kling).toBeTruthy();
    expect(hints.luma).toBeTruthy();
    expect(hints.pika).toBeTruthy();
    expect(hints.seedance).toBeTruthy();
    expect(hints.hunyuan).toBeTruthy();
  });

  test('continuity notes reference adjacent scenes', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    for (const frame of sb.frames) {
      expect(frame.continuity.character).toBeTruthy();
      expect(frame.continuity.lighting).toBeTruthy();
      expect(frame.continuity.colorGrading).toBeTruthy();
    }
  });

  test('assets detect vehicles from environment details', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    const frame1 = sb.frames[0]!;
    expect(frame1.assets.vehicles.length).toBeGreaterThan(0);
  });

  test('thumbnail candidate is preserved', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    const thumbFrames = sb.frames.filter((f) => f.thumbnailCandidate);
    expect(thumbFrames.length).toBeGreaterThanOrEqual(1);
  });
});

describe('StoryboardValidator', () => {
  test('validates a correct storyboard', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    const result = StoryboardValidator.validate(sb);
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.errors).toHaveLength(0);
  });

  test('detects empty storyboard', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    sb.frames = [];
    const result = StoryboardValidator.validate(sb);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('No frames'))).toBe(true);
  });
});

describe('StoryboardExporter', () => {
  test('exports all formats', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    const exported = StoryboardExporter.export(sb, 'automotive', 'dynamic');

    expect(exported.storyboardJson).toBe(sb);
    expect(exported.timelineJson.frames).toHaveLength(4);
    expect(exported.promptPackage.imagePrompts).toHaveLength(4);
    expect(exported.promptPackage.videoPrompts).toHaveLength(4);
    expect(exported.previewPackage.frames).toHaveLength(4);
    expect(exported.directorPackage.category).toBe('automotive');
  });

  test('timeline has correct total duration', () => {
    const sb = StoryboardPlanner.plan(createMockDirectorPlan());
    const exported = StoryboardExporter.export(sb);
    expect(exported.timelineJson.totalDuration).toBe(35);
  });
});

describe('StoryboardMemory', () => {
  beforeEach(() => StoryboardMemory.resetInstance());

  test('records entries', () => {
    const mem = StoryboardMemory.getInstance();
    mem.record({ title: 'Test', storyboardId: 'sb-1', frameCount: 5, category: 'auto', style: 'cinematic' });
    expect(mem.size).toBe(1);
  });

  test('updates quality score', () => {
    const mem = StoryboardMemory.getInstance();
    mem.record({ title: 'Test', storyboardId: 'sb-1', frameCount: 5, category: 'auto', style: 'cinematic' });
    mem.updateQuality('sb-1', 95);
    expect(mem.getAll()[0]!.qualityScore).toBe(95);
  });
});
