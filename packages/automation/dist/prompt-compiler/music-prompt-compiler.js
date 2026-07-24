export class MusicPromptCompiler {
    static compile(mood, category, duration) {
        const energy = mood === 'excitement' ? 9 : mood === 'determination' ? 8 : mood === 'sadness' ? 3 : 6;
        const tempo = mood === 'excitement' ? 130 : mood === 'sadness' ? 70 : 100;
        const genre = category === 'automotive' ? 'cinematic rock' : category === 'motivational' ? 'epic orchestral' : 'ambient';
        return {
            local: { mood, genre, energy, tempo, duration, provider: 'local_music' },
            suno: { mood, genre, energy, tempo, duration, provider: 'suno' },
            udio: { mood, genre, energy, tempo, duration, provider: 'udio' },
        };
    }
}
//# sourceMappingURL=music-prompt-compiler.js.map