// ============================================================
// CreatorAI Studio — Storyboard Planner
// ============================================================
// Transforms a DirectorPlan into a complete Storyboard with
// visual composition, camera specs, motion plans, timing,
// asset requirements, continuity notes, and optimized prompts
// for every frame.
//
// This is the single source of truth before any generation.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
const log = Logger.for('StoryboardPlanner');
// ── Subject position → Rule-of-thirds mapping ──
const POSITION_TO_ROT = {
    center: 'center', left_third: 'center_left', right_third: 'center_right',
    top_third: 'top_center', bottom_third: 'bottom_center',
    foreground: 'bottom_center', midground: 'center', background: 'top_center',
    off_center_left: 'center_left', off_center_right: 'center_right',
    silhouette: 'center', full_frame: 'center',
};
// ── Camera style → position mapping ──
const CAMERA_POSITION = {
    static: 'eye_level', handheld: 'eye_level', drone: 'aerial',
    orbit: 'eye_level', tracking: 'eye_level', dolly: 'eye_level',
    crane: 'crane_high', fpv: 'eye_level', push: 'eye_level',
    pull: 'eye_level', zoom: 'eye_level', macro: 'waist_level',
    hero_shot: 'ground_level',
};
const CAMERA_HEIGHT = {
    static: 'medium', handheld: 'medium', drone: 'very_high',
    orbit: 'medium', tracking: 'medium', dolly: 'medium',
    crane: 'high', fpv: 'medium', push: 'medium',
    pull: 'medium', zoom: 'medium', macro: 'low',
    hero_shot: 'low',
};
const CAMERA_DISTANCE = {
    static: 'medium', handheld: 'close', drone: 'very_far',
    orbit: 'medium', tracking: 'medium', dolly: 'medium',
    crane: 'far', fpv: 'close', push: 'medium',
    pull: 'far', zoom: 'far', macro: 'intimate',
    hero_shot: 'close',
};
const LENS_FOV = {
    '24mm': 'wide', '35mm': 'wide', '50mm': 'standard',
    '85mm': 'narrow', '135mm': 'narrow', ultra_wide: 'ultra_wide',
    telephoto: 'narrow', macro: 'narrow',
};
// ── Negative prompt library ──
const BASE_NEGATIVE = 'blurry, low quality, watermark, text overlay, logo, deformed, bad anatomy, cropped, jpeg artifacts, ugly, duplicate, morbid, mutilated, poorly drawn, bad proportions, extra limbs, disfigured, grainy, low resolution';
const STYLE_NEGATIVES = {
    photorealistic: 'cartoon, anime, illustration, painting, sketch, CGI, 3D render',
    cinematic: 'amateur, home video, security camera, flat lighting, boring composition',
    stylized: 'photorealistic, photograph, camera, mundane',
    illustration: 'photograph, camera, real, photorealistic',
};
export class StoryboardPlanner {
    /**
     * Transform a DirectorPlan into a complete Storyboard.
     */
    static plan(directorPlan) {
        const startTime = performance.now();
        log.info('Storyboard planning starting', {
            planId: directorPlan.id,
            scenes: directorPlan.scenes.length,
        });
        // Compute cumulative timing
        let cumulativeTime = 0;
        const frames = directorPlan.scenes.map((scene, index) => {
            const frame = StoryboardPlanner.buildFrame(scene, index, directorPlan, cumulativeTime);
            cumulativeTime += scene.sceneDuration;
            return frame;
        });
        const processingTimeMs = Math.round(performance.now() - startTime);
        // Find thumbnail frame
        const thumbIdx = frames.findIndex((f) => f.thumbnailCandidate);
        const storyboard = {
            id: generateId(ID_PREFIXES.pipeline),
            directorPlanId: directorPlan.id,
            title: directorPlan.title,
            frames,
            globalStyle: StoryboardPlanner.buildGlobalStyle(directorPlan),
            globalContinuity: StoryboardPlanner.buildGlobalContinuity(directorPlan),
            metadata: {
                totalFrames: frames.length,
                totalDuration: cumulativeTime,
                thumbnailFrameIndex: thumbIdx >= 0 ? thumbIdx : 0,
                aspectRatio: '9:16',
                resolution: '1080p',
                generatedAt: new Date().toISOString(),
                engine: 'storyboard-planner-v1',
                processingTimeMs,
            },
        };
        log.info('Storyboard generated', {
            id: storyboard.id,
            frames: storyboard.frames.length,
            totalDuration: storyboard.metadata.totalDuration,
            processingTimeMs,
        });
        return storyboard;
    }
    // ══════════════════════════════════════════════════════════
    // Frame Builder
    // ══════════════════════════════════════════════════════════
    static buildFrame(scene, index, plan, startTime) {
        const prevScene = index > 0 ? plan.scenes[index - 1] : null;
        const nextScene = index < plan.scenes.length - 1 ? plan.scenes[index + 1] : null;
        return {
            // Identity
            frameId: `frame-${scene.sceneOrder}`,
            sceneId: scene.sceneId,
            sceneOrder: scene.sceneOrder,
            shotNumber: scene.sceneOrder,
            // Description
            frameDescription: StoryboardPlanner.buildFrameDescription(scene, plan),
            framePurpose: scene.sceneGoal,
            sceneSummary: `Scene ${scene.sceneOrder}: ${scene.sceneImportance.toUpperCase()} — ${scene.sceneEmotion}`,
            visualGoal: StoryboardPlanner.buildVisualGoal(scene),
            narrationText: scene.narration,
            expectedDuration: scene.sceneDuration,
            thumbnailCandidate: scene.thumbnailCandidate,
            // Composition
            composition: StoryboardPlanner.buildComposition(scene),
            // Camera
            camera: StoryboardPlanner.buildCameraInfo(scene),
            // Motion
            motion: StoryboardPlanner.buildMotionPlan(scene),
            // Timing
            timing: StoryboardPlanner.buildTiming(scene, startTime),
            // Assets
            assets: StoryboardPlanner.buildAssets(scene, plan),
            // Style
            style: StoryboardPlanner.buildStyle(scene, plan),
            // Continuity
            continuity: StoryboardPlanner.buildContinuity(scene, prevScene, nextScene, plan),
            // Prompts
            prompts: StoryboardPlanner.buildPrompts(scene, plan),
        };
    }
    // ── Composition ────────────────────────────────────────
    static buildComposition(scene) {
        const env = scene.environmentDetails || scene.environment;
        const envLower = env.toLowerCase();
        // Infer foreground/midground/background from environment details
        let foreground = 'Main subject in focus';
        let midground = 'Supporting elements';
        let background = 'Environment backdrop';
        if (envLower.includes('studio') || envLower.includes('dark')) {
            foreground = 'Subject lit by dramatic lighting';
            midground = 'Subtle smoke or atmospheric haze';
            background = 'Dark gradient or solid black backdrop';
        }
        else if (envLower.includes('road') || envLower.includes('highway')) {
            foreground = 'Subject on road surface';
            midground = 'Road stretching into distance';
            background = 'Sky, mountains, or cityscape';
        }
        else if (envLower.includes('mountain') || envLower.includes('sunset')) {
            foreground = 'Subject or ground detail';
            midground = 'Landscape/terrain';
            background = 'Sky with dramatic clouds or sunset colors';
        }
        else if (envLower.includes('city') || envLower.includes('urban')) {
            foreground = 'Subject in urban context';
            midground = 'Street elements, vehicles, pedestrians';
            background = 'Buildings, skyline, or city lights';
        }
        // Extract supporting objects from visual notes
        const supportingObjects = [];
        const objectKeywords = ['exhaust', 'wheel', 'headlight', 'dashboard', 'mirror', 'brake', 'suspension', 'helmet', 'traffic', 'trees', 'clouds'];
        for (const kw of objectKeywords) {
            if (envLower.includes(kw))
                supportingObjects.push(kw);
        }
        // Depth layout from camera
        const depthMap = {
            macro: 'shallow', hero_shot: 'medium', drone: 'extreme',
            crane: 'deep', tracking: 'medium', dolly: 'medium',
            orbit: 'medium', static: 'medium', fpv: 'deep',
            push: 'medium', pull: 'deep', zoom: 'shallow', handheld: 'medium',
        };
        // Subject position → rule of thirds
        const rotPos = POSITION_TO_ROT[scene.subjectPosition] ?? 'center';
        return {
            foreground,
            midground,
            background,
            mainSubject: scene.environmentDetails.split(',')[0]?.trim() || 'Main subject',
            supportingObjects,
            depthLayout: depthMap[scene.cameraStyle] ?? 'medium',
            leadingLines: scene.cameraStyle === 'tracking' ? 'Road or path leading into frame' :
                scene.cameraStyle === 'drone' ? 'Landscape contours from above' :
                    'Natural environmental lines guiding eye to subject',
            negativeSpace: scene.cameraStyle === 'macro' ? 'minimal' :
                scene.cameraStyle === 'drone' ? 'generous' : 'balanced',
            ruleOfThirdsPosition: rotPos,
            eyeFocusPoint: scene.subjectPosition === 'center' ? 'Center of frame on main subject' :
                `${scene.subjectPosition.replace(/_/g, ' ')} intersection of thirds grid`,
        };
    }
    // ── Camera ──────────────────────────────────────────────
    static buildCameraInfo(scene) {
        return {
            position: CAMERA_POSITION[scene.cameraStyle] ?? 'eye_level',
            height: CAMERA_HEIGHT[scene.cameraStyle] ?? 'medium',
            distance: CAMERA_DISTANCE[scene.cameraStyle] ?? 'medium',
            path: StoryboardPlanner.describeCameraPath(scene.cameraMovement),
            direction: scene.cameraMovement.includes('left') ? 'Moving left' :
                scene.cameraMovement.includes('right') ? 'Moving right' :
                    scene.cameraMovement.includes('up') || scene.cameraMovement.includes('ascend') ? 'Rising upward' :
                        scene.cameraMovement.includes('down') || scene.cameraMovement.includes('descend') ? 'Descending' :
                            scene.cameraMovement.includes('forward') || scene.cameraMovement.includes('in') ? 'Moving toward subject' :
                                scene.cameraMovement.includes('back') || scene.cameraMovement.includes('out') ? 'Pulling away from subject' :
                                    'Facing subject directly',
            rotation: scene.cameraMovement === 'whip_pan' ? 'slight_tilt' :
                scene.cameraStyle === 'handheld' ? 'slight_tilt' : 'level',
            lens: scene.lens,
            fov: LENS_FOV[scene.lens] ?? 'standard',
        };
    }
    static describeCameraPath(movement) {
        const paths = {
            dolly_in: 'Linear path forward toward subject on dolly track',
            dolly_out: 'Linear path backward away from subject on dolly track',
            orbit_left: 'Circular arc around subject moving counter-clockwise',
            orbit_right: 'Circular arc around subject moving clockwise',
            crane_up: 'Vertical ascent on crane arm',
            crane_down: 'Vertical descent on crane arm',
            pan_left: 'Stationary pivot, sweeping left',
            pan_right: 'Stationary pivot, sweeping right',
            push_in: 'Gentle forward movement intensifying on subject',
            pull_back: 'Gradual backward reveal of wider scene',
            tracking_forward: 'Moving forward alongside or behind subject',
            tracking_left: 'Lateral tracking movement to the left',
            tracking_right: 'Lateral tracking movement to the right',
            handheld_subtle: 'Slight organic handheld sway for documentary feel',
            handheld_intense: 'Energetic handheld movement for urgency',
            drone_ascend: 'Aerial rise revealing landscape from above',
            drone_descend: 'Aerial descent approaching subject from above',
            drone_orbit: 'Aerial circular orbit around point of interest',
            fpv_forward: 'First-person perspective rushing forward',
            fpv_dive: 'First-person perspective diving downward',
            zoom_in: 'Optical zoom narrowing field of view on subject',
            zoom_out: 'Optical zoom widening to reveal context',
            whip_pan: 'Rapid horizontal pan creating motion blur transition',
            static: 'Camera locked on tripod, no movement',
            tilt_up: 'Stationary camera tilting upward',
            tilt_down: 'Stationary camera tilting downward',
        };
        return paths[movement] ?? 'Smooth cinematic camera movement';
    }
    // ── Motion ──────────────────────────────────────────────
    static buildMotionPlan(scene) {
        const motionSpeed = scene.motionIntensity === 'extreme' ? 'hyper' :
            scene.motionIntensity === 'dynamic' ? 'fast' :
                scene.motionIntensity === 'subtle' ? 'slow' : 'normal';
        // Particle motion from visual effects
        let particleMotion = 'None';
        if (scene.visualEffects.includes('dust_particles'))
            particleMotion = 'Dust particles drifting in light beams';
        else if (scene.visualEffects.includes('rain_effect'))
            particleMotion = 'Rain falling vertically with wind variance';
        else if (scene.visualEffects.includes('snow_effect'))
            particleMotion = 'Snowflakes drifting gently downward';
        else if (scene.visualEffects.includes('smoke_effect'))
            particleMotion = 'Smoke wisps curling and dissipating';
        else if (scene.visualEffects.includes('sparks'))
            particleMotion = 'Sparks flying outward with decay';
        else if (scene.visualEffects.includes('bokeh'))
            particleMotion = 'Bokeh light orbs floating in background';
        return {
            subjectMotion: scene.motionStyle.replace(/_/g, ' '),
            cameraMotion: scene.cameraMovement.replace(/_/g, ' '),
            backgroundMotion: scene.cameraStyle === 'tracking' ? 'Background sliding with parallax effect' :
                scene.cameraStyle === 'drone' ? 'Landscape slowly rotating below' :
                    scene.motionIntensity === 'dynamic' ? 'Subtle environmental movement' : 'Static or minimal',
            objectMotion: scene.environment === 'highway' ? 'Other vehicles passing in distance' :
                scene.environment === 'city' ? 'Pedestrians and traffic in background' :
                    scene.weather !== 'clear' ? 'Weather elements (rain/wind affecting objects)' : 'Minimal',
            particleMotion,
            motionSpeed,
        };
    }
    // ── Timing ──────────────────────────────────────────────
    static buildTiming(scene, startTime) {
        const transInTime = scene.transitionIn === 'fade' ? 0.5 :
            scene.transitionIn === 'cross_dissolve' ? 0.8 :
                scene.transitionIn === 'whip_pan' ? 0.3 : 0;
        const transOutTime = scene.transitionOut === 'fade' ? 1.0 :
            scene.transitionOut === 'cross_dissolve' ? 0.8 :
                scene.transitionOut === 'whip_pan' ? 0.3 : 0;
        const curve = scene.motionIntensity === 'extreme' ? 'spring' :
            scene.motionIntensity === 'dynamic' ? 'ease_in_out' :
                scene.motionIntensity === 'subtle' ? 'ease_out' : 'linear';
        return {
            startTimeSec: startTime,
            endTimeSec: startTime + scene.sceneDuration,
            durationSec: scene.sceneDuration,
            animationCurve: curve,
            transitionInSec: transInTime,
            transitionOutSec: transOutTime,
        };
    }
    // ── Assets ──────────────────────────────────────────────
    static buildAssets(scene, plan) {
        const envDetails = (scene.environmentDetails + ' ' + scene.narration).toLowerCase();
        const characters = [];
        if (plan.characterDescription)
            characters.push(plan.characterDescription);
        if (envDetails.includes('rider') || envDetails.includes('person'))
            characters.push('Person/rider');
        const vehicles = [];
        const vehicleWords = ['motorcycle', 'bike', 'car', 'vehicle', 'ninja', 'kawasaki', 'truck', 'suv'];
        for (const vw of vehicleWords) {
            if (envDetails.includes(vw)) {
                vehicles.push(vw);
                break;
            }
        }
        const buildings = [];
        if (['city', 'night_city', 'cyberpunk'].includes(scene.environment))
            buildings.push('Urban buildings/skyline');
        if (scene.environment === 'factory')
            buildings.push('Industrial structures');
        const envAssets = [];
        if (['forest', 'mountains', 'countryside'].includes(scene.environment))
            envAssets.push('Natural landscape');
        if (['beach', 'ocean'].includes(scene.environment))
            envAssets.push('Water/coast');
        if (['highway', 'race_track'].includes(scene.environment))
            envAssets.push('Road/track surface');
        const props = [];
        if (envDetails.includes('helmet'))
            props.push('Helmet');
        if (envDetails.includes('exhaust'))
            props.push('Exhaust system');
        if (envDetails.includes('dashboard'))
            props.push('Instrument cluster');
        const soundEffects = [];
        if (vehicles.length > 0)
            soundEffects.push('Engine sound');
        if (scene.weather === 'rain' || scene.weather === 'heavy_rain')
            soundEffects.push('Rain ambience');
        if (scene.environment === 'city')
            soundEffects.push('Urban ambience');
        if (scene.motionStyle === 'driving' || scene.motionStyle === 'drifting')
            soundEffects.push('Tire/road sound');
        return {
            characters,
            vehicles,
            buildings,
            environmentAssets: envAssets,
            props,
            logos: [],
            brandAssets: [],
            soundEffects,
        };
    }
    // ── Style ───────────────────────────────────────────────
    static buildStyle(scene, plan) {
        return {
            artStyle: plan.globalStyle,
            renderingStyle: 'cinematic',
            qualityTarget: '1080p',
            aspectRatio: '9:16',
            lightingSummary: `${scene.lighting.replace(/_/g, ' ')} lighting, ${scene.lightingIntensity} intensity, ${scene.shadowStyle} shadows, direction: ${scene.lightingDirection}`,
            colorPalette: plan.colorPalette,
            mood: scene.sceneEmotion,
        };
    }
    // ── Continuity ──────────────────────────────────────────
    static buildContinuity(scene, prev, next, plan) {
        return {
            character: plan.characterDescription
                ? `Maintain consistent appearance: ${plan.characterDescription}`
                : 'Consistent character appearance throughout',
            environment: prev && prev.environment === scene.environment
                ? `Same environment as Scene ${prev.sceneOrder} — maintain spatial consistency`
                : `New environment: ${scene.environment.replace(/_/g, ' ')} — establish setting clearly`,
            lighting: prev && prev.lighting === scene.lighting
                ? `Same lighting as previous scene`
                : `Lighting shift: ${prev?.lighting?.replace(/_/g, ' ') ?? 'N/A'} → ${scene.lighting.replace(/_/g, ' ')}`,
            weather: `Weather: ${scene.weather} — ${prev && prev.weather !== scene.weather ? 'CHANGED from ' + prev.weather : 'consistent'}`,
            vehicle: plan.scenes.some((s) => s.environmentDetails.toLowerCase().includes('motorcycle') || s.environmentDetails.toLowerCase().includes('bike'))
                ? 'Same vehicle model, color, and condition in every frame'
                : 'N/A',
            costume: 'Maintain consistent wardrobe/gear if character is visible',
            colorGrading: `${plan.globalColorGrading.replace(/_/g, ' ')} applied uniformly — do not shift between scenes`,
        };
    }
    // ── Prompts ─────────────────────────────────────────────
    static buildPrompts(scene, plan) {
        const renderStyle = 'cinematic';
        const negStyle = STYLE_NEGATIVES[renderStyle] ?? '';
        // Build structured prompt components
        const subject = scene.environmentDetails;
        const camera = `${scene.cameraStyle.replace(/_/g, ' ')} camera, ${scene.lens} lens, ${scene.shotDescription}`;
        const lighting = `${scene.lighting.replace(/_/g, ' ')} lighting, ${scene.lightingIntensity} intensity, ${scene.shadowStyle} shadows`;
        const environment = `${scene.environment.replace(/_/g, ' ')} setting, ${scene.timeOfDay.replace(/_/g, ' ')}, ${scene.weather} weather`;
        const effects = scene.visualEffects.map((e) => e.replace(/_/g, ' ')).join(', ');
        const color = `${scene.colorGrading.replace(/_/g, ' ')} color grading`;
        const style = plan.globalStyle;
        const quality = 'highly detailed, professional quality, 8k, masterpiece';
        // Image prompt — optimized for Flux/DALL-E/Midjourney
        const imagePrompt = [subject, camera, lighting, environment, effects, color, style, quality, 'vertical portrait composition 9:16'].join(', ');
        // Video prompt — optimized for Veo/Runway/Kling/Luma/Pika
        const motion = `${scene.motionStyle.replace(/_/g, ' ')}, ${scene.cameraMovement.replace(/_/g, ' ')} camera movement, ${scene.motionIntensity} motion`;
        const videoPrompt = [subject, camera, lighting, environment, motion, effects, color, style, quality].join(', ');
        // Thumbnail prompt — dramatic hero shot
        const thumbnailPrompt = scene.thumbnailCandidate
            ? `${subject}, dramatic hero shot, ${lighting}, ${color}, eye-catching, bold composition, high contrast, ${quality}`
            : `${subject}, ${lighting}, ${color}, ${quality}`;
        // 3D prompt
        const prompt3D = `3D render of ${subject}, ${lighting}, ${environment}, PBR materials, octane render, ${quality}`;
        // Animation prompt
        const animationPrompt = `Animated sequence: ${subject}, ${motion}, ${effects}, ${color}, smooth 24fps animation`;
        // Provider-specific hints
        const providerHints = {
            flux: `${imagePrompt}, photorealistic style`,
            dall_e: `${imagePrompt}, photographic quality`,
            midjourney: `${imagePrompt} --ar 9:16 --v 6 --style raw`,
            runway: `${videoPrompt}, ${scene.sceneDuration}s clip`,
            veo: `${videoPrompt}, cinematic quality, ${scene.sceneDuration} seconds`,
            kling: `${videoPrompt}, professional cinematography`,
            luma: `${videoPrompt}, dream machine quality`,
            pika: `${videoPrompt}, high quality generation`,
            seedance: `${videoPrompt}, smooth natural motion`,
            hunyuan: `${videoPrompt}, high fidelity video`,
        };
        return {
            imagePrompt,
            videoPrompt,
            thumbnailPrompt,
            negativePrompt: `${BASE_NEGATIVE}, ${negStyle}`,
            prompt3D,
            animationPrompt,
            styleSuffix: style,
            providerHints,
        };
    }
    // ── Descriptions ────────────────────────────────────────
    static buildFrameDescription(scene, plan) {
        return `${scene.sceneImportance.toUpperCase()} scene: ${scene.environmentDetails}. ` +
            `${scene.cameraStyle.replace(/_/g, ' ')} camera with ${scene.lens} lens, ` +
            `${scene.lighting.replace(/_/g, ' ')} lighting, ${scene.colorGrading.replace(/_/g, ' ')} grade. ` +
            `Emotion: ${scene.sceneEmotion}. Duration: ${scene.sceneDuration}s.`;
    }
    static buildVisualGoal(scene) {
        const goals = {
            hook: 'Maximum visual impact in the first 2 seconds — stop the scroll',
            buildup: 'Build visual narrative and emotional investment through compelling imagery',
            climax: 'Deliver the peak visual moment — the frame viewers remember',
            resolution: 'Bring visual closure while maintaining cinematic quality',
            cta: 'Clear, compelling visual that drives action (subscribe/follow/comment)',
        };
        return goals[scene.sceneImportance] ?? 'Maintain high visual quality and emotional resonance';
    }
    // ── Global ──────────────────────────────────────────────
    static buildGlobalStyle(plan) {
        return {
            artStyle: plan.globalStyle,
            renderingStyle: 'cinematic',
            qualityTarget: '1080p',
            aspectRatio: '9:16',
            lightingSummary: `Primary: ${plan.scenes[0]?.lighting ?? 'dramatic'}. Consistent ${plan.globalColorGrading} grading.`,
            colorPalette: plan.colorPalette,
            mood: plan.globalMood,
        };
    }
    static buildGlobalContinuity(plan) {
        return {
            character: plan.characterDescription,
            environment: plan.consistencyNotes,
            lighting: `Maintain ${plan.globalColorGrading} color grading across all frames`,
            weather: 'Consistent weather unless narrative requires change',
            vehicle: plan.recurringElements.find((e) => e.includes('vehicle')) ?? 'N/A',
            costume: 'Consistent wardrobe/appearance throughout',
            colorGrading: `${plan.globalColorGrading} applied uniformly to all frames`,
        };
    }
}
//# sourceMappingURL=storyboard-planner.js.map