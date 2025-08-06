import { type InputHTMLAttributes } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
}

export function Input({ icon, className, ...props }: InputProps) {
  const { icons } = useTheme()
  return (
    <div className={styles.wrapper}>
      {icon && icons[icon] && <span className={styles.icon}>{icons[icon]}</span>}
      <input className={`${styles.input} ${className ?? ''}`} {...props} />
    </div>
  )
}
