import { ABILITY_LABELS } from '@/rules/data/ability-labels'
import { SKILL_IDS } from '@/rules/data/skill-ids'
import { getFeatPool } from '@/rules/feats'
import { getRequiredLanguageCount } from '@/rules/languages'
import { isSourceEnabled } from '@/rules/source-books'
import { getActiveLineageRecord, getSpeciesLegacyBenefits } from '@/rules/species-legacy'
import type { AbilityKey, AbilityScores, CharacterDraft, DerivedCharacter } from '@/types/character'
import type { ChoiceCheckpoint, RaceFeature, RaceRule, RulesRepository } from '@/types/rules'

export const ABILITY_KEYS_ORDER: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export function getEffectiveSpeciesSize(draft: CharacterDraft, repository: RulesRepository): 'small' | 'medium' | undefined {
  const chain = getDraftSpeciesRules(draft, repository)
  const owner = [...chain].reverse().find((race) => race.sizeByLevel?.length || race.size || race.sizeChoices?.length)
  const levelSize = owner?.sizeByLevel?.filter((item) => item.level <= draft.targetLevel).sort((a, b) => b.level - a.level)[0]?.size
  return levelSize ?? owner?.size ?? (owner?.sizeChoices?.includes(draft.speciesSizeChoice ?? 'medium') ? draft.speciesSizeChoice : undefined)
}

/** 角色物种链规则（子种族起沿 parentRaceId 叠加，来源关闭时跳过）；2014 与 2024 通用。 */
export function getDraftSpeciesRules(draft: Pick<CharacterDraft, 'raceId' | 'subraceId'> & { readonly enabledSourceIds?: readonly string[] }, repository: RulesRepository): readonly RaceRule[] {
  const rules: RaceRule[] = []
  const visited = new Set<string>()
  const visit = (raceId: string | undefined): void => {
    if (!raceId || visited.has(raceId)) return
    visited.add(raceId)
    const race = repository.getRace(raceId)
    if (!race || !isSourceEnabled(race.sourceIds, draft.enabledSourceIds, repository)) return
    if (race.parentRaceId) visit(race.parentRaceId)
    rules.push(race)
  }
  visit(draft.subraceId ?? draft.raceId)
  return rules
}

/** 物种无条件派生：每级最大生命值加成（矮人坚韧等）。 */
export function getSpeciesHitPointBonus(draft: CharacterDraft, repository: RulesRepository): number {
  if (draft.ruleset !== '5e-2024') return 0
  return getDraftSpeciesRules(draft, repository)
    .reduce((sum, race) => sum + (race.hitPointBonusPerLevel ?? 0) * draft.targetLevel, 0)
}

/** 2024 背景属性分配收益（+2/+1 或各 +1）；非法或缺失时返回空。 */
export function getBackgroundAbilityBonuses(
  draft: CharacterDraft,
  repository: RulesRepository,
): Partial<AbilityScores> {
  if (draft.ruleset !== '5e-2024') return {}
  const allocation = draft.backgroundAbilityAllocation
  const background = draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined
  if (!allocation || !background || !isSourceEnabled(background.sourceIds, draft.enabledSourceIds, repository)) return {}
  const bonuses: Partial<Record<AbilityKey, number>> = {}
  for (const key of ABILITY_KEYS_ORDER) {
    const value = allocation[key]
    if (value) bonuses[key] = value
  }
  return bonuses
}

/**
 * 2024 背景属性分配是否合法：三候选内、且为“一项 +2 与另一项 +1”或“三项各 +1”。
 * 返回中文原因；合法时返回空字符串。
 */
export function getBackgroundAllocationIssue(
  draft: CharacterDraft,
  repository: RulesRepository,
): string {
  if (draft.ruleset !== '5e-2024') return ''
  const background = draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined
  if (!background?.abilityChoices?.length) return ''
  const allocation = draft.backgroundAbilityAllocation ?? {}
  const entries = ABILITY_KEYS_ORDER
    .map((key) => [key, allocation[key] ?? 0] as const)
    .filter(([, value]) => value > 0)
  if (entries.length === 0) return '背景属性加值尚未分配。'
  if (entries.some(([key]) => !background.abilityChoices?.includes(key))) {
    return '背景属性分配包含候选之外的属性。'
  }
  const values = entries.map(([, value]) => value).sort((left, right) => left - right)
  const validPattern = (values.length === 3 && values.every((value) => value === 1))
    || (values.length === 2 && values[0] === 1 && values[1] === 2)
  if (!validPattern) return '背景属性分配必须是“一项 +2 与另一项 +1”或“三项各 +1”。'
  const exceeded = entries.find(([key, value]) => draft.baseAbilities[key] + value > 20)
  if (exceeded) return `${ABILITY_LABELS[exceeded[0]]}加上背景加值后会超过 20。`
  return ''
}

/** 来源步骤阻塞项：id 与 `validateDraft` 的 issue id 对齐，message／resolution 供界面与校验共用。 */
export interface OriginStepBlocker {
  readonly id: string
  readonly message: string
  readonly resolution: string
}

/**
 * 物种自选熟练中的错误级问题（与 `validateRaceSkillChoices` 同源）：
 * 技能数量（吉斯洋基可选工具替代）、非法技能选项、吉斯洋基技能／工具互斥。
 * 工具未选保持提示级，不作为阻塞项。
 */
export function getSpeciesProficiencyBlockers(
  draft: CharacterDraft,
  repository: RulesRepository,
): readonly OriginStepBlocker[] {
  // 沿物种链（血统 → 父物种）取熟练规格：2024 血统把技能选择放在父物种上。
  const chain = getDraftSpeciesRules(draft, repository)
  const skillOwner = chain.find((item) => item.skillProficiencyChoices)
  if (!chain.length) return []
  const displayName = chain[0]?.name ?? ''
  const isGithyanki = chain.some((item) => item.id === 'race-2014-gith-githyanki')
  const chosen = draft.raceSkillChoices ?? []
  const toolChosen = Boolean(chain.some((item) => item.toolProficiencyChoices) && getRawSpeciesToolChoices(draft).length)
  const spec = skillOwner?.lineage && getSpeciesLegacyBenefits(draft, repository).length ? undefined : skillOwner?.skillProficiencyChoices
  const blockers: OriginStepBlocker[] = []
  const toolSpec = chain.find((item) => item.toolProficiencyChoices)?.toolProficiencyChoices
  const tools = getRawSpeciesToolChoices(draft)
  if (toolSpec?.required && tools.length !== toolSpec.count) blockers.push({ id: 'race-tool-choice-required', message: `${displayName}需要选择${toolSpec.count}项工具熟练。`, resolution: '请在种族熟练中选择具体工具。' })
  if (toolSpec && (new Set(tools).size !== tools.length || tools.length > toolSpec.count || tools.some((id) => toolSpec.optionIds && !toolSpec.optionIds.includes(id)))) blockers.push({ id: 'race-tool-choice-invalid', message: '种族工具不能重复或超量，且必须属于候选范围。', resolution: '请重新选择具体工具。' })
  if (spec && !(isGithyanki && toolChosen) && chosen.length !== spec.count) {
    blockers.push({
      id: 'race-skill-choice-count',
      message: isGithyanki && chosen.length === 0
        ? `${displayName}需要选择一项技能或工具熟练。`
        : `${displayName}需要选择${spec.count}项技能熟练。`,
      resolution: `已选 ${chosen.length} 项，请在本步补选或移除。`,
    })
  }
  const allowed = spec?.optionIds ?? SKILL_IDS
  if (spec && new Set(chosen).size !== chosen.length) blockers.push({ id: 'race-skill-choice-invalid-duplicate', message: '种族技能不能重复选择。', resolution: '请选择不同技能。' })
  for (const skillId of spec ? chosen : []) {
    if (!allowed.includes(skillId)) {
      blockers.push({
        id: `race-skill-choice-invalid-${skillId}`,
        message: `${displayName}的技能熟练选项“${skillId}”不在可选范围内。`,
        resolution: '请重新选择物种技能熟练。',
      })
    }
  }
  if (isGithyanki && toolChosen && chosen.length > 0) {
    blockers.push({
      id: 'githyanki-choice-exclusive',
      message: '吉斯洋基人的腐化精通只能选择一项技能或工具熟练。',
      resolution: '请只保留技能或工具其中一项。',
    })
  }
  return blockers
}

export function getRawSpeciesToolChoices(draft: Pick<CharacterDraft, 'raceToolChoice' | 'raceToolChoices'>): readonly string[] {
  return draft.raceToolChoices ?? (draft.raceToolChoice ? [draft.raceToolChoice] : [])
}

export function getSpeciesToolProficiencies(draft: CharacterDraft, repository: RulesRepository): readonly { readonly id: string; readonly name: string; readonly sourceName: string }[] {
  const owner = getDraftSpeciesRules(draft, repository).find((race) => race.toolProficiencyChoices)
  const ids = getRawSpeciesToolChoices(draft)
  const spec = owner?.toolProficiencyChoices
  if (!owner || !spec || ids.length > spec.count || (spec.required && ids.length !== spec.count) || new Set(ids).size !== ids.length || ids.some((id) => spec.optionIds && !spec.optionIds.includes(id))) return []
  return ids.flatMap((id) => {
    const equipment = repository.getEquipment(id)
    const option = repository.getOption(id)
    if (equipment && !isSourceEnabled(equipment.sourceIds, draft.enabledSourceIds, repository)) return []
    const name = equipment?.name ?? option?.name
    return name ? [{ id, name, sourceName: owner.name }] : []
  })
}

export function getSpeciesToolProficiency(draft: CharacterDraft, repository: RulesRepository): { readonly id: string; readonly name: string; readonly sourceName: string } | undefined {
  return getSpeciesToolProficiencies(draft, repository)[0]
}

/** 页面与输出共用有效种族特性，具体熟练保留来源。 */
export function getEffectiveSpeciesFeatures(draft: CharacterDraft, repository: RulesRepository, raceId?: string, derived?: DerivedCharacter): readonly RaceFeature[] {
  const chain = getDraftSpeciesRules(draft, repository)
  const features = chain.filter((race) => !raceId || race.id === raceId).flatMap((race) => repository.getRaceFeatures(race.id)
    .filter((feature) => feature.level <= draft.targetLevel && isSourceEnabled(feature.sourceIds, draft.enabledSourceIds, repository))
    .filter((feature) => {
      const requirement = feature.selectionRequirement
      if (!requirement) return true
      const selected = getValidSpeciesChoice(draft, repository, requirement.checkpointId)
      return Boolean(selected?.some((id) => !requirement.optionId || requirement.optionId === id))
        && (requirement.additionalCheckpointIds ?? []).every((id) => Boolean(getValidSpeciesChoice(draft, repository, id)))
    }))
  const legacy = getSpeciesLegacyBenefits(draft, repository)
  const lineage = chain.find((race) => race.lineage)
  const lineageRecord = getActiveLineageRecord(draft, repository)
  if (lineage && lineageRecord && (!raceId || lineage.id === raceId)) features.push({ id: `${lineage.id}-transformation-record`, raceId: lineage.id, name: '血统转化记录', englishName: 'Lineage Transformation Record', level: 1, kind: 'passive', summary: `原种族${repository.getRace(lineageRecord.origin.subraceId ?? lineageRecord.origin.raceId)?.name ?? lineageRecord.origin.raceId}（仅追溯，旧收益不生效）；保留语言：${lineageRecord.origin.languages.join('、') || '无已登记语言'}`, description: '原属性、技能、工具和检查点选择保存在转化历史；只有有效先祖遗产参与派生，不提供一键还原。', status: 'implemented', sourceIds: lineage.sourceIds })
  if (legacy.length && lineage && (!raceId || lineage.id === raceId)) features.push({ id: `${lineage.id}-retained-legacy`, raceId: lineage.id, name: '保留先祖遗产', englishName: 'Retained Ancestral Legacy', level: 1, kind: 'passive', summary: legacy.map((item) => item.name).join('；'), description: legacy.map((item) => item.name).join('；'), status: 'implemented', sourceIds: lineage.sourceIds })
  const tools = getSpeciesToolProficiencies(draft, repository)
  const owner = chain.find((race) => race.toolProficiencyChoices)
  if (tools.length && owner && (!raceId || owner.id === raceId)) features.push({ id: `${owner.id}-selected-tool`, raceId: owner.id, name: '种族工具熟练', englishName: 'Selected Tool Proficiency', level: 1, kind: 'passive', summary: `${owner.name}：${tools.map((tool) => tool.name).join('、')}`, description: `所选具体工具熟练：${tools.map((tool) => tool.name).join('、')}。`, status: 'implemented', sourceIds: owner.sourceIds })
  const sized = chain.find((race) => race.sizeByLevel?.length)
  if (sized && (!raceId || sized.id === raceId)) features.push({ id: `${sized.id}-effective-size`, raceId: sized.id, name: '当前体型', englishName: 'Current Size', level: 1, kind: 'passive', summary: getEffectiveSpeciesSize(draft, repository) === 'small' ? '小型' : '中型', description: `按当前${draft.targetLevel}级派生体型。`, status: 'implemented', sourceIds: sized.sourceIds })
  for (const race of chain.filter((item) => !raceId || item.id === raceId)) for (const choice of race.choices ?? []) {
    const selected = getValidSpeciesChoice(draft, repository, choice.id)
    if (!selected) continue
    const summary = selected.map((id) => repository.getOption(id)?.name ?? repository.getSpell(id)?.name ?? id).join('、')
    features.push({ id: `${choice.id}-selected`, raceId: race.id, name: choice.title, englishName: 'Species Choice', level: choice.level, kind: 'choice', summary, description: `${choice.description} 已选：${summary}`, status: 'implemented', sourceIds: race.sourceIds })
  }
  return features.map((feature) => {
    if (!derived) return feature
    const abilityOption = feature.saveDc?.abilityCheckpointId ? getValidSpeciesChoice(draft, repository, feature.saveDc.abilityCheckpointId)?.[0] : undefined
    const ability = feature.saveDc?.ability ?? (abilityOption?.startsWith('spell-ability-') ? abilityOption.slice(14) as AbilityKey : undefined)
    const dc = ability && ABILITY_KEYS_ORDER.includes(ability) ? `当前DC ${8 + derived.proficiencyBonus.value + derived.modifiers[ability]}（${ABILITY_LABELS[ability]}）` : ''
    const attack = feature.naturalAttack
    const bonus = attack ? derived.modifiers[attack.ability] : 0
    const attackText = attack ? `当前命中${derived.proficiencyBonus.value + bonus >= 0 ? '+' : ''}${derived.proficiencyBonus.value + bonus}；伤害${attack.damageDice}${bonus >= 0 ? '+' : ''}${bonus}（${ABILITY_LABELS[attack.ability]}）` : ''
    const text = [dc, attackText].filter(Boolean).join('；')
    return text ? { ...feature, summary: `${feature.summary} ${text}`, description: `${feature.description} ${text}` } : feature
  })
}

type SpeciesChoiceDraft = Pick<CharacterDraft, 'raceId' | 'subraceId' | 'targetLevel' | 'selections'> & { readonly enabledSourceIds?: readonly string[] }

export function getSpeciesChoiceCheckpoints(draft: SpeciesChoiceDraft, repository: RulesRepository): readonly ChoiceCheckpoint[] {
  return getDraftSpeciesRules(draft, repository).flatMap((race) => (race.choices ?? [])
    .filter((choice) => choice.level <= draft.targetLevel)
    .filter((choice) => !choice.parentCheckpointId || getValidSpeciesChoice(draft, repository, choice.parentCheckpointId)?.includes(choice.parentOptionId ?? ''))
    .map((choice) => ({ ...choice, optionIds: speciesChoiceCandidates(choice, repository, draft.enabledSourceIds) })))
}

function speciesChoiceCandidates(choice: ChoiceCheckpoint, repository: RulesRepository, enabledSourceIds: readonly string[] | undefined): readonly string[] {
  if (choice.candidateKind === 'spell-pool') return repository.spells.filter((spell) => spell.level === choice.spellPool?.level && (!choice.spellPool?.classIds || spell.classIds.some((id) => choice.spellPool?.classIds?.includes(id))) && isSourceEnabled(spell.sourceIds, enabledSourceIds, repository)).map((spell) => spell.id)
  return choice.optionIds.filter((id) => { const option = repository.getOption(id); return !option || isSourceEnabled(option.sourceIds, enabledSourceIds, repository) })
}

export function getValidSpeciesChoice(draft: SpeciesChoiceDraft, repository: RulesRepository, checkpointId: string, visited = new Set<string>()): readonly string[] | undefined {
  if (visited.has(checkpointId)) return undefined
  visited.add(checkpointId)
  const choice = getDraftSpeciesRules(draft, repository).flatMap((race) => race.choices ?? []).find((item) => item.id === checkpointId)
  if (!choice || choice.level > draft.targetLevel) return undefined
  if (choice.parentCheckpointId && !getValidSpeciesChoice(draft, repository, choice.parentCheckpointId, visited)?.includes(choice.parentOptionId ?? '')) return undefined
  const records = draft.selections.filter((item) => item.checkpointId === checkpointId && !item.invalidatedAt)
  if (records.length !== 1) return undefined
  const ids = records[0]?.optionIds ?? []
  const candidates = speciesChoiceCandidates(choice, repository, draft.enabledSourceIds)
  return ids.length >= choice.minSelections && ids.length <= choice.maxSelections && new Set(ids).size === ids.length && ids.every((id) => candidates.includes(id)) ? ids : undefined
}

/**
 * 背景起源专长阻塞项（H1，决策 P-1）：
 * 背景声明候选（`originFeatOptions` 二选一／本书候选，或 `originFeatChoices` 任选池）
 * 且存在可选候选时，玩家必须在出身步骤完成选择，避免漏选后到角色卡才发现。
 * 固定授予（`originFeatId`）与无专长背景不产生阻塞。
 */
function getBackgroundOriginFeatBlocker(
  draft: CharacterDraft,
  repository: RulesRepository,
): OriginStepBlocker | undefined {
  const background = draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined
  if (!background || !isSourceEnabled(background.sourceIds, draft.enabledSourceIds, repository)) return undefined
  const options = background.originFeatOptions
  const choices = background.originFeatChoices
  const hasCandidate = options?.length
    ? options.some((id) => {
        const feat = repository.getFeat(id)
        return Boolean(feat && isSourceEnabled(feat.sourceIds, draft.enabledSourceIds, repository))
      })
    : choices && choices.count > 0
      ? getFeatPool(repository, choices.categories, { enabledSourceIds: draft.enabledSourceIds }).length > 0
      : false
  if (!hasCandidate) return undefined
  const selection = draft.selections.find((item) => item.checkpointId === `${background.id}-origin-feat` && !item.invalidatedAt)
  if (selection?.optionIds.length) return undefined
  return {
    id: 'background-origin-feat',
    message: `${background.name}需要选择起源专长。`,
    resolution: '在背景下方的「该背景的起源专长」中选择一项。',
  }
}

/**
 * 起源步骤阻塞项（单一来源，B09-07）：
 * 供步骤门禁、起源页提示、完成度与校验共用；仅纳入 `validateDraft` 中错误级的项，
 * 提示级（warning）项目不入闸。
 */
export function getOriginStepBlockers(
  draft: CharacterDraft,
  repository: RulesRepository,
): readonly OriginStepBlocker[] {
  const blockers: OriginStepBlocker[] = []
  if (!draft.raceId || !draft.backgroundId) {
    blockers.push({
      id: 'origin-required',
      message: '角色起源尚未完成。',
      resolution: draft.ruleset === '5e-2024' ? '选择物种与背景。' : '选择种族和背景。',
    })
  }
  const race = draft.raceId ? repository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? repository.getRace(draft.subraceId) : undefined
  if (race?.requiresSubrace && !subrace) {
    blockers.push({
      id: 'subrace-required',
      message: `${race.name}需要选择子种族。`,
      resolution: '在物种卡片下选择一个血统。',
    })
  }
  if (subrace && subrace.parentRaceId !== draft.raceId) {
    blockers.push({
      id: 'subrace-mismatch',
      message: '所选子种族不属于当前物种。',
      resolution: '重新选择当前物种的血统。',
    })
  }
  const requiredLanguages = getRequiredLanguageCount(draft, repository)
  if (
    requiredLanguages > 0
    && (draft.languages.length !== requiredLanguages || new Set(draft.languages).size !== draft.languages.length)
  ) {
    blockers.push({
      id: 'background-languages',
      message: '语言选择尚未完成。',
      resolution: `请选择${requiredLanguages}种不同的额外语言。`,
    })
  }
  const allocationIssue = getBackgroundAllocationIssue(draft, repository)
  if (allocationIssue) {
    blockers.push({
      id: 'background-ability-allocation',
      message: '背景属性加值分配不合法。',
      resolution: allocationIssue,
    })
  }
  const originFeatBlocker = getBackgroundOriginFeatBlocker(draft, repository)
  if (originFeatBlocker) blockers.push(originFeatBlocker)
  const effectiveBackground = draft.backgroundVariantId
    ? repository.getBackground(draft.backgroundVariantId)
    : draft.backgroundId
      ? repository.getBackground(draft.backgroundId)
      : undefined
  const toolChoices = effectiveBackground?.toolChoices
  if (toolChoices && toolChoices.count > 0) {
    const fixedToolIds = new Set(effectiveBackground?.toolIds ?? [])
    const chosen = draft.backgroundToolIds.filter((id) => !fixedToolIds.has(id))
    const allowed = toolChoices.optionIds
    if (chosen.length !== toolChoices.count || new Set(chosen).size !== chosen.length) {
      blockers.push({
        id: 'background-tool-choice-count',
        message: `${effectiveBackground?.name ?? '当前背景'}需要选择${toolChoices.count}项工具熟练。`,
        resolution: `已选 ${chosen.length} 项，请在本步补选或移除。`,
      })
    }
    for (const toolId of chosen) {
      if (allowed?.length && !allowed.includes(toolId)) {
        blockers.push({
          id: `background-tool-choice-invalid-${toolId}`,
          message: `背景工具选择“${repository.getEquipment(toolId)?.name ?? toolId}”不在可选范围内。`,
          resolution: '请重新选择当前背景允许的工具。',
        })
      }
    }
  }
  const sizeRules = getDraftSpeciesRules(draft, repository).filter((item) => (item.sizeChoices?.length ?? 0) > 0)
  if (sizeRules.length > 0) {
    const size = draft.speciesSizeChoice
    if (!size || !sizeRules.some((item) => item.sizeChoices?.includes(size))) {
      blockers.push({
        id: 'species-size-required',
        message: '物种需要选择体型。',
        resolution: '选择小型或中型。',
      })
    }
  }
  blockers.push(...getSpeciesProficiencyBlockers(draft, repository))
  return blockers
}

/** 起源步骤是否可继续（阻塞项为空）。 */
export function isOriginStepComplete(draft: CharacterDraft, repository: RulesRepository): boolean {
  return getOriginStepBlockers(draft, repository).length === 0
}
