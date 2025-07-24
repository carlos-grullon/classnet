import { getCollection } from "../utils/MongoDB";
import { HashPassword, ComparePassword } from "../utils/Tools.ts";
import crypto from 'crypto';
import { sendVerificationEmail } from "@/utils/EmailService.ts";

export async function Register(
    username: string,
    password: string,
    user_type: 'E' | 'P',
    email: string,
) {
    if (email !== 'carlos0012010vegano@gmail.com' && user_type === 'P') {
        throw new Error('No se pueden ingresar como profesores todavía');
    }

    const token = crypto.randomBytes(32).toString('hex');

    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
        await usersCollection.insertOne({
            username,
            password: await HashPassword(password),
            user_is_student: user_type === 'E',
            user_is_teacher: user_type === 'P',
            email: email,
            status: 'A',
            country: '',
            image_path: '',
            description: '',
            number: '',
            data: user_type === 'P' ? {
                subjects: [],
                reviews: [],
                rating: 0,
            } : {},
            is_verified: false,
            verification_token: token,
            verification_expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hora
            email_sent_at: new Date(),
            has_used_trial: false,
            created_at: new Date(),
            updated_at: new Date()
        });
        await sendVerificationEmail(email, token);
    } else {
        if (user.user_is_student && user_type === 'P') {
            await usersCollection.updateOne({
                email: email,
                user_is_student: true
            }, { $set: { user_is_teacher: true } })
        } else if (user.user_is_teacher && user_type === 'E') {
            await usersCollection.updateOne({
                email: email,
                user_is_teacher: true
            }, { $set: { user_is_student: true } })
        } else {
            if (user.user_is_student && user.user_is_teacher) {
                throw new Error(`El usuario ya existe.`)
            }
            throw new Error(`Este usuario ya tiene una cuenta como ${user_type === 'P' ? 'Profesor' : 'Estudiante'}. Desea agregarlo como ${user_type === 'P' ? 'Estudiante' : 'Profesor'}?`)
        }
    }
}

export async function Login(password: string, email: string) {
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({
        email: email,
    })

    if (!user) {
        throw new Error('Usuario no encontrado')
    }

    const isPasswordValid = await ComparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Contraseña incorrecta')
    }

    if (!user.is_verified) {
        throw new Error('Cuenta no verificada, verifica tu correo electrónico')
    }

    return user;
}