import { describe, expect, it } from 'vitest'

import { randomIntegerInclusive } from '@/services/dice-random'

describe('dice secure random integer', () => {
  it('includes both ends of the requested range', () => {
    expect(randomIntegerInclusive(1, 20, () => 0)).toBe(1)
    expect(randomIntegerInclusive(1, 20, () => 19)).toBe(20)
  })

  it('rejects the biased uint32 tail before mapping', () => {
    const values = [0xffff_ffff, 99]
    expect(randomIntegerInclusive(1, 100, () => values.shift() ?? 0)).toBe(100)
    expect(values).toHaveLength(0)
  })

  it('rejects invalid ranges', () => {
    expect(() => randomIntegerInclusive(20, 1, () => 0)).toThrow('随机整数范围无效')
  })
})
