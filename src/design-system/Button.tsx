import { forwardRef, type ReactNode } from 'react'
import { ark, type HTMLArkProps } from '@ark-ui/react'
import { useTheme } from '../theme/ThemeProvider'

export interface ButtonProps extends HTMLArkProps<'button'> {
  icon?: string
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ icon, children, ...props }, ref) => {
    const { icons } = useTheme()
    return (
      <ark.button ref={ref} {...props}>
        {icon && icons[icon] && (
          <span style={{ marginRight: '0.25rem' }}>{icons[icon]}</span>
        )}
        {children}
      </ark.button>
    )
  }
)
