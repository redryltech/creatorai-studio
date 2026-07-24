export interface ProviderCapability {
    maxDuration: number;
    maxResolution: string;
    supportsNegative: boolean;
    supportsSeed: boolean;
    supportsCamera: boolean;
    maxTokens: number;
    supportedStyles: string[];
    costPerUnit: number;
}
export declare class ProviderCapabilityMap {
    private static capabilities;
    static get(providerId: string): ProviderCapability | undefined;
    static getAll(): Record<string, ProviderCapability>;
}
//# sourceMappingURL=provider-capability.d.ts.map