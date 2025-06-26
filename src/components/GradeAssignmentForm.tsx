"use client";
import { useState } from 'react';
import { Button, Textarea, Input } from '@/components';
import { FiSave, FiX } from 'react-icons/fi';

type GradeAssignmentFormProps = {
    submissionId: string;
    initialData?: {
        fileGrade?: number;
        fileFeedback?: string;
        audioGrade?: number;
        audioFeedback?: string;
        overallGrade?: number;
        overallFeedback?: string;
    } | null;
    onCancel: () => void;
    onSave: (data: {
        fileGrade?: number;
        fileFeedback?: string;
        audioGrade?: number;
        audioFeedback?: string;
        overallGrade?: number;
        overallFeedback?: string;
    }) => Promise<void>;
};

export function GradeAssignmentForm({
    initialData,
    onCancel,
    onSave
}: GradeAssignmentFormProps) {
    const [grades, setGrades] = useState({
        fileGrade: initialData?.fileGrade ?? '',
        fileFeedback: initialData?.fileFeedback ?? '',
        audioGrade: initialData?.audioGrade ?? '',
        audioFeedback: initialData?.audioFeedback ?? '',
        overallGrade: initialData?.overallGrade ?? '',
        overallFeedback: initialData?.overallFeedback ?? ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await onSave({
                fileGrade: Number(grades.fileGrade),
                fileFeedback: grades.fileFeedback,
                audioGrade: Number(grades.audioGrade),
                audioFeedback: grades.audioFeedback,
                overallGrade: Number(grades.overallGrade),
                overallFeedback: grades.overallFeedback
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Calificación Archivo (0-100)"
                    type="number"
                    min="0"
                    max="100"
                    value={grades.fileGrade}
                    onChange={(e) => setGrades({ ...grades, fileGrade: e.target.value })}
                />
                <Textarea
                    id='dileFeedback'
                    label="Feedback Archivo"
                    value={grades.fileFeedback}
                    onChange={(e) => setGrades({ ...grades, fileFeedback: e.target.value })}
                    rows={3}
                />
                <Input
                    label="Calificación Audio (0-100)"
                    type="number"
                    min="0"
                    max="100"
                    value={grades.audioGrade}
                    onChange={(e) => setGrades({ ...grades, audioGrade: e.target.value })}
                />
                <Textarea
                    id='audioFeedback'
                    label="Feedback Audio"
                    value={grades.audioFeedback}
                    onChange={(e) => setGrades({ ...grades, audioFeedback: e.target.value })}
                    rows={3}
                />
            </div>

            <div className="border-t border-gray-200 pt-4">
                <Input
                    label="Calificación General (0-100)"
                    type="number"
                    min="0"
                    max="100"
                    value={grades.overallGrade}
                    onChange={(e) => setGrades({ ...grades, overallGrade: e.target.value })}
                />
                <Textarea
                    id='overallFeedback'
                    label="Feedback General"
                    value={grades.overallFeedback}
                    onChange={(e) => setGrades({ ...grades, overallFeedback: e.target.value })}
                    rows={4}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                    <FiX className="mr-2" /> Cancelar
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    <FiSave className="mr-2" /> Guardar Calificación
                </Button>
            </div>
        </form>
    );
}
