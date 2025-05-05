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
        user_type: user_type,
        email: email,
        status: 'A',
        data: {},
        created_at: new Date(),
        updated_at: new Date()
    })
}

export async function Login(password: string, email: string, user_type: string) {
    const usersCollection = await getCollection('users');
    if (user_type === 'A') {
        var users = await usersCollection.find({
            email: email
        })
    } else {
        var users = await usersCollection.find({
            email: email,
            user_type: user_type
        })
    }

    if (!users) {
        throw new Error('Invalid credentials')
    }

    let usersArray = await users.toArray();
    if (usersArray.length === 1) {
        let password1 = usersArray[0].password;
        let passwordOk = await ComparePassword(password, password1);
        if (!passwordOk) {
            throw new Error('Invalid credentials')
        }
        return usersArray;
    }
    let password1 = usersArray[0].password;
    let password2 = usersArray[1].password;

    if (password1 !== password2) {
        let password1Ok = await ComparePassword(password, password1);
        let password2Ok = await ComparePassword(password, password2);
        if (!password1Ok && !password2Ok) {
            throw new Error('Invalid credentials')
        }

        if (password1Ok) {
            return [usersArray[0]];
        } else {
            return [usersArray[1]];
        }
    } else {
        let passwordOk = await ComparePassword(password, password1);
        if (!passwordOk) {
            throw new Error('Invalid credentials')
        }
        return usersArray;
    }
}