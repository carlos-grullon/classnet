"use client";
import StudentInfo from '../../components/StudentInfo';
import ClassCards from '../../components/ClassCards';
import AnnouncementsSection from '../../components/AnnouncementsSection';
import UpcomingTasks from '../../components/UpcomingTasks';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          <StudentInfo />
          <ClassCards />
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <AnnouncementsSection />
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
}