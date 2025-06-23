'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { FetchData } from '@/utils/Tools.tsx';

interface Country {
  cca2: string;
  name: {
    common: string;
  };
  flag: string;
}

interface CountryContextType {
  countries: Country[];
  getCountryByCode: (code: string) => Country | undefined;
  updateCountries: (newCountries: Country[]) => void;
  loading: boolean;
}

interface CachedCountries {
  data: Country[];
  timestamp: number;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCountries = async () => {
    try {
      const data = await FetchData<Country[]>('/api/countries', {}, 'GET');

      if (!data) {
        throw new Error('Formato de respuesta inválido');
      }

      const cache: CachedCountries = {
        data: data,
        timestamp: Date.now()
      };
      
      localStorage.setItem('countriesCache', JSON.stringify(cache));
      setCountries(data);
    } catch (error) {
      console.error('Error en fetchCountries:', error);
      // Lista de respaldo por si falla el endpoint
      const backupCountries = [
        { cca2: 'US', name: { common: 'United States' }, flag: '🇺🇸' },
        { cca2: 'MX', name: { common: 'Mexico' }, flag: '🇲🇽' },
        { cca2: 'ES', name: { common: 'Spain' }, flag: '🇪🇸' },
        { cca2: 'DO', name: { common: 'Dominican Republic' }, flag: '🇩🇴' }
      ];
      setCountries(backupCountries);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedData = localStorage.getItem('countriesCache');
    
    if (cachedData) {
      const { data, timestamp }: CachedCountries = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000;
      
      if (!isExpired && data) {
        setCountries(data);
        setLoading(false);
        return;
      }
    }
    fetchCountries();
  }, []);

  const updateCountries = (newCountries: Country[]) => {
    const cache: CachedCountries = {
      data: newCountries,
      timestamp: Date.now()
    };
    localStorage.setItem('countriesCache', JSON.stringify(cache));
    setCountries(newCountries);
  };

  const getCountryByCode = (code: string) => 
    countries.find(c => c.cca2 === code.toUpperCase());

  return (
    <CountryContext.Provider value={{ 
      countries, 
      getCountryByCode,
      updateCountries,
      loading
    }}>
      {children}
    </CountryContext.Provider>
  );
}

export const useCountries = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountries must be used within a CountryProvider');
  }
  return context;
};
