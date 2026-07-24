#!/usr/bin/env python3
"""
CreatorAI Studio — Mock Video Clip Generator
Generates realistic MP4 clips for each scene using FFmpeg.
"""

import json
import subprocess
import sys
import os
import time
import hashlib
import re

def escape_ffmpeg_text(text):
    """Escape text for FFmpeg drawtext filter — aggressive sanitization."""
    # Only keep safe ASCII characters
    text = text[:70]
    # Remove or replace problematic characters
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    # Escape FFmpeg special chars
    text = text.replace("\\", "\\\\")
    text = text.replace("'", "")
    text = text.replace(":", " ")
    text = text.replace("%", "%%")
    text = text.replace("[", "")
    text = text.replace("]", "")
    text = text.replace(";", ",")
    return text.strip()

def generate_clip(scene, outdir):
    scene_id = scene["id"]
    order = scene["order"]
    dur = scene["duration"]
    emotion = scene.get("emotion", "neutral").lower()
    narration = scene.get("narration", "")
    visual = scene.get("visualNotes", "")
    cam = scene.get("cameraMovement", "slow_zoom").lower().replace("-", "_").replace(" ", "_")

    # Emotion color palettes
    palettes = {
        "curiosity":     ("1a1a3e", "0f3460", "4ecdc4"),
        "surprise":      ("16213e", "1a1a2e", "f9c74f"),
        "determination": ("1b1b2f", "0d0d3a", "e94560"),
        "inspiration":   ("2d1b69", "533483", "ff6b6b"),
        "excitement":    ("3a0f0f", "e94560", "ffffff"),
    }
    bg1, bg2, accent = palettes.get(emotion, ("1a1a2e", "2a2a4e", "cccccc"))

    fps = 24
    frames = dur * fps
    width, height = 1080, 1920
    output_path = os.path.join(outdir, "clips", f"{scene_id}.mp4")

    # Camera movement configurations
    cam_configs = {
        "slow_zoom": f"min(zoom+0.0008,1.12)",
        "zoom_in":   f"min(zoom+0.001,1.15)",
        "zoom_out":  f"if(lte(zoom\\,1)\\,1.2\\,max(1.0\\,zoom-0.001))",
        "pan_right": "1.08",
        "pan_left":  "1.08",
    }
    z_expr = cam_configs.get(cam, cam_configs["slow_zoom"])

    if cam == "pan_right":
        x_expr = f"(iw/zoom-iw)*on/{frames}"
    elif cam == "pan_left":
        x_expr = f"(iw/zoom-iw)*(1-on/{frames})"
    else:
        x_expr = "iw/2-(iw/zoom/2)"
    y_expr = "ih/2-(ih/zoom/2)"

    # Safe text for overlays
    safe_narr = escape_ffmpeg_text(narration)
    safe_vis = escape_ffmpeg_text(visual)
    safe_style = escape_ffmpeg_text(f"cinematic - {emotion}")

    # Build filter complex as a list then join
    zoompan = (
        f"[0:v]zoompan=z='{z_expr}'"
        f":x='{x_expr}':y='{y_expr}'"
        f":d={frames}:s={width}x{height}:fps={fps}"
        f",trim=duration={dur},setpts=PTS-STARTPTS"
    )

    overlays = [
        # Dark overlay regions
        f"drawbox=x=0:y=0:w={width}:h={int(height*0.35)}:color=0x{bg2}@0.5:t=fill",
        f"drawbox=x=0:y={int(height*0.72)}:w={width}:h={int(height*0.28)}:color=0x000000@0.6:t=fill",
        # Scene number
        f"drawtext=text='SCENE {order}':fontsize=36:fontcolor=0x{accent}:x=40:y=60:borderw=2:bordercolor=black",
        # Visual description (center)
        f"drawtext=text='{safe_vis}':fontsize=28:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-50:borderw=2:bordercolor=black",
        # Style label
        f"drawtext=text='{safe_style}':fontsize=22:fontcolor=0x{accent}:x=(w-text_w)/2:y=(h/2)+30:borderw=1:bordercolor=black",
        # Narration (bottom)
        f"drawtext=text='{safe_narr}':fontsize=24:fontcolor=white:x=(w-text_w)/2:y=h-180:borderw=2:bordercolor=black",
        # Watermark
        f"drawtext=text='{dur}s MOCK {width}x{height}':fontsize=16:fontcolor=0xffffff@0.4:x=w-text_w-20:y=h-36",
        # Progress bar
        f"drawbox=x=0:y={height-6}:w='{width}*t/{dur}':h=6:color=0x{accent}@0.8:t=fill",
    ]

    filter_complex = zoompan + "," + ",".join(overlays) + "[vout]"

    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"color=c=0x{bg1}:s={width}x{height}:d={dur}:r={fps}",
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        "-t", str(dur),
        "-filter_complex", filter_complex,
        "-map", "[vout]", "-map", "1:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        "-r", str(fps), "-movflags", "+faststart", "-shortest",
        output_path,
    ]

    gen_start = time.time()
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    gen_time = round(time.time() - gen_start, 2)

    if proc.returncode != 0:
        # Try simplified version without problematic overlays
        simple_filter = (
            f"[0:v]zoompan=z='min(zoom+0.0008,1.12)'"
            f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
            f":d={frames}:s={width}x{height}:fps={fps}"
            f",trim=duration={dur},setpts=PTS-STARTPTS"
            f",drawbox=x=0:y=0:w={width}:h={int(height*0.35)}:color=0x{bg2}@0.5:t=fill"
            f",drawbox=x=0:y={int(height*0.72)}:w={width}:h={int(height*0.28)}:color=0x000000@0.6:t=fill"
            f",drawtext=text='SCENE {order}':fontsize=36:fontcolor=0x{accent}:x=40:y=60:borderw=2:bordercolor=black"
            f",drawbox=x=0:y={height-6}:w='{width}*t/{dur}':h=6:color=0x{accent}@0.8:t=fill"
            f"[vout]"
        )
        cmd2 = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", f"color=c=0x{bg1}:s={width}x{height}:d={dur}:r={fps}",
            "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
            "-t", str(dur),
            "-filter_complex", simple_filter,
            "-map", "[vout]", "-map", "1:a",
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            "-r", str(fps), "-movflags", "+faststart", "-shortest",
            output_path,
        ]
        proc = subprocess.run(cmd2, capture_output=True, text=True, timeout=30)
        gen_time = round(time.time() - gen_start, 2)

        if proc.returncode != 0:
            return {
                "sceneId": scene_id, "success": False,
                "error": proc.stderr[-200:],
            }

    # Validate
    fsize = os.path.getsize(output_path)
    probe = subprocess.run(
        ["ffprobe", "-v", "quiet", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,codec_name",
         "-show_entries", "format=duration",
         "-of", "json", output_path],
        capture_output=True, text=True, timeout=5,
    )
    probe_data = json.loads(probe.stdout)
    v_stream = probe_data.get("streams", [{}])[0]
    v_dur = float(probe_data.get("format", {}).get("duration", 0))

    with open(output_path, "rb") as ff:
        clip_hash = hashlib.md5(ff.read()).hexdigest()[:12]

    return {
        "sceneId": scene_id,
        "success": True,
        "path": output_path,
        "duration": round(v_dur, 2),
        "width": v_stream.get("width", 0),
        "height": v_stream.get("height", 0),
        "codec": v_stream.get("codec_name", "?"),
        "sizeKB": round(fsize / 1024, 1),
        "genTimeSec": gen_time,
        "emotion": emotion,
        "camera": cam,
        "hash": clip_hash,
        "provider": "mock_video",
    }


def main():
    outdir = sys.argv[1]

    with open(os.path.join(outdir, "script.json")) as f:
        script = json.load(f)

    scenes = script["scenes"]
    results = []
    total = len(scenes)

    os.makedirs(os.path.join(outdir, "clips"), exist_ok=True)

    for i, scene in enumerate(scenes):
        cam = scene.get("cameraMovement", "slow_zoom")
        emotion = scene.get("emotion", "neutral")
        dur = scene["duration"]
        print(f"  [{i+1}/{total}] Generating {scene['id']} ({dur}s, {emotion}, {cam})...")

        result = generate_clip(scene, outdir)
        results.append(result)

        if result.get("success"):
            r = result
            print(f"         ✅ {r['sceneId']}: {r['width']}×{r['height']} | "
                  f"{r['duration']}s | {r['sizeKB']}KB | {cam} | {r['genTimeSec']}s | {r['hash']}")
        else:
            print(f"         ❌ {result['sceneId']}: {result.get('error','Unknown')[:80]}")

    # Save report
    json.dump(results, open(os.path.join(outdir, "video-generation-report.json"), "w"), indent=2)

    ok = sum(1 for r in results if r.get("success"))
    fail = total - ok
    total_size = sum(r.get("sizeKB", 0) for r in results if r.get("success"))
    total_time = sum(r.get("genTimeSec", 0) for r in results if r.get("success"))
    unique = len(set(r.get("hash", "") for r in results if r.get("success")))

    print(f"\n  ═══ Video Clip Generation Summary ═══")
    print(f"  Generated:    {ok}/{total}")
    print(f"  Failed:       {fail}/{total}")
    print(f"  Total size:   {round(total_size)} KB")
    print(f"  Total time:   {total_time:.1f}s")
    print(f"  Unique clips: {unique} (hash verified)")
    print(f"  Provider:     MockVideoProvider (FFmpeg)")
    print(f"  Cost:         $0.00")


if __name__ == "__main__":
    main()
