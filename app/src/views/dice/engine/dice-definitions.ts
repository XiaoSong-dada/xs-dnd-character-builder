import type { PhysicalDieType, Vector3Tuple } from '@/types/dice'

export interface DieDefinition {
  type: PhysicalDieType
  vertices: Vector3Tuple[]
  faces: number[][]
  resultDirections: Vector3Tuple[]
  valuesByDirection: number[]
  radius: number
}

const EPSILON = 1e-5
const PHI = (1 + Math.sqrt(5)) / 2

function subtract(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function dot(a: Vector3Tuple, b: Vector3Tuple): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function cross(a: Vector3Tuple, b: Vector3Tuple): Vector3Tuple {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

function length(vector: Vector3Tuple): number {
  return Math.hypot(vector[0], vector[1], vector[2])
}

function normalize(vector: Vector3Tuple): Vector3Tuple {
  const size = length(vector)
  return size === 0 ? [0, 1, 0] : [vector[0] / size, vector[1] / size, vector[2] / size]
}

function average(points: readonly Vector3Tuple[]): Vector3Tuple {
  const sum = points.reduce<Vector3Tuple>(
    (result, point) => [result[0] + point[0], result[1] + point[1], result[2] + point[2]],
    [0, 0, 0],
  )
  return [sum[0] / points.length, sum[1] / points.length, sum[2] / points.length]
}

function scaleToRadius(vertices: readonly Vector3Tuple[]): Vector3Tuple[] {
  const radius = Math.max(...vertices.map(length))
  return vertices.map((vertex) => [vertex[0] / radius, vertex[1] / radius, vertex[2] / radius])
}

export function buildConvexFaces(vertices: readonly Vector3Tuple[]): number[][] {
  const faceMap = new Map<string, { indices: number[]; normal: Vector3Tuple }>()

  for (let first = 0; first < vertices.length - 2; first += 1) {
    for (let second = first + 1; second < vertices.length - 1; second += 1) {
      for (let third = second + 1; third < vertices.length; third += 1) {
        const origin = vertices[first]
        const b = vertices[second]
        const c = vertices[third]
        if (!origin || !b || !c) continue

        let normal = normalize(cross(subtract(b, origin), subtract(c, origin)))
        if (length(normal) < EPSILON) continue
        const distances = vertices.map((vertex) => dot(normal, subtract(vertex, origin)))
        const hasPositive = distances.some((distance) => distance > EPSILON)
        const hasNegative = distances.some((distance) => distance < -EPSILON)
        if (hasPositive && hasNegative) continue

        if (dot(normal, [-origin[0], -origin[1], -origin[2]]) > 0) {
          normal = [-normal[0], -normal[1], -normal[2]]
        }
        const indices = distances.flatMap((distance, index) => Math.abs(distance) <= EPSILON ? [index] : [])
        const key = [...indices].sort((a, bIndex) => a - bIndex).join(',')
        if (indices.length >= 3 && !faceMap.has(key)) faceMap.set(key, { indices, normal })
      }
    }
  }

  return [...faceMap.values()].map(({ indices, normal }) => {
    const points = indices.map((index) => vertices[index]).filter((point): point is Vector3Tuple => Boolean(point))
    const center = average(points)
    const firstPoint = points[0]
    if (!firstPoint) return indices
    const axisU = normalize(subtract(firstPoint, center))
    const axisV = normalize(cross(normal, axisU))
    const ordered = [...indices].sort((left, right) => {
      const leftPoint = vertices[left]
      const rightPoint = vertices[right]
      if (!leftPoint || !rightPoint) return 0
      const leftVector = subtract(leftPoint, center)
      const rightVector = subtract(rightPoint, center)
      return Math.atan2(dot(leftVector, axisV), dot(leftVector, axisU))
        - Math.atan2(dot(rightVector, axisV), dot(rightVector, axisU))
    })
    const a = vertices[ordered[0] ?? 0]
    const b = vertices[ordered[1] ?? 0]
    const c = vertices[ordered[2] ?? 0]
    if (a && b && c && dot(cross(subtract(b, a), subtract(c, a)), normal) < 0) ordered.reverse()
    return ordered
  })
}

function getFaceNormal(vertices: readonly Vector3Tuple[], face: readonly number[]): Vector3Tuple {
  const a = vertices[face[0] ?? 0]
  const b = vertices[face[1] ?? 0]
  const c = vertices[face[2] ?? 0]
  if (!a || !b || !c) return [0, 1, 0]
  let normal = normalize(cross(subtract(b, a), subtract(c, a)))
  const center = average(face.map((index) => vertices[index]).filter((point): point is Vector3Tuple => Boolean(point)))
  if (dot(normal, center) < 0) normal = [-normal[0], -normal[1], -normal[2]]
  return normal
}

function pairOppositeValues(directions: readonly Vector3Tuple[], sides: number): number[] {
  const values = Array<number>(directions.length).fill(0)
  const used = new Set<number>()
  let lowValue = sides === 10 ? 0 : 1

  for (let index = 0; index < directions.length; index += 1) {
    if (used.has(index)) continue
    let opposite = -1
    let minimumDot = Number.POSITIVE_INFINITY
    for (let candidate = 0; candidate < directions.length; candidate += 1) {
      if (candidate === index || used.has(candidate)) continue
      const score = dot(directions[index] ?? [0, 1, 0], directions[candidate] ?? [0, -1, 0])
      if (score < minimumDot) {
        minimumDot = score
        opposite = candidate
      }
    }
    if (opposite < 0) continue
    values[index] = lowValue
    values[opposite] = sides === 10 ? lowValue + 5 : sides + 1 - lowValue
    used.add(index)
    used.add(opposite)
    lowValue += 1
  }
  return values
}

function createDefinition(
  type: PhysicalDieType,
  rawVertices: readonly Vector3Tuple[],
  radius: number,
): DieDefinition {
  const vertices = scaleToRadius(rawVertices)
  const faces = buildConvexFaces(vertices)
  const resultDirections = type === 'd4'
    ? vertices.map(normalize)
    : faces.map((face) => getFaceNormal(vertices, face))
  const sides = Number(type.slice(1))
  const valuesByDirection = type === 'd4'
    ? resultDirections.map((_, index) => index + 1)
    : pairOppositeValues(resultDirections, sides)
  return { type, vertices, faces, resultDirections, valuesByDirection, radius }
}

function makeD10Vertices(): Vector3Tuple[] {
  const ringHeight = (1 - Math.cos(Math.PI / 5)) / (1 + Math.cos(Math.PI / 5))
  const vertices: Vector3Tuple[] = [[0, 1, 0], [0, -1, 0]]
  for (let index = 0; index < 10; index += 1) {
    const angle = index * Math.PI / 5
    vertices.push([Math.cos(angle), index % 2 === 0 ? ringHeight : -ringHeight, Math.sin(angle)])
  }
  return vertices
}

const tetrahedron: Vector3Tuple[] = [
  [1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1],
]

const cube: Vector3Tuple[] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
]

const octahedron: Vector3Tuple[] = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
]

const dodecahedron: Vector3Tuple[] = [
  [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1],
  [1, -1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1],
  [0, -1 / PHI, -PHI], [0, -1 / PHI, PHI], [0, 1 / PHI, -PHI], [0, 1 / PHI, PHI],
  [-1 / PHI, -PHI, 0], [-1 / PHI, PHI, 0], [1 / PHI, -PHI, 0], [1 / PHI, PHI, 0],
  [-PHI, 0, -1 / PHI], [PHI, 0, -1 / PHI], [-PHI, 0, 1 / PHI], [PHI, 0, 1 / PHI],
]

const icosahedron: Vector3Tuple[] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
]

export const DIE_DEFINITIONS: Readonly<Record<PhysicalDieType, DieDefinition>> = {
  d4: createDefinition('d4', tetrahedron, 0.78),
  d6: createDefinition('d6', cube, 0.72),
  d8: createDefinition('d8', octahedron, 0.82),
  d10: createDefinition('d10', makeD10Vertices(), 0.86),
  d12: createDefinition('d12', dodecahedron, 0.9),
  d20: createDefinition('d20', icosahedron, 0.94),
}

