'use client';
import { Input, InputProps } from './Input';
import { ChangeEvent } from 'react';

interface NumericInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  onChange?: (value: number | null) => void;
  value?: number | null;
  min?: number;
  max?: number;
  label?: string;
}

export const NumericInput = ({ onChange, value, min, max, label, ...props }: NumericInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let numericValue = e.target.value.replace(/[^0-9]/g, '');
    
    if (min !== undefined && numericValue && parseInt(numericValue) < min) {
      numericValue = min.toString();
    }
    
    if (max !== undefined) {
      numericValue = numericValue.slice(0, max.toString().length);
      const parsed = parseInt(numericValue || '0');
      if (parsed > max) numericValue = max.toString();
    }
    
    const parsedValue = numericValue === '' ? null : parseInt(numericValue);
    onChange?.(parsedValue);
  };

  const inputValue = value === null ? '' : value?.toString() || '';

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium mb-1.5">{label}</label>}
      <Input
        {...props}
        type="text"
        value={inputValue}
        onChange={handleChange}
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
};
