import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../ui'

interface PopupProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Popup({ visible, onClose, children }: PopupProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(visible)

  useEffect(() => {
    if (visible) {
      setShow(true)
      return
    }

    const timeout = setTimeout(() => setShow(false), 300)
    return () => clearTimeout(timeout)
  }, [visible])

  useEffect(() => {
    if (!visible) return

    const firstInput = contentRef.current?.querySelector<HTMLElement>(
      'input, textarea, select'
    )
    firstInput?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [visible, onClose])

  if (!show) return null

  return (
    <div className={`overlay${visible ? ' show' : ''}`}>
      <div ref={contentRef} className="overlay-content">
        {children}
        <Button type="button" onClick={onClose}>
          ×
        </Button>
      </div>
    </div>
  )
}
