// ============================================================
// CreatorAI Studio — Scene Graph Engine Types
// ============================================================
// Canonical 3D scene representation. Provider-independent
// structured data for every visual element before generation.
// ============================================================

// ── Node Types ────────────────────────────────────────────

export type SceneNodeType =
  | 'character' | 'vehicle' | 'animal' | 'building' | 'environment'
  | 'road' | 'tree' | 'mountain' | 'water' | 'sky' | 'cloud'
  | 'sun' | 'light_source' | 'camera' | 'prop' | 'logo'
  | 'product' | 'particle_system' | 'group' | 'root';

// ── Spatial Types ─────────────────────────────────────────

export interface Vec3 { x: number; y: number; z: number; }
export interface Rotation { pitch: number; yaw: number; roll: number; }
export interface BoundingBox { min: Vec3; max: Vec3; }

// ── Relationship Types ────────────────────────────────────

export type RelationshipType =
  | 'attached_to' | 'inside' | 'on_top_of' | 'behind' | 'in_front_of'
  | 'left_of' | 'right_of' | 'above' | 'below' | 'near' | 'far'
  | 'looking_at' | 'moving_toward' | 'moving_away'
  | 'intersects' | 'occludes' | 'reflects' | 'emits_light'
  | 'receives_shadow' | 'connected_to';

export interface SceneRelationship {
  id: string;
  type: RelationshipType;
  sourceNodeId: string;
  targetNodeId: string;
  strength: number; // 0-1
  metadata: Record<string, unknown>;
}

// ── Animation State ───────────────────────────────────────

export type AnimationState =
  | 'idle' | 'walking' | 'running' | 'driving' | 'turning'
  | 'jumping' | 'camera_motion' | 'particle_motion'
  | 'wind_motion' | 'water_motion' | 'hovering' | 'custom';

// ── Physics State ─────────────────────────────────────────

export interface PhysicsState {
  isStatic: boolean;
  mass: number;
  gravity: boolean;
  friction: number;
  restitution: number;
}

// ════════════════════════════════════════════════════════════
// Scene Node — a single object in the scene graph
// ════════════════════════════════════════════════════════════

export interface SceneNode {
  id: string;
  uuid: string;
  type: SceneNodeType;
  name: string;
  parentId: string | null;
  childrenIds: string[];

  // Spatial
  position: Vec3;
  rotation: Rotation;
  scale: Vec3;
  boundingBox: BoundingBox;

  // Dynamics
  velocity: Vec3;
  acceleration: Vec3;
  direction: Vec3;

  // State
  visibility: number; // 0-1
  importance: number; // 0-10
  animationState: AnimationState;
  physics: PhysicsState;

  // Identity
  entityId: string | null; // links to CharacterDatabase entity
  seed: number;

  // Metadata
  metadata: Record<string, unknown>;
}

// ── Camera Node ───────────────────────────────────────────

export interface CameraNode extends SceneNode {
  type: 'camera';
  targetNodeId: string | null;
  focusDistance: number;
  lens: string;
  fieldOfView: number;
  depthOfField: { near: number; far: number; focusRange: number };
  motionPath: Vec3[];
  keyframes: Array<{ time: number; position: Vec3; rotation: Rotation; fov: number }>;
  lookAtTarget: string | null;
  safeFrame: { top: number; bottom: number; left: number; right: number };
}

// ── Light Node ────────────────────────────────────────────

export type LightType = 'sun' | 'moon' | 'hdri' | 'area' | 'point' | 'spot' | 'rim' | 'fill' | 'practical';

export interface LightNode extends SceneNode {
  type: 'light_source' | 'sun';
  lightType: LightType;
  intensity: number;
  temperature: number; // Kelvin
  color: string; // hex
  shadowDirection: Vec3;
  castShadow: boolean;
  radius: number;
  falloff: number;
}

// ════════════════════════════════════════════════════════════
// Scene Graph — the complete graph for one scene
// ════════════════════════════════════════════════════════════

export interface SceneGraph {
  sceneId: string;
  frameId: string;
  graphId: string;

  // World
  worldOrigin: Vec3;
  worldUp: Vec3;
  sceneBounds: BoundingBox;

  // Nodes
  rootNodeId: string;
  nodes: Map<string, SceneNode> | Record<string, SceneNode>;
  relationships: SceneRelationship[];

  // Specialized
  cameraNode: CameraNode;
  lightNodes: LightNode[];

  // Metrics
  metrics: SceneMetrics;

  // Metadata
  metadata: {
    objectCount: number;
    timestamp: number;
    durationSec: number;
  };
}

// ── Scene Metrics ─────────────────────────────────────────

export interface SceneMetrics {
  objectCount: number;
  characterCount: number;
  vehicleCount: number;
  lightCount: number;
  complexityScore: number; // 0-100
  motionScore: number; // 0-100
  crowdDensity: number; // 0-100
  environmentDensity: number; // 0-100
  depthComplexity: number; // 0-100
}

// ── Spatial Analysis Matrices ─────────────────────────────

export interface SpatialAnalysis {
  distanceMatrix: Record<string, Record<string, number>>;
  visibilityMatrix: Record<string, Record<string, boolean>>;
  occlusionMatrix: Record<string, Record<string, boolean>>;
  interactionMatrix: Record<string, Record<string, string>>;
}

// ════════════════════════════════════════════════════════════
// Scene Graph Package — output for the full production
// ════════════════════════════════════════════════════════════

export interface SceneGraphPackage {
  id: string;
  productionTitle: string;
  scenes: SceneGraph[];
  globalAnchors: Record<string, Vec3>;
  continuityAnchors: Record<string, { position: Vec3; rotation: Rotation }>;

  metadata: {
    totalScenes: number;
    totalNodes: number;
    totalRelationships: number;
    avgComplexity: number;
    generatedAt: string;
    engine: string;
    processingTimeMs: number;
  };
}

// ── Export Formats ─────────────────────────────────────────

export interface SceneGraphExportFormats {
  fullJson: SceneGraphPackage;
  compactGraph: Array<{ sceneId: string; nodes: number; relationships: number; complexity: number }>;
  promptGraph: Array<{ sceneId: string; spatialPrompt: string; entities: string[] }>;
  visualizationGraph: Array<{ sceneId: string; nodes: Array<{ id: string; type: string; x: number; y: number; z: number; label: string }> }>;
  debugGraph: Array<{ sceneId: string; issues: string[] }>;
}

// ── Memory ────────────────────────────────────────────────

export interface SceneGraphMemoryEntry {
  id: string;
  productionTitle: string;
  packageId: string;
  sceneCount: number;
  avgComplexity: number;
  createdAt: string;
}
