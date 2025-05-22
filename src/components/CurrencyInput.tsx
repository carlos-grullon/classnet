'use client';

import { useEffect, useState } from 'react';
import { Input } from './Input';
import type { InputProps } from './Input';

export function CurrencyInput({
  value = 0,
  onChange,
  error,
  ...props
}: Omit<InputProps, 'value' | 'onChange'> & { 
  value: number; 
  onChange: (value: number) => void;
  error?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value.toLocaleString());

  useEffect(() => {
    setDisplayValue(value.toLocaleString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseFloat(rawValue) || 0;
    
    onChange(numValue);
    setDisplayValue(numValue.toLocaleString());
  };

  return (
    <div className="relative">
      <Input
        {...props}
        type="text"
        value={displayValue}
        onChange={handleChange}
        error={error}
      />
    </div>
  );
}
