import { ObjectId } from 'mongodb';

export type NotificationType = 'paymentReminder' | 'classUpdate' | 'newFeature' | 'system' | 'info';

export interface Notification {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  message: string;
  type?: NotificationType;
  read: {
    status: boolean;
    readAt: Date | null;
  };
  link?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface CreateNotificationDto {
  userId: string[];
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface MarkAsReadDto {
  notificationIds: string[];
}

export interface GetNotificationsOptions {
  unreadOnly?: boolean;
  limit?: number;
  skip?: number;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  hasMore: boolean;
  unreadCount: number;
}
