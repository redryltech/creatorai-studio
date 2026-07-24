// ============================================================
// CreatorAI Studio — Content Calendar Manager
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
import type { PublishingSchedule, PublishingWindow, ContentCalendar, SocialPlatformId } from '../types/publishing.types';

const log = Logger.for('ContentCalendar');

export class ContentCalendarManager {
  private static instance: ContentCalendarManager | null = null;
  private schedules: PublishingSchedule[] = [];
  private windows: PublishingWindow[] = [];

  private constructor() {}
  static getInstance(): ContentCalendarManager { if (!ContentCalendarManager.instance) ContentCalendarManager.instance = new ContentCalendarManager(); return ContentCalendarManager.instance; }
  static resetInstance(): void { ContentCalendarManager.instance = null; }

  /** Schedule a publish at a specific time. */
  schedule(params: { userId: string; projectId: string; publishJobId: string; platform: SocialPlatformId; scheduledAt: Date; timezone: string; title: string }): PublishingSchedule {
    const entry: PublishingSchedule = { id: generateId(ID_PREFIXES.step), ...params, status: 'pending' };
    this.schedules.push(entry);
    log.info('Content scheduled', { platform: params.platform, scheduledAt: params.scheduledAt.toISOString(), title: params.title });
    return entry;
  }

  /** Get calendar for a user within a date range. */
  getCalendar(userId: string, from: Date, to: Date): PublishingSchedule[] {
    return this.schedules
      .filter((s) => s.userId === userId && s.scheduledAt >= from && s.scheduledAt <= to)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  }

  /** Cancel a scheduled publish. */
  cancel(scheduleId: string): boolean {
    const entry = this.schedules.find((s) => s.id === scheduleId);
    if (!entry || entry.status !== 'pending') return false;
    entry.status = 'cancelled';
    return true;
  }

  /** Set publishing windows (best times to post). */
  setWindows(windows: PublishingWindow[]): void {
    this.windows = windows;
  }

  /** Get optimal publish time for a platform. */
  getNextOptimalTime(platform: SocialPlatformId, timezone: string): Date {
    const window = this.windows.find((w) => w.platform === platform && w.timezone === timezone);
    if (!window) return new Date(Date.now() + 3600000); // Default: 1 hour from now

    const now = new Date();
    const target = new Date(now);
    target.setHours(window.startHour, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target;
  }

  /** Get pending schedules ready to publish. */
  getDueSchedules(): PublishingSchedule[] {
    const now = new Date();
    return this.schedules.filter((s) => s.status === 'pending' && s.scheduledAt <= now);
  }

  get totalScheduled(): number { return this.schedules.filter((s) => s.status === 'pending').length; }
}
