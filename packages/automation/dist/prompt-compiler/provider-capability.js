export class ProviderCapabilityMap {
    static capabilities = {
        veo: { maxDuration: 8, maxResolution: '1080p', supportsNegative: true, supportsSeed: true, supportsCamera: true, maxTokens: 2048, supportedStyles: ['cinematic', 'photorealistic'], costPerUnit: 0.05 },
        runway: { maxDuration: 10, maxResolution: '1080p', supportsNegative: true, supportsSeed: true, supportsCamera: true, maxTokens: 1500, supportedStyles: ['cinematic', 'artistic'], costPerUnit: 0.05 },
        kling: { maxDuration: 10, maxResolution: '1080p', supportsNegative: true, supportsSeed: true, supportsCamera: true, maxTokens: 2000, supportedStyles: ['cinematic', 'photorealistic'], costPerUnit: 0.04 },
        pika: { maxDuration: 4, maxResolution: '1080p', supportsNegative: true, supportsSeed: true, supportsCamera: false, maxTokens: 1000, supportedStyles: ['stylized', 'cinematic'], costPerUnit: 0.03 },
        luma: { maxDuration: 5, maxResolution: '1080p', supportsNegative: false, supportsSeed: true, supportsCamera: false, maxTokens: 1500, supportedStyles: ['photorealistic'], costPerUnit: 0.04 },
        flux: { maxDuration: 0, maxResolution: '1024x1024', supportsNegative: false, supportsSeed: true, supportsCamera: false, maxTokens: 1000, supportedStyles: ['photorealistic'], costPerUnit: 0 },
        pollinations: { maxDuration: 0, maxResolution: '1024x1024', supportsNegative: false, supportsSeed: true, supportsCamera: false, maxTokens: 800, supportedStyles: ['photorealistic'], costPerUnit: 0 },
    };
    static get(providerId) { return ProviderCapabilityMap.capabilities[providerId]; }
    static getAll() { return { ...ProviderCapabilityMap.capabilities }; }
}
//# sourceMappingURL=provider-capability.js.map