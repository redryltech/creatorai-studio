import { PromptCompilerCore } from '../prompt-compiler/prompt-compiler';
import { PromptAssembler } from '../prompt-compiler/prompt-assembler';
import { NegativePromptEngine } from '../prompt-compiler/negative-prompt-engine';
import { ProviderCompiler } from '../prompt-compiler/provider-compiler';
import { TokenOptimizer } from '../prompt-compiler/token-optimizer';
import { QualityScorer } from '../prompt-compiler/quality-scorer';
import { ConflictResolver } from '../prompt-compiler/conflict-resolver';
import { PromptValidator } from '../prompt-compiler/prompt-validator';
import { PromptExporter } from '../prompt-compiler/prompt-exporter';
import { PromptMemory } from '../prompt-compiler/prompt-memory';

// Minimal mocks
const mockDP: any = { id:'dp', title:'Ninja 300', globalStyle:'automotive', globalColorGrading:'teal_orange', globalMood:'energetic', globalPacing:'dynamic', scenes:[{sceneId:'s1',sceneOrder:1,cameraStyle:'tracking',cameraMovement:'tracking_forward',lens:'35mm',lighting:'golden_hour',lightingIntensity:'high',shadowStyle:'dramatic',motionStyle:'driving',motionIntensity:'dynamic',environment:'highway',timeOfDay:'golden_hour',weather:'clear',colorGrading:'teal_orange',sceneEmotion:'excitement',sceneDuration:8,visualEffects:['depth_of_field','lens_flare'],shotDescription:'tracking shot',narrationStyle:'energetic'}], colorPalette:['#00CED1','#FF6347'], consistencyNotes:'C', characterDescription:'Rider', recurringElements:[] };
const mockSB: any = { id:'sb', title:'Ninja 300', frames:[{frameId:'f1',sceneId:'s1',sceneOrder:1,frameDescription:'Ninja 300 on highway',sceneSummary:'Scene 1: HOOK',visualGoal:'Hook viewer',composition:{mainSubject:'Kawasaki Ninja 300',foreground:'Motorcycle',midground:'Road',background:'Mountains',ruleOfThirdsPosition:'center',depthLayout:'medium',negativeSpace:'balanced',eyeFocusPoint:'center'},camera:{lens:'35mm',position:'eye_level',fov:'wide'},motion:{subjectMotion:'driving',cameraMotion:'tracking',backgroundMotion:'parallax',particleMotion:'None'},continuity:{colorGrading:'teal_orange',vehicle:'Ninja 300'},timing:{durationSec:8},assets:{props:['helmet']},style:{mood:'excitement'},narrationText:'Test narration'}] };
const mockChar: any = { id:'db', entities:[{id:'bike_001',displayName:'Green Kawasaki Ninja 300',category:'vehicle',globalSeed:12345,identityBlock:'Always use: Green Kawasaki Ninja 300\nColor: Green gloss\nWheels: OEM',scenePresence:['s1'],appearance:{forbiddenChanges:['Do NOT change color','Do NOT change model'],preferredColors:['Green']},vehicleProfile:{primaryColor:'Green',manufacturer:'Kawasaki',model:'Ninja 300',paintFinish:'gloss',wheelDesign:'OEM',exhaust:'OEM',damageState:'pristine'}}] };
const mockSG: any = { id:'sg', scenes:[] };
const mockWS: any = { id:'ws', snapshots:[{sceneId:'s1',environment:{terrain:'asphalt',location:'highway'},lighting:{temperature:3500,intensity:0.8}}], transitions:[], issues:[], metrics:{continuityScore:100} };
const mockAM: any = { id:'am', assets:[], brandKit:{brandName:'Kawasaki',primaryColors:['#00CED1','#FF6347'],animationStyle:'dynamic'}, styleGuide:{visualStyle:'automotive',colorGrading:'teal_orange'}, promptTemplates:[], references:[], embeddings:[] };

describe('PromptCompilerCore', () => {
  test('compiles prompt package', () => {
    const pkg = PromptCompilerCore.compile(mockDP, mockSB, mockChar, mockSG, mockWS, mockAM);
    expect(pkg.id).toBeTruthy();
    expect(pkg.canonicalPrompts).toHaveLength(1);
    expect(Object.keys(pkg.providerPrompts).length).toBeGreaterThanOrEqual(10);
    expect(pkg.qualityScores).toHaveLength(1);
  });
  test('canonical prompt contains blocks', () => {
    const pkg = PromptCompilerCore.compile(mockDP, mockSB, mockChar, mockSG, mockWS, mockAM);
    const cp = pkg.canonicalPrompts[0]!;
    expect(cp.blocks.length).toBeGreaterThan(3);
    expect(cp.masterPrompt.length).toBeGreaterThan(50);
    expect(cp.negativePrompt.length).toBeGreaterThan(20);
    expect(cp.tokenCount).toBeGreaterThan(10);
  });
  test('provider prompts are compiled for all providers', () => {
    const pkg = PromptCompilerCore.compile(mockDP, mockSB, mockChar, mockSG, mockWS, mockAM);
    expect(pkg.providerPrompts.veo).toBeDefined();
    expect(pkg.providerPrompts.runway).toBeDefined();
    expect(pkg.providerPrompts.flux).toBeDefined();
    expect(pkg.providerPrompts.kling).toBeDefined();
    expect(pkg.providerPrompts.luma).toBeDefined();
    expect(pkg.providerPrompts.pika).toBeDefined();
    for (const [pid, prompts] of Object.entries(pkg.providerPrompts)) {
      expect((prompts as any[]).length).toBe(1);
      expect((prompts as any[])[0].prompt.length).toBeGreaterThan(20);
    }
  });
  test('quality score is calculated', () => {
    const pkg = PromptCompilerCore.compile(mockDP, mockSB, mockChar, mockSG, mockWS, mockAM);
    expect(pkg.qualityScores[0]!.overallScore).toBeGreaterThan(30);
    expect(pkg.metadata.avgQualityScore).toBeGreaterThan(30);
  });
});

describe('NegativePromptEngine', () => {
  test('builds negative spec with entity-specific rules', () => {
    const spec = NegativePromptEngine.build('s1', mockChar);
    expect(spec.compiled.length).toBeGreaterThan(50);
    expect(spec.quality.length).toBeGreaterThan(3);
    expect(spec.artifacts.length).toBeGreaterThan(0);
    expect(spec.forbiddenColors.length).toBeGreaterThan(0); // wrong colors for vehicle
  });
  test('provider-specific negative for midjourney', () => {
    const spec = NegativePromptEngine.build('s1', mockChar);
    const mj = NegativePromptEngine.forProvider(spec, 'midjourney');
    expect(mj).toContain('--no');
  });
});

describe('TokenOptimizer', () => {
  test('shortens long prompts', () => {
    const long = Array(100).fill('word').join(' comma ');
    const short = TokenOptimizer.optimize(long, 100, 'short');
    expect(short.split(/\s+/).length).toBeLessThan(long.split(/\s+/).length);
  });
  test('estimates tokens', () => {
    expect(TokenOptimizer.estimateTokens('hello world test')).toBeGreaterThan(0);
  });
});

describe('ConflictResolver', () => {
  test('detects color conflicts', () => {
    const blocks: any[] = [];
    const prompt = 'red vehicle, blue sky, green grass, yellow sun, orange sunset';
    const conflicts = ConflictResolver.resolve(blocks, prompt);
    const colorConflict = conflicts.find(c => c.type === 'color');
    expect(colorConflict).toBeDefined();
  });
});

describe('QualityScorer', () => {
  test('scores a complete prompt higher', () => {
    const good: any = { blocks: [
      { type: 'visual', content: 'Ninja 300 motorcycle', priority: 10 },
      { type: 'camera', content: '35mm tracking shot', priority: 9 },
      { type: 'lighting', content: 'golden hour', priority: 8 },
      { type: 'environment', content: 'highway', priority: 7 },
      { type: 'composition', content: 'rule of thirds', priority: 5 },
      { type: 'vehicle', content: 'Green Kawasaki', priority: 9 },
    ], masterPrompt: 'A long detailed prompt with many specifics about the scene', negativePrompt: 'blurry, low quality', tokenCount: 50 };
    const score = QualityScorer.score(good);
    expect(score.overallScore).toBeGreaterThan(50);
    expect(score.completeness).toBeGreaterThan(50);
  });
});

describe('PromptValidator', () => {
  test('validates correct package', () => {
    const pkg = PromptCompilerCore.compile(mockDP, mockSB, mockChar, mockSG, mockWS, mockAM);
    const result = PromptValidator.validate(pkg);
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
  });
});

describe('PromptExporter', () => {
  test('exports all formats', () => {
    const pkg = PromptCompilerCore.compile(mockDP, mockSB, mockChar, mockSG, mockWS, mockAM);
    const exp = PromptExporter.export(pkg);
    expect(exp.canonicalJson).toHaveLength(1);
    expect(Object.keys(exp.providerPackage).length).toBeGreaterThan(5);
    expect(exp.promptReport.scenes).toBe(1);
    expect(exp.promptMetrics.tokenCounts).toHaveLength(1);
  });
});

describe('PromptMemory', () => {
  beforeEach(() => PromptMemory.resetInstance());
  test('records entries', () => {
    const mem = PromptMemory.getInstance();
    mem.record({ productionTitle: 'Test', packageId: 'p1', avgScore: 85, totalTokens: 500 });
    expect(mem.size).toBe(1);
  });
});
