import { rulesRepository } from '@/rules/repository'
import { deriveAbilities } from '@/rules/derive'
import {
  decodeAbilityImprovement,
  getAbilityImprovementEligibility,
  getFeatEligibility,
} from '@/rules/feats'
import { areBaseAbilitiesValid, areOriginAbilitiesWithinCap } from '@/rules/abilities'
import { getFlexibleBonusRule, getRaceAbilityBonuses } from '@/rules/derive'
import { buildTimeline } from '@/rules/timeline'
import { getAvailableSpells, getRequiredCantripCount, getRequiredSpellbookCount, getRequiredSpellCount, getSelectedSpellIds } from '@/rules/spellcasting'
import { buildStartingEquipmentState, isStartingEquipmentComplete } from '@/rules/starting-equipment'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import type { CharacterDraft, ValidationIssue } from '@/types/character'

export function validateDraft(draft: CharacterDraft): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!draft.classId) issues.push({ id: 'class-required', step: 'class', severity: 'error', message: '尚未选择职业。', resolution: '返回职业步骤选择一个职业。' })
  if (!draft.backgroundId || !draft.raceId) issues.push({ id: 'origin-required', step: 'origin', severity: 'error', message: '角色起源尚未完成。', resolution: '选择2014种族和背景。' })
  if (!draft.name.trim()) issues.push({ id: 'name-required', step: 'identity', severity: 'error', message: '角色还没有名字。', resolution: '填写角色姓名。' })
  if (draft.classId && !isStartingEquipmentComplete(draft)) {
    issues.push({
      id: 'starting-equipment-incomplete',
      step: 'equipment',
      severity: 'error',
      message: '职业起始装备选择尚未完成。',
      resolution: '返回装备步骤，完成每一个必选装备组。',
    })
  }
  if (draft.equipmentNeedsReview) {
    issues.push({
      id: 'equipment-review-required',
      step: 'equipment',
      severity: 'error',
      message: '这份旧草稿的起始装备需要按2014规则重新确认。',
      resolution: '完成职业装备分支后，旧物品仍会保留为迁移记录。',
    })
  }
  if (draft.inventory.some((entry) =>
    !rulesRepository.getEquipment(entry.itemId)
    || entry.quantity < 1
    || entry.equippedQuantity < 0
    || entry.equippedQuantity > entry.quantity,
  )) {
    issues.push({
      id: 'inventory-invalid',
      step: 'equipment',
      severity: 'error',
      message: '物品栏包含未知物品、无效数量或超量装备。',
      resolution: '返回装备步骤重新生成物品栏，并检查穿戴数量。',
    })
  }
  const duplicateEntryIds = draft.inventory.map((entry) => entry.id)
  if (new Set(duplicateEntryIds).size !== duplicateEntryIds.length) {
    issues.push({ id: 'inventory-entry-duplicate', step: 'equipment', severity: 'error', message: '物品栏来源记录发生重复。', resolution: '返回装备步骤重新确认装备。' })
  }
  if (draft.classId && draft.backgroundId && isStartingEquipmentComplete(draft) && !draft.equipmentNeedsReview) {
    const expected = buildStartingEquipmentState(draft, false)
    const expectedKeys = expected.inventory
      .filter((entry) => entry.sourceKind !== 'legacy')
      .map((entry) => `${entry.sourceKind}:${entry.sourceId}:${entry.itemId}:${entry.quantity}`)
      .sort()
    const actualKeys = draft.inventory
      .filter((entry) => entry.sourceKind !== 'legacy')
      .map((entry) => `${entry.sourceKind}:${entry.sourceId}:${entry.itemId}:${entry.quantity}`)
      .sort()
    if (expectedKeys.join('|') !== actualKeys.join('|') || draft.currency.gp !== expected.currency.gp) {
      issues.push({
        id: 'starting-equipment-out-of-sync',
        step: 'equipment',
        severity: 'error',
        message: '物品栏或起始金币与当前职业、背景选择不一致。',
        resolution: '返回装备步骤重新确认一次当前选择。',
      })
    }
  }
  const raceAbilityBonuses = getRaceAbilityBonuses(draft)
  if (!areBaseAbilitiesValid(draft.baseAbilities, draft.abilityMethod)) {
    issues.push({
      id: 'ability-method-invalid',
      step: 'abilities',
      severity: 'error',
      message: '基础属性不符合所选生成方式。',
      resolution: draft.abilityMethod === 'standard-array'
        ? '恰好使用15、14、13、12、10、8各一次。'
        : draft.abilityMethod === 'point-buy'
          ? '只计算六项基础值：每项至少为8，每提高1点消耗1点，总花费不得超过27点。'
          : '将每项基础属性保持在3—20。',
    })
  }
  if (!areOriginAbilitiesWithinCap(draft.baseAbilities, raceAbilityBonuses)) {
    issues.push({
      id: 'origin-ability-cap-exceeded',
      step: 'abilities',
      severity: 'error',
      message: '种族或子种族加成后的属性超过20。',
      resolution: '返回属性步骤降低对应基础值，或调整可选的种族属性加成。',
    })
  }

  const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
  if (race?.requiresSubrace && !subrace) {
    issues.push({ id: 'subrace-required', step: 'origin', severity: 'error', message: `${race.name}需要选择子种族。`, resolution: '在种族卡片下选择一个子种族。' })
  }
  if (subrace && subrace.parentRaceId !== draft.raceId) {
    issues.push({ id: 'subrace-mismatch', step: 'origin', severity: 'error', message: '所选子种族不属于当前种族。', resolution: '重新选择当前种族的子种族。' })
  }
  const flexibleRule = getFlexibleBonusRule(race, subrace)
  const flexibleTotalCount = flexibleRule?.flexibleBonusGroups?.reduce((sum, group) => sum + group.count, 0)
    ?? flexibleRule?.flexibleBonusCount ?? 0
  if (
    flexibleTotalCount !== draft.raceAbilityChoices.length
    || draft.raceAbilityChoices.length !== new Set(draft.raceAbilityChoices).size
  ) {
    issues.push({ id: 'race-ability-choice', step: 'abilities', severity: 'error', message: '种族自选属性加值尚未完成。', resolution: `选择${flexibleTotalCount}项不同属性。` })
  }
  if (draft.raceAbilityChoices.some((key) => flexibleRule?.excludedFlexibleAbilityKeys?.includes(key))) {
    issues.push({
      id: 'race-ability-excluded',
      step: 'abilities',
      severity: 'error',
      message: '种族自选属性包含规则不允许的属性。',
      resolution: '半精灵的两项自选属性不能再次选择魅力。',
    })
  }
  const background = draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId) : undefined
  if (
    background
    && (draft.languages.length !== background.languageChoices || new Set(draft.languages).size !== draft.languages.length)
  ) {
    issues.push({
      id: 'background-languages',
      step: 'origin',
      severity: 'error',
      message: '背景语言选择尚未完成。',
      resolution: `请选择${background.languageChoices}种不同的额外语言。`,
    })
  }

  if (draft.classId) {
    const classRule = rulesRepository.getClass(draft.classId)
    if (classRule?.status === 'index-only') {
      issues.push({
        id: 'class-index-only',
        step: 'class',
        severity: 'warning',
        message: `“${classRule.name}”当前只有2014规则索引。`,
        resolution: '可以继续生成预览草稿，但不能标记为资料完整角色。',
      })
    }
    if (classRule?.spellcasting && draft.targetLevel >= classRule.spellcasting.startsAtLevel) {
      const selectedSpellIds = getSelectedSpellIds(draft, classRule.spellcasting)
      const requiredCount = getRequiredSpellCount(draft, classRule.spellcasting)
      const availableSpells = getAvailableSpells(draft, classRule.spellcasting)
      const availableIds = new Set(availableSpells.filter((spell) => spell.level > 0).map((spell) => spell.id))
      const cantripIds = new Set(availableSpells.filter((spell) => spell.level === 0).map((spell) => spell.id))
      const requiredCantrips = getRequiredCantripCount(draft, classRule.spellcasting)
      const requiredSpellbook = getRequiredSpellbookCount(draft, classRule.spellcasting)
      if (selectedSpellIds.length !== requiredCount) {
        issues.push({
          id: 'spell-count',
          step: 'spells',
          severity: 'error',
          message: `${classRule.name}的法术选择尚未完成。`,
          resolution: `需要${classRule.spellcasting.mode === 'prepared' ? '准备' : '掌握'}${requiredCount}个法术。`,
        })
      }
      if (selectedSpellIds.length !== new Set(selectedSpellIds).size) {
        issues.push({ id: 'duplicate-spell', step: 'spells', severity: 'error', message: '法术列表中存在重复项。', resolution: '每个法术只能选择一次。' })
      }
      if (selectedSpellIds.some((id) => !availableIds.has(id))) {
        issues.push({ id: 'unavailable-spell', step: 'spells', severity: 'error', message: '法术列表中包含当前等级或职业不可用的法术。', resolution: '返回法术步骤重新选择。' })
      }
      if (
        requiredCantrips > 0
        && (
        draft.spellSelections.cantripIds.length !== requiredCantrips
        || draft.spellSelections.cantripIds.some((id) => !cantripIds.has(id))
        )
      ) {
        issues.push({ id: 'cantrip-count', step: 'spells', severity: 'error', message: '戏法选择尚未完成或包含不可用项。', resolution: `需要选择${requiredCantrips}个当前职业戏法。` })
      }
      if (
        classRule.spellcasting.mode === 'spellbook'
        && (
          draft.spellSelections.spellbookSpellIds.length !== requiredSpellbook
          || draft.spellSelections.spellbookSpellIds.some((id) => !availableIds.has(id))
          || selectedSpellIds.some((id) => !draft.spellSelections.spellbookSpellIds.includes(id))
        )
      ) {
        issues.push({ id: 'spellbook-count', step: 'spells', severity: 'error', message: '法术书内容尚未完成，或准备了不在书中的法术。', resolution: `法术书需要包含${requiredSpellbook}个当前可用法师法术。` })
      }
    }
    const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId })
    for (const checkpoint of timeline) {
      const selection = draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)
      const count = selection?.optionIds.length ?? 0
      if (checkpoint.required && (count < checkpoint.minSelections || count > checkpoint.maxSelections)) {
        issues.push({
          id: `checkpoint-${checkpoint.id}`,
          step: checkpoint.step,
          severity: 'error',
          message: `${checkpoint.level}级「${checkpoint.title}」尚未完成。`,
          resolution: `需要选择${checkpoint.minSelections === checkpoint.maxSelections ? checkpoint.minSelections : `${checkpoint.minSelections}—${checkpoint.maxSelections}`}项。`,
        })
      }
      for (const optionId of selection?.optionIds ?? []) {
        const option = rulesRepository.getOption(optionId)
        const abilityImprovement = decodeAbilityImprovement(optionId)
        if (abilityImprovement) {
          const eligibility = getAbilityImprovementEligibility(deriveAbilities(draft, checkpoint.id), optionId)
          if (!eligibility.available) {
            issues.push({
              id: `ability-improvement-${checkpoint.id}-${optionId}`,
              step: checkpoint.step,
              severity: 'error',
              message: `${checkpoint.level}级「${option?.name ?? optionId}」无法应用。`,
              resolution: eligibility.reason,
            })
          }
        }
        const selectedFeat = rulesRepository.getFeat(optionId)
        if (selectedFeat && draft.classId) {
          const classRule = rulesRepository.getClass(draft.classId)
          const eligibility = getFeatEligibility(selectedFeat, {
            abilities: deriveAbilities(draft, checkpoint.id),
            classId: draft.classId,
            canCastSpells: Boolean(classRule?.spellcasting && checkpoint.level >= classRule.spellcasting.startsAtLevel),
          })
          if (!eligibility.available) {
            issues.push({
              id: `feat-prerequisite-${checkpoint.id}-${optionId}`,
              step: checkpoint.step,
              severity: 'error',
              message: `${checkpoint.level}级「${selectedFeat.name}」不满足前置条件。`,
              resolution: eligibility.reasons.join('；'),
            })
          }
        }
        if (option?.status === 'index-only') {
          issues.push({
            id: `index-only-${checkpoint.id}-${optionId}`,
            step: checkpoint.step,
            severity: 'warning',
            message: `「${option.name}」目前只有规则索引。`,
            resolution: '角色可以预览，但需要DM确认具体效果。',
          })
        }
      }
    }
    const maneuverIds = timeline
      .filter((checkpoint) => checkpoint.kind === 'maneuvers')
      .flatMap((checkpoint) => draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)?.optionIds ?? [])
    if (new Set(maneuverIds).size !== maneuverIds.length) {
      issues.push({
        id: 'duplicate-maneuver',
        step: 'timeline',
        severity: 'error',
        message: '不同等级重复选择了同一项战技。',
        resolution: '每次新增战技都必须选择尚未掌握的战技。',
      })
    }
    const classSkillIds = timeline
      .filter((checkpoint) => checkpoint.kind === 'skills')
      .flatMap((checkpoint) => draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)?.optionIds ?? [])
    const unresolvedDuplicates = classSkillIds.filter((skillId) =>
      draft.backgroundSkillIds.includes(skillId)
      && !draft.proficiencyReplacements.some((replacement) =>
        replacement.kind === 'skill' && replacement.duplicateId === skillId && replacement.replacementId !== skillId,
      ),
    )
    if (unresolvedDuplicates.length) {
      issues.push({
        id: 'duplicate-skill-proficiency',
        step: 'timeline',
        severity: 'error',
        message: '职业与背景重复提供了同一项技能熟练。',
        resolution: '选择另一项职业技能，或记录一项同类熟练替换。',
      })
    }
    const expertiseIds = timeline
      .filter((checkpoint) => checkpoint.kind === 'expertise')
      .flatMap((checkpoint) => draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)?.optionIds ?? [])
    if (new Set(expertiseIds).size !== expertiseIds.length) {
      issues.push({
        id: 'duplicate-expertise',
        step: 'timeline',
        severity: 'error',
        message: '不同等级重复选择了同一项专精。',
        resolution: '6级专精必须选择尚未拥有专精的熟练项。',
      })
    }
    const proficientIds = new Set([...classSkillIds, ...draft.backgroundSkillIds, 'tool-thieves-tools'])
    if (expertiseIds.some((optionId) => !proficientIds.has(optionId))) {
      issues.push({
        id: 'expertise-without-proficiency',
        step: 'timeline',
        severity: 'error',
        message: '专精选择中包含尚未熟练的技能。',
        resolution: '只能从职业或背景已提供的技能熟练中选择，盗贼工具也可以选择。',
      })
    }
  }
  issues.push(...validateSubclassSelections(draft))
  return issues
}

export function validateSubclassSelections(draft: CharacterDraft): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!draft.classId || !draft.subclassId) return issues
  const subclass = rulesRepository.getSubclass(draft.subclassId)
  if (!subclass) {
    issues.push({ id: 'subclass-unknown', step: 'timeline', severity: 'error', message: '所选子职不存在。', resolution: '返回时间线重新选择子职。' })
    return issues
  }
  if (subclass.classId !== draft.classId) {
    issues.push({ id: 'subclass-class-mismatch', step: 'timeline', severity: 'error', message: `“${subclass.name}”不属于当前职业。`, resolution: '选择当前职业的子职。' })
  }
  if (draft.targetLevel < subclass.selectionLevel) {
    issues.push({ id: 'subclass-level-too-early', step: 'timeline', severity: 'error', message: `“${subclass.name}”需要在${subclass.selectionLevel}级才能选择。`, resolution: '提高目标等级或移除子职选择。' })
  }
  if (subclass.status === 'index-only') {
    issues.push({ id: 'subclass-index-only', step: 'timeline', severity: 'warning', message: `“${subclass.name}”目前只有2014规则索引。`, resolution: '可以继续生成预览草稿，但不能标记为资料完整角色。' })
  }
  const features = getSubclassFeatures2014(draft.subclassId)
  const selectedOptionIds = new Set(
    draft.selections
      .filter((item) => !item.invalidatedAt)
      .flatMap((item) => item.optionIds),
  )
  for (const feature of features) {
    if (!feature.requiresChoice || !feature.optionIds?.length) continue
    const chosen = feature.optionIds.filter((optionId) => selectedOptionIds.has(optionId))
    if (chosen.length === 0) {
      issues.push({
        id: `subclass-feature-choice-${feature.id}`,
        step: 'timeline',
        severity: 'warning',
        message: `子职特性「${feature.name}」需要选择一项。`,
        resolution: '完成子职特性选择后角色资料才完整。',
      })
    } else if (chosen.length > 1) {
      issues.push({
        id: `subclass-feature-exclusive-${feature.id}`,
        step: 'timeline',
        severity: 'error',
        message: `子职特性「${feature.name}」的选项互斥。`,
        resolution: '每个特性只能选择其中一项。',
      })
    }
  }
  return issues
}
