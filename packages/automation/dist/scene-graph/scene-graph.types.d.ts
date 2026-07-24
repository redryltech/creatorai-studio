export type SceneNodeType = 'character' | 'vehicle' | 'animal' | 'building' | 'environment' | 'road' | 'tree' | 'mountain' | 'water' | 'sky' | 'cloud' | 'sun' | 'light_source' | 'camera' | 'prop' | 'logo' | 'product' | 'particle_system' | 'group' | 'root';
export interface Vec3 {
    x: number;
    y: number;
    z: number;
}
export interface Rotation {
    pitch: number;
    yaw: number;
    roll: number;
}
export interface BoundingBox {
    min: Vec3;
    max: Vec3;
}
export type RelationshipType = 'attached_to' | 'inside' | 'on_top_of' | 'behind' | 'in_front_of' | 'left_of' | 'right_of' | 'above' | 'below' | 'near' | 'far' | 'looking_at' | 'moving_toward' | 'moving_away' | 'intersects' | 'occludes' | 'reflects' | 'emits_light' | 'receives_shadow' | 'connected_to';
export interface SceneRelationship {
    id: string;
    type: RelationshipType;
    sourceNodeId: string;
    targetNodeId: string;
    strength: number;
    metadata: Record<string, unknown>;
}
export type AnimationState = 'idle' | 'walking' | 'running' | 'driving' | 'turning' | 'jumping' | 'camera_motion' | 'particle_motion' | 'wind_motion' | 'water_motion' | 'hovering' | 'custom';
export interface PhysicsState {
    isStatic: boolean;
    mass: number;
    gravity: boolean;
    friction: number;
    restitution: number;
}
export interface SceneNode {
    id: string;
    uuid: string;
    type: SceneNodeType;
    name: string;
    parentId: string | null;
    childrenIds: string[];
    position: Vec3;
    rotation: Rotation;
    scale: Vec3;
    boundingBox: BoundingBox;
    velocity: Vec3;
    acceleration: Vec3;
    direction: Vec3;
    visibility: number;
    importance: number;
    animationState: AnimationState;
    physics: PhysicsState;
    entityId: string | null;
    seed: number;
    metadata: Record<string, unknown>;
}
export interface CameraNode extends SceneNode {
    type: 'camera';
    targetNodeId: string | null;
    focusDistance: number;
    lens: string;
    fieldOfView: number;
    depthOfField: {
        near: number;
        far: number;
        focusRange: number;
    };
    motionPath: Vec3[];
    keyframes: Array<{
        time: number;
        position: Vec3;
        rotation: Rotation;
        fov: number;
    }>;
    lookAtTarget: string | null;
    safeFrame: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}
export type LightType = 'sun' | 'moon' | 'hdri' | 'area' | 'point' | 'spot' | 'rim' | 'fill' | 'practical';
export interface LightNode extends SceneNode {
    type: 'light_source' | 'sun';
    lightType: LightType;
    intensity: number;
    temperature: number;
    color: string;
    shadowDirection: Vec3;
    castShadow: boolean;
    radius: number;
    falloff: number;
}
export interface SceneGraph {
    sceneId: string;
    frameId: string;
    graphId: string;
    worldOrigin: Vec3;
    worldUp: Vec3;
    sceneBounds: BoundingBox;
    rootNodeId: string;
    nodes: Map<string, SceneNode> | Record<string, SceneNode>;
    relationships: SceneRelationship[];
    cameraNode: CameraNode;
    lightNodes: LightNode[];
    metrics: SceneMetrics;
    metadata: {
        objectCount: number;
        timestamp: number;
        durationSec: number;
    };
}
export interface SceneMetrics {
    objectCount: number;
    characterCount: number;
    vehicleCount: number;
    lightCount: number;
    complexityScore: number;
    motionScore: number;
    crowdDensity: number;
    environmentDensity: number;
    depthComplexity: number;
}
export interface SpatialAnalysis {
    distanceMatrix: Record<string, Record<string, number>>;
    visibilityMatrix: Record<string, Record<string, boolean>>;
    occlusionMatrix: Record<string, Record<string, boolean>>;
    interactionMatrix: Record<string, Record<string, string>>;
}
export interface SceneGraphPackage {
    id: string;
    productionTitle: string;
    scenes: SceneGraph[];
    globalAnchors: Record<string, Vec3>;
    continuityAnchors: Record<string, {
        position: Vec3;
        rotation: Rotation;
    }>;
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
export interface SceneGraphExportFormats {
    fullJson: SceneGraphPackage;
    compactGraph: Array<{
        sceneId: string;
        nodes: number;
        relationships: number;
        complexity: number;
    }>;
    promptGraph: Array<{
        sceneId: string;
        spatialPrompt: string;
        entities: string[];
    }>;
    visualizationGraph: Array<{
        sceneId: string;
        nodes: Array<{
            id: string;
            type: string;
            x: number;
            y: number;
            z: number;
            label: string;
        }>;
    }>;
    debugGraph: Array<{
        sceneId: string;
        issues: string[];
    }>;
}
export interface SceneGraphMemoryEntry {
    id: string;
    productionTitle: string;
    packageId: string;
    sceneCount: number;
    avgComplexity: number;
    createdAt: string;
}
//# sourceMappingURL=scene-graph.types.d.ts.map