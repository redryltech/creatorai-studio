// ============================================================
// CreatorAI Studio — Music Library Scanner
// ============================================================
// Automatically scans /assets/music/ directories, detects all
// audio files, extracts metadata via FFprobe, generates
// music-index.json, detects duplicates, and caches results.
//
// Supported formats: MP3, WAV, AAC, M4A, FLAC, OGG
//
// On startup (or on demand):
//   1. Walk all category subdirectories
//   2. Detect supported audio files
//   3. Extract metadata (duration, sample rate, bitrate, codec, channels)
//   4. Assign category from folder name
//   5. Generate unique IDs from file hash
//   6. Detect duplicates by content hash
//   7. Write music-index.json
//   8. Cache for performance
//
// Zero manual JSON editing required.
// ============================================================
import { Logger } from '@creatorai/agents';
import { existsSync, readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, } from 'fs';
import { join, extname, basename, relative } from 'path';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
const log = Logger.for('MusicScanner');
// Supported audio extensions
const SUPPORTED_EXTENSIONS = new Set([
    '.mp3', '.wav', '.aac', '.m4a', '.flac', '.ogg',
]);
// Default mood/energy heuristics based on category
const CATEGORY_DEFAULTS = {
    motivational: { mood: 'uplifting', energy: 8, bpm: 130, tags: ['motivation', 'success', 'energy'] },
    cinematic: { mood: 'dramatic', energy: 6, bpm: 90, tags: ['cinematic', 'film', 'dramatic'] },
    technology: { mood: 'futuristic', energy: 7, bpm: 120, tags: ['tech', 'digital', 'innovation'] },
    business: { mood: 'professional', energy: 5, bpm: 110, tags: ['business', 'corporate', 'startup'] },
    emotional: { mood: 'reflective', energy: 3, bpm: 75, tags: ['emotional', 'gentle', 'reflection'] },
    happy: { mood: 'cheerful', energy: 7, bpm: 125, tags: ['happy', 'cheerful', 'fun'] },
    sad: { mood: 'melancholic', energy: 2, bpm: 65, tags: ['sad', 'melancholy', 'quiet'] },
    epic: { mood: 'heroic', energy: 9, bpm: 95, tags: ['epic', 'heroic', 'battle'] },
    horror: { mood: 'suspenseful', energy: 4, bpm: 75, tags: ['horror', 'dark', 'suspense'] },
    sports: { mood: 'energetic', energy: 9, bpm: 140, tags: ['sports', 'action', 'workout'] },
    luxury: { mood: 'sophisticated', energy: 4, bpm: 90, tags: ['luxury', 'premium', 'elegant'] },
    news: { mood: 'urgent', energy: 6, bpm: 115, tags: ['news', 'breaking', 'report'] },
};
export class MusicScanner {
    musicDir;
    indexPath;
    cache = null;
    constructor(musicDir) {
        this.musicDir = musicDir;
        this.indexPath = join(musicDir, 'music-index.json');
    }
    /**
     * Full library scan. Checks if files changed since last scan;
     * if not, returns cached result for performance.
     */
    scan(forceRescan = false) {
        const startTime = performance.now();
        // Check cache
        if (!forceRescan && this.isCacheValid()) {
            const cached = this.loadCachedIndex();
            log.info('Music library cache hit', { tracks: cached.totalTracks });
            return {
                tracks: cached.tracks,
                totalTracks: cached.totalTracks,
                totalSizeBytes: cached.totalSizeBytes,
                totalDurationSec: cached.totalDurationSec,
                categories: cached.categories,
                duplicates: [],
                errors: [],
                scanTimeMs: Math.round(performance.now() - startTime),
                cacheHit: true,
            };
        }
        log.info('Scanning music library', { dir: this.musicDir });
        if (!existsSync(this.musicDir)) {
            mkdirSync(this.musicDir, { recursive: true });
            return this.emptyResult(startTime);
        }
        const tracks = [];
        const errors = [];
        const hashMap = new Map(); // contentHash → trackId
        const duplicates = [];
        const fileHashes = {};
        const categories = new Set();
        let trackCounter = 0;
        // Scan each category subdirectory
        const subdirs = readdirSync(this.musicDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        for (const category of subdirs) {
            categories.add(category);
            const categoryDir = join(this.musicDir, category);
            let files;
            try {
                files = readdirSync(categoryDir).filter((f) => {
                    const ext = extname(f).toLowerCase();
                    return SUPPORTED_EXTENSIONS.has(ext);
                });
            }
            catch {
                continue;
            }
            for (const filename of files) {
                const filePath = join(categoryDir, filename);
                try {
                    // Content hash for duplicate detection + change detection
                    const contentHash = this.hashFile(filePath);
                    fileHashes[relative(this.musicDir, filePath)] = contentHash;
                    // Check duplicate
                    if (hashMap.has(contentHash)) {
                        duplicates.push({
                            original: hashMap.get(contentHash),
                            duplicate: filePath,
                            hash: contentHash,
                        });
                        log.warn('Duplicate track detected', {
                            original: hashMap.get(contentHash),
                            duplicate: filePath,
                        });
                        continue; // Skip duplicate
                    }
                    // Extract metadata via FFprobe
                    const metadata = this.extractMetadata(filePath);
                    if (!metadata) {
                        errors.push({ file: filePath, error: 'FFprobe metadata extraction failed' });
                        continue;
                    }
                    trackCounter++;
                    const trackId = `${category}_${String(trackCounter).padStart(3, '0')}`;
                    const defaults = CATEGORY_DEFAULTS[category] ?? CATEGORY_DEFAULTS.cinematic;
                    // Clean name from filename
                    const cleanName = basename(filename, extname(filename))
                        .replace(/[-_]/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .split(' ')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(' ');
                    const track = {
                        id: trackId,
                        name: cleanName,
                        filename,
                        category,
                        mood: defaults.mood,
                        energy: defaults.energy,
                        bpm: defaults.bpm,
                        duration: metadata.duration,
                        volume: 0.35,
                        sampleRate: metadata.sampleRate,
                        channels: metadata.channels,
                        format: extname(filename).slice(1).toLowerCase(),
                        bitrate: metadata.bitrate,
                        sizeBytes: metadata.sizeBytes,
                        tags: [...defaults.tags, category, cleanName.toLowerCase()],
                        license: 'royalty_free',
                        path: filePath,
                        favorite: false,
                        usageCount: 0,
                        lastUsed: null,
                    };
                    tracks.push(track);
                    hashMap.set(contentHash, filePath);
                }
                catch (err) {
                    errors.push({ file: filePath, error: err.message?.slice(0, 100) ?? 'Unknown' });
                }
            }
        }
        // Sort tracks by category then name
        tracks.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        const totalSize = tracks.reduce((sum, t) => sum + t.sizeBytes, 0);
        const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);
        // Save index
        const index = {
            version: '2.0.0',
            scannedAt: new Date().toISOString(),
            musicDir: this.musicDir,
            totalTracks: tracks.length,
            totalSizeBytes: totalSize,
            totalDurationSec: Math.round(totalDuration),
            categories: [...categories].sort(),
            tracks,
            fileHashes,
        };
        this.saveIndex(index);
        this.cache = index;
        const scanTime = Math.round(performance.now() - startTime);
        log.info('Music library scan complete', {
            tracks: tracks.length,
            categories: categories.size,
            totalSizeKB: Math.round(totalSize / 1024),
            totalDurationSec: Math.round(totalDuration),
            duplicates: duplicates.length,
            errors: errors.length,
            scanTimeMs: scanTime,
        });
        return {
            tracks,
            totalTracks: tracks.length,
            totalSizeBytes: totalSize,
            totalDurationSec: Math.round(totalDuration),
            categories: [...categories].sort(),
            duplicates,
            errors,
            scanTimeMs: scanTime,
            cacheHit: false,
        };
    }
    /**
     * Quick check: has anything changed since the last scan?
     */
    isCacheValid() {
        if (!existsSync(this.indexPath))
            return false;
        try {
            const index = this.loadCachedIndex();
            if (!index)
                return false;
            // Check if any new files were added or removed
            const currentFiles = this.listAllAudioFiles();
            const indexedPaths = new Set(Object.keys(index.fileHashes));
            // Quick count comparison
            if (currentFiles.length !== indexedPaths.size)
                return false;
            // Check each file still exists and size hasn't changed
            for (const track of index.tracks) {
                if (!existsSync(track.path))
                    return false;
                const stat = statSync(track.path);
                if (stat.size !== track.sizeBytes)
                    return false;
            }
            return true;
        }
        catch {
            return false;
        }
    }
    listAllAudioFiles() {
        const files = [];
        if (!existsSync(this.musicDir))
            return files;
        const subdirs = readdirSync(this.musicDir, { withFileTypes: true })
            .filter((d) => d.isDirectory());
        for (const dir of subdirs) {
            const categoryDir = join(this.musicDir, dir.name);
            try {
                const categoryFiles = readdirSync(categoryDir)
                    .filter((f) => SUPPORTED_EXTENSIONS.has(extname(f).toLowerCase()));
                files.push(...categoryFiles.map((f) => join(dir.name, f)));
            }
            catch { /* skip */ }
        }
        return files;
    }
    /**
     * Extract audio metadata using FFprobe.
     */
    extractMetadata(filePath) {
        try {
            const output = execFileSync('ffprobe', [
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                filePath,
            ], { timeout: 10000, encoding: 'utf8' });
            const data = JSON.parse(output);
            const audioStream = data.streams?.find((s) => s.codec_type === 'audio');
            const format = data.format ?? {};
            if (!audioStream)
                return null;
            const stat = statSync(filePath);
            return {
                duration: parseFloat(format.duration ?? audioStream.duration ?? '0'),
                sampleRate: parseInt(audioStream.sample_rate ?? '44100', 10),
                bitrate: Math.round(parseInt(format.bit_rate ?? '0', 10) / 1000),
                channels: parseInt(audioStream.channels ?? '2', 10),
                codec: audioStream.codec_name ?? 'unknown',
                sizeBytes: stat.size,
            };
        }
        catch {
            return null;
        }
    }
    /**
     * Compute a fast content hash for duplicate detection.
     * Uses first 64KB + last 64KB for speed on large files.
     */
    hashFile(filePath) {
        const stat = statSync(filePath);
        const hash = createHash('md5');
        const fd = readFileSync(filePath);
        if (stat.size <= 131072) {
            hash.update(fd);
        }
        else {
            hash.update(fd.subarray(0, 65536));
            hash.update(fd.subarray(fd.length - 65536));
        }
        hash.update(String(stat.size)); // include size for extra safety
        return hash.digest('hex').slice(0, 16);
    }
    loadCachedIndex() {
        try {
            return JSON.parse(readFileSync(this.indexPath, 'utf8'));
        }
        catch {
            return null;
        }
    }
    saveIndex(index) {
        try {
            writeFileSync(this.indexPath, JSON.stringify(index, null, 2));
        }
        catch (err) {
            log.error('Failed to save music index', {}, err);
        }
    }
    emptyResult(startTime) {
        return {
            tracks: [],
            totalTracks: 0,
            totalSizeBytes: 0,
            totalDurationSec: 0,
            categories: [],
            duplicates: [],
            errors: [],
            scanTimeMs: Math.round(performance.now() - startTime),
            cacheHit: false,
        };
    }
}
//# sourceMappingURL=music-scanner.js.map