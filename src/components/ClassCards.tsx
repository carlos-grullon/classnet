'use client';

import { Class } from '@/interfaces/Class';
import { useEffect, useState } from 'react';

export default function ClassCards() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/student/classes');
        const data = await res.json();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tus Clases</h2>
      
      {classes.length > 0 ? (
        classes.map((classItem) => (
          <div key={classItem._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{classItem.subjectName}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {classItem.selectedDays} {classItem.startTime} - {classItem.endTime}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-600 dark:text-gray-300">No estás inscrito en ninguna clase aún</p>
      )}
    </div>
  );
}
