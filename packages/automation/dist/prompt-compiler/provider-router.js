export class ProviderRouter {
    static route(mediaType, budget) {
        const routes = {
            image: [
                { providerId: 'pollinations', priority: 10, cost: 0, quality: 70, speed: 90, available: true },
                { providerId: 'flux', priority: 10, cost: 0, quality: 75, speed: 85, available: true },
                { providerId: 'replicate', priority: 5, cost: 3, quality: 90, speed: 70, available: budget !== 'free' },
                { providerId: 'dall_e', priority: 15, cost: 20, quality: 85, speed: 80, available: budget === 'premium' },
            ],
            video: [
                { providerId: 'mock_video', priority: 99, cost: 0, quality: 30, speed: 100, available: true },
                { providerId: 'kling', priority: 10, cost: 40, quality: 90, speed: 60, available: budget !== 'free' },
                { providerId: 'veo', priority: 5, cost: 50, quality: 95, speed: 50, available: budget === 'premium' },
                { providerId: 'runway', priority: 8, cost: 50, quality: 92, speed: 55, available: budget !== 'free' },
                { providerId: 'pika', priority: 15, cost: 30, quality: 80, speed: 70, available: budget !== 'free' },
            ],
            voice: [
                { providerId: 'arena_tts', priority: 5, cost: 0, quality: 75, speed: 95, available: true },
                { providerId: 'elevenlabs', priority: 3, cost: 5, quality: 95, speed: 80, available: budget !== 'free' },
            ],
            music: [
                { providerId: 'local_music', priority: 0, cost: 0, quality: 60, speed: 100, available: true },
            ],
        };
        return (routes[mediaType] ?? []).filter(r => r.available).sort((a, b) => a.priority - b.priority);
    }
}
//# sourceMappingURL=provider-router.js.map