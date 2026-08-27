import { abilityModifier, deriveAbilities } from '@/rules/derive'
import { normalizeManualEdits } from '@/rules/manual-edits'
import { rulesRepository } from '@/rules/repository'
import { isSourceEnabled } from '@/rules/source-books'
import type { CharacterDraft } from '@/types/character'
import type { ChoiceCheckpoint, SpellcastingConfig } from '@/types/rules'

function abilityScoreAfterOrigin(draft: CharacterDraft, ability: SpellcastingConfig['ability']): number {
  return deriveAbilities(draft)[ability] + (normalizeManualEdits(draft.manualEdits).abilityAdjustments[ability] ?? 0)
}

export function getMaximumSpellLevel(config: SpellcastingConfig, classLevel: number): number {
  return config.maxSpellLevelByClassLevel[Math.max(0, classLevel - 1)] ?? 0
}

/** 单个环位的法术位信息；pact 模式下 count 为契约法术位数量、level 为契约环级。 */
export interface SpellSlotInfo {
  readonly level: number
  readonly count: number
  /** 是否为契约法术位（短休恢复）；仅邪术师（pact 模式）为 true。 */
  readonly pact?: boolean
}

/** 当前职业等级的法术位明细（派生展示数据，不持久化）；越界等级或未挂表时返回空数组。 */
export function getSpellSlots(config: SpellcastingConfig, classLevel: number): readonly SpellSlotInfo[] {
  if (classLevel < 1 || classLevel > 20) return []
  if (config.mode === 'pact') {
    const pact = config.pactSlotsByClassLevel?.[classLevel - 1]
    return pact ? [{ level: pact[1], count: pact[0], pact: true }] : []
  }
  const slots = config.slotsByClassLevel?.[classLevel - 1]
  if (!slots) return []
  return slots
    .map((count, index) => ({ level: index + 1, count }))
    .filter((slot) => slot.count > 0)
}

/** 角色最终法术位：职业表加人工环位差值；无施法职业也可通过人工调整获得环位。 */
export function getEffectiveSpellSlots(draft: CharacterDraft): readonly SpellSlotInfo[] {
  const config = getSpellcastingConfig(draft)
  const base = config ? getSpellSlots(config, draft.targetLevel) : []
  const baseByLevel = new Map(base.map((slot) => [slot.level, slot]))
  const adjustments = normalizeManualEdits(draft.manualEdits).spellSlotAdjustments
  return Array.from({ length: 9 }, (_, index) => index + 1).flatMap((level) => {
    const system = baseByLevel.get(level)
    const count = (system?.count ?? 0) + (adjustments[level] ?? 0)
    return count > 0 ? [{ level, count, ...(system?.pact ? { pact: true } : {}) }] : []
  })
}

/** 页面、跑团与导出共用：正常已选法术与人工添加法术按 ID 去重。 */
export function getEffectiveSelectedSpellIds(draft: CharacterDraft): readonly string[] {
  const config = getSpellcastingConfig(draft)
  const normal = config ? getSelectedSpellIds(draft, config) : []
  const manual = normalizeManualEdits(draft.manualEdits).addedSpells
    .filter((item) => {
      const level = rulesRepository.getSpell(item.spellId)?.level
      return level === 0
        || item.prepared
        || item.destination === 'known'
        || item.destination === 'pact-known'
        || item.destination === 'granted'
    })
    .map((item) => item.spellId)
  return [...new Set([...draft.spellSelections.cantripIds, ...normal, ...manual])]
}

/** 人工加入准备列表/法术书、但尚未准备的有环法术。 */
export function getUnpreparedManualSpellIds(draft: CharacterDraft): readonly string[] {
  return normalizeManualEdits(draft.manualEdits).addedSpells
    .filter((item) => !item.prepared && (item.destination === 'prepared-list' || item.destination === 'spellbook'))
    .filter((item) => (rulesRepository.getSpell(item.spellId)?.level ?? 0) > 0)
    .map((item) => item.spellId)
}

export function getRequiredSpellCount(draft: CharacterDraft, config: SpellcastingConfig): number {
  if (draft.targetLevel < config.startsAtLevel) return 0
  if (config.mode === 'known' || config.mode === 'pact') return config.spellsKnownByLevel?.[draft.targetLevel - 1] ?? 0
  if (config.preparedFormula === 'ability-plus-half-level') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + Math.floor(draft.targetLevel / 2))
  }
  if (config.preparedFormula === 'ability-plus-half-level-ceil') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + Math.ceil(draft.targetLevel / 2))
  }
  if (config.preparedFormula === 'ability-plus-level') {
    return Math.max(1, abilityModifier(abilityScoreAfterOrigin(draft, config.ability)) + draft.targetLevel)
  }
  return 0
}

export function getRequiredCantripCount(draft: CharacterDraft, config: SpellcastingConfig): number {
  return config.cantripsKnownByLevel?.[draft.targetLevel - 1] ?? 0
}

export function getRequiredSpellbookCount(draft: CharacterDraft, config: SpellcastingConfig): number {
  return config.spellbookSpellsByLevel?.[draft.targetLevel - 1] ?? 0
}

export function getSelectedSpellIds(draft: CharacterDraft, config: SpellcastingConfig): readonly string[] {
  if (config.mode === 'known') return draft.spellSelections.knownSpellIds
  if (config.mode === 'prepared') return draft.spellSelections.preparedSpellIds
  if (config.mode === 'spellbook') return draft.spellSelections.preparedSpellIds
  return draft.spellSelections.knownSpellIds
}

/** 候选池：可更换（准备）但尚未选择的法术 ID。`known`/`pact` 模式在 2014 规则中平时不可更换，无候选。 */
export interface SpellCandidates {
  /** prepared 模式：职业法术池（1 环起）中未准备的法术。 */
  readonly prepared: readonly string[]
  /** spellbook 模式：职业法术池（1 环起）中未写入法术书的法术（升级时可扩充入书）。 */
  readonly writeToBook: readonly string[]
  /** spellbook 模式：法术书中未准备的法术（长休可从书中换入准备）。 */
  readonly prepareFromBook: readonly string[]
}

export function getSpellCandidates(draft: CharacterDraft, config: SpellcastingConfig): SpellCandidates {
  const availableIds = getAvailableSpells(draft, config)
    .filter((spell) => spell.level > 0)
    .map((spell) => spell.id)
  const empty: SpellCandidates = { prepared: [], writeToBook: [], prepareFromBook: [] }
  if (config.mode === 'spellbook') {
    const book = draft.spellSelections.spellbookSpellIds
    const prepared = draft.spellSelections.preparedSpellIds
    return {
      prepared: [],
      writeToBook: availableIds.filter((id) => !book.includes(id)),
      prepareFromBook: book.filter((id) => !prepared.includes(id)),
    }
  }
  if (config.mode === 'prepared') {
    const selected = getSelectedSpellIds(draft, config)
    return { ...empty, prepared: availableIds.filter((id) => !selected.includes(id)) }
  }
  return empty
}

export function getAvailableSpells(draft: CharacterDraft, config: SpellcastingConfig) {
  const maximumLevel = getMaximumSpellLevel(config, draft.targetLevel)
  return config.classSpellIds
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(
      spell
      && spell.level <= maximumLevel
      && isSourceEnabled(spell.sourceIds, draft.enabledSourceIds),
    ))
}

/**
 * 动态候选池：解析检查点在当前草稿下的候选选项。
 * 普通检查点返回静态 optionIds；法术级候选（candidateKind）按草稿状态生成：
 * `all-spells` 为全部已登记 1 环及以上法术（环级不高于当前可用最高环，魔法奥秘用）；
 * `spellbook-level-N` 为法术书中对应环级的法术（法师法术专精/招牌法术用）。
 */
export function getCheckpointCandidates(draft: CharacterDraft, checkpoint: ChoiceCheckpoint): readonly string[] {
  if (checkpoint.optionIds.length > 0) return checkpoint.optionIds
  if (!checkpoint.candidateKind) return []
  if (checkpoint.candidateKind === 'all-spells') {
    const config = getSpellcastingConfig(draft)
    if (!config || draft.targetLevel < config.startsAtLevel) return []
    const maximumLevel = getMaximumSpellLevel(config, draft.targetLevel)
    return rulesRepository.spells
      .filter((spell) => spell.level >= 1 && spell.level <= maximumLevel && isSourceEnabled(spell.sourceIds, draft.enabledSourceIds))
      .map((spell) => spell.id)
  }
  const targetLevel = checkpoint.candidateKind === 'spellbook-level-1' ? 1
    : checkpoint.candidateKind === 'spellbook-level-2' ? 2
      : 3
  return draft.spellSelections.spellbookSpellIds
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(spell && spell.level === targetLevel))
    .map((spell) => spell.id)
}

/** 吟游诗人魔法奥秘法术：从时间线检查点选择中提取（不计入已知法术上限，展示与导出用）。 */
export function getMagicalSecretsSpellIds(draft: CharacterDraft): readonly string[] {
  return draft.selections
    .filter((item) => item.checkpointId.startsWith('bard-2014-magical-secrets-') && !item.invalidatedAt)
    .flatMap((item) => item.optionIds)
    .filter((id, index, all) => all.indexOf(id) === index)
}

/**
 * 解析角色当前施法配置：子职级施法（奥法骑士、诡术师）优先，否则回退职业级。
 */
export function getSpellcastingConfig(draft: Pick<CharacterDraft, 'classId' | 'subclassId' | 'enabledSourceIds'>): SpellcastingConfig | undefined {
  const subclass = draft.subclassId ? rulesRepository.getSubclass(draft.subclassId) : undefined
  if (subclass && !isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds)) return undefined
  const classRule = draft.classId ? rulesRepository.getClass(draft.classId) : undefined
  if (classRule && !isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds)) return undefined
  return rulesRepository.getSpellcastingConfig(draft)
}

export function getAlwaysPreparedSpellIds(draft: CharacterDraft): readonly string[] {
  const subclass = draft.subclassId ? rulesRepository.getSubclass(draft.subclassId) : undefined
  if (!subclass || !isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds)) return []
  return [...new Set(Object.entries(subclass.alwaysPreparedSpellIdsByLevel ?? {})
    .filter(([level]) => Number(level) <= draft.targetLevel)
    .flatMap(([, ids]) => ids)
    .filter((id) => {
      const spell = rulesRepository.getSpell(id)
      return Boolean(spell && isSourceEnabled(spell.sourceIds, draft.enabledSourceIds))
    }))]
}

export function validateSpellSelections(draft: CharacterDraft): boolean {
  const config = getSpellcastingConfig(draft)
  if (!config || draft.targetLevel < config.startsAtLevel) return true
  const selected = getSelectedSpellIds(draft, config)
  const availableSpells = getAvailableSpells(draft, config)
  const availableIds = new Set(availableSpells.filter((spell) => spell.level > 0).map((spell) => spell.id))
  const cantripIds = new Set(availableSpells.filter((spell) => spell.level === 0).map((spell) => spell.id))
  const requiredCantrips = getRequiredCantripCount(draft, config)
  const cantripsValid = requiredCantrips === 0
    || (draft.spellSelections.cantripIds.length === requiredCantrips
      && draft.spellSelections.cantripIds.length === new Set(draft.spellSelections.cantripIds).size
      && draft.spellSelections.cantripIds.every((id) => cantripIds.has(id)))
  // 法术书校验：抄录所得的法术（transcribedSpellIds）不计入升级名额，
  // 升级名额（非抄录法术）至少达到 requiredSpellbookCount（抄录可超出总数）。
  const spellbookSpells = draft.spellSelections.spellbookSpellIds
  const transcribed = draft.spellSelections.transcribedSpellIds
  const spellbookValid = config.mode !== 'spellbook'
    || (spellbookSpells.filter((id) => !transcribed.includes(id)).length >= getRequiredSpellbookCount(draft, config)
      && spellbookSpells.length === new Set(spellbookSpells).size
      && spellbookSpells.every((id) => availableIds.has(id))
      && selected.every((id) => spellbookSpells.includes(id)))
  return cantripsValid
    && spellbookValid
    && selected.length === getRequiredSpellCount(draft, config)
    && selected.length === new Set(selected).size
    && selected.every((id) => availableIds.has(id))
}
