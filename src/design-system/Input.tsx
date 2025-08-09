import { type InputHTMLAttributes } from 'react'
import { useTheme } from '../theme/ThemeProvider'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
}

export function Input({ icon, className = '', ...props }: InputProps) {
  const { icons } = useTheme()
  return (
    <div className="flex items-center">
      {icon && icons[icon] && <span className="mr-1">{icons[icon]}</span>}
      <input
        className={`bg-bg border border-accent rounded-[var(--border-radius)] text-text flex-1 font-body p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        {...props}
      />
    </div>
  )
}
