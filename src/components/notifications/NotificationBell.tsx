'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiBell, FiCheck, FiRefreshCw, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getUserNotifications, markNotificationsAsRead, updateLastNotificationView } from '@/services/notificationService';
import { Notification } from '@/types/notification';
import { io, Socket } from 'socket.io-client';
import { getToken } from '@/utils/Tools.tsx';
import { ObjectId } from 'mongodb';

// Define the shape of the WebSocket notification data
interface WebSocketNotification extends Omit<Notification, 'id' | 'createdAt' | 'read'> {
  _id: ObjectId;
  createdAt: string;
  read: {
    status: boolean;
    readAt: Date | null;
  };
}

export function NotificationBell() {
  // Estados para el menú
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Estados para las notificaciones
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showNewNotification, setShowNewNotification] = useState(false);

  // Referencias
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Refs for WebSocket and reconnection
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pageSize = 10;

  // Cargar notificaciones y contadores al montar el componente
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Obtenemos tanto las notificaciones como los contadores
        const response = await getUserNotifications({
          limit: pageSize,
          includeCounts: true
        });

        if (response) {
          setNotifications(response.data || []);
          setNewNotificationsCount(response.newCount || 0);

          // Calcular si hay más notificaciones por cargar
          const hasMoreResults = response.hasMore !== undefined
            ? response.hasMore
            : (response.data?.length || 0) >= pageSize;

          setHasMore(hasMoreResults);
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
    notificationSound.current = new Audio('/sounds/new-notification.mp3');

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

    const connectWebSocket = async () => {
      try {
        const token = await getToken();

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
            token
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
        socketRef.current.on('new-notification', (data: WebSocketNotification) => {

          // Transform the WebSocket notification to match our Notification type
          const newNotification: Notification = {
            ...data,
            createdAt: new Date(data.createdAt), // Convert string to Date
            updatedAt: new Date(data.updatedAt), // Ensure updatedAt is also a Date
            read: {
              status: false,
              readAt: null
            }
          };

          setNotifications(prev => [newNotification, ...(prev || [])]);
          setNewNotificationsCount(prev => prev + 1);

          // Mostrar notificación y ocultar después de 4 segundos
          setShowNewNotification(true);
          setTimeout(() => {
            setShowNewNotification(false);
          }, 4000);

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

        // Limpiamos cualquier timeout previo
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          if (socketRef.current) {
            if (!socketRef.current.connected) {
              socketRef.current.connect();
            } else {
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
      if (!socketRef.current?.connected) {
        connectWebSocket();
      }
    };

    window.addEventListener('online', handleOnline);

    // Limpieza al desmontar el componente
    return () => {
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

  const markAllAsRead = async () => {
    try {
      if (!notifications || notifications.length === 0) return;

      // Actualizar estado local
      const unreadIds = notifications
        .filter(n => !n.read.status && n._id)
        .map(n => n._id.toString());

      if (unreadIds.length === 0) return;

      setNotifications(prev =>
        prev?.map(n => ({
          ...n,
          read: { status: true, readAt: new Date() }
        })) || null
      );

      // Actualizar en el servidor
      await markNotificationsAsRead(unreadIds);

      // Actualizar contador
      setNewNotificationsCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
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

  // Efecto para manejar clics fuera del menú
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Cargar notificaciones cuando se abre el menú
      handleMenuOpen();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, handleMenuOpen]);

  // Función para manejar el clic en una notificación
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Marcar como leído si no lo está
      if (!notification.read.status && notification._id) {
        // Actualizar el estado local primero para una respuesta más rápida
        setNotifications(prev =>
          prev?.map(n =>
            n._id === notification._id
              ? {
                ...n,
                read: {
                  status: true,
                  readAt: new Date()
                }
              }
              : n
          ) || null
        );

        // Actualizar en el servidor
        await markNotificationsAsRead([notification._id.toString()]);
      }

      // Navegar si hay un enlace
      if (notification.link) {
        setIsMenuOpen(false);
        // Pequeño retraso para permitir la animación de cierre
        setTimeout(() => {
          router.push(notification.link!);
        }, 150);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Función para cargar más notificaciones
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const skip = notifications?.length || 0;
      const response = await getUserNotifications({
        limit: pageSize,
        skip: skip,
        includeCounts: true
      });

      if (response?.data) {
        // Actualizar notificaciones
        setNotifications(prev => [...(prev || []), ...(response.data || [])]);

        // Calcular si hay más notificaciones por cargar
        const hasMoreResults = response.hasMore !== undefined
          ? response.hasMore
          : (response.data?.length || 0) === pageSize;

        setHasMore(hasMoreResults);
      }
    } catch (error) {
      console.error('Error loading more notifications:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Componente del botón de notificaciones
  return (
    <div className="relative ml-3" ref={menuRef}>
      <button
        className="relative rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none"
        onClick={() => {
          setIsMenuOpen(!isMenuOpen);
          if (!isMenuOpen) {
            handleMenuOpen();
          }
        }}
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Ver notificaciones</span>
        <FiBell className="h-6 w-6" aria-hidden="true" />
        {newNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {newNotificationsCount > 9 ? '9+' : newNotificationsCount}
          </span>
        )}
        <span
          className={`absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          title={isConnected ? 'Conectado' : 'Desconectado'}
        />
      </button>

      {isMenuOpen && (
        <div className="fixed sm:absolute right-2 sm:right-0 sm:top-auto sm:mt-2 w-[calc(100%-1rem)] sm:w-80 max-w-[calc(100vw-2rem)] origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Notificaciones</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  title="Marcar todo como leído"
                >
                  <FiCheck className="h-3.5 w-3.5 mr-1.5" />
                  <span>leer todas</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
                  title="Cerrar notificaciones"
                >
                  <span className="sr-only">Cerrar notificaciones</span>
                  <FiX className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <FiRefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id.toString()}
                    className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read.status ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}
                    onClick={() => {
                      handleNotificationClick(notification);
                    }}
                  >
                    <div className="flex items-start w-full space-x-3">
                      <div className="flex-shrink-0 pt-1">
                        {notification.read.status ? (
                          <FiCheck className="h-3.5 w-3.5 text-gray-400" />
                        ) : (
                          <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                      </div>
                    </div>
                  </div>
                ))}
                {(notifications?.length || 0) > 0 && (
                  <div className="flex flex-col items-center py-2">
                    {hasMore ? (
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none disabled:opacity-50"
                      >
                        {isLoadingMore ? (
                          <FiRefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Cargar más'
                        )}
                      </button>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No hay más notificaciones
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay notificaciones
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notificación flotante - Versión profesional */}
      {showNewNotification && (
        <div 
          className="absolute right-0 top-full mt-2 z-50"
          onClick={() => {
            setIsMenuOpen(true);
            setShowNewNotification(false);
          }}
        >
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5">
            <div className="relative p-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
                <FiBell className="h-5 w-5" />
              </div>
              <span className="absolute top-2 right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div className="pr-4 pl-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Nueva notificación</p>
            </div>
            <div className="h-full flex items-center pr-3">
              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
