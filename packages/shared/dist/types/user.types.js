// ============================================================
// CreatorAI Studio — User Types
// ============================================================
import { UserPlan } from './enums';
/**
 * Plan limits configuration.
 */
export const PLAN_LIMITS = {
    [UserPlan.FREE]: {
        maxVideosPerDay: 3,
        maxImagesPerDay: 10,
        maxVoiceoversPerDay: 5,
        maxStorageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
        maxApiCallsPerMonth: 500,
        maxConcurrentPipelines: 1,
        maxProjectCount: 10,
        allowedProviders: ['openai', 'openai_tts', 'openai_dalle'],
        features: {
            trendResearch: false,
            scheduling: false,
            analytics: false,
            teamCollaboration: false,
            customBrandVoice: false,
            priorityProcessing: false,
        },
    },
    [UserPlan.PRO]: {
        maxVideosPerDay: 50,
        maxImagesPerDay: 200,
        maxVoiceoversPerDay: 100,
        maxStorageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
        maxApiCallsPerMonth: 10000,
        maxConcurrentPipelines: 5,
        maxProjectCount: 500,
        allowedProviders: ['openai', 'anthropic', 'replicate', 'elevenlabs', 'openai_tts', 'openai_dalle'],
        features: {
            trendResearch: true,
            scheduling: true,
            analytics: true,
            teamCollaboration: false,
            customBrandVoice: true,
            priorityProcessing: false,
        },
    },
    [UserPlan.ENTERPRISE]: {
        maxVideosPerDay: -1, // Unlimited
        maxImagesPerDay: -1,
        maxVoiceoversPerDay: -1,
        maxStorageBytes: 500 * 1024 * 1024 * 1024, // 500 GB
        maxApiCallsPerMonth: -1,
        maxConcurrentPipelines: 20,
        maxProjectCount: -1,
        allowedProviders: ['openai', 'anthropic', 'replicate', 'elevenlabs', 'runway', 'openai_tts', 'openai_dalle'],
        features: {
            trendResearch: true,
            scheduling: true,
            analytics: true,
            teamCollaboration: true,
            customBrandVoice: true,
            priorityProcessing: true,
        },
    },
};
//# sourceMappingURL=user.types.js.map