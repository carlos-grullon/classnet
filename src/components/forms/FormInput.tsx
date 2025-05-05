'use client';

interface FormInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export function FormInput({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false
}: FormInputProps) {
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
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`
            block w-full px-4 py-2.5 rounded-lg appearance-none
            ${error ? 'border-red-500 focus:border-red-500' : 'focus:border-input-focus-border'}
          `}
          style={{ 
            background: 'var(--input-background)', 
            color: 'var(--foreground)', 
            border: '1px solid var(--input-border)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
          }}
          required={required}
        />
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
