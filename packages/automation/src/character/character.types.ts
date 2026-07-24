// ============================================================
// CreatorAI Studio — Character Consistency Engine Types
// ============================================================

import { type Storyboard } from '../storyboard/storyboard.types';

// ── Entity Categories ─────────────────────────────────────

export type EntityCategory =
  | 'human' | 'vehicle' | 'animal' | 'product'
  | 'building' | 'weapon' | 'prop' | 'logo' | 'brand_asset';

export type ContinuityLevel = 'strict' | 'high' | 'medium' | 'low';

// ── Character (Human) Profile ─────────────────────────────

export interface CharacterProfile {
  gender: 'male' | 'female' | 'non_binary' | 'unspecified';
  ageRange: string;
  height: 'short' | 'average' | 'tall';
  bodyType: 'slim' | 'average' | 'athletic' | 'muscular' | 'heavy';
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'oblong';
  facialHair: string;
  expressionStyle: string;
  accessories: string[];
  jewelry: string[];
  helmet: string;
  glasses: string;
  shoes: string;
  clothing: {
    jacket: string;
    pants: string;
    shirt: string;
    overall: string;
  };
  brandColors: string[];
  signaturePose: string;
  walkingStyle: string;
}

// ── Vehicle Profile ───────────────────────────────────────

export interface VehicleProfile {
  manufacturer: string;
  model: string;
  year: string;
  variant: string;
  primaryColor: string;
  secondaryColor: string;
  paintFinish: 'gloss' | 'matte' | 'metallic' | 'satin' | 'chrome';
  wheelDesign: string;
  tyres: string;
  brakeType: string;
  exhaust: string;
  engineStyle: string;
  suspension: string;
  licensePlate: string;
  damageState: 'pristine' | 'minor_wear' | 'battle_scarred' | 'damaged';
  cleanliness: 'showroom' | 'clean' | 'dusty' | 'dirty' | 'muddy';
  brandStickers: string[];
}

// ── Environment Profile ───────────────────────────────────

export interface EnvironmentProfile {
  location: string;
  weather: string;
  timeOfDay: string;
  roadType: string;
  terrain: string;
  buildings: string;
  background: string;
  vegetation: string;
  trafficDensity: 'none' | 'light' | 'moderate' | 'heavy';
  crowdDensity: 'empty' | 'sparse' | 'moderate' | 'crowded';
}

// ── Appearance Memory ─────────────────────────────────────

export interface AppearanceMemory {
  referencePrompt: string;
  referenceDescription: string;
  visualEmbeddingPlaceholder: string;
  preferredColors: string[];
  forbiddenChanges: string[];
  requiredObjects: string[];
  requiredClothing: string[];
  requiredVehicleParts: string[];
}

// ════════════════════════════════════════════════════════════
// Entity Identity — the core identity record
// ════════════════════════════════════════════════════════════

export interface EntityIdentity {
  /** Unique ID (e.g. "char_001", "bike_001") */
  id: string;
  /** Persistent UUID for cross-session tracking */
  uuid: string;
  /** Human-readable name */
  displayName: string;
  /** Entity category */
  category: EntityCategory;
  /** How important this entity is (1-10) */
  priority: number;
  /** How visible in frame (0-100%) */
  visibilityScore: number;
  /** Narrative importance */
  importance: 'primary' | 'secondary' | 'background' | 'ambient';
  /** How strictly consistency must be maintained */
  continuityLevel: ContinuityLevel;

  // ── Seed Management ──
  globalSeed: number;
  sceneSeed: Map<string, number> | Record<string, number>;
  variationSeed: number;

  // ── Profiles (one will be populated based on category) ──
  characterProfile: CharacterProfile | null;
  vehicleProfile: VehicleProfile | null;
  environmentProfile: EnvironmentProfile | null;

  // ── Appearance Memory ──
  appearance: AppearanceMemory;

  // ── Scenes this entity appears in ──
  scenePresence: string[];

  // ── Provider-neutral identity prompt block ──
  identityBlock: string;
}

// ════════════════════════════════════════════════════════════
// Character Database — all entities for a production
// ════════════════════════════════════════════════════════════

export interface CharacterDatabase {
  id: string;
  productionTitle: string;
  entities: EntityIdentity[];
  identityMap: Record<string, string>; // entityId → identityBlock
  seedMap: Record<string, number>; // entityId → globalSeed
  metadata: {
    totalEntities: number;
    categories: Record<EntityCategory, number>;
    generatedAt: string;
    engine: string;
    processingTimeMs: number;
  };
}

// ── Continuity Report ─────────────────────────────────────

export interface ContinuityIssue {
  sceneId: string;
  entityId: string;
  issueType: 'character_change' | 'vehicle_change' | 'environment_mismatch'
    | 'lighting_mismatch' | 'weather_mismatch' | 'missing_accessory'
    | 'different_clothing' | 'wrong_color' | 'different_vehicle_part'
    | 'unexpected_removal';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  repair: {
    correctedPrompt: string;
    correctedIdentity: string;
    missingAssets: string[];
    recommendedSeed: number;
    continuityScore: number;
  };
}

export interface ContinuityReport {
  productionId: string;
  totalScenes: number;
  issues: ContinuityIssue[];
  overallScore: number;
  entityScores: Record<string, number>;
}

// ── Provider Identity Package ─────────────────────────────

export interface ProviderIdentityPackage {
  /** Provider-neutral identity blocks for all entities */
  identityBlocks: Record<string, string>;
  /** Per-scene identity instructions */
  sceneIdentities: Array<{
    sceneId: string;
    entities: Array<{
      entityId: string;
      identityBlock: string;
      seed: number;
      visibility: number;
    }>;
  }>;
  /** Provider-specific seed mappings */
  providerSeeds: Record<string, Record<string, number>>;
}

// ── Memory Entry ──────────────────────────────────────────

export interface CharacterMemoryEntry {
  id: string;
  productionTitle: string;
  databaseId: string;
  entityCount: number;
  continuityScore: number;
  createdAt: string;
}
