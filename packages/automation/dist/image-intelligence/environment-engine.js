export class EnvironmentEngine {
    static analyze(dirScene, worldSnap) {
        const env = dirScene?.environment ?? 'studio';
        const weather = dirScene?.weather ?? 'clear';
        const tod = dirScene?.timeOfDay ?? 'afternoon';
        const effects = [];
        if (dirScene?.visualEffects)
            for (const fx of dirScene.visualEffects) {
                if (['dust_particles', 'rain_effect', 'snow_effect', 'smoke_effect', 'fog_effect'].includes(fx))
                    effects.push(fx.replace(/_/g, ' '));
            }
        return {
            setting: env.replace(/_/g, ' '), weather: weather.replace(/_/g, ' '),
            timeOfDay: tod.replace(/_/g, ' '), atmosphere: weather === 'fog' ? 'misty, atmospheric' : weather === 'rain' ? 'moody, wet' : 'clear, crisp',
            terrain: worldSnap?.environment?.terrain ?? 'ground',
            skyCondition: tod === 'night' || tod === 'midnight' ? 'night sky, stars' : tod === 'golden_hour' || tod === 'sunset' ? 'dramatic golden sky' : 'clear sky',
            particleEffects: effects,
        };
    }
}
//# sourceMappingURL=environment-engine.js.map