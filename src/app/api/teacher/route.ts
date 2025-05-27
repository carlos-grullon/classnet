import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const userName: string = data.userName;
        const collection = await getCollection("users");
        const onlyNameAndId: boolean = data.onlyNameAndId;
        const pipeline: any[] = [
            { $match: {
                $or: [
                    { username: { $regex: '^' + userName }},
                    { username: { $regex: userName, $options: 'i' }}
                ]
            } },
            { $limit: 50 }
        ]
        if (onlyNameAndId) {
            pipeline.push({ $project: { _id: 1, username: 1 } })
        }
        const result = collection.aggregate(pipeline)
        const teachers = await result.toArray();
        teachers.forEach((teacher: any) => {
            teacher._id = teacher._id.toString();
        })
        return NextResponse.json({ teachers: teachers });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
