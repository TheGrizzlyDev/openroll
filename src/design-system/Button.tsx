import { forwardRef } from 'react'
import { Button as RadixButton, type ButtonProps as RadixButtonProps } from '@radix-ui/themes'

export type ButtonProps = RadixButtonProps

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <RadixButton ref={ref} {...props} />
))
