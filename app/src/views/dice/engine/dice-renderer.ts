import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  SRGBColorSpace,
  TOUCH,
  Vector3,
  WebGLRenderer,
} from 'three'
import { MapControls } from 'three/addons/controls/MapControls.js'

import type { DicePresentation, PhysicalDieSpec, PhysicsTrajectory } from '@/types/dice'
import type { DieDefinition } from '@/views/dice/engine/dice-definitions'
import { DIE_DEFINITIONS } from '@/views/dice/engine/dice-definitions'
import { findLabelOffsetQuaternion } from '@/views/dice/engine/dice-symmetry'
import type { DiceViewState } from '@/views/dice/engine/dice-tray-layout'
import { clampDiceViewState, getDiceTrayLayout, getTrayFitDistance } from '@/views/dice/engine/dice-tray-layout'

interface RenderedDie {
  group: Group
  labelOffset: Quaternion
}

const FACE_PLANE = new PlaneGeometry(1, 1)

function faceCenter(definition: DieDefinition, face: readonly number[]): Vector3 {
  const center = new Vector3()
  for (const index of face) {
    const vertex = definition.vertices[index]
    if (vertex) center.add(new Vector3(...vertex))
  }
  return center.divideScalar(face.length)
}

function createHullGeometry(definition: DieDefinition): BufferGeometry {
  const positions: number[] = []
  for (const face of definition.faces) {
    const first = definition.vertices[face[0] ?? 0]
    if (!first) continue
    for (let index = 1; index < face.length - 1; index += 1) {
      const second = definition.vertices[face[index] ?? 0]
      const third = definition.vertices[face[index + 1] ?? 0]
      if (!second || !third) continue
      positions.push(...first, ...second, ...third)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

function displayLabel(spec: PhysicalDieSpec, value: number): string {
  if (spec.resultKind === 'percentile-tens') return String(value * 10).padStart(2, '0')
  if (spec.type === 'd10' && spec.resultKind === 'standard' && value === 0) return '10'
  return String(value)
}

export function makeLabelTexture(text: string): CanvasTexture {
  const canvas = document.createElement('canvas')
  const resolution = 256
  canvas.width = resolution
  canvas.height = resolution
  const context = canvas.getContext('2d')
  if (context) {
    context.clearRect(0, 0, resolution, resolution)
    context.textAlign = 'left'
    context.textBaseline = 'alphabetic'
    context.lineWidth = 2
    const available = resolution * 0.84 - context.lineWidth
    let fontSize = text.length > 1 ? 180 : 220
    const measure = () => {
      context.font = `800 ${fontSize}px "Microsoft YaHei", sans-serif`
      const metrics = context.measureText(text)
      const left = metrics.actualBoundingBoxLeft || 0
      const right = metrics.actualBoundingBoxRight || metrics.width
      const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8
      const descent = metrics.actualBoundingBoxDescent || 0
      return { left, right, ascent, descent }
    }
    let bounds = measure()
    const scale = Math.min(1, available / (bounds.left + bounds.right), available / (bounds.ascent + bounds.descent))
    if (scale < 1) {
      fontSize *= scale
      bounds = measure()
    }
    const x = resolution / 2 + (bounds.left - bounds.right) / 2
    const y = resolution / 2 + (bounds.ascent - bounds.descent) / 2
    context.strokeStyle = 'rgba(255,253,248,.7)'
    context.strokeText(text, x, y)
    context.fillStyle = '#481717'
    context.fillText(text, x, y)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function orientLabel(mesh: Mesh, position: Vector3, normal: Vector3, size: number) {
  mesh.position.copy(position).addScaledVector(normal, 0.025)
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), normal)
  mesh.scale.setScalar(size)
}

export function addLabels(
  group: Group,
  definition: DieDefinition,
  spec: PhysicalDieSpec,
  textures: CanvasTexture[],
  materials: Array<MeshStandardMaterial | MeshBasicMaterial>,
) {
  if (definition.type === 'd4') {
    definition.faces.forEach((face) => {
      const center = faceCenter(definition, face)
      const normal = center.clone().normalize()
      face.forEach((vertexIndex) => {
        const vertex = definition.vertices[vertexIndex]
        const value = definition.valuesByDirection[vertexIndex]
        if (!vertex || value === undefined) return
        const texture = makeLabelTexture(displayLabel(spec, value))
        const material = new MeshBasicMaterial({ map: texture, transparent: true, side: DoubleSide, toneMapped: false })
        const label = new Mesh(FACE_PLANE, material)
        const position = new Vector3(...vertex).multiplyScalar(0.44).addScaledVector(center, 0.56)
          .multiplyScalar(definition.radius)
        orientLabel(label, position, normal, 0.34)
        group.add(label)
        textures.push(texture)
        materials.push(material)
      })
    })
    return
  }

  definition.faces.forEach((face, index) => {
    const direction = definition.resultDirections[index]
    const value = definition.valuesByDirection[index]
    if (!direction || value === undefined) return
    const texture = makeLabelTexture(displayLabel(spec, value))
    const material = new MeshBasicMaterial({ map: texture, transparent: true, side: DoubleSide, toneMapped: false })
    const label = new Mesh(FACE_PLANE, material)
    const normal = new Vector3(...direction)
    const center = faceCenter(definition, face).multiplyScalar(definition.radius)
    const size = definition.type === 'd20' ? 0.32 : definition.type === 'd12' ? 0.36 : 0.42
    orientLabel(label, center, normal, size)
    group.add(label)
    textures.push(texture)
    materials.push(material)
  })
}

/**
 * 骰盘 canvas 的 touch-action 策略：
 * - 交互禁用期（idle/preparing/rolling）：manipulation —— 保留页面滚动与双指捏合缩放，禁用双击缩放与点击延迟；
 * - 交互启用期（complete 且存在展示结果）：none —— 手势全部交给 OrbitControls，浏览器缩放/滚动/双击不介入。
 */
export function resolveTrayTouchAction(interactionEnabled: boolean): 'none' | 'manipulation' {
  return interactionEnabled ? 'none' : 'manipulation'
}

export class DiceRenderer {
  private renderer: WebGLRenderer
  private canvas: HTMLCanvasElement
  private scene = new Scene()
  private camera = new PerspectiveCamera(35, 1, 0.1, 250)
  private controls: MapControls
  private light = new DirectionalLight('#fff3d7', 3.2)
  private tray = new Group()
  private layout = getDiceTrayLayout(1)
  private physicalDiceCount = 1
  private aspect = 1
  private fullViewDistance = 1
  private interactionEnabled = false
  private constrainingView = false
  private dice: RenderedDie[] = []
  private trayGeometries: BufferGeometry[] = []
  private trayMaterials: MeshStandardMaterial[] = []
  private diceGeometries: BufferGeometry[] = []
  private diceMaterials: Array<MeshStandardMaterial | MeshBasicMaterial | LineBasicMaterial> = []
  private diceTextures: CanvasTexture[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.setClearColor(new Color('#f4ecde'))

    this.camera.position.set(0, 10.5, 9.5)
    this.controls = new MapControls(this.camera, canvas)
    this.controls.target.set(0, 0.4, 0)
    this.controls.enableRotate = false
    this.controls.enableDamping = false
    this.controls.screenSpacePanning = false
    this.controls.touches.ONE = null
    this.controls.touches.TWO = TOUCH.DOLLY_PAN
    this.controls.enabled = false
    // 交互禁用期：manipulation（保留页面纵向滚动与双指捏合缩放，禁用双击缩放）；
    // 交互启用期：none（手势全部交给 OrbitControls，浏览器缩放/滚动/双击不介入）
    canvas.style.touchAction = resolveTrayTouchAction(false)
    this.controls.addEventListener('change', this.handleControlsChange)

    this.scene.add(new AmbientLight('#fff7e8', 2.1))
    this.light.castShadow = true
    this.light.shadow.mapSize.set(1024, 1024)
    this.scene.add(this.light, this.tray)
    this.rebuildTray()
    this.fullViewDistance = getTrayFitDistance(this.layout, this.aspect)
    this.resetView()
    this.render()
  }

  resize(width: number, height: number) {
    const previousZoom = this.getViewState().zoomLevel
    this.renderer.setSize(Math.max(1, width), Math.max(1, height), false)
    this.aspect = Math.max(1, width) / Math.max(1, height)
    this.camera.aspect = this.aspect
    this.camera.updateProjectionMatrix()
    this.configureCamera(previousZoom)
  }

  setTrayLayout(physicalDiceCount: number) {
    const normalizedCount = Math.max(1, physicalDiceCount)
    if (normalizedCount === this.physicalDiceCount) return
    this.physicalDiceCount = normalizedCount
    this.layout = getDiceTrayLayout(normalizedCount)
    this.rebuildTray()
    this.resetView()
  }

  setInteractionEnabled(enabled: boolean) {
    this.interactionEnabled = enabled
    this.controls.enabled = enabled
    this.canvas.style.touchAction = resolveTrayTouchAction(enabled)
    if (!enabled) this.resetView()
  }

  zoomIn() {
    if (!this.interactionEnabled) return
    this.applyViewState({ ...this.getViewState(), zoomLevel: this.getViewState().zoomLevel * 1.25 })
  }

  zoomOut() {
    if (!this.interactionEnabled) return
    this.applyViewState({ ...this.getViewState(), zoomLevel: this.getViewState().zoomLevel / 1.25 })
  }

  resetView() {
    this.applyViewState({ zoomLevel: 1, targetX: 0, targetZ: 0 })
  }

  clearPresentation() {
    this.clearDice()
    this.setInteractionEnabled(false)
    this.render()
  }

  private rebuildTray() {
    for (const geometry of this.trayGeometries) geometry.dispose()
    for (const material of this.trayMaterials) material.dispose()
    this.tray.clear()
    this.trayGeometries = []
    this.trayMaterials = []

    const floorGeometry = new PlaneGeometry(this.layout.width, this.layout.depth)
    const floorMaterial = new MeshStandardMaterial({ color: '#efe4d1', roughness: 0.92 })
    const floor = new Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.tray.add(floor)
    this.trayGeometries.push(floorGeometry)
    this.trayMaterials.push(floorMaterial)

    const rimMaterial = new MeshStandardMaterial({ color: '#b9873d', roughness: 0.75 })
    const longRim = new BoxGeometry(this.layout.width + 0.3, 0.35, 0.22)
    const shortRim = new BoxGeometry(0.22, 0.35, this.layout.depth)
    for (const [geometry, x, z] of [
      [longRim, 0, -this.layout.halfDepth], [longRim, 0, this.layout.halfDepth],
      [shortRim, -this.layout.halfWidth, 0], [shortRim, this.layout.halfWidth, 0],
    ] as const) {
      const rim = new Mesh(geometry, rimMaterial)
      rim.position.set(x, 0.16, z)
      rim.castShadow = true
      this.tray.add(rim)
    }
    this.trayGeometries.push(longRim, shortRim)
    this.trayMaterials.push(rimMaterial)

    const shadowExtent = Math.max(this.layout.width, this.layout.depth) * 0.7
    this.light.position.set(-4 * this.layout.scale, 9 * this.layout.scale, 6 * this.layout.scale)
    this.light.shadow.camera.left = -shadowExtent
    this.light.shadow.camera.right = shadowExtent
    this.light.shadow.camera.top = shadowExtent
    this.light.shadow.camera.bottom = -shadowExtent
    this.light.shadow.camera.far = 40 * this.layout.scale
    this.light.shadow.camera.updateProjectionMatrix()
    this.render()
  }

  setPresentation(presentation: DicePresentation) {
    this.setTrayLayout(presentation.request.dice.length)
    this.clearDice()
    presentation.request.dice.forEach((spec, index) => {
      const definition = DIE_DEFINITIONS[spec.type]
      const group = new Group()
      const geometry = createHullGeometry(definition)
      const material = new MeshStandardMaterial({
        color: spec.resultKind === 'percentile-tens' ? '#f1d9a8' : '#fffaf0',
        roughness: 0.48,
        metalness: 0.04,
        flatShading: true,
      })
      const mesh = new Mesh(geometry, material)
      mesh.scale.setScalar(definition.radius)
      mesh.castShadow = true
      group.add(mesh)

      const edgesGeometry = new EdgesGeometry(geometry, 18)
      const edgeMaterial = new LineBasicMaterial({ color: '#b9873d', transparent: true, opacity: 0.72 })
      const edges = new LineSegments(edgesGeometry, edgeMaterial)
      edges.scale.setScalar(definition.radius * 1.002)
      group.add(edges)
      addLabels(group, definition, spec, this.diceTextures, this.diceMaterials as Array<MeshStandardMaterial | MeshBasicMaterial>)

      const targetValue = spec.type === 'd10' ? spec.targetValue % 10 : spec.targetValue
      const landingIndex = presentation.trajectory.landingDirectionIndices[index] ?? 0
      const labelOffset = findLabelOffsetQuaternion(definition, targetValue, landingIndex)
      this.dice.push({ group, labelOffset })
      this.diceGeometries.push(geometry, edgesGeometry)
      this.diceMaterials.push(material, edgeMaterial)
      this.scene.add(group)
    })
    this.setInteractionEnabled(false)
    this.renderAt(presentation.trajectory, 0)
  }

  renderAt(trajectory: PhysicsTrajectory, elapsedMs: number) {
    const exactFrame = Math.min(trajectory.frameCount - 1, elapsedMs / 1000 * trajectory.frameRate)
    const firstFrame = Math.floor(exactFrame)
    const secondFrame = Math.min(trajectory.frameCount - 1, firstFrame + 1)
    const alpha = exactFrame - firstFrame
    const diceCount = trajectory.diceIds.length

    this.dice.forEach((die, dieIndex) => {
      const firstOffset = (firstFrame * diceCount + dieIndex) * 7
      const secondOffset = (secondFrame * diceCount + dieIndex) * 7
      const firstPosition = new Vector3(
        trajectory.transforms[firstOffset] ?? 0,
        trajectory.transforms[firstOffset + 1] ?? 0,
        trajectory.transforms[firstOffset + 2] ?? 0,
      )
      const secondPosition = new Vector3(
        trajectory.transforms[secondOffset] ?? 0,
        trajectory.transforms[secondOffset + 1] ?? 0,
        trajectory.transforms[secondOffset + 2] ?? 0,
      )
      const firstQuaternion = new Quaternion(
        trajectory.transforms[firstOffset + 3] ?? 0,
        trajectory.transforms[firstOffset + 4] ?? 0,
        trajectory.transforms[firstOffset + 5] ?? 0,
        trajectory.transforms[firstOffset + 6] ?? 1,
      )
      const secondQuaternion = new Quaternion(
        trajectory.transforms[secondOffset + 3] ?? 0,
        trajectory.transforms[secondOffset + 4] ?? 0,
        trajectory.transforms[secondOffset + 5] ?? 0,
        trajectory.transforms[secondOffset + 6] ?? 1,
      )
      die.group.position.copy(firstPosition.lerp(secondPosition, alpha))
      die.group.quaternion.copy(firstQuaternion.slerp(secondQuaternion, alpha).multiply(die.labelOffset))
    })
    this.render()
  }

  dispose() {
    this.controls.removeEventListener('change', this.handleControlsChange)
    this.controls.dispose()
    this.clearDice()
    for (const geometry of this.trayGeometries) geometry.dispose()
    for (const material of this.trayMaterials) material.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }

  private getViewState(): DiceViewState {
    const distance = Math.max(0.001, this.camera.position.distanceTo(this.controls.target))
    return clampDiceViewState(this.layout, {
      zoomLevel: this.fullViewDistance / distance,
      targetX: this.controls.target.x,
      targetZ: this.controls.target.z,
    })
  }

  private applyViewState(state: DiceViewState) {
    const clamped = clampDiceViewState(this.layout, state)
    const direction = this.camera.position.clone().sub(this.controls.target)
    if (direction.lengthSq() < 0.001) direction.set(0, 10.1, 9.5)
    direction.normalize()
    this.controls.target.set(clamped.targetX, 0.4, clamped.targetZ)
    this.camera.position.copy(this.controls.target).addScaledVector(direction, this.fullViewDistance / clamped.zoomLevel)
    this.camera.lookAt(this.controls.target)
    this.controls.minDistance = this.fullViewDistance / 3
    this.controls.maxDistance = this.fullViewDistance
    this.render()
  }

  private configureCamera(zoomLevel: number) {
    this.fullViewDistance = getTrayFitDistance(this.layout, this.aspect)
    this.applyViewState({ ...this.getViewState(), zoomLevel })
  }

  private handleControlsChange = () => {
    if (this.constrainingView) return
    this.constrainingView = true
    const state = this.getViewState()
    const direction = this.camera.position.clone().sub(this.controls.target).normalize()
    this.controls.target.set(state.targetX, 0.4, state.targetZ)
    this.camera.position.copy(this.controls.target).addScaledVector(direction, this.fullViewDistance / state.zoomLevel)
    this.camera.lookAt(this.controls.target)
    this.constrainingView = false
    this.render()
  }

  private render() {
    this.renderer.render(this.scene, this.camera)
  }

  private clearDice() {
    for (const die of this.dice) this.scene.remove(die.group)
    this.dice = []
    for (const geometry of this.diceGeometries) geometry.dispose()
    for (const material of this.diceMaterials) material.dispose()
    for (const texture of this.diceTextures) texture.dispose()
    this.diceGeometries = []
    this.diceMaterials = []
    this.diceTextures = []
  }
}
