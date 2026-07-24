// ============================================================
// CreatorAI Studio — Notification Service
// ============================================================

import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger, SSEManager } from '@creatorai/agents';
import type { Notification, NotificationType, NotificationChannel } from '../types/enterprise.types';

const log = Logger.for('NotificationService');

export class NotificationService {
  private static instance: NotificationService | null = null;
  private notifications: Notification[] = [];

  private constructor() {}
  static getInstance(): NotificationService { if (!NotificationService.instance) NotificationService.instance = new NotificationService(); return NotificationService.instance; }
  static resetInstance(): void { NotificationService.instance = null; }

  /** Send notification to a user. */
  send(params: { userId: string; type: NotificationType; title: string; message: string; data?: Record<string, unknown>; channels?: NotificationChannel[] }): Notification {
    const channels = params.channels ?? ['in_app'];
    const notification: Notification = {
      id: generateId(ID_PREFIXES.step), userId: params.userId,
      type: params.type, channel: channels[0] ?? 'in_app',
      title: params.title, message: params.message,
      data: params.data ?? {}, read: false, sentAt: new Date(),
    };

    this.notifications.push(notification);

    // Send via SSE for in-app
    if (channels.includes('in_app')) {
      SSEManager.getInstance().sendToUser(params.userId, 'notification', { id: notification.id, title: params.title, message: params.message, type: params.type });
    }

    // In production: send via email, Slack, Discord, webhook based on channels
    log.info('Notification sent', { userId: params.userId, type: params.type, channels });
    return notification;
  }

  /** Get unread notifications for a user. */
  getUnread(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId && !n.read).sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  /** Get all notifications for a user. */
  getAll(userId: string, limit: number = 50): Notification[] {
    return this.notifications.filter((n) => n.userId === userId).sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime()).slice(0, limit);
  }

  /** Mark as read. */
  markRead(notificationId: string): boolean {
    const n = this.notifications.find((x) => x.id === notificationId);
    if (n) { n.read = true; return true; }
    return false;
  }

  /** Mark all as read. */
  markAllRead(userId: string): number {
    let count = 0;
    for (const n of this.notifications) { if (n.userId === userId && !n.read) { n.read = true; count++; } }
    return count;
  }
}
