'use client';

import React from 'react';
import { FiLoader } from 'react-icons/fi';

export interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  icon?: React.ReactNode;
}

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  onClick,
  className = '',
  icon,
}: ButtonProps) {
  // Clases base que se aplicarán a todos los botones
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Clases por variante
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    outline: 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20',
    danger: 'bg-red-500 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    success: 'bg-green-500 hover:bg-green-700 text-white focus:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700',
  };
  
  // Clases por tamaño
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };
  
  // Clases para ancho completo
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Clases para estados disabled y loading
  const stateClasses = (disabled || isLoading) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
          {children}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {icon && <span className="mr-1">{icon}</span>}
          {children}
        </div>
      )}
    </button>
  );
}
