'use client';

import { Fragment, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { FiBell, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getUserNotifications, markNotificationsAsRead, updateLastNotificationView } from '@/services/notificationService';
import { Notification } from '@/types/notification';
import Link from 'next/link';


export function NotificationBell() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;
  const router = useRouter();

  const fetchNotifications = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Usamos el parámetro newOnly: false para obtener todas las notificaciones
      const response = await getUserNotifications({
        limit: pageSize,
        skip: isLoadMore ? (notifications?.length || 0) : 0,
        includeCounts: true // Incluir contadores en la respuesta
      } as any); // Usamos 'as any' temporalmente para evitar errores de tipo

      if (response) {
        if (isLoadMore) {
          setNotifications(prev => [...(prev || []), ...(response.data || [])]);
        } else {
          setNotifications(response.data || []);
        }

        // Usar los contadores del backend
        setNewNotificationsCount(response.newCount || 0);
        setHasMore(response.hasMore || false);
      } else {
        setNotifications([]);
        setNewNotificationsCount(0);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setNewNotificationsCount(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Cargar notificaciones y contadores al montar el componente
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Obtenemos tanto las notificaciones como los contadores
        const response = await getUserNotifications({
          limit: pageSize,
          includeCounts: true
        } as any);
        
        if (response) {
          setNotifications(response.data || []);
          setNewNotificationsCount(response.newCount || 0);
          setHasMore(response.hasMore || false);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setNewNotificationsCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [pageSize]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    await fetchNotifications(true);
  };

  const handleNotificationClick = async (e: React.MouseEvent, notification: Notification, closeMenu: () => void) => {
    // Prevenir la propagación del evento para que no llegue al menú
    e.stopPropagation();
    e.preventDefault();
    
    if (!notification.read.status && notification._id) {
      try {
        setNotifications(prev =>
          prev?.map(n =>
            n._id === notification._id
              ? { ...n, read: { ...n.read, status: true } }
              : n
          ) || null
        );
        await markNotificationsAsRead([notification._id.toString()]);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Cerrar el menú antes de navegar
    if (notification.link) {
      // Cerrar el menú
      closeMenu();
      // Pequeño retraso para permitir que la animación de cierre se complete
      setTimeout(() => {
        router.push(notification.link!);
      }, 150);
    }
  };

  // Función para manejar la apertura del menú
  const handleMenuOpen = useCallback(async () => {
    try {
      if (newNotificationsCount > 0) {
        setNewNotificationsCount(0);
        await updateLastNotificationView();
      }
    } catch (error) {
      console.error('Error updating notification view:', error);
    }
  }, [newNotificationsCount]);

  // Componente del botón de notificaciones
  return (
    <Menu as="div" className="relative ml-3">
      {({ open, close }) => {
        // Usamos un efecto para manejar la apertura del menú
        useEffect(() => {
          if (open) {
            handleMenuOpen();
          }
        }, [open, handleMenuOpen]);
        
        return (
        <>
          <Menu.Button
            className="relative rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none"
          >
            <span className="sr-only">Ver notificaciones</span>
            <FiBell className="h-6 w-6" aria-hidden="true" />
            {newNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {newNotificationsCount > 9 ? '9+' : newNotificationsCount}
              </span>
            )}
          </Menu.Button>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none max-h-[500px] overflow-y-auto"
            >
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">Notificaciones</h3>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <FiRefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : !notifications || notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay notificaciones
                </div>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <Menu.Item key={notification._id?.toString() || ''}>
                      {({ active }) => (
                        <div
                          className={`px-4 py-3 text-sm cursor-pointer ${active ? 'bg-gray-200 dark:bg-gray-700' : ''
                            } ${!notification.read.status ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                          onClick={(e) => handleNotificationClick(e, notification, close)}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                              {notification.read.status ? (
                                <FiCheck className="h-5 w-5 text-gray-400" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-300">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: es
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                  ))}

                  {hasMore && (
                    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                      >
                        {isLoadingMore ? (
                          <span className="flex items-center justify-center">
                            <FiRefreshCw className="h-4 w-4 animate-spin mr-1" />
                            Cargando...
                          </span>
                        ) : (
                          'Cargar más notificaciones'
                        )}
                      </button>
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                    <Link href="/notifications" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 w-full">
                      Ver todas las notificaciones
                    </Link>
                  </div>
                </>
              )}
            </Menu.Items>
          </Transition>
        </>
      )}}
    </Menu>
  );
}
