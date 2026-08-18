import { describe, expect, it } from 'vitest'

import { DIE_DEFINITIONS } from '@/views/dice/engine/dice-definitions'

describe('dice polyhedron definitions', () => {
  it.each([
    ['d4', 4, 4],
    ['d6', 6, 6],
    ['d8', 8, 8],
    ['d10', 10, 10],
    ['d12', 12, 12],
    ['d20', 20, 20],
  ] as const)('%s has the expected faces and result directions', (type, faces, directions) => {
    const definition = DIE_DEFINITIONS[type]
    expect(definition.faces).toHaveLength(faces)
    expect(definition.resultDirections).toHaveLength(directions)
    expect(new Set(definition.valuesByDirection).size).toBe(directions)
    expect(definition.faces.every((face) => face.length >= 3)).toBe(true)
  })

  it('keeps opposite d6 faces complementary', () => {
    const definition = DIE_DEFINITIONS.d6
    for (let index = 0; index < definition.resultDirections.length; index += 1) {
      const direction = definition.resultDirections[index]
      if (!direction) continue
      let opposite = 0
      let lowest = Number.POSITIVE_INFINITY
      definition.resultDirections.forEach((candidate, candidateIndex) => {
        const score = direction[0] * candidate[0] + direction[1] * candidate[1] + direction[2] * candidate[2]
        if (score < lowest) { lowest = score; opposite = candidateIndex }
      })
      expect((definition.valuesByDirection[index] ?? 0) + (definition.valuesByDirection[opposite] ?? 0)).toBe(7)
    }
  })
})

