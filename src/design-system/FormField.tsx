import {
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement
} from 'react'
import {
  FieldRoot as FormControl,
  FieldLabel as FormLabel,
  FieldErrorText as FormError,
} from '@ark-ui/react'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  const describedBy = error ? `field::${htmlFor}::error-text` : undefined
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        id: htmlFor,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })
    : children

  return (
    <FormControl
      ids={{ control: htmlFor }}
      invalid={Boolean(error)}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
    >
      <FormLabel>{label}</FormLabel>
      {control}
      {error && (
        <FormError style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>
          {error}
        </FormError>
      )}
    </FormControl>
  )
}
