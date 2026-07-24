'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface Track {
  id: string;
  name: string;
  filename: string;
  category: string;
  mood: string;
  energy: number;
  bpm: number;
  duration: number;
  format: string;
  sizeBytes: number;
  tags: string[];
  favorite: boolean;
  usageCount: number;
}

interface LibraryData {
  totalTracks: number;
  totalDuration: number;
  totalSize: number;
  categories: string[];
  tracks: Track[];
}

const CATEGORY_ICONS: Record<string, string> = {
  motivational: '🔥', cinematic: '🎬', technology: '💻', business: '💼',
  emotional: '💜', happy: '😊', sad: '😢', epic: '⚔️',
  horror: '👻', sports: '🏆', luxury: '💎', news: '📰',
};

const CATEGORY_COLORS: Record<string, string> = {
  motivational: '#e94560', cinematic: '#533483', technology: '#4ecdc4', business: '#3b82f6',
  emotional: '#8b5cf6', happy: '#f59e0b', sad: '#6b7280', epic: '#dc2626',
  horror: '#1f2937', sports: '#10b981', luxury: '#d4a574', news: '#0ea5e9',
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

export default function MusicLibraryPage() {
  const [library, setLibrary] = useState<LibraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'duration' | 'recent'>('name');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Settings
  const [settings, setSettings] = useState({
    enableMusic: true,
    autoSelect: true,
    loopMusic: true,
    musicVolume: 0.15,
    voiceVolume: 1.0,
    ducking: true,
    fadeDuration: 2,
  });

  const fetchLibrary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/music/library`);
      if (res.ok) {
        setLibrary(await res.json());
      }
    } catch {
      // Fallback: empty library
      setLibrary({ totalTracks: 0, totalDuration: 0, totalSize: 0, categories: [], tracks: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLibrary(); }, [fetchLibrary]);

  const rescan = async () => {
    try {
      await fetch(`${API}/music/rescan`, { method: 'POST' });
      await fetchLibrary();
    } catch { /* ignore */ }
  };

  const playTrack = (trackId: string) => {
    if (playingId === trackId) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(`${API}/music/stream/${trackId}`);
    audio.volume = 0.5;
    audio.play().catch(() => {});
    audio.onended = () => setPlayingId(null);
    audioRef.current = audio;
    setPlayingId(trackId);
  };

  const handleDrop = async (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    if (!files.length) return;

    for (const file of Array.from(files)) {
      if (!file.name.match(/\.(mp3|wav|aac|m4a|flac|ogg)$/i)) continue;
      try {
        await fetch(`${API}/music/upload?category=${category}&filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          body: file,
          headers: { 'Content-Type': file.type || 'audio/mpeg' },
        });
      } catch { /* ignore */ }
    }
    await fetchLibrary();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        await fetch(`${API}/music/upload?category=${category}&filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          body: file,
          headers: { 'Content-Type': file.type || 'audio/mpeg' },
        });
      } catch { /* ignore */ }
    }
    await fetchLibrary();
    e.target.value = '';
  };

  // Filtered tracks
  const filteredTracks = (library?.tracks ?? [])
    .filter((t) => {
      if (selectedCategory && t.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) ||
          t.category.includes(q) ||
          t.mood.includes(q) ||
          t.tags.some((tag) => tag.includes(q));
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'duration') return b.duration - a.duration;
      if (sortBy === 'recent') return (b.usageCount ?? 0) - (a.usageCount ?? 0);
      return a.name.localeCompare(b.name);
    });

  // Category counts
  const categoryCounts: Record<string, number> = {};
  for (const t of library?.tracks ?? []) {
    categoryCounts[t.category] = (categoryCounts[t.category] ?? 0) + 1;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', color: '#e0e0e0', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8em', fontWeight: 800, color: '#fff', margin: 0 }}>
            🎵 Music Library
          </h1>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.9em' }}>
            Drop your royalty-free music files into category folders — auto-indexed on scan
          </p>
        </div>
        <button
          onClick={rescan}
          style={{ background: '#e94560', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9em' }}
        >
          🔄 Rescan Library
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Tracks', value: library?.totalTracks ?? 0, icon: '🎵' },
          { label: 'Total Duration', value: formatDuration(library?.totalDuration ?? 0), icon: '⏱️' },
          { label: 'Categories', value: library?.categories.length ?? 0, icon: '📁' },
          { label: 'Storage', value: formatSize(library?.totalSize ?? 0), icon: '💾' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#12122a', border: '1px solid #2a2a5a', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6em' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.4em', fontWeight: 700, color: '#e94560' }}>{stat.value}</div>
            <div style={{ color: '#888', fontSize: '0.8em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search tracks by name, mood, tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', background: '#1a1a3e', border: '1px solid #333', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '0.9em', outline: 'none' }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          style={{ background: '#1a1a3e', border: '1px solid #333', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '0.9em', outline: 'none' }}
        >
          <option value="name">Sort: Name</option>
          <option value="duration">Sort: Duration</option>
          <option value="recent">Sort: Most Used</option>
        </select>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid #333', cursor: 'pointer', fontSize: '0.85em', fontWeight: 600,
            background: !selectedCategory ? '#e94560' : '#1a1a3e', color: !selectedCategory ? '#fff' : '#aaa',
          }}
        >
          All ({library?.totalTracks ?? 0})
        </button>
        {(library?.categories ?? []).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: `1px solid ${selectedCategory === cat ? CATEGORY_COLORS[cat] ?? '#e94560' : '#333'}`,
              cursor: 'pointer', fontSize: '0.85em', fontWeight: 600,
              background: selectedCategory === cat ? (CATEGORY_COLORS[cat] ?? '#e94560') + '20' : '#1a1a3e',
              color: selectedCategory === cat ? CATEGORY_COLORS[cat] ?? '#e94560' : '#aaa',
            }}
          >
            {CATEGORY_ICONS[cat] ?? '🎵'} {cat} ({categoryCounts[cat] ?? 0})
          </button>
        ))}
      </div>

      {/* Empty State with Drop Zone */}
      {(library?.totalTracks ?? 0) === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#12122a', borderRadius: '16px', border: '2px dashed #333' }}>
          <div style={{ fontSize: '3em', marginBottom: '12px' }}>🎵</div>
          <h2 style={{ color: '#fff', marginBottom: '8px' }}>Your Music Library is Empty</h2>
          <p style={{ color: '#888', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
            Drop your royalty-free MP3, WAV, AAC, M4A, FLAC, or OGG files into the category
            folders at <code style={{ color: '#e94560' }}>assets/music/&lt;category&gt;/</code>
            then click &ldquo;Rescan Library&rdquo;.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => (
              <span key={cat} style={{ background: '#1a1a3e', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85em', color: '#888' }}>
                {icon} {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Track Grid with Drop Zones */}
      {filteredTracks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              onDragOver={(e) => { e.preventDefault(); setDragOver(track.category); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, track.category)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: playingId === track.id ? '#1a1a4e' : '#12122a',
                border: `1px solid ${playingId === track.id ? '#e94560' : '#2a2a5a'}`,
                borderRadius: '10px', padding: '12px 16px',
                transition: 'all 0.2s',
              }}
            >
              {/* Play Button */}
              <button
                onClick={() => playTrack(track.id)}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                  background: playingId === track.id ? '#e94560' : '#1a1a3e',
                  color: '#fff', fontSize: '1.1em', cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {playingId === track.id ? '⏸' : '▶'}
              </button>

              {/* Track Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {track.name}
                </div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8em', color: '#888', marginTop: '2px' }}>
                  <span>{CATEGORY_ICONS[track.category] ?? '🎵'} {track.category}</span>
                  <span>• {track.mood}</span>
                  <span>• {track.bpm} BPM</span>
                  <span>• E:{track.energy}/10</span>
                </div>
              </div>

              {/* Duration */}
              <div style={{ color: '#aaa', fontSize: '0.9em', fontFamily: 'monospace', flexShrink: 0 }}>
                {formatDuration(track.duration)}
              </div>

              {/* Size */}
              <div style={{ color: '#666', fontSize: '0.8em', flexShrink: 0, width: '60px', textAlign: 'right' }}>
                {formatSize(track.sizeBytes)}
              </div>

              {/* Format badge */}
              <span style={{
                background: '#1a1a3e', border: '1px solid #333', borderRadius: '12px',
                padding: '2px 8px', fontSize: '0.7em', color: '#888', textTransform: 'uppercase', flexShrink: 0,
              }}>
                {track.format}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Category Drop Zones */}
      {(library?.totalTracks ?? 0) >= 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ color: '#888', fontSize: '0.9em', marginBottom: '12px' }}>
            📂 Drop files into categories (or use the upload button)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => (
              <div
                key={cat}
                onDragOver={(e) => { e.preventDefault(); setDragOver(cat); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, cat)}
                style={{
                  background: dragOver === cat ? '#1a2a4e' : '#12122a',
                  border: `2px dashed ${dragOver === cat ? '#e94560' : '#2a2a5a'}`,
                  borderRadius: '10px', padding: '16px', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '1.5em' }}>{icon}</div>
                <div style={{ color: '#aaa', fontSize: '0.85em', fontWeight: 600, marginTop: '4px' }}>{cat}</div>
                <div style={{ color: '#555', fontSize: '0.75em' }}>{categoryCounts[cat] ?? 0} tracks</div>
                <label style={{ display: 'block', marginTop: '8px', cursor: 'pointer' }}>
                  <span style={{ background: '#1a1a3e', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75em', color: '#888', border: '1px solid #333' }}>
                    + Upload
                  </span>
                  <input
                    type="file"
                    accept=".mp3,.wav,.aac,.m4a,.flac,.ogg"
                    multiple
                    onChange={(e) => handleFileUpload(e, cat)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div style={{ marginTop: '32px', background: '#12122a', border: '1px solid #2a2a5a', borderRadius: '14px', padding: '20px' }}>
        <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.1em' }}>⚙️ Music Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Enable Music', key: 'enableMusic', type: 'toggle' },
            { label: 'Auto Select Category', key: 'autoSelect', type: 'toggle' },
            { label: 'Loop Music', key: 'loopMusic', type: 'toggle' },
            { label: 'Audio Ducking', key: 'ducking', type: 'toggle' },
          ].map(({ label, key, type }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa', fontSize: '0.9em' }}>{label}</span>
              <button
                onClick={() => setSettings((s) => ({ ...s, [key]: !(s as Record<string, unknown>)[key] }))}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: (settings as Record<string, unknown>)[key] ? '#e94560' : '#333',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: '3px', transition: 'left 0.2s',
                  left: (settings as Record<string, unknown>)[key] ? '23px' : '3px',
                }} />
              </button>
            </div>
          ))}
          <div>
            <span style={{ color: '#aaa', fontSize: '0.9em' }}>Music Volume: {Math.round(settings.musicVolume * 100)}%</span>
            <input
              type="range" min="0" max="100" value={settings.musicVolume * 100}
              onChange={(e) => setSettings((s) => ({ ...s, musicVolume: parseInt(e.target.value) / 100 }))}
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>
          <div>
            <span style={{ color: '#aaa', fontSize: '0.9em' }}>Voice Volume: {Math.round(settings.voiceVolume * 100)}%</span>
            <input
              type="range" min="0" max="100" value={settings.voiceVolume * 100}
              onChange={(e) => setSettings((s) => ({ ...s, voiceVolume: parseInt(e.target.value) / 100 }))}
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>
          <div>
            <span style={{ color: '#aaa', fontSize: '0.9em' }}>Fade Duration: {settings.fadeDuration}s</span>
            <input
              type="range" min="0" max="10" value={settings.fadeDuration}
              onChange={(e) => setSettings((s) => ({ ...s, fadeDuration: parseInt(e.target.value) }))}
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading music library...
        </div>
      )}
    </div>
  );
}
