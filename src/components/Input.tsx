'use client';

import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface InputProps {
  id?: string;
  name?: string;
  label?: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  trigger?: number;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  min?: string;
  step?: string;
  className?: string;
}

const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
  if (e.target.className.includes('number')) {
    // Allow only numbers and decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(e.target.value) || e.target.value === '') {
      if (onChange) onChange(e);
    }
  } else {
    if (onChange) onChange(e);
  }
};

export function Input({
  id,
  name = id || '',
  label,
  type = 'text',
  value = '',
  onChange = () => {},
  error,
  trigger = 0,
  placeholder = '',
  disabled = false,
  autoFocus = false,
  min = '',
  step = '',
  className = ''
}: InputProps) {
  const [showError, setShowError] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  useEffect(() => {
    if (error) {
      setShowError(true);
      setHasError(true);
    }
  }, [error]);

  useEffect(() => {
    if (trigger > 0) {
      setShowError(true);
    }
  }, [trigger]);

  const handleFocus = () => {
    setIsFocused(true);
    setHasError(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => handleNumericInput(e, onChange)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          min={min}
          step={step}
          className={`
            block w-full px-4 py-2.5 rounded-lg appearance-none transition-colors duration-200
            outline-none border focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
            ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${disabled ? `cursor-not-allowed dark:bg-gray-700` : `bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700`}
            ${className}
          `}
        />
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {showError && error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
