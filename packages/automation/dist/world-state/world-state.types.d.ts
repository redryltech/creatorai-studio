export interface EnvironmentState {
    location: string;
    country: string;
    roadType: string;
    terrain: string;
    sky: string;
    clouds: string;
    fog: number;
    rain: number;
    snow: number;
    wind: number;
    ocean: boolean;
    mountains: boolean;
    forest: boolean;
    city: boolean;
    trafficDensity: number;
    crowdDensity: number;
}
export interface LightingState {
    sunPosition: {
        azimuth: number;
        elevation: number;
    };
    moonPosition: {
        azimuth: number;
        elevation: number;
    } | null;
    hdriActive: boolean;
    intensity: number;
    temperature: number;
    shadowDirection: {
        x: number;
        y: number;
        z: number;
    };
    shadowLength: number;
    exposure: number;
    contrast: number;
    ambientLight: number;
}
export interface CharacterState {
    entityId: string;
    displayName: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        pitch: number;
        yaw: number;
        roll: number;
    };
    pose: string;
    animation: string;
    expression: string;
    eyeDirection: string;
    clothing: string;
    accessories: string[];
    health: number;
    damage: number;
    visibility: number;
}
export interface VehicleState {
    entityId: string;
    displayName: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        pitch: number;
        yaw: number;
        roll: number;
    };
    speed: number;
    acceleration: number;
    wheelRotation: number;
    steeringAngle: number;
    brakeState: boolean;
    headlights: boolean;
    indicators: 'none' | 'left' | 'right' | 'hazard';
    damage: number;
    dirt: number;
    fuel: number;
}
export interface CameraState {
    position: {
        x: number;
        y: number;
        z: number;
    };
    lens: string;
    movement: string;
    focusDistance: number;
    depthOfField: {
        near: number;
        far: number;
    };
    exposure: number;
    whiteBalance: number;
    iso: number;
    motionBlur: number;
    fov: number;
}
export interface WorldSnapshot {
    snapshotId: string;
    timestamp: number;
    sceneId: string;
    sceneOrder: number;
    worldVersion: number;
    environmentVersion: number;
    characterVersion: number;
    cameraVersion: number;
    lightingVersion: number;
    weatherVersion: number;
    environment: EnvironmentState;
    lighting: LightingState;
    camera: CameraState;
    characters: CharacterState[];
    vehicles: VehicleState[];
    props: string[];
    particles: string[];
}
export interface StateDelta {
    fromSceneId: string;
    toSceneId: string;
    fromTimestamp: number;
    toTimestamp: number;
    environmentDelta: Partial<EnvironmentState>;
    lightingDelta: Partial<LightingState>;
    cameraDelta: Partial<CameraState>;
    characterDeltas: Array<{
        entityId: string;
        changes: Record<string, unknown>;
    }>;
    vehicleDeltas: Array<{
        entityId: string;
        changes: Record<string, unknown>;
    }>;
    transitionType: 'continuous' | 'cut' | 'jump' | 'time_skip';
    transitionDuration: number;
}
export type ContinuityIssueType = 'unexpected_weather' | 'unexpected_lighting' | 'time_jump' | 'character_teleportation' | 'vehicle_teleportation' | 'missing_props' | 'camera_axis_violation' | '180_degree_rule' | 'color_drift' | 'scene_drift' | 'object_drift' | 'animation_drift' | 'impossible_speed' | 'costume_change' | 'damage_inconsistency';
export interface WorldContinuityIssue {
    id: string;
    type: ContinuityIssueType;
    severity: 'critical' | 'warning' | 'info';
    fromScene: string;
    toScene: string;
    entityId: string | null;
    description: string;
    repair: {
        suggestion: string;
        correctedState: Record<string, unknown>;
        promptCorrection: string;
        continuityFix: string;
        transitionSuggestion: string;
    };
}
export interface WorldMetrics {
    continuityScore: number;
    environmentScore: number;
    cameraScore: number;
    lightingScore: number;
    animationScore: number;
    timelineScore: number;
    overallProductionScore: number;
}
export interface WorldStatePackage {
    id: string;
    productionTitle: string;
    snapshots: WorldSnapshot[];
    transitions: StateDelta[];
    issues: WorldContinuityIssue[];
    metrics: WorldMetrics;
    timeline: {
        totalDuration: number;
        sceneCount: number;
        snapshotCount: number;
        timeScale: number;
        keyMoments: Array<{
            time: number;
            event: string;
        }>;
    };
    metadata: {
        generatedAt: string;
        engine: string;
        processingTimeMs: number;
    };
}
export interface WorldStateExportFormats {
    worldStateJson: WorldStatePackage;
    timelineJson: {
        totalDuration: number;
        scenes: Array<{
            id: string;
            start: number;
            end: number;
        }>;
    };
    snapshotPackage: WorldSnapshot[];
    continuityReport: {
        score: number;
        issues: WorldContinuityIssue[];
    };
    repairReport: {
        fixes: Array<{
            scene: string;
            fix: string;
        }>;
    };
    debugPackage: {
        snapshots: number;
        transitions: number;
        issues: number;
        metrics: WorldMetrics;
    };
}
export interface WorldStateMemoryEntry {
    id: string;
    productionTitle: string;
    packageId: string;
    continuityScore: number;
    overallScore: number;
    createdAt: string;
}
//# sourceMappingURL=world-state.types.d.ts.map