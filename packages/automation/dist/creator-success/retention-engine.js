export class RetentionEngine {
    static predict(sceneDurations, hookScore, totalDuration) {
        const avgScene = sceneDurations.reduce((s, d) => s + d, 0) / Math.max(sceneDurations.length, 1);
        const dropOffs = [];
        let time = 0;
        for (let i = 0; i < sceneDurations.length; i++) {
            time += sceneDurations[i];
            if (sceneDurations[i] > avgScene * 1.5)
                dropOffs.push({ timeSec: Math.round(time - sceneDurations[i] / 2), severity: 'moderate', reason: `Scene ${i + 1} is too long (${sceneDurations[i]}s vs avg ${avgScene.toFixed(0)}s)` });
            if (i > 0 && i < sceneDurations.length - 1 && sceneDurations[i] < 3)
                dropOffs.push({ timeSec: Math.round(time), severity: 'mild', reason: `Scene ${i + 1} too short — may feel rushed` });
        }
        if (hookScore < 50)
            dropOffs.unshift({ timeSec: 3, severity: 'severe', reason: 'Weak hook — viewers will scroll past' });
        const pacingScore = Math.min(100, 100 - dropOffs.length * 15);
        const sceneBalance = Math.min(100, 100 - Math.round(Math.max(...sceneDurations) - Math.min(...sceneDurations)) * 3);
        const estimatedRetention = Math.min(95, Math.round(hookScore * 0.35 + pacingScore * 0.35 + sceneBalance * 0.3));
        const estimatedWatchTimeSec = Math.round(totalDuration * (estimatedRetention / 100));
        const suggestions = [];
        if (hookScore < 60)
            suggestions.push('Strengthen the opening hook');
        if (dropOffs.length > 2)
            suggestions.push('Improve pacing — reduce slow sections');
        if (sceneBalance < 60)
            suggestions.push('Balance scene durations for consistent energy');
        suggestions.push('Add visual variety every 5-7 seconds');
        suggestions.push('End with a strong CTA before viewer drops off');
        return { estimatedRetention, dropOffPoints: dropOffs, pacingScore, sceneBalance, estimatedWatchTimeSec, suggestions };
    }
}
//# sourceMappingURL=retention-engine.js.map