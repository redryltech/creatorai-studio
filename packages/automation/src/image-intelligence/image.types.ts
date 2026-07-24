// ============================================================
// CreatorAI Studio — Image Intelligence Engine Types
// ============================================================
// Production-ready image planning before any generation.
// Transforms storyboard frames into provider-specific image plans.
// ============================================================

// ── Composition ───────────────────────────────────────────

export interface ImageComposition {
  ruleOfThirds: { subjectPosition: string; gridCell: string };
  foreground: { element: string; depth: number; blur: number };
  midground: { element: string; depth: number };
  background: { element: string; depth: number; blur: number };
  subjectPlacement: string;
  depthOfField: 'shallow' | 'medium' | 'deep' | 'infinite';
  framing: 'tight' | 'standard' | 'wide' | 'extreme_wide';
  leadingLines: string;
  negativeSpace: number; // 0-1
}

// ── Camera ────────────────────────────────────────────────

export interface ImageCamera {
  angle: 'eye_level' | 'low_angle' | 'high_angle' | 'birds_eye' | 'worms_eye' | 'dutch' | 'overhead';
  lens: string;
  fov: number;
  distance: 'extreme_close' | 'close' | 'medium' | 'full' | 'wide' | 'extreme_wide';
  height: number; // meters
  tracking: string;
  motion: string;
  zoom: 'none' | 'subtle' | 'moderate' | 'dramatic';
}

// ── Lighting ──────────────────────────────────────────────

export interface ImageLighting {
  keyLight: { type: string; intensity: number; angle: string; color: string };
  fillLight: { type: string; intensity: number; color: string };
  backLight: { type: string; intensity: number; color: string };
  ambientLight: number;
  shadowHardness: number; // 0-1
  lightingMood: string;
  timeOfDay: string;
  lightingSummary: string;
}

// ── Style ─────────────────────────────────────────────────

export type ImageStyle =
  | 'photorealistic' | 'cinematic' | 'anime' | '3d_render'
  | 'pixar' | 'comic' | 'oil_painting' | 'watercolor'
  | 'sketch' | 'hyperrealistic' | 'editorial' | 'documentary';

export interface ImageStyleSpec {
  primary: ImageStyle;
  secondary: ImageStyle | null;
  renderQuality: 'standard' | 'high' | 'ultra' | 'maximum';
  filmGrain: number; // 0-1
  chromatic: number; // 0-1
  vignette: number; // 0-1
  stylePrompt: string;
}

// ── Color ─────────────────────────────────────────────────

export interface ImageColorSpec {
  palette: string[]; // hex codes
  dominantColor: string;
  contrast: 'low' | 'medium' | 'high' | 'extreme';
  saturation: 'desaturated' | 'muted' | 'natural' | 'vivid' | 'hyper';
  exposure: 'underexposed' | 'normal' | 'slightly_over' | 'overexposed';
  mood: string;
  temperature: 'cool' | 'neutral' | 'warm' | 'golden';
  gradingLut: string;
}

// ── Identity Lock ─────────────────────────────────────────

export interface IdentityLock {
  characterLock: Array<{ entityId: string; identityBlock: string; seed: number }>;
  vehicleLock: Array<{ entityId: string; identityBlock: string; seed: number; color: string }>;
  objectLock: Array<{ name: string; description: string }>;
  brandLock: { colors: string[]; style: string };
  globalSeed: number;
  sceneSeed: number;
  consistencyScore: number;
}

// ── Quality ───────────────────────────────────────────────

export interface ImageQualityMetrics {
  imageQuality: number;
  promptQuality: number;
  compositionScore: number;
  lightingScore: number;
  realismScore: number;
  consistencyScore: number;
  overallScore: number;
}

// ── Environment ───────────────────────────────────────────

export interface ImageEnvironment {
  setting: string;
  weather: string;
  timeOfDay: string;
  atmosphere: string;
  terrain: string;
  skyCondition: string;
  particleEffects: string[];
}

// ── Pose ──────────────────────────────────────────────────

export interface PoseSpec {
  bodyPose: string;
  handPosition: string;
  headDirection: string;
  eyeDirection: string;
  expression: string;
  dynamicAction: string;
}

// ════════════════════════════════════════════════════════════
// Image Scene Plan — complete plan for one scene image
// ════════════════════════════════════════════════════════════

export interface ImageScenePlan {
  sceneId: string;
  sceneOrder: number;
  composition: ImageComposition;
  camera: ImageCamera;
  lighting: ImageLighting;
  style: ImageStyleSpec;
  color: ImageColorSpec;
  environment: ImageEnvironment;
  identity: IdentityLock;
  pose: PoseSpec | null;
  quality: ImageQualityMetrics;
  seed: number;
  aspectRatio: string;
  resolution: string;
  masterPrompt: string;
  negativePrompt: string;
  referencePrompt: string;
  providerHints: Record<string, string>;
  confidence: number;
}

// ════════════════════════════════════════════════════════════
// Image Planning Package — complete output
// ════════════════════════════════════════════════════════════

export interface ImagePlanningPackage {
  id: string;
  productionTitle: string;
  scenes: ImageScenePlan[];
  globalStyle: ImageStyleSpec;
  globalColor: ImageColorSpec;
  globalIdentity: IdentityLock;
  metadata: {
    totalScenes: number;
    avgQuality: number;
    avgConfidence: number;
    generatedAt: string;
    engine: string;
    processingTimeMs: number;
  };
}

// ── Export & Memory ────────────────────────────────────────

export interface ImageExportFormats {
  fullJson: ImagePlanningPackage;
  compactJson: Array<{ sceneId: string; quality: number; confidence: number; promptLength: number }>;
  promptsOnly: Array<{ sceneId: string; masterPrompt: string; negativePrompt: string; providerHints: Record<string, string> }>;
  debugPackage: { scenes: number; avgQuality: number; identityLocks: number };
}

export interface ImageMemoryEntry {
  id: string;
  productionTitle: string;
  packageId: string;
  avgQuality: number;
  avgConfidence: number;
  createdAt: string;
}
