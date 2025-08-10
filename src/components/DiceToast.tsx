import { type RefObject } from 'react'

interface DiceToastProps {
  toastRef: RefObject<HTMLDivElement | null>
}

export default function DiceToast({ toastRef }: DiceToastProps) {
  return <div id="toast" ref={toastRef} />
}

