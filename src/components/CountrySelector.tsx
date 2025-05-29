'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import { useCountries } from '@/providers';

interface CountrySelectorProps {
  value: string;
  onChange: (code: string) => void;
  className?: string;
}

export function CountrySelector({ value, onChange, className }: CountrySelectorProps) {
  const { countries, loading } = useCountries();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cerrar el dropdown si se hace clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normaliza la cadena para que sea case-insensitive y no tenga diacriticos
  const normalizeString = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filteredCountries = useMemo(() => {
    const normalizedSearch = normalizeString(searchTerm);
    return countries.filter(country => 
      normalizeString(country.name.common).includes(normalizedSearch)
    );
  }, [countries, searchTerm]);

  const selectedCountry = useMemo(() => {
    return countries.find(country => country.cca2 === value);
  }, [countries, value]);

  if (loading) {
    return <div className="p-2 text-center">Cargando países...</div>;
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 border rounded-md bg-white dark:bg-gray-800"
      >
        {selectedCountry ? (
          <div className="flex items-center gap-2">
            <span>{selectedCountry.flag}</span>
            <span>{selectedCountry.name.common}</span>
          </div>
        ) : (
          <span className="text-gray-400">Selecciona un país...</span>
        )}
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar países..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-50 dark:bg-gray-700"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center">No se encontraron países</div>
            ) : (
              <ul>
                {filteredCountries.map((country) => (
                  <li key={country.cca2}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(country.cca2);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span>{country.flag}</span>
                      <span>{country.name.common}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
