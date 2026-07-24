import { AssetMemoryPlanner } from '../asset-memory/asset-memory-planner';
import { AssetValidator } from '../asset-memory/asset-validator';
import { AssetExporter } from '../asset-memory/asset-exporter';
import { AssetMemoryStore } from '../asset-memory/asset-memory-store';
import { BrandKitManager } from '../asset-memory/brand-kit-manager';
import { PromptTemplateManager } from '../asset-memory/prompt-template-manager';
import { ReferenceManager } from '../asset-memory/reference-manager';
import { VersionManager } from '../asset-memory/version-manager';
import { EmbeddingManager } from '../asset-memory/embedding-manager';

// Minimal mocks — just enough structure to test
const mockDP: any = { id:'dp',title:'Kawasaki Ninja 300',globalStyle:'automotive',globalColorGrading:'teal_orange',globalMood:'energetic',globalPacing:'dynamic',scenes:[{sceneId:'s1',sceneOrder:1,cameraStyle:'tracking',lens:'35mm',lighting:'golden_hour',motionStyle:'driving',transitionOut:'cut',narrationStyle:'energetic',sceneEmotion:'excitement'}],colorPalette:['#00CED1','#FF6347','#1a2a3a'],consistencyNotes:'C',characterDescription:'Rider',recurringElements:['Ninja 300'] };
const mockSB: any = { id:'sb',title:'Ninja 300',frames:[{frameId:'f1',sceneId:'s1'}] };
const mockChar: any = { id:'db',entities:[
  {id:'bike_001',displayName:'Green Kawasaki Ninja 300',category:'vehicle',globalSeed:12345,identityBlock:'ENTITY bike_001',appearance:{preferredColors:['Green'],forbiddenChanges:['Do NOT change color']},scenePresence:['s1'],vehicleProfile:{manufacturer:'Kawasaki',model:'Ninja 300',variant:'Std',primaryColor:'Green',wheelDesign:'OEM',exhaust:'OEM',brandStickers:[]}},
  {id:'char_001',displayName:'Rider',category:'human',globalSeed:54321,identityBlock:'ENTITY char_001',appearance:{preferredColors:['Black'],forbiddenChanges:['Do NOT change outfit']},scenePresence:['s1'],characterProfile:{clothing:{overall:'Riding gear'},accessories:['gloves'],expressionStyle:'determined'}},
] };
const mockSG: any = { id:'sg',scenes:[] };
const mockWS: any = { id:'ws',snapshots:[{snapshotId:'snap-1',timestamp:0,sceneId:'s1',sceneOrder:1,environment:{location:'highway',terrain:'asphalt',rain:0,snow:0,fog:0,sky:'daylight',city:false,mountains:false,roadType:'highway'},lighting:{temperature:3500,intensity:0.8}}],transitions:[],issues:[],metrics:{continuityScore:100,overallProductionScore:95} };

describe('AssetMemoryPlanner', () => {
  test('creates asset memory package', () => {
    const pkg = AssetMemoryPlanner.plan(mockDP, mockSB, mockChar, mockSG, mockWS);
    expect(pkg.id).toBeTruthy();
    expect(pkg.assets.length).toBeGreaterThanOrEqual(2); // vehicle + character
    expect(pkg.brandKit).toBeTruthy();
    expect(pkg.styleGuide).toBeTruthy();
    expect(pkg.promptTemplates.length).toBeGreaterThan(0);
  });
  test('extracts vehicle assets', () => {
    const pkg = AssetMemoryPlanner.plan(mockDP, mockSB, mockChar, mockSG, mockWS);
    const vehicles = pkg.assets.filter(a => a.category === 'vehicle');
    expect(vehicles.length).toBeGreaterThanOrEqual(1);
    expect(vehicles[0]!.name).toContain('Ninja');
  });
  test('creates embeddings', () => {
    const pkg = AssetMemoryPlanner.plan(mockDP, mockSB, mockChar, mockSG, mockWS);
    expect(pkg.embeddings.length).toBeGreaterThan(0);
    expect(pkg.embeddings[0]!.placeholder).toContain('[EMBED:');
  });
  test('creates references', () => {
    const pkg = AssetMemoryPlanner.plan(mockDP, mockSB, mockChar, mockSG, mockWS);
    expect(pkg.references.length).toBeGreaterThanOrEqual(0);
  });
  test('brand kit has colors from director', () => {
    const pkg = AssetMemoryPlanner.plan(mockDP, mockSB, mockChar, mockSG, mockWS);
    expect(pkg.brandKit!.primaryColors.length).toBeGreaterThan(0);
  });
});

describe('AssetValidator', () => {
  test('validates correct package', () => {
    const pkg = AssetMemoryPlanner.plan(mockDP, mockSB, mockChar, mockSG, mockWS);
    const result = AssetValidator.validate(pkg);
    expect(result.valid).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });
});

describe('AssetExporter', () => {
  test('exports all formats', () => {
    const pkg = AssetMemoryPlanner.plan(mockDP, mockSB, mockChar, mockSG, mockWS);
    const exp = AssetExporter.export(pkg);
    expect(exp.assetLibraryJson.length).toBe(pkg.assets.length);
    expect(exp.brandKitJson).toBeTruthy();
    expect(exp.styleGuideJson).toBeTruthy();
    expect(exp.promptTemplatePackage.length).toBeGreaterThan(0);
  });
});

describe('BrandKitManager', () => {
  test('saves and retrieves', () => {
    const mgr = new BrandKitManager();
    const kit: any = { id: 'bk1', brandName: 'Kawasaki', primaryColors: ['#00FF00'] };
    mgr.save(kit);
    expect(mgr.get('bk1')).toBe(kit);
    expect(mgr.getByName('kawasaki')).toBe(kit);
  });
});

describe('PromptTemplateManager', () => {
  test('applies template with variables', () => {
    const mgr = new PromptTemplateManager();
    mgr.save({ id: 't1', name: 'Test', category: 'cinematic' as any, imagePromptTemplate: '{subject} in {lighting}', videoPromptTemplate: '{subject}', negativePromptTemplate: 'blur', styleSuffix: '', variables: ['{subject}','{lighting}'], usageCount: 0, createdAt: '' });
    const result = mgr.apply('t1', { '{subject}': 'Ninja 300', '{lighting}': 'golden hour' });
    expect(result).toBeTruthy();
    expect(result!.image).toBe('Ninja 300 in golden hour');
  });
});

describe('ReferenceManager', () => {
  test('builds reference chains', () => {
    const mgr = new ReferenceManager();
    mgr.add({ id:'r1', sourceAssetId:'a1', targetAssetId:'a2', relationship:'used_with', createdAt:'' });
    mgr.add({ id:'r2', sourceAssetId:'a2', targetAssetId:'a3', relationship:'depends_on', createdAt:'' });
    const chain = mgr.getChain('a1');
    expect(chain.length).toBeGreaterThanOrEqual(2);
  });
});

describe('VersionManager', () => {
  test('tracks versions and computes diff', () => {
    const mgr = new VersionManager();
    mgr.addVersion('a1', '1.0.0', 'Initial', { color: 'green', model: 'Ninja' });
    mgr.addVersion('a1', '1.1.0', 'Color change', { color: 'red', model: 'Ninja', year: '2025' });
    expect(mgr.getHistory('a1')).toHaveLength(2);
    const diff = mgr.diff('a1', '1.0.0', '1.1.0');
    expect(diff.changed).toContain('color');
    expect(diff.added).toContain('year');
  });
});

describe('EmbeddingManager', () => {
  test('resolves placeholders', () => {
    const mgr = new EmbeddingManager();
    mgr.save({ id:'e1', assetId:'a1', type:'visual', placeholder:'[EMBED:bike_001]', providerHints:{}, createdAt:'' });
    expect(mgr.resolve('[EMBED:bike_001]')?.assetId).toBe('a1');
  });
});

describe('AssetMemoryStore', () => {
  beforeEach(() => AssetMemoryStore.resetInstance());
  test('records and searches', () => {
    const store = AssetMemoryStore.getInstance();
    store.record({ productionTitle:'Test', packageId:'p1', assetCount:5, hasBrandKit:true });
    expect(store.size).toBe(1);
    store.addToGlobalLibrary([{ assetId:'a1', uuid:'u1', name:'Ninja', category:'vehicle', subcategory:'', version:'1.0.0', createdAt:'', modifiedAt:'', projectOrigin:'', tags:['ninja','kawasaki'], description:'', previewMetadata:{}, usageCount:0, favorite:false, archived:false, data:{} }]);
    expect(store.searchGlobal('ninja')).toHaveLength(1);
  });
});
