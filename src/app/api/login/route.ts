import { NextResponse } from "next/server";
import { Login } from "@/model/Auth";
import { createSession } from "@/utils/Session";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const user = await Login(
            data.password,
            data.email,
        )
        const userSession = {
            userId: user._id,
            userName: user.username,
            userIsStudent: user.user_is_student,
            userIsTeacher: user.user_is_teacher,
            userEmail: user.email,
            userImage: user.data?.image_path || ''
        };
        const IdSession = await createSession('', userSession);
        
        const response = NextResponse.json({
            twoAccountsFound: user.user_is_student && user.user_is_teacher,
            userIsStudent: user.user_is_student,
            userIsTeacher: user.user_is_teacher,
            userImage: user.data?.image_path || ''
        });

        // Set the session cookie
        response.cookies.set({
            name: 'IdSession',
            value: IdSession,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            ...(process.env.NODE_ENV === 'production' && { 
                domain: 'classnet.org' // Ajustar según tu dominio
            })
        });

        return response;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Login error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
    }
}