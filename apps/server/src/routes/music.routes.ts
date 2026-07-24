// ============================================================
// CreatorAI Studio — Music Library API Routes
// ============================================================

import { Router, type Request, type Response } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync, createWriteStream, renameSync, readdirSync } from 'fs';
import {
  MusicProviderRegistry,
  LocalMusicProvider,
  MusicScanner,
} from '@creatorai/automation';

const router = Router();
const MUSIC_DIR = join(__dirname, '../../../../assets/music');

function getProvider(): LocalMusicProvider | null {
  const reg = MusicProviderRegistry.getInstance();
  return reg.get('local_music') as LocalMusicProvider | undefined ?? null;
}

// ── GET /music/library — Full library with stats ──
router.get('/library', async (_req: Request, res: Response) => {
  try {
    const provider = getProvider();
    if (!provider) return res.json({ tracks: [], totalTracks: 0, categories: [] });

    const scanner = provider.getScanner();
    const result = scanner.scan();

    res.json({
      totalTracks: result.totalTracks,
      totalDuration: result.totalDurationSec,
      totalSize: result.totalSizeBytes,
      categories: result.categories,
      tracks: result.tracks.map((t) => ({
        id: t.id,
        name: t.name,
        filename: t.filename,
        category: t.category,
        mood: t.mood,
        energy: t.energy,
        bpm: t.bpm,
        duration: t.duration,
        format: t.format,
        sizeBytes: t.sizeBytes,
        tags: t.tags,
        favorite: t.favorite,
        usageCount: t.usageCount,
        lastUsed: t.lastUsed,
      })),
      scanTimeMs: result.scanTimeMs,
      cacheHit: result.cacheHit,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── POST /music/rescan — Force library rescan ──
router.post('/rescan', async (_req: Request, res: Response) => {
  try {
    const provider = getProvider();
    if (!provider) return res.status(404).json({ error: 'Music provider not found' });

    const result = provider.rescan();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── GET /music/search?q=...&category=...&mood=...&energy=... ──
router.get('/search', async (req: Request, res: Response) => {
  try {
    const provider = getProvider();
    if (!provider) return res.json({ tracks: [] });

    const tracks = await provider.searchTracks({
      category: req.query.category as string | undefined,
      mood: req.query.mood as string | undefined,
      minEnergy: req.query.minEnergy ? parseInt(req.query.minEnergy as string) : undefined,
      maxEnergy: req.query.maxEnergy ? parseInt(req.query.maxEnergy as string) : undefined,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      topic: req.query.q as string | undefined,
    });

    res.json({ tracks, total: tracks.length });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── GET /music/select?topic=...&emotions=... — AI selection ──
router.get('/select', async (req: Request, res: Response) => {
  try {
    const provider = getProvider();
    if (!provider) return res.status(404).json({ error: 'Music provider not found' });

    const result = await provider.selectTrack({
      topic: req.query.topic as string,
      emotions: req.query.emotions ? (req.query.emotions as string).split(',') : undefined,
      category: req.query.category as string | undefined,
      mood: req.query.mood as string | undefined,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── GET /music/track/:id — Get single track info ──
router.get('/track/:id', async (req: Request, res: Response) => {
  try {
    const provider = getProvider();
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    const track = await provider.getTrack(req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    res.json(track);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── GET /music/stream/:id — Stream audio for preview ──
router.get('/stream/:id', async (req: Request, res: Response) => {
  try {
    const provider = getProvider();
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    const track = await provider.getTrack(req.params.id);
    if (!track || !existsSync(track.path)) {
      return res.status(404).json({ error: 'Track file not found' });
    }

    const ext = track.format.toLowerCase();
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac',
      m4a: 'audio/mp4', flac: 'audio/flac', ogg: 'audio/ogg',
    };

    res.setHeader('Content-Type', mimeTypes[ext] ?? 'audio/mpeg');
    res.setHeader('Content-Length', track.sizeBytes);
    res.setHeader('Accept-Ranges', 'bytes');

    const { createReadStream } = await import('fs');
    createReadStream(track.path).pipe(res);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── GET /music/random?category=... — Random track ──
router.get('/random', async (req: Request, res: Response) => {
  try {
    const provider = getProvider();
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    const track = await provider.getRandomTrack(req.query.category as string | undefined);
    res.json({ track });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── GET /music/categories — List all categories ──
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const provider = getProvider();
    if (!provider) return res.json({ categories: [] });

    const caps = provider.getCapabilities();
    // Count tracks per category
    const scanner = provider.getScanner();
    const scan = scanner.scan();
    const catCounts: Record<string, number> = {};
    for (const t of scan.tracks) {
      catCounts[t.category] = (catCounts[t.category] ?? 0) + 1;
    }

    res.json({
      categories: caps.categories.map((c) => ({
        name: c,
        trackCount: catCounts[c] ?? 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── POST /music/upload — Upload track(s) to a category ──
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) ?? 'motivational';
    const categoryDir = join(MUSIC_DIR, category);

    if (!existsSync(categoryDir)) {
      mkdirSync(categoryDir, { recursive: true });
    }

    // Handle raw body upload (Content-Type: audio/*)
    const filename = (req.query.filename as string) ?? `upload-${Date.now()}.mp3`;
    const filePath = join(categoryDir, filename);

    const writeStream = createWriteStream(filePath);
    req.pipe(writeStream);

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Rescan library
    const provider = getProvider();
    if (provider) provider.rescan();

    res.json({
      success: true,
      message: `Uploaded ${filename} to ${category}`,
      path: filePath,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── POST /music/move — Move track to different category ──
router.post('/move', async (req: Request, res: Response) => {
  try {
    const { trackId, targetCategory } = req.body;
    if (!trackId || !targetCategory) {
      return res.status(400).json({ error: 'trackId and targetCategory required' });
    }

    const provider = getProvider();
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    const track = await provider.getTrack(trackId);
    if (!track) return res.status(404).json({ error: 'Track not found' });

    const targetDir = join(MUSIC_DIR, targetCategory);
    if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

    const newPath = join(targetDir, track.filename);
    renameSync(track.path, newPath);

    provider.rescan();
    res.json({ success: true, newPath, category: targetCategory });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export { router as musicRoutes };
