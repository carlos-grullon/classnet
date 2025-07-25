'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getUserNotifications } from '@/services/notificationService';

interface Notification {
  _id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndMarkAsRead = async () => {
      try {
        // Obtener todas las notificaciones
        const allNotifications = await getUserNotifications();
        if (Array.isArray(allNotifications)) {
          setNotifications(allNotifications);
        }
      } catch (err) {
        setError('No se pudieron cargar las notificaciones');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndMarkAsRead();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No tienes notificaciones
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
      </div>
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <NotificationItem 
            key={notification._id} 
            notification={notification} 
          />
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 text-center">
        <Link 
          href="/notifications" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Ver todas las notificaciones
        </Link>
      </div>
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: es
  });

  const content = (
    <div className={`p-4 ${!notification.read ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50`}>
      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
            {notification.title}
          </p>
          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-2">{timeAgo}</p>
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} className="block hover:no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
