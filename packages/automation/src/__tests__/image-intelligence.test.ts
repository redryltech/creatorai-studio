import { ImagePlanner } from '../image-intelligence/image-planner';
import { CompositionEngine } from '../image-intelligence/composition-engine';
import { CameraEngine } from '../image-intelligence/camera-engine';
import { LightingEngine } from '../image-intelligence/lighting-engine';
import { StyleEngine } from '../image-intelligence/style-engine';
import { ColorEngine } from '../image-intelligence/color-engine';
import { QualityEngine } from '../image-intelligence/quality-engine';
import { IdentityLockEngine } from '../image-intelligence/identity-lock';
import { PoseEngine } from '../image-intelligence/pose-engine';
import { EnvironmentEngine } from '../image-intelligence/environment-engine';
import { ImageValidator } from '../image-intelligence/image-validator';
import { ImageExporter } from '../image-intelligence/image-exporter';
import { ImageMemory } from '../image-intelligence/image-memory';
import { ImagePromptCompiler } from '../prompt-compiler/image-prompt-compiler';
import { VideoPromptCompiler } from '../prompt-compiler/video-prompt-compiler';
import { VoicePromptCompiler } from '../prompt-compiler/voice-prompt-compiler';
import { MusicPromptCompiler } from '../prompt-compiler/music-prompt-compiler';
import { ThumbnailPromptCompiler } from '../prompt-compiler/thumbnail-prompt-compiler';
import { ProviderRouter } from '../prompt-compiler/provider-router';
import { ProviderSelector } from '../prompt-compiler/provider-selector';
import { ProviderOptimizer } from '../prompt-compiler/provider-optimizer';

// Mock data
const mockFrame: any = {
  sceneId: 's1', sceneOrder: 1, frameDescription: 'Kawasaki Ninja 300 on highway',
  composition: { mainSubject: 'Green Kawasaki Ninja 300', foreground: 'Motorcycle', midground: 'Road', background: 'Mountains', ruleOfThirdsPosition: 'center', depthLayout: 'medium', negativeSpace: 'balanced', leadingLines: 'Road ahead', eyeFocusPoint: 'center' },
  camera: { position: 'eye_level', lens: '35mm', fov: 'wide', distance: 'medium', path: 'tracking', direction: 'forward', height: 'medium', rotation: 'level' },
  motion: { subjectMotion: 'driving', cameraMotion: 'tracking', particleMotion: 'None' },
  style: { mood: 'excitement', aspectRatio: '9:16' },
  continuity: { colorGrading: 'teal_orange' }, timing: { durationSec: 8 }, assets: { props: ['helmet'] },
};
const mockSB: any = { title: 'Ninja 300', frames: [mockFrame] };
const mockCharDb: any = { entities: [{ id: 'bike_001', displayName: 'Green Kawasaki Ninja 300', category: 'vehicle', globalSeed: 12345, identityBlock: 'ENTITY bike_001\nAlways use: Green Kawasaki Ninja 300', scenePresence: ['s1'], vehicleProfile: { primaryColor: 'Green', manufacturer: 'Kawasaki', model: 'Ninja 300' }, appearance: { preferredColors: ['Green'], forbiddenChanges: [] }, sceneSeed: { s1: 111 } }] };
const mockDP: any = { globalStyle: 'premium automotive commercial', globalColorGrading: 'teal_orange', colorPalette: ['#00CED1', '#FF6347'], scenes: [{ lighting: 'golden_hour', lightingIntensity: 'high', shadowStyle: 'dramatic', timeOfDay: 'golden_hour', environment: 'highway', weather: 'clear', cameraMovement: 'tracking_forward', sceneEmotion: 'excitement', visualEffects: ['depth_of_field', 'lens_flare'], lens: '35mm' }] };

describe('ImagePlanner', () => {
  test('produces complete ImagePlanningPackage', () => {
    const pkg = ImagePlanner.plan(mockSB, mockCharDb, mockDP);
    expect(pkg.id).toBeTruthy();
    expect(pkg.scenes).toHaveLength(1);
    expect(pkg.scenes[0]!.masterPrompt.length).toBeGreaterThan(100);
    expect(pkg.scenes[0]!.negativePrompt.length).toBeGreaterThan(30);
    expect(pkg.scenes[0]!.quality.overallScore).toBeGreaterThan(30);
    expect(pkg.scenes[0]!.confidence).toBeGreaterThan(20);
    expect(Object.keys(pkg.scenes[0]!.providerHints).length).toBeGreaterThanOrEqual(5);
  });
});

describe('CompositionEngine', () => {
  test('analyzes frame composition', () => {
    const c = CompositionEngine.analyze(mockFrame);
    expect(c.foreground.element).toBeTruthy();
    expect(c.background.element).toBeTruthy();
    expect(c.depthOfField).toBeTruthy();
    expect(c.subjectPlacement).toBeTruthy();
  });
});

describe('CameraEngine', () => {
  test('determines camera specs', () => {
    const c = CameraEngine.analyze(mockFrame, mockDP.scenes[0]);
    expect(c.lens).toBe('35mm');
    expect(c.angle).toBeTruthy();
    expect(c.fov).toBeGreaterThan(0);
  });
});

describe('LightingEngine', () => {
  test('builds lighting setup', () => {
    const l = LightingEngine.analyze(mockDP.scenes[0]);
    expect(l.keyLight.intensity).toBeGreaterThan(0);
    expect(l.fillLight.intensity).toBeGreaterThan(0);
    expect(l.lightingMood).toBeTruthy();
  });
});

describe('StyleEngine', () => {
  test('detects cinematic style', () => {
    const s = StyleEngine.analyze(mockDP);
    expect(s.primary).toBe('cinematic');
    expect(s.stylePrompt).toBeTruthy();
  });
});

describe('ColorEngine', () => {
  test('builds color spec', () => {
    const c = ColorEngine.analyze(mockDP);
    expect(c.palette.length).toBeGreaterThan(0);
    expect(c.mood).toBeTruthy();
  });
});

describe('IdentityLockEngine', () => {
  test('locks vehicle identity with seed', () => {
    const lock = IdentityLockEngine.lock('s1', mockCharDb);
    expect(lock.vehicleLock.length).toBe(1);
    expect(lock.vehicleLock[0]!.color).toBe('Green');
    expect(lock.globalSeed).toBe(12345);
    expect(lock.consistencyScore).toBeGreaterThan(30);
  });
});

describe('PoseEngine', () => {
  test('returns null for non-human scenes', () => {
    expect(PoseEngine.analyze('excitement', false)).toBeNull();
  });
  test('returns pose for human scenes', () => {
    const p = PoseEngine.analyze('excitement', true);
    expect(p).toBeTruthy();
    expect(p!.bodyPose).toBeTruthy();
  });
});

describe('QualityEngine', () => {
  test('scores a complete plan', () => {
    const pkg = ImagePlanner.plan(mockSB, mockCharDb, mockDP);
    expect(pkg.scenes[0]!.quality.compositionScore).toBeGreaterThan(0);
    expect(pkg.scenes[0]!.quality.lightingScore).toBeGreaterThan(0);
    expect(pkg.scenes[0]!.quality.overallScore).toBeGreaterThan(30);
  });
});

describe('ImageValidator', () => {
  test('validates correct package', () => {
    const pkg = ImagePlanner.plan(mockSB, mockCharDb, mockDP);
    const v = ImageValidator.validate(pkg);
    expect(v.valid).toBe(true);
    expect(v.score).toBeGreaterThanOrEqual(70);
  });
});

describe('ImageExporter', () => {
  test('exports all formats', () => {
    const pkg = ImagePlanner.plan(mockSB, mockCharDb, mockDP);
    const exp = ImageExporter.export(pkg);
    expect(exp.fullJson).toBe(pkg);
    expect(exp.promptsOnly).toHaveLength(1);
    expect(exp.promptsOnly[0]!.masterPrompt.length).toBeGreaterThan(50);
  });
});

// Prompt Compiler V2 tests
describe('ImagePromptCompiler', () => {
  test('compiles for all image providers', () => {
    const pkg = ImagePlanner.plan(mockSB, mockCharDb, mockDP);
    const compiled = ImagePromptCompiler.compileAll(pkg.scenes[0]!);
    expect(Object.keys(compiled).length).toBeGreaterThanOrEqual(5);
    for (const [pid, c] of Object.entries(compiled)) { expect(c.prompt.length).toBeGreaterThan(20); }
  });
});

describe('VideoPromptCompiler', () => {
  test('compiles for all video providers', () => {
    const pkg = ImagePlanner.plan(mockSB, mockCharDb, mockDP);
    const compiled = VideoPromptCompiler.compileAll(pkg.scenes[0]!, 8);
    expect(Object.keys(compiled).length).toBeGreaterThanOrEqual(5);
    for (const [pid, c] of Object.entries(compiled)) { expect(c.duration).toBe(8); }
  });
});

describe('VoicePromptCompiler', () => {
  test('compiles voice specs', () => {
    const compiled = VoicePromptCompiler.compile('Hello world', 'excitement');
    expect(compiled.elevenlabs.text).toBe('Hello world');
    expect(compiled.elevenlabs.speed).toBe(1.1);
  });
});

describe('MusicPromptCompiler', () => {
  test('compiles music specs', () => {
    const compiled = MusicPromptCompiler.compile('excitement', 'automotive', 30);
    expect(compiled.local.energy).toBe(9);
    expect(compiled.local.duration).toBe(30);
  });
});

describe('ThumbnailPromptCompiler', () => {
  test('compiles for platforms', () => {
    const compiled = ThumbnailPromptCompiler.compile('Ninja 300', 'Hero motorcycle shot');
    expect(compiled.youtube.aspectRatio).toBe('16:9');
    expect(compiled.tiktok.aspectRatio).toBe('9:16');
  });
});

describe('ProviderRouter', () => {
  test('routes free tier correctly', () => {
    const routes = ProviderRouter.route('image', 'free');
    expect(routes.length).toBeGreaterThanOrEqual(1);
    expect(routes.every(r => r.cost === 0)).toBe(true);
  });
  test('routes premium tier with paid providers', () => {
    const routes = ProviderRouter.route('video', 'premium');
    expect(routes.some(r => r.cost > 0)).toBe(true);
  });
});

describe('ProviderSelector', () => {
  test('selects best provider', () => {
    const best = ProviderSelector.selectBest('image', 'free');
    expect(best).toBeTruthy();
    expect(best!.cost).toBe(0);
  });
  test('selects all media types', () => {
    const all = ProviderSelector.selectAll('standard');
    expect(all.image).toBeTruthy();
    expect(all.video).toBeTruthy();
    expect(all.voice).toBeTruthy();
    expect(all.music).toBeTruthy();
  });
});

describe('ProviderOptimizer', () => {
  test('truncates long prompts', () => {
    const long = Array(500).fill('word').join(' ');
    const opt = ProviderOptimizer.optimize(long, 'pika');
    expect(opt.truncated).toBe(true);
    expect(opt.tokenCount).toBeLessThan(500);
  });
  test('detects unsafe content', () => {
    const opt = ProviderOptimizer.optimize('beautiful scene with violence and gore', 'flux');
    expect(opt.safetyClean).toBe(false);
  });
});

describe('ImageMemory', () => {
  beforeEach(() => ImageMemory.resetInstance());
  test('records entries', () => {
    const m = ImageMemory.getInstance();
    m.record({ productionTitle: 'Test', packageId: 'p1', avgQuality: 85, avgConfidence: 80 });
    expect(m.size).toBe(1);
  });
});
