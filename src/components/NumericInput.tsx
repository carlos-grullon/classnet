'use client';
import { Input, InputProps } from './Input';
import { ChangeEvent } from 'react';

interface NumericInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  onChange?: (value: number | null) => void;
  value?: number | null;
}

const NumericInput = ({ onChange, value, ...props }: NumericInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let numericValue = e.target.value.replace(/\D/g, '');
    
    // Limitar a 3 dígitos (máx 150)
    numericValue = numericValue.slice(0, 3);
    
    const parsedValue = numericValue === '' ? null : Math.min(150, parseInt(numericValue));
    onChange?.(parsedValue);
  };

  const inputValue = value === null ? '' : value?.toString() || '';

  return (
    <Input
      {...props}
      type="text"
      value={inputValue}
      onChange={handleChange}
      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
};

export default NumericInput;
