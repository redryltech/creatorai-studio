// ============================================================
// CreatorAI Studio — Director Planner
// ============================================================
// The intelligence core. Analyzes a script and produces a
// complete DirectorPlan with cinematic decisions for every scene.
//
// Decision cascade:
//   1. Detect content category (automotive, motivational, tech, etc.)
//   2. Select global style, pacing, color grading
//   3. For each scene: camera, lens, lighting, environment, FX, transitions
//   4. Ensure visual consistency across scenes
//   5. Select best thumbnail candidate
//
// All decisions are deterministic and explainable.
// No external API calls — pure algorithmic planning.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { ScriptPackage } from '../types/automation.types';
import type {
  DirectorPlan,
  DirectorScenePlan,
  SceneImportance,
  CameraStyle,
  LensChoice,
  CameraMovementType,
  SubjectPosition,
  EnvironmentType,
  WeatherCondition,
  TimeOfDayChoice,
  LightingType,
  VisualEffectType,
  MotionStyle,
  ColorGradingStyle,
  TransitionType,
  NarrationStyle,
} from './director.types';

const log = Logger.for('DirectorPlanner');

// ── Content category detection ──

interface CategoryProfile {
  style: string;
  colorGrading: ColorGradingStyle;
  pacing: 'slow' | 'medium' | 'fast' | 'dynamic';
  defaultCamera: CameraStyle[];
  defaultLens: LensChoice[];
  defaultLighting: LightingType[];
  defaultEnvironments: EnvironmentType[];
  defaultEffects: VisualEffectType[];
  defaultMotion: MotionStyle[];
  audience: string;
}

const CATEGORY_PROFILES: Record<string, CategoryProfile> = {
  automotive: {
    style: 'premium automotive commercial, cinematic driving footage',
    colorGrading: 'teal_orange', pacing: 'dynamic', audience: 'car/bike enthusiasts',
    defaultCamera: ['tracking', 'orbit', 'drone', 'dolly', 'hero_shot', 'macro'],
    defaultLens: ['35mm', '24mm', '85mm', 'telephoto', 'macro'],
    defaultLighting: ['golden_hour', 'dramatic', 'rim_light', 'studio', 'neon'],
    defaultEnvironments: ['highway', 'race_track', 'luxury_garage', 'mountains', 'night_city'],
    defaultEffects: ['depth_of_field', 'motion_blur', 'lens_flare', 'bokeh', 'god_rays'],
    defaultMotion: ['driving', 'drifting', 'slow_motion', 'fast_motion', 'static_pose'],
  },
  motivational: {
    style: 'inspirational cinematic, epic motivational',
    colorGrading: 'cinematic', pacing: 'dynamic', audience: 'personal development seekers',
    defaultCamera: ['crane', 'push', 'dolly', 'drone', 'hero_shot', 'tracking'],
    defaultLens: ['35mm', '24mm', '50mm', '85mm'],
    defaultLighting: ['golden_hour', 'dramatic', 'rim_light', 'back_light', 'volumetric_fog'],
    defaultEnvironments: ['mountains', 'city', 'studio', 'countryside', 'ocean'],
    defaultEffects: ['god_rays', 'lens_flare', 'depth_of_field', 'bloom'],
    defaultMotion: ['running', 'walking', 'rising', 'static_pose', 'slow_motion'],
  },
  technology: {
    style: 'sleek tech showcase, futuristic',
    colorGrading: 'cold', pacing: 'medium', audience: 'tech enthusiasts',
    defaultCamera: ['orbit', 'dolly', 'push', 'macro', 'static'],
    defaultLens: ['macro', '50mm', '85mm', '35mm'],
    defaultLighting: ['studio', 'neon', 'rim_light', 'softbox', 'blue_hour'],
    defaultEnvironments: ['studio', 'cyberpunk', 'office', 'night_city'],
    defaultEffects: ['depth_of_field', 'bokeh', 'bloom', 'chromatic_aberration'],
    defaultMotion: ['static_pose', 'subtle_movement', 'slow_motion', 'spinning'],
  },
  sports: {
    style: 'high-energy sports commercial',
    colorGrading: 'hdr', pacing: 'fast', audience: 'athletes and fans',
    defaultCamera: ['tracking', 'handheld', 'fpv', 'crane', 'hero_shot', 'zoom'],
    defaultLens: ['24mm', '35mm', 'telephoto', '135mm'],
    defaultLighting: ['hard_light', 'dramatic', 'rim_light', 'golden_hour'],
    defaultEnvironments: ['arena', 'race_track', 'mountains', 'beach', 'city'],
    defaultEffects: ['motion_blur', 'dust_particles', 'depth_of_field', 'lens_flare'],
    defaultMotion: ['running', 'jumping', 'fast_motion', 'slow_motion', 'driving'],
  },
  luxury: {
    style: 'premium luxury brand aesthetic',
    colorGrading: 'warm', pacing: 'slow', audience: 'affluent consumers',
    defaultCamera: ['dolly', 'orbit', 'crane', 'static', 'macro'],
    defaultLens: ['85mm', '50mm', 'macro', '135mm'],
    defaultLighting: ['softbox', 'rim_light', 'golden_hour', 'studio', 'back_light'],
    defaultEnvironments: ['luxury_garage', 'studio', 'beach', 'city', 'rooftop'],
    defaultEffects: ['bokeh', 'depth_of_field', 'bloom', 'vignette'],
    defaultMotion: ['static_pose', 'subtle_movement', 'slow_motion', 'floating'],
  },
  horror: {
    style: 'dark suspenseful horror',
    colorGrading: 'noir', pacing: 'slow', audience: 'thriller fans',
    defaultCamera: ['push', 'handheld', 'static', 'dolly', 'zoom'],
    defaultLens: ['24mm', '35mm', '50mm'],
    defaultLighting: ['moonlight', 'low_key', 'back_light', 'hard_light'],
    defaultEnvironments: ['forest', 'warehouse', 'night_city', 'village', 'factory'],
    defaultEffects: ['fog_effect', 'vignette', 'film_grain', 'chromatic_aberration'],
    defaultMotion: ['walking', 'static_pose', 'subtle_movement', 'slow_motion'],
  },
  travel: {
    style: 'wanderlust travel film cinematography',
    colorGrading: 'warm', pacing: 'medium', audience: 'travel enthusiasts',
    defaultCamera: ['drone', 'tracking', 'crane', 'dolly', 'handheld'],
    defaultLens: ['24mm', 'ultra_wide', '35mm', '50mm'],
    defaultLighting: ['golden_hour', 'natural', 'blue_hour', 'hdr'],
    defaultEnvironments: ['mountains', 'beach', 'ocean', 'desert', 'countryside', 'city'],
    defaultEffects: ['depth_of_field', 'lens_flare', 'god_rays', 'bloom'],
    defaultMotion: ['walking', 'driving', 'flying', 'slow_motion'],
  },
  documentary: {
    style: 'observational documentary cinematography',
    colorGrading: 'natural', pacing: 'medium', audience: 'knowledge seekers',
    defaultCamera: ['static', 'tracking', 'handheld', 'crane', 'drone'],
    defaultLens: ['35mm', '50mm', '24mm', 'telephoto'],
    defaultLighting: ['natural', 'soft_light', 'golden_hour', 'hdr'],
    defaultEnvironments: ['countryside', 'city', 'village', 'factory', 'ocean'],
    defaultEffects: ['depth_of_field', 'film_grain'],
    defaultMotion: ['walking', 'static_pose', 'subtle_movement'],
  },
  cinematic_generic: {
    style: 'Hollywood cinematic quality',
    colorGrading: 'cinematic', pacing: 'dynamic', audience: 'general',
    defaultCamera: ['dolly', 'crane', 'tracking', 'push', 'orbit'],
    defaultLens: ['35mm', '50mm', '85mm', '24mm'],
    defaultLighting: ['dramatic', 'golden_hour', 'rim_light', 'volumetric_fog'],
    defaultEnvironments: ['city', 'studio', 'mountains', 'countryside'],
    defaultEffects: ['depth_of_field', 'lens_flare', 'god_rays', 'bloom'],
    defaultMotion: ['walking', 'slow_motion', 'static_pose', 'subtle_movement'],
  },
};

// ── Topic → Category keyword map ──

const TOPIC_KEYWORDS: Array<{ keywords: string[]; category: string }> = [
  { keywords: ['car', 'motorcycle', 'bike', 'vehicle', 'engine', 'wheel', 'drive', 'ride', 'kawasaki', 'bmw', 'ferrari', 'porsche', 'honda', 'yamaha', 'ducati', 'exhaust', 'horsepower', 'racing', 'suv', 'sedan', 'motor'], category: 'automotive' },
  { keywords: ['sport', 'athlete', 'fitness', 'gym', 'workout', 'football', 'cricket', 'basketball', 'running', 'swim', 'boxing', 'martial'], category: 'sports' },
  { keywords: ['luxury', 'premium', 'elegant', 'fashion', 'brand', 'diamond', 'gold', 'watch', 'perfume', 'yacht', 'mansion'], category: 'luxury' },
  { keywords: ['travel', 'explore', 'adventure', 'landscape', 'destination', 'wanderlust', 'backpack', 'tourism', 'vacation'], category: 'travel' },
  { keywords: ['ai', 'technology', 'tech', 'software', 'app', 'digital', 'innovation', 'robot', 'computer', 'startup', 'saas', 'coding'], category: 'technology' },
  { keywords: ['horror', 'dark', 'scary', 'ghost', 'nightmare', 'creepy', 'thriller', 'murder', 'crime', 'suspense'], category: 'horror' },
  { keywords: ['nature', 'wildlife', 'ocean', 'forest', 'animal', 'planet', 'earth', 'documentary'], category: 'documentary' },
  { keywords: ['motivat', 'inspir', 'success', 'winner', 'champion', 'discipline', 'mindset', 'never quit', 'hustle', 'grind', 'dream', 'goal', 'achieve'], category: 'motivational' },
];

// ── Emotion → cinematic mapping ──

const EMOTION_MAP: Record<string, {
  camera: CameraStyle;
  lens: LensChoice;
  lighting: LightingType;
  movement: CameraMovementType;
  narrationStyle: NarrationStyle;
  motionStyle: MotionStyle;
  timeOfDay: TimeOfDayChoice;
  effects: VisualEffectType[];
}> = {
  curiosity:     { camera: 'push', lens: '50mm', lighting: 'natural', movement: 'push_in', narrationStyle: 'conversational', motionStyle: 'subtle_movement', timeOfDay: 'morning', effects: ['depth_of_field'] },
  surprise:      { camera: 'handheld', lens: '35mm', lighting: 'dramatic', movement: 'whip_pan', narrationStyle: 'energetic', motionStyle: 'fast_motion', timeOfDay: 'afternoon', effects: ['motion_blur', 'lens_flare'] },
  determination: { camera: 'tracking', lens: '35mm', lighting: 'hard_light', movement: 'tracking_forward', narrationStyle: 'authoritative', motionStyle: 'running', timeOfDay: 'midday', effects: ['depth_of_field', 'dust_particles'] },
  inspiration:   { camera: 'crane', lens: '24mm', lighting: 'golden_hour', movement: 'crane_up', narrationStyle: 'inspirational', motionStyle: 'rising', timeOfDay: 'golden_hour', effects: ['god_rays', 'lens_flare', 'bloom'] },
  excitement:    { camera: 'fpv', lens: '24mm', lighting: 'neon', movement: 'fpv_forward', narrationStyle: 'energetic', motionStyle: 'fast_motion', timeOfDay: 'night', effects: ['motion_blur', 'lens_flare', 'bokeh'] },
  sadness:       { camera: 'static', lens: '85mm', lighting: 'moonlight', movement: 'static', narrationStyle: 'calm', motionStyle: 'slow_motion', timeOfDay: 'dusk', effects: ['depth_of_field', 'film_grain', 'vignette'] },
  anger:         { camera: 'handheld', lens: '24mm', lighting: 'hard_light', movement: 'handheld_intense', narrationStyle: 'urgent', motionStyle: 'fast_motion', timeOfDay: 'night', effects: ['motion_blur', 'chromatic_aberration'] },
  joy:           { camera: 'drone', lens: '24mm', lighting: 'golden_hour', movement: 'drone_ascend', narrationStyle: 'energetic', motionStyle: 'jumping', timeOfDay: 'golden_hour', effects: ['lens_flare', 'bloom'] },
  fear:          { camera: 'push', lens: '24mm', lighting: 'low_key', movement: 'push_in', narrationStyle: 'whisper', motionStyle: 'walking', timeOfDay: 'midnight', effects: ['fog_effect', 'vignette', 'film_grain'] },
  hope:          { camera: 'crane', lens: '35mm', lighting: 'golden_hour', movement: 'crane_up', narrationStyle: 'inspirational', motionStyle: 'rising', timeOfDay: 'dawn', effects: ['god_rays', 'bloom'] },
  neutral:       { camera: 'static', lens: '50mm', lighting: 'natural', movement: 'static', narrationStyle: 'conversational', motionStyle: 'static_pose', timeOfDay: 'afternoon', effects: ['depth_of_field'] },
};

// ════════════════════════════════════════════════════════════
// Director Planner — the core planning engine
// ════════════════════════════════════════════════════════════

export class DirectorPlanner {
  /**
   * Produce a complete DirectorPlan from a ScriptPackage.
   * Pure function — no side effects, no API calls.
   */
  static plan(script: ScriptPackage, title?: string): DirectorPlan {
    const startTime = performance.now();

    // ── Step 1: Detect content category ──
    const category = DirectorPlanner.detectCategory(title ?? script.fullNarration, script);
    const profile = CATEGORY_PROFILES[category] ?? CATEGORY_PROFILES.cinematic_generic!;

    log.info('Director planning', {
      category,
      scenes: script.scenes.length,
      style: profile.style,
      pacing: profile.pacing,
    });

    // ── Step 2: Plan each scene ──
    const scenes = script.scenes.map((scene, index) =>
      DirectorPlanner.planScene(scene, index, script.scenes.length, profile, category),
    );

    // ── Step 3: Ensure transition coherence ──
    DirectorPlanner.harmonizeTransitions(scenes);

    // ── Step 4: Select thumbnail candidate ──
    const thumbnailIndex = DirectorPlanner.selectThumbnail(scenes);
    scenes[thumbnailIndex]!.thumbnailCandidate = true;
    scenes[thumbnailIndex]!.thumbnailReason = 'Best visual impact + hero shot + peak emotion';

    // ── Step 5: Build consistency notes ──
    const consistencyNotes = DirectorPlanner.buildConsistencyNotes(scenes, profile);

    const processingTimeMs = Math.round(performance.now() - startTime);

    return {
      id: generateId(ID_PREFIXES.pipeline),
      scriptId: script.id,
      title: title ?? script.hook.text,
      globalStyle: profile.style,
      globalColorGrading: profile.colorGrading,
      globalMood: script.metadata.tone,
      globalPacing: profile.pacing,
      targetAudience: profile.audience,
      scenes,
      consistencyNotes,
      characterDescription: DirectorPlanner.extractCharacterDescription(script),
      recurringElements: DirectorPlanner.findRecurringElements(script),
      colorPalette: DirectorPlanner.getColorPalette(profile.colorGrading),
      metadata: {
        totalDuration: scenes.reduce((s, sc) => s + sc.sceneDuration, 0),
        sceneCount: scenes.length,
        thumbnailSceneIndex: thumbnailIndex,
        generatedAt: new Date().toISOString(),
        model: 'director-planner-v1',
        processingTimeMs,
      },
    };
  }

  // ── Scene Planner ──────────────────────────────────────

  private static planScene(
    scene: ScriptPackage['scenes'][0],
    index: number,
    totalScenes: number,
    profile: CategoryProfile,
    category: string,
  ): DirectorScenePlan {
    const emotion = scene.emotion.toLowerCase();
    const emotionDefaults = EMOTION_MAP[emotion] ?? EMOTION_MAP.neutral!;
    const importance = DirectorPlanner.determineImportance(index, totalScenes);

    // Use category profile with emotion overrides for variety
    const cameraIdx = index % profile.defaultCamera.length;
    const lensIdx = index % profile.defaultLens.length;
    const lightIdx = index % profile.defaultLighting.length;
    const envIdx = index % profile.defaultEnvironments.length;
    const effectCount = Math.min(3, profile.defaultEffects.length);
    const effectStart = (index * 2) % Math.max(profile.defaultEffects.length, 1);

    // Select effects — blend category defaults with emotion-specific
    const effects: VisualEffectType[] = [];
    for (let i = 0; i < effectCount; i++) {
      effects.push(profile.defaultEffects[(effectStart + i) % profile.defaultEffects.length]!);
    }
    // Add one emotion-specific effect if not already present
    for (const eff of emotionDefaults.effects) {
      if (!effects.includes(eff) && effects.length < 4) {
        effects.push(eff);
      }
    }

    // Camera — blend category + emotion
    const cameraStyle = importance === 'hook' ? 'hero_shot' :
      (index % 2 === 0 ? profile.defaultCamera[cameraIdx]! : emotionDefaults.camera);

    // Lens — close-ups for emotional scenes, wide for establishing
    const lens = importance === 'hook' ? profile.defaultLens[0]! :
      (emotion === 'excitement' || emotion === 'determination' ? emotionDefaults.lens : profile.defaultLens[lensIdx]!);

    // Camera movement — emotion-driven
    const movement = DirectorPlanner.selectCameraMovement(cameraStyle, emotion, importance);

    // Environment — detect from visual notes or use category default
    const environment = DirectorPlanner.detectEnvironment(scene.visualNotes) ?? profile.defaultEnvironments[envIdx]!;

    // Time of day — emotion-driven
    const timeOfDay = emotionDefaults.timeOfDay;

    // Motion style
    const motionIdx = index % profile.defaultMotion.length;
    const motionStyle = importance === 'climax' ? emotionDefaults.motionStyle : profile.defaultMotion[motionIdx]!;

    return {
      sceneId: scene.id,
      sceneOrder: scene.order,
      sceneGoal: DirectorPlanner.inferGoal(scene, importance),
      sceneEmotion: emotion,
      sceneImportance: importance,
      sceneDuration: scene.duration,
      narration: scene.narration,
      cameraStyle,
      lens,
      cameraMovement: movement,
      subjectPosition: DirectorPlanner.selectSubjectPosition(importance, cameraStyle),
      shotDescription: `${cameraStyle} shot with ${lens} lens, ${movement.replace(/_/g, ' ')}`,
      environment,
      weather: DirectorPlanner.selectWeather(emotion),
      timeOfDay,
      environmentDetails: scene.visualNotes,
      lighting: importance === 'hook' ? 'dramatic' : profile.defaultLighting[lightIdx]!,
      lightingIntensity: importance === 'climax' || importance === 'hook' ? 'high' : 'medium',
      lightingDirection: importance === 'hook' ? 'front-side 45°' : 'natural ambient',
      shadowStyle: emotion === 'determination' || emotion === 'anger' ? 'dramatic' : 'soft',
      visualEffects: effects,
      motionStyle,
      colorGrading: profile.colorGrading,
      motionIntensity: DirectorPlanner.selectMotionIntensity(importance, emotion, profile.pacing),
      transitionIn: index === 0 ? 'fade' : 'cut',
      transitionOut: index === totalScenes - 1 ? 'fade' : 'cut',
      musicMood: emotion,
      narrationStyle: emotionDefaults.narrationStyle,
      thumbnailCandidate: false,
      thumbnailReason: '',
      promptOverride: null,
    };
  }

  // ── Helpers ────────────────────────────────────────────

  static detectCategory(text: string, script: ScriptPackage): string {
    const fullText = (text + ' ' + script.scenes.map((s) => s.narration + ' ' + s.visualNotes).join(' ')).toLowerCase();

    let bestCategory = 'cinematic_generic';
    let bestScore = 0;

    for (const rule of TOPIC_KEYWORDS) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (fullText.includes(kw)) score += 10;
      }
      if (score > bestScore) {
        bestScore = score;
        bestCategory = rule.category;
      }
    }

    return bestCategory;
  }

  private static determineImportance(index: number, total: number): SceneImportance {
    if (index === 0) return 'hook';
    if (index === total - 1) return 'cta';
    if (index === Math.floor(total / 2)) return 'climax';
    if (index < total / 2) return 'buildup';
    return 'resolution';
  }

  private static selectCameraMovement(camera: CameraStyle, emotion: string, importance: SceneImportance): CameraMovementType {
    // Importance-based overrides
    if (importance === 'hook') return 'dolly_in';
    if (importance === 'cta') return 'pull_back';
    if (importance === 'climax') return 'crane_up';

    // Camera-style-based defaults
    const map: Record<CameraStyle, CameraMovementType> = {
      static: 'static', handheld: 'handheld_subtle', drone: 'drone_orbit',
      orbit: 'orbit_right', tracking: 'tracking_forward', dolly: 'dolly_in',
      crane: 'crane_up', fpv: 'fpv_forward', push: 'push_in', pull: 'pull_back',
      zoom: 'zoom_in', macro: 'push_in', hero_shot: 'dolly_in',
    };
    return map[camera] ?? 'static';
  }

  private static selectSubjectPosition(importance: SceneImportance, camera: CameraStyle): SubjectPosition {
    if (importance === 'hook') return 'center';
    if (camera === 'drone') return 'center';
    if (camera === 'macro') return 'full_frame';
    const positions: SubjectPosition[] = ['center', 'left_third', 'right_third', 'center', 'foreground'];
    return positions[Math.floor(Math.random() * positions.length)]!;
  }

  private static selectWeather(emotion: string): WeatherCondition {
    const map: Record<string, WeatherCondition> = {
      sadness: 'overcast', anger: 'storm', fear: 'fog',
      joy: 'clear', excitement: 'clear', determination: 'clear',
      inspiration: 'clear', curiosity: 'clear', hope: 'mist', neutral: 'clear',
    };
    return map[emotion] ?? 'clear';
  }

  private static selectMotionIntensity(
    importance: SceneImportance,
    emotion: string,
    pacing: string,
  ): 'subtle' | 'moderate' | 'dynamic' | 'extreme' {
    if (importance === 'climax') return 'dynamic';
    if (pacing === 'fast') return emotion === 'excitement' ? 'extreme' : 'dynamic';
    if (pacing === 'slow') return 'subtle';
    return 'moderate';
  }

  private static detectEnvironment(visualNotes: string): EnvironmentType | null {
    const text = visualNotes.toLowerCase();
    const rules: Array<{ keywords: string[]; env: EnvironmentType }> = [
      { keywords: ['city', 'urban', 'street', 'building', 'skyline'], env: 'city' },
      { keywords: ['mountain', 'peak', 'hill', 'cliff'], env: 'mountains' },
      { keywords: ['highway', 'road', 'freeway', 'lane'], env: 'highway' },
      { keywords: ['studio', 'dark background', 'backdrop'], env: 'studio' },
      { keywords: ['garage', 'workshop', 'showroom'], env: 'luxury_garage' },
      { keywords: ['race', 'track', 'circuit'], env: 'race_track' },
      { keywords: ['forest', 'tree', 'jungle', 'wood'], env: 'forest' },
      { keywords: ['beach', 'coast', 'shore'], env: 'beach' },
      { keywords: ['ocean', 'sea', 'water'], env: 'ocean' },
      { keywords: ['desert', 'sand', 'dune'], env: 'desert' },
      { keywords: ['snow', 'ice', 'winter'], env: 'snow' },
      { keywords: ['sunset', 'sunrise', 'field'], env: 'countryside' },
      { keywords: ['night', 'neon'], env: 'night_city' },
      { keywords: ['airport', 'plane', 'runway'], env: 'airport' },
      { keywords: ['space', 'galaxy', 'star'], env: 'space' },
    ];
    for (const rule of rules) {
      if (rule.keywords.some((kw) => text.includes(kw))) return rule.env;
    }
    return null;
  }

  private static inferGoal(scene: ScriptPackage['scenes'][0], importance: SceneImportance): string {
    const goals: Record<SceneImportance, string> = {
      hook: 'Capture attention immediately — the first 2 seconds decide everything',
      buildup: 'Build narrative momentum and emotional investment',
      climax: 'Deliver the peak emotional or visual impact',
      resolution: 'Resolve the narrative arc and reinforce the message',
      cta: 'Drive viewer action — subscribe, comment, share, follow',
    };
    return goals[importance];
  }

  private static harmonizeTransitions(scenes: DirectorScenePlan[]): void {
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]!;
      const next = scenes[i + 1];

      if (i === 0) {
        scene.transitionIn = 'fade';
      }

      if (!next) {
        scene.transitionOut = 'fade';
        continue;
      }

      // Match cut when same environment
      if (scene.environment === next.environment) {
        scene.transitionOut = 'match_cut';
        next.transitionIn = 'match_cut';
      }
      // Flash for high energy transitions
      else if (scene.motionIntensity === 'extreme' || scene.motionIntensity === 'dynamic') {
        scene.transitionOut = 'whip_pan';
        next.transitionIn = 'whip_pan';
      }
      // Cross dissolve for mood changes
      else if (scene.sceneEmotion !== next.sceneEmotion) {
        scene.transitionOut = 'cross_dissolve';
        next.transitionIn = 'cross_dissolve';
      }
      // Default: clean cut
      else {
        scene.transitionOut = 'cut';
        next.transitionIn = 'cut';
      }
    }
  }

  private static selectThumbnail(scenes: DirectorScenePlan[]): number {
    let bestIdx = 0;
    let bestScore = 0;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i]!;
      let score = 0;

      // Prefer hero shots
      if (scene.cameraStyle === 'hero_shot') score += 30;
      // Prefer dramatic lighting
      if (['dramatic', 'golden_hour', 'rim_light'].includes(scene.lighting)) score += 20;
      // Prefer hook or climax
      if (scene.sceneImportance === 'hook') score += 15;
      if (scene.sceneImportance === 'climax') score += 25;
      // Prefer wide/medium shots
      if (['24mm', '35mm'].includes(scene.lens)) score += 10;
      // Prefer visual effects
      score += scene.visualEffects.length * 5;
      // Penalize CTA scenes
      if (scene.sceneImportance === 'cta') score -= 20;

      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    return bestIdx;
  }

  private static buildConsistencyNotes(scenes: DirectorScenePlan[], profile: CategoryProfile): string {
    return [
      `Global style: ${profile.style}`,
      `Color grading: ${profile.colorGrading} applied consistently to all scenes`,
      `Pacing: ${profile.pacing} — maintain energy level throughout`,
      `Transitions: harmonized for visual flow`,
      `Lighting: maintain ${profile.defaultLighting[0]} as the dominant look`,
      `Camera: vary between ${profile.defaultCamera.slice(0, 3).join(', ')} for visual interest`,
    ].join('. ');
  }

  private static extractCharacterDescription(script: ScriptPackage): string {
    const text = script.fullNarration.toLowerCase();
    if (text.includes('rider') || text.includes('biker')) return 'motorcycle rider in full gear';
    if (text.includes('athlete') || text.includes('runner')) return 'athletic person in sportswear';
    if (text.includes('person') || text.includes('someone')) return 'determined individual';
    return 'subject appropriate to the scene';
  }

  private static findRecurringElements(script: ScriptPackage): string[] {
    const elements: string[] = [];
    const text = script.fullNarration.toLowerCase();
    if (text.includes('success') || text.includes('win')) elements.push('victory/triumph imagery');
    if (text.includes('journey') || text.includes('path')) elements.push('road/path symbolism');
    if (text.includes('light') || text.includes('fire')) elements.push('light/fire metaphor');
    if (text.includes('strength') || text.includes('power')) elements.push('strength imagery');
    return elements.length > 0 ? elements : ['consistent visual tone', 'matching color palette'];
  }

  private static getColorPalette(grading: ColorGradingStyle): string[] {
    const palettes: Record<string, string[]> = {
      cinematic: ['#008B8B', '#FF8C00', '#1a1a2e', '#e0e0e0', '#333333'],
      teal_orange: ['#00CED1', '#FF6347', '#1a2a3a', '#FFA07A', '#2F4F4F'],
      kodak: ['#DAA520', '#8B4513', '#F5DEB3', '#D2691E', '#FFE4B5'],
      fuji: ['#4682B4', '#20B2AA', '#F0F8FF', '#5F9EA0', '#B0C4DE'],
      hdr: ['#FF4500', '#00FF00', '#1E90FF', '#FFD700', '#000000'],
      noir: ['#1a1a1a', '#4a4a4a', '#c0c0c0', '#2a2a2a', '#808080'],
      warm: ['#FFD700', '#FF8C00', '#B8860B', '#FFF8DC', '#CD853F'],
      cold: ['#4169E1', '#1C1C3A', '#708090', '#B0C4DE', '#E0E8F0'],
      vintage: ['#D4A574', '#8B6914', '#654321', '#F5DEB3', '#A0522D'],
      natural: ['#228B22', '#87CEEB', '#F5F5DC', '#8B4513', '#90EE90'],
      desaturated: ['#808080', '#A0A0A0', '#404040', '#C0C0C0', '#606060'],
      vibrant: ['#FF4500', '#00FF00', '#1E90FF', '#FFD700', '#FF1493'],
      cyberpunk: ['#FF00FF', '#00FF41', '#FF1493', '#0000FF', '#7B68EE'],
      pastel: ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#FFDAB9'],
      bleach_bypass: ['#A0A0A0', '#D3D3D3', '#696969', '#C8C8C8', '#808080'],
    };
    return palettes[grading] ?? palettes.natural!;
  }
}
