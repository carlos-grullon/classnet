import { ObjectId } from "mongodb";

export interface User {
    _id?: string | ObjectId;
    username?: string;
    password?: string;
    user_is_student?: boolean;
    user_is_teacher?: boolean;
    email?: string;
    status?: string;
    data?: {
        subjects?: Array<{ _id: string | ObjectId; name: string }>
    }
    created_at?: Date | string;
    updated_at?: Date | string;
    country?: string;
    image_path?: string;
    description?: string;
}