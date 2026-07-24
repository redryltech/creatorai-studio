// ============================================================
// CreatorAI Studio — World State Planner
// ============================================================
// Builds world snapshots from scene graphs, computes state
// transitions, detects continuity issues, and generates repairs.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { SceneGraphPackage, SceneGraph, SceneNode, LightNode } from '../scene-graph/scene-graph.types';
import type { CharacterDatabase } from '../character/character.types';
import type { DirectorPlan, DirectorScenePlan } from '../director/director.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type {
  WorldStatePackage, WorldSnapshot, StateDelta,
  EnvironmentState, LightingState, CameraState,
  CharacterState, VehicleState, WorldMetrics,
  WorldContinuityIssue, ContinuityIssueType,
} from './world-state.types';

const log = Logger.for('WorldStatePlanner');

// ── Environment keyword → state mapping ──

const ENV_FEATURES: Record<string, Partial<EnvironmentState>> = {
  highway:       { roadType: 'highway', terrain: 'asphalt', city: false, forest: false, mountains: false },
  mountains:     { terrain: 'rocky', mountains: true, forest: true },
  studio:        { terrain: 'indoor', city: false, sky: 'backdrop' },
  city:          { terrain: 'urban', city: true, trafficDensity: 0.6, crowdDensity: 0.4 },
  night_city:    { terrain: 'urban', city: true, sky: 'night' },
  countryside:   { terrain: 'grass', forest: false, mountains: false },
  luxury_garage: { terrain: 'indoor', city: false },
  race_track:    { terrain: 'asphalt', roadType: 'track' },
  forest:        { terrain: 'soil', forest: true },
  beach:         { terrain: 'sand', ocean: true },
  desert:        { terrain: 'sand', ocean: false },
  ocean:         { terrain: 'water', ocean: true },
  snow:          { terrain: 'snow', snow: 0.8 },
  space:         { terrain: 'void', sky: 'space' },
};

// ── Lighting → sun elevation ──

const LIGHTING_ELEVATION: Record<string, number> = {
  golden_hour: 10, sunrise: 5, sunset: 8, blue_hour: 2,
  midday: 70, morning: 30, afternoon: 45, night: -20,
  midnight: -40, dawn: 3, dusk: 6,
};

export class WorldStatePlanner {
  /**
   * Build the complete world state from all upstream data.
   */
  static plan(
    sceneGraphPkg: SceneGraphPackage,
    charDb: CharacterDatabase,
    storyboard: Storyboard,
    directorPlan?: DirectorPlan,
  ): WorldStatePackage {
    const startTime = performance.now();

    log.info('World state planning', {
      scenes: sceneGraphPkg.scenes.length,
      entities: charDb.entities.length,
    });

    // ── Build snapshots ──
    const snapshots: WorldSnapshot[] = [];
    let cumulativeTime = 0;
    let worldVersion = 1;

    for (let i = 0; i < sceneGraphPkg.scenes.length; i++) {
      const graph = sceneGraphPkg.scenes[i]!;
      const frame = storyboard.frames[i];
      const dirScene = directorPlan?.scenes[i];
      const duration = frame?.timing.durationSec ?? graph.metadata.durationSec;

      const snapshot = WorldStatePlanner.buildSnapshot(
        graph, charDb, dirScene, frame,
        cumulativeTime, i + 1, worldVersion,
      );
      snapshots.push(snapshot);

      cumulativeTime += duration;
      worldVersion++;
    }

    // ── Compute transitions ──
    const transitions: StateDelta[] = [];
    for (let i = 1; i < snapshots.length; i++) {
      transitions.push(WorldStatePlanner.computeTransition(snapshots[i - 1]!, snapshots[i]!));
    }

    // ── Detect continuity issues ──
    const issues = WorldStatePlanner.detectIssues(snapshots, transitions, charDb);

    // ── Compute metrics ──
    const metrics = WorldStatePlanner.computeMetrics(snapshots, transitions, issues);

    // ── Key moments ──
    const keyMoments = snapshots.map((s) => ({
      time: s.timestamp,
      event: `Scene ${s.sceneOrder}: ${s.environment.location}`,
    }));

    const processingTimeMs = Math.round(performance.now() - startTime);

    log.info('World state complete', {
      snapshots: snapshots.length,
      transitions: transitions.length,
      issues: issues.length,
      continuityScore: metrics.continuityScore,
      overallScore: metrics.overallProductionScore,
      processingTimeMs,
    });

    return {
      id: generateId(ID_PREFIXES.pipeline),
      productionTitle: storyboard.title,
      snapshots,
      transitions,
      issues,
      metrics,
      timeline: {
        totalDuration: cumulativeTime,
        sceneCount: snapshots.length,
        snapshotCount: snapshots.length,
        timeScale: 1,
        keyMoments,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        engine: 'world-state-planner-v1',
        processingTimeMs,
      },
    };
  }

  // ══════════════════════════════════════════════════════════
  // Snapshot Builder
  // ══════════════════════════════════════════════════════════

  private static buildSnapshot(
    graph: SceneGraph,
    charDb: CharacterDatabase,
    dirScene: DirectorScenePlan | undefined,
    frame: any,
    timestamp: number,
    sceneOrder: number,
    worldVersion: number,
  ): WorldSnapshot {
    const nodes = Object.values(graph.nodes);
    const env = (dirScene?.environment ?? 'studio') as string;
    const weather = (dirScene?.weather ?? 'clear') as string;
    const timeOfDay = (dirScene?.timeOfDay ?? 'afternoon') as string;
    const lighting = (dirScene?.lighting ?? 'natural') as string;

    // Environment state
    const envDefaults = ENV_FEATURES[env] ?? {};
    const environment: EnvironmentState = {
      location: env.replace(/_/g, ' '),
      country: 'unspecified',
      roadType: envDefaults.roadType ?? 'none',
      terrain: envDefaults.terrain ?? 'ground',
      sky: envDefaults.sky ?? (timeOfDay === 'night' || timeOfDay === 'midnight' ? 'night' : 'daylight'),
      clouds: weather === 'cloudy' || weather === 'overcast' ? 'heavy' : weather === 'clear' ? 'none' : 'light',
      fog: weather === 'fog' || weather === 'mist' ? 0.7 : 0,
      rain: weather === 'rain' ? 0.5 : weather === 'heavy_rain' ? 0.9 : weather === 'storm' ? 1.0 : 0,
      snow: weather === 'snow' ? 0.6 : (envDefaults.snow ?? 0),
      wind: weather === 'storm' ? 0.9 : weather === 'wind' ? 0.5 : 0.1,
      ocean: envDefaults.ocean ?? false,
      mountains: envDefaults.mountains ?? false,
      forest: envDefaults.forest ?? false,
      city: envDefaults.city ?? false,
      trafficDensity: envDefaults.trafficDensity ?? 0,
      crowdDensity: envDefaults.crowdDensity ?? 0,
    };

    // Lighting state
    const sunElev = LIGHTING_ELEVATION[timeOfDay] ?? 45;
    const lightingState: LightingState = {
      sunPosition: { azimuth: 180 + sceneOrder * 15, elevation: sunElev },
      moonPosition: sunElev < 0 ? { azimuth: 0, elevation: Math.abs(sunElev) } : null,
      hdriActive: graph.lightNodes.some((l) => l.lightType === 'hdri'),
      intensity: dirScene?.lightingIntensity === 'high' ? 1.2 : dirScene?.lightingIntensity === 'low' ? 0.5 : 0.8,
      temperature: graph.lightNodes[0]?.temperature ?? 5500,
      shadowDirection: { x: Math.sin(sunElev * Math.PI / 180), y: -1, z: Math.cos(sunElev * Math.PI / 180) },
      shadowLength: sunElev > 0 ? Math.max(0.5, 5 / Math.tan(sunElev * Math.PI / 180)) : 0,
      exposure: sunElev > 30 ? 0 : sunElev > 10 ? -0.5 : sunElev > 0 ? -1 : -2,
      contrast: dirScene?.shadowStyle === 'dramatic' ? 1.5 : dirScene?.shadowStyle === 'hard' ? 1.3 : 1.0,
      ambientLight: sunElev > 20 ? 0.6 : sunElev > 0 ? 0.3 : 0.1,
    };

    // Camera state
    const cam = graph.cameraNode;
    const cameraState: CameraState = {
      position: cam.position,
      lens: cam.lens,
      movement: dirScene?.cameraMovement ?? 'static',
      focusDistance: cam.focusDistance,
      depthOfField: cam.depthOfField,
      exposure: lightingState.exposure,
      whiteBalance: lightingState.temperature,
      iso: sunElev > 20 ? 100 : sunElev > 0 ? 400 : 1600,
      motionBlur: (dirScene?.motionIntensity === 'dynamic' || dirScene?.motionIntensity === 'extreme') ? 0.5 : 0.1,
      fov: cam.fieldOfView,
    };

    // Character states
    const characters: CharacterState[] = charDb.entities
      .filter((e) => e.category === 'human' && e.scenePresence.includes(graph.sceneId))
      .map((e) => {
        const node = nodes.find((n) => n.entityId === e.id);
        return {
          entityId: e.id, displayName: e.displayName,
          position: node?.position ?? { x: 0, y: 0, z: 0 },
          rotation: node?.rotation ?? { pitch: 0, yaw: 0, roll: 0 },
          pose: node?.animationState ?? 'idle',
          animation: node?.animationState ?? 'idle',
          expression: dirScene?.sceneEmotion ?? 'neutral',
          eyeDirection: 'forward',
          clothing: e.characterProfile?.clothing.overall ?? '',
          accessories: e.characterProfile?.accessories ?? [],
          health: 1, damage: 0, visibility: (node?.visibility ?? 1),
        };
      });

    // Vehicle states
    const vehicles: VehicleState[] = charDb.entities
      .filter((e) => e.category === 'vehicle' && e.scenePresence.includes(graph.sceneId))
      .map((e) => {
        const node = nodes.find((n) => n.entityId === e.id);
        const isDriving = node?.animationState === 'driving';
        return {
          entityId: e.id, displayName: e.displayName,
          position: node?.position ?? { x: 0, y: 0, z: 0 },
          rotation: node?.rotation ?? { pitch: 0, yaw: 0, roll: 0 },
          speed: isDriving ? 15 : 0, acceleration: isDriving ? 2 : 0,
          wheelRotation: isDriving ? 720 : 0, steeringAngle: 0,
          brakeState: false, headlights: sunElev < 10,
          indicators: 'none' as const, damage: 0, dirt: 0, fuel: 0.8,
        };
      });

    // Props + particles from graph
    const props = nodes.filter((n) => n.type === 'prop').map((n) => n.name);
    const particles = nodes.filter((n) => n.type === 'particle_system').map((n) => n.name);

    return {
      snapshotId: `snap-${sceneOrder}`,
      timestamp,
      sceneId: graph.sceneId,
      sceneOrder,
      worldVersion,
      environmentVersion: 1,
      characterVersion: 1,
      cameraVersion: 1,
      lightingVersion: 1,
      weatherVersion: weather === 'clear' ? 1 : 2,
      environment,
      lighting: lightingState,
      camera: cameraState,
      characters,
      vehicles,
      props,
      particles,
    };
  }

  // ══════════════════════════════════════════════════════════
  // State Transition
  // ══════════════════════════════════════════════════════════

  private static computeTransition(from: WorldSnapshot, to: WorldSnapshot): StateDelta {
    const envDelta: Partial<EnvironmentState> = {};
    for (const key of Object.keys(from.environment) as Array<keyof EnvironmentState>) {
      if (from.environment[key] !== to.environment[key]) {
        (envDelta as any)[key] = to.environment[key];
      }
    }

    const lightDelta: Partial<LightingState> = {};
    if (from.lighting.temperature !== to.lighting.temperature) lightDelta.temperature = to.lighting.temperature;
    if (from.lighting.intensity !== to.lighting.intensity) lightDelta.intensity = to.lighting.intensity;
    if (from.lighting.contrast !== to.lighting.contrast) lightDelta.contrast = to.lighting.contrast;

    const camDelta: Partial<CameraState> = {};
    if (from.camera.lens !== to.camera.lens) camDelta.lens = to.camera.lens;
    if (from.camera.fov !== to.camera.fov) camDelta.fov = to.camera.fov;
    if (from.camera.movement !== to.camera.movement) camDelta.movement = to.camera.movement;

    const charDeltas = to.characters.map((tc) => {
      const fc = from.characters.find((c) => c.entityId === tc.entityId);
      if (!fc) return { entityId: tc.entityId, changes: { appeared: true } };
      const changes: Record<string, unknown> = {};
      if (fc.pose !== tc.pose) changes.pose = tc.pose;
      if (fc.clothing !== tc.clothing) changes.clothing = tc.clothing;
      if (fc.expression !== tc.expression) changes.expression = tc.expression;
      return { entityId: tc.entityId, changes };
    });

    const vehicleDeltas = to.vehicles.map((tv) => {
      const fv = from.vehicles.find((v) => v.entityId === tv.entityId);
      if (!fv) return { entityId: tv.entityId, changes: { appeared: true } };
      const changes: Record<string, unknown> = {};
      if (fv.speed !== tv.speed) changes.speed = tv.speed;
      if (fv.headlights !== tv.headlights) changes.headlights = tv.headlights;
      return { entityId: tv.entityId, changes };
    });

    const hasEnvChange = Object.keys(envDelta).length > 0;
    const timeDiff = to.timestamp - from.timestamp;

    return {
      fromSceneId: from.sceneId, toSceneId: to.sceneId,
      fromTimestamp: from.timestamp, toTimestamp: to.timestamp,
      environmentDelta: envDelta, lightingDelta: lightDelta, cameraDelta: camDelta,
      characterDeltas: charDeltas.filter((d) => Object.keys(d.changes).length > 0),
      vehicleDeltas: vehicleDeltas.filter((d) => Object.keys(d.changes).length > 0),
      transitionType: hasEnvChange ? 'cut' : 'continuous',
      transitionDuration: timeDiff,
    };
  }

  // ══════════════════════════════════════════════════════════
  // Continuity Issue Detection
  // ══════════════════════════════════════════════════════════

  private static detectIssues(
    snapshots: WorldSnapshot[],
    transitions: StateDelta[],
    charDb: CharacterDatabase,
  ): WorldContinuityIssue[] {
    const issues: WorldContinuityIssue[] = [];
    let issueCounter = 0;

    for (let i = 0; i < transitions.length; i++) {
      const trans = transitions[i]!;
      const from = snapshots[i]!;
      const to = snapshots[i + 1]!;

      // Weather jump
      if (from.environment.rain === 0 && to.environment.rain > 0.5) {
        issues.push(WorldStatePlanner.makeIssue(++issueCounter, 'unexpected_weather', 'warning', from.sceneId, to.sceneId, null,
          `Sudden rain start between scene ${from.sceneOrder} and ${to.sceneOrder}`,
          'Add a transitional shot showing clouds gathering', 'Add rain gradually'));
      }

      // Lighting jump (sun position)
      const elevDiff = Math.abs(from.lighting.sunPosition.elevation - to.lighting.sunPosition.elevation);
      if (elevDiff > 40 && trans.transitionType !== 'jump') {
        issues.push(WorldStatePlanner.makeIssue(++issueCounter, 'unexpected_lighting', 'info', from.sceneId, to.sceneId, null,
          `Large sun position change (${elevDiff.toFixed(0)}°) suggesting time jump`,
          'Add time-lapse transition or adjust lighting', 'Gradual lighting shift'));
      }

      // Character teleportation
      for (const cDelta of trans.characterDeltas) {
        if (cDelta.changes.appeared) continue;
        const fc = from.characters.find((c) => c.entityId === cDelta.entityId);
        const tc = to.characters.find((c) => c.entityId === cDelta.entityId);
        if (fc && tc) {
          const dist = Math.sqrt(
            (fc.position.x - tc.position.x) ** 2 +
            (fc.position.y - tc.position.y) ** 2 +
            (fc.position.z - tc.position.z) ** 2
          );
          if (dist > 20 && trans.transitionDuration < 2) {
            issues.push(WorldStatePlanner.makeIssue(++issueCounter, 'character_teleportation', 'warning', from.sceneId, to.sceneId, cDelta.entityId,
              `${fc.displayName} moved ${dist.toFixed(1)}m in ${trans.transitionDuration}s`,
              'Add movement transition or cut', 'Use cross-dissolve'));
          }
        }
        // Costume change
        if (cDelta.changes.clothing) {
          issues.push(WorldStatePlanner.makeIssue(++issueCounter, 'costume_change', 'warning', from.sceneId, to.sceneId, cDelta.entityId,
            `Clothing changed between scenes`, 'Maintain consistent wardrobe', 'Keep same outfit'));
        }
      }

      // Vehicle teleportation
      for (const vDelta of trans.vehicleDeltas) {
        if (vDelta.changes.appeared) continue;
        const fv = from.vehicles.find((v) => v.entityId === vDelta.entityId);
        const tv = to.vehicles.find((v) => v.entityId === vDelta.entityId);
        if (fv && tv) {
          const dist = Math.sqrt(
            (fv.position.x - tv.position.x) ** 2 + (fv.position.z - tv.position.z) ** 2
          );
          if (dist > 50 && trans.transitionDuration < 3) {
            issues.push(WorldStatePlanner.makeIssue(++issueCounter, 'vehicle_teleportation', 'warning', from.sceneId, to.sceneId, vDelta.entityId,
              `Vehicle moved ${dist.toFixed(0)}m instantly`, 'Add driving transition', 'Use tracking shot'));
          }
        }
      }

      // Missing props
      const missingProps = from.props.filter((p) => !to.props.includes(p));
      for (const prop of missingProps) {
        issues.push(WorldStatePlanner.makeIssue(++issueCounter, 'missing_props', 'info', from.sceneId, to.sceneId, null,
          `Prop "${prop}" was in scene ${from.sceneOrder} but missing in ${to.sceneOrder}`,
          'Add prop to scene or explain removal', 'Include in prompt'));
      }

      // Camera axis violation (180° rule simplified)
      const camXDiff = Math.abs(from.camera.position.x - to.camera.position.x);
      if (camXDiff > 8 && from.environment.location === to.environment.location) {
        issues.push(WorldStatePlanner.makeIssue(++issueCounter, '180_degree_rule', 'info', from.sceneId, to.sceneId, null,
          'Camera crossed the action axis — may confuse spatial orientation',
          'Keep camera on same side of action line', 'Add cutaway between angles'));
      }
    }

    return issues;
  }

  // ══════════════════════════════════════════════════════════
  // Metrics
  // ══════════════════════════════════════════════════════════

  private static computeMetrics(
    snapshots: WorldSnapshot[],
    transitions: StateDelta[],
    issues: WorldContinuityIssue[],
  ): WorldMetrics {
    const totalScenes = snapshots.length;
    const criticalIssues = issues.filter((i) => i.severity === 'critical').length;
    const warningIssues = issues.filter((i) => i.severity === 'warning').length;
    const infoIssues = issues.filter((i) => i.severity === 'info').length;

    const continuityScore = Math.max(0, 100 - criticalIssues * 20 - warningIssues * 5 - infoIssues * 1);
    const environmentScore = Math.max(0, 100 - issues.filter((i) => i.type.includes('weather') || i.type.includes('scene_drift')).length * 10);
    const cameraScore = Math.max(0, 100 - issues.filter((i) => i.type.includes('camera') || i.type === '180_degree_rule').length * 10);
    const lightingScore = Math.max(0, 100 - issues.filter((i) => i.type.includes('lighting') || i.type === 'color_drift').length * 10);
    const animationScore = Math.max(0, 100 - issues.filter((i) => i.type.includes('teleportation') || i.type === 'animation_drift').length * 10);
    const timelineScore = Math.max(0, 100 - issues.filter((i) => i.type === 'time_jump').length * 10);

    const overallProductionScore = Math.round(
      (continuityScore * 0.3 + environmentScore * 0.15 + cameraScore * 0.15 +
       lightingScore * 0.15 + animationScore * 0.15 + timelineScore * 0.1)
    );

    return { continuityScore, environmentScore, cameraScore, lightingScore, animationScore, timelineScore, overallProductionScore };
  }

  // ── Helpers ──

  private static makeIssue(
    num: number, type: ContinuityIssueType, severity: WorldContinuityIssue['severity'],
    from: string, to: string, entityId: string | null,
    description: string, suggestion: string, transitionSuggestion: string,
  ): WorldContinuityIssue {
    return {
      id: `issue-${num}`, type, severity, fromScene: from, toScene: to, entityId, description,
      repair: { suggestion, correctedState: {}, promptCorrection: suggestion, continuityFix: suggestion, transitionSuggestion },
    };
  }
}
