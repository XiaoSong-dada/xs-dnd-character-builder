import { isRulesetId, isRulesetOpen } from '@/rules/repositories'
import type { RulesetId } from '@/types/character'

const STORAGE_KEY = 'dnd-character-builder:ruleset-preference:v1'

interface PersistedRulesetPreference {
  readonly ruleset: string
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

/**
 * 本设备版本偏好：只记录用户在第一页的明确选择（B00-02），
 * 不因打开或保存某个版本的草稿而改写；读取失败或数据损坏时按缺省处理。
 */
export const RulesetPreferenceService = {
  loadPreferredRuleset(): RulesetId | undefined {
    if (!hasLocalStorage()) return undefined
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return undefined
      const parsed = JSON.parse(raw) as Partial<PersistedRulesetPreference>
      return typeof parsed.ruleset === 'string' && isRulesetId(parsed.ruleset) ? parsed.ruleset : undefined
    } catch {
      return undefined
    }
  },

  savePreferredRuleset(ruleset: RulesetId): boolean {
    if (!hasLocalStorage() || !isRulesetId(ruleset)) return false
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ruleset } satisfies PersistedRulesetPreference))
      return true
    } catch {
      return false
    }
  },
}

export const RULESET_PREFERENCE_STORAGE_KEY = STORAGE_KEY

export interface InitialRulesetResolution {
  /** 实际用于新建的版本。 */
  readonly ruleset: RulesetId
  /** 记忆版本尚未开放而回退时为 true。 */
  readonly fellBack: boolean
  /** 上次明确选择的版本；从未选择时为 undefined。 */
  readonly preferred?: RulesetId
}

/**
 * 新建草稿的版本解析（B00-02）：优先记忆版本且已开放；未记忆时默认 2014；
 * 记忆版本未开放时回退 2014 并由调用方给出说明（不转换已有角色）。
 */
export function resolveInitialRuleset(options?: {
  readonly preferred?: RulesetId
  readonly isOpen?: (value: unknown) => boolean
}): InitialRulesetResolution {
  const preferred = options?.preferred ?? RulesetPreferenceService.loadPreferredRuleset()
  const isOpen = options?.isOpen ?? isRulesetOpen
  if (!preferred) return { ruleset: '5e-2014', fellBack: false }
  if (isOpen(preferred)) return { ruleset: preferred, fellBack: false, preferred }
  return { ruleset: '5e-2014', fellBack: true, preferred }
}
