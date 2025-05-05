"use client";
import SideMenu from '@/components/SideMenu';

export default function StudentDashboard() {
    return (
        <div className="min-h-screen p-4" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <SideMenu />
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Dashboard de Estudiante</h1>
                {/* Aquí irá el contenido del dashboard */}
            </div>
        </div>
    );
}