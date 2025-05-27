import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { SearchClassValues } from '@/validations/classSearch';
import { z } from 'zod';

const SearchClassSchema = z.object({
  subject: z.string().optional(),
  teacher_id: z.string().optional(),
  minPrice: z.number(),
  maxPrice: z.number(),
  level: z.string().optional(),
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
        const result = collection.aggregate([
            { $match: {
                subject: validatedData.subject || { $exists: true },
                user_id: validatedData.teacher_id ? new ObjectId(validatedData.teacher_id) : { $exists: true },
                price: {
                    $gte: validatedData.minPrice,
                    $lte: validatedData.maxPrice
                },
                level: validatedData.level || { $exists: true },
                selectedDays: validatedData.days.length > 0 ? { $in: validatedData.days } : { $exists: true }
            } },
            { $skip: offset },
            { $limit: limit },
            { $count: "total" }
        ]);
        
        const classes = await result.toArray();
        const total = classes[0]?.total || 0;
        
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
