export class CompositionEngine {
    static analyze(frame) {
        const comp = frame.composition;
        const gridCell = comp.ruleOfThirdsPosition?.replace(/_/g, ' ') ?? 'center';
        return {
            ruleOfThirds: { subjectPosition: comp.mainSubject, gridCell },
            foreground: { element: comp.foreground, depth: 0.2, blur: comp.depthLayout === 'shallow' ? 0.3 : 0 },
            midground: { element: comp.midground, depth: 0.5 },
            background: { element: comp.background, depth: 0.9, blur: comp.depthLayout === 'shallow' ? 0.6 : comp.depthLayout === 'medium' ? 0.3 : 0 },
            subjectPlacement: gridCell,
            depthOfField: comp.depthLayout === 'shallow' ? 'shallow' : comp.depthLayout === 'deep' || comp.depthLayout === 'extreme' ? 'deep' : 'medium',
            framing: comp.negativeSpace === 'generous' ? 'wide' : comp.negativeSpace === 'minimal' ? 'tight' : 'standard',
            leadingLines: comp.leadingLines || 'Natural environmental lines',
            negativeSpace: comp.negativeSpace === 'generous' ? 0.4 : comp.negativeSpace === 'minimal' ? 0.1 : 0.25,
        };
    }
}
//# sourceMappingURL=composition-engine.js.map