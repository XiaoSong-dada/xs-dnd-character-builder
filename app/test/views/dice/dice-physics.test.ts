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

  it.each([
    ['20d6', Array.from({ length: 20 }, (_, index) => ({
      id: `d6-${index}`,
      logicalId: `d6-${index}`,
      type: 'd6' as const,
      resultKind: 'standard' as const,
      targetValue: index % 6 + 1,
    }))],
    ['10d100', Array.from({ length: 20 }, (_, index) => ({
      id: `d100-${index}`,
      logicalId: `d100-${Math.floor(index / 2)}`,
      type: 'd10' as const,
      resultKind: index % 2 === 0 ? 'percentile-tens' as const : 'percentile-ones' as const,
      targetValue: index % 10,
    }))],
  ])('settles a full %s tray with the regression seed', (_, dice) => {
    const result = simulateDiceRoll({ id: 'full-tray', seed: 24680, dice })
    expect(result.type === 'failure' ? result.reason : result.type).toBe('success')
    if (result.type !== 'success') return
    expect(result.trajectory.diceIds).toHaveLength(20)
    expect(result.trajectory.frameCount).toBeLessThanOrEqual(8 * 60)
  })
})
