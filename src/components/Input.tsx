'use client';

import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface InputProps {
  id: string;
  name?: string;
  label?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  trigger?: number;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function Input({
  id,
  name = id,
  label = '',
  type = 'text',
  value = '',
  onChange = () => {},
  error,
  trigger = 0,
  placeholder = '',
  disabled = false,
  autoFocus = false
}: InputProps) {
  const [showError, setShowError] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Efecto para mostrar el error por 4 segundos
  useEffect(() => {
    if (error) {
      setShowError(true);
      setHasError(true);
      
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
      setHasError(false);
    }
  }, [error, trigger]);

  // Resetear el estado de error cuando el usuario hace clic en el input
  const handleFocus = () => {
    setIsFocused(true);
    setHasError(false);
    setShowError(false)
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="mb-4 relative">
      <label 
        className="block text-sm font-medium mb-1.5" 
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`
            block w-full px-4 py-2.5 rounded-lg appearance-none transition-colors duration-200
            outline-none border focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
            ${hasError && !isFocused ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${disabled ? `cursor-not-allowed dark:bg-gray-700` : `bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700`}
          `}
        />
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
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
