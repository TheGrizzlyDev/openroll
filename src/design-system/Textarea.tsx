import { type TextareaHTMLAttributes } from 'react'
import { useTheme } from '../theme/ThemeProvider'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: string
}

export function Textarea({ icon, className = '', ...props }: TextareaProps) {
  const { icons } = useTheme()
  return (
    <div className="flex items-center">
      {icon && icons[icon] && <span className="mr-1">{icons[icon]}</span>}
      <textarea
        className={`bg-bg-alt border border-accent rounded-[var(--border-radius)] text-text flex-1 font-body p-2 transition-shadow focus:shadow-[0_0_5px_var(--color-accent)] focus:outline-none ${className}`}
        {...props}
      />
    </div>
  )
}
