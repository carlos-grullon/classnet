import { NextResponse } from 'next/server';
import { getCollection } from "@/utils/MongoDB";
import { Country } from '@/interfaces/Country';

export const dynamic = 'force-dynamic';
export const revalidate = 604800; // 7 días en segundos

export async function GET() {
  try {
    const countriesCollection = await getCollection('countries');
    const countries = await countriesCollection.find().toArray();

    if (countries.length === 0) {
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag');
      
      if (!res.ok) {
        throw new Error('Error fetching countries');
      }
      
      const data = await res.json();

      const countries: Country[] = data
        .map((c: Country) => ({
          cca2: c.cca2,
          name: { common: c.name.common },
          flag: c.flag
        }))
        .sort((a: Country, b: Country) => 
          a.name.common.localeCompare(b.name.common)
        );

      await countriesCollection.insertMany(countries);
    }
    return NextResponse.json(countries, {
      headers: {
        'Cache-Control': 'public, max-age=604800'
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
