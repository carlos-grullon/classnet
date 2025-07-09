'use client';

import { useEffect, useState } from 'react';
import { FetchData } from '@/utils/Tools.tsx';
import { Card } from '@/components';

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
};

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await FetchData<{ success: boolean, data: Announcement[] | null }>('/api/student/announcements', {}, 'GET');
        if (res.success) {
          setAnnouncements(res.data || []); 
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Anuncios Recientes</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.slice(0, 3).map((announcement) => (
            <div key={announcement.id} className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">{announcement.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{announcement.content}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(announcement.date).toLocaleDateString()} · {announcement.author}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">No hay anuncios recientes</p>
      )}
    </Card>
  );
}
