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
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'

import type { DicePresentation, PhysicalDieSpec, PhysicsTrajectory } from '@/types/dice'
import type { DieDefinition } from '@/views/dice/engine/dice-definitions'
import { DIE_DEFINITIONS } from '@/views/dice/engine/dice-definitions'
import { findLabelOffsetQuaternion } from '@/views/dice/engine/dice-symmetry'

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

function makeLabelTexture(text: string): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    context.clearRect(0, 0, 128, 128)
    context.fillStyle = '#8f2d2d'
    context.font = `${text.length > 1 ? 700 : 800} ${text.length > 1 ? 48 : 58}px "Microsoft YaHei", sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, 64, 65)
    context.strokeStyle = 'rgba(255,253,248,.7)'
    context.lineWidth = 2
    context.strokeText(text, 64, 65)
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

function addLabels(
  group: Group,
  definition: DieDefinition,
  spec: PhysicalDieSpec,
  textures: CanvasTexture[],
  materials: MeshStandardMaterial[],
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
        const material = new MeshStandardMaterial({ map: texture, transparent: true, side: DoubleSide, roughness: 0.6 })
        const label = new Mesh(FACE_PLANE, material)
        const position = new Vector3(...vertex).multiplyScalar(0.62).addScaledVector(center, 0.38)
          .multiplyScalar(definition.radius)
        orientLabel(label, position, normal, 0.21)
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
    const material = new MeshStandardMaterial({ map: texture, transparent: true, side: DoubleSide, roughness: 0.6 })
    const label = new Mesh(FACE_PLANE, material)
    const normal = new Vector3(...direction)
    const center = faceCenter(definition, face).multiplyScalar(definition.radius)
    const size = definition.type === 'd20' ? 0.28 : definition.type === 'd12' ? 0.31 : 0.36
    orientLabel(label, center, normal, size)
    group.add(label)
    textures.push(texture)
    materials.push(material)
  })
}

export class DiceRenderer {
  private renderer: WebGLRenderer
  private scene = new Scene()
  private camera = new PerspectiveCamera(35, 1, 0.1, 100)
  private dice: RenderedDie[] = []
  private geometries: BufferGeometry[] = []
  private materials: Array<MeshStandardMaterial | LineBasicMaterial> = []
  private diceGeometries: BufferGeometry[] = []
  private diceMaterials: Array<MeshStandardMaterial | LineBasicMaterial> = []
  private diceTextures: CanvasTexture[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.setClearColor(new Color('#f4ecde'))

    this.camera.position.set(0, 10.5, 9.5)
    this.camera.lookAt(0, 0.4, 0)

    this.scene.add(new AmbientLight('#fff7e8', 2.1))
    const light = new DirectionalLight('#fff3d7', 3.2)
    light.position.set(-4, 9, 6)
    light.castShadow = true
    light.shadow.mapSize.set(1024, 1024)
    this.scene.add(light)

    const floorGeometry = new PlaneGeometry(12, 8.8)
    const floorMaterial = new MeshStandardMaterial({ color: '#efe4d1', roughness: 0.92 })
    const floor = new Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)
    this.geometries.push(floorGeometry)
    this.materials.push(floorMaterial)

    const rimMaterial = new MeshStandardMaterial({ color: '#b9873d', roughness: 0.75 })
    const longRim = new BoxGeometry(12.3, 0.35, 0.22)
    const shortRim = new BoxGeometry(0.22, 0.35, 8.8)
    for (const [geometry, x, z] of [
      [longRim, 0, -4.4], [longRim, 0, 4.4], [shortRim, -6, 0], [shortRim, 6, 0],
    ] as const) {
      const rim = new Mesh(geometry, rimMaterial)
      rim.position.set(x, 0.16, z)
      rim.castShadow = true
      this.scene.add(rim)
    }
    this.geometries.push(longRim, shortRim)
    this.materials.push(rimMaterial)
    this.render()
  }

  resize(width: number, height: number) {
    this.renderer.setSize(Math.max(1, width), Math.max(1, height), false)
    this.camera.aspect = Math.max(1, width) / Math.max(1, height)
    this.camera.updateProjectionMatrix()
    this.render()
  }

  setPresentation(presentation: DicePresentation) {
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
      addLabels(group, definition, spec, this.diceTextures, this.diceMaterials as MeshStandardMaterial[])

      const targetValue = spec.type === 'd10' ? spec.targetValue % 10 : spec.targetValue
      const landingIndex = presentation.trajectory.landingDirectionIndices[index] ?? 0
      const labelOffset = findLabelOffsetQuaternion(definition, targetValue, landingIndex)
      this.dice.push({ group, labelOffset })
      this.diceGeometries.push(geometry, edgesGeometry)
      this.diceMaterials.push(material, edgeMaterial)
      this.scene.add(group)
    })
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
    this.clearDice()
    for (const geometry of this.geometries) geometry.dispose()
    for (const material of this.materials) material.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
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
