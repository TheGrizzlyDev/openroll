import { type RefObject } from 'react'

interface DiceCanvasProps {
  canvasRef: RefObject<HTMLDivElement | null>
}

export default function DiceCanvas({ canvasRef }: DiceCanvasProps) {
  return <div id="app" ref={canvasRef} />
}

