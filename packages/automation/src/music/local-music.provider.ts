// ============================================================
// CreatorAI Studio — Local Music Provider
// ============================================================
// Serves royalty-free background music from the local
// /assets/music/ directory. AI-powered category selection
// matches script topic, emotions, and mood to the best track.
//
// ₹0 cost — all tracks are locally generated.
// ============================================================

import { Logger } from '@creatorai/agents';
import type {
  IMusicProvider,
  MusicTrack,
  MusicSearchRequest,
  MusicSelectionResult,
  MusicProviderCapabilities,
} from './music-provider.interface';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import { MusicScanner } from './music-scanner';

const log = Logger.for('LocalMusicProvider');

// ── Topic → Category mapping (AI selection rules) ──

const TOPIC_CATEGORY_MAP: Array<{ keywords: string[]; category: string; weight: number }> = [
  { keywords: ['ai', 'artificial intelligence', 'machine learning', 'technology', 'tech', 'coding', 'programming', 'software', 'digital', 'cyber', 'data', 'robot'], category: 'technology', weight: 10 },
  { keywords: ['startup', 'business', 'corporate', 'entrepreneur', 'company', 'profit', 'revenue', 'ceo', 'leadership', 'management', 'marketing'], category: 'business', weight: 10 },
  { keywords: ['motivation', 'motivational', 'inspire', 'success', 'winner', 'champion', 'never quit', 'never give up', 'hustle', 'grind', 'discipline', 'mindset', 'growth'], category: 'motivational', weight: 10 },
  { keywords: ['crime', 'horror', 'thriller', 'murder', 'dark', 'suspense', 'mystery', 'ghost', 'scary'], category: 'horror', weight: 10 },
  { keywords: ['sad', 'loss', 'death', 'grief', 'cry', 'heartbreak', 'lonely', 'depression'], category: 'sad', weight: 10 },
  { keywords: ['emotional', 'feeling', 'reflection', 'memory', 'nostalgia', 'love', 'relationship'], category: 'emotional', weight: 10 },
  { keywords: ['news', 'breaking', 'report', 'current affairs', 'politics', 'election', 'government'], category: 'news', weight: 10 },
  { keywords: ['sport', 'football', 'cricket', 'basketball', 'workout', 'fitness', 'gym', 'running', 'athlete'], category: 'sports', weight: 10 },
  { keywords: ['luxury', 'premium', 'brand', 'fashion', 'car', 'watch', 'jewelry', 'rich', 'wealth', 'expensive', 'lifestyle'], category: 'luxury', weight: 10 },
  { keywords: ['happy', 'fun', 'joy', 'celebration', 'party', 'laugh', 'comedy', 'smile', 'cheerful'], category: 'happy', weight: 10 },
  { keywords: ['epic', 'hero', 'warrior', 'battle', 'legend', 'conquer', 'fight', 'war'], category: 'epic', weight: 10 },
  { keywords: ['film', 'movie', 'cinematic', 'drama', 'story', 'narrative', 'documentary'], category: 'cinematic', weight: 5 },
];

// ── Emotion → Energy mapping ──

const EMOTION_ENERGY: Record<string, number> = {
  curiosity: 5, surprise: 7, determination: 8, inspiration: 7,
  excitement: 9, sadness: 2, anger: 8, joy: 8, neutral: 5,
  fear: 4, hope: 6, pride: 7, calm: 3,
};

export interface LocalMusicProviderConfig {
  /** Path to assets/music/ directory */
  musicDir: string;
  /** Path to music-index.json */
  indexPath?: string;
}

export class LocalMusicProvider implements IMusicProvider {
  readonly providerId = 'local_music';
  readonly providerName = 'Local Music Library';
  readonly priority = 0; // Highest — it's always available

  private readonly musicDir: string;
  private readonly indexPath: string;
  private readonly scanner: MusicScanner;
  private tracks: MusicTrack[] = [];
  private loaded = false;

  constructor(config: LocalMusicProviderConfig) {
    this.musicDir = config.musicDir;
    this.indexPath = config.indexPath ?? join(config.musicDir, 'music-index.json');
    this.scanner = new MusicScanner(config.musicDir);
  }

  /** Force a rescan of the music library. Returns scan results. */
  rescan(): { totalTracks: number; categories: string[] } {
    this.loaded = false;
    const result = this.scanner.scan(true);
    this.tracks = result.tracks;
    this.loaded = true;
    return { totalTracks: result.totalTracks, categories: result.categories };
  }

  /** Get the scanner instance for direct access. */
  getScanner(): MusicScanner { return this.scanner; }

  // ── IMusicProvider interface ──────────────────────────────

  async isAvailable(): Promise<boolean> {
    this.ensureLoaded();
    return this.tracks.length > 0;
  }

  getCapabilities(): MusicProviderCapabilities {
    this.ensureLoaded();
    const categories = [...new Set(this.tracks.map((t) => t.category))];
    return {
      totalTracks: this.tracks.length,
      categories,
      supportedFormats: ['mp3', 'wav'],
      supportsSearch: true,
      supportsPreview: true,
      supportsStreaming: false,
      maxDuration: Math.max(...this.tracks.map((t) => t.duration), 0),
      costPerTrack: 0,
    };
  }

  async getTrack(trackId: string): Promise<MusicTrack | null> {
    this.ensureLoaded();
    return this.tracks.find((t) => t.id === trackId) ?? null;
  }

  async getRandomTrack(category?: string): Promise<MusicTrack | null> {
    this.ensureLoaded();
    const pool = category
      ? this.tracks.filter((t) => t.category === category)
      : this.tracks;
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)]!;
  }

  async searchTracks(request: MusicSearchRequest): Promise<MusicTrack[]> {
    this.ensureLoaded();
    let results = [...this.tracks];

    if (request.category) {
      results = results.filter((t) => t.category === request.category);
    }
    if (request.mood) {
      const mood = request.mood.toLowerCase();
      results = results.filter((t) =>
        t.mood.toLowerCase().includes(mood) || t.tags.some((tag) => tag.includes(mood)),
      );
    }
    if (request.minEnergy !== undefined) {
      results = results.filter((t) => t.energy >= request.minEnergy!);
    }
    if (request.maxEnergy !== undefined) {
      results = results.filter((t) => t.energy <= request.maxEnergy!);
    }
    if (request.tags?.length) {
      const searchTags = request.tags.map((t) => t.toLowerCase());
      results = results.filter((t) =>
        t.tags.some((tag) => searchTags.some((st) => tag.includes(st))),
      );
    }
    if (request.videoDuration) {
      // Prefer tracks longer than video (no need to loop)
      results.sort((a, b) => {
        const aOk = a.duration >= request.videoDuration! ? 1 : 0;
        const bOk = b.duration >= request.videoDuration! ? 1 : 0;
        return bOk - aOk;
      });
    }

    return results;
  }

  /**
   * AI-powered music selection — analyzes topic, emotions, and mood
   * to find the best matching track.
   */
  async selectTrack(request: MusicSearchRequest): Promise<MusicSelectionResult> {
    this.ensureLoaded();

    if (this.tracks.length === 0) {
      return { success: false, track: null, reason: 'No tracks available', matchScore: 0, alternatives: [], error: 'Empty library' };
    }

    // ── Step 1: Determine best category from topic ──
    let bestCategory = 'motivational'; // default
    let bestCategoryScore = 0;

    if (request.topic) {
      const topicLower = request.topic.toLowerCase();
      for (const rule of TOPIC_CATEGORY_MAP) {
        let score = 0;
        for (const kw of rule.keywords) {
          if (topicLower.includes(kw)) {
            score += rule.weight;
          }
        }
        if (score > bestCategoryScore) {
          bestCategoryScore = score;
          bestCategory = rule.category;
        }
      }
    }

    // Override with manual category if provided
    if (request.category) {
      bestCategory = request.category;
      bestCategoryScore = 100;
    }

    log.info('AI music category selected', {
      topic: request.topic?.slice(0, 50),
      selectedCategory: bestCategory,
      score: bestCategoryScore,
    });

    // ── Step 2: Find tracks in category ──
    let candidates = this.tracks.filter((t) => t.category === bestCategory);

    // Fallback: if no tracks in category, try related categories
    if (candidates.length === 0) {
      candidates = this.tracks.filter((t) => t.category === 'cinematic');
    }
    if (candidates.length === 0) {
      candidates = [...this.tracks]; // all tracks
    }

    // ── Step 3: Score each candidate ──
    const scored = candidates.map((track) => {
      let score = 50; // base

      // Category match
      if (track.category === bestCategory) score += 30;

      // Energy match from emotions
      if (request.emotions?.length) {
        const avgEnergy = request.emotions.reduce((sum, e) =>
          sum + (EMOTION_ENERGY[e.toLowerCase()] ?? 5), 0,
        ) / request.emotions.length;
        const energyDiff = Math.abs(track.energy - avgEnergy);
        score += Math.max(0, 15 - energyDiff * 3);
      }

      // Tag match
      if (request.tags?.length) {
        const tagMatches = request.tags.filter((t) =>
          track.tags.some((tt) => tt.includes(t.toLowerCase())),
        ).length;
        score += tagMatches * 5;
      }

      // Mood match
      if (request.mood && track.mood.toLowerCase().includes(request.mood.toLowerCase())) {
        score += 10;
      }

      // Duration adequacy
      if (request.videoDuration && track.duration >= request.videoDuration) {
        score += 5;
      }

      // Prefer less-used tracks
      score -= Math.min(track.usageCount, 10);

      return { track, score: Math.min(100, Math.max(0, score)) };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0]!;
    const alternatives = scored.slice(1, 4).map((s) => s.track);

    // Update usage
    best.track.usageCount++;
    best.track.lastUsed = new Date().toISOString();
    this.saveIndex();

    const reason = `Category "${bestCategory}" selected for topic "${request.topic?.slice(0, 40) ?? 'N/A'}". ` +
      `Track "${best.track.name}" (${best.track.mood}, energy=${best.track.energy}, BPM=${best.track.bpm}) ` +
      `scored ${best.score}/100.`;

    log.info('Music track selected', {
      trackId: best.track.id,
      trackName: best.track.name,
      category: best.track.category,
      score: best.score,
      alternatives: alternatives.length,
    });

    return {
      success: true,
      track: best.track,
      reason,
      matchScore: best.score,
      alternatives,
      error: null,
    };
  }

  async validate(track: MusicTrack): Promise<{ valid: boolean; error?: string }> {
    if (!existsSync(track.path)) {
      return { valid: false, error: `File not found: ${track.path}` };
    }

    try {
      const probeOutput = execFileSync('ffprobe', [
        '-v', 'quiet',
        '-show_entries', 'format=duration,sample_rate',
        '-show_entries', 'stream=codec_name,channels,sample_rate',
        '-of', 'json', track.path,
      ], { timeout: 5000, encoding: 'utf8' });

      const data = JSON.parse(probeOutput);
      const stream = data.streams?.[0];
      const duration = parseFloat(data.format?.duration ?? '0');

      if (!stream) return { valid: false, error: 'No audio stream found' };
      if (duration < 5) return { valid: false, error: `Too short: ${duration}s` };

      return { valid: true };
    } catch (err) {
      return { valid: false, error: (err as Error).message?.slice(0, 100) };
    }
  }

  // ── Private ───────────────────────────────────────────────

  private ensureLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;

    // Auto-scan: detects files, extracts metadata, builds index
    const result = this.scanner.scan();
    this.tracks = result.tracks;

    if (result.tracks.length > 0) {
      log.info('Music library loaded via scanner', {
        tracks: result.totalTracks,
        categories: result.categories.length,
        cacheHit: result.cacheHit,
        scanTimeMs: result.scanTimeMs,
      });
    } else {
      log.info('Music library empty — drop audio files into assets/music/<category>/');
    }
  }

  private saveIndex(): void {
    try {
      const raw = JSON.parse(readFileSync(this.indexPath, 'utf8'));
      raw.tracks = this.tracks;
      writeFileSync(this.indexPath, JSON.stringify(raw, null, 2));
    } catch { /* best effort */ }
  }
}
