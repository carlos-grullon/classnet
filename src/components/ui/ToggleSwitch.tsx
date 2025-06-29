'use client';

import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

export interface ToggleSwitchProps {
  label?: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  trueLabel?: string;
  falseLabel?: string;
  className?: string;
  containerClassName?: string;
}

export const ToggleSwitch = ({
  label,
  checked,
  onChange,
  trueLabel = 'SI',
  falseLabel = 'NO',
  className = '',
  containerClassName = ''
}: ToggleSwitchProps) => {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{label}</label>}
      <div className="flex items-center gap-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className={`
            w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
            peer-checked:after:translate-x-full peer-checked:after:border-white 
            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
            after:bg-white after:border-gray-300 after:border after:rounded-full 
            after:h-5 after:w-5 after:transition-all 
            peer-checked:bg-blue-500 ${className}
          `}></div>
        </label>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${checked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {checked ? (
            <span className="flex items-center gap-1">
              <FiCheck className="text-green-600" /> {trueLabel}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <FiX className="text-red-600" /> {falseLabel}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};
