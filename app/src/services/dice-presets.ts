import { DIE_TYPES, MAX_PHYSICAL_DICE, getPhysicalDiceCount } from '@/rules/dice'
import type { DicePoolEntry, DicePoolPreset } from '@/types/dice'

export const DICE_PRESET_STORAGE_KEY = 'dnd-character-builder:dice-presets:v1'

/** 当前浏览器最多保留的骰池预设数量，避免预设列表无限增长撑破页面。 */
export const MAX_DICE_PRESETS = 20

interface PersistedDicePresets {
  readonly presets: unknown
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 骰池读写归一化：同一骰型只保留一项、按固定骰型顺序排列、数量与物理骰上限按
 * `rules/dice` 的口径校验；任何一项非法都判定整份骰池无效，避免半份预设被应用。
 */
export function normalizeDicePool(value: unknown): DicePoolEntry[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  const quantities = new Map<string, number>()
  for (const entry of value) {
    if (!isRecord(entry)) return undefined
    const { type, quantity } = entry
    if (typeof type !== 'string' || !DIE_TYPES.includes(type as DicePoolEntry['type'])) return undefined
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_PHYSICAL_DICE) return undefined
    if (quantities.has(type)) return undefined
    quantities.set(type, quantity)
  }
  const pool = DIE_TYPES.flatMap((type) => {
    const quantity = quantities.get(type)
    return quantity ? [{ type, quantity }] : []
  })
  if (getPhysicalDiceCount(pool) > MAX_PHYSICAL_DICE) return undefined
  return pool
}

export function normalizeDicePreset(value: unknown): DicePoolPreset | undefined {
  if (!isRecord(value)) return undefined
  const { id, pool, modifier, createdAt } = value
  if (typeof id !== 'string' || !id.trim() || id.length > 64) return undefined
  if (typeof modifier !== 'number' || !Number.isSafeInteger(modifier)) return undefined
  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt)) return undefined
  const normalizedPool = normalizeDicePool(pool)
  if (!normalizedPool) return undefined
  return { id, pool: normalizedPool, modifier, createdAt }
}

export function isSameDicePoolPreset(left: DicePoolPreset, right: DicePoolPreset): boolean {
  return left.modifier === right.modifier
    && left.pool.length === right.pool.length
    && left.pool.every((entry, index) => entry.type === right.pool[index]?.type && entry.quantity === right.pool[index]?.quantity)
}

export function createDicePoolPreset(
  pool: readonly DicePoolEntry[],
  modifier: number,
  options: { id?: string; createdAt?: number } = {},
): DicePoolPreset | undefined {
  const normalizedPool = normalizeDicePool(pool)
  if (!normalizedPool || !Number.isSafeInteger(modifier)) return undefined
  return {
    id: options.id ?? createDicePresetId(),
    pool: normalizedPool,
    modifier,
    createdAt: options.createdAt ?? Date.now(),
  }
}

function createDicePresetId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * 骰池预设只保存骰型、数量与固定修正值，不保存投掷结果；数据损坏或版本不符时
 * 按空列表处理，不阻断骰娘页面使用。
 */
export const DicePresetStorageService = {
  loadDicePresets(): DicePoolPreset[] {
    if (!hasLocalStorage()) return []
    try {
      const raw = window.localStorage.getItem(DICE_PRESET_STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as Partial<PersistedDicePresets> | undefined
      if (!parsed || !Array.isArray(parsed.presets)) return []
      const presets: DicePoolPreset[] = []
      const ids = new Set<string>()
      for (const value of parsed.presets) {
        const preset = normalizeDicePreset(value)
        if (!preset || ids.has(preset.id)) continue
        ids.add(preset.id)
        presets.push(preset)
        if (presets.length >= MAX_DICE_PRESETS) break
      }
      return presets
    } catch {
      return []
    }
  },

  saveDicePresets(presets: readonly DicePoolPreset[]): boolean {
    if (!hasLocalStorage()) return false
    try {
      const payload = { presets: presets.slice(0, MAX_DICE_PRESETS) }
      window.localStorage.setItem(DICE_PRESET_STORAGE_KEY, JSON.stringify(payload))
      return true
    } catch {
      return false
    }
  },
}
