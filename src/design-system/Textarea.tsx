import { type TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <div className="flex items-center">
      <textarea
        className={`bg-bg border border-accent rounded-[var(--border-radius)] text-text flex-1 font-body p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        {...props}
      />
    </div>
  )
}
