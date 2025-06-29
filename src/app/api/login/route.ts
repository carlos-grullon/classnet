import { NextResponse } from "next/server";
import { Login } from "@/model/Auth";
import { SignJWT } from 'jose';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const user = await Login(
            data.password,
            data.email,
        )
        
        const response = NextResponse.json({ 
            userIsStudent: user.user_is_student,
            userIsTeacher: user.user_is_teacher 
        });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const token = await new SignJWT({
            userId: user._id.toString(),
            userIsStudent: user.user_is_student,
            userIsTeacher: user.user_is_teacher,
            userEmail: user.email,
            userImage: user.data?.image_path || ''
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(secret);

        response.cookies.set({
            name: 'AuthToken',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        });

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al iniciar sesión:', error);
        return NextResponse.json(
            { success: false, message: message },
            { status: 401 }
        );
    }
}