/* eslint-disable */
// @ts-nocheck
import * as THREE from "three"

export default function initDiceDemo({ app, toast, toolbar, settings }) {
  // Main entry point for the standalone Three.js dice demo.
  // Sets up rendering, physics simulation and UI bindings.
  // ===== Config =====
  // Default visual settings for dice and tray. Many of these are live‑edited via the UI panel.
  const CONFIG = {
    baseColor: "#e991ff",
    emissiveColor: "#3a2bc4",
    emissiveIntensity: 0.28,
    glowColor: "#9a7cff",
    glowOpacity: 0.35,
    textureKind: "none",
    fontFamily: "'Times New Roman', serif",
    fontWeight: "700",
    fontSize: 68,
    fontColor: "#ffe8b0",
    strokeColor: "#ffb450",
    strokeWidth: 10,
    trayShape: "hex",
    trayBaseColor: "#1b153d",
    trayEmissiveColor: "#221a55",
    trayEmissiveIntensity: 0.2,
    trayOpacity: 1.0,
    trayTextureKind: "none",
    trayRimHeight: 0.8,
    trayRimThickness: 0.3,
    trayRimColor: "#3a2bc4",
    trayRimEmissive: "#7b5cff",
    trayRimEmissiveIntensity: 0.35,
    trayRimOpacity: 0.85,
  }

  // ===== Utilities =====
  // Numerical helpers used throughout the simulation.
  const EPS = 1e-4
  let FLOOR_EPS = 0.2
  const FLOOR_EPS_KIND = { d20: 0.2, d8: 0.2, d6: 0.2, d4: 0.2 }
  // Ensure a <= b and return ordered pair.
  const clampRange = (a, b) => (a <= b ? [a, b] : [b, a])
  // Random float between min and max.
  const rand = (min = 0, max = 1) => {
    const [lo, hi] = clampRange(min, max)
    return Math.random() * (hi - lo) + lo
  }
  // Deterministic PRNG used for reproducible dice throws.
  const makeRng = (seed = 1) => {
    let s = seed >>> 0 || 1
    return () => {
      s ^= s << 13
      s ^= s >>> 17
      s ^= s << 5
      return (s >>> 0) / 4294967296
    }
  }
  // Sample from rng in given range.
  const seeded = (rng, min, max) => {
    const [lo, hi] = clampRange(min, max)
    return rng() * (hi - lo) + lo
  }
  // Quaternion representing rotation from one vector to another.
  function quatFromTo(from, to) {
    const f = from.clone().normalize(),
      t = to.clone().normalize()
    const d = Math.max(-1, Math.min(1, f.dot(t)))
    if (1 - Math.abs(d) < 1e-6) {
      if (d > 0) return new THREE.Quaternion()
      const ax = new THREE.Vector3(1, 0, 0).cross(f)
      if (ax.lengthSq() < EPS) ax.set(0, 1, 0).cross(f)
      ax.normalize()
      return new THREE.Quaternion().setFromAxisAngle(ax, Math.PI)
    }
    const ax = f.clone().cross(t).normalize()
    const ang = Math.acos(d)
    return new THREE.Quaternion().setFromAxisAngle(ax, ang)
  }

  // Renderer/Scene/Cameras
  // Create renderer and two cameras (orthographic and perspective)
  // used for different viewing modes.
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.shadowMap.enabled = true
  app.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x140a36)
  scene.fog = new THREE.Fog(0x140a36, 10, 24)
  const aspect = window.innerWidth / window.innerHeight
  const frustum = 8
  const orthoCamera = new THREE.OrthographicCamera(
    -frustum * aspect,
    frustum * aspect,
    frustum,
    -frustum,
    0.1,
    200,
  )
  orthoCamera.position.set(0, 12, 0.0001)
  orthoCamera.up.set(0, 0, -1)
  orthoCamera.lookAt(0, 0.6, 0)
  const perspCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 200)
  perspCamera.position.set(0, 12, 0.0001)
  perspCamera.lookAt(0, 0.6, 0)
  scene.add(orthoCamera)
  scene.add(perspCamera)
  let camera = orthoCamera
  // Orbit (minimal)
  // Simple custom orbit controls to avoid pulling in the full OrbitControls module.
  const orbit = (() => {
    const target = new THREE.Vector3(0, 0.6, 0)
    let r = 12,
      theta = 0,
      phi = 0.18
    const st = { rot: false, pan: false, lx: 0, ly: 0 }
    function apply() {
      const spr = Math.sin(phi) * r
      camera.position.set(
        target.x + spr * Math.sin(theta),
        target.y + (camera.isOrthographicCamera ? r : r) * Math.cos(phi),
        target.z + spr * Math.cos(theta),
      )
      camera.lookAt(target)
      if (camera.isOrthographicCamera) {
        const a =
          renderer.domElement.clientWidth / renderer.domElement.clientHeight
        const f = 8
        camera.left = -f * a
        camera.right = f * a
        camera.top = f
        camera.bottom = -f
      } else {
        camera.aspect =
          renderer.domElement.clientWidth / renderer.domElement.clientHeight
      }
      camera.updateProjectionMatrix()
    }
    function down(e) {
      if (e.button === 2 || e.ctrlKey) st.pan = true
      else st.rot = true
      st.lx = e.clientX
      st.ly = e.clientY
    }
    function move(e) {
      if (!st.rot && !st.pan) return
      const dx = e.clientX - st.lx,
        dy = e.clientY - st.ly
      st.lx = e.clientX
      st.ly = e.clientY
      if (st.rot) {
        theta -= dx * 0.005
        phi = Math.max(0.05, Math.min(1.2, phi - dy * 0.005))
      }
      if (st.pan) {
        const pan = new THREE.Vector3()
        const panX = -dx * 0.01,
          panY = dy * 0.01
        camera.updateMatrixWorld()
        camera.getWorldDirection(pan).cross(camera.up).setLength(panX)
        target.add(pan)
        const up = new THREE.Vector3().copy(camera.up).setLength(panY)
        target.add(up)
      }
      apply()
    }
    function up() {
      st.rot = st.pan = false
    }
    function wheel(e) {
      if (camera.isOrthographicCamera) {
        camera.zoom = Math.max(
          0.5,
          Math.min(5, camera.zoom * (1 + (e.deltaY > 0 ? -0.1 : 0.1))),
        )
      } else {
        r = Math.max(4, Math.min(40, r * (1 + (e.deltaY > 0 ? 0.08 : -0.08))))
      }
      camera.updateProjectionMatrix()
    }
    function reset() {
      r = 12
      theta = 0
      phi = 0.18
      target.set(0, 0.6, 0)
      if (camera.isOrthographicCamera) camera.zoom = 1
      apply()
    }
    renderer.domElement.addEventListener("mousedown", down)
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
    renderer.domElement.addEventListener("wheel", wheel, { passive: true })
    renderer.domElement.addEventListener("contextmenu", (e) =>
      e.preventDefault(),
    )
    reset()
    return { reset, apply }
  })()
  // Lights
  // Hemisphere, point and directional lights approximate a simple studio setup.
  scene.add(new THREE.HemisphereLight(0x9b5cff, 0x0b1a2a, 0.55))
  const fill = new THREE.PointLight(0x00e5ff, 0.6, 40, 2)
  fill.position.set(-6, 6, -4)
  scene.add(fill)
  const rim = new THREE.PointLight(0xff3fb3, 0.5, 40, 2)
  rim.position.set(6, 8, 6)
  scene.add(rim)
  const dir = new THREE.DirectionalLight(0xffffff, 0.7)
  dir.position.set(4, 10, 4)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  scene.add(dir)
  // Tray
  const TRAY_H = 0.25
  const world = { size: 6, floorY: TRAY_H, tray: null }
  let trayBaseMesh = null,
    trayRimGroup = null,
    trayBaseOccluder = null,
    trayRimOccluder = null
  // Generate a simple texture for faces or tray surfaces.
  function makeFaceTexture(kind, a, b) {
    const size = 256,
      c = document.createElement("canvas")
    c.width = c.height = size
    const g = c.getContext("2d")
    if (kind === "checker") {
      const s = 32
      for (let y = 0; y < size; y += s) {
        for (let x = 0; x < size; x += s) {
          g.fillStyle = ((x + y) / s) % 2 ? a : b
          g.fillRect(x, y, s, s)
        }
      }
    } else if (kind === "stripes") {
      for (let y = 0; y < size; y++) {
        g.fillStyle = y % 16 < 8 ? a : b
        g.fillRect(0, y, size, 1)
      }
    } else if (kind === "noise") {
      const img = g.createImageData(size, size)
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255
        img.data[i] = v
        img.data[i + 1] = v
        img.data[i + 2] = v
        img.data[i + 3] = 255
      }
      g.putImageData(img, 0, 0)
      g.globalAlpha = 0.5
      g.fillStyle = a
      g.fillRect(0, 0, size, size)
      g.globalAlpha = 1
    } else {
      g.fillStyle = a
      g.fillRect(0, 0, size, size)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.anisotropy = 8
    return tex
  }
  // Geometry for the tray base depending on selected shape.
  function buildTrayBaseGeometry(shape, radius, depth) {
    if (shape === "circle") {
      const g = new THREE.CylinderGeometry(radius, radius, depth, 48, 1, false)
      return g.translate(0, depth / 2, 0)
    }
    const s = shape === "hex" ? 6 : shape === "oct" ? 8 : 4
    const sh = new THREE.Shape()
    for (let i = 0; i < s; i++) {
      const a = (i * 2 * Math.PI) / s
      const x = Math.cos(a) * radius,
        z = Math.sin(a) * radius
      if (i === 0) sh.moveTo(x, z)
      else sh.lineTo(x, z)
    }
    sh.closePath()
    const extr = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: false,
      steps: 1,
    })
    extr.rotateX(-Math.PI / 2)
    extr.translate(0, depth / 2, 0)
    return extr
  }
  // Geometry for the tray rim that keeps dice inside.
  function buildTrayRimGeometry(shape, R, rimT, rimH) {
    if (shape === "circle") {
      const Ro = R + rimT,
        Ri = R
      const sh = new THREE.Shape()
      sh.absarc(0, 0, Ro, 0, Math.PI * 2, false)
      const hole = new THREE.Path()
      hole.absarc(0, 0, Ri, 0, Math.PI * 2, true)
      sh.holes.push(hole)
      const extr = new THREE.ExtrudeGeometry(sh, {
        depth: rimH,
        bevelEnabled: false,
        steps: 1,
        curveSegments: 64,
      })
      extr.rotateX(-Math.PI / 2)
      extr.translate(0, TRAY_H + rimH / 2, 0)
      return extr
    }
    const s = shape === "hex" ? 6 : shape === "oct" ? 8 : 4
    const a = R * Math.cos(Math.PI / s)
    const ai = a,
      ao = a + rimT
    const Ri = ai / Math.cos(Math.PI / s),
      Ro = ao / Math.cos(Math.PI / s)
    const outer = new THREE.Shape()
    for (let i = 0; i < s; i++) {
      const ang = (i * 2 * Math.PI) / s
      const x = Math.cos(ang) * Ro,
        z = Math.sin(ang) * Ro
      if (i === 0) outer.moveTo(x, z)
      else outer.lineTo(x, z)
    }
    outer.closePath()
    const hole = new THREE.Path()
    for (let i = s - 1; i >= 0; i--) {
      const ang = (i * 2 * Math.PI) / s
      const x = Math.cos(ang) * Ri,
        z = Math.sin(ang) * Ri
      if (i === s - 1) hole.moveTo(x, z)
      else hole.lineTo(x, z)
    }
    hole.closePath()
    outer.holes.push(hole)
    const extr = new THREE.ExtrudeGeometry(outer, {
      depth: rimH,
      bevelEnabled: false,
      steps: 1,
    })
    extr.rotateX(-Math.PI / 2)
    extr.translate(0, TRAY_H + rimH / 2, 0)
    return extr
  }
  // Rebuild tray meshes whenever appearance settings change.
  function rebuildTray() {
    if (trayBaseMesh) {
      scene.remove(trayBaseMesh)
      trayBaseMesh.geometry.dispose()
      trayBaseMesh.material.dispose()
      trayBaseMesh = null
    }
    if (trayBaseOccluder) {
      scene.remove(trayBaseOccluder)
      trayBaseOccluder.geometry.dispose()
      trayBaseOccluder.material.dispose()
      trayBaseOccluder = null
    }
    if (trayRimGroup) {
      trayRimGroup.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose()
          o.material.dispose()
        }
      })
      scene.remove(trayRimGroup)
      trayRimGroup = null
    }
    if (trayRimOccluder) {
      scene.remove(trayRimOccluder)
      trayRimOccluder.geometry.dispose()
      trayRimOccluder.material.dispose()
      trayRimOccluder = null
    }
    const baseGeom = buildTrayBaseGeometry(CONFIG.trayShape, world.size, TRAY_H)
    const baseOccMat = new THREE.MeshBasicMaterial({ colorWrite: false })
    baseOccMat.depthWrite = true
    baseOccMat.depthTest = true
    trayBaseOccluder = new THREE.Mesh(baseGeom.clone(), baseOccMat)
    trayBaseOccluder.renderOrder = -10
    scene.add(trayBaseOccluder)
    const baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(CONFIG.trayBaseColor),
      emissive: new THREE.Color(CONFIG.trayEmissiveColor),
      emissiveIntensity: CONFIG.trayEmissiveIntensity,
      transparent: true,
      opacity: CONFIG.trayOpacity,
      roughness: 0.8,
      metalness: 0.05,
      depthWrite: false,
    })
    if (CONFIG.trayTextureKind !== "none") {
      baseMat.map = makeFaceTexture(
        CONFIG.trayTextureKind,
        CONFIG.trayBaseColor,
        "#0b0b16",
      )
      baseMat.map.wrapS = baseMat.map.wrapT = THREE.RepeatWrapping
      baseMat.map.repeat.set(2, 2)
      baseMat.needsUpdate = true
    }
    trayBaseMesh = new THREE.Mesh(baseGeom, baseMat)
    trayBaseMesh.receiveShadow = true
    scene.add(trayBaseMesh)
    const R = world.size
    const rimH = CONFIG.trayRimHeight,
      rimT = CONFIG.trayRimThickness
    const rimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(CONFIG.trayRimColor),
      emissive: new THREE.Color(CONFIG.trayRimEmissive),
      emissiveIntensity: CONFIG.trayRimEmissiveIntensity,
      transparent: true,
      opacity: CONFIG.trayRimOpacity,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    const rimGeom = buildTrayRimGeometry(CONFIG.trayShape, R, rimT, rimH)
    const rimOccMat = new THREE.MeshBasicMaterial({ colorWrite: false })
    rimOccMat.depthWrite = true
    rimOccMat.depthTest = true
    trayRimOccluder = new THREE.Mesh(rimGeom.clone(), rimOccMat)
    trayRimOccluder.renderOrder = -10
    scene.add(trayRimOccluder)
    trayRimGroup = new THREE.Mesh(rimGeom, rimMat)
    trayRimGroup.castShadow = trayRimGroup.receiveShadow = true
    scene.add(trayRimGroup)
    const edges = []
    if (CONFIG.trayShape === "circle") {
      world.tray = { sides: 0, R: R, apothem: R, edges: [] }
    } else {
      const s =
        CONFIG.trayShape === "hex" ? 6 : CONFIG.trayShape === "oct" ? 8 : 4
      const innerAp = R * Math.cos(Math.PI / s)
      for (let i = 0; i < s; i++) {
        const ang = (i * 2 * Math.PI) / s + Math.PI / s
        const n = new THREE.Vector2(Math.cos(ang), Math.sin(ang))
        edges.push({ n, a: innerAp })
      }
      world.tray = { sides: s, R: R, apothem: innerAp, edges }
    }
  }
  // soft shadow
  // Simple ground plane used to fake contact shadows beneath the dice.
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.18,
      transparent: true,
    }),
  )
  contactShadow.rotation.x = -Math.PI / 2
  contactShadow.position.y = world.floorY + 0.005
  contactShadow.receiveShadow = true
  scene.add(contactShadow)
  // Dice helpers
  // Render the numeric labels used on die faces.
  function makeNumberTexture(n) {
    const size = 128,
      c = document.createElement("canvas")
    c.width = c.height = size
    const g = c.getContext("2d")
    g.clearRect(0, 0, size, size)
    g.fillStyle = CONFIG.fontColor
    g.strokeStyle = CONFIG.strokeColor
    g.lineWidth = CONFIG.strokeWidth
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.font = `${CONFIG.fontWeight} ${CONFIG.fontSize}px ${CONFIG.fontFamily}`
    if (CONFIG.strokeWidth > 0) g.strokeText(String(n), size / 2, size / 2)
    g.fillText(String(n), size / 2, size / 2)
    const tex = new THREE.CanvasTexture(c)
    tex.anisotropy = 8
    return tex
  }
  // Attach a textured plane representing a number to a mesh.
  function addNumberPlane(parent, center, normal, size, n) {
    const geo = new THREE.PlaneGeometry(size, size)
    const mat = new THREE.MeshBasicMaterial({
      map: makeNumberTexture(n),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    })
    const plane = new THREE.Mesh(geo, mat)
    const from = new THREE.Vector3(0, 0, 1)
    const to = normal.clone().normalize()
    plane.quaternion.copy(quatFromTo(from, to))
    plane.position.copy(center.clone().add(normal.clone().multiplyScalar(0.02)))
    plane.userData.n = n
    plane.renderOrder = 10
    parent.add(plane)
    return plane
  }
  // Thin outline around each die for a glowing effect.
  function addEdgeGlow(group, geom) {
    const edges = new THREE.EdgesGeometry(geom, 1)
    const mat = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: CONFIG.glowOpacity,
    })
    mat.color = new THREE.Color(CONFIG.glowColor)
    const lines = new THREE.LineSegments(edges, mat)
    lines.renderOrder = 2
    group.add(lines)
    return lines
  }
  // Extract vertices from geometry for collision and snapping calculations.
  function computeLocalVertices(geom) {
    const g = geom.index ? geom.toNonIndexed() : geom
    const pos = g.attributes.position
    const out = []
    for (let i = 0; i < pos.count; i++)
      out.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)))
    return out
  }
  // Compute the lowest Y value a rotated set of points can reach.
  function lowestYAfterRotation(verts, quat) {
    let min = Infinity,
      v = new THREE.Vector3()
    for (const p of verts) {
      v.copy(p).applyQuaternion(quat)
      if (v.y < min) min = v.y
    }
    return min
  }
  // Generate number labels for d4 faces, keeping track of unique vertices.
  function addLabelsForD4Faces(parent, geom) {
    const g = geom.index ? geom.toNonIndexed() : geom.clone()
    const pos = g.getAttribute("position")
    const faceCount = pos.count / 3
    const normals = []
    const planes = []
    const uniq = [],
      idxMap = [],
      seen = new Map()
    const key = (v) => `${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)}`
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))
      const k = key(v)
      if (!seen.has(k)) {
        seen.set(k, uniq.length)
        uniq.push(v)
      }
      idxMap[i] = seen.get(k)
    }
    const vertexNumber = [1, 2, 3, 4]
    const numTex = (n) => makeNumberTexture(n)
    for (let f = 0; f < faceCount; f++) {
      const i0 = f * 3,
        i1 = i0 + 1,
        i2 = i0 + 2
      const v0 = new THREE.Vector3(pos.getX(i0), pos.getY(i0), pos.getZ(i0))
      const v1 = new THREE.Vector3(pos.getX(i1), pos.getY(i1), pos.getZ(i1))
      const v2 = new THREE.Vector3(pos.getX(i2), pos.getY(i2), pos.getZ(i2))
      const center = new THREE.Vector3()
        .addVectors(v0, v1)
        .add(v2)
        .multiplyScalar(1 / 3)
      const e1 = new THREE.Vector3().subVectors(v1, v0),
        e2 = new THREE.Vector3().subVectors(v2, v0)
      let normal = new THREE.Vector3().crossVectors(e1, e2).normalize()
      const outward = center.clone().normalize()
      if (normal.dot(outward) < 0) normal.multiplyScalar(-1)
      normals.push(normal)
      const faceVerts = [
        { v: v0, i: idxMap[i0] },
        { v: v1, i: idxMap[i1] },
        { v: v2, i: idxMap[i2] },
      ]
      faceVerts.forEach(({ v, i }) => {
        const dir = new THREE.Vector3().subVectors(v, center).normalize()
        const up = dir.clone()
        const x = new THREE.Vector3().crossVectors(up, normal).normalize()
        const basis = new THREE.Matrix4().makeBasis(x, up, normal)
        const w = 0.46,
          h = 0.32
        const geo = new THREE.PlaneGeometry(w, h)
        const mat = new THREE.MeshBasicMaterial({
          map: numTex(vertexNumber[i]),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -2,
        })
        const m = new THREE.Mesh(geo, mat)
        m.quaternion.setFromRotationMatrix(basis)
        const faceInset = 0.18,
          lift = 0.0
        const faceRadius = Math.min(e1.length(), e2.length())
        m.position
          .copy(center)
          .addScaledVector(dir, faceRadius * faceInset)
          .addScaledVector(normal, lift)
        m.renderOrder = 10
        m.userData.n = vertexNumber[i]
        parent.add(m)
        planes.push(m)
      })
    }
    return { normals, planes, verts: uniq, vnums: vertexNumber }
  }
  // Generate number labels for platonic solids like d8/d20.
  function addLabelsForPlatonic(parent, geom) {
    const g = geom.index ? geom.toNonIndexed() : geom.clone()
    const pos = g.getAttribute("position")
    const faceCount = pos.count / 3
    const normals = []
    const planes = []
    for (let f = 0; f < faceCount; f++) {
      const i0 = f * 3,
        i1 = i0 + 1,
        i2 = i0 + 2
      const v0 = new THREE.Vector3(pos.getX(i0), pos.getY(i0), pos.getZ(i0))
      const v1 = new THREE.Vector3(pos.getX(i1), pos.getY(i1), pos.getZ(i1))
      const v2 = new THREE.Vector3(pos.getX(i2), pos.getY(i2), pos.getZ(i2))
      const center = new THREE.Vector3()
        .addVectors(v0, v1)
        .add(v2)
        .multiplyScalar(1 / 3)
      const normal = new THREE.Vector3()
        .subVectors(v1, v0)
        .cross(new THREE.Vector3().subVectors(v2, v0))
        .normalize()
      const p = addNumberPlane(parent, center, normal, 0.55, f + 1)
      normals.push(normal)
      planes.push(p)
    }
    return { normals, planes }
  }
  // Hard‑coded face information for a d6.
  function addLabelsForD6(parent) {
    const faces = [
      { n: new THREE.Vector3(0, 1, 0), c: new THREE.Vector3(0, 0.51, 0), t: 1 },
      {
        n: new THREE.Vector3(0, -1, 0),
        c: new THREE.Vector3(0, -0.51, 0),
        t: 6,
      },
      { n: new THREE.Vector3(0, 0, 1), c: new THREE.Vector3(0, 0, 0.51), t: 2 },
      {
        n: new THREE.Vector3(0, 0, -1),
        c: new THREE.Vector3(0, 0, -0.51),
        t: 5,
      },
      { n: new THREE.Vector3(1, 0, 0), c: new THREE.Vector3(0.51, 0, 0), t: 3 },
      {
        n: new THREE.Vector3(-1, 0, 0),
        c: new THREE.Vector3(-0.51, 0, 0),
        t: 4,
      },
    ]
    const normals = [],
      planes = []
    faces.forEach((f) => {
      planes.push(addNumberPlane(parent, f.c, f.n, 0.6, f.t))
      normals.push(f.n)
    })
    return { normals, planes }
  }
  // Create material for dice faces including optional textures.
  function makeMaterial() {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(CONFIG.baseColor),
      metalness: 0.25,
      roughness: 0.35,
      emissive: new THREE.Color(CONFIG.emissiveColor),
      emissiveIntensity: CONFIG.emissiveIntensity,
    })
    if (CONFIG.textureKind !== "none") {
      const tex = makeFaceTexture(
        CONFIG.textureKind,
        CONFIG.baseColor,
        "#1b153d",
      )
      mat.map = tex
      mat.needsUpdate = true
    }
    return mat
  }
  // Assemble a die of the given kind with geometry, labels and glow.
  function makeDie(kind) {
    let geom,
      radius,
      restitution = 0.28,
      mesh,
      group = new THREE.Group(),
      faceInfo
    const mat = makeMaterial()
    if (kind === "d6") {
      geom = new THREE.BoxGeometry(1, 1, 1)
      radius = Math.sqrt(3) * 0.5
      mesh = new THREE.Mesh(geom, mat)
      group.add(mesh)
      faceInfo = addLabelsForD6(mesh)
    } else if (kind === "d4") {
      geom = new THREE.TetrahedronGeometry(0.9, 0)
      radius = 0.9
      mesh = new THREE.Mesh(geom, mat)
      group.add(mesh)
      faceInfo = addLabelsForD4Faces(mesh, geom)
    } else if (kind === "d8") {
      geom = new THREE.OctahedronGeometry(0.95, 0)
      radius = 0.95
      mesh = new THREE.Mesh(geom, mat)
      group.add(mesh)
      faceInfo = addLabelsForPlatonic(mesh, geom)
    } else {
      geom = new THREE.IcosahedronGeometry(0.95, 0)
      radius = 0.95
      mesh = new THREE.Mesh(geom, mat)
      group.add(mesh)
      faceInfo = addLabelsForPlatonic(mesh, geom)
    }
    mesh.castShadow = mesh.receiveShadow = true
    const glow = addEdgeGlow(group, geom)
    scene.add(group)
    const localVerts = computeLocalVertices(geom)
    return {
      kind,
      group,
      mesh,
      geom,
      localVerts,
      localFaceNormals: faceInfo.normals,
      numberPlanes: faceInfo.planes,
      d4Verts: faceInfo.verts,
      d4VNums: faceInfo.vnums,
      glow,
      pos: new THREE.Vector3(0, 5, 0),
      vel: new THREE.Vector3(),
      angVel: new THREE.Vector3(),
      radius,
      restitution,
      snapping: false,
    }
  }
  const dice = [makeDie("d20"), makeDie("d8"), makeDie("d6"), makeDie("d4")]
  // Randomize position, velocity and spin of a die.
  function throwDie(d, rng) {
    d.pos.set(
      seeded(rng, -2.0, 2.0),
      seeded(rng, 3.5, 4.5),
      seeded(rng, -2.0, 2.0),
    )
    d.vel.set(
      seeded(rng, -2.0, 2.0),
      seeded(rng, 0.8, 2.0),
      seeded(rng, -2.0, 2.0),
    )
    d.angVel.set(seeded(rng, -5, 5), seeded(rng, -5, 5), seeded(rng, -5, 5))
    d.group.position.copy(d.pos)
    d.snapping = false
  }
  // Throw all dice using a seeded RNG.
  function throwAll(seed?) {
    const rng = makeRng(seed || (Math.random() * 1e9) | 0)
    dice.forEach((d) => throwDie(d, rng))
    scheduleResultsToast()
  }
  // Gradually rotate a die so the face closest to up becomes perfectly aligned.
  function snapToNearestFace(d) {
    const targetN =
      d.kind === "d4" ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0)
    let best = -Infinity,
      bestLocal = null
    for (const nLocal of d.localFaceNormals) {
      const nWorld = nLocal.clone().applyQuaternion(d.group.quaternion)
      const dot = nWorld.dot(targetN)
      if (dot > best) {
        best = dot
        bestLocal = nLocal
      }
    }
    if (!bestLocal) return
    const currentN = bestLocal.clone().applyQuaternion(d.group.quaternion)
    const q = quatFromTo(currentN, targetN)
    const target = q.multiply(d.group.quaternion).normalize()
    d.group.quaternion.slerp(target, 0.25)
    const minY = lowestYAfterRotation(d.localVerts, d.group.quaternion)
    const eps = FLOOR_EPS_KIND[d.kind] ?? FLOOR_EPS
    d.pos.y = world.floorY - minY + eps
  }
  // Tray boundary
  // Keep dice within the polygonal tray by clamping position and reflecting velocity.
  function applyTrayBoundary(d) {
    const t = world.tray
    if (!t) return
    const px = d.pos.x,
      pz = d.pos.z,
      r = d.radius
    if (t.sides === 0) {
      const rr = Math.max(0.0001, t.R - r)
      const len = Math.hypot(px, pz)
      if (len > rr) {
        const inv = 1 / (len || 1)
        const nx = px * inv,
          nz = pz * inv
        d.pos.x = nx * rr
        d.pos.z = nz * rr
        const vdot = d.vel.x * nx + d.vel.z * nz
        if (vdot > 0) {
          d.vel.x -= vdot * 1.4 * nx
          d.vel.z -= vdot * 1.4 * nz
        }
      }
      return
    }
    const a = t.apothem - r
    for (const e of t.edges) {
      const dot = e.n.x * px + e.n.y * pz
      if (dot > a) {
        const over = dot - a
        d.pos.x -= e.n.x * over
        d.pos.z -= e.n.y * over
        const vdot = d.vel.x * e.n.x + d.vel.z * e.n.y
        if (vdot > 0) {
          d.vel.x -= 1.6 * vdot * e.n.x
          d.vel.z -= 1.6 * vdot * e.n.y
        }
      }
    }
  }
  // Basic sphere-sphere collision response between dice.
  function resolveDiceCollisions() {
    for (let i = 0; i < dice.length; i++) {
      for (let j = i + 1; j < dice.length; j++) {
        const a = dice[i],
          b = dice[j]
        const dx = b.pos.x - a.pos.x,
          dy = b.pos.y - a.pos.y,
          dz = b.pos.z - a.pos.z
        const dist = Math.hypot(dx, dy, dz),
          minDist = a.radius + b.radius
        if (dist > 0 && dist < minDist) {
          const nx = dx / dist,
            ny = dy / dist,
            nz = dz / dist
          const pen = minDist - dist
          a.pos.x -= nx * pen * 0.5
          a.pos.y -= ny * pen * 0.5
          a.pos.z -= nz * pen * 0.5
          b.pos.x += nx * pen * 0.5
          b.pos.y += ny * pen * 0.5
          b.pos.z += nz * pen * 0.5
          const vRel =
            (b.vel.x - a.vel.x) * nx +
            (b.vel.y - a.vel.y) * ny +
            (b.vel.z - a.vel.z) * nz
          const e = 0.25
          const imp = (1 + e) * vRel * 0.5
          a.vel.x += imp * nx
          a.vel.y += imp * ny
          a.vel.z += imp * nz
          b.vel.x -= imp * nx
          b.vel.y -= imp * ny
          b.vel.z -= imp * nz
        }
      }
    }
  }
  // Physics step integrating velocity, collisions and snapping.
  function integrate(dt) {
    const floor = world.floorY,
      friction = 0.86
    const angDamp = Math.pow(0.985, dt * 60),
      airDamp = Math.pow(0.995, dt * 60)
    for (const d of dice) {
      d.vel.y += -9.81 * dt
      d.pos.x += d.vel.x * dt
      d.pos.y += d.vel.y * dt
      d.pos.z += d.vel.z * dt
      const localMinY = lowestYAfterRotation(d.localVerts, d.group.quaternion)
      const eps = FLOOR_EPS_KIND[d.kind] ?? FLOOR_EPS
      const allowY = floor - localMinY + eps
      const onGround = d.pos.y <= allowY + 0.001
      if (d.pos.y < allowY) {
        d.pos.y = allowY
        if (d.vel.y < 0) d.vel.y = -d.vel.y * d.restitution
        d.vel.x *= friction
        d.vel.z *= friction
        d.angVel.multiplyScalar(friction)
      } else if (!onGround) {
        d.vel.multiplyScalar(airDamp)
      }
      applyTrayBoundary(d)
      const w = d.angVel.length()
      if (w > 0.0001) {
        const axis = d.angVel.clone().multiplyScalar(1 / w)
        const angle = w * dt
        d.group.quaternion
          .multiply(new THREE.Quaternion().setFromAxisAngle(axis, angle))
          .normalize()
        d.angVel.multiplyScalar(angDamp)
      }
      const speed = d.vel.length(),
        spin = d.angVel.length()
      if (onGround && speed < 0.12 && spin < 0.5) {
        d.snapping = true
        snapToNearestFace(d)
        d.vel.multiplyScalar(0.88)
        d.angVel.multiplyScalar(0.78)
        if (speed < 0.02) d.vel.set(0, 0, 0)
        if (spin < 0.02) d.angVel.set(0, 0, 0)
      } else {
        d.snapping = false
      }
      if (d.pos.y < -5) {
        d.pos.y = floor + 0.2
        d.vel.set(0, 0, 0)
        d.angVel.set(0, 0, 0)
      }
      d.group.position.copy(d.pos)
    }
    resolveDiceCollisions()
  }
  // Appearance
  // Apply current CONFIG colors/textures to a single die.
  function applyAppearanceToDie(d) {
    const m = d.mesh.material
    m.color.set(CONFIG.baseColor)
    m.emissive.set(CONFIG.emissiveColor)
    m.emissiveIntensity = CONFIG.emissiveIntensity
    if (CONFIG.textureKind !== "none") {
      m.map = makeFaceTexture(CONFIG.textureKind, CONFIG.baseColor, "#1b153d")
      if (m.map) m.map.needsUpdate = true
    } else {
      m.map = null
    }
    m.needsUpdate = true
    if (d.glow && d.glow.material) {
      d.glow.material.color.set(CONFIG.glowColor)
      d.glow.material.opacity = CONFIG.glowOpacity
      d.glow.material.needsUpdate = true
    }
    if (d.numberPlanes) {
      for (const p of d.numberPlanes) {
        const n = p.userData.n
        p.material.map = makeNumberTexture(n)
        p.material.needsUpdate = true
      }
    }
  }
  // Update all dice and tray when settings change.
  function applyAppearanceAll() {
    dice.forEach(applyAppearanceToDie)
    rebuildTray()
  }
  // Loop
  // Main animation loop with optional slow motion.
  let slowMo = false
  let lastTime = performance.now()
  function loop(now) {
    const dtRaw = Math.max(0.001, Math.min(0.05, (now - lastTime) / 1000))
    lastTime = now
    const dt = slowMo ? dtRaw * 0.333 : dtRaw
    integrate(dt)
    renderer.render(scene, camera)
    requestAnimationFrame(loop)
  }
  // Values + toast
  // Determine which face is up for display and show a transient toast.
  function valueOfDie(d) {
    const up = new THREE.Vector3(0, 1, 0)
    if (d.kind === "d4" && d.d4Verts && d.d4VNums) {
      let bestY = -Infinity,
        bestIdx = 0
      const q = d.group.quaternion
      const tmp = new THREE.Vector3()
      d.d4Verts.forEach((v, i) => {
        tmp.copy(v).applyQuaternion(q)
        if (tmp.y > bestY) {
          bestY = tmp.y
          bestIdx = i
        }
      })
      return d.d4VNums[bestIdx] || 1
    }
    let best = -Infinity,
      bestN = 1
    const q = new THREE.Quaternion()
    const n = new THREE.Vector3(0, 0, 1)
    for (const p of d.numberPlanes) {
      p.getWorldQuaternion(q)
      const nw = n.clone().applyQuaternion(q)
      const dot = nw.dot(up)
      if (dot > best) {
        best = dot
        bestN = p.userData.n || 1
      }
    }
    return bestN
  }
  function scheduleResultsToast() {
    clearTimeout(scheduleResultsToast._t)
    scheduleResultsToast._t = setTimeout(() => showResultsToast(), 2200)
  }
  function showResultsToast() {
    if (!toast) return
    const vals = dice
      .map((d) => `${d.kind.toUpperCase()}: ${valueOfDie(d)}`)
      .join(" \u2022 ")
    const div = document.createElement("div")
    div.className = "toast"
    div.textContent = vals
    toast.appendChild(div)
    requestAnimationFrame(() => {
      div.style.opacity = "1"
      div.style.transform = "translateY(0)"
    })
    setTimeout(() => {
      div.style.opacity = "0"
      div.style.transform = "translateY(-8px)"
      setTimeout(() => div.remove(), 300)
    }, 4000)
  }
  // UI
  // Button and select handlers for user interaction are exposed via the
  // returned API rather than DOM listeners.

  function toggleSlowMo() {
    slowMo = !slowMo
    return slowMo
  }

  function toggleSettings() {
    settings.style.display =
      settings.style.display === "none" ? "block" : "none"
  }

  function setViewMode(mode) {
    if (mode === "ortho") {
      camera = orthoCamera
    } else if (mode === "perspTop") {
      camera = perspCamera
      perspCamera.position.set(0, 12, 0.0001)
      perspCamera.lookAt(0, 0.6, 0)
    } else {
      camera = perspCamera
      perspCamera.position.set(8, 8, 10)
      perspCamera.lookAt(0, 0.6, 0)
    }
    orbit.apply()
  }
  // Binds
  // Helper to connect form controls to CONFIG values.
  const bind = (id, key, parseFn = (v) => v, onChange = applyAppearanceAll) => {
    const el = settings.querySelector(`#${id}`)
    CONFIG[key] = parseFn(el.value)
    el.addEventListener("input", () => {
      CONFIG[key] = parseFn(el.value)
      onChange()
    })
  }
  bind("baseColor", "baseColor")
  bind("emissiveColor", "emissiveColor")
  bind("emissiveIntensity", "emissiveIntensity", (v) => parseFloat(v))
  bind("glowColor", "glowColor")
  bind("glowOpacity", "glowOpacity", (v) => parseFloat(v))
  bind("textureKind", "textureKind")
  bind("fontFamily", "fontFamily")
  bind("fontWeight", "fontWeight")
  bind("fontSize", "fontSize", (v) => parseInt(v, 10) || 64)
  bind("fontColor", "fontColor")
  bind("strokeColor", "strokeColor")
  bind("strokeWidth", "strokeWidth", (v) => parseInt(v, 10) || 0)
  bind(
    "trayShape",
    "trayShape",
    (v) => v,
    () => {
      rebuildTray()
    },
  )
  bind("trayBaseColor", "trayBaseColor", (v) => v, rebuildTray)
  bind("trayEmissiveColor", "trayEmissiveColor", (v) => v, rebuildTray)
  bind(
    "trayEmissiveIntensity",
    "trayEmissiveIntensity",
    (v) => parseFloat(v),
    rebuildTray,
  )
  bind("trayOpacity", "trayOpacity", (v) => parseFloat(v), rebuildTray)
  bind("trayTextureKind", "trayTextureKind", (v) => v, rebuildTray)
  bind("trayRimHeight", "trayRimHeight", (v) => parseFloat(v), rebuildTray)
  bind(
    "trayRimThickness",
    "trayRimThickness",
    (v) => parseFloat(v),
    rebuildTray,
  )
  bind("trayRimColor", "trayRimColor", (v) => v, rebuildTray)
  bind("trayRimEmissive", "trayRimEmissive", (v) => v, rebuildTray)
  bind(
    "trayRimEmissiveIntensity",
    "trayRimEmissiveIntensity",
    (v) => parseFloat(v),
    rebuildTray,
  )
  bind("trayRimOpacity", "trayRimOpacity", (v) => parseFloat(v), rebuildTray)
  // Init
  // Build initial tray and roll dice on first load.
  rebuildTray()
  const diceSeed = 0xc0ffee
  throwAll(diceSeed)
  applyAppearanceAll()
  requestAnimationFrame(loop)
  // Resize
  // Keep renderer and cameras in sync with window size.
  window.addEventListener("resize", () => {
    const a = window.innerWidth / window.innerHeight
    const f = 8
    orthoCamera.left = -f * a
    orthoCamera.right = f * a
    orthoCamera.top = f
    orthoCamera.bottom = -f
    orthoCamera.updateProjectionMatrix()
    perspCamera.aspect = a
    perspCamera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    orbit.apply()
  })
  return {
    throwAll,
    toggleSlowMo,
    resetOrbit: orbit.reset,
    applyAppearanceAll,
    rebuildTray,
    setViewMode,
    toggleSettings,
  }
}
