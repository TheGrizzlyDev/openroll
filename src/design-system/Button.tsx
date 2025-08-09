import { type ButtonHTMLAttributes } from 'react'
import { useTheme } from '../theme/ThemeProvider'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string
  variant?: 'default' | 'pill'
}

export function Button({
  icon,
  children,
  className = '',
  variant = 'default',
  ...props
}: ButtonProps) {
  const { icons } = useTheme()
  const baseClasses =
    'inline-flex items-center justify-center cursor-pointer font-body font-bold transition-colors focus:outline-none'
  const variantClasses =
    variant === 'pill'
      ? 'border border-accent text-accent rounded-full px-2 py-1 text-xs bg-transparent hover:bg-bg focus-visible:ring-2 focus-visible:ring-accent'
      : 'border border-accent bg-bg text-text rounded-[var(--border-radius)] px-2 py-1 hover:bg-bg-alt focus-visible:ring-2 focus-visible:ring-accent'
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {icon && icons[icon] && <span className="mr-1">{icons[icon]}</span>}
      {children}
    </button>
  )
}
