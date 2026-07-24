import type { InsightReport, ReportPeriod, AnalyticsSnapshot, StrategyRecommendation } from '../types/intelligence.types';
export declare class InsightEngine {
    private static instance;
    private reports;
    private constructor();
    static getInstance(): InsightEngine;
    static resetInstance(): void;
    generateReport(params: {
        userId: string;
        period: ReportPeriod;
        analytics: AnalyticsSnapshot[];
        recommendations: StrategyRecommendation[];
    }): InsightReport;
    getReports(userId: string): InsightReport[];
    getLatest(userId: string): InsightReport | undefined;
}
//# sourceMappingURL=insight-engine.d.ts.map