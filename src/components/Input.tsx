'use client';

import React, { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  name?: string;
  label?: string | React.ReactNode;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: string | number;
  step?: string;
  className?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  containerClassName?: string;
}

const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
  if (e.target.className.includes('number')) {
    // Permitir números, punto decimal y borrado
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(e.target.value) || e.target.value === '') {
      if (onChange) onChange(e);
    }
  } else {
    if (onChange) onChange(e);
  }
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onKeyUp,
  error,
  placeholder,
  disabled,
  min,
  step,
  className,
  autoFocus,
  readOnly,
  icon,
  onClick,
  containerClassName = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`flex flex-col gap-1 mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1.5">
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
          onKeyUp={onKeyUp}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          placeholder={placeholder}
          min={min}
          step={step}
          ref={ref}
          className={`
            block w-full px-4 py-2.5 rounded-lg border transition-colors duration-200
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${disabled ? ' cursor-not-allowed bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}
            text-gray-900 dark:text-white
            ${isFocused ? 'ring-2 ring-blue-500 outline-none' : ''}
            ${className}
          `}
          {...props}
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
        {icon && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
            onClick={onClick}
          >
            {icon}
          </button>
        )}
      </div>
      {error && (
        <div className="relative">
          <div className="absolute left-0 right-0 mt-1 z-10">
            <div className="flex items-center bg-red-50 text-red-500 px-3 py-2 rounded-md shadow-md">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
