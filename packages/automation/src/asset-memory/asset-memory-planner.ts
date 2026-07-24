// ============================================================
// CreatorAI Studio — Asset Memory Planner
// ============================================================
// Extracts reusable assets from all upstream pipeline data,
// builds brand kits, style guides, prompt templates,
// and generates reuse recommendations.
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { DirectorPlan } from '../director/director.types';
import type { Storyboard } from '../storyboard/storyboard.types';
import type { CharacterDatabase, EntityIdentity } from '../character/character.types';
import type { SceneGraphPackage } from '../scene-graph/scene-graph.types';
import type { WorldStatePackage } from '../world-state/world-state.types';
import type {
  AssetMemoryPackage, AssetRecord, AssetCategory, BrandKit, StyleGuide,
  PromptTemplate, PromptTemplateCategory, AssetReference,
  EmbeddingRecord, CharacterAsset, VehicleAsset, EnvironmentAsset,
} from './asset.types';

const log = Logger.for('AssetMemoryPlanner');

// ── Prompt template library ──

const PROMPT_TEMPLATES: Array<{ category: PromptTemplateCategory; name: string; image: string; video: string; negative: string; style: string; vars: string[] }> = [
  { category: 'automotive_commercial' as any || 'commercial', name: 'Automotive Commercial', image: '{subject}, {camera} shot, {lighting} lighting, {color_grading} color grading, premium automotive commercial, 8k, cinematic', video: '{subject}, {camera} camera movement, {lighting} lighting, {motion} motion, cinematic driving footage', negative: 'blurry, low quality, amateur, flat lighting', style: 'premium automotive', vars: ['{subject}', '{camera}', '{lighting}', '{color_grading}', '{motion}'] },
  { category: 'cinematic', name: 'Cinematic', image: '{subject}, {camera}, {lighting}, cinematic composition, anamorphic lens, film grain, 8k', video: '{subject}, {camera} movement, {lighting}, cinematic quality, Hollywood grade', negative: 'amateur, flat, boring, low quality', style: 'Hollywood cinematic', vars: ['{subject}', '{camera}', '{lighting}'] },
  { category: 'motivational', name: 'Motivational', image: '{subject}, {lighting}, epic composition, inspirational, dramatic sky, 8k', video: '{subject}, {camera}, epic and uplifting, dramatic score, Nike style', negative: 'boring, static, flat, depressing', style: 'inspirational epic', vars: ['{subject}', '{camera}', '{lighting}'] },
  { category: 'luxury', name: 'Luxury', image: '{subject}, {lighting}, premium aesthetic, elegant, minimalist, Cartier style, 8k', video: '{subject}, smooth {camera}, silky motion, luxury brand quality', negative: 'cheap, cluttered, harsh, low quality', style: 'luxury premium', vars: ['{subject}', '{camera}', '{lighting}'] },
  { category: 'tech', name: 'Technology', image: '{subject}, {lighting}, sleek tech aesthetic, Apple style, clean, futuristic, 8k', video: '{subject}, {camera}, futuristic, clean design, smooth reveal', negative: 'old, cluttered, messy, low quality', style: 'sleek tech', vars: ['{subject}', '{camera}', '{lighting}'] },
  { category: 'sports', name: 'Sports', image: '{subject}, {lighting}, athletic energy, Nike style, dynamic, 8k', video: '{subject}, {camera}, high energy, slow motion impact, athletic', negative: 'static, boring, low energy', style: 'high energy sports', vars: ['{subject}', '{camera}', '{lighting}'] },
  { category: 'travel', name: 'Travel', image: '{subject}, {lighting}, wanderlust, breathtaking, golden hour, 8k', video: '{subject}, drone {camera}, epic landscape, Sam Kolder style', negative: 'indoor, boring, flat, ugly', style: 'travel wanderlust', vars: ['{subject}', '{camera}', '{lighting}'] },
  { category: 'documentary', name: 'Documentary', image: '{subject}, {lighting}, documentary style, authentic, 35mm film, 8k', video: '{subject}, observational {camera}, natural lighting, BBC style', negative: 'artificial, neon, CGI, cartoon', style: 'observational documentary', vars: ['{subject}', '{camera}', '{lighting}'] },
  { category: 'youtube_shorts', name: 'YouTube Shorts', image: '{subject}, {lighting}, vertical 9:16, eye-catching, high engagement, 8k', video: '{subject}, {camera}, fast-paced, hook in 2 seconds, vertical', negative: 'boring, slow, horizontal, low quality', style: 'viral shorts', vars: ['{subject}', '{camera}', '{lighting}'] },
  { category: 'product_review', name: 'Product Review', image: '{subject}, studio {lighting}, product photography, clean background, 8k', video: '{subject}, orbit {camera}, studio reveal, premium product showcase', negative: 'messy background, low quality, amateur', style: 'product showcase', vars: ['{subject}', '{camera}', '{lighting}'] },
];

export class AssetMemoryPlanner {
  /**
   * Build the complete asset memory package from all upstream data.
   */
  static plan(
    directorPlan: DirectorPlan,
    storyboard: Storyboard,
    charDb: CharacterDatabase,
    sceneGraphPkg: SceneGraphPackage,
    worldStatePkg: WorldStatePackage,
  ): AssetMemoryPackage {
    const startTime = performance.now();

    log.info('Asset memory planning', { entities: charDb.entities.length });

    const assets: AssetRecord[] = [];
    const references: AssetReference[] = [];
    const embeddings: EmbeddingRecord[] = [];
    let assetCounter = 0;

    const makeAssetId = () => `asset_${++assetCounter}`;

    // ── Extract character assets ──
    for (const entity of charDb.entities) {
      if (entity.category === 'human') {
        const charData: CharacterAsset = {
          referenceIdentity: entity.identityBlock,
          appearance: entity.characterProfile?.clothing.overall ?? '',
          preferredSeed: entity.globalSeed,
          referenceImagesMeta: [],
          identityBlock: entity.identityBlock,
          clothing: entity.characterProfile?.clothing.overall ?? '',
          accessories: entity.characterProfile?.accessories ?? [],
          voice: '',
          expressions: [entity.characterProfile?.expressionStyle ?? 'neutral'],
          forbiddenChanges: entity.appearance.forbiddenChanges,
        };
        assets.push(AssetMemoryPlanner.makeAsset(makeAssetId(), entity.displayName, 'character', 'human', directorPlan.title, entity.appearance.preferredColors.concat(entity.displayName.toLowerCase().split(' ')), charData));

        embeddings.push({
          id: `emb_${embeddings.length + 1}`, assetId: assets[assets.length - 1]!.assetId,
          type: 'character', placeholder: `[EMBED:${entity.id}]`,
          providerHints: { flux: `consistent character: ${entity.displayName}`, runway: `maintain character: ${entity.displayName}` },
          createdAt: new Date().toISOString(),
        });
      }

      if (entity.category === 'vehicle') {
        const vp = entity.vehicleProfile;
        const vehicleData: VehicleAsset = {
          manufacturer: vp?.manufacturer ?? '', model: vp?.model ?? '', variant: vp?.variant ?? '',
          color: vp?.primaryColor ?? '', wheelDesign: vp?.wheelDesign ?? '', exhaust: vp?.exhaust ?? '',
          decals: vp?.brandStickers ?? [],
          preferredCameraAngles: ['orbit', 'tracking', 'hero_shot', 'drone', 'macro'],
          preferredLighting: ['golden_hour', 'dramatic', 'rim_light', 'studio'],
          referenceIdentity: entity.identityBlock,
        };
        assets.push(AssetMemoryPlanner.makeAsset(makeAssetId(), entity.displayName, 'vehicle', vp?.manufacturer?.toLowerCase() ?? 'generic', directorPlan.title, [entity.displayName.toLowerCase(), vp?.manufacturer?.toLowerCase() ?? '', vp?.model?.toLowerCase() ?? ''].filter(Boolean), vehicleData));

        embeddings.push({
          id: `emb_${embeddings.length + 1}`, assetId: assets[assets.length - 1]!.assetId,
          type: 'visual', placeholder: `[EMBED:${entity.id}]`,
          providerHints: { flux: `exact vehicle: ${entity.displayName}`, veo: `consistent vehicle: ${entity.displayName}` },
          createdAt: new Date().toISOString(),
        });
      }

      if (entity.category === 'prop') {
        assets.push(AssetMemoryPlanner.makeAsset(makeAssetId(), entity.displayName, 'prop', 'general', directorPlan.title, [entity.displayName.toLowerCase()], {}));
      }
    }

    // ── Extract environment assets ──
    const seenEnvs = new Set<string>();
    for (const snap of worldStatePkg.snapshots) {
      const loc = snap.environment.location;
      if (seenEnvs.has(loc)) continue;
      seenEnvs.add(loc);

      const envData: EnvironmentAsset = {
        location: loc, terrain: snap.environment.terrain, roadType: snap.environment.roadType ?? '',
        buildings: snap.environment.city ? 'urban' : '', sky: snap.environment.sky ?? 'daylight',
        weather: snap.environment.rain > 0 ? 'rain' : snap.environment.snow > 0 ? 'snow' : 'clear',
        lighting: `temp=${snap.lighting.temperature}K, intensity=${snap.lighting.intensity}`,
        atmosphere: snap.environment.fog > 0 ? 'foggy' : 'clear',
        cameraPresets: ['tracking', 'drone', 'static'],
      };
      assets.push(AssetMemoryPlanner.makeAsset(makeAssetId(), `${loc} environment`, 'environment', loc, directorPlan.title, [loc, envData.terrain, envData.weather], envData));

      embeddings.push({
        id: `emb_${embeddings.length + 1}`, assetId: assets[assets.length - 1]!.assetId,
        type: 'environment', placeholder: `[EMBED:env_${loc}]`,
        providerHints: { flux: `${loc} environment`, veo: `${loc} setting` },
        createdAt: new Date().toISOString(),
      });
    }

    // ── Build references (entity → environment) ──
    for (const entity of charDb.entities) {
      const entityAsset = assets.find((a) => a.name === entity.displayName);
      if (!entityAsset) continue;
      for (const envAsset of assets.filter((a) => a.category === 'environment')) {
        references.push({
          id: `ref_${references.length + 1}`,
          sourceAssetId: entityAsset.assetId,
          targetAssetId: envAsset.assetId,
          relationship: 'used_with',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // ── Build brand kit ──
    const brandKit = AssetMemoryPlanner.buildBrandKit(directorPlan, storyboard);

    // ── Build style guide ──
    const styleGuide = AssetMemoryPlanner.buildStyleGuide(directorPlan);

    // ── Build prompt templates ──
    const promptTemplates: PromptTemplate[] = PROMPT_TEMPLATES.map((t, idx) => ({
      id: `tmpl_${idx + 1}`, name: t.name, category: t.category as PromptTemplateCategory,
      imagePromptTemplate: t.image, videoPromptTemplate: t.video,
      negativePromptTemplate: t.negative, styleSuffix: t.style,
      variables: t.vars, usageCount: 0, createdAt: new Date().toISOString(),
    }));

    // ── Reuse recommendations ──
    const recommendations = AssetMemoryPlanner.generateRecommendations(assets, directorPlan);

    // ── Category counts ──
    const categories: Record<string, number> = {};
    for (const a of assets) categories[a.category] = (categories[a.category] ?? 0) + 1;

    const processingTimeMs = Math.round(performance.now() - startTime);

    log.info('Asset memory complete', { assets: assets.length, references: references.length, embeddings: embeddings.length, processingTimeMs });

    return {
      id: generateId(ID_PREFIXES.pipeline),
      productionTitle: directorPlan.title,
      assets, brandKit, styleGuide, promptTemplates, references, embeddings,
      recommendations,
      metadata: {
        totalAssets: assets.length,
        categories,
        generatedAt: new Date().toISOString(),
        engine: 'asset-memory-planner-v1',
        processingTimeMs,
      },
    };
  }

  // ── Brand Kit Builder ──

  private static buildBrandKit(dp: DirectorPlan, sb: Storyboard): BrandKit {
    return {
      id: generateId(ID_PREFIXES.pipeline),
      brandName: dp.title.split('–')[0]?.trim().split('-')[0]?.trim() ?? dp.title,
      primaryColors: dp.colorPalette.slice(0, 2),
      secondaryColors: dp.colorPalette.slice(2, 4),
      accentColors: dp.colorPalette.length > 4 ? dp.colorPalette.slice(4) : ['#e94560'],
      typography: { heading: 'Montserrat Bold', body: 'Inter Regular', accent: 'Poppins SemiBold' },
      logoMeta: { name: dp.title, variants: ['full', 'icon', 'monochrome'], placement: 'bottom-right' },
      watermark: `© ${dp.title}`,
      animationStyle: dp.globalPacing === 'fast' ? 'energetic' : dp.globalPacing === 'slow' ? 'elegant' : 'dynamic',
      introStyle: `${dp.globalStyle} intro with brand colors`,
      outroStyle: `Subscribe CTA with brand elements`,
      thumbnailStyle: `Bold text overlay on cinematic frame, ${dp.globalColorGrading} grading`,
      socialTemplates: {
        youtube_shorts: '9:16 vertical, hook in 2 seconds',
        instagram_reels: '9:16 vertical, trending audio',
        tiktok: '9:16 vertical, fast-paced cuts',
      },
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
  }

  // ── Style Guide Builder ──

  private static buildStyleGuide(dp: DirectorPlan): StyleGuide {
    return {
      id: generateId(ID_PREFIXES.pipeline),
      visualStyle: dp.globalStyle,
      colorGrading: dp.globalColorGrading,
      cameraStyle: dp.scenes.map((s) => s.cameraStyle).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      lightingStyle: dp.scenes.map((s) => s.lighting).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      motionStyle: dp.scenes.map((s) => s.motionStyle).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      transitionStyle: dp.scenes.map((s) => s.transitionOut).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      musicStyle: dp.globalMood,
      narrationStyle: dp.scenes.map((s) => s.narrationStyle).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      editingStyle: `${dp.globalPacing} pacing, ${dp.globalColorGrading} grade`,
      createdAt: new Date().toISOString(),
    };
  }

  // ── Recommendations ──

  private static generateRecommendations(assets: AssetRecord[], dp: DirectorPlan): AssetMemoryPackage['recommendations'] {
    const recs: AssetMemoryPackage['recommendations'] = [];
    const text = dp.title.toLowerCase();

    for (const asset of assets) {
      if (asset.category === 'vehicle' && asset.usageCount > 0) {
        recs.push({ type: 'reuse_vehicle', assetId: asset.assetId, reason: `${asset.name} was used before — reuse for visual consistency`, score: 85 });
      }
      if (asset.category === 'character' && asset.tags.some((t) => text.includes(t))) {
        recs.push({ type: 'reuse_character', assetId: asset.assetId, reason: `${asset.name} matches the current topic`, score: 75 });
      }
      if (asset.category === 'environment' && asset.tags.some((t) => text.includes(t))) {
        recs.push({ type: 'reuse_environment', assetId: asset.assetId, reason: `${asset.name} environment matches`, score: 70 });
      }
    }

    return recs.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  // ── Helper ──

  private static makeAsset(id: string, name: string, category: AssetCategory, subcategory: string, projectOrigin: string, tags: string[], data: Record<string, unknown>): AssetRecord {
    return {
      assetId: id, uuid: `${id}-${Date.now().toString(36)}`, name, category, subcategory,
      version: '1.0.0', createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(),
      projectOrigin, tags: tags.filter(Boolean), description: `${name} (${category})`,
      previewMetadata: {}, usageCount: 0, favorite: false, archived: false, data,
    };
  }
}
