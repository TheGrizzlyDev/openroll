import {
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type HTMLAttributes
} from 'react'
import { Label } from '@radix-ui/react-label'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  const describedBy = error ? `field::${htmlFor}::error-text` : undefined
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<HTMLAttributes<HTMLElement>>, {
        id: htmlFor,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })
    : children

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
    >
      <Label htmlFor={htmlFor}>{label}</Label>
      {control}
      {error && (
        <span
          id={describedBy}
          style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
