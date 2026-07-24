const GRADING = {
    teal_orange: { palette: ['#008B8B', '#FF8C00', '#1a2a3a', '#FFA07A'], mood: 'cinematic warmth', temp: 'warm', sat: 'vivid', contrast: 'high' },
    cinematic: { palette: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'], mood: 'dramatic cinema', temp: 'neutral', sat: 'natural', contrast: 'high' },
    warm: { palette: ['#FFD700', '#FF8C00', '#B8860B', '#FFF8DC'], mood: 'golden warmth', temp: 'golden', sat: 'vivid', contrast: 'medium' },
    cold: { palette: ['#4169E1', '#1C1C3A', '#708090', '#B0C4DE'], mood: 'cool mystery', temp: 'cool', sat: 'muted', contrast: 'medium' },
    noir: { palette: ['#1a1a1a', '#4a4a4a', '#c0c0c0', '#2a2a2a'], mood: 'dark elegance', temp: 'cool', sat: 'desaturated', contrast: 'extreme' },
    natural: { palette: ['#228B22', '#87CEEB', '#F5F5DC', '#8B4513'], mood: 'true to life', temp: 'neutral', sat: 'natural', contrast: 'medium' },
    vintage: { palette: ['#D4A574', '#8B6914', '#654321', '#F5DEB3'], mood: 'nostalgic', temp: 'warm', sat: 'muted', contrast: 'low' },
};
export class ColorEngine {
    static analyze(directorPlan) {
        const key = directorPlan?.globalColorGrading ?? 'natural';
        const g = GRADING[key] ?? GRADING.natural;
        return {
            palette: directorPlan?.colorPalette ?? g.palette,
            dominantColor: g.palette[0],
            contrast: g.contrast, saturation: g.sat, exposure: 'normal',
            mood: g.mood, temperature: g.temp, gradingLut: key,
        };
    }
}
//# sourceMappingURL=color-engine.js.map