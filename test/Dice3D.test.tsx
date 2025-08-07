// Ensure React 18 testing utilities are aware of act environment before imports
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import ReactThreeTestRenderer from '@react-three/test-renderer'
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

import Dice3D from '../src/components/Dice3D'

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
        fillText() {},
        clearRect() {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) })
      } as unknown as CanvasRenderingContext2D
    } as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  it('renders with provided style props', async () => {
    const fills: string[] = []
    const getContext = HTMLCanvasElement.prototype.getContext as any
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, _id?: string) {
      const ctx = getContext.call(this, _id) as any
      const origFillRect = ctx.fillRect?.bind(ctx)
      ctx.fillRect = function () {
        fills.push(ctx.fillStyle as string)
        origFillRect?.(0, 0, 0, 0)
      }
      return ctx
    } as any

    const renderer = await ReactThreeTestRenderer.create(
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
    const renderer = await ReactThreeTestRenderer.create(<Dice3D rollResult={2} />)
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
    const renderer = await ReactThreeTestRenderer.create(
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
})

