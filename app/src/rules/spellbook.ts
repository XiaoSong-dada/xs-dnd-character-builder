import { rulesRepository } from '@/rules/repository'
import { getAvailableSpells, getSpellcastingConfig } from '@/rules/spellcasting'
import type { CharacterDraft, SpellSelections } from '@/types/character'
import type { SpellcastingConfig, SpellRule } from '@/types/rules'

/** 抄录法术进法术书：每个环级消耗的金币（2014 规则）。 */
export const TRANSCRIBE_COST_PER_LEVEL = 50

/** 抄录法术进法术书：每个环级消耗的小时数（仅提示用，不持久化）。 */
export const TRANSCRIBE_HOURS_PER_LEVEL = 2

/** 单个法术的抄录费用 = 环级 × 50 GP。 */
export function getTranscribeCost(spellLevel: number): number {
  return spellLevel * TRANSCRIBE_COST_PER_LEVEL
}

/** 多个法术的抄录费用合计（按法术环级实时推导，未知法术不计费）。 */
export function getTranscribeTotalCost(spellIds: readonly string[]): number {
  return spellIds.reduce((sum, id) => {
    const spell = rulesRepository.getSpell(id)
    return sum + (spell ? getTranscribeCost(spell.level) : 0)
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
export function applyTranscription(draft: CharacterDraft, spellIds: readonly string[]): TranscriptionResult {
  const config = getSpellcastingConfig(draft)
  const candidateIds = config
    ? new Set(getTranscribeCandidates(draft, config).map((spell) => spell.id))
    : new Set<string>()
  const valid = [...new Set(spellIds)].filter((id) => candidateIds.has(id))
  const cost = getTranscribeTotalCost(valid)
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
