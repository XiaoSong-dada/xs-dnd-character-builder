import { classPreviews2014 } from '@/rules/data/classes-2014'
import { arcaneCasterClasses2014, arcaneCasterOptions2014 } from '@/rules/data/arcane-casters-2014'
import { fighterOptions, fighterRule } from '@/rules/data/fighter'
import { martialClasses2014, martialOptions2014 } from '@/rules/data/martials-2014'
import { equipment2014 } from '@/rules/data/equipment-2014'
import { abilityImprovementOptions2014, feats2014 } from '@/rules/data/feats-2014'
import { halfCasterClasses2014, halfCasterOptions2014 } from '@/rules/data/half-casters-2014'
import { fullCasterClasses2014 } from '@/rules/data/full-casters-2014'
import { backgrounds2014, races2014 } from '@/rules/data/origins-2014'
import { backgroundStartingEquipment2014, classStartingEquipment2014 } from '@/rules/data/starting-equipment-2014'
import { subclasses2014, subclassOptions2014 } from '@/rules/data/subclasses-2014'
import { spells2014 } from '@/rules/data/spells-2014'
import type { RulesRepository } from '@/types/rules'

const sources = [
  { id: 'basic-rules-2014', title: '2014 Basic Rules / SRD 5.1', ruleset: '5e-2014' as const, url: 'https://www.dndbeyond.com/sources/dnd/basic-rules-2014' },
  { id: 'phb-2014-index', title: '2014 玩家手册索引', ruleset: '5e-2014' as const },
  { id: 'dmg-2014-index', title: '2014 地下城主指南索引', ruleset: '5e-2014' as const },
  { id: 'scag-2015-index', title: '剑湾冒险者指南索引', ruleset: '5e-2014' as const },
  { id: 'xgte-2017-index', title: '珊娜萨的万事指南索引', ruleset: '5e-2014' as const },
  { id: 'egtw-2020-index', title: '荒洲探险者指南索引', ruleset: '5e-2014' as const },
  { id: 'tcoe-2020-index', title: '塔莎的万事坩埚索引', ruleset: '5e-2014' as const },
  { id: 'scc-2021-index', title: '斯翠海文：混沌课程索引', ruleset: '5e-2014' as const },
  { id: 'vrgtr-2021-index', title: '范·里希滕的鸦阁指南索引', ruleset: '5e-2014' as const },
  { id: 'ftd-2021-index', title: '费兹班的巨龙宝库索引', ruleset: '5e-2014' as const },
  { id: 'dsotdq-2022-index', title: '龙枪：龙后之影索引', ruleset: '5e-2014' as const },
  { id: 'bigby-2023-index', title: '毕格比的巨人荣光索引', ruleset: '5e-2014' as const },
] as const

const withoutLegacySubclassOptions = <T extends { readonly id: string }>(options: readonly T[]): readonly T[] =>
  options.filter((option) => !option.id.startsWith('subclass-2014-'))

export const rulesRepository: RulesRepository = {
  sources,
  classes: classPreviews2014.map((item) =>
    [fighterRule, ...martialClasses2014, ...halfCasterClasses2014, ...arcaneCasterClasses2014, ...fullCasterClasses2014].find((classRule) => classRule.id === item.id)
    ?? { ...item, checkpoints: [] },
  ),
  subclasses: subclasses2014,
  races: races2014,
  backgrounds: backgrounds2014,
  options: [
    ...abilityImprovementOptions2014,
    ...feats2014,
    ...subclassOptions2014,
    ...withoutLegacySubclassOptions(fighterOptions),
    ...withoutLegacySubclassOptions(martialOptions2014),
    ...withoutLegacySubclassOptions(halfCasterOptions2014),
    ...withoutLegacySubclassOptions(arcaneCasterOptions2014),
  ],
  feats: feats2014,
  equipment: equipment2014,
  classStartingEquipment: classStartingEquipment2014,
  backgroundStartingEquipment: backgroundStartingEquipment2014,
  spells: spells2014,
  getClass(id) {
    return this.classes.find((item) => item.id === id)
  },
  getSubclass(id) {
    return this.subclasses.find((item) => item.id === id)
  },
  getOption(id) {
    return this.options.find((item) => item.id === id)
  },
  getFeat(id) {
    return this.feats.find((item) => item.id === id)
  },
  getRace(id) {
    return this.races.find((item) => item.id === id)
  },
  getBackground(id) {
    return this.backgrounds.find((item) => item.id === id)
  },
  getEquipment(id) {
    return this.equipment.find((item) => item.id === id)
  },
  getClassStartingEquipment(classId) {
    return this.classStartingEquipment.find((item) => item.classId === classId)
  },
  getBackgroundStartingEquipment(backgroundId) {
    const direct = this.backgroundStartingEquipment.find((item) => item.backgroundId === backgroundId)
    if (direct) return direct
    const background = this.getBackground(backgroundId)
    return background?.parentBackgroundId
      ? this.backgroundStartingEquipment.find((item) => item.backgroundId === background.parentBackgroundId)
      : undefined
  },
  getSpell(id) {
    return this.spells.find((item) => item.id === id)
  },
}
