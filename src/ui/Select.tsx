import { type SelectHTMLAttributes } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import styles from './Select.module.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: string
}

export function Select({ icon, children, className, ...props }: SelectProps) {
  const { icons } = useTheme()
  return (
    <div className={styles.wrapper}>
      {icon && icons[icon] && <span className={styles.icon}>{icons[icon]}</span>}
      <select className={`${styles.select} ${className ?? ''}`} {...props}>
        {children}
      </select>
    </div>
  )
}
