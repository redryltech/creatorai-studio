// ============================================================
// CreatorAI Studio — Sound Effects Generator
// ============================================================
// Generates realistic sound effects using FFmpeg synthesis.
// Each SFX is a layered combination of sine/noise/filter
// designed to approximate real-world sounds.
//
// ₹0 — no external API. Pure FFmpeg audio synthesis.
// ============================================================
import { Logger } from '@creatorai/agents';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import { generateId, ID_PREFIXES } from '@creatorai/shared';
const log = Logger.for('SfxGenerator');
const SFX_LIBRARY = {
    // ── Vehicle sounds ──
    engine_start: {
        name: 'Engine Start', category: 'vehicle',
        description: 'Motorcycle engine starting and revving',
        filter: 'anoisesrc=d=3:c=brown:r=44100:a=0.3,tremolo=f=15:d=0.9,lowpass=f=200,volume=0.6,afade=t=in:d=0.3,afade=t=out:st=2.5:d=0.5',
        duration: 3, volume: 0.6, fadeIn: 0.3, fadeOut: 0.5, frequency: 120,
    },
    engine_rev: {
        name: 'Engine Rev', category: 'vehicle',
        description: 'Engine revving high RPM',
        filter: 'anoisesrc=d=2:c=brown:r=44100:a=0.4,tremolo=f=25:d=0.8,bandpass=f=300:w=200,volume=0.7,afade=t=in:d=0.2,afade=t=out:st=1.5:d=0.5',
        duration: 2, volume: 0.7, fadeIn: 0.2, fadeOut: 0.5, frequency: 300,
    },
    engine_idle: {
        name: 'Engine Idle', category: 'vehicle',
        description: 'Motorcycle idling rumble',
        filter: 'anoisesrc=d=5:c=brown:r=44100:a=0.15,tremolo=f=8:d=0.95,lowpass=f=150,volume=0.3,afade=t=in:d=0.5,afade=t=out:st=4:d=1',
        duration: 5, volume: 0.3, fadeIn: 0.5, fadeOut: 1, frequency: 80,
    },
    tire_screech: {
        name: 'Tire Screech', category: 'vehicle',
        description: 'Tire screech on asphalt',
        filter: 'anoisesrc=d=1.5:c=white:r=44100:a=0.5,highpass=f=2000,tremolo=f=30:d=0.5,volume=0.4,afade=t=in:d=0.05,afade=t=out:st=1:d=0.5',
        duration: 1.5, volume: 0.4, fadeIn: 0.05, fadeOut: 0.5, frequency: 3000,
    },
    exhaust_pop: {
        name: 'Exhaust Pop', category: 'vehicle',
        description: 'Exhaust backfire pop',
        filter: 'anoisesrc=d=0.3:c=pink:r=44100:a=0.8,lowpass=f=500,volume=0.5,afade=t=out:d=0.2',
        duration: 0.3, volume: 0.5, fadeIn: 0, fadeOut: 0.2, frequency: 200,
    },
    // ── Nature / Ambient ──
    wind: {
        name: 'Wind', category: 'nature',
        description: 'Gentle wind blowing',
        filter: 'anoisesrc=d=8:c=brown:r=44100:a=0.1,lowpass=f=400,tremolo=f=0.3:d=0.8,volume=0.25,afade=t=in:d=1,afade=t=out:st=6:d=2',
        duration: 8, volume: 0.25, fadeIn: 1, fadeOut: 2, frequency: 200,
    },
    wind_strong: {
        name: 'Strong Wind', category: 'weather',
        description: 'Strong wind gusts',
        filter: 'anoisesrc=d=5:c=brown:r=44100:a=0.25,bandpass=f=300:w=300,tremolo=f=0.5:d=0.9,volume=0.35,afade=t=in:d=0.5,afade=t=out:st=4:d=1',
        duration: 5, volume: 0.35, fadeIn: 0.5, fadeOut: 1, frequency: 300,
    },
    rain: {
        name: 'Rain', category: 'weather',
        description: 'Steady rain falling',
        filter: 'anoisesrc=d=8:c=white:r=44100:a=0.08,highpass=f=1000,lowpass=f=8000,volume=0.2,afade=t=in:d=1,afade=t=out:st=6:d=2',
        duration: 8, volume: 0.2, fadeIn: 1, fadeOut: 2, frequency: 4000,
    },
    thunder: {
        name: 'Thunder', category: 'weather',
        description: 'Distant thunder rumble',
        filter: 'anoisesrc=d=3:c=brown:r=44100:a=0.6,lowpass=f=100,tremolo=f=2:d=0.7,volume=0.5,afade=t=in:d=0.1,afade=t=out:st=1.5:d=1.5',
        duration: 3, volume: 0.5, fadeIn: 0.1, fadeOut: 1.5, frequency: 60,
    },
    // ── Impacts ──
    impact_hit: {
        name: 'Impact Hit', category: 'impact',
        description: 'Heavy impact thud',
        filter: 'anoisesrc=d=0.5:c=brown:r=44100:a=0.7,lowpass=f=200,volume=0.6,afade=t=out:d=0.4',
        duration: 0.5, volume: 0.6, fadeIn: 0, fadeOut: 0.4, frequency: 100,
    },
    // ── Transitions ──
    whoosh: {
        name: 'Whoosh', category: 'whoosh',
        description: 'Fast whoosh transition',
        filter: 'anoisesrc=d=0.8:c=pink:r=44100:a=0.4,bandpass=f=1500:w=2000,volume=0.5,afade=t=in:d=0.1,afade=t=out:st=0.3:d=0.5',
        duration: 0.8, volume: 0.5, fadeIn: 0.1, fadeOut: 0.5, frequency: 1500,
    },
    swoosh: {
        name: 'Swoosh', category: 'transition',
        description: 'Smooth swoosh transition',
        filter: 'anoisesrc=d=0.6:c=pink:r=44100:a=0.3,bandpass=f=2000:w=3000,volume=0.4,afade=t=in:d=0.05,afade=t=out:st=0.2:d=0.4',
        duration: 0.6, volume: 0.4, fadeIn: 0.05, fadeOut: 0.4, frequency: 2000,
    },
    riser: {
        name: 'Riser', category: 'transition',
        description: 'Rising tension build-up',
        filter: 'sine=f=200:d=3,asetrate=44100*1.5,tremolo=f=4:d=0.3,volume=0.3,afade=t=in:d=0.5,afade=t=out:st=2.5:d=0.5',
        duration: 3, volume: 0.3, fadeIn: 0.5, fadeOut: 0.5, frequency: 200,
    },
    // ── Crowd / Ambient ──
    crowd_cheer: {
        name: 'Crowd Cheer', category: 'crowd',
        description: 'Crowd cheering and clapping',
        filter: 'anoisesrc=d=4:c=pink:r=44100:a=0.2,bandpass=f=800:w=600,tremolo=f=3:d=0.5,volume=0.35,afade=t=in:d=0.3,afade=t=out:st=3:d=1',
        duration: 4, volume: 0.35, fadeIn: 0.3, fadeOut: 1, frequency: 800,
    },
    city_ambient: {
        name: 'City Ambient', category: 'ambient',
        description: 'City background noise',
        filter: 'anoisesrc=d=8:c=pink:r=44100:a=0.06,bandpass=f=500:w=400,volume=0.15,afade=t=in:d=1,afade=t=out:st=6:d=2',
        duration: 8, volume: 0.15, fadeIn: 1, fadeOut: 2, frequency: 500,
    },
    // ── UI / Notification ──
    notification: {
        name: 'Notification', category: 'notification',
        description: 'Clean notification ping',
        filter: 'sine=f=880:d=0.3,afade=t=out:d=0.25,volume=0.3',
        duration: 0.3, volume: 0.3, fadeIn: 0, fadeOut: 0.25, frequency: 880,
    },
    success_chime: {
        name: 'Success Chime', category: 'notification',
        description: 'Positive success sound',
        filter: 'sine=f=660:d=0.15[a];sine=f=880:d=0.15[b];[a][b]concat=n=2:v=0:a=1,afade=t=out:st=0.2:d=0.1,volume=0.3',
        duration: 0.3, volume: 0.3, fadeIn: 0, fadeOut: 0.1, frequency: 770,
    },
};
// ── Category → scene keyword matching ──
const SCENE_SFX_MAP = [
    { keywords: ['motorcycle', 'bike', 'ride', 'engine', 'exhaust', 'kawasaki', 'ninja', 'rev'], effects: ['engine_rev', 'exhaust_pop'], ambient: 'wind' },
    { keywords: ['highway', 'road', 'drive', 'speed', 'cruise', 'accelerat'], effects: ['engine_idle', 'wind_strong'], ambient: 'wind' },
    { keywords: ['mountain', 'corner', 'curve', 'lean', 'turn'], effects: ['tire_screech', 'wind_strong'], ambient: 'wind' },
    { keywords: ['city', 'traffic', 'urban', 'street'], effects: ['engine_idle'], ambient: 'city_ambient' },
    { keywords: ['rain', 'storm', 'wet'], effects: ['rain', 'thunder'], ambient: 'rain' },
    { keywords: ['crowd', 'people', 'audience', 'cheer', 'fan'], effects: ['crowd_cheer'], ambient: null },
    { keywords: ['studio', 'reveal', 'dramatic', 'hero'], effects: ['riser', 'whoosh'], ambient: null },
    { keywords: ['subscribe', 'follow', 'like', 'comment', 'cta'], effects: ['notification', 'success_chime'], ambient: null },
];
export class SfxGenerator {
    /**
     * Generate a sound effect from a recipe.
     */
    static generate(recipeName, outputDir) {
        const recipe = SFX_LIBRARY[recipeName];
        if (!recipe)
            return null;
        if (!existsSync(outputDir))
            mkdirSync(outputDir, { recursive: true });
        const filePath = join(outputDir, `sfx-${recipeName}.mp3`);
        try {
            execFileSync('ffmpeg', [
                '-y', '-f', 'lavfi', '-i', recipe.filter,
                '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100', '-ac', '2',
                filePath,
            ], { timeout: 10000, stdio: 'pipe' });
            if (!existsSync(filePath))
                return null;
            const stat = statSync(filePath);
            return {
                id: generateId(ID_PREFIXES.asset),
                name: recipe.name,
                category: recipe.category,
                description: recipe.description,
                filePath,
                durationSec: recipe.duration,
                sizeBytes: stat.size,
                frequency: recipe.frequency,
                volume: recipe.volume,
                fadeIn: recipe.fadeIn,
                fadeOut: recipe.fadeOut,
                generationMethod: 'ffmpeg_synth',
            };
        }
        catch (err) {
            log.warn('SFX generation failed', { recipe: recipeName, error: err.message?.slice(0, 80) });
            return null;
        }
    }
    /**
     * Auto-select sound effects for a scene based on content.
     */
    static selectForScene(sceneText, sceneOrder) {
        const lower = sceneText.toLowerCase();
        const selectedEffects = [];
        let ambient = null;
        for (const rule of SCENE_SFX_MAP) {
            if (rule.keywords.some((kw) => lower.includes(kw))) {
                selectedEffects.push(...rule.effects);
                if (rule.ambient && !ambient)
                    ambient = rule.ambient;
            }
        }
        // Deduplicate
        const unique = [...new Set(selectedEffects)].slice(0, 3);
        // Transition sound between scenes
        const transition = sceneOrder > 1 ? 'whoosh' : null;
        return { effects: unique, ambient, transition };
    }
    /** Get all available SFX names. */
    static getLibrary() { return Object.keys(SFX_LIBRARY); }
    /** Get SFX by category. */
    static getByCategory(category) {
        return Object.entries(SFX_LIBRARY).filter(([, r]) => r.category === category).map(([k]) => k);
    }
}
//# sourceMappingURL=sfx-generator.js.map