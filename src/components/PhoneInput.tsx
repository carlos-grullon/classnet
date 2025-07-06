'use client';
import { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import type { CountryCode, E164Number } from 'libphonenumber-js';
import { FiPhone } from 'react-icons/fi';

// Deshabilitar estilos por defecto
import 'react-phone-number-input/style.css';

type PhoneInputProps = {
  value: E164Number | undefined;
  onChange: (value: E164Number | undefined) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  defaultCountry?: CountryCode;
};

export function InternationalPhoneInput({
  value,
  onChange,
  disabled = false,
  label,
  required = false,
  defaultCountry = 'US' as CountryCode,
}: PhoneInputProps) {
  const [isValid, setIsValid] = useState(true);

  const handleChange = (phone: E164Number | undefined) => {
    onChange(phone);
    setIsValid(!phone || isValidPhoneNumber(phone));
  };

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center gap-1 mb-1">
          <FiPhone className="text-blue-500" />
          <label className="block text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
      )}

      <div className={`relative ${isValid ? 'border-gray-300' : 'border-red-500'} dark:border-gray-600`}>
        <PhoneInput
          international
          defaultCountry={defaultCountry}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={
            `w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500/50
            ${disabled ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}`
          }
          countrySelectProps={{
            className: 'text-gray-900 dark:text-white bg-white dark:bg-gray-800',
          }}
        />
      </div>

      {!isValid && (
        <p className="text-red-500 text-xs">
          Por favor ingresa un número válido
        </p>
      )}
    </div>
  );
}
