import { ReactNode, useMemo } from 'react'
import { Physics, useBox, usePlane } from '@react-three/cannon/dist/index.js'
import * as THREE from 'three'

export interface DiceTrayProps {
  children?: ReactNode
  /** color of the felt surface */
  feltColor?: string
  /** optional texture url for the felt surface */
  feltTexture?: string
  /** color of the tray walls */
  edgeColor?: string
  /** size of the tray in units */
  size?: number
}

/**
 * DiceTray renders a shallow box with a felt-like plane and raised edges
 * that can be used as a physics playground for Dice3D components.
 */
export default function DiceTray({
  children,
  feltColor = '#2e8b57',
  feltTexture,
  edgeColor = '#8b4513',
  size = 5
}: DiceTrayProps) {
  return (
    <Physics gravity={[0, -9.81, 0]}>
      <TrayContent
        feltColor={feltColor}
        feltTexture={feltTexture}
        edgeColor={edgeColor}
        size={size}
      >
        {children}
      </TrayContent>
    </Physics>
  )
}

function TrayContent({
  children,
  feltColor = '#2e8b57',
  feltTexture,
  edgeColor = '#8b4513',
  size = 5
}: DiceTrayProps) {
  const [planeRef] = usePlane(() => ({
    type: 'Static',
    position: [0, 0, 0],
    rotation: [-Math.PI / 2, 0, 0]
  }))

  const wallArgs: [number, number, number] = useMemo(() => [size, 1, 0.5], [size])

  const [northRef] = useBox(() => ({ type: 'Static', position: [0, 0.5, -size / 2], args: wallArgs }))
  const [southRef] = useBox(() => ({ type: 'Static', position: [0, 0.5, size / 2], args: wallArgs }))
  const [eastRef] = useBox(() => ({
    type: 'Static',
    position: [size / 2, 0.5, 0],
    rotation: [0, Math.PI / 2, 0],
    args: wallArgs
  }))
  const [westRef] = useBox(() => ({
    type: 'Static',
    position: [-size / 2, 0.5, 0],
    rotation: [0, Math.PI / 2, 0],
    args: wallArgs
  }))

  const texture = useMemo(() => {
    if (!feltTexture) return undefined
    const loader = new THREE.TextureLoader()
    const tex = loader.load(feltTexture)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 2)
    return tex
  }, [feltTexture])

  return (
    <group>
      <mesh ref={planeRef} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={feltColor} map={texture} />
      </mesh>
      <mesh ref={northRef} receiveShadow castShadow>
        <boxGeometry args={[size, 1, 0.5]} />
        <meshStandardMaterial color={edgeColor} />
      </mesh>
      <mesh ref={southRef} receiveShadow castShadow>
        <boxGeometry args={[size, 1, 0.5]} />
        <meshStandardMaterial color={edgeColor} />
      </mesh>
      <mesh ref={eastRef} receiveShadow castShadow>
        <boxGeometry args={[size, 1, 0.5]} />
        <meshStandardMaterial color={edgeColor} />
      </mesh>
      <mesh ref={westRef} receiveShadow castShadow>
        <boxGeometry args={[size, 1, 0.5]} />
        <meshStandardMaterial color={edgeColor} />
      </mesh>
      {children}
    </group>
  )
}

