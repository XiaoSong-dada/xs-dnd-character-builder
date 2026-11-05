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

it('keeps unpicked dice pinned while one die rerolls', () => {
  const request = {
    id: 'single-reroll',
    seed: 86420,
    dice: [
      {
        id: 'a', logicalId: 'a', type: 'd20' as const, resultKind: 'standard' as const, targetValue: 12,
        staticPose: { position: [-3, 0.94, 0] as const, quaternion: [0, 0, 0, 1] as const, landingDirectionIndex: 0 },
      },
      { id: 'b', logicalId: 'b', type: 'd6' as const, resultKind: 'standard' as const, targetValue: 4 },
      {
        id: 'c', logicalId: 'c', type: 'd6' as const, resultKind: 'standard' as const, targetValue: 2,
        staticPose: { position: [3, 0.72, 0.5] as const, quaternion: [0, 0, 0, 1] as const, landingDirectionIndex: 1 },
      },
    ],
  }
  const result = simulateDiceRoll(request)
  expect(result.type === 'failure' ? result.reason : result.type).toBe('success')
  if (result.type !== 'success') return

  const { trajectory } = result
  expect(trajectory.diceIds).toEqual(['a', 'b', 'c'])
  expect(trajectory.landingDirectionIndices).toEqual([0, expect.any(Number), 1])
  const diceCount = 3
  const frameCount = trajectory.frameCount
  expect(trajectory.transforms).toHaveLength(frameCount * diceCount * 7)
  const padded = (dieIndex: number) => (frameCount - 1) * diceCount * 7 + dieIndex * 7
  expect([...trajectory.transforms.slice(padded(0), padded(0) + 7)]).toEqual([...trajectory.transforms.slice(0, 7)])
  expect([...trajectory.transforms.slice(padded(2), padded(2) + 7)]).toEqual([...trajectory.transforms.slice(14, 21)])
  expect([...trajectory.transforms.slice(padded(1), padded(1) + 7)])
    .not.toEqual([...trajectory.transforms.slice(7, 14)])
  expect(frameCount).toBeLessThanOrEqual(8 * 60)
})
