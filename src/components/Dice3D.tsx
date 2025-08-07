import React, { useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { Physics, useBox } from '@react-three/cannon/dist/index.js'
import * as THREE from 'three'
import { useTheme } from '../theme/ThemeProvider'

export interface Dice3DProps {
  type?: 'd4' | 'd6' | 'd8' | 'd12' | 'd20'
  rollResult?: number
  color?: string
  edgeColor?: string
  faceTextures?: string[]
  size?: number
  speed?: number
}

function createGeometry(type: Dice3DProps['type'], size: number) {
  switch (type) {
    case 'd4':
      return new THREE.TetrahedronGeometry(size)
    case 'd6':
      return new THREE.BoxGeometry(size, size, size)
    case 'd8':
      return new THREE.OctahedronGeometry(size)
    case 'd12':
      return new THREE.DodecahedronGeometry(size)
    case 'd20':
    default:
      return new THREE.IcosahedronGeometry(size)
  }
}

function prepareGeometry(geometry: THREE.BufferGeometry) {
  const pos = geometry.attributes.position as THREE.BufferAttribute
  const indexAttr = geometry.index as THREE.BufferAttribute | null
  const index: ArrayLike<number> =
    indexAttr?.array ?? Array.from({ length: pos.count }, (_, i) => i)
  const normals: THREE.Vector3[] = []
  const faceForTri: number[] = []
  const map = new Map<string, number>()
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  for (let i = 0; i < index.length; i += 3) {
    a.fromBufferAttribute(pos, index[i])
    b.fromBufferAttribute(pos, index[i + 1])
    c.fromBufferAttribute(pos, index[i + 2])
    const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize()
    const key = `${normal.x.toFixed(5)},${normal.y.toFixed(5)},${normal.z.toFixed(5)}`
    let group = map.get(key)
    if (group === undefined) {
      group = normals.length
      map.set(key, group)
      normals.push(normal)
    }
    faceForTri.push(group)
  }
  geometry.clearGroups()
  for (let i = 0; i < faceForTri.length; i++) {
    geometry.addGroup(i * 3, 3, faceForTri[i])
  }
  const orientations = normals.map(normal => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(normal, new THREE.Vector3(0, 1, 0))
    return q
  })
  return { geometry, orientations, faceCount: normals.length }
}

function generateDefaultTextures(count: number, color: string) {
  return Array.from({ length: count }, (_, i) => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = color
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = '#000'
    ctx.font = `${size * 0.6}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(i + 1), size / 2, size / 2)
    return new THREE.CanvasTexture(canvas)
  })
}

interface DiceBodyProps {
  geometry: THREE.BufferGeometry
  materials: THREE.Material[]
  orientations: THREE.Quaternion[]
  edgeColor: string
  rollResult: number
  speed: number
  size: number
}

function DiceBody({ geometry, materials, orientations, edgeColor, rollResult, speed, size }: DiceBodyProps) {
  const [mesh, api] = useBox<THREE.Mesh>(
    () => ({
      mass: 1,
      args: [size, size, size],
      angularDamping: 0.9,
      linearDamping: 0.8
    }),
    undefined,
    [size]
  )
  const [anim, setAnim] = useState<{
    start: THREE.Quaternion
    end: THREE.Quaternion
    startTime: number
    duration: number
  } | null>(null)

  useEffect(() => {
    if (!orientations.length) return
    const start = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      )
    )
    const end = orientations[(rollResult - 1) % orientations.length]
    const duration = 0.4 / speed
    setAnim({ start, end, startTime: performance.now(), duration })
    api.quaternion.set(start.x, start.y, start.z, start.w)
    api.applyImpulse(
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5] as [number, number, number],
      [0, 0, 0] as [number, number, number]
    )
    api.applyTorque([
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5
    ] as [number, number, number])
  }, [rollResult, orientations, speed, api])

  useFrame(() => {
    if (!anim) return
    const elapsed = (performance.now() - anim.startTime) / 1000
    if (elapsed < anim.duration) {
      const t = elapsed / anim.duration
      const q = new THREE.Quaternion()
      q.slerpQuaternions(anim.start, anim.end, t)
      api.quaternion.set(q.x, q.y, q.z, q.w)
    } else {
      api.quaternion.set(anim.end.x, anim.end.y, anim.end.z, anim.end.w)
      api.velocity.set(0, 0, 0)
      api.angularVelocity.set(0, 0, 0)
      setAnim(null)
    }
  })

  return (
    <mesh ref={mesh} geometry={geometry} material={materials} castShadow receiveShadow>
      <Edges color={edgeColor} />
    </mesh>
  )
}

export default function Dice3D({
  type = 'd6',
  rollResult = 1,
  color: propColor,
  edgeColor: propEdgeColor,
  faceTextures: propTextures,
  size = 1,
  speed = 1
}: Dice3DProps) {
  const { diceStyle } = useTheme()
  const color = propColor ?? diceStyle.color
  const edgeColor = propEdgeColor ?? diceStyle.edgeColor
  const faceTextures = propTextures ?? diceStyle.textureUrls
  const [externalTextures, setExternalTextures] = useState<THREE.Texture[]>([])

  useEffect(() => {
    if (!faceTextures || faceTextures.length === 0) {
      setExternalTextures([])
      return
    }
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = 'anonymous'
    let cancelled = false
    Promise.all(
      faceTextures.map(
        url =>
          new Promise<THREE.Texture | null>(resolve => {
            loader.load(
              url,
              tex => resolve(tex),
              undefined,
              () => resolve(null)
            )
          })
      )
    ).then(textures => {
      if (!cancelled) {
        setExternalTextures(textures.filter((t): t is THREE.Texture => t !== null))
      }
    })
    return () => {
      cancelled = true
    }
  }, [faceTextures])

  const { geometry, orientations, materials } = useMemo(() => {
    const geometry = createGeometry(type, size)
    const { orientations, faceCount } = prepareGeometry(geometry)
    const textures = externalTextures.length >= faceCount
      ? externalTextures
      : generateDefaultTextures(faceCount, color)
    const materials = textures.map(tex => new THREE.MeshStandardMaterial({ map: tex }))
    return { geometry, orientations, materials }
  }, [type, size, color, externalTextures])

  return (
    <Physics gravity={[0, 0, 0]}>
      <DiceBody
        geometry={geometry}
        materials={materials}
        orientations={orientations}
        edgeColor={edgeColor}
        rollResult={rollResult}
        speed={speed}
        size={size}
      />
    </Physics>
  )
}
