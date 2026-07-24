// ============================================================
// CreatorAI Studio — Character Consistency Engine Unit Tests
// ============================================================

import { CharacterPlanner } from '../character/character-planner';
import { CharacterValidator } from '../character/character-validator';
import { CharacterProfileManager } from '../character/character-profile-manager';
import { SeedManager } from '../character/seed-manager';
import { IdentityResolver } from '../character/identity-resolver';
import { ContinuityEngine } from '../character/continuity-engine';
import { CharacterMemory } from '../character/character-memory';
import type { Storyboard, StoryboardFrame } from '../storyboard/storyboard.types';

function mockFrame(order: number, overrides?: Partial<StoryboardFrame>): StoryboardFrame {
  return {
    frameId: `frame-${order}`, sceneId: `scene-${order}`, sceneOrder: order, shotNumber: order,
    frameDescription: `Scene ${order}: Kawasaki Ninja 300 motorcycle rider on highway`,
    framePurpose: 'Test', sceneSummary: `Scene ${order}`, visualGoal: 'Test',
    narrationText: 'The rider accelerates on the green Kawasaki Ninja 300 sport bike',
    expectedDuration: 8, thumbnailCandidate: order === 2,
    composition: {
      foreground: 'Green motorcycle', midground: 'Road', background: 'Mountains',
      mainSubject: 'Kawasaki Ninja 300 motorcycle', supportingObjects: ['helmet', 'exhaust'],
      depthLayout: 'medium', leadingLines: 'Road', negativeSpace: 'balanced',
      ruleOfThirdsPosition: 'center', eyeFocusPoint: 'Center',
    },
    camera: { position: 'eye_level', height: 'medium', distance: 'medium', path: 'Tracking', direction: 'Forward', rotation: 'level', lens: '35mm', fov: 'wide' },
    motion: { subjectMotion: 'driving', cameraMotion: 'tracking', backgroundMotion: 'Parallax', objectMotion: 'Minimal', particleMotion: 'None', motionSpeed: 'fast' },
    timing: { startTimeSec: (order - 1) * 8, endTimeSec: order * 8, durationSec: 8, animationCurve: 'ease_in_out', transitionInSec: 0.5, transitionOutSec: 0.5 },
    assets: { characters: ['Motorcycle rider'], vehicles: ['kawasaki', 'ninja'], buildings: [], environmentAssets: [], props: ['helmet'], logos: [], brandAssets: [], soundEffects: ['Engine sound'] },
    style: { artStyle: 'cinematic', renderingStyle: 'cinematic', qualityTarget: '1080p', aspectRatio: '9:16', lightingSummary: 'Golden hour', colorPalette: ['#00CED1', '#FF6347'], mood: 'excitement' },
    continuity: { character: 'Consistent rider', environment: 'Highway', lighting: 'Golden hour', weather: 'Clear', vehicle: 'Same Ninja 300', costume: 'Riding gear', colorGrading: 'teal_orange uniform' },
    prompts: {
      imagePrompt: 'Green Kawasaki Ninja 300 motorcycle on highway, rider in black leather jacket and AGV helmet, golden hour lighting, cinematic',
      videoPrompt: 'Green Kawasaki Ninja 300 riding on highway, tracking shot, golden hour',
      thumbnailPrompt: 'Kawasaki Ninja 300 dramatic hero shot', negativePrompt: 'blurry, low quality',
      prompt3D: '3D render', animationPrompt: 'Animation', styleSuffix: 'cinematic',
      providerHints: { flux: 'test', runway: 'test', veo: 'test', kling: 'test', luma: 'test', pika: 'test', seedance: 'test', hunyuan: 'test' },
    },
    ...overrides,
  } as StoryboardFrame;
}

function mockStoryboard(): Storyboard {
  return {
    id: 'sb-001', directorPlanId: 'plan-001', title: 'Kawasaki Ninja 300',
    frames: [mockFrame(1), mockFrame(2), mockFrame(3), mockFrame(4)],
    globalStyle: { artStyle: 'cinematic', renderingStyle: 'cinematic', qualityTarget: '1080p', aspectRatio: '9:16', lightingSummary: 'Golden hour', colorPalette: ['#00CED1'], mood: 'energetic' },
    globalContinuity: { character: 'Rider', environment: 'Highway', lighting: 'Golden hour', weather: 'Clear', vehicle: 'Ninja 300', costume: 'Gear', colorGrading: 'teal_orange' },
    metadata: { totalFrames: 4, totalDuration: 32, thumbnailFrameIndex: 1, aspectRatio: '9:16', resolution: '1080p', generatedAt: new Date().toISOString(), engine: 'test', processingTimeMs: 5 },
  };
}

// ═══════════════════════════════════════════════════════════

describe('SeedManager', () => {
  test('generates deterministic seeds from keys', () => {
    const sm = new SeedManager(42);
    const s1 = sm.entitySeed('bike_001');
    const s2 = sm.entitySeed('bike_001');
    expect(s1).toBe(s2); // Same key → same seed
    expect(s1).toBeGreaterThan(0);
  });

  test('different keys produce different seeds', () => {
    const sm = new SeedManager(42);
    expect(sm.entitySeed('bike_001')).not.toBe(sm.entitySeed('char_001'));
  });

  test('scene seeds vary but are deterministic', () => {
    const sm = new SeedManager(42);
    const s1 = sm.sceneSeed('bike_001', 'scene-1');
    const s2 = sm.sceneSeed('bike_001', 'scene-2');
    expect(s1).not.toBe(s2);
    expect(sm.sceneSeed('bike_001', 'scene-1')).toBe(s1); // Deterministic
  });

  test('generates provider seed maps', () => {
    const sm = new SeedManager(42);
    const map = sm.providerSeedMap('bike_001');
    expect(map.flux).toBeGreaterThan(0);
    expect(map.runway).toBeGreaterThan(0);
    expect(map.veo).toBeGreaterThan(0);
    expect(Object.keys(map).length).toBeGreaterThanOrEqual(10);
  });
});

describe('IdentityResolver', () => {
  test('detects vehicles from storyboard text', () => {
    const sm = new SeedManager(42);
    const resolver = new IdentityResolver(sm);
    const entities = resolver.resolve(mockStoryboard());

    const vehicles = entities.filter((e) => e.category === 'vehicle');
    expect(vehicles.length).toBeGreaterThanOrEqual(1);
    expect(vehicles[0]!.vehicleProfile).toBeTruthy();
    expect(vehicles[0]!.vehicleProfile!.manufacturer).toBe('Kawasaki');
  });

  test('detects humans from storyboard text', () => {
    const sm = new SeedManager(42);
    const resolver = new IdentityResolver(sm);
    const entities = resolver.resolve(mockStoryboard());

    const humans = entities.filter((e) => e.category === 'human');
    expect(humans.length).toBeGreaterThanOrEqual(1);
    expect(humans[0]!.characterProfile).toBeTruthy();
  });

  test('detects props', () => {
    const sm = new SeedManager(42);
    const resolver = new IdentityResolver(sm);
    const entities = resolver.resolve(mockStoryboard());

    const props = entities.filter((e) => e.category === 'prop');
    expect(props.length).toBeGreaterThanOrEqual(1); // helmet
  });

  test('builds identity blocks', () => {
    const sm = new SeedManager(42);
    const resolver = new IdentityResolver(sm);
    const entities = resolver.resolve(mockStoryboard());

    for (const entity of entities) {
      expect(entity.identityBlock).toBeTruthy();
      expect(entity.identityBlock.length).toBeGreaterThan(20);
      expect(entity.identityBlock).toContain(entity.displayName);
    }
  });

  test('assigns scene presence', () => {
    const sm = new SeedManager(42);
    const resolver = new IdentityResolver(sm);
    const entities = resolver.resolve(mockStoryboard());

    for (const entity of entities) {
      expect(entity.scenePresence.length).toBeGreaterThan(0);
    }
  });
});

describe('CharacterPlanner', () => {
  test('builds a complete character database', () => {
    const sb = mockStoryboard();
    const db = CharacterPlanner.plan(sb);

    expect(db.id).toBeTruthy();
    expect(db.entities.length).toBeGreaterThan(0);
    expect(Object.keys(db.identityMap).length).toBe(db.entities.length);
    expect(Object.keys(db.seedMap).length).toBe(db.entities.length);
  });

  test('builds provider identity package', () => {
    const sb = mockStoryboard();
    const db = CharacterPlanner.plan(sb);
    const pkg = CharacterPlanner.buildProviderPackage(db, sb);

    expect(Object.keys(pkg.identityBlocks).length).toBe(db.entities.length);
    expect(pkg.sceneIdentities.length).toBe(sb.frames.length);
    expect(Object.keys(pkg.providerSeeds).length).toBe(db.entities.length);
  });
});

describe('CharacterValidator', () => {
  test('validates a correct database', () => {
    const db = CharacterPlanner.plan(mockStoryboard());
    const result = CharacterValidator.validate(db);
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  test('detects missing identity blocks', () => {
    const db = CharacterPlanner.plan(mockStoryboard());
    if (db.entities[0]) {
      db.entities[0].identityBlock = '';
    }
    const result = CharacterValidator.validate(db);
    expect(result.errors.some((e) => e.includes('identity block'))).toBe(true);
  });
});

describe('CharacterProfileManager', () => {
  test('updates vehicle profile', () => {
    const db = CharacterPlanner.plan(mockStoryboard());
    const mgr = new CharacterProfileManager(db);
    const vehicle = db.entities.find((e) => e.category === 'vehicle');
    if (vehicle) {
      const ok = mgr.updateVehicleProfile(vehicle.id, { primaryColor: 'Racing Red' });
      expect(ok).toBe(true);
      expect(vehicle.vehicleProfile!.primaryColor).toBe('Racing Red');
      expect(vehicle.identityBlock).toContain('Racing Red');
    }
  });

  test('lists entities', () => {
    const db = CharacterPlanner.plan(mockStoryboard());
    const mgr = new CharacterProfileManager(db);
    const list = mgr.listEntities();
    expect(list.length).toBe(db.entities.length);
  });
});

describe('ContinuityEngine', () => {
  test('analyzes continuity without crashing', () => {
    const sb = mockStoryboard();
    const db = CharacterPlanner.plan(sb);
    const sm = new SeedManager(42);
    const report = ContinuityEngine.analyze(sb, db.entities, sm);

    expect(report.productionId).toBe(sb.id);
    expect(report.totalScenes).toBe(sb.frames.length);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });
});

describe('CharacterMemory', () => {
  beforeEach(() => CharacterMemory.resetInstance());

  test('records entries', () => {
    const mem = CharacterMemory.getInstance();
    mem.record({ productionTitle: 'Test', databaseId: 'db-1', entityCount: 3, continuityScore: 95 });
    expect(mem.size).toBe(1);
    expect(mem.getAll()[0]!.entityCount).toBe(3);
  });
});
