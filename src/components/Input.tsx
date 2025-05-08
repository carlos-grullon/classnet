'use client';

import { useState, useEffect } from 'react';

interface InputProps {
  id: string;
  name?: string;
  label?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export function Input({
  id,
  name = id,
  label = '',
  type = 'text',
  value = '',
  onChange = () => {},
  error,
  required = false
}: InputProps) {
  const [showError, setShowError] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Efecto para mostrar el error por 4 segundos
  useEffect(() => {
    if (error) {
      setShowError(true);
      setHasError(true);
      
      const timer = setTimeout(() => {
        setShowError(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
      setHasError(false);
    }
  }, [error]);

  // Resetear el estado de error cuando el usuario hace clic en el input
  const handleFocus = () => {
    setIsFocused(true);
    setHasError(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="mb-4">
      <label 
        className="block text-sm font-medium mb-1.5" 
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            block w-full px-4 py-2.5 rounded-lg appearance-none transition-colors duration-200
            outline-none border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
            bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
            ${hasError && !isFocused ? 'border-red-500 focus:border-red-500' : 'focus:border-input-focus-border'}
          `}
        />
        {showError && error && (
          <div className="absolute left-0 mt-1 z-10 animate-fadeIn">
            <div className="flex items-center bg-red-50 text-red-500 px-3 py-2 rounded-md shadow-md">
              <svg className="w-4 h-4 mr-1.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
