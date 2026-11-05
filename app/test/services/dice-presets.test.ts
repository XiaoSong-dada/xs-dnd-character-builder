import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DICE_PRESET_STORAGE_KEY,
  DicePresetStorageService,
  MAX_DICE_PRESETS,
  createDicePoolPreset,
  isSameDicePoolPreset,
  normalizeDicePool,
  normalizeDicePreset,
} from '@/services/dice-presets'

function storedPreset(id: string, modifier = 0) {
  return { id, pool: [{ type: 'd20', quantity: 1 }], modifier, createdAt: 1 }
}

describe('dice pool preset normalization', () => {
  it('按固定骰型顺序归一化骰池并保留数量', () => {
    expect(normalizeDicePool([
      { type: 'd6', quantity: 2 },
      { type: 'd20', quantity: 1 },
    ])).toEqual([
      { type: 'd6', quantity: 2 },
      { type: 'd20', quantity: 1 },
    ])
  })

  it('拒绝空骰池、重复骰型、非正整数数量、未知骰型与超过物理骰上限的组合', () => {
    expect(normalizeDicePool([])).toBeUndefined()
    expect(normalizeDicePool([{ type: 'd20', quantity: 1 }, { type: 'd20', quantity: 1 }])).toBeUndefined()
    expect(normalizeDicePool([{ type: 'd20', quantity: 0 }])).toBeUndefined()
    expect(normalizeDicePool([{ type: 'd20', quantity: 1.5 }])).toBeUndefined()
    expect(normalizeDicePool([{ type: 'd3', quantity: 1 }])).toBeUndefined()
    expect(normalizeDicePool([{ type: 'd100', quantity: 11 }])).toBeUndefined()
  })

  it('拒绝缺少字段或字段类型错误的预设', () => {
    expect(normalizeDicePreset({ ...storedPreset('a'), id: '' })).toBeUndefined()
    expect(normalizeDicePreset({ ...storedPreset('a'), modifier: 1.2 })).toBeUndefined()
    expect(normalizeDicePreset({ ...storedPreset('a'), createdAt: Number.NaN })).toBeUndefined()
    expect(normalizeDicePreset({ ...storedPreset('a'), pool: [] })).toBeUndefined()
    expect(normalizeDicePreset('broken')).toBeUndefined()
  })

  it('创建预设时复制骰池并保留修正值', () => {
    const pool = [{ type: 'd20' as const, quantity: 1 }, { type: 'd6' as const, quantity: 2 }]
    const preset = createDicePoolPreset(pool, 3, { id: 'fixed', createdAt: 42 })
    expect(preset).toEqual({
      id: 'fixed',
      pool: [{ type: 'd6', quantity: 2 }, { type: 'd20', quantity: 1 }],
      modifier: 3,
      createdAt: 42,
    })
    pool[0]!.quantity = 5
    expect(preset?.pool.find((entry) => entry.type === 'd20')?.quantity).toBe(1)
  })

  it('比较预设是否属于同一投掷式', () => {
    const base = createDicePoolPreset([{ type: 'd20', quantity: 1 }], 5, { id: 'a', createdAt: 1 })
    const same = createDicePoolPreset([{ type: 'd20', quantity: 1 }], 5, { id: 'b', createdAt: 2 })
    const otherModifier = createDicePoolPreset([{ type: 'd20', quantity: 1 }], 4, { id: 'c', createdAt: 3 })
    expect(base && same && isSameDicePoolPreset(base, same)).toBe(true)
    expect(base && otherModifier && isSameDicePoolPreset(base, otherModifier)).toBe(false)
  })
})

describe('DicePresetStorageService', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('无记录或损坏记录时返回空列表', () => {
    expect(DicePresetStorageService.loadDicePresets()).toEqual([])
    localStorage.setItem(DICE_PRESET_STORAGE_KEY, '{broken')
    expect(DicePresetStorageService.loadDicePresets()).toEqual([])
    localStorage.setItem(DICE_PRESET_STORAGE_KEY, JSON.stringify({ presets: 'nope' }))
    expect(DicePresetStorageService.loadDicePresets()).toEqual([])
  })

  it('保存后可完整读回，并过滤损坏条目与重复 id', () => {
    const presets = [
      createDicePoolPreset([{ type: 'd20', quantity: 1 }], 5, { id: 'a', createdAt: 1 }),
      createDicePoolPreset([{ type: 'd6', quantity: 3 }], -2, { id: 'b', createdAt: 2 }),
    ].filter((preset): preset is NonNullable<typeof preset> => Boolean(preset))
    expect(DicePresetStorageService.saveDicePresets(presets)).toBe(true)
    localStorage.setItem(DICE_PRESET_STORAGE_KEY, JSON.stringify({
      presets: [...presets, { id: 'broken' }, { ...storedPreset('a'), modifier: 1.2 }],
    }))
    expect(DicePresetStorageService.loadDicePresets()).toEqual(presets)
  })

  it('最多只读回预设上限数量的条目', () => {
    const presets = Array.from({ length: MAX_DICE_PRESETS + 3 }, (_, index) => storedPreset(`preset-${index}`))
    localStorage.setItem(DICE_PRESET_STORAGE_KEY, JSON.stringify({ presets }))
    expect(DicePresetStorageService.loadDicePresets()).toHaveLength(MAX_DICE_PRESETS)
  })

  it('存储读写异常时安全降级', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => { throw new Error('denied') })
    expect(DicePresetStorageService.loadDicePresets()).toEqual([])
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => { throw new Error('denied') })
    expect(DicePresetStorageService.saveDicePresets([])).toBe(false)
  })
})
