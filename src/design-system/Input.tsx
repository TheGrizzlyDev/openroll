import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { TextField } from '@radix-ui/themes'

export type InputProps = ComponentPropsWithoutRef<typeof TextField.Root>

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <TextField.Root ref={ref} {...props} />
))

export default Input
