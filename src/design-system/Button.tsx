import { type ButtonHTMLAttributes } from 'react'
import { useTheme } from '../theme/ThemeProvider'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string
}

export function Button({ icon, children, className = '', ...props }: ButtonProps) {
  const { icons } = useTheme()
  const baseClasses =
    'bg-bg-alt border border-accent rounded-[var(--border-radius)] text-accent cursor-pointer font-body font-bold tracking-wider py-2 px-4 uppercase transition-colors hover:bg-accent hover:text-bg'
  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {icon && icons[icon] && <span className="mr-1">{icons[icon]}</span>}
      {children}
    </button>
  )
}
