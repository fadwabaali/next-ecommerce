import { ReactNode } from 'react'

type Props = {
  label?: string
  name?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  placeholder?: string
  required?: boolean
  type?: string
  multiline?: boolean
  rows?: number
  icon?: ReactNode
  className?: string
  hint?: string
}

export default function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
  multiline = false,
  rows = 3,
  icon,
  className = '',
  hint,
}: Props) {
  const base = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white'
  const withIcon = icon ? 'pl-9' : ''

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-gray-400 mb-1.5">
          {label}{required && <span className="text-pink-400 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
            {icon}
          </span>
        )}
        {multiline ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className={`${base} resize-none ${withIcon}`}
          />
        ) : (
          <input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`${base} ${withIcon}`}
          />
        )}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}