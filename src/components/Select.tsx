'use client';

interface SelectProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: {value: string; label: string}[];
  error?: string;
  placeholder?: string;
  trigger?: number;
}

export function Select({
  id,
  name = id,
  label,
  value,
  onChange,
  options,
  error,
  placeholder,
  trigger = 0
}: SelectProps) {
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium mb-1.5" 
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
            block w-full pl-4 pr-10 py-2.5 rounded-lg appearance-none transition-colors duration-200
            outline-none border focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50
            bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
            ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}
          `}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <div className="mt-1">
          <div className="flex items-center bg-red-50 text-red-500 px-3 py-2 rounded-md shadow-md">
            <svg className="w-4 h-4 mr-1.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
