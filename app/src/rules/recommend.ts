import type { BackgroundRule, ClassDetailSummary, ClassRule, RaceRule, RulesRepository } from '@/types/rules'
import type { ClassGrowthSummaryItem } from '@/types/rules'
import type { AbilityKey } from '@/types/character'
import { ABILITY_KEYS, ABILITY_LABELS } from '@/rules/data/ability-labels'

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

/** 属性键白名单校验：`primaryAbilities` / `savingThrowAbilities` 声明为字符串数组，非法值原样返回。 */
function abilityLabel(key: string): string {
  return (ABILITY_KEYS as readonly string[]).includes(key)
    ? ABILITY_LABELS[key as AbilityKey]
    : key
}

/**
 * 职业详情速览：主要属性、豁免熟练与生命骰（职业卡片展开区展示用）。
 * 组件只负责渲染，不硬编码标签文案。
 */
export function getClassDetailSummary(classRule: ClassRule): ClassDetailSummary {
  return {
    abilities: classRule.primaryAbilities.map(abilityLabel),
    savingThrows: classRule.savingThrowAbilities.map(abilityLabel),
    hitDie: `d${classRule.hitDie}`,
  }
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

/** 推荐排序可消费的最小结构：种族、物种、背景与子种族条目均满足。 */
interface ClassRecommendedItem {
  readonly id: string
  readonly recommendedClassIds: readonly string[]
}

/**
 * 推荐优先的稳定分区（v1.9.1 R1-1／R1-5）：
 * 命中当前职业推荐的条目整体前移，其余条目留在后面；两组内部都保持传入顺序（规则库登记顺序），
 * 因此同一份候选池在完整目录、中英文搜索与来源筛选下都能得到一致结果。
 * 未选择职业时原样返回，不产生空推荐分组；不修改入参，也不排序名称。
 */
export function sortByClassRecommendation<T extends ClassRecommendedItem>(
  items: readonly T[],
  classId?: string,
): readonly T[] {
  if (!classId) return items
  const recommended: T[] = []
  const rest: T[] = []
  for (const item of items) {
    if (item.recommendedClassIds.includes(classId)) recommended.push(item)
    else rest.push(item)
  }
  return [...recommended, ...rest]
}
