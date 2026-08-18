import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'

import { DIE_DEFINITIONS } from '@/views/dice/engine/dice-definitions'
import { findLabelOffsetQuaternion } from '@/views/dice/engine/dice-symmetry'

describe('dice label symmetry mapping', () => {
  for (const definition of Object.values(DIE_DEFINITIONS)) {
    it(`maps every ${definition.type} value to every possible landing direction`, () => {
      definition.valuesByDirection.forEach((value) => {
        const sourceIndex = definition.valuesByDirection.indexOf(value)
        const source = definition.resultDirections[sourceIndex]
        if (!source) throw new Error('missing source direction')
        definition.resultDirections.forEach((landing, landingIndex) => {
          const quaternion = findLabelOffsetQuaternion(definition, value, landingIndex)
          const mapped = new Vector3(...source).applyQuaternion(quaternion).normalize()
          expect(mapped.dot(new Vector3(...landing).normalize())).toBeGreaterThan(0.999)
        })
      })
    })
  }
})
