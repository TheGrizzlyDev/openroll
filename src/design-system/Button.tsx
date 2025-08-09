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
  const baseClasses = 'cursor-pointer font-body font-bold transition-colors'
  const variantClasses =
    variant === 'pill'
      ? 'bg-bg-alt text-accent rounded-full px-2 py-1 text-xs hover:bg-accent hover:text-bg'
      : 'bg-bg-alt border border-accent rounded-[var(--border-radius)] text-accent tracking-wider py-2 px-4 uppercase hover:bg-accent hover:text-bg'
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {icon && icons[icon] && <span className="mr-1">{icons[icon]}</span>}
      {children}
    </button>
  )
}
