'use client';
import { ChangeEvent } from 'react';

type DaysCheckboxGroupProps = {
  selectedDays: string[];
  onChange: (days: string[]) => void;
};

export const DaysCheckboxGroup = ({ selectedDays, onChange }: DaysCheckboxGroupProps) => {
  const daysOfWeek = [
    { id: '1', label: 'Lunes' },
    { id: '2', label: 'Martes' },
    { id: '3', label: 'Miércoles' },
    { id: '4', label: 'Jueves' },
    { id: '5', label: 'Viernes' },
    { id: '6', label: 'Sábado' },
    { id: '7', label: 'Domingo' }
  ];

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const dayId = e.target.value;
    const isChecked = e.target.checked;
    
    // Filtrar strings vacíos y convertir a string
    const cleanSelectedDays = selectedDays
      .map(String)
      .filter(day => day.trim() !== '');
      
    const newSelectedDays = isChecked
      ? [...cleanSelectedDays, dayId] // Agregar día si está marcado
      : cleanSelectedDays.filter(id => id !== dayId); // Remover si está desmarcado

    onChange(newSelectedDays);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {daysOfWeek.map(day => (
        <label key={day.id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            value={day.id}
            checked={selectedDays.includes(day.id)}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span className="text-sm dark:text-gray-300">{day.label}</span>
        </label>
      ))}
    </div>
  );
};
