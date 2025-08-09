import { type SelectHTMLAttributes } from 'react'
import { useTheme } from '../theme/ThemeProvider'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: string
}

export function Select({ icon, children, className = '', ...props }: SelectProps) {
  const { icons } = useTheme()
  return (
    <div className="flex items-center">
      {icon && icons[icon] && <span className="mr-1">{icons[icon]}</span>}
      <select
        className={`bg-bg border border-accent rounded text-text flex-1 font-body p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
