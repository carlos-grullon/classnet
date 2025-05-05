import { collections } from "../utils/MongoDB";

export async function Register(
    username: string,
    password: string,
    user_type: string,
    email: string
) {
    const user = await collections.users.findOne({ username: username })
    if (user) {
        throw new Error('User already exists')
    }
    await collections.users.insertOne({
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

export async function Login(username: string, password: string) {
    const user = await collections.users.findOne({ username: username })
    if (!user) {
        throw new Error('User not found')
    }
    if (user.password !== password) {
        throw new Error('Invalid password')
    }
    return user
}