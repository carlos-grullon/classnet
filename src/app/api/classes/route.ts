import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { SearchClassData } from "@/interfaces/Class";

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page: number = parseInt(searchParams.get('page') || '0');
        const offset = (page * 20) + 1;
        const limit = offset + 20;

        const data: SearchClassData = await request.json();
        const minPrice = data.minPrice;
        const maxPrice = data.maxPrice;

        if (minPrice > maxPrice) {
            return NextResponse.json({ error: "El precio minimo no puede ser mayor al precio maximo" }, { status: 400 });
        }

        const collection = await getCollection("classes");
        const result = collection.aggregate([
            { $match: {
                subject: data.subject == '' ? { $exists: true } : data.subject,
                user_id: data.teacher_id == '' ? { $exists: true } : new ObjectId(data.teacher_id),
                price: {
                    $gte: data.minPrice,
                    $lte: data.maxPrice
                },
                level: data.level == '' ? { $exists: true } : data.level,
                selectedDays: { $in: data.days }
            } },
            { $skip: offset },
            { $limit: limit }
        ])
        const classes = await result.toArray();
        const totalClasses = classes.length;
        return NextResponse.json({ classes: classes, totalClasses: totalClasses });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}
