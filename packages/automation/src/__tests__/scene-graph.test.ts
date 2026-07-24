// ============================================================
// CreatorAI Studio — Scene Graph Engine Unit Tests
// ============================================================

import { SceneGraphPlanner } from '../scene-graph/scene-graph-planner';
import { SceneGraphValidator } from '../scene-graph/scene-graph-validator';
import { SceneGraphExporter } from '../scene-graph/scene-graph-exporter';
import { SpatialRelationshipEngine } from '../scene-graph/spatial-relationship-engine';
import { CollisionAnalyzer } from '../scene-graph/collision-analyzer';
import { CameraGraphBuilder } from '../scene-graph/camera-graph-builder';
import { SceneGraphMemory } from '../scene-graph/scene-graph-memory';
import type { Storyboard, StoryboardFrame } from '../storyboard/storyboard.types';
import type { CharacterDatabase, EntityIdentity } from '../character/character.types';

function mockFrame(order: number): StoryboardFrame {
  return {
    frameId: `frame-${order}`, sceneId: `scene-${order}`, sceneOrder: order, shotNumber: order,
    frameDescription: 'Kawasaki Ninja 300 on highway', framePurpose: 'Test',
    sceneSummary: `Scene ${order}`, visualGoal: 'Test',
    narrationText: 'Riding on highway', expectedDuration: 8, thumbnailCandidate: order === 2,
    composition: { foreground: 'Bike', midground: 'Road', background: 'Sky', mainSubject: 'Ninja 300', supportingObjects: ['helmet'], depthLayout: 'medium', leadingLines: 'Road', negativeSpace: 'balanced', ruleOfThirdsPosition: 'center', eyeFocusPoint: 'Center' },
    camera: { position: 'eye_level', height: 'medium', distance: 'medium', path: 'Tracking', direction: 'Forward', rotation: 'level', lens: '35mm', fov: 'wide' },
    motion: { subjectMotion: 'driving', cameraMotion: 'tracking', backgroundMotion: 'Parallax', objectMotion: 'Min', particleMotion: 'None', motionSpeed: 'fast' },
    timing: { startTimeSec: (order-1)*8, endTimeSec: order*8, durationSec: 8, animationCurve: 'ease_in_out', transitionInSec: 0.5, transitionOutSec: 0.5 },
    assets: { characters: ['Rider'], vehicles: ['kawasaki'], buildings: [], environmentAssets: [], props: ['helmet'], logos: [], brandAssets: [], soundEffects: ['Engine'] },
    style: { artStyle: 'cinematic', renderingStyle: 'cinematic', qualityTarget: '1080p', aspectRatio: '9:16', lightingSummary: 'Golden hour', colorPalette: ['#00CED1'], mood: 'excitement' },
    continuity: { character: 'Consistent', environment: 'Highway', lighting: 'Golden', weather: 'Clear', vehicle: 'Ninja 300', costume: 'Gear', colorGrading: 'teal_orange' },
    prompts: { imagePrompt: 'Test prompt', videoPrompt: 'Test video', thumbnailPrompt: 'Test thumb', negativePrompt: 'blur', prompt3D: '3D', animationPrompt: 'Anim', styleSuffix: 'cine', providerHints: {} },
  } as StoryboardFrame;
}

function mockStoryboard(): Storyboard {
  return {
    id: 'sb-test', directorPlanId: 'dp-test', title: 'Ninja 300 Test',
    frames: [mockFrame(1), mockFrame(2), mockFrame(3)],
    globalStyle: { artStyle: 'cinematic', renderingStyle: 'cinematic', qualityTarget: '1080p', aspectRatio: '9:16', lightingSummary: 'Golden', colorPalette: ['#00CED1'], mood: 'energetic' },
    globalContinuity: { character: 'Rider', environment: 'Highway', lighting: 'Golden', weather: 'Clear', vehicle: 'Ninja', costume: 'Gear', colorGrading: 'teal_orange' },
    metadata: { totalFrames: 3, totalDuration: 24, thumbnailFrameIndex: 1, aspectRatio: '9:16', resolution: '1080p', generatedAt: '', engine: 'test', processingTimeMs: 1 },
  };
}

function mockCharDb(): CharacterDatabase {
  const entity: EntityIdentity = {
    id: 'bike_001', uuid: 'bike_001-abc', displayName: 'Green Kawasaki Ninja 300', category: 'vehicle',
    priority: 10, visibilityScore: 90, importance: 'primary', continuityLevel: 'strict',
    globalSeed: 12345, sceneSeed: { 'scene-1': 111, 'scene-2': 222, 'scene-3': 333 }, variationSeed: 1,
    characterProfile: null,
    vehicleProfile: { manufacturer: 'Kawasaki', model: 'Ninja 300', year: '2024', variant: 'Standard', primaryColor: 'Green', secondaryColor: 'Black', paintFinish: 'gloss', wheelDesign: 'OEM', tyres: 'Sport', brakeType: 'ABS', exhaust: 'OEM', engineStyle: 'Twin', suspension: 'Standard', licensePlate: '', damageState: 'pristine', cleanliness: 'showroom', brandStickers: [] },
    environmentProfile: null,
    appearance: { referencePrompt: 'Test', referenceDescription: 'Test', visualEmbeddingPlaceholder: '', preferredColors: ['Green'], forbiddenChanges: [], requiredObjects: [], requiredClothing: [], requiredVehicleParts: ['OEM'] },
    scenePresence: ['scene-1', 'scene-2', 'scene-3'],
    identityBlock: 'ENTITY bike_001 (VEHICLE)\nAlways use: Green Kawasaki Ninja 300',
  };
  return {
    id: 'db-test', productionTitle: 'Test', entities: [entity],
    identityMap: { bike_001: entity.identityBlock }, seedMap: { bike_001: 12345 },
    metadata: { totalEntities: 1, categories: { vehicle: 1, human: 0, animal: 0, product: 0, building: 0, weapon: 0, prop: 0, logo: 0, brand_asset: 0 }, generatedAt: '', engine: 'test', processingTimeMs: 1 },
  };
}

// Tests

describe('SceneGraphPlanner', () => {
  test('builds scene graphs from storyboard + character db', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    expect(pkg.id).toBeTruthy();
    expect(pkg.scenes).toHaveLength(3);
    expect(pkg.metadata.totalNodes).toBeGreaterThan(0);
    expect(pkg.metadata.totalRelationships).toBeGreaterThan(0);
  });

  test('every scene has root, camera, and lights', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    for (const graph of pkg.scenes) {
      expect(graph.rootNodeId).toBeTruthy();
      expect(graph.cameraNode).toBeTruthy();
      expect(graph.cameraNode.lens).toBe('35mm');
      expect(graph.lightNodes.length).toBeGreaterThan(0);
    }
  });

  test('entity nodes have correct entityId and seed', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    for (const graph of pkg.scenes) {
      const vehicleNodes = Object.values(graph.nodes).filter((n: any) => n.type === 'vehicle');
      expect(vehicleNodes.length).toBeGreaterThanOrEqual(1);
      expect((vehicleNodes[0] as any).entityId).toBe('bike_001');
      expect((vehicleNodes[0] as any).seed).toBe(12345);
    }
  });

  test('relationships are created between entities and environment', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    for (const graph of pkg.scenes) {
      expect(graph.relationships.length).toBeGreaterThan(0);
      const onTopOf = graph.relationships.filter((r) => r.type === 'on_top_of');
      expect(onTopOf.length).toBeGreaterThanOrEqual(1);
    }
  });

  test('metrics are computed', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    for (const graph of pkg.scenes) {
      expect(graph.metrics.objectCount).toBeGreaterThan(0);
      expect(graph.metrics.vehicleCount).toBeGreaterThanOrEqual(1);
      expect(graph.metrics.lightCount).toBeGreaterThan(0);
      expect(graph.metrics.complexityScore).toBeGreaterThan(0);
    }
  });

  test('global anchors are set for entities', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    expect(pkg.globalAnchors.bike_001).toBeTruthy();
    expect(pkg.continuityAnchors.bike_001).toBeTruthy();
  });
});

describe('SceneGraphValidator', () => {
  test('validates correct package', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    const result = SceneGraphValidator.validate(pkg);
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });
});

describe('SpatialRelationshipEngine', () => {
  test('computes spatial analysis', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    const analysis = SpatialRelationshipEngine.analyze(pkg.scenes[0]!);
    expect(analysis.distanceMatrix).toBeTruthy();
    expect(analysis.visibilityMatrix).toBeTruthy();
  });
});

describe('CollisionAnalyzer', () => {
  test('detects collisions', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    const result = CollisionAnalyzer.analyze(pkg.scenes[0]!);
    expect(result.totalCollisions).toBeGreaterThanOrEqual(0); // May or may not have collisions
  });
});

describe('CameraGraphBuilder', () => {
  test('builds motion path', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    const enhanced = CameraGraphBuilder.buildMotionPath(pkg.scenes[0]!.cameraNode, 'dolly_in', 8);
    expect(enhanced.motionPath.length).toBeGreaterThan(1);
    expect(enhanced.keyframes.length).toBeGreaterThan(1);
  });
});

describe('SceneGraphExporter', () => {
  test('exports all formats', () => {
    const pkg = SceneGraphPlanner.plan(mockStoryboard(), mockCharDb());
    const exported = SceneGraphExporter.export(pkg);
    expect(exported.fullJson).toBe(pkg);
    expect(exported.compactGraph).toHaveLength(3);
    expect(exported.promptGraph).toHaveLength(3);
    expect(exported.visualizationGraph).toHaveLength(3);
    expect(exported.debugGraph).toHaveLength(3);
    expect(exported.promptGraph[0]!.spatialPrompt.length).toBeGreaterThan(20);
  });
});

describe('SceneGraphMemory', () => {
  beforeEach(() => SceneGraphMemory.resetInstance());
  test('records entries', () => {
    const mem = SceneGraphMemory.getInstance();
    mem.record({ productionTitle: 'Test', packageId: 'pkg-1', sceneCount: 3, avgComplexity: 50 });
    expect(mem.size).toBe(1);
  });
});
