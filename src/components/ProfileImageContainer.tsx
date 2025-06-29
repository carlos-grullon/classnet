'use client';
import React, { useState, useEffect } from 'react';

interface ProfileImageContainerProps {
  imageUrl: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  alt?: string;
}

export function ProfileImageContainer({
  imageUrl,
  size = 'md',
  onClick,
  className = '',
  alt = 'Profile image'
}: ProfileImageContainerProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40'
  };

  if (!mounted) return null;

  return (
    <div 
      className={`relative rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      <img
        src={imageUrl}
        alt={alt}
        className="object-cover h-full w-full"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/images/default-avatar.png';
        }}
      />
    </div>
  );
}
