// ============================================================
// CreatorAI Studio — AI Thumbnail Generator Types
// ============================================================

export type ThumbnailPlatform = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'linkedin';

export interface ThumbnailSpec {
  platform: ThumbnailPlatform;
  width: number;
  height: number;
  aspectRatio: string;
  textOverlay: string;
  textPosition: 'top' | 'center' | 'bottom' | 'top_left' | 'bottom_right';
  textColor: string;
  textStroke: string;
  fontSize: number;
  backgroundPrompt: string;
  subjectPrompt: string;
  style: string;
  colorScheme: string[];
  contrastLevel: 'low' | 'medium' | 'high' | 'extreme';
  emotionalTone: string;
}

export interface GeneratedThumbnail {
  id: string;
  platform: ThumbnailPlatform;
  filePath: string;
  width: number;
  height: number;
  sizeBytes: number;
  prompt: string;
  ctrPrediction: number;
  textOverlay: string;
  generationMethod: 'ai_generated' | 'frame_extract_enhanced' | 'composite';
  metadata: Record<string, unknown>;
}

export interface ThumbnailAnalysisScore {
  textReadability: number;
  visualContrast: number;
  subjectClarity: number;
  emotionalImpact: number;
  colorVibrancy: number;
  compositionBalance: number;
  ctrPrediction: number;
  overallScore: number;
  improvements: string[];
}

export interface ThumbnailPackage {
  id: string;
  productionTitle: string;
  thumbnails: GeneratedThumbnail[];
  bestThumbnail: GeneratedThumbnail | null;
  analysis: ThumbnailAnalysisScore;
  abTestVariants: GeneratedThumbnail[];
  metadata: {
    totalGenerated: number;
    bestCtrPrediction: number;
    generatedAt: string;
    engine: string;
    processingTimeMs: number;
  };
}

export interface ThumbnailMemoryEntry {
  id: string;
  productionTitle: string;
  packageId: string;
  bestCtr: number;
  createdAt: string;
}
