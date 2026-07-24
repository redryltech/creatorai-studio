import type { Notification, NotificationType, NotificationChannel } from '../types/enterprise.types';
export declare class NotificationService {
    private static instance;
    private notifications;
    private constructor();
    static getInstance(): NotificationService;
    static resetInstance(): void;
    /** Send notification to a user. */
    send(params: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        data?: Record<string, unknown>;
        channels?: NotificationChannel[];
    }): Notification;
    /** Get unread notifications for a user. */
    getUnread(userId: string): Notification[];
    /** Get all notifications for a user. */
    getAll(userId: string, limit?: number): Notification[];
    /** Mark as read. */
    markRead(notificationId: string): boolean;
    /** Mark all as read. */
    markAllRead(userId: string): number;
}
//# sourceMappingURL=notification-service.d.ts.map