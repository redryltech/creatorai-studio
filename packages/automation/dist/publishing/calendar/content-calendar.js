// ============================================================
// CreatorAI Studio — Content Calendar Manager
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
const log = Logger.for('ContentCalendar');
export class ContentCalendarManager {
    static instance = null;
    schedules = [];
    windows = [];
    constructor() { }
    static getInstance() { if (!ContentCalendarManager.instance)
        ContentCalendarManager.instance = new ContentCalendarManager(); return ContentCalendarManager.instance; }
    static resetInstance() { ContentCalendarManager.instance = null; }
    /** Schedule a publish at a specific time. */
    schedule(params) {
        const entry = { id: generateId(ID_PREFIXES.step), ...params, status: 'pending' };
        this.schedules.push(entry);
        log.info('Content scheduled', { platform: params.platform, scheduledAt: params.scheduledAt.toISOString(), title: params.title });
        return entry;
    }
    /** Get calendar for a user within a date range. */
    getCalendar(userId, from, to) {
        return this.schedules
            .filter((s) => s.userId === userId && s.scheduledAt >= from && s.scheduledAt <= to)
            .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    }
    /** Cancel a scheduled publish. */
    cancel(scheduleId) {
        const entry = this.schedules.find((s) => s.id === scheduleId);
        if (!entry || entry.status !== 'pending')
            return false;
        entry.status = 'cancelled';
        return true;
    }
    /** Set publishing windows (best times to post). */
    setWindows(windows) {
        this.windows = windows;
    }
    /** Get optimal publish time for a platform. */
    getNextOptimalTime(platform, timezone) {
        const window = this.windows.find((w) => w.platform === platform && w.timezone === timezone);
        if (!window)
            return new Date(Date.now() + 3600000); // Default: 1 hour from now
        const now = new Date();
        const target = new Date(now);
        target.setHours(window.startHour, 0, 0, 0);
        if (target <= now)
            target.setDate(target.getDate() + 1);
        return target;
    }
    /** Get pending schedules ready to publish. */
    getDueSchedules() {
        const now = new Date();
        return this.schedules.filter((s) => s.status === 'pending' && s.scheduledAt <= now);
    }
    get totalScheduled() { return this.schedules.filter((s) => s.status === 'pending').length; }
}
//# sourceMappingURL=content-calendar.js.map