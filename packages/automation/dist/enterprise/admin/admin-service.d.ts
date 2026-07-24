import type { PlatformStats } from '../types/enterprise.types';
export declare class AdminService {
    private static instance;
    private constructor();
    static getInstance(): AdminService;
    static resetInstance(): void;
    /** Get platform-wide statistics. */
    getStats(): PlatformStats;
}
//# sourceMappingURL=admin-service.d.ts.map