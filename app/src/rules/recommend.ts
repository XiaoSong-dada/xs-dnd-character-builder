import type { BackgroundRule, ClassRule, RaceRule, RulesRepository } from '@/types/rules'
import type { ClassGrowthSummaryItem, ClassRecommendation } from '@/types/rules'
import { ABILITY_LABELS } from '@/rules/data/feats-2014'
import { playPreferences2014, PLAYSTYLE_TAG_LABELS } from '@/rules/data/preferences-2014'

/**
 * 职业推荐：按偏好逐项生成可解释原因并累加权重。
 * score 只用于排序，不表达百分比；status（资料完成度）不参与评分。
 */
export function getClassRecommendation(classRule: ClassRule, preferences: readonly string[]): ClassRecommendation {
  const reasons = preferences.flatMap((preferenceId) => {
    const preference = playPreferences2014.find((item) => item.id === preferenceId)
    if (!preference) return []
    const abilityHits = preference.relatedAbilityKeys.filter((ability) => classRule.primaryAbilities.includes(ability))
    const tagHits = preference.relatedTags.filter((tag) => classRule.playStyleTags.includes(tag))
    if (abilityHits.length === 0 && tagHits.length === 0) return []
    const details = [
      abilityHits.length ? `${abilityHits.map((ability) => ABILITY_LABELS[ability]).join('、')}是主要属性` : '',
      tagHits.length ? `擅长${tagHits.map((tag) => PLAYSTYLE_TAG_LABELS[tag]).join('、')}` : '',
    ].filter(Boolean)
    return [{
      text: `偏好「${preference.label}」：${details.join('，')}`,
      weight: 10 + abilityHits.length * 2 + tagHits.length * 2,
      preferenceLabel: preference.label,
    }]
  })
  return {
    score: reasons.reduce((sum, reason) => sum + reason.weight, 0),
    reasons,
    matchedPreferenceLabels: reasons.map((reason) => reason.preferenceLabel),
  }
}

/**
 * 职业成长速览：由规则数据（生命骰、施法配置、子职选择等级、时间线检查点）推导关键节点，
 * 按等级升序返回。组件只负责渲染，不硬编码任何职业文案。
 */
export function getClassGrowthSummary(
  classRule: ClassRule,
  repository: RulesRepository,
): readonly ClassGrowthSummaryItem[] {
  const items: ClassGrowthSummaryItem[] = [{ level: 1, title: `生命骰 d${classRule.hitDie}` }]
  const spellcasting = classRule.spellcasting
  if (spellcasting) {
    items.push({ level: spellcasting.startsAtLevel, title: `开始施法（${ABILITY_LABELS[spellcasting.ability]}）` })
  }
  const subclassLevels = [...new Set(
    repository.subclasses
      .filter((subclass) => subclass.classId === classRule.id)
      .map((subclass) => subclass.selectionLevel),
  )].sort((a, b) => a - b)
  for (const level of subclassLevels) {
    items.push({ level, title: '选择子职' })
  }
  const seen = new Set<string>()
  for (const checkpoint of classRule.checkpoints) {
    if (checkpoint.kind === 'subclass') continue
    const key = `${checkpoint.level}:${checkpoint.title}`
    if (seen.has(key)) continue
    seen.add(key)
    items.push({ level: checkpoint.level, title: checkpoint.title })
  }
  return items.sort((a, b) => a.level - b.level)
}

export function getRaceRecommendationReason(race: RaceRule, classRule?: ClassRule): string | undefined {
  if (!classRule || !race.recommendedClassIds.includes(classRule.id)) return undefined
  const hitAbilities = (Object.keys(race.fixedAbilityBonuses) as (keyof typeof race.fixedAbilityBonuses)[])
    .filter((ability) => classRule.primaryAbilities.includes(ability))
  if (hitAbilities.length) {
    return `${hitAbilities.map((ability) => ABILITY_LABELS[ability]).join('、')}加值契合${classRule.name}的主要属性`
  }
  return '属性或种族能力与该职业常见玩法契合'
}

export function getBackgroundRecommendationReason(background: BackgroundRule, classRule?: ClassRule): string | undefined {
  if (!classRule || !background.recommendedClassIds.includes(classRule.id)) return undefined
  const classSkillOptionIds = new Set(
    classRule.checkpoints
      .filter((checkpoint) => checkpoint.kind === 'skills')
      .flatMap((checkpoint) => checkpoint.optionIds),
  )
  const hitSkills = background.skillIds.filter((skillId) => classSkillOptionIds.has(skillId))
  if (hitSkills.length) {
    return `提供的技能是该职业可选熟练，契合常见玩法`
  }
  return '技能与职业常见玩法契合'
}
