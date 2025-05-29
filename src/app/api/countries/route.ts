import { NextResponse } from 'next/server';
import { getCollection } from "@/utils/MongoDB";

export const dynamic = 'force-dynamic';
export const revalidate = 604800; // 7 días en segundos

interface Country {
  cca2: string;
  name: {
    common: string;
  };
  flag: string;
}

export async function GET() {
  console.log('[API/countries] Endpoint llamado');
  try {
    console.log('[API/countries] Conectando a MongoDB...');
    const countriesCollection = await getCollection('countries');
    console.log('[API/countries] Buscando países en DB...');
    const countries = await countriesCollection.find().toArray();

    if (countries.length === 0) {
      console.log('[API/countries] No hay países en DB, llamando a RestCountries');
      const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag');
      
      if (!res.ok) {
        console.error('[API/countries] Error al llamar RestCountries:', res.status);
        throw new Error('Error fetching countries');
      }
      
      const data = await res.json();
      console.log('[API/countries] Países obtenidos de RestCountries:', data.length);

      const countries: Country[] = data
        .map((c: any) => ({
          cca2: c.cca2,
          name: { common: c.name.common },
          flag: c.flag
        }))
        .sort((a: Country, b: Country) => 
          a.name.common.localeCompare(b.name.common)
        );

      console.log('[API/countries] Insertando países en MongoDB...');
      await countriesCollection.insertMany(countries);
      console.log('[API/countries] Países insertados');
    }

    console.log('[API/countries] Devolviendo países');
    return NextResponse.json(countries, {
      headers: {
        'Cache-Control': 'public, max-age=604800'
      }
    });

  } catch (error) {
    console.error('[API/countries] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
