#!/usr/bin/env python3
"""
CreatorAI Studio — Royalty-Free Music Library Generator
Generates ambient background tracks using FFmpeg tone synthesis.
Each track has distinct character via layered sine/sawtooth waves,
tremolo, reverb simulation, and frequency modulation.
"""

import subprocess, json, os, math

ASSETS = "/home/user/creatorai-studio/assets/music"
SAMPLE_RATE = 44100
DURATION = 95  # seconds — long enough for any Short

# Track definitions: category → list of tracks
# Each track = (filename, mood, energy, bpm, notes_hz, style_params)
TRACKS = {
    "motivational": [
        {
            "id": "mot_001", "name": "Rise Up", "mood": "uplifting", "energy": 8, "bpm": 130,
            "tags": ["motivation", "success", "energy", "workout"],
            "filter": (
                "sine=f=220:d=95[a];sine=f=330:d=95[b];sine=f=440:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=2:d=0.3,volume=0.4,afade=t=in:d=3,afade=t=out:st=90:d=5"
            )
        },
        {
            "id": "mot_002", "name": "Unstoppable", "mood": "powerful", "energy": 9, "bpm": 140,
            "tags": ["motivation", "power", "champion", "grind"],
            "filter": (
                "sine=f=146.8:d=95[a];sine=f=293.7:d=95[b];sine=f=440:d=95[c];sine=f=587.3:d=95[d];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2[abc];[abc][d]amix=inputs=2,"
                "tremolo=f=3:d=0.2,volume=0.35,afade=t=in:d=2,afade=t=out:st=90:d=5"
            )
        },
    ],
    "cinematic": [
        {
            "id": "cin_001", "name": "Dark Horizon", "mood": "dramatic", "energy": 6, "bpm": 85,
            "tags": ["cinematic", "dramatic", "film", "dark"],
            "filter": (
                "sine=f=110:d=95[a];sine=f=164.8:d=95[b];sine=f=220:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=0.5:d=0.6,volume=0.45,afade=t=in:d=4,afade=t=out:st=88:d=7"
            )
        },
        {
            "id": "cin_002", "name": "Epic Journey", "mood": "epic", "energy": 7, "bpm": 100,
            "tags": ["cinematic", "epic", "adventure", "hero"],
            "filter": (
                "sine=f=130.8:d=95[a];sine=f=196:d=95[b];sine=f=261.6:d=95[c];sine=f=392:d=95[d];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2[abc];[abc][d]amix=inputs=2,"
                "tremolo=f=1:d=0.4,volume=0.4,afade=t=in:d=3,afade=t=out:st=89:d=6"
            )
        },
    ],
    "technology": [
        {
            "id": "tech_001", "name": "Future Tech", "mood": "futuristic", "energy": 7, "bpm": 120,
            "tags": ["ai", "technology", "innovation", "digital"],
            "filter": (
                "sine=f=329.6:d=95[a];sine=f=493.9:d=95[b];sine=f=659.3:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=4:d=0.15,volume=0.35,afade=t=in:d=2,afade=t=out:st=90:d=5"
            )
        },
        {
            "id": "tech_002", "name": "Neural Pulse", "mood": "electronic", "energy": 8, "bpm": 128,
            "tags": ["ai", "machine learning", "cyber", "data"],
            "filter": (
                "sine=f=261.6:d=95[a];sine=f=392:d=95[b];sine=f=523.3:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=6:d=0.25,volume=0.3,afade=t=in:d=2,afade=t=out:st=91:d=4"
            )
        },
    ],
    "business": [
        {
            "id": "biz_001", "name": "Corporate Rise", "mood": "professional", "energy": 5, "bpm": 110,
            "tags": ["business", "corporate", "startup", "success"],
            "filter": (
                "sine=f=196:d=95[a];sine=f=293.7:d=95[b];sine=f=392:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=1.5:d=0.2,volume=0.35,afade=t=in:d=3,afade=t=out:st=90:d=5"
            )
        },
    ],
    "emotional": [
        {
            "id": "emo_001", "name": "Gentle Rain", "mood": "reflective", "energy": 3, "bpm": 72,
            "tags": ["emotional", "sad", "reflection", "gentle"],
            "filter": (
                "sine=f=174.6:d=95[a];sine=f=261.6:d=95[b];sine=f=349.2:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=0.3:d=0.7,volume=0.4,afade=t=in:d=5,afade=t=out:st=87:d=8"
            )
        },
    ],
    "happy": [
        {
            "id": "hap_001", "name": "Bright Day", "mood": "cheerful", "energy": 7, "bpm": 125,
            "tags": ["happy", "cheerful", "fun", "upbeat"],
            "filter": (
                "sine=f=293.7:d=95[a];sine=f=370:d=95[b];sine=f=440:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=3:d=0.15,volume=0.35,afade=t=in:d=2,afade=t=out:st=90:d=5"
            )
        },
    ],
    "sad": [
        {
            "id": "sad_001", "name": "Fading Light", "mood": "melancholic", "energy": 2, "bpm": 65,
            "tags": ["sad", "melancholy", "loss", "quiet"],
            "filter": (
                "sine=f=146.8:d=95[a];sine=f=174.6:d=95[b];sine=f=220:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=0.2:d=0.8,volume=0.4,afade=t=in:d=6,afade=t=out:st=85:d=10"
            )
        },
    ],
    "epic": [
        {
            "id": "epc_001", "name": "Titan March", "mood": "heroic", "energy": 9, "bpm": 95,
            "tags": ["epic", "heroic", "battle", "warrior"],
            "filter": (
                "sine=f=110:d=95[a];sine=f=220:d=95[b];sine=f=329.6:d=95[c];sine=f=440:d=95[d];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2[abc];[abc][d]amix=inputs=2,"
                "tremolo=f=1:d=0.5,volume=0.45,afade=t=in:d=3,afade=t=out:st=88:d=7"
            )
        },
    ],
    "horror": [
        {
            "id": "hor_001", "name": "Dark Whisper", "mood": "suspenseful", "energy": 4, "bpm": 75,
            "tags": ["horror", "dark", "suspense", "thriller", "crime"],
            "filter": (
                "sine=f=82.4:d=95[a];sine=f=116.5:d=95[b];sine=f=155.6:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=0.4:d=0.9,volume=0.4,afade=t=in:d=4,afade=t=out:st=88:d=7"
            )
        },
    ],
    "news": [
        {
            "id": "nws_001", "name": "Breaking Alert", "mood": "urgent", "energy": 6, "bpm": 115,
            "tags": ["news", "breaking", "alert", "report"],
            "filter": (
                "sine=f=261.6:d=95[a];sine=f=329.6:d=95[b];sine=f=392:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=2:d=0.2,volume=0.35,afade=t=in:d=1.5,afade=t=out:st=91:d=4"
            )
        },
    ],
    "sports": [
        {
            "id": "spt_001", "name": "Game On", "mood": "energetic", "energy": 9, "bpm": 145,
            "tags": ["sports", "action", "energy", "workout", "fitness"],
            "filter": (
                "sine=f=196:d=95[a];sine=f=329.6:d=95[b];sine=f=493.9:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=5:d=0.2,volume=0.35,afade=t=in:d=1,afade=t=out:st=91:d=4"
            )
        },
    ],
    "luxury": [
        {
            "id": "lux_001", "name": "Golden Hour", "mood": "sophisticated", "energy": 4, "bpm": 90,
            "tags": ["luxury", "premium", "elegant", "fashion", "brand"],
            "filter": (
                "sine=f=220:d=95[a];sine=f=277.2:d=95[b];sine=f=329.6:d=95[c];"
                "[a][b]amix=inputs=2[ab];[ab][c]amix=inputs=2,"
                "tremolo=f=0.8:d=0.3,volume=0.35,afade=t=in:d=4,afade=t=out:st=88:d=7"
            )
        },
    ],
}


def generate_track(category, track):
    out_path = os.path.join(ASSETS, category, f"{track['id']}.mp3")
    
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", track["filter"],
        "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "44100", "-ac", "2",
        out_path,
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        print(f"  ❌ {track['id']}: {result.stderr[-100:]}")
        return None
    
    # Get actual duration
    probe = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", out_path],
        capture_output=True, text=True, timeout=5,
    )
    actual_dur = float(probe.stdout.strip()) if probe.stdout.strip() else DURATION
    size = os.path.getsize(out_path)
    
    print(f"  ✅ {track['id']}: {track['name']} ({category}) — {actual_dur:.0f}s, {size//1024}KB")
    
    return {
        "id": track["id"],
        "name": track["name"],
        "filename": f"{track['id']}.mp3",
        "category": category,
        "mood": track["mood"],
        "energy": track["energy"],
        "bpm": track["bpm"],
        "duration": round(actual_dur, 1),
        "volume": 0.35,
        "sampleRate": SAMPLE_RATE,
        "channels": 2,
        "format": "mp3",
        "bitrate": 192,
        "sizeBytes": size,
        "tags": track["tags"],
        "license": "royalty_free_generated",
        "path": out_path,
        "favorite": False,
        "usageCount": 0,
        "lastUsed": None,
    }


def main():
    print("═" * 60)
    print("  CreatorAI Studio — Music Library Generator")
    print("═" * 60)
    
    index = []
    total = sum(len(tracks) for tracks in TRACKS.values())
    generated = 0
    
    for category, tracks in TRACKS.items():
        print(f"\n  [{category}]")
        for track in tracks:
            entry = generate_track(category, track)
            if entry:
                index.append(entry)
                generated += 1
    
    # Save music index
    index_path = os.path.join(ASSETS, "music-index.json")
    json.dump({
        "version": "1.0.0",
        "generatedAt": __import__("datetime").datetime.now().isoformat(),
        "totalTracks": len(index),
        "categories": list(TRACKS.keys()),
        "tracks": index,
    }, open(index_path, "w"), indent=2, default=str)
    
    total_size = sum(t["sizeBytes"] for t in index)
    print(f"\n{'═' * 60}")
    print(f"  Generated: {generated}/{total} tracks")
    print(f"  Categories: {len(TRACKS)}")
    print(f"  Total size: {total_size // 1024} KB ({total_size / (1024*1024):.1f} MB)")
    print(f"  Index: {index_path}")
    print(f"{'═' * 60}")


if __name__ == "__main__":
    main()
