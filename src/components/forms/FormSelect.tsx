'use client';

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export function FormSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder
}: FormSelectProps) {
  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium mb-1.5" 
        style={{ color: 'var(--foreground-muted)' }}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`
            block w-full px-4 py-2.5 rounded-lg appearance-none pr-10
            ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-input-focus-border'}
          `}
          style={{ 
            background: 'var(--input-background)', 
            color: 'var(--foreground)', 
            border: '1px solid var(--input-border)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
          required={required}
        >
          {placeholder && (
            <option value="" disabled style={{ color: 'var(--foreground-subtle)' }}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              style={{ color: 'var(--foreground)' }}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div 
          className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
          style={{ color: 'var(--foreground-muted)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && (
          <div className="flex items-center mt-1.5">
            <svg className="w-4 h-4 mr-1.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
