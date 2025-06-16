import { ChangeEvent, ReactNode } from 'react';

interface SelectProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
}

export function Select({ value, onChange, children, className }: SelectProps) {
  return (
    <select 
      value={value} 
      onChange={onChange}
      className={[
        'px-4 py-2 font-medium text-sm focus:outline-none',
        'bg-transparent border-none cursor-pointer',
        'text-inherit', 
        className
      ].join(' ')}
    >
      {children}
    </select>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>;
}
