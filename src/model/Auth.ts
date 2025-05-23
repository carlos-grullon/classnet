import { getCollection } from "../utils/MongoDB";
import { HashPassword, ComparePassword } from "../utils/Tools.ts";

export async function Register(
    username: string,
    password: string,
    user_type: 'E' | 'P',
    email: string,
) {
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({
        email: email
    })
    if (!user) {
        await usersCollection.insertOne({
            username: username,
            password: await HashPassword(password),
            user_is_student: user_type === 'E',
            user_is_teacher: user_type === 'P',
            email: email,
            status: 'A',
            data: user_type === 'P' ? {
                description: '',
                subjects: [],
                image_path: '',
                reviews: [],
                rating: 0
            } : {},
            created_at: new Date(),
            updated_at: new Date()
        })
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

    return user;
}