import { forwardRef, type ReactNode } from 'react'
import { ark, type HTMLArkProps } from '@ark-ui/react'

export interface ButtonProps extends HTMLArkProps<'button'> {
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <ark.button ref={ref} {...props}>{children}</ark.button>
  )
)
