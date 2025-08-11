import { type InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return (
    <div className="flex items-center">
      <input
        className={`bg-bg border border-accent rounded-[var(--border-radius)] text-text flex-1 font-body p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        {...props}
      />
    </div>
  )
}
