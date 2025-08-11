import React, { useEffect, useRef, useState } from 'react'
import { Button } from '.'

interface DialogProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return []
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(',')))
}

export function Dialog({ visible, onClose, children }: DialogProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(visible)
  const previouslyFocused = useRef<HTMLElement | null>(null)

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

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const focusable = getFocusableElements(contentRef.current)
    ;(focusable[0] || contentRef.current)?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }

      if (e.key === 'Tab') {
        const elements = getFocusableElements(contentRef.current)
        if (elements.length === 0) {
          e.preventDefault()
          contentRef.current?.focus()
          return
        }
        const currentIndex = elements.indexOf(document.activeElement as HTMLElement)
        if (e.shiftKey) {
          if (currentIndex <= 0) {
            e.preventDefault()
            elements[elements.length - 1].focus()
          }
        } else {
          if (currentIndex === elements.length - 1) {
            e.preventDefault()
            elements[0].focus()
          }
        }
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      previouslyFocused.current?.focus()
    }
  }, [visible, onClose])

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-bg/80 transition-opacity duration-300 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        ref={contentRef}
        className={`flex flex-col items-center gap-2 border border-accent bg-bg rounded-[var(--border-radius)] transition-transform transition-opacity duration-300 p-2 text-sm sm:p-4 sm:text-base ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {children}
        <Button type="button" onClick={onClose}>
          ×
        </Button>
      </div>
    </div>
  )
}
