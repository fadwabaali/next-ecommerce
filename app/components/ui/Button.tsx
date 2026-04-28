import { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'whatsapp'

type Props = {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: Variant
  disabled?: boolean
  className?: string
  fullWidth?: boolean
}

const BASE = 'group relative overflow-hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-pink-500 hover:bg-pink-600 text-white hover:shadow-lg',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  danger:    'bg-red-50 hover:bg-red-100 text-red-500',
  ghost:     'border border-gray-200 hover:border-pink-300 bg-white text-gray-500',
  whatsapp:  'bg-green-50 hover:bg-green-100 text-green-600',
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  fullWidth = false,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${BASE} ${VARIANTS[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {/* Glass shine effect — same one from your order form */}
      {(variant === 'primary' || variant === 'whatsapp') && (
        <span className="absolute top-0 left-[-75%] h-full w-1/2 bg-white/30 skew-x-[-20deg] transition-all duration-700 group-hover:left-[125%] pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
}