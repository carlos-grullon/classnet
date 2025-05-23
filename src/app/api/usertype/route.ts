import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { getUserId } from "@/utils/Tools.ts";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId(request);

        const collection = await getCollection("users");
        const user = await collection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }
        return NextResponse.json({
            isStudent: user.user_is_student,
            isTeacher: user.user_is_teacher
        });
    } catch (error) {
        console.error('Error al obtener tipo de usuario:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
    }
}