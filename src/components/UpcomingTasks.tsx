'use client';

import { useEffect, useState } from 'react';
import { FetchData } from '@/utils/Tools.tsx';

type Task = {
  id: string;
  title: string;
  dueDate: string;
  classId: string;
  className: string;
  status: 'pending' | 'completed' | 'late';
};

export default function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await FetchData<{ success: boolean, data: Task[] | null }>('/api/student/tasks', {}, 'GET');
        if (res.success) {
          setTasks(res.data || []); 
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'late':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Próximas Tareas</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <ul className="space-y-3">
          {tasks
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3)
            .map((task) => (
              <li key={task.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{task.className}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                    {task.status === 'completed' ? 'Completada' : task.status === 'late' ? 'Atrasada' : 'Pendiente'}
                  </span>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">No hay tareas próximas</p>
      )}
    </div>
  );
}
