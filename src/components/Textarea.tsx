'use client';

interface TextareaProps {
  id: string;
  name?: string;
  label?: string | React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function Textarea({ 
  id, 
  name = id,
  label, 
  value, 
  onChange, 
  rows = 4,
  placeholder = '',
  disabled = false 
}: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 
              text-gray-900 dark:text-white focus:outline-none focus:ring-2 dark:focus:ring-blue-400/50 resize-none
            ${disabled ? `cursor-not-allowed bg-gray-100 dark:bg-gray-700` : `bg-white dark:bg-gray-800`}`}
      />
    </div>
  );
}

// {`${disabled ? `bg-white` : `w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 
//   bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white
//   focus:outline-none focus:ring-2 dark:focus:ring-blue-400/50 resize-none`}`}