import { type TextareaHTMLAttributes } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import styles from './Textarea.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon?: string
}

export function Textarea({ icon, className, ...props }: TextareaProps) {
  const { icons } = useTheme()
  return (
    <div className={styles.wrapper}>
      {icon && icons[icon] && <span className={styles.icon}>{icons[icon]}</span>}
      <textarea className={`${styles.textarea} ${className ?? ''}`} {...props} />
    </div>
  )
}
