import { useRef, type ButtonHTMLAttributes } from 'react'
import { Button } from './Button'

interface FileInputProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  accept?: string
  onFileSelect: (_file: File) => void
  icon?: string
}

export function FileInput({ accept, onFileSelect, children, icon, className, ...buttonProps }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    const input = inputRef.current
    if (!input) return
    const listener = (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) onFileSelect(file)
      target.value = ''
    }
    input.addEventListener('change', listener, { once: true })
    input.click()
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} />
      <Button icon={icon} className={className} onClick={handleClick} {...buttonProps}>
        {children}
      </Button>
    </>
  )
}
