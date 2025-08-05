import { ObjectId } from 'mongodb';

export type NotificationType = 'paymentReminder' | 'classUpdate' | 'newFeature' | 'system' | 'info';

// Define a more specific type for notification metadata
export interface NotificationMetadata {
  // Common metadata fields
  classId?: string;
  paymentId?: string;
  featureName?: string;
  // Allow any string key with string or number values
  [key: string]: string | number | boolean | undefined;
}

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
  metadata?: NotificationMetadata;
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
  metadata?: NotificationMetadata;
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
