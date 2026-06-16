import { useState } from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * PasswordInput
 * Drop-in replacement for any password <input> in auth forms.
 *
 * Props mirror a standard <input> — pass value, onChange, placeholder,
 * required, name, id, className (appended to the input element), disabled.
 * The left FiLock icon and right eye-toggle are handled internally.
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  name,
  id,
  disabled = false,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative rounded-md shadow-sm">
      {/* Left lock icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiLock className="text-gray-400" />
      </div>

      <input
        type={visible ? 'text' : 'password'}
        name={name}
        id={id}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />

      {/* Right eye-toggle button */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:text-brand-600 transition-colors"
      >
        {visible ? (
          <FiEyeOff className="w-4 h-4" />
        ) : (
          <FiEye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
