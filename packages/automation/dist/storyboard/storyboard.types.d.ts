export interface VisualComposition {
    /** What appears closest to camera */
    foreground: string;
    /** Middle layer of the scene */
    midground: string;
    /** Furthest visual layer */
    background: string;
    /** The primary subject of the frame */
    mainSubject: string;
    /** Secondary objects/characters in frame */
    supportingObjects: string[];
    /** Spatial depth arrangement description */
    depthLayout: 'flat' | 'shallow' | 'medium' | 'deep' | 'extreme';
    /** Directional lines guiding the eye */
    leadingLines: string;
    /** Empty space usage */
    negativeSpace: 'minimal' | 'balanced' | 'generous';
    /** Rule of thirds grid position of main subject */
    ruleOfThirdsPosition: 'top_left' | 'top_center' | 'top_right' | 'center_left' | 'center' | 'center_right' | 'bottom_left' | 'bottom_center' | 'bottom_right';
    /** Where the viewer's eye should land first */
    eyeFocusPoint: string;
}
export interface CameraInfo {
    /** Camera XYZ position relative to subject */
    position: 'ground_level' | 'waist_level' | 'eye_level' | 'overhead' | 'aerial' | 'crane_high' | 'floor';
    /** Camera height from ground */
    height: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    /** Distance from the main subject */
    distance: 'intimate' | 'close' | 'medium' | 'far' | 'very_far';
    /** Movement path description */
    path: string;
    /** Direction camera faces */
    direction: string;
    /** Any rotation (dutch angle, tilt) */
    rotation: 'level' | 'slight_tilt' | 'dutch_angle' | 'inverted';
    /** Lens choice */
    lens: string;
    /** Field of view description */
    fov: 'narrow' | 'standard' | 'wide' | 'ultra_wide';
}
export interface MotionPlan {
    /** How the main subject moves */
    subjectMotion: string;
    /** Camera movement description */
    cameraMotion: string;
    /** Background movement (parallax, environmental) */
    backgroundMotion: string;
    /** Secondary object movements */
    objectMotion: string;
    /** Particle/atmospheric movement */
    particleMotion: string;
    /** Overall motion speed feel */
    motionSpeed: 'frozen' | 'slow' | 'normal' | 'fast' | 'hyper';
}
export interface FrameTiming {
    /** Start time in seconds from video start */
    startTimeSec: number;
    /** End time in seconds */
    endTimeSec: number;
    /** Duration of this frame/shot */
    durationSec: number;
    /** Animation easing curve */
    animationCurve: 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'spring' | 'bounce';
    /** Time for transition into this frame */
    transitionInSec: number;
    /** Time for transition out of this frame */
    transitionOutSec: number;
}
export interface AssetRequirements {
    /** Characters needed in this frame */
    characters: string[];
    /** Vehicles visible */
    vehicles: string[];
    /** Buildings/structures */
    buildings: string[];
    /** Environment/nature assets */
    environmentAssets: string[];
    /** Props and small objects */
    props: string[];
    /** Logos or brand elements */
    logos: string[];
    /** Brand-specific assets */
    brandAssets: string[];
    /** Sound effects for this moment */
    soundEffects: string[];
}
export interface VisualStyle {
    /** Art direction style */
    artStyle: string;
    /** Rendering quality target */
    renderingStyle: 'photorealistic' | 'cinematic' | 'stylized' | 'illustration' | 'anime' | '3d_render';
    /** Quality tier */
    qualityTarget: '1080p' | '2k' | '4k';
    /** Aspect ratio */
    aspectRatio: '9:16' | '16:9' | '1:1' | '4:3';
    /** Lighting summary for this frame */
    lightingSummary: string;
    /** Color palette (hex codes) */
    colorPalette: string[];
    /** Emotional mood of the frame */
    mood: string;
}
export interface ContinuityNotes {
    /** Character appearance consistency */
    character: string;
    /** Environment consistency with adjacent scenes */
    environment: string;
    /** Lighting consistency */
    lighting: string;
    /** Weather consistency */
    weather: string;
    /** Vehicle appearance consistency */
    vehicle: string;
    /** Costume/wardrobe consistency */
    costume: string;
    /** Color grading consistency */
    colorGrading: string;
}
export interface PromptPackage {
    /** Optimized prompt for image generation (Flux, DALL-E, Midjourney) */
    imagePrompt: string;
    /** Optimized prompt for video generation (Veo, Runway, Kling, Luma, Pika) */
    videoPrompt: string;
    /** Optimized prompt for thumbnail generation */
    thumbnailPrompt: string;
    /** Negative prompt (what to avoid) */
    negativePrompt: string;
    /** Prompt for future 3D generation */
    prompt3D: string;
    /** Prompt for future animation generation */
    animationPrompt: string;
    /** Style suffix appended to all prompts */
    styleSuffix: string;
    /** Provider-specific prompt hints */
    providerHints: Record<string, string>;
}
export interface StoryboardFrame {
    frameId: string;
    sceneId: string;
    sceneOrder: number;
    shotNumber: number;
    frameDescription: string;
    framePurpose: string;
    sceneSummary: string;
    visualGoal: string;
    narrationText: string;
    expectedDuration: number;
    thumbnailCandidate: boolean;
    composition: VisualComposition;
    camera: CameraInfo;
    motion: MotionPlan;
    timing: FrameTiming;
    assets: AssetRequirements;
    style: VisualStyle;
    continuity: ContinuityNotes;
    prompts: PromptPackage;
}
export interface Storyboard {
    /** Storyboard identifier */
    id: string;
    /** Source director plan ID */
    directorPlanId: string;
    /** Video title */
    title: string;
    frames: StoryboardFrame[];
    globalStyle: VisualStyle;
    globalContinuity: ContinuityNotes;
    metadata: {
        totalFrames: number;
        totalDuration: number;
        thumbnailFrameIndex: number;
        aspectRatio: string;
        resolution: string;
        generatedAt: string;
        engine: string;
        processingTimeMs: number;
    };
}
export interface StoryboardExportPackage {
    /** Full storyboard JSON */
    storyboardJson: Storyboard;
    /** Timeline-only JSON (for video editors) */
    timelineJson: {
        totalDuration: number;
        frames: Array<{
            id: string;
            start: number;
            end: number;
            duration: number;
            transition: string;
        }>;
    };
    /** Prompts-only package (for generation engines) */
    promptPackage: {
        imagePrompts: Array<{
            sceneId: string;
            prompt: string;
            negative: string;
        }>;
        videoPrompts: Array<{
            sceneId: string;
            prompt: string;
            negative: string;
        }>;
        thumbnailPrompts: Array<{
            sceneId: string;
            prompt: string;
        }>;
    };
    /** Director reference (upstream data) */
    directorPackage: {
        planId: string;
        category: string;
        style: string;
        colorGrading: string;
        pacing: string;
    };
    /** Preview package (for UI display) */
    previewPackage: {
        frames: Array<{
            id: string;
            order: number;
            description: string;
            duration: number;
            camera: string;
            lighting: string;
            mood: string;
            thumbnail: boolean;
        }>;
    };
}
export interface StoryboardMemoryEntry {
    id: string;
    title: string;
    storyboardId: string;
    frameCount: number;
    category: string;
    style: string;
    qualityScore: number;
    createdAt: string;
}
//# sourceMappingURL=storyboard.types.d.ts.map