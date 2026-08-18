import { Matrix4, Quaternion, Vector3 } from 'three'

import type { DieDefinition } from '@/views/dice/engine/dice-definitions'

const MATCH_THRESHOLD = 0.999

function toVector(direction: readonly [number, number, number]): Vector3 {
  return new Vector3(...direction).normalize()
}

function createBasis(primary: Vector3, secondary: Vector3): Matrix4 | undefined {
  const xAxis = primary.clone().normalize()
  const yAxis = secondary.clone().addScaledVector(xAxis, -secondary.dot(xAxis))
  if (yAxis.lengthSq() < 1e-8) return undefined
  yAxis.normalize()
  const zAxis = new Vector3().crossVectors(xAxis, yAxis).normalize()
  return new Matrix4().makeBasis(xAxis, yAxis, zAxis)
}

function isShapeSymmetry(rotation: Matrix4, directions: readonly Vector3[]): boolean {
  const matched = new Set<number>()
  for (const direction of directions) {
    const transformed = direction.clone().applyMatrix4(rotation).normalize()
    let bestIndex = -1
    let bestDot = -1
    directions.forEach((candidate, index) => {
      const score = transformed.dot(candidate)
      if (score > bestDot) { bestDot = score; bestIndex = index }
    })
    if (bestDot < MATCH_THRESHOLD || matched.has(bestIndex)) return false
    matched.add(bestIndex)
  }
  return true
}

export function findLabelOffsetQuaternion(
  definition: DieDefinition,
  targetValue: number,
  landingDirectionIndex: number,
): Quaternion {
  const sourceIndex = definition.valuesByDirection.indexOf(targetValue)
  if (sourceIndex < 0 || !definition.resultDirections[landingDirectionIndex]) return new Quaternion()
  if (sourceIndex === landingDirectionIndex) return new Quaternion()

  const directions = definition.resultDirections.map(toVector)
  const sourcePrimary = directions[sourceIndex]
  const targetPrimary = directions[landingDirectionIndex]
  if (!sourcePrimary || !targetPrimary) return new Quaternion()

  for (let sourceSecondaryIndex = 0; sourceSecondaryIndex < directions.length; sourceSecondaryIndex += 1) {
    const sourceSecondary = directions[sourceSecondaryIndex]
    if (!sourceSecondary || sourceSecondaryIndex === sourceIndex || Math.abs(sourcePrimary.dot(sourceSecondary)) > 0.999) continue
    const sourceBasis = createBasis(sourcePrimary, sourceSecondary)
    if (!sourceBasis) continue

    for (let targetSecondaryIndex = 0; targetSecondaryIndex < directions.length; targetSecondaryIndex += 1) {
      const targetSecondary = directions[targetSecondaryIndex]
      if (!targetSecondary || targetSecondaryIndex === landingDirectionIndex) continue
      if (Math.abs(sourcePrimary.dot(sourceSecondary) - targetPrimary.dot(targetSecondary)) > 1e-4) continue
      const targetBasis = createBasis(targetPrimary, targetSecondary)
      if (!targetBasis) continue
      const rotation = targetBasis.clone().multiply(sourceBasis.clone().transpose())
      if (isShapeSymmetry(rotation, directions)) return new Quaternion().setFromRotationMatrix(rotation).normalize()
    }
  }

  return new Quaternion()
}

