import { NotificationPanel } from '@/components/notifications/NotificationPanel';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto p-4 pt-24 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Notificaciones</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <NotificationPanel />
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Las notificaciones se marcarán como leídas automáticamente al verlas.</p>
      </div>
    </div>
  );
}
