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
    'inline-flex items-center justify-center cursor-pointer font-body font-bold uppercase tracking-wider transition-colors focus:outline-none'
  const variantClasses =
    variant === 'pill'
      ? 'border border-accent bg-bg text-accent rounded-full px-4 py-1 text-xs hover:bg-bg-alt focus-visible:ring-2 focus-visible:ring-accent'
      : 'border border-accent bg-bg text-text rounded-[var(--border-radius)] px-4 py-2 hover:bg-bg-alt focus-visible:ring-2 focus-visible:ring-accent'
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {icon && icons[icon] && <span className="mr-1">{icons[icon]}</span>}
      {children}
    </button>
  )
}
