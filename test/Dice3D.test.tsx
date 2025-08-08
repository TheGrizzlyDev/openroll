// Ensure React 18 testing utilities are aware of act environment before imports
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import ReactThreeTestRenderer, { ReactThreeTest } from '@react-three/test-renderer'
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'

vi.mock('@react-three/cannon/dist/index.js', () => {
  return {
    useBox: () => {
      const ref = { current: { quaternion: new THREE.Quaternion(), children: [] as THREE.Object3D[] } }
      const api = {
        quaternion: { set: (x: number, y: number, z: number, w: number) => ref.current.quaternion.set(x, y, z, w) },
        applyImpulse: () => {},
        applyTorque: () => {},
        velocity: { set: () => {} },
        angularVelocity: { set: () => {} }
      }
      return [ref, api]
    }
  }
})

import Dice3D, { Dice3DProps } from '../src/components/Dice3D'

async function createRenderer(el: React.ReactElement, ms = 5000): Promise<ReactThreeTest.Renderer> {
  return await Promise.race([
    ReactThreeTestRenderer.create(el),
    new Promise<ReactThreeTest.Renderer>((_, reject) =>
      setTimeout(() => reject(new Error('Renderer creation timed out')), ms)
    ),
  ])
}

describe('Dice3D', () => {
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext
  beforeEach(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    HTMLCanvasElement.prototype.getContext = function (_id?: string) {
      return {
        fillStyle: '#000000',
        font: '',
        textAlign: 'center',
        textBaseline: 'middle',
        fillRect() {},
        strokeText() {},
        fillText() {},
        clearRect() {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) })
      } as unknown as CanvasRenderingContext2D
    } as unknown as typeof HTMLCanvasElement.prototype.getContext
  })

  afterEach(() => {
    vi.restoreAllMocks()
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  it('renders with provided style props', async () => {
    const fills: string[] = []
    const getContext = HTMLCanvasElement.prototype.getContext as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, _id?: string) {
      const ctx = getContext.call(this, _id ?? '2d') as unknown as CanvasRenderingContext2D
      const origFillRect = ctx.fillRect?.bind(ctx)
      ctx.fillRect = function () {
        fills.push(ctx.fillStyle as string)
        origFillRect?.(0, 0, 0, 0)
      }
      return ctx
    } as unknown as typeof HTMLCanvasElement.prototype.getContext

    const renderer = await createRenderer(
      <Dice3D type="d6" rollResult={1} color="#ff0000" edgeColor="#00ff00" />
    )
    const edges = renderer.scene.children[0].children[0].instance as THREE.LineSegments
    const edgeMaterial = edges.material as THREE.LineBasicMaterial
    expect(edgeMaterial.color.getHexString()).toBe('00ff00')
    expect(fills[0]).toBe('#ff0000')
    await renderer.unmount()
    HTMLCanvasElement.prototype.getContext = getContext
  })

  it('completes roll within default duration', async () => {
    let now = 0
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now)
    const renderer = await createRenderer(<Dice3D rollResult={2} />)
    const mesh = renderer.scene.children[0].instance as THREE.Mesh
    const step = 0.1
    for (let i = 0; i < 4; i++) {
      now += step * 1000
      await renderer.advanceFrames(1, step)
    }
    const q1 = mesh.quaternion.clone()
    now += step * 1000
    await renderer.advanceFrames(1, step)
    const q2 = mesh.quaternion.clone()
    expect(q1.equals(q2)).toBe(true)
    await renderer.unmount()
    nowSpy.mockRestore()
  })

  it('respects speed prop', async () => {
    let now = 0
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now)
    const renderer = await createRenderer(
      <Dice3D rollResult={2} speed={0.5} />
    )
    const mesh = renderer.scene.children[0].instance as THREE.Mesh
    const step = 0.1
    for (let i = 0; i < 4; i++) {
      now += step * 1000
      await renderer.advanceFrames(1, step)
    }
    const mid = mesh.quaternion.clone()
    for (let i = 0; i < 5; i++) {
      now += step * 1000
      await renderer.advanceFrames(1, step)
    }
    const end = mesh.quaternion.clone()
    now += step * 1000
    await renderer.advanceFrames(1, step)
    const after = mesh.quaternion.clone()
    expect(mid.equals(end)).toBe(false)
    expect(end.equals(after)).toBe(true)
    await renderer.unmount()
    nowSpy.mockRestore()
  })

  it('generates numbered textures for each die type', async () => {
    const original = HTMLCanvasElement.prototype.getContext as typeof HTMLCanvasElement.prototype.getContext
    const captured: string[] = []
    HTMLCanvasElement.prototype.getContext = function () {
      return {
        fillStyle: '#000',
        font: '',
        textAlign: 'center',
        textBaseline: 'middle',
        fillRect() {},
        strokeText() {},
        fillText(text: string) {
          captured.push(text)
        }
      } as unknown as CanvasRenderingContext2D
    } as unknown as typeof HTMLCanvasElement.prototype.getContext
    const types: Array<[Dice3DProps['type'], number]> = [
      ['d4', 4],
      ['d6', 6],
      ['d8', 8],
      ['d12', 12],
      ['d20', 20]
    ]
    for (const [type, count] of types) {
      captured.length = 0
      const renderer = await createRenderer(
        <Dice3D type={type} rollResult={1} />
      )
      expect(captured).toEqual(
        Array.from({ length: count }, (_, i) => String(i + 1))
      )
      await renderer.unmount()
    }
    HTMLCanvasElement.prototype.getContext = original
  })
})

