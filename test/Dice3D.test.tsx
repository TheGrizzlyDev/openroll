import ReactThreeTestRenderer from '@react-three/test-renderer'
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as THREE from 'three'

vi.mock('@react-three/cannon/dist/index.js', () => {
  return {
    Physics: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with provided style props', async () => {
    const fills: string[] = []
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const edges = renderer.scene.children[0].children[0].children[0].instance as THREE.LineSegments
    const edgeMaterial = edges.material as THREE.LineBasicMaterial
    expect(edgeMaterial.color.getHexString()).toBe('00ff00')
    expect(fills[0]).toBe('#ff0000')
    await renderer.unmount()
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  it('completes roll within default duration', async () => {
    let now = 0
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => now)
    const renderer = await ReactThreeTestRenderer.create(<Dice3D rollResult={2} />)
    const mesh = renderer.scene.children[0].children[0].instance as THREE.Mesh
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
    const mesh = renderer.scene.children[0].children[0].instance as THREE.Mesh
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
