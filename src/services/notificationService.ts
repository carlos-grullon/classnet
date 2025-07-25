import { NotificationType } from '@/types/notification';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  link?: string;
  type?: NotificationType;
  metadata?: Record<string, unknown>;
}

/**
 * Sends a notification to the specified user
 * @param notification The notification data
 * @returns Promise<boolean> True if the notification was sent successfully, false otherwise
 */
export async function sendNotification(notification: NotificationPayload): Promise<boolean> {
  try {
    const payload = {
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      ...(notification.link && { link: notification.link }),
      ...(notification.type && { type: notification.type }),
      ...(notification.metadata && { metadata: notification.metadata })
    };

    console.log('Enviando notificación:', payload);
    
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      console.error('Error sending notification:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

/**
 * Marks the user's notification view timestamp as now by fetching with markAsViewed=true
 * This will reset the 'new' notification count
 * @returns Promise<boolean> True if the operation was successful
 */
export async function updateLastNotificationView(): Promise<boolean> {
  try {
    // Usamos el endpoint existente con un parámetro markAsViewed
    const response = await fetch(`${API_BASE_URL}/api/notifications?markAsViewed=true&limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error updating last notification view:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update last notification view:', error);
    return false;
  }
}

/**
 * Marks specific notifications as read
 * @param notificationIds Array of notification IDs to mark as read
 * @returns Promise<boolean> True if the operation was successful
 */
export async function markNotificationsAsRead(
  notificationIds: string[]
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        notificationIds
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error marking notifications as read:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
    return false;
  }
}

/**
 * Gets the count of unread and new notifications
 * @returns Promise<{unreadCount: number, newCount: number}> Object with notification counts
 */
// export async function getNotificationCounts() {
//   try {
    // Usamos el endpoint existente con limit=0 para solo obtener los contadores
//     const response = await fetch(`${API_BASE_URL}/api/notifications?countOnly=true&limit=0`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Cache-Control': 'no-cache'
//       },
//       credentials: 'include'
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return {
//       unreadCount: data.unreadCount || 0,
//       newCount: data.newCount || 0
//     };
//   } catch (error) {
//     console.error('Error getting notification counts:', error);
//     return { unreadCount: 0, newCount: 0 };
//   }
// }

/**
 * Options for fetching notifications
 */
export interface GetNotificationsOptions {
  unreadOnly?: boolean; // Solo notificaciones no leídas
  newOnly?: boolean; // Solo notificaciones nuevas (después de lastNotificationView)
  // countOnly?: boolean;
  includeCounts?: boolean;
  limit?: number;
  skip?: number;
}

/**
 * Paginated notifications response
 */
export interface PaginatedNotifications {
  data: any[];
  total: number; // Total de notificaciones que coinciden con los filtros
  hasMore: boolean;
  unreadCount: number; // Total de no leídas
  newCount: number; // Nuevas desde la última vista
}

/**
 * Fetches user notifications with pagination
 * @param options Options for filtering and pagination
 * @returns Promise<PaginatedNotifications> Paginated notifications data
 */
export async function getUserNotifications(
  options: GetNotificationsOptions = {}
): Promise<PaginatedNotifications> {
  try {
    const { 
      unreadOnly, 
      newOnly, 
      // countOnly = false,
      includeCounts = false,
      limit = 10, 
      skip = 0 
    } = options;
    
    const params = new URLSearchParams({
      ...(unreadOnly && { unread: 'true' }),
      ...(newOnly && { new: 'true' }),
      // ...(countOnly && { countOnly: 'true' }),
      ...(includeCounts && { includeCounts: 'true' }),
      limit: limit.toString(),
      skip: skip.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/notifications?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error fetching notifications:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: response.url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Si solo se pidieron los contadores, devolvemos un objeto con los contadores
    // if (countOnly) {
    //   return {
    //     data: [],
    //     total: data.total || 0,
    //     hasMore: false,
    //     unreadCount: data.unreadCount || 0,
    //     newCount: data.newCount || 0
    //   };
    // }
    
    // Si se incluyen los contadores en la respuesta
    if (includeCounts) {
      return {
        data: data.data || [],
        total: data.total || 0,
        hasMore: data.hasMore || false,
        unreadCount: data.unreadCount || 0,
        newCount: data.newCount || 0
      };
    }
    
    // Respuesta estándar sin contadores
    return {
      data: data.data || [],
      total: data.total || 0,
      hasMore: data.hasMore || false,
      unreadCount: 0,
      newCount: 0
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      data: [],
      total: 0,
      hasMore: false,
      unreadCount: 0,
      newCount: 0
    };
  }
}
