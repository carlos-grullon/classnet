"use client";
import ClassCards from '../../components/ClassCards';
import AnnouncementsSection from '../../components/AnnouncementsSection';
import UpcomingTasks from '../../components/UpcomingTasks';
import { useUser } from '@/providers/UserProvider';
import { Card } from '@/components';

export default function StudentDashboard() {
    const { user, loading } = useUser();
    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna principal */}
                <div className="lg:col-span-2 space-y-6">
                    <Card fullWidth size='sm'>
                        <div className="font-bold text-center text-4xl bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text rounded-lg animate-gradient bg-[length:200%_200%]">
                            {loading ? 'Cargando...' : `Hola ${user?.userName?.split(' ')[0] || 'Estudiante'}!`}
                        </div>
                    </Card>
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