import type { RuleOption, SubclassRule } from '@/types/rules'
import { barbarianSubclasses2024 } from '@/rules/data/barbarian-2024'
import { clericSubclasses2024 } from '@/rules/data/cleric-2024'
import { fighterSubclasses2024 } from '@/rules/data/fighter-2024'
import { monkSubclasses2024 } from '@/rules/data/monk-2024'
import { rogueSubclasses2024 } from '@/rules/data/rogue-2024'
import { wizardSubclasses2024 } from '@/rules/data/wizard-2024'

/** 2024 子职装配列表：按 B08 批次逐批追加。 */
export const subclasses2024: readonly SubclassRule[] = [
  ...barbarianSubclasses2024,
  ...clericSubclasses2024,
  ...fighterSubclasses2024,
  ...monkSubclasses2024,
  ...rogueSubclasses2024,
  ...wizardSubclasses2024,
]

/** 子职选项投影：供时间线候选显示与来源过滤解析。 */
export const subclassOptions2024: readonly RuleOption[] = subclasses2024.map((subclass) => ({
  id: subclass.id,
  name: subclass.name,
  englishName: subclass.englishName,
  description: `${subclass.englishName} · ${subclass.summary}`,
  status: subclass.status,
  sourceIds: subclass.sourceIds,
}))
