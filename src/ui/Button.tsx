import { type ButtonHTMLAttributes } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string
}

export function Button({ icon, children, className, ...props }: ButtonProps) {
  const { icons } = useTheme()
  return (
    <button className={`${styles.button} ${className ?? ''}`} {...props}>
      {icon && icons[icon] && <span className={styles.icon}>{icons[icon]}</span>}
      {children}
    </button>
  )
}
