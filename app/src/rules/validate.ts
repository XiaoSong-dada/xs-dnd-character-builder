import { rulesRepository } from '@/rules/repository'
import { deriveAbilities } from '@/rules/derive'
import {
  decodeAbilityImprovement,
  getAbilityImprovementEligibility,
  getFeatEligibility,
} from '@/rules/feats'
import { areBaseAbilitiesValid, areOriginAbilitiesWithinCap } from '@/rules/abilities'
import { getFlexibleBonusRule, getRaceAbilityBonuses, SKILL_IDS } from '@/rules/derive'
import { buildTimeline } from '@/rules/timeline'
import { getAvailableSpells, getRequiredCantripCount, getRequiredSpellbookCount, getRequiredSpellCount, getSelectedSpellIds, getSpellcastingConfig } from '@/rules/spellcasting'
import { buildStartingEquipmentState, isStartingEquipmentComplete } from '@/rules/starting-equipment'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { isSourceEnabled } from '@/rules/source-books'
import { artificerInfusions2014, getArtificerInfusedItemLimit } from '@/rules/data/artificer-2014'
import type { CharacterDraft, ValidationIssue } from '@/types/character'

export function validateDraft(draft: CharacterDraft): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const requireEnabled = (
    id: string,
    step: ValidationIssue['step'],
    label: string,
    rule: { readonly sourceIds: readonly string[] } | undefined,
  ): void => {
    if (rule && !isSourceEnabled(rule.sourceIds, draft.enabledSourceIds)) {
      issues.push({
        id: `source-disabled-${id}`,
        step,
        severity: 'error',
        message: `${label}的来源扩展书已关闭。`,
        resolution: '在第 2 步重新启用对应扩展书，或更换该选择。',
      })
    }
  }
  requireEnabled(draft.classId ?? 'class', 'class', `职业“${draft.classId ? rulesRepository.getClass(draft.classId)?.name ?? draft.classId : ''}”`, draft.classId ? rulesRepository.getClass(draft.classId) : undefined)
  requireEnabled(draft.subclassId ?? 'subclass', 'timeline', `子职“${draft.subclassId ? rulesRepository.getSubclass(draft.subclassId)?.name ?? draft.subclassId : ''}”`, draft.subclassId ? rulesRepository.getSubclass(draft.subclassId) : undefined)
  requireEnabled(draft.raceId ?? 'race', 'origin', `种族“${draft.raceId ? rulesRepository.getRace(draft.raceId)?.name ?? draft.raceId : ''}”`, draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined)
  requireEnabled(draft.subraceId ?? 'subrace', 'origin', `子种族“${draft.subraceId ? rulesRepository.getRace(draft.subraceId)?.name ?? draft.subraceId : ''}”`, draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined)
  requireEnabled(draft.backgroundId ?? 'background', 'origin', `背景“${draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId)?.name ?? draft.backgroundId : ''}”`, draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId) : undefined)
  requireEnabled(draft.backgroundVariantId ?? 'background-variant', 'origin', `背景变体“${draft.backgroundVariantId ? rulesRepository.getBackground(draft.backgroundVariantId)?.name ?? draft.backgroundVariantId : ''}”`, draft.backgroundVariantId ? rulesRepository.getBackground(draft.backgroundVariantId) : undefined)
  for (const selection of draft.selections.filter((item) => !item.invalidatedAt)) {
    for (const optionId of selection.optionIds) {
      const option = rulesRepository.getOption(optionId) ?? rulesRepository.getFeat(optionId)
      requireEnabled(`${selection.checkpointId}-${optionId}`, 'timeline', `选择“${option?.name ?? optionId}”`, option)
    }
  }
  for (const entry of draft.inventory) {
    const item = rulesRepository.getEquipment(entry.itemId)
    requireEnabled(`item-${entry.id}`, 'equipment', `物品“${item?.name ?? entry.itemId}”`, item)
  }
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
    (entry.sourceKind !== 'adventure' && !rulesRepository.getEquipment(entry.itemId))
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
  const infusionActive = draft.classId === 'class-2014-artificer'
    && Boolean(isSourceEnabled(rulesRepository.getClass(draft.classId)?.sourceIds ?? [], draft.enabledSourceIds))
  const infusionAssignments = draft.infusionAssignments ?? []
  if (infusionAssignments.length > 0 && !infusionActive) {
    issues.push({ id: 'infusions-inactive', step: 'equipment', severity: 'warning', message: '奇械师灌注绑定已保留，但当前职业或来源不允许它们生效。', resolution: '重新选择奇械师并启用 ERftLW 或 TCoE 后会自动恢复。' })
  }
  if (infusionActive) {
    const knownIds = new Set(draft.selections
      .filter((selection) => selection.checkpointId.startsWith('artificer-2014-infusions-') && !selection.invalidatedAt)
      .flatMap((selection) => selection.optionIds))
    if (infusionAssignments.length > getArtificerInfusedItemLimit(draft.targetLevel)) {
      issues.push({ id: 'infusion-limit', step: 'equipment', severity: 'error', message: '同时生效的灌注超过当前奇械师等级上限。', resolution: `当前最多生效 ${getArtificerInfusedItemLimit(draft.targetLevel)} 项灌注。` })
    }
    const infusionIds = infusionAssignments.map((assignment) => assignment.infusionId)
    const itemEntryIds = infusionAssignments.map((assignment) => assignment.inventoryEntryId)
    if (new Set(infusionIds).size !== infusionIds.length) issues.push({ id: 'infusion-duplicate', step: 'equipment', severity: 'error', message: '同一项灌注被重复启用。', resolution: '每项已知灌注最多存在一个生效绑定。' })
    if (new Set(itemEntryIds).size !== itemEntryIds.length) issues.push({ id: 'infusion-item-duplicate', step: 'equipment', severity: 'error', message: '同一件物品不能承载多项灌注。', resolution: '为重复绑定的灌注更换物品。' })
    for (const assignment of infusionAssignments) {
      const infusion = artificerInfusions2014.find((item) => item.id === assignment.infusionId)
      const entry = draft.inventory.find((item) => item.id === assignment.inventoryEntryId)
      const item = entry ? rulesRepository.getEquipment(entry.itemId) : undefined
      if (!infusion || !knownIds.has(assignment.infusionId)) {
        issues.push({ id: `infusion-not-known-${assignment.infusionId}`, step: 'equipment', severity: 'error', message: `灌注“${infusion?.name ?? assignment.infusionId}”尚未掌握或因降级失效。`, resolution: '返回时间线检查已知灌注。' })
      } else if (infusion.minimumLevel > draft.targetLevel) {
        issues.push({ id: `infusion-level-${assignment.infusionId}`, step: 'equipment', severity: 'error', message: `灌注“${infusion.name}”的等级前置不满足。`, resolution: `需要奇械师 ${infusion.minimumLevel} 级。` })
      }
      if (!entry || !item) {
        issues.push({ id: `infusion-item-missing-${assignment.infusionId}`, step: 'equipment', severity: 'error', message: '灌注绑定的物品已被删除或无法解析。', resolution: '保留的绑定已停止应用；请选择新的合法物品。' })
      } else if (infusion && !infusion.eligibleCategories.some((category) => category === item.category)) {
        issues.push({ id: `infusion-item-category-${assignment.infusionId}`, step: 'equipment', severity: 'error', message: `“${infusion.name}”不能应用于“${item.name}”。`, resolution: '选择符合物品注法类别的条目。' })
      }
    }
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
    const spellcasting = getSpellcastingConfig(draft)
    if (spellcasting && draft.targetLevel >= spellcasting.startsAtLevel) {
      const selectedSpellIds = getSelectedSpellIds(draft, spellcasting)
      const requiredCount = getRequiredSpellCount(draft, spellcasting)
      const availableSpells = getAvailableSpells(draft, spellcasting)
      const availableIds = new Set(availableSpells.filter((spell) => spell.level > 0).map((spell) => spell.id))
      const cantripIds = new Set(availableSpells.filter((spell) => spell.level === 0).map((spell) => spell.id))
      const requiredCantrips = getRequiredCantripCount(draft, spellcasting)
      const requiredSpellbook = getRequiredSpellbookCount(draft, spellcasting)
      if (selectedSpellIds.length !== requiredCount) {
        issues.push({
          id: 'spell-count',
          step: 'spells',
          severity: 'error',
          message: `${classRule?.name ?? '角色'}的法术选择尚未完成。`,
          resolution: `需要${spellcasting.mode === 'prepared' ? '准备' : '掌握'}${requiredCount}个法术。`,
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
      // 抄录所得的法术不计入升级名额：非抄录法术至少达到 requiredSpellbook。
      const nonTranscribedBookCount = draft.spellSelections.spellbookSpellIds
        .filter((id) => !draft.spellSelections.transcribedSpellIds.includes(id)).length
      if (
        spellcasting.mode === 'spellbook'
        && (
          nonTranscribedBookCount < requiredSpellbook
          || draft.spellSelections.spellbookSpellIds.some((id) => !availableIds.has(id))
          || selectedSpellIds.some((id) => !draft.spellSelections.spellbookSpellIds.includes(id))
        )
      ) {
        issues.push({ id: 'spellbook-count', step: 'spells', severity: 'error', message: '法术书内容尚未完成，或准备了不在书中的法术。', resolution: `法术书需要包含至少${requiredSpellbook}个当前可用法师法术（抄录所得不计入）。` })
      }
      if (
        spellcasting.mode === 'spellbook'
        && draft.spellSelections.transcribedSpellIds.some((id) =>
          !draft.spellSelections.spellbookSpellIds.includes(id) || !availableIds.has(id),
        )
      ) {
        issues.push({ id: 'spellbook-transcription-invalid', step: 'spells', severity: 'error', message: '抄录记录包含不在法术书中或当前不可用的法术。', resolution: '返回角色卡法术页签检查抄录记录。' })
      }
    }
    const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId, enabledSourceIds: draft.enabledSourceIds, selections: draft.selections })
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
        const featBonus = /^feat-bonus-(str|dex|con|int|wis|cha)-1$/.exec(optionId)
        if (featBonus) {
          const ability = featBonus[1] as keyof ReturnType<typeof deriveAbilities>
          if (deriveAbilities(draft, checkpoint.id)[ability] >= 20) {
            issues.push({
              id: `feat-ability-cap-${checkpoint.id}-${optionId}`,
              step: checkpoint.step,
              severity: 'error',
              message: `${checkpoint.level}级「${option?.name ?? optionId}」无法应用。`,
              resolution: '专长属性提高后会超过20。',
            })
          }
        }
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
          const spellcasting = getSpellcastingConfig(draft)
          const eligibility = getFeatEligibility(selectedFeat, {
            abilities: deriveAbilities(draft, checkpoint.id),
            classId: draft.classId,
            canCastSpells: Boolean(spellcasting && checkpoint.level >= spellcasting.startsAtLevel),
            raceId: draft.raceId,
            subraceId: draft.subraceId,
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
        } else if (option?.status === 'selectable') {
          issues.push({
            id: `selectable-${checkpoint.id}-${optionId}`,
            step: checkpoint.step,
            severity: 'warning',
            message: `「${option.name}」可以选择，但包含需要桌面裁定的情境效果。`,
            resolution: '结构化选择与可表达派生会自动处理，其余效果请参照来源摘要。',
          })
        }
      }
    }
    for (const group of new Set(timeline.map((checkpoint) => checkpoint.uniqueGroup).filter((value): value is string => Boolean(value)))) {
      const selectedIds = timeline
        .filter((checkpoint) => checkpoint.uniqueGroup === group)
        .flatMap((checkpoint) => draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)?.optionIds ?? [])
      if (new Set(selectedIds).size !== selectedIds.length) {
        issues.push({ id: `duplicate-option-group-${group}`, step: 'timeline', severity: 'error', message: '同一唯一选项组在不同等级重复选择了条目。', resolution: '每次新增选项都必须选择该组中尚未掌握的条目。' })
      }
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
  issues.push(...validateRaceSkillChoices(draft))
  return issues
}

/** 校验种族自选技能/工具熟练：数量、选项合法性、吉斯洋基技能/工具互斥。 */
function validateRaceSkillChoices(draft: CharacterDraft): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const race = draft.subraceId
    ? rulesRepository.getRace(draft.subraceId)
    : draft.raceId
      ? rulesRepository.getRace(draft.raceId)
      : undefined
  if (!race) return issues
  const isGithyanki = race.id === 'race-2014-gith-githyanki'
  const chosen = draft.raceSkillChoices ?? []
  const toolChosen = Boolean(race.toolProficiencyChoices && draft.raceToolChoice)
  const skillSpec = race.skillProficiencyChoices
  if (skillSpec) {
    // 吉斯洋基选了工具侧时不再要求技能（二选一）。
    if (!(isGithyanki && toolChosen) && chosen.length !== skillSpec.count) {
      issues.push({
        id: 'race-skill-choice-count',
        step: 'origin',
        severity: 'error',
        message: isGithyanki && chosen.length === 0
          ? `${race.name}需要选择一项技能或工具熟练。`
          : `${race.name}需要选择${skillSpec.count}项技能熟练。`,
        resolution: `已选 ${chosen.length} 项，请返回起源步骤补选或移除。`,
      })
    }
    const allowed = skillSpec.optionIds ?? SKILL_IDS
    for (const skillId of chosen) {
      if (!allowed.includes(skillId)) {
        issues.push({
          id: `race-skill-choice-invalid-${skillId}`,
          step: 'origin',
          severity: 'error',
          message: `${race.name}的技能熟练选项“${skillId}”不在可选范围内。`,
          resolution: '请返回起源步骤重新选择。',
        })
      }
    }
    if (isGithyanki && toolChosen && chosen.length > 0) {
      issues.push({
        id: 'githyanki-choice-exclusive',
        step: 'origin',
        severity: 'error',
        message: '吉斯洋基人的腐化精通只能选择一项技能或工具熟练。',
        resolution: '请只保留技能或工具其中一项。',
      })
    }
  }
  if (race.toolProficiencyChoices && !isGithyanki && !draft.raceToolChoice) {
    // 工具熟练不参与派生，未选仅提示（不阻塞角色完成）。
    issues.push({
      id: 'race-tool-choice-missing',
      step: 'origin',
      severity: 'warning',
      message: `${race.name}可自选一种工具熟练。`,
      resolution: '在起源步骤选择工具（仅记录与展示，不影响数值）。',
    })
  }
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
  for (const feature of features) {
    if (!feature.requiresChoice || !feature.optionIds?.length) continue
    // 未解锁等级的特性不校验（与时间线检查点按等级过滤一致）。
    if (feature.level > draft.targetLevel) continue
    const min = feature.minSelections ?? 1
    const max = feature.maxSelections ?? 1
    const checkpointId = `subclass-feature-${feature.id}`
    const count = draft.selections
      .find((item) => item.checkpointId === checkpointId && !item.invalidatedAt)
      ?.optionIds.length ?? 0
    if (count < min) {
      issues.push({
        id: `subclass-feature-choice-${feature.id}`,
        step: 'timeline',
        severity: 'warning',
        message: `子职特性「${feature.name}」需要选择${min === max ? min : `${min}—${max}`}项。`,
        resolution: '完成子职特性选择后角色资料才完整。',
      })
    } else if (count > max) {
      issues.push({
        id: `subclass-feature-exclusive-${feature.id}`,
        step: 'timeline',
        severity: 'error',
        message: max === 1
          ? `子职特性「${feature.name}」的选项互斥。`
          : `子职特性「${feature.name}」最多只能选择 ${max} 项。`,
        resolution: max === 1 ? '每个特性只能选择其中一项。' : `请移除多余选项，仅保留 ${max} 项。`,
      })
    }
  }
  return issues
}
