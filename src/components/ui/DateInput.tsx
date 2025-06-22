'use client';

import { Input, InputProps } from '@/components/Input';
import { forwardRef } from 'react';

export const DateInput = forwardRef<HTMLInputElement, Omit<InputProps, 'ref'>>((props, ref) => {
  return (
    <Input
      {...props}
      type="date"
      ref={ref}
    />
  );
});

DateInput.displayName = 'DateInput';
