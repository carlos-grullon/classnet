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
            userImage: user.data.image_path
        };
        const idSession = await createSession('', userSession);
        return NextResponse.json({
            idSession: idSession,
            twoAccountsFound: user.user_is_student && user.user_is_teacher,
            userIsStudent: user.user_is_student,
            userIsTeacher: user.user_is_teacher,
            userImage: user.data.image_path
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}