'use client';

import { FiChevronDown } from 'react-icons/fi';

type InputReadOnlyProps = {
  label: string;
  value?: string;
  placeholder?: string;
  onClick: () => void;
  className?: string;
};

export function InputReadOnly({
  label,
  value,
  placeholder = 'Seleccionar...',
  onClick,
  className = ''
}: InputReadOnlyProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div 
        onClick={onClick}
        className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
      >
        <span className="truncate">
          {value || <span className="text-gray-400">{placeholder}</span>}
        </span>
        <FiChevronDown className="text-gray-400" />
      </div>
    </div>
  );
}
