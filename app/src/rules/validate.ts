import { getRulesRepository } from '@/rules/repositories'
import { deriveAbilities } from '@/rules/derive'
import { getFeatEligibilityContext } from '@/rules/feat-eligibility'
import {
  collectFeatSkillSelections,
  decodeAbilityImprovement,
  getAbilityImprovementEligibility,
  getCheckpointSelectionBounds,
  getFeatEligibility,
  listFeatGrants,
  type FeatGrant,
} from '@/rules/feats'
import { areBaseAbilitiesValid, areOriginAbilitiesWithinCap } from '@/rules/abilities'
import { getFlexibleBonusRule, getRaceAbilityBonuses, SKILL_IDS } from '@/rules/derive'
import { buildTimeline } from '@/rules/timeline'
import { getAvailableSpells, getCheckpointCandidates, getRequiredCantripCount, getRequiredSpellbookCount, getRequiredSpellCount, getSelectedSpellIds, getSpellbookExtraAllowance, getSpellbookExtraCandidates, getSpellcastingConfig } from '@/rules/spellcasting'
import { getLanguageOptions, getRequiredLanguageCount } from '@/rules/languages'
import { getBackgroundAllocationIssue, getOriginStepBlockers, getSpeciesProficiencyBlockers } from '@/rules/origins'
import { validateWeaponMasterySelection } from '@/rules/weapon-mastery'
import { buildStartingEquipmentState, isStartingEquipmentComplete } from '@/rules/starting-equipment'
import { isSourceEnabled } from '@/rules/source-books'
import { artificerInfusions2014, getArtificerInfusedItemLimit } from '@/rules/data/artificer-2014'
import { artificerReplicatePlans2024, getArtificerReplicatedItemLimit2024 } from '@/rules/data/ua-artificer-2024'
import type { AbilityKey, CharacterDraft, ValidationIssue } from '@/types/character'

export function validateDraft(draft: CharacterDraft): readonly ValidationIssue[] {
  const repository = getRulesRepository(draft.ruleset)
  const issues: ValidationIssue[] = []
  const requireEnabled = (
    id: string,
    step: ValidationIssue['step'],
    label: string,
    rule: { readonly sourceIds: readonly string[] } | undefined,
  ): void => {
    if (rule && !isSourceEnabled(rule.sourceIds, draft.enabledSourceIds, repository)) {
      issues.push({
        id: `source-disabled-${id}`,
        step,
        severity: 'error',
        message: `${label}的来源扩展书已关闭。`,
        resolution: '在第 2 步重新启用对应扩展书，或更换该选择。',
      })
    }
  }
  requireEnabled(draft.classId ?? 'class', 'class', `职业“${draft.classId ? repository.getClass(draft.classId)?.name ?? draft.classId : ''}”`, draft.classId ? repository.getClass(draft.classId) : undefined)
  requireEnabled(draft.subclassId ?? 'subclass', 'timeline', `子职“${draft.subclassId ? repository.getSubclass(draft.subclassId)?.name ?? draft.subclassId : ''}”`, draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined)
  requireEnabled(draft.raceId ?? 'race', 'origin', `种族“${draft.raceId ? repository.getRace(draft.raceId)?.name ?? draft.raceId : ''}”`, draft.raceId ? repository.getRace(draft.raceId) : undefined)
  requireEnabled(draft.subraceId ?? 'subrace', 'origin', `子种族“${draft.subraceId ? repository.getRace(draft.subraceId)?.name ?? draft.subraceId : ''}”`, draft.subraceId ? repository.getRace(draft.subraceId) : undefined)
  requireEnabled(draft.backgroundId ?? 'background', 'origin', `背景“${draft.backgroundId ? repository.getBackground(draft.backgroundId)?.name ?? draft.backgroundId : ''}”`, draft.backgroundId ? repository.getBackground(draft.backgroundId) : undefined)
  requireEnabled(draft.backgroundVariantId ?? 'background-variant', 'origin', `背景变体“${draft.backgroundVariantId ? repository.getBackground(draft.backgroundVariantId)?.name ?? draft.backgroundVariantId : ''}”`, draft.backgroundVariantId ? repository.getBackground(draft.backgroundVariantId) : undefined)
  for (const selection of draft.selections.filter((item) => !item.invalidatedAt)) {
    for (const optionId of selection.optionIds) {
      const option = repository.getOption(optionId) ?? repository.getFeat(optionId)
      requireEnabled(`${selection.checkpointId}-${optionId}`, 'timeline', `选择“${option?.name ?? optionId}”`, option)
    }
  }
  for (const entry of draft.inventory) {
    const item = repository.getEquipment(entry.itemId)
    requireEnabled(`item-${entry.id}`, 'equipment', `物品“${item?.name ?? entry.itemId}”`, item)
  }
  if (!draft.classId) issues.push({ id: 'class-required', step: 'class', severity: 'error', message: '尚未选择职业。', resolution: '返回职业步骤选择一个职业。' })
  if (!draft.backgroundId || !draft.raceId) issues.push({ id: 'origin-required', step: 'origin', severity: 'error', message: '角色起源尚未完成。', resolution: draft.ruleset === '5e-2024' ? '选择物种与背景。' : '选择种族和背景。' })
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
    (entry.sourceKind !== 'adventure' && !repository.getEquipment(entry.itemId))
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
    && Boolean(isSourceEnabled(repository.getClass(draft.classId)?.sourceIds ?? [], draft.enabledSourceIds, repository))
  const replicateActive = draft.classId === 'class-2024-ua-artificer'
    && Boolean(isSourceEnabled(repository.getClass(draft.classId)?.sourceIds ?? [], draft.enabledSourceIds, repository))
  const infusionAssignments = draft.infusionAssignments ?? []
  if (infusionAssignments.length > 0 && !infusionActive && !replicateActive) {
    issues.push({ id: 'infusions-inactive', step: 'equipment', severity: 'warning', message: '奇械师灌注／仿制绑定已保留，但当前职业或来源不允许它们生效。', resolution: '重新选择奇械师并启用对应来源后会自动恢复。' })
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
      const item = entry ? repository.getEquipment(entry.itemId) : undefined
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
  if (replicateActive) {
    const knownPlanIds = new Set(draft.selections
      .filter((selection) => selection.checkpointId.startsWith('artificer-2024-plans-') && !selection.invalidatedAt)
      .flatMap((selection) => selection.optionIds))
    const limit = getArtificerReplicatedItemLimit2024(draft.targetLevel)
    if (infusionAssignments.length > limit) {
      issues.push({ id: 'replicate-limit', step: 'equipment', severity: 'error', message: '同时存在的仿制魔法物品超过当前奇械师等级上限。', resolution: `当前最多同时存在 ${limit} 件仿制魔法物品。` })
    }
    const planIds = infusionAssignments.map((assignment) => assignment.infusionId)
    const itemEntryIds = infusionAssignments.map((assignment) => assignment.inventoryEntryId)
    if (new Set(planIds).size !== planIds.length) issues.push({ id: 'replicate-duplicate', step: 'equipment', severity: 'error', message: '同一个仿制方案被重复使用。', resolution: '每件仿制物品必须基于不同的已知方案。' })
    if (new Set(itemEntryIds).size !== itemEntryIds.length) issues.push({ id: 'replicate-item-duplicate', step: 'equipment', severity: 'error', message: '同一件物品不能承载多个仿制绑定。', resolution: '为重复绑定的仿制方案更换物品。' })
    for (const assignment of infusionAssignments) {
      const planRule = artificerReplicatePlans2024.find((item) => item.id === assignment.infusionId)
      const entry = draft.inventory.find((item) => item.id === assignment.inventoryEntryId)
      const item = entry ? repository.getEquipment(entry.itemId) : undefined
      if (!planRule || !knownPlanIds.has(assignment.infusionId)) {
        issues.push({ id: `replicate-not-known-${assignment.infusionId}`, step: 'equipment', severity: 'error', message: `仿制方案“${planRule?.name ?? assignment.infusionId}”尚未掌握或因降级失效。`, resolution: '返回时间线检查已知仿制方案。' })
      } else if (planRule.minimumLevel > draft.targetLevel) {
        issues.push({ id: `replicate-level-${assignment.infusionId}`, step: 'equipment', severity: 'error', message: `仿制方案“${planRule.name}”的等级前置不满足。`, resolution: `需要奇械师 ${planRule.minimumLevel} 级。` })
      }
      if (!entry || !item) {
        issues.push({ id: `replicate-item-missing-${assignment.infusionId}`, step: 'equipment', severity: 'error', message: '仿制绑定对应的物品已被删除或无法解析。', resolution: '保留的绑定已停止应用；请重新创造或选择该方案对应的魔法物品。' })
      } else if (planRule && item.id !== planRule.replicateItemId) {
        issues.push({ id: `replicate-item-mismatch-${assignment.infusionId}`, step: 'equipment', severity: 'error', message: `物品“${item.name}”与方案“${planRule.name}”不匹配。`, resolution: '绑定到该方案可创造的魔法物品条目。' })
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
  if (!areBaseAbilitiesValid(draft.baseAbilities, draft.abilityMethod, draft.ruleset)) {
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

  const race = draft.raceId ? repository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? repository.getRace(draft.subraceId) : undefined
  // 起源类问题统一由 getOriginStepBlockers 判定（B09-07），此处只负责映射为校验条目。
  const originBlockers = getOriginStepBlockers(draft, repository)
  if (originBlockers.some((blocker) => blocker.id === 'subrace-required')) {
    issues.push({ id: 'subrace-required', step: 'origin', severity: 'error', message: `${race?.name ?? ''}需要选择子种族。`, resolution: '在种族卡片下选择一个子种族。' })
  }
  if (originBlockers.some((blocker) => blocker.id === 'subrace-mismatch')) {
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
  const requiredLanguages = getRequiredLanguageCount(draft, repository)
  if (originBlockers.some((blocker) => blocker.id === 'background-languages')) {
    issues.push({
      id: 'background-languages',
      step: 'origin',
      severity: 'error',
      message: draft.ruleset === '5e-2024' ? '语言选择尚未完成。' : '背景语言选择尚未完成。',
      resolution: `请选择${requiredLanguages}种不同的额外语言。`,
    })
  }
  if (draft.ruleset === '5e-2024') {
    const languageOptions = new Set(getLanguageOptions('5e-2024'))
    if (draft.languages.some((language) => !languageOptions.has(language))) {
      issues.push({
        id: 'language-invalid',
        step: 'origin',
        severity: 'error',
        message: '语言选择包含标准表之外的选项。',
        resolution: '从通用手语、龙语、矮人语、精灵语、巨人语、侏儒语、地精语、半身人语、兽人语中选择。',
      })
    }
    const allocationIssue = getBackgroundAllocationIssue(draft, repository)
    if (originBlockers.some((blocker) => blocker.id === 'background-ability-allocation')) {
      issues.push({
        id: 'background-ability-allocation',
        step: 'abilities',
        severity: 'error',
        message: '背景属性加值分配不合法。',
        resolution: allocationIssue,
      })
    }
    if (originBlockers.some((blocker) => blocker.id === 'species-size-required')) {
      issues.push({
        id: 'species-size-required',
        step: 'origin',
        severity: 'error',
        message: '物种需要选择体型。',
        resolution: '选择小型或中型。',
      })
    }
  }

  if (draft.classId) {
    const classRule = repository.getClass(draft.classId)
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
      const requiredCantripSpellIds = spellcasting.requiredCantripSpellIds ?? []
      const missingRequiredCantrips = requiredCantripSpellIds.filter((id) => !draft.spellSelections.cantripIds.includes(id))
      if (missingRequiredCantrips.length > 0 && draft.spellSelections.cantripIds.length > 0) {
        const names = missingRequiredCantrips.map((id) => repository.getSpell(id)?.name ?? id).join('、')
        issues.push({
          id: 'required-cantrip-missing',
          step: 'spells',
          severity: 'warning',
          message: `子职要求包含的戏法“${names}”尚未选择。`,
          resolution: '诡术师的戏法必须包含法师之手；可在法术步骤补齐（提示级，不阻断草稿保存）。',
        })
      }
      // 抄录与子职额外入书的法术不计入升级名额：非抄录、非额外法术至少达到 requiredSpellbook。
      const transcribedBookIds = draft.spellSelections.transcribedSpellIds
      const extraBookIds = draft.spellSelections.spellbookExtraSpellIds ?? []
      const nonTranscribedBookCount = draft.spellSelections.spellbookSpellIds
        .filter((id) => !transcribedBookIds.includes(id) && !extraBookIds.includes(id)).length
      if (
        spellcasting.mode === 'spellbook'
        && (
          nonTranscribedBookCount < requiredSpellbook
          || draft.spellSelections.spellbookSpellIds.some((id) => !availableIds.has(id))
          || selectedSpellIds.some((id) => !draft.spellSelections.spellbookSpellIds.includes(id))
        )
      ) {
        issues.push({ id: 'spellbook-count', step: 'spells', severity: 'error', message: '法术书内容尚未完成，或准备了不在书中的法术。', resolution: `法术书需要包含至少${requiredSpellbook}个当前可用法师法术（抄录与额外入书不计入）。` })
      }
      if (spellcasting.mode === 'spellbook') {
        const extraAllowance = getSpellbookExtraAllowance(draft, spellcasting)
        const extraCandidates = new Set(getSpellbookExtraCandidates(draft, spellcasting).map((spell) => spell.id))
        const invalidExtras = extraBookIds.filter((id) =>
          !draft.spellSelections.spellbookSpellIds.includes(id)
          || !extraCandidates.has(id)
          || transcribedBookIds.includes(id),
        )
        if (extraBookIds.length > extraAllowance || invalidExtras.length > 0) {
          issues.push({
            id: 'spellbook-extra-invalid',
            step: 'spells',
            severity: 'error',
            message: '子职额外入书选择不符合规则。',
            resolution: `最多可额外入书${extraAllowance}道限定学派的法师法术，且必须同时在法术书中。`,
          })
        }
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
    const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId, enabledSourceIds: draft.enabledSourceIds, selections: draft.selections, ruleset: draft.ruleset, raceId: draft.raceId, backgroundId: draft.backgroundId })
    const checkpointLevels = new Map(timeline.map((checkpoint) => [checkpoint.id, checkpoint.level]))
    const isV2024 = repository.ruleset === '5e-2024'
    for (const checkpoint of timeline) {
      const selection = draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)
      const count = selection?.optionIds.length ?? 0
      const bounds = getCheckpointSelectionBounds(draft, checkpoint)
      if (checkpoint.required && (count < bounds.min || count > bounds.max)) {
        issues.push({
          id: `checkpoint-${checkpoint.id}`,
          step: checkpoint.step,
          severity: 'error',
          message: `${checkpoint.level}级「${checkpoint.title}」尚未完成。`,
          resolution: `需要选择${bounds.min === bounds.max ? bounds.min : `${bounds.min}—${bounds.max}`}项。`,
        })
      }
      if (isV2024 && checkpoint.candidateKind === 'weapon-mastery' && selection) {
        // 武器精通：非法候选由通用候选检查处理（含近战限定）；此处只补充重复选择校验。
        const masteryIssues = validateWeaponMasterySelection(repository, selection, bounds.min)
          .filter((message) => message === '同一种武器不能重复选择。')
        for (const message of masteryIssues) {
          issues.push({
            id: `weapon-mastery-${checkpoint.id}`,
            step: checkpoint.step,
            severity: 'error',
            message,
            resolution: '从当前规则版本的武器中重新选择武器精通。',
          })
        }
      }
      if (isV2024 && checkpoint.candidateKind && selection) {
        const candidates = new Set(getCheckpointCandidates(draft, checkpoint))
        for (const optionId of selection.optionIds) {
          if (candidates.has(optionId)) continue
          issues.push({
            id: `checkpoint-candidate-${checkpoint.id}-${optionId}`,
            step: checkpoint.step,
            severity: 'error',
            message: `${checkpoint.level}级「${checkpoint.title}」包含当前不可选的条目。`,
            resolution: '移除该条目并重新从候选池选择。',
          })
        }
      }
      // 2024：前置按获得节点校验，不使用最终属性。
      const abilitiesBefore = isV2024
        ? deriveAbilities(draft, checkpoint.id, { belowLevel: checkpoint.level, checkpointLevels })
        : deriveAbilities(draft, checkpoint.id)
      for (const optionId of selection?.optionIds ?? []) {
        const option = repository.getOption(optionId) ?? repository.getFeat(optionId)
        // 选项等级先决（如 2024 魔能祈唤）与依赖先决（如魔能斩需先选刃之魔契）。
        if (option?.minimumLevel && option.minimumLevel > draft.targetLevel) {
          issues.push({
            id: `option-level-${checkpoint.id}-${optionId}`,
            step: checkpoint.step,
            severity: 'error',
            message: `「${option.name}」需要 ${option.minimumLevel} 级才能选择。`,
            resolution: '提高目标等级，或移除该选择。',
          })
        }
        if (option?.requiredOptionIds?.length) {
          const activeOptionIds = new Set(draft.selections.filter((item) => !item.invalidatedAt).flatMap((item) => item.optionIds))
          const missing = option.requiredOptionIds.filter((id) => !activeOptionIds.has(id))
          if (missing.length > 0) {
            const names = missing.map((id) => repository.getOption(id)?.name ?? id).join('、')
            issues.push({
              id: `option-prerequisite-${checkpoint.id}-${optionId}`,
              step: checkpoint.step,
              severity: 'error',
              message: `「${option.name}」需要先选择：${names}。`,
              resolution: '先选择前置祈唤，或移除该选择。',
            })
          }
        }
        if (option?.requiredSpellIds?.length) {
          const knownSpellIds = new Set([
            ...draft.spellSelections.cantripIds,
            ...draft.spellSelections.knownSpellIds,
            ...draft.spellSelections.preparedSpellIds,
            ...draft.spellSelections.spellbookSpellIds,
            ...draft.spellSelections.transcribedSpellIds,
          ])
          const missingSpells = option.requiredSpellIds.filter((id) => !knownSpellIds.has(id))
          if (missingSpells.length > 0) {
            const names = missingSpells.map((id) => repository.getSpell(id)?.name ?? id).join('、')
            issues.push({
              id: `option-spell-prerequisite-${checkpoint.id}-${optionId}`,
              step: checkpoint.step,
              severity: 'error',
              message: `「${option.name}」需要先习得法术：${names}。`,
              resolution: '先在法术步骤习得该法术，或移除该选择。',
            })
          }
        }
        const featBonus = /^feat-bonus-(str|dex|con|int|wis|cha)-([12])$/.exec(optionId)
        if (featBonus) {
          const ability = featBonus[1] as keyof ReturnType<typeof deriveAbilities>
          const amount = Number(featBonus[2])
          const abilityCap = checkpoint.abilityCap ?? 20
          if (abilitiesBefore[ability] + amount > abilityCap) {
            issues.push({
              id: `feat-ability-cap-${checkpoint.id}-${optionId}`,
              step: checkpoint.step,
              severity: 'error',
              message: `${checkpoint.level}级「${option?.name ?? optionId}」无法应用。`,
              resolution: `专长属性提高后会超过${abilityCap}。`,
            })
          }
        }
        const abilityImprovement = decodeAbilityImprovement(optionId)
        if (abilityImprovement) {
          const eligibility = getAbilityImprovementEligibility(abilitiesBefore, optionId, checkpoint.abilityCap ?? 20)
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
        const selectedFeat = repository.getFeat(optionId)
        if (selectedFeat && draft.classId) {
          const eligibility = getFeatEligibility(
            selectedFeat,
            getFeatEligibilityContext(draft, { checkpointId: checkpoint.id, checkpointLevel: checkpoint.level }),
          )
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
        if (isV2024 && checkpoint.grantSavingThrowProficiency) {
          const saveMatch = /^feat-bonus-(str|dex|con|int|wis|cha)-1$/.exec(optionId)
          const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
          if (saveMatch && classRule?.savingThrowAbilities.includes(saveMatch[1] as AbilityKey)) {
            issues.push({
              id: `feat-save-proficiency-${checkpoint.id}-${optionId}`,
              step: checkpoint.step,
              severity: 'error',
              message: `「${checkpoint.title}」不能选择已经拥有豁免熟练的属性。`,
              resolution: '选择一项尚无豁免熟练的属性。',
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
    if (isV2024) {
      const byFeat = new Map<string, FeatGrant[]>()
      for (const grant of listFeatGrants(draft, repository)) {
        const list = byFeat.get(grant.featId) ?? []
        list.push(grant)
        byFeat.set(grant.featId, list)
      }
      const titleById = new Map(timeline.map((checkpoint) => [checkpoint.id, checkpoint.title]))
      for (const [featId, list] of byFeat) {
        const feat = repository.getFeat(featId)
        if (!feat || feat.repeatable || list.length <= 1) continue
        const labels = list.map((grant) => grant.sourceKind === 'background'
          ? `背景：${repository.getBackground(grant.sourceId)?.name ?? grant.sourceId}`
          : titleById.get(grant.checkpointId ?? '') ?? grant.sourceId)
        issues.push({
          id: `feat-duplicate-${featId}`,
          step: 'timeline',
          severity: 'error',
          message: `不可复选专长「${feat.name}」被重复取得（${labels.join('、')}）。`,
          resolution: '更换其中一处来源；背景、物种与职业授予的同一专长只能取得一次。',
        })
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
    if (isV2024) {
      const featSkills = collectFeatSkillSelections(draft, repository)
      for (const skillId of featSkills.proficiencies) proficientIds.add(skillId)
      if (featSkills.allSkills) {
        for (const skillId of SKILL_IDS) proficientIds.add(skillId)
      }
    }
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
  const repository = getRulesRepository(draft.ruleset)
  const issues: ValidationIssue[] = []
  const race = draft.subraceId
    ? repository.getRace(draft.subraceId)
    : draft.raceId
      ? repository.getRace(draft.raceId)
      : undefined
  if (!race) return issues
  const isGithyanki = race.id === 'race-2014-gith-githyanki'
  // 物种熟练的错误级判定统一来自规则层（B09-07）；此处只映射为校验条目。
  for (const blocker of getSpeciesProficiencyBlockers(draft, repository)) {
    issues.push({ id: blocker.id, step: 'origin', severity: 'error', message: blocker.message, resolution: blocker.resolution })
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
  const repository = getRulesRepository(draft.ruleset)
  const issues: ValidationIssue[] = []
  if (!draft.classId || !draft.subclassId) return issues
  const subclass = repository.getSubclass(draft.subclassId)
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
    issues.push({ id: 'subclass-index-only', step: 'timeline', severity: 'warning', message: `“${subclass.name}”目前只有规则索引。`, resolution: '可以继续生成预览草稿，但不能标记为资料完整角色。' })
  }
  const features = repository.getSubclass(draft.subclassId)?.features ?? []
  for (const feature of features) {
    if (!feature.requiresChoice || ((feature.optionIds?.length ?? 0) === 0 && (feature.featCategories?.length ?? 0) === 0)) continue
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
