import type { PoseSpec } from './image.types';

const EMOTION_POSES: Record<string, PoseSpec> = {
  excitement: { bodyPose: 'dynamic action pose', handPosition: 'expressive gesture', headDirection: 'forward', eyeDirection: 'camera or action', expression: 'energetic, determined', dynamicAction: 'in motion' },
  determination: { bodyPose: 'strong stance', handPosition: 'clenched or gripping', headDirection: 'forward', eyeDirection: 'ahead', expression: 'focused, intense', dynamicAction: 'pushing forward' },
  inspiration: { bodyPose: 'triumphant or open', handPosition: 'raised or open', headDirection: 'upward', eyeDirection: 'horizon', expression: 'hopeful, awe', dynamicAction: 'rising or reaching' },
  curiosity: { bodyPose: 'leaning forward', handPosition: 'touching chin', headDirection: 'tilted', eyeDirection: 'subject', expression: 'intrigued, open', dynamicAction: 'observing' },
  sadness: { bodyPose: 'hunched or withdrawn', handPosition: 'clasped or pocketed', headDirection: 'down', eyeDirection: 'ground', expression: 'reflective, solemn', dynamicAction: 'still' },
};

export class PoseEngine {
  static analyze(emotion: string, hasHumanSubject: boolean): PoseSpec | null {
    if (!hasHumanSubject) return null;
    return EMOTION_POSES[emotion.toLowerCase()] ?? EMOTION_POSES.excitement!;
  }
}
