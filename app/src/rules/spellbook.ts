import { getRulesRepository } from '@/rules/repositories'
import { getAvailableSpells, getSpellcastingConfig } from '@/rules/spellcasting'
import type { CharacterDraft, RulesetId, SpellSelections } from '@/types/character'
import type { SpellcastingConfig, SpellRule } from '@/types/rules'

/** 抄录方式：外部发现法术（默认）或自己的法术书间复制（2024 法师）。 */
export type TranscribeMode = 'external' | 'own-book'

/** 2014 外部抄录费率（保持兼容导出）。 */
export const TRANSCRIBE_COST_PER_LEVEL = 50
export const TRANSCRIBE_HOURS_PER_LEVEL = 2

interface TranscribeRate {
  readonly costPerLevel: number
  readonly hoursPerLevel: number
}

const RATES: Readonly<Record<RulesetId, Readonly<Record<TranscribeMode, TranscribeRate>>>> = {
  '5e-2014': {
    external: { costPerLevel: 50, hoursPerLevel: 2 },
    'own-book': { costPerLevel: 50, hoursPerLevel: 2 },
  },
  '5e-2024': {
    external: { costPerLevel: 50, hoursPerLevel: 2 },
    'own-book': { costPerLevel: 10, hoursPerLevel: 1 },
  },
}

export function getTranscribeRate(ruleset: RulesetId, mode: TranscribeMode = 'external'): TranscribeRate {
  return RATES[ruleset][mode]
}

/** 单个法术的抄录费用 = 环级 × 每环费率。 */
export function getTranscribeCost(spellLevel: number, mode: TranscribeMode = 'external', ruleset: RulesetId = '5e-2014'): number {
  return spellLevel * getTranscribeRate(ruleset, mode).costPerLevel
}

/** 单个法术的抄录耗时。 */
export function getTranscribeHours(spellLevel: number, mode: TranscribeMode = 'external', ruleset: RulesetId = '5e-2014'): number {
  return spellLevel * getTranscribeRate(ruleset, mode).hoursPerLevel
}

/** 多个法术的抄录费用合计（按法术环级实时推导，未知法术不计费）。 */
export function getTranscribeTotalCost(
  spellIds: readonly string[],
  mode: TranscribeMode = 'external',
  ruleset: RulesetId = '5e-2014',
): number {
  const repository = getRulesRepository(ruleset)
  return spellIds.reduce((sum, id) => {
    const spell = repository.getSpell(id)
    return sum + (spell ? getTranscribeCost(spell.level, mode, ruleset) : 0)
  }, 0)
}

/**
 * 抄录候选池：职业法术池中「环级 ≥ 1、≤ 当前最高可施放环、尚未写入法术书」的法术。
 * 与升级扩充同池；戏法不可抄录；已入书（含已抄录）不重复出现。
 */
export function getTranscribeCandidates(draft: CharacterDraft, config: SpellcastingConfig): readonly SpellRule[] {
  const book = draft.spellSelections.spellbookSpellIds
  return getAvailableSpells(draft, config)
    .filter((spell) => spell.level > 0 && !book.includes(spell.id))
}

export interface TranscribeAffordability {
  readonly ok: boolean
  /** 不可行时的中文原因（供界面直接展示）。 */
  readonly reason?: string
}

/** 金币校验：持有总额 = 起始金币 + 冒险净增，必须 ≥ 总费用。 */
export function canAffordTranscription(draft: CharacterDraft, totalCost: number): TranscribeAffordability {
  const total = draft.currency.gp + draft.adventureGold
  if (total < totalCost) {
    return { ok: false, reason: `金币不足：抄录需要 ${totalCost} GP，当前持有 ${total} GP` }
  }
  return { ok: true }
}

export interface TranscriptionResult {
  readonly spellSelections: SpellSelections
  /** 扣减后的冒险净增金币（adventureGold − cost）。 */
  readonly adventureGold: number
  readonly cost: number
}

/**
 * 应用抄录：把候选池内的法术写入法术书并记录转录来源，返回扣款后的新状态。
 * 纯函数，不修改入参；不在候选池内的 ID 被忽略（幂等安全）；已入书/已转录的 ID 去重。
 */
export function applyTranscription(
  draft: CharacterDraft,
  spellIds: readonly string[],
  mode: TranscribeMode = 'external',
): TranscriptionResult {
  const config = getSpellcastingConfig(draft)
  const candidateIds = config
    ? new Set(getTranscribeCandidates(draft, config).map((spell) => spell.id))
    : new Set<string>()
  const valid = [...new Set(spellIds)].filter((id) => candidateIds.has(id))
  const cost = getTranscribeTotalCost(valid, mode, draft.ruleset)
  const book = draft.spellSelections.spellbookSpellIds
  const transcribed = draft.spellSelections.transcribedSpellIds
  const added = valid.filter((id) => !book.includes(id))
  return {
    spellSelections: {
      ...draft.spellSelections,
      spellbookSpellIds: [...book, ...added],
      transcribedSpellIds: [...transcribed, ...added],
    },
    adventureGold: draft.adventureGold - cost,
    cost,
  }
}
