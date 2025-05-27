import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { SearchClassValues } from '@/validations/classSearch';
import { z } from 'zod';

const SearchClassSchema = z.object({
  subject: z.string(),
  teacher_id: z.string(),
  minPrice: z.number(),
  maxPrice: z.number(),
  level: z.string(),
  days: z.array(z.string())
});

export async function POST(request: NextRequest) {
    try {
        const { page = 0, ...data } = await request.json();
        
        // Validar datos nuevamente
        const validatedData = SearchClassSchema.parse(data);
        
        const offset = page * 20;
        const limit = 20;

        const collection = await getCollection("classes");

        const result = await collection.aggregate([
            { $match: {
                subject: validatedData.subject === '' ? { $exists: true } : validatedData.subject,
                user_id: validatedData.teacher_id === '' ? { $exists: true } : new ObjectId(validatedData.teacher_id),
                price: {
                    $gte: validatedData.minPrice,
                    $lte: validatedData.maxPrice === 0 ? Infinity : validatedData.maxPrice
                },
                level: validatedData.level === '' ? { $exists: true } : validatedData.level,
                selectedDays: validatedData.days.length > 0 ? { $in: validatedData.days } : { $exists: true }
            } },
            { $facet: {
                data: [
                    { $skip: offset },
                    { $limit: limit }
                ],
                total: [
                    { $count: "count" }
                ]
            } }
        ]).toArray();
        
        const classes = result[0]?.data || [];
        const total = result[0]?.total[0]?.count || 0;
        
        return NextResponse.json({ 
            classes,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
