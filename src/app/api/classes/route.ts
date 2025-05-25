import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { SearchFormData } from "@/interfaces/Class";

export async function POST(request: Request) {
    try {
        const data: SearchFormData = await request.json();
        const collection = await getCollection("classes");
        const result = collection.aggregate([
            { $match: {
                subject: data.subject,
                profesor: data.profesor,
                precio: {
                    $gte: data.precioInicial,
                    $lte: data.precioFinal
                },
                nivel: data.nivel == '' ? { $exists: true } : data.nivel,
                dias: { $in: data.dias }
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
