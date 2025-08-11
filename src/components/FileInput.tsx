import { useRef } from 'react'
import { Button, type ButtonProps } from '../design-system'

interface FileInputProps extends Omit<ButtonProps, 'onClick'> {
  accept?: string
  onFileSelect: (_file: File) => void
}

export function FileInput({ accept, onFileSelect, children, ...buttonProps }: FileInputProps) {
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
      <Button onClick={handleClick} {...buttonProps}>
        {children}
      </Button>
    </>
  )
}
