'use client';

interface TextareaProps {
  id: string;
  name?: string;
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
}

export function Textarea({ 
  id, 
  name = id,
  label, 
  value, 
  onChange, 
  rows = 4,
  placeholder = '' 
}: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="block text-sm font-medium">{label}</label>}
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 dark:focus:ring-blue-400/50 resize-none"
      />
    </div>
  );
}
