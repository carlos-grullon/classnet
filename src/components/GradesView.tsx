"use client"
import { useState, useEffect } from 'react';
import { Badge } from '@/components';
import { AudioPlayer } from '@/components/AudioPlayer';
import { FetchData, ErrorMsj } from '@/utils/Tools.tsx';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import { getDayName } from '@/utils/GeneralTools';

interface DaysJson {
    [key: string]: {
        fileUrl: string;
        audioUrl: string;
        fileName: string;
        fileGrade: number;
        fileFeedback: string;
        audioGrade: number;
        audioFeedback: string;
        isGraded: boolean;
        overallGrade: number;
        overallFeedback: string;
    };
}

interface submitedAssignment {
    _id: string;
    weekNumber: number;
    days: DaysJson;
}

export function GradesView({ classId }: { classId: string }) {
    const [grades, setGrades] = useState<submitedAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

    async function fetchGrades() {
        try {
            setLoading(true);
            const response = await FetchData<{ success: boolean, data: submitedAssignment[] }>(
                `/api/classes/${classId}/grade`,
                {},
                'GET'
            );
            if (response.success && response.data) {
                setGrades(response.data);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al obtener contenido';
            ErrorMsj(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchGrades();
    }, [classId]);

    if (loading) return <div className="text-center py-4">Cargando calificaciones...</div>;

    // Generar array de semanas (1-20)
    const weeks = Array.from({ length: 20 }, (_, i) => i + 1);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lista de semanas */}
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-y-auto max-h-[250px] md:max-h-none">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Semanas</h3>
                    <button
                        onClick={() => fetchGrades()}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                        title="Actualizar calificaciones"
                    >
                        <FiRefreshCw size={18} />
                    </button>
                </div>
                <div className="space-y-2">
                    {weeks.map(week => {
                        const grade = grades.find(g => g.weekNumber === week);
                        let avgLabel: string | null = null;
                        if (grade) {
                            const entries = Object.values(grade.days || {});
                            const totalDays = entries.length;
                            if (totalDays > 0) {
                                const sum = entries.reduce((acc, d) => acc + (typeof d?.overallGrade === 'number' ? (d.overallGrade as number) : 0), 0);
                                const avg = Math.round(sum / totalDays);
                                avgLabel = `${avg}/100`;
                            }
                        }
                        return (
                            <div
                                key={week}
                                onClick={() => setSelectedWeek(week)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedWeek === week ? 'bg-blue-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Semana {week}</span>
                                    {avgLabel ? (
                                        <Badge className="bg-green-500 text-black">{avgLabel}</Badge>
                                    ) : (
                                        <Badge className="bg-yellow-500 text-black">Pendiente</Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detalles de la semana seleccionada */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                {selectedWeek ? (
                    <>
                        <h3 className="text-lg font-bold mb-4">Detalles - Semana {selectedWeek}</h3>
                        {(() => {
                            const grade = grades.find(g => g.weekNumber === selectedWeek);
                            if (!grade) return <p>No hay datos para esta semana</p>;

                            const dayEntries = Object.entries(grade.days || {});
                            const totalDays = dayEntries.length;
                            const sum = dayEntries.reduce((acc, [, d]) => acc + (typeof d?.overallGrade === 'number' ? (d.overallGrade as number) : 0), 0);
                            const hasAnyDays = totalDays > 0;
                            const avg = hasAnyDays ? Math.round(sum / totalDays) : null;

                            return (
                                <div className="space-y-6">
                                    {/* Calificación General semanal */}
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl border border-blue-200 dark:border-gray-600 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-lg text-blue-800 dark:text-blue-300">Calificación General</h4>
                                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                {hasAnyDays ? (
                                                    <>
                                                        {avg}<span className="text-lg text-gray-500 dark:text-gray-400">/100</span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400 text-base">Pendiente</span>
                                                )}
                                            </div>
                                        </div>
                                        {!hasAnyDays && (
                                            <div className="bg-white/50 dark:bg-gray-600/30 p-4 rounded-lg border border-blue-100 dark:border-gray-500">
                                                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200">Aún no hay calificaciones para esta semana.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Detalle por día (file/audio + feedback) */}
                                    <div className="space-y-6">
                                        {dayEntries.map(([dayKey, d]) => (
                                            <div key={dayKey} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-lg">{getDayName([dayKey])}</h4>
                                                    {typeof d.overallGrade === 'number' ? (
                                                        <Badge className="bg-green-500 text-black">{d.overallGrade}/100</Badge>
                                                    ) : (
                                                        <Badge className="bg-yellow-500 text-black">Pendiente</Badge>
                                                    )}
                                                </div>

                                                {d.overallFeedback && (
                                                    <div className="bg-white/50 dark:bg-gray-600/30 p-3 rounded-lg border border-gray-200 dark:border-gray-500 mb-4">
                                                        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 text-sm">{d.overallFeedback}</p>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Archivo */}
                                                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-800 p-5 rounded-xl border border-green-200 dark:border-gray-600 shadow-sm">
                                                        <h5 className="font-bold text-md text-green-800 dark:text-green-300 mb-3">Archivo</h5>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="font-medium">Calificación:</span>
                                                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                                                {typeof d.fileGrade === 'number' ? d.fileGrade : '-'}<span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
                                                            </span>
                                                        </div>
                                                        {d.fileUrl && (
                                                            <div className="mb-3">
                                                                <a
                                                                    href={d.fileUrl}
                                                                    download
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border border-green-200 dark:border-gray-500 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-gray-600 transition-colors"
                                                                >
                                                                    <FiDownload size={16} />
                                                                    {d.fileName || 'Descargar archivo'}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {d.fileFeedback && (
                                                            <div className="bg-white/50 dark:bg-gray-600/30 p-3 rounded-lg border border-green-100 dark:border-gray-500">
                                                                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 text-sm">{d.fileFeedback}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Audio */}
                                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-800 p-5 rounded-xl border border-purple-200 dark:border-gray-600 shadow-sm">
                                                        <h5 className="font-bold text-md text-purple-800 dark:text-purple-300 mb-3">Audio</h5>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="font-medium">Calificación:</span>
                                                            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                                                {typeof d.audioGrade === 'number' ? d.audioGrade : '-'}<span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
                                                            </span>
                                                        </div>
                                                        {d.audioUrl && (
                                                            <div className="mb-3">
                                                                <AudioPlayer
                                                                    audioUrl={d.audioUrl}
                                                                    className="w-full bg-white dark:bg-gray-700 rounded-lg border border-purple-200 dark:border-gray-500 mt-2"
                                                                />
                                                            </div>
                                                        )}
                                                        {d.audioFeedback && (
                                                            <div className="bg-white/50 dark:bg-gray-600/30 p-3 rounded-lg border border-purple-100 dark:border-gray-500">
                                                                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 text-sm">{d.audioFeedback}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">Selecciona una semana para ver los detalles</p>
                    </div>
                )}
            </div>
        </div>
    );
}