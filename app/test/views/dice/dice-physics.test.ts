import { describe, expect, it } from 'vitest'

import { simulateDiceRoll } from '@/views/dice/engine/dice-physics'

describe('dice physics simulation', () => {
  it('produces a reproducible settled trajectory for a fixed request', () => {
    const request = {
      id: 'fixed-roll',
      seed: 123456,
      dice: [{ id: 'd20-1', logicalId: 'd20-1', type: 'd20' as const, resultKind: 'standard' as const, targetValue: 17 }],
    }
    const first = simulateDiceRoll(request)
    const second = simulateDiceRoll(request)

    expect(first.type === 'failure' ? first.reason : first.type).toBe('success')
    expect(second.type === 'failure' ? second.reason : second.type).toBe('success')
    if (first.type !== 'success' || second.type !== 'success') return
    expect(first.trajectory.frameCount).toBe(second.trajectory.frameCount)
    expect(first.trajectory.landingDirectionIndices).toEqual(second.trajectory.landingDirectionIndices)
    expect([...first.trajectory.transforms.slice(-7)]).toEqual([...second.trajectory.transforms.slice(-7)])
  })
})
