import { rulesRepository } from '@/rules/repository'
import { areBaseAbilitiesValid } from '@/rules/abilities'
import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft, ValidationIssue } from '@/types/character'

export function validateDraft(draft: CharacterDraft): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!draft.classId) issues.push({ id: 'class-required', step: 'class', severity: 'error', message: '尚未选择职业。', resolution: '返回职业步骤选择一个职业。' })
  if (!draft.backgroundId || !draft.raceId) issues.push({ id: 'origin-required', step: 'origin', severity: 'error', message: '角色起源尚未完成。', resolution: '选择2014种族和背景。' })
  if (!draft.name.trim()) issues.push({ id: 'name-required', step: 'identity', severity: 'error', message: '角色还没有名字。', resolution: '填写角色姓名。' })
  if (!areBaseAbilitiesValid(draft.baseAbilities, draft.abilityMethod)) {
    issues.push({
      id: 'ability-method-invalid',
      step: 'abilities',
      severity: 'error',
      message: '基础属性不符合所选生成方式。',
      resolution: draft.abilityMethod === 'standard-array'
        ? '恰好使用15、14、13、12、10、8各一次。'
        : draft.abilityMethod === 'point-buy'
          ? '将每项保持在8—15，并把总花费降至27点以内。'
          : '将每项基础属性保持在3—20。',
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
  const flexibleRule = subrace?.flexibleBonusCount ? subrace : race
  if (
    (flexibleRule?.flexibleBonusCount ?? 0) !== draft.raceAbilityChoices.length
    || draft.raceAbilityChoices.length !== new Set(draft.raceAbilityChoices).size
  ) {
    issues.push({ id: 'race-ability-choice', step: 'abilities', severity: 'error', message: '种族自选属性加值尚未完成。', resolution: `选择${flexibleRule?.flexibleBonusCount ?? 0}项不同属性。` })
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
    const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId })
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
  }
  return issues
}
