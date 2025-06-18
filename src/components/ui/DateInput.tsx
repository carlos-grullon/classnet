'use client';

import { Input, InputProps } from '@/components/Input';
import { forwardRef } from 'react';

export interface DateInputProps extends Omit<InputProps, 'ref'> {}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>((props, ref) => {
  return (
    <Input
      {...props}
      type="date"
      ref={ref}
    />
  );
});

DateInput.displayName = 'DateInput';
