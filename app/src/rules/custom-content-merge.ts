import { isCustomEntryId, isCustomSourceId, toClassRule, toFeatRule, toRaceFeatures, toRaceRule, toRuleSource, toSpellRule, toSubclassRule } from '@/rules/custom-content'
import { createRulesRepository } from '@/rules/repository-builder'
import type { ClassRule, RulesRepository } from '@/types/rules'
import type { CustomContentBundle } from '@/types/custom-content'

/** 合并前的完整性检查失败（ID 冲突、规则集混用等）；中文原因直接面向玩家。 */
export class CustomContentConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CustomContentConflictError'
  }
}

/**
 * 把内容库并入内置仓库，返回**新的**只读仓库对象。
 *
 * 关键顺序（需求 §7.3.1）：先完成"自定义法术注入内置职业 `classSpellIds`"，
 * 再派生自定义职业的施法配置；否则自定义职业会拿到注入前的旧法术表。
 *
 * 本函数不修改任何入参数组；内容库为空时调用方应直接使用内置单例（见 `rules/repositories`）。
 * 归档条目照常投影（已选角色可继续解析），但状态为 `unavailable`，因此不会进入新建候选池。
 */
export function mergeCustomContent(base: RulesRepository, bundle: CustomContentBundle): RulesRepository {
  const expansionIds = new Set(bundle.expansions.map((expansion) => expansion.id))
  for (const id of expansionIds) {
    if (!isCustomSourceId(id)) {
      throw new CustomContentConflictError(`自定义扩展 ID「${id}」必须以 source-custom- 开头。`)
    }
  }

  const entries = [...bundle.races, ...bundle.classes, ...bundle.subclasses, ...bundle.feats, ...bundle.spells]
  const builtInIds = new Set<string>([
    ...base.classes.map((item) => item.id),
    ...base.subclasses.map((item) => item.id),
    ...base.races.map((item) => item.id),
    ...base.feats.map((item) => item.id),
    ...base.spells.map((item) => item.id),
    ...base.options.map((item) => item.id),
    ...base.equipment.map((item) => item.id),
    ...base.backgrounds.map((item) => item.id),
    ...base.sources.map((item) => item.id),
  ])
  const seen = new Set<string>()
  for (const entry of entries) {
    if (!isCustomEntryId(entry.id)) {
      throw new CustomContentConflictError(`自定义内容 ID「${entry.id}」必须以 custom- 开头。`)
    }
    if (builtInIds.has(entry.id)) {
      throw new CustomContentConflictError(`自定义内容 ID「${entry.id}」与内置内容冲突，已拒绝合并。`)
    }
    if (seen.has(entry.id)) {
      throw new CustomContentConflictError(`自定义内容 ID「${entry.id}」重复，已拒绝合并。`)
    }
    if (entry.ruleset !== base.ruleset) {
      throw new CustomContentConflictError(`自定义内容「${entry.name}」的规则集与当前规则集不一致。`)
    }
    seen.add(entry.id)
  }

  const sources = [...base.sources, ...bundle.expansions.map(toRuleSource)]
  const spells = [...base.spells, ...bundle.spells.map(toSpellRule)]

  // 自定义法术进入所属职业的法术表（2014 与 2024 口径一致）；归档条目不入池。
  const customSpellIdsByClass = new Map<string, string[]>()
  for (const entry of bundle.spells) {
    if (entry.archived) continue
    for (const classId of entry.classIds) {
      const list = customSpellIdsByClass.get(classId) ?? []
      list.push(entry.id)
      customSpellIdsByClass.set(classId, list)
    }
  }
  const injectedClasses = base.classes.map((classRule) => {
    const extra = customSpellIdsByClass.get(classRule.id)
    if (!extra?.length || !classRule.spellcasting) return classRule
    return {
      ...classRule,
      spellcasting: {
        ...classRule.spellcasting,
        classSpellIds: [...classRule.spellcasting.classSpellIds, ...extra],
      },
    }
  })
  const mergedClassById = new Map(injectedClasses.map((classRule) => [classRule.id, classRule]))
  const getBaseClass = (classId: string): ClassRule | undefined => mergedClassById.get(classId)
  const classes = [...injectedClasses, ...bundle.classes.map((entry) => toClassRule(entry, { getBaseClass }))]

  // 专长需要同时存在于 `feats` 与 `options`（选择面板走 `getOption`）。
  const customFeatRules = bundle.feats.map(toFeatRule)
  const feats = [...base.feats, ...customFeatRules]
  const options = [...base.options, ...customFeatRules]

  const races = [...base.races, ...bundle.races.map(toRaceRule)]
  const raceFeatures = [...base.raceFeatures, ...bundle.races.flatMap(toRaceFeatures)]

  return createRulesRepository(base.ruleset, {
    sources,
    classes,
    subclasses: [...base.subclasses, ...bundle.subclasses.map(toSubclassRule)],
    races,
    backgrounds: base.backgrounds,
    raceFeatures,
    backgroundFeatures: base.backgroundFeatures,
    options,
    feats,
    equipment: base.equipment,
    classStartingEquipment: base.classStartingEquipment,
    backgroundStartingEquipment: base.backgroundStartingEquipment,
    spells,
    weaponMasteries: base.weaponMasteries,
  })
}
