import { getCollection } from "../utils/MongoDB";
import { HashPassword, ComparePassword } from "../utils/Tools";

export async function Register(
    username: string,
    password: string,
    user_type: string,
    email: string,
) {
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({
        email: email, user_type: user_type
    })
    if (user) {
        throw new Error('User already exists')
    }
    await usersCollection.insertOne({
        username: username,
        password: await HashPassword(password),
        user_is_student: user_type === 'E',
        user_is_teacher: user_type === 'P',
        email: email,
        status: 'A',
        data: {},
        created_at: new Date(),
        updated_at: new Date()
    })
}

export async function Login(password: string, email: string) {
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({
        email: email,
    })

    if (!user) {
        throw new Error('Invalid credentials')
    }

    const isPasswordValid = await ComparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials')
    }

    return user;
}