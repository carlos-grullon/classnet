'use client';

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  onClick?: () => void;
}

export function Card({
  children,
  title,
  description,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
  titleClassName = '',
  contentClassName = '',
  headerContent,
  footerContent,
  onClick,
}: CardProps) {
  // Base classes para todos los cards
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  // Clases según la variante
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg',
    elevated: 'bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl',
    outlined: 'bg-transparent border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
    flat: 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800',
  };
  
  // Clases según el tamaño
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  // Clases para ancho
  const widthClasses = fullWidth ? 'w-full' : 'max-w-md w-full';
  
  // Clases para el título según el tamaño
  const titleSizeClasses = {
    sm: 'text-lg mb-3',
    md: 'text-xl mb-4',
    lg: 'text-2xl mb-6',
  };
  
  // Clases para la descripción
  const descriptionClasses = 'text-gray-500 dark:text-gray-400 mt-1';
  
  return (
    <div 
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClasses}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {(title || headerContent) && (
        <div className="mb-4">
          {headerContent ? (
            headerContent
          ) : (
            <>
              {title && (
                <h2 className={`font-bold text-gray-800 dark:text-white text-center ${titleSizeClasses[size]} ${titleClassName}`}>
                  {title}
                </h2>
              )}
              {description && (
                <p className={descriptionClasses}>{description}</p>
              )}
            </>
          )}
        </div>
      )}
      
      <div className={`space-y-4 ${contentClassName}`}>
        {children}
      </div>
      
      {footerContent && (
        <div className="mt-6">
          {footerContent}
        </div>
      )}
    </div>
  );
}
