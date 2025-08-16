import {
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type HTMLAttributes,
} from 'react'
import { Label } from '@radix-ui/react-label'
import { Flex, Text } from '@radix-ui/themes'

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
    <Flex direction="column" gap="2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {control}
      {error && (
        <Text id={describedBy} color="red" size="1">
          {error}
        </Text>
      )}
    </Flex>
  )
}
