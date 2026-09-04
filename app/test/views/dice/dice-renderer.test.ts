import { describe, expect, it, vi } from 'vitest'

import { Group, Mesh, Vector3, type CanvasTexture, type MeshBasicMaterial, type MeshStandardMaterial } from 'three'
import { DIE_DEFINITIONS } from '@/views/dice/engine/dice-definitions'
import { addLabels, makeLabelTexture, resolveTrayTouchAction } from '@/views/dice/engine/dice-renderer'

describe('resolveTrayTouchAction', () => {
  it('交互禁用期使用 manipulation：保留滚动与捏合缩放，禁用双击缩放', () => {
    expect(resolveTrayTouchAction(false)).toBe('manipulation')
  })

  it('交互启用期使用 none：手势全部交给 3D 视图控件', () => {
    expect(resolveTrayTouchAction(true)).toBe('none')
  })
})


it('enlarges all standard and percentile labels without clipping the measured ink', () => {
  const labels = new Set([...Array.from({ length: 21 }, (_, i) => String(i)), ...Array.from({ length: 10 }, (_, i) => String(i * 10).padStart(2, '0'))])
  const ink: { width: number; height: number; x: number; y: number; font: number }[] = []
  const context = {
    font: '', lineWidth: 2,
    clearRect: vi.fn(), strokeText: vi.fn(),
    measureText(text: string) {
      const size = Number(this.font.split(' ')[1]?.replace('px', ''))
      return { width: text.length * size * 0.9, actualBoundingBoxLeft: size * 0.03, actualBoundingBoxRight: text.length * size * 0.9, actualBoundingBoxAscent: size * 0.8, actualBoundingBoxDescent: size * 0.1 }
    },
    fillText(text: string, x: number, y: number) {
      const bounds = this.measureText(text)
      ink.push({ width: bounds.actualBoundingBoxLeft + bounds.actualBoundingBoxRight + this.lineWidth, height: bounds.actualBoundingBoxAscent + bounds.actualBoundingBoxDescent + this.lineWidth, x: x - bounds.actualBoundingBoxLeft - this.lineWidth / 2, y: y - bounds.actualBoundingBoxAscent - this.lineWidth / 2, font: Number(this.font.split(' ')[1]?.replace('px', '')) })
    },
  }
  const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
  for (const label of labels) {
    const texture = makeLabelTexture(label)
    expect(texture.image.width).toBe(256)
    const box = ink.at(-1)
    expect(box).toBeDefined()
    if (box) {
      expect(box.width).toBeLessThanOrEqual(256 * 0.84 + 0.001)
      expect(box.height).toBeLessThanOrEqual(256 * 0.84 + 0.001)
      expect(box.x).toBeGreaterThanOrEqual(256 * 0.08 - 0.001)
      expect(box.y).toBeGreaterThanOrEqual(256 * 0.08 - 0.001)
      expect(box.font / 256).toBeGreaterThan((label.length > 1 ? 48 : 58) / 128)
    }
    texture.dispose()
  }
  spy.mockRestore()
})


it('enlarges D4 labels while keeping all ink inside each face and separated', () => {
  const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  const group = new Group()
  const textures: CanvasTexture[] = []
  const materials: Array<MeshBasicMaterial | MeshStandardMaterial> = []
  const definition = DIE_DEFINITIONS.d4
  addLabels(group, definition, { id: 'd4', logicalId: 'd4', type: 'd4', resultKind: 'standard', targetValue: 4 }, textures, materials)
  expect(group.children).toHaveLength(12)
  definition.faces.forEach((face, faceIndex) => {
    const vertices = face.map((index) => new Vector3(...(definition.vertices[index] ?? [0, 0, 0])).multiplyScalar(definition.radius))
    const center = vertices.reduce((sum, point) => sum.add(point), new Vector3()).divideScalar(3)
    const normal = center.clone().normalize()
    const labels = group.children.slice(faceIndex * 3, faceIndex * 3 + 3)
    for (const label of labels) {
      expect(label).toBeInstanceOf(Mesh)
      expect(label.scale.x).toBeGreaterThanOrEqual(0.23 * 1.4)
      const halfInk = label.scale.x * 0.84 / 2
      for (const x of [-halfInk, halfInk]) for (const y of [-halfInk, halfInk]) {
        const point = new Vector3(x, y, 0).applyQuaternion(label.quaternion).add(label.position).addScaledVector(normal, -0.025)
        vertices.forEach((a, index) => {
          const b = vertices[(index + 1) % 3]
          if (!b) return
          const edge = b.clone().sub(a)
          const inwardSign = edge.clone().cross(center.clone().sub(a)).dot(normal)
          expect(edge.clone().cross(point.clone().sub(a)).dot(normal) * inwardSign).toBeGreaterThan(0)
        })
      }
    }
    for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
      const a = labels[i], b = labels[j]
      if (a && b) expect(a.position.distanceTo(b.position)).toBeGreaterThan(a.scale.x * 0.84 * Math.SQRT2)
    }
  })
  textures.forEach((texture) => texture.dispose())
  materials.forEach((material) => material.dispose())
  spy.mockRestore()
})
