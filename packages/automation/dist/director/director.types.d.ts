export type CameraStyle = 'static' | 'handheld' | 'drone' | 'orbit' | 'tracking' | 'dolly' | 'crane' | 'fpv' | 'push' | 'pull' | 'zoom' | 'macro' | 'hero_shot';
export type LensChoice = '24mm' | '35mm' | '50mm' | '85mm' | '135mm' | 'ultra_wide' | 'telephoto' | 'macro';
export type CameraMovementType = 'dolly_in' | 'dolly_out' | 'orbit_left' | 'orbit_right' | 'crane_up' | 'crane_down' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'push_in' | 'pull_back' | 'tracking_left' | 'tracking_right' | 'tracking_forward' | 'handheld_subtle' | 'handheld_intense' | 'drone_ascend' | 'drone_descend' | 'drone_orbit' | 'fpv_forward' | 'fpv_dive' | 'zoom_in' | 'zoom_out' | 'whip_pan' | 'static';
export type SubjectPosition = 'center' | 'left_third' | 'right_third' | 'top_third' | 'bottom_third' | 'foreground' | 'midground' | 'background' | 'off_center_left' | 'off_center_right' | 'silhouette' | 'full_frame';
export type EnvironmentType = 'city' | 'forest' | 'mountains' | 'ocean' | 'beach' | 'desert' | 'cyberpunk' | 'race_track' | 'village' | 'factory' | 'luxury_garage' | 'airport' | 'snow' | 'space' | 'studio' | 'highway' | 'rooftop' | 'warehouse' | 'countryside' | 'night_city' | 'underwater' | 'arena' | 'office';
export type WeatherCondition = 'clear' | 'cloudy' | 'overcast' | 'rain' | 'heavy_rain' | 'storm' | 'snow' | 'fog' | 'mist' | 'dust' | 'wind' | 'haze';
export type TimeOfDayChoice = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'golden_hour' | 'sunset' | 'dusk' | 'blue_hour' | 'night' | 'midnight';
export type LightingType = 'golden_hour' | 'blue_hour' | 'studio' | 'softbox' | 'neon' | 'moonlight' | 'hdr' | 'volumetric_fog' | 'rim_light' | 'back_light' | 'natural' | 'dramatic' | 'hard_light' | 'low_key' | 'high_key' | 'spotlight';
export type MotionStyle = 'walking' | 'running' | 'driving' | 'flying' | 'jumping' | 'drifting' | 'slow_motion' | 'fast_motion' | 'explosion' | 'smoke' | 'rain' | 'dust' | 'wind' | 'falling' | 'rising' | 'floating' | 'spinning' | 'static_pose' | 'subtle_movement';
export type ColorGradingStyle = 'cinematic' | 'teal_orange' | 'kodak' | 'fuji' | 'hdr' | 'noir' | 'warm' | 'cold' | 'vintage' | 'natural' | 'desaturated' | 'vibrant' | 'cyberpunk' | 'pastel' | 'bleach_bypass';
export type VisualEffectType = 'depth_of_field' | 'motion_blur' | 'lens_flare' | 'bokeh' | 'bloom' | 'god_rays' | 'vignette' | 'film_grain' | 'chromatic_aberration' | 'anamorphic_flare' | 'fog_effect' | 'rain_effect' | 'snow_effect' | 'smoke_effect' | 'dust_particles' | 'fire_effect' | 'sparks' | 'water_droplets' | 'heat_haze' | 'none';
export type TransitionType = 'cut' | 'fade' | 'flash' | 'whip_pan' | 'zoom_transition' | 'blur' | 'morph' | 'match_cut' | 'cross_dissolve' | 'iris' | 'slide_left' | 'slide_right' | 'push';
export type NarrationStyle = 'confident' | 'dramatic' | 'whisper' | 'energetic' | 'calm' | 'urgent' | 'storytelling' | 'authoritative' | 'conversational' | 'inspirational';
export type SceneImportance = 'hook' | 'buildup' | 'climax' | 'resolution' | 'cta';
export interface DirectorScenePlan {
    sceneId: string;
    sceneOrder: number;
    sceneGoal: string;
    sceneEmotion: string;
    sceneImportance: SceneImportance;
    sceneDuration: number;
    narration: string;
    cameraStyle: CameraStyle;
    lens: LensChoice;
    cameraMovement: CameraMovementType;
    subjectPosition: SubjectPosition;
    shotDescription: string;
    environment: EnvironmentType;
    weather: WeatherCondition;
    timeOfDay: TimeOfDayChoice;
    environmentDetails: string;
    lighting: LightingType;
    lightingIntensity: 'low' | 'medium' | 'high';
    lightingDirection: string;
    shadowStyle: 'soft' | 'hard' | 'dramatic' | 'minimal';
    visualEffects: VisualEffectType[];
    motionStyle: MotionStyle;
    colorGrading: ColorGradingStyle;
    motionIntensity: 'subtle' | 'moderate' | 'dynamic' | 'extreme';
    transitionIn: TransitionType;
    transitionOut: TransitionType;
    musicMood: string;
    narrationStyle: NarrationStyle;
    thumbnailCandidate: boolean;
    thumbnailReason: string;
    promptOverride: string | null;
}
export interface DirectorPlan {
    /** Plan identifier */
    id: string;
    /** Original script ID */
    scriptId: string;
    /** Video title */
    title: string;
    globalStyle: string;
    globalColorGrading: ColorGradingStyle;
    globalMood: string;
    globalPacing: 'slow' | 'medium' | 'fast' | 'dynamic';
    targetAudience: string;
    scenes: DirectorScenePlan[];
    consistencyNotes: string;
    characterDescription: string;
    recurringElements: string[];
    colorPalette: string[];
    metadata: {
        totalDuration: number;
        sceneCount: number;
        thumbnailSceneIndex: number;
        generatedAt: string;
        model: string;
        processingTimeMs: number;
    };
}
export interface DirectorMemoryEntry {
    id: string;
    topic: string;
    planId: string;
    decisions: {
        preset: string;
        colorGrading: ColorGradingStyle;
        pacing: string;
        cameraStyles: CameraStyle[];
        lighting: LightingType[];
    };
    performance: {
        qualityScore: number;
        viewCount: number | null;
        engagement: number | null;
    };
    createdAt: string;
}
export interface DirectorMemory {
    entries: DirectorMemoryEntry[];
    maxEntries: number;
    version: string;
}
//# sourceMappingURL=director.types.d.ts.map