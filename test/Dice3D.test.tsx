import ReactThreeTestRenderer from '@react-three/test-renderer'
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import Dice3D from '../src/components/Dice3D'

describe('Dice3D', () => {
  it('renders with provided style props', async () => {
    const fills: string[] = []
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = (function (_id?: string) {
      const ctx = {
        fillStyle: '#000000',
        font: '',
        textAlign: 'center',
        textBaseline: 'middle',
        fillRect() { fills.push(ctx.fillStyle as string) },
        fillText() {},
        clearRect() {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) })
      }
      return ctx as unknown as CanvasRenderingContext2D
    }) as typeof HTMLCanvasElement.prototype.getContext

    const renderer = await ReactThreeTestRenderer.create(
      <Dice3D type="d6" rollResult={1} color="#ff0000" edgeColor="#00ff00" />
    )
    const edges = renderer.scene.children[0].children[0].instance as THREE.LineSegments
    const edgeMaterial = edges.material as THREE.LineBasicMaterial
    expect(edgeMaterial.color.getHexString()).toBe('00ff00')
    expect(fills[0]).toBe('#ff0000')
    await renderer.unmount()
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })
})
