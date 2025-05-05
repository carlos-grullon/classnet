import { getCollection } from "../utils/MongoDB";

export async function Register(
    username: string,
    password: string,
    user_type: string,
    email: string,
) {
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({
        email: email
    })
    if (user) {
        throw new Error('User already exists')
    }
    await usersCollection.insertOne({
        username: username,
        password: password,
        user_type: user_type,
        email: email,
        status: 'A',
        data: {},
        created_at: new Date(),
        updated_at: new Date()
    })
}

export async function Login(username: string, password: string, user_type: string) {
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({
        username: username,
        password: password,
        user_type: user_type
    })
    if (!user) {
        throw new Error('Invalid credentials')
    }
    return user
}