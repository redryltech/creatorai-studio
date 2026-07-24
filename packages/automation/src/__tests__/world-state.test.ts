// ============================================================
// CreatorAI Studio — World State Engine Unit Tests
// ============================================================

import { WorldStatePlanner } from '../world-state/world-state-planner';
import { WorldStateValidator } from '../world-state/world-state-validator';
import { WorldStateExporter } from '../world-state/world-state-exporter';
import { WorldStateMemory } from '../world-state/world-state-memory';
import type { SceneGraphPackage, SceneGraph, SceneNode, CameraNode, LightNode } from '../scene-graph/scene-graph.types';
import type { CharacterDatabase, EntityIdentity } from '../character/character.types';
import type { Storyboard, StoryboardFrame } from '../storyboard/storyboard.types';
import type { DirectorPlan, DirectorScenePlan } from '../director/director.types';

// ── Helpers ──

function v3(x: number, y: number, z: number) { return { x, y, z }; }
function rot(p: number, y: number, r: number) { return { pitch: p, yaw: y, roll: r }; }

function mockSceneGraph(order: number): SceneGraph {
  const rootId = `root_${order}`;
  const vehicleId = `vehicle_${order}`;
  const camId = `cam_${order}`;
  const lightId = `light_${order}`;

  const nodes: Record<string, SceneNode> = {
    [rootId]: { id: rootId, uuid: rootId, type: 'root', name: 'Root', parentId: null, childrenIds: [vehicleId, camId, lightId], position: v3(0,0,0), rotation: rot(0,0,0), scale: v3(1,1,1), boundingBox: { min: v3(-50,-1,-200), max: v3(50,50,50) }, velocity: v3(0,0,0), acceleration: v3(0,0,0), direction: v3(0,0,-1), visibility: 1, importance: 10, animationState: 'idle', physics: { isStatic: true, mass: 0, gravity: false, friction: 0, restitution: 0 }, entityId: null, seed: 0, metadata: {} },
    [vehicleId]: { id: vehicleId, uuid: vehicleId, type: 'vehicle', name: 'Ninja 300', parentId: rootId, childrenIds: [], position: v3(0,0.5,0), rotation: rot(0,0,0), scale: v3(2,1,1), boundingBox: { min: v3(-1,0,-0.5), max: v3(1,1,0.5) }, velocity: v3(0,0,-10), acceleration: v3(0,0,0), direction: v3(0,0,-1), visibility: 0.9, importance: 10, animationState: 'driving', physics: { isStatic: false, mass: 170, gravity: true, friction: 0.8, restitution: 0.2 }, entityId: 'bike_001', seed: 12345, metadata: {} },
  };

  const cam: CameraNode = {
    ...nodes[rootId]!, id: camId, uuid: camId, type: 'camera', name: 'Camera', parentId: rootId, childrenIds: [],
    position: v3(0,1.7,5), targetNodeId: vehicleId, focusDistance: 5, lens: '35mm', fieldOfView: 63,
    depthOfField: { near: 3, far: 15, focusRange: 2 }, motionPath: [v3(0,1.7,5)],
    keyframes: [{ time: 0, position: v3(0,1.7,5), rotation: rot(0,0,0), fov: 63 }],
    lookAtTarget: vehicleId, safeFrame: { top: 0.05, bottom: 0.05, left: 0.05, right: 0.05 },
  };
  nodes[camId] = cam;

  const light: LightNode = {
    ...nodes[rootId]!, id: lightId, uuid: lightId, type: 'sun', name: 'Sun', parentId: rootId, childrenIds: [],
    position: v3(-30,15,-20), lightType: 'sun', intensity: 0.8, temperature: 3500, color: '#FFB347',
    shadowDirection: v3(1,-1,1), castShadow: true, radius: 50, falloff: 1,
  };
  nodes[lightId] = light;

  return {
    sceneId: `scene-${order}`, frameId: `frame-${order}`, graphId: `graph-${order}`,
    worldOrigin: v3(0,0,0), worldUp: v3(0,1,0), sceneBounds: { min: v3(-50,-1,-200), max: v3(50,50,50) },
    rootNodeId: rootId, nodes, relationships: [
      { id: `rel_1`, type: 'on_top_of', sourceNodeId: vehicleId, targetNodeId: rootId, strength: 1, metadata: {} },
      { id: `rel_2`, type: 'looking_at', sourceNodeId: camId, targetNodeId: vehicleId, strength: 1, metadata: {} },
    ],
    cameraNode: cam, lightNodes: [light],
    metrics: { objectCount: 4, characterCount: 0, vehicleCount: 1, lightCount: 1, complexityScore: 50, motionScore: 20, crowdDensity: 0, environmentDensity: 20, depthComplexity: 15 },
    metadata: { objectCount: 4, timestamp: (order-1)*8, durationSec: 8 },
  };
}

function mockSceneGraphPackage(): SceneGraphPackage {
  return {
    id: 'sgpkg-test', productionTitle: 'Test',
    scenes: [mockSceneGraph(1), mockSceneGraph(2), mockSceneGraph(3)],
    globalAnchors: { bike_001: v3(0,0.5,0) },
    continuityAnchors: { bike_001: { position: v3(0,0.5,0), rotation: rot(0,0,0) } },
    metadata: { totalScenes: 3, totalNodes: 12, totalRelationships: 6, avgComplexity: 50, generatedAt: '', engine: 'test', processingTimeMs: 1 },
  };
}

function mockCharDb(): CharacterDatabase {
  return {
    id: 'chardb-test', productionTitle: 'Test',
    entities: [{
      id: 'bike_001', uuid: 'bike_001-abc', displayName: 'Ninja 300', category: 'vehicle',
      priority: 10, visibilityScore: 90, importance: 'primary', continuityLevel: 'strict',
      globalSeed: 12345, sceneSeed: {}, variationSeed: 1,
      characterProfile: null,
      vehicleProfile: { manufacturer: 'Kawasaki', model: 'Ninja 300', year: '2024', variant: 'Std', primaryColor: 'Green', secondaryColor: 'Black', paintFinish: 'gloss', wheelDesign: 'OEM', tyres: 'Sport', brakeType: 'ABS', exhaust: 'OEM', engineStyle: 'Twin', suspension: 'Std', licensePlate: '', damageState: 'pristine', cleanliness: 'showroom', brandStickers: [] },
      environmentProfile: null,
      appearance: { referencePrompt: '', referenceDescription: '', visualEmbeddingPlaceholder: '', preferredColors: ['Green'], forbiddenChanges: [], requiredObjects: [], requiredClothing: [], requiredVehicleParts: [] },
      scenePresence: ['scene-1', 'scene-2', 'scene-3'],
      identityBlock: 'ENTITY bike_001',
    }],
    identityMap: { bike_001: 'ENTITY bike_001' },
    seedMap: { bike_001: 12345 },
    metadata: { totalEntities: 1, categories: { vehicle: 1, human: 0, animal: 0, product: 0, building: 0, weapon: 0, prop: 0, logo: 0, brand_asset: 0 }, generatedAt: '', engine: 'test', processingTimeMs: 1 },
  };
}

function mockStoryboard(): Storyboard {
  const mkFrame = (o: number): StoryboardFrame => ({
    frameId: `frame-${o}`, sceneId: `scene-${o}`, sceneOrder: o, shotNumber: o,
    frameDescription: 'Test', framePurpose: 'Test', sceneSummary: `Scene ${o}`, visualGoal: 'Test',
    narrationText: 'Test', expectedDuration: 8, thumbnailCandidate: o === 2,
    composition: { foreground:'F', midground:'M', background:'B', mainSubject:'S', supportingObjects:[], depthLayout:'medium', leadingLines:'L', negativeSpace:'balanced', ruleOfThirdsPosition:'center', eyeFocusPoint:'C' },
    camera: { position:'eye_level', height:'medium', distance:'medium', path:'Track', direction:'Fwd', rotation:'level', lens:'35mm', fov:'wide' },
    motion: { subjectMotion:'driving', cameraMotion:'tracking', backgroundMotion:'P', objectMotion:'M', particleMotion:'N', motionSpeed:'fast' },
    timing: { startTimeSec:(o-1)*8, endTimeSec:o*8, durationSec:8, animationCurve:'ease_in_out', transitionInSec:0.5, transitionOutSec:0.5 },
    assets: { characters:[], vehicles:['kawasaki'], buildings:[], environmentAssets:[], props:['helmet'], logos:[], brandAssets:[], soundEffects:[] },
    style: { artStyle:'cine', renderingStyle:'cinematic', qualityTarget:'1080p', aspectRatio:'9:16', lightingSummary:'Golden', colorPalette:['#CCC'], mood:'excitement' },
    continuity: { character:'C', environment:'E', lighting:'L', weather:'W', vehicle:'V', costume:'C', colorGrading:'G' },
    prompts: { imagePrompt:'IP', videoPrompt:'VP', thumbnailPrompt:'TP', negativePrompt:'NP', prompt3D:'3D', animationPrompt:'A', styleSuffix:'S', providerHints:{} },
  }) as StoryboardFrame;
  return {
    id:'sb-test', directorPlanId:'dp-test', title:'Test',
    frames:[mkFrame(1),mkFrame(2),mkFrame(3)],
    globalStyle:{artStyle:'c',renderingStyle:'cinematic',qualityTarget:'1080p',aspectRatio:'9:16',lightingSummary:'G',colorPalette:['#C'],mood:'e'},
    globalContinuity:{character:'C',environment:'E',lighting:'L',weather:'W',vehicle:'V',costume:'C',colorGrading:'G'},
    metadata:{totalFrames:3,totalDuration:24,thumbnailFrameIndex:1,aspectRatio:'9:16',resolution:'1080p',generatedAt:'',engine:'t',processingTimeMs:1},
  };
}

function mockDirectorPlan(): DirectorPlan {
  const mkScene = (o: number): DirectorScenePlan => ({
    sceneId:`scene-${o}`, sceneOrder:o, sceneGoal:'G', sceneEmotion:'excitement',
    sceneImportance: o===1?'hook':o===3?'cta':'buildup', sceneDuration:8,
    narration:'N', cameraStyle:'tracking', lens:'35mm', cameraMovement:'tracking_forward',
    subjectPosition:'center', shotDescription:'S', environment:'highway', weather:'clear',
    timeOfDay:'golden_hour', environmentDetails:'Highway scene', lighting:'golden_hour',
    lightingIntensity:'medium', lightingDirection:'natural', shadowStyle:'soft',
    visualEffects:['depth_of_field'], motionStyle:'driving', colorGrading:'teal_orange',
    motionIntensity:'dynamic', transitionIn:'fade', transitionOut:'cut', musicMood:'excitement',
    narrationStyle:'energetic', thumbnailCandidate:o===2, thumbnailReason:'', promptOverride:null,
  });
  return {
    id:'dp-test', scriptId:'s-test', title:'Test',
    globalStyle:'automotive', globalColorGrading:'teal_orange', globalMood:'energetic',
    globalPacing:'dynamic', targetAudience:'bikers',
    scenes:[mkScene(1),mkScene(2),mkScene(3)],
    consistencyNotes:'C', characterDescription:'Rider', recurringElements:['Ninja 300'],
    colorPalette:['#00CED1','#FF6347'],
    metadata:{totalDuration:24,sceneCount:3,thumbnailSceneIndex:1,generatedAt:'',model:'t',processingTimeMs:1},
  };
}

// ═══════════════════════════════════════════════════════════

describe('WorldStatePlanner', () => {
  test('builds world state package', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    expect(pkg.id).toBeTruthy();
    expect(pkg.snapshots).toHaveLength(3);
    expect(pkg.transitions).toHaveLength(2);
    expect(pkg.metrics.overallProductionScore).toBeGreaterThan(0);
  });

  test('snapshots have sequential timestamps', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    for (let i = 1; i < pkg.snapshots.length; i++) {
      expect(pkg.snapshots[i]!.timestamp).toBeGreaterThanOrEqual(pkg.snapshots[i-1]!.timestamp);
    }
  });

  test('snapshots contain environment state', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    for (const snap of pkg.snapshots) {
      expect(snap.environment.location).toBeTruthy();
      expect(snap.environment.terrain).toBeTruthy();
    }
  });

  test('snapshots contain lighting state', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    for (const snap of pkg.snapshots) {
      expect(snap.lighting.temperature).toBeGreaterThan(0);
      expect(snap.lighting.intensity).toBeGreaterThan(0);
    }
  });

  test('snapshots contain camera state', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    for (const snap of pkg.snapshots) {
      expect(snap.camera.lens).toBeTruthy();
      expect(snap.camera.fov).toBeGreaterThan(0);
    }
  });

  test('snapshots contain vehicle states from character database', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    for (const snap of pkg.snapshots) {
      expect(snap.vehicles.length).toBeGreaterThanOrEqual(1);
      expect(snap.vehicles[0]!.entityId).toBe('bike_001');
    }
  });

  test('transitions compute deltas', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    for (const trans of pkg.transitions) {
      expect(trans.fromSceneId).toBeTruthy();
      expect(trans.toSceneId).toBeTruthy();
      expect(trans.transitionType).toBeTruthy();
    }
  });

  test('metrics are computed', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    expect(pkg.metrics.continuityScore).toBeGreaterThanOrEqual(0);
    expect(pkg.metrics.continuityScore).toBeLessThanOrEqual(100);
    expect(pkg.metrics.overallProductionScore).toBeGreaterThanOrEqual(0);
  });

  test('timeline is correct', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    expect(pkg.timeline.totalDuration).toBeGreaterThan(0);
    expect(pkg.timeline.sceneCount).toBe(3);
    expect(pkg.timeline.keyMoments.length).toBe(3);
  });
});

describe('WorldStateValidator', () => {
  test('validates correct package', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    const result = WorldStateValidator.validate(pkg);
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  test('detects empty snapshots', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    pkg.snapshots = [];
    const result = WorldStateValidator.validate(pkg);
    expect(result.valid).toBe(false);
  });
});

describe('WorldStateExporter', () => {
  test('exports all formats', () => {
    const pkg = WorldStatePlanner.plan(mockSceneGraphPackage(), mockCharDb(), mockStoryboard(), mockDirectorPlan());
    const exported = WorldStateExporter.export(pkg);
    expect(exported.worldStateJson).toBe(pkg);
    expect(exported.snapshotPackage).toHaveLength(3);
    expect(exported.continuityReport.score).toBeGreaterThanOrEqual(0);
    expect(exported.debugPackage.snapshots).toBe(3);
  });
});

describe('WorldStateMemory', () => {
  beforeEach(() => WorldStateMemory.resetInstance());
  test('records entries', () => {
    const mem = WorldStateMemory.getInstance();
    mem.record({ productionTitle: 'Test', packageId: 'pkg-1', continuityScore: 95, overallScore: 90 });
    expect(mem.size).toBe(1);
  });
});
