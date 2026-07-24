// ============================================================
// CreatorAI Studio — Transition Engine
// ============================================================
// Selects appropriate transitions between scenes based on
// scene type, emotion, and pacing.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
const log = Logger.for('TransitionEngine');
/** Transition selection strategy based on scene emotion transition. */
const EMOTION_TRANSITIONS = {
    'curiosity→surprise': ['zoom_in', 'flash', 'whip'],
    'surprise→excitement': ['whip', 'flash', 'zoom_in'],
    'excitement→determination': ['slide_left', 'smooth_cut', 'fade'],
    'empathy→hope': ['fade', 'blur', 'smooth_cut'],
    'neutral→curiosity': ['zoom_in', 'slide_up', 'smooth_cut'],
    default: ['smooth_cut', 'fade', 'slide_left'],
};
export class TransitionEngineAgent {
    agentId = 'automation.transitions';
    agentName = 'Transition Engine';
    stage = 'transitions';
    validate(input) {
        const errors = [];
        if (!input.scriptPackage?.scenes?.length || input.scriptPackage.scenes.length < 2)
            errors.push('At least 2 scenes required');
        return { valid: errors.length === 0, errors };
    }
    estimateCost() {
        return { costUsd: 0, breakdown: ['Transition selection: CPU-only'] };
    }
    async healthCheck() {
        return { healthy: true, details: 'CPU-only' };
    }
    async execute(input, onProgress, _cancellation) {
        const { scriptPackage, defaultDurationMs = 500 } = input;
        const scenes = scriptPackage.scenes;
        log.info('Selecting transitions', { sceneCount: scenes.length });
        onProgress(20, 'Analyzing scene emotions for transitions');
        const transitions = [];
        for (let i = 0; i < scenes.length - 1; i++) {
            const from = scenes[i];
            const to = scenes[i + 1];
            const emotionKey = `${from.emotion}→${to.emotion}`;
            const candidates = EMOTION_TRANSITIONS[emotionKey] ?? EMOTION_TRANSITIONS['default'];
            const selectedType = candidates[i % candidates.length];
            // First scene transition is always a fade-in, CTA scene uses fade
            let finalType = selectedType;
            if (i === 0)
                finalType = 'fade';
            if (to.order === scenes.length)
                finalType = 'fade';
            transitions.push({
                id: generateId(ID_PREFIXES.step),
                type: finalType,
                fromSceneId: from.id,
                toSceneId: to.id,
                durationMs: defaultDurationMs,
                easing: finalType === 'whip' || finalType === 'flash' ? 'ease_out' : 'ease_in_out',
                parameters: {},
            });
            onProgress(20 + Math.round(((i + 1) / (scenes.length - 1)) * 70), `Transition ${i + 1}/${scenes.length - 1}`);
        }
        onProgress(100, 'Transitions selected');
        log.info('Transitions selected', { count: transitions.length });
        return transitions;
    }
}
//# sourceMappingURL=transition-engine.js.map