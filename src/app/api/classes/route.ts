import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { SearchClassData } from "@/interfaces/Class";

export async function POST(request: Request) {
    try {
        const data: SearchClassData = await request.json();
        const collection = await getCollection("classes");
        const result = collection.aggregate([
            { $match: {
                subject: data.subject,
                profesor: data.profesor,
                precio: {
                    $gte: data.priceMin,
                    $lte: data.priceMax
                },
                nivel: data.level == '' ? { $exists: true } : data.level,
                dias: { $in: data.days }
            } }
        ])
        const classes = await result.toArray();
        return NextResponse.json({ classes: classes });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
