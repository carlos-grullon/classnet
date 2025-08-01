'use client';

import { Fragment, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { FiBell, FiCheck, FiRefreshCw, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getUserNotifications, markNotificationsAsRead, updateLastNotificationView } from '@/services/notificationService';
import { Notification } from '@/types/notification';
import Link from 'next/link';
import { io } from 'socket.io-client';


export function NotificationBell() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [isConnected, setIsConnected] = useState(false);
  const [showNewNotification, setShowNewNotification] = useState(false);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Refs for WebSocket and reconnection
  const socketRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Inicializar el sonido de notificación
  useEffect(() => {
    notificationSound.current = new Audio('sounds/new-notification.mp3');

    // Precargar el sonido con manejo de errores
    try {
      notificationSound.current.load();
    } catch (error) {
      console.error('Error al cargar el sonido de notificación:', error);
    }

    return () => {
      if (notificationSound.current) {
        notificationSound.current.pause();
        notificationSound.current = null;
      }
    };
  }, []);

  // WebSocket connection logic
  useEffect(() => {
    const SOCKET_URL = 'wss://web-production-e802b.up.railway.app';
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 3;
    const RECONNECT_INTERVAL = 10000; // 10 segundos

    const connectWebSocket = () => {
      try {
        console.log('Intentando conectar al WebSocket...');

        // Limpiamos cualquier conexión existente
        if (socketRef.current) {
          socketRef.current.off('connect');
          socketRef.current.off('disconnect');
          socketRef.current.off('connect_error');
          socketRef.current.off('new-notification');
          socketRef.current.close();
        }

        socketRef.current = io(SOCKET_URL, {
          reconnection: false, // Deshabilitamos la reconexión automática para manejarla nosotros
          query: {
            userId: '6879d2ece3b14292b11bccae',
            socketKey: 'a2fb783c495856d646ee43dbced773aedc6054d4234e0d34c8351b6504b0e7dc'
          }
        });

        // Manejar eventos de conexión
        socketRef.current.on('connect', () => {
          console.log('✅ Conectado al servidor WebSocket');
          setIsConnected(true);
          reconnectAttempts = 0; // Reiniciamos el contador de reconexiones
        });

        // Manejar desconexión
        socketRef.current.on('disconnect', (reason: string) => {
          console.log(`🔌 Desconectado del servidor WebSocket: ${reason}`);
          setIsConnected(false);
          // Solo intentamos reconectar si no fue una desconexión manual del cliente
          if (reason !== 'io client disconnect') {
            attemptReconnect();
          }
        });

        // Manejar errores de conexión
        socketRef.current.on('connect_error', (error: Error) => {
          console.error('❌ Error de conexión:', error.message);
          attemptReconnect();
        });

        // Escuchar eventos personalizados
        socketRef.current.on('new-notification', (data: any) => {
          console.log('🔔 Nueva notificación recibida:', data);
          setNotifications(prev => [data, ...(prev || [])]);
          setNewNotificationsCount(prev => prev + 1);

          // Mostrar notificación y ocultar después de 5 segundos
          setShowNewNotification(true);
          setTimeout(() => {
            setShowNewNotification(false);
          }, 5000);

          // Reproducir sonido de notificación si está disponible
          if (notificationSound.current) {
            notificationSound.current.play().catch(error => {
              console.error('Error al reproducir el sonido:', error);
            });
          }
        });

      } catch (error) {
        console.error('❌ Error al conectar al WebSocket:', error);
        attemptReconnect();
      }
    };

    const attemptReconnect = () => {
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`🔄 Intento de reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} en ${RECONNECT_INTERVAL / 1000} segundos...`);

        // Limpiamos cualquier timeout previo
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          if (socketRef.current) {
            if (!socketRef.current.connected) {
              socketRef.current.connect();
            } else {
              console.log('✅ Ya hay una conexión activa, no es necesario reconectar');
              reconnectAttempts = 0; // Reiniciamos los intentos ya que hay conexión
            }
          } else {
            connectWebSocket();
          }
        }, RECONNECT_INTERVAL);
      } else {
        console.error('❌ Se agotaron los intentos de reconexión');
        // Aquí podrías mostrar una notificación al usuario
      }
    };

    // Conexión inicial
    connectWebSocket();

    // Escuchar cambios en la conexión a internet
    const handleOnline = () => {
      console.log('🌐 Conexión a internet restaurada. Intentando reconectar...');
      if (!socketRef.current?.connected) {
        console.log('🔌 Intentando reconectar el WebSocket...');
        connectWebSocket();
      }
    };

    window.addEventListener('online', handleOnline);

    // Limpieza al desmontar el componente
    return () => {
      console.log('🧹 Limpiando conexión WebSocket');

      // Limpiar el timeout de reconexión
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Limpiar el socket
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('new-notification');

        // Solo cerrar si estamos conectados
        if (socketRef.current.connected) {
          socketRef.current.close();
        }

        socketRef.current = null;
      }

      // Remover el event listener
      window.removeEventListener('online', handleOnline);
    };
  }, []);

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

        // Efecto para manejar clics fuera del menú
        useEffect(() => {
          if (open) {
            const handleClickOutside = (event: MouseEvent) => {
              const target = event.target as HTMLElement;
              if (!target.closest('.notification-menu')) {
                close();
              }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
              document.removeEventListener('mousedown', handleClickOutside);
            };
          }
        }, [open, close]);

        return (
          <div className="relative">
            <Menu.Button
              className="relative rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none"
              onClick={() => setShowNewNotification(false)}
            >
              <span className="sr-only">Ver notificaciones</span>
              <FiBell className="h-6 w-6" aria-hidden="true" />
              {newNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  {newNotificationsCount > 9 ? '9+' : newNotificationsCount}
                </span>
              )}
              <span 
                className={`absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={isConnected ? 'Conectado' : 'Desconectado'}
              />
            </Menu.Button>
            
            {/* Pop-up de nueva notificación */}
            <Transition
              show={showNewNotification}
              enter="transition-opacity duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div 
                className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-white dark:bg-gray-800 p-3 shadow-xl ring-2 ring-blue-400 dark:ring-blue-500 ring-opacity-50 border border-gray-200 dark:border-gray-600 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FiBell className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">¡Nueva notificación!</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNewNotification(false);
                      }}
                      className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Cerrar</span>
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </Transition>

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
                className="notification-menu absolute -left-60 z-10 mt-2 w-80 max-w-sm rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-blue-400 dark:ring-blue-500 ring-opacity-50 focus:outline-none max-h-[500px] overflow-y-auto"
              >
                <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-between items-center">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">Notificaciones</h3>
                  <h2 className={`text-sm font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>{isConnected ? 'Conectado' : 'Desconectado'}</h2>
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
          </div>
        );
      }}
    </Menu>
  );
}
