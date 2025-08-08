import { type ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}
