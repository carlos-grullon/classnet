import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/utils/Tools.ts';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { mongoTimeToTimeString12h } from '@/utils/GeneralTools';

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserId(request);

        const enrollmentsCollection = await getCollection('enrollments');

        const enrollments = await enrollmentsCollection.find({
            student_id: new ObjectId(userId),
            status: { $in: ['enrolled', 'trial', 'trial_proof_submitted', 'trial_proof_rejected'] }
        }).toArray();

        const classIds = enrollments.map(enrollment => enrollment.class_id);

        // Buscar las clases correspondientes a estas inscripciones
        const classesCollection = await getCollection('classes');
        const classes = await classesCollection.find({
            _id: { $in: classIds }
        }).toArray();

        // Transformar los datos para la respuesta
        const myClasses = classes.map(classItem => ({
            _id: classItem._id,
            subjectName: classItem.subjectName,
            level: classItem.level,
            startTime: mongoTimeToTimeString12h(classItem.startTime),
            endTime: mongoTimeToTimeString12h(classItem.endTime),
            selectedDays: classItem.selectedDays.sort((a: string, b: string) => parseInt(a) - parseInt(b)),
            price: classItem.price,
            currency: classItem.currency,
            teacherName: classItem.teacherName,
            durationWeeks: classItem.durationWeeks,
            status: classItem.status,
            whatsappLink: classItem.whatsappLink
        }));



        return NextResponse.json({
            success: true,
            classes: myClasses
        });

    } catch (error) {
        console.error('Error submitting assignment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}