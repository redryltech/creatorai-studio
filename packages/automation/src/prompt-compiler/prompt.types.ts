// ============================================================
// CreatorAI Studio — AI Prompt Compiler Types
// ============================================================

// ── Prompt Blocks ─────────────────────────────────────────

export interface PromptBlock {
  id: string;
  type: 'visual' | 'camera' | 'character' | 'vehicle' | 'environment'
    | 'motion' | 'lighting' | 'effects' | 'composition' | 'audio'
    | 'brand' | 'continuity';
  content: string;
  priority: number;   // 0-10 (higher = more important)
  tokenEstimate: number;
}

// ── Canonical Prompt ──────────────────────────────────────

export interface CanonicalPrompt {
  sceneId: string;
  sceneOrder: number;

  // Summary
  sceneSummary: string;
  visualObjective: string;

  // Blocks
  blocks: PromptBlock[];

  // Compiled master prompt (provider-neutral)
  masterPrompt: string;

  // Negative prompt
  negativePrompt: string;

  // Token metrics
  tokenCount: number;
  estimatedComplexity: number; // 0-100
}

// ── Negative Prompt Structure ─────────────────────────────

export interface NegativePromptSpec {
  forbiddenObjects: string[];
  forbiddenColors: string[];
  forbiddenClothing: string[];
  forbiddenVehicles: string[];
  artifacts: string[];
  quality: string[];
  perspective: string[];
  compiled: string;
}

// ── Provider Settings ─────────────────────────────────────

export interface ProviderSettings {
  duration: number;
  aspectRatio: string;
  fps: number;
  resolution: string;
  seed: number;
  negativePrompt: string;
  cameraMetadata: Record<string, unknown>;
  styleMetadata: Record<string, unknown>;
}

// ── Provider-Specific Compiled Prompt ─────────────────────

export interface ProviderPrompt {
  providerId: string;
  providerName: string;
  prompt: string;
  negativePrompt: string;
  settings: ProviderSettings;
  tokenCount: number;
  estimatedCost: number;
  supportLevel: 'full' | 'partial' | 'basic';
}

// ── Prompt Quality Score ──────────────────────────────────

export interface PromptQualityScore {
  completeness: number;
  characterQuality: number;
  sceneQuality: number;
  cameraQuality: number;
  lightingQuality: number;
  motionQuality: number;
  providerReadiness: number;
  overallScore: number;
}

// ── Conflict ──────────────────────────────────────────────

export interface PromptConflict {
  type: 'brand' | 'lighting' | 'character' | 'world_state' | 'camera' | 'color' | 'length';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  resolution: string;
  autoResolved: boolean;
}

// ── Token Level ───────────────────────────────────────────

export type PromptLength = 'short' | 'balanced' | 'detailed' | 'maximum_quality';

// ════════════════════════════════════════════════════════════
// Compiled Prompt Package — the complete output
// ════════════════════════════════════════════════════════════

export interface CompiledPromptPackage {
  id: string;
  productionTitle: string;

  // Per-scene canonical prompts
  canonicalPrompts: CanonicalPrompt[];

  // Per-scene, per-provider compiled prompts
  providerPrompts: Record<string, ProviderPrompt[]>; // providerId → prompts per scene

  // Negative prompt specs
  negativeSpecs: NegativePromptSpec[];

  // Quality scores
  qualityScores: PromptQualityScore[];

  // Conflicts detected and resolved
  conflicts: PromptConflict[];

  // Metrics
  metadata: {
    totalScenes: number;
    totalProviders: number;
    avgTokenCount: number;
    avgQualityScore: number;
    totalConflicts: number;
    promptLength: PromptLength;
    generatedAt: string;
    engine: string;
    processingTimeMs: number;
  };
}

// ── Export Formats ─────────────────────────────────────────

export interface PromptExportFormats {
  canonicalJson: CanonicalPrompt[];
  providerPackage: Record<string, ProviderPrompt[]>;
  negativePackage: NegativePromptSpec[];
  promptReport: { scenes: number; providers: number; avgScore: number; conflicts: number };
  promptMetrics: { tokenCounts: number[]; complexities: number[]; scores: number[] };
  debugPackage: { conflicts: PromptConflict[]; lowScoreScenes: string[] };
}

// ── Memory ────────────────────────────────────────────────

export interface PromptCompilerMemoryEntry {
  id: string;
  productionTitle: string;
  packageId: string;
  avgScore: number;
  totalTokens: number;
  createdAt: string;
}
