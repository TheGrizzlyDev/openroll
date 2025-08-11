import { type SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex items-center">
      <select
        className={`bg-bg border border-accent rounded-[var(--border-radius)] text-text flex-1 font-body p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
