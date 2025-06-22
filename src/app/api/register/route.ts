import { NextResponse } from "next/server";
import { Register } from "@/model/Auth";
import { z } from "zod";

const RegisterSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  user_type: z.enum(['E', 'P']),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const validatedData = RegisterSchema.parse(data);
            
        await Register(
            validatedData.username,
            validatedData.password,
            validatedData.user_type,
            validatedData.email
        )
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0]?.message || 'Validación fallida' }, { status: 400 });
        }
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Error desconocido' }, { status: 500 });
    }
}