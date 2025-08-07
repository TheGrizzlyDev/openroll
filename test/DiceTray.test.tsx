// React 18 act() support before imports
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React from 'react'
import ReactThreeTestRenderer from '@react-three/test-renderer'
import { describe, it, expect, vi } from 'vitest'
import * as THREE from 'three'
import DiceTray from '../src/components/DiceTray'
import { useBox } from '@react-three/cannon/dist/index.js'

const planeRefs: THREE.Mesh[] = []
const boxRefs: THREE.Mesh[] = []

vi.mock('@react-three/cannon/dist/index.js', () => ({
  Physics: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  usePlane: (fn?: () => unknown) => {
    fn?.()
    const ref = { current: new THREE.Mesh() }
    planeRefs.push(ref.current)
    return [ref]
  },
  useBox: (fn: () => { position?: [number, number, number] }) => {
    const opts = fn()
    const ref = { current: new THREE.Mesh() }
    if (opts.position) {
      ref.current.position.set(...opts.position)
    }
    const api = {
      quaternion: { set: () => {} },
      applyImpulse: () => {},
      applyTorque: () => {},
      velocity: { set: () => {} },
      angularVelocity: { set: () => {} },
      position: { set: (x: number, y: number, z: number) => ref.current.position.set(x, y, z) }
    }
    boxRefs.push(ref.current)
    return [ref, api]
  }
}))

function TestDie({ position }: { position: [number, number, number] }) {
  const [ref] = useBox(() => ({ position }))
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial />
    </mesh>
  )
}

describe('DiceTray', () => {
  it('renders plane surface', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DiceTray />)
    await renderer.advanceFrames(1, 0.1)
    expect(planeRefs.length).toBeGreaterThan(0)
    await renderer.unmount()
  })

  it('allows dice to settle on surface', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <DiceTray>
        <TestDie position={[0, 1, 0]} />
      </DiceTray>
    )
    await renderer.advanceFrames(1, 0.1)
    const dice = boxRefs[boxRefs.length - 1]
    expect(dice.position.y).toBeCloseTo(1)
    dice.position.y = 0.5
    await renderer.advanceFrames(1, 0.1)
    expect(dice.position.y).toBeCloseTo(0.5)
    await renderer.unmount()
  })
})

