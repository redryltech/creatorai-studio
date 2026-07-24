import type { PublishingSchedule, PublishingWindow, SocialPlatformId } from '../types/publishing.types';
export declare class ContentCalendarManager {
    private static instance;
    private schedules;
    private windows;
    private constructor();
    static getInstance(): ContentCalendarManager;
    static resetInstance(): void;
    /** Schedule a publish at a specific time. */
    schedule(params: {
        userId: string;
        projectId: string;
        publishJobId: string;
        platform: SocialPlatformId;
        scheduledAt: Date;
        timezone: string;
        title: string;
    }): PublishingSchedule;
    /** Get calendar for a user within a date range. */
    getCalendar(userId: string, from: Date, to: Date): PublishingSchedule[];
    /** Cancel a scheduled publish. */
    cancel(scheduleId: string): boolean;
    /** Set publishing windows (best times to post). */
    setWindows(windows: PublishingWindow[]): void;
    /** Get optimal publish time for a platform. */
    getNextOptimalTime(platform: SocialPlatformId, timezone: string): Date;
    /** Get pending schedules ready to publish. */
    getDueSchedules(): PublishingSchedule[];
    get totalScheduled(): number;
}
//# sourceMappingURL=content-calendar.d.ts.map