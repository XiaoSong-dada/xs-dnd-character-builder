import { classPreviews2014 } from '@/rules/data/classes-2014'
import { fighterOptions, fighterRule, fighterSubclasses } from '@/rules/data/fighter'
import { backgrounds2014, races2014 } from '@/rules/data/origins-2014'
import type { RulesRepository } from '@/types/rules'

const sources = [
  { id: 'basic-rules-2014', title: '2014 Basic Rules / SRD 5.1', ruleset: '5e-2014' as const, url: 'https://www.dndbeyond.com/sources/dnd/basic-rules-2014' },
  { id: 'phb-2014-index', title: '2014 玩家手册索引', ruleset: '5e-2014' as const },
] as const

export const rulesRepository: RulesRepository = {
  sources,
  classes: classPreviews2014.map((item) => item.id === fighterRule.id ? fighterRule : { ...item, checkpoints: [] }),
  subclasses: fighterSubclasses,
  races: races2014,
  backgrounds: backgrounds2014,
  options: fighterOptions,
  getClass(id) {
    return this.classes.find((item) => item.id === id)
  },
  getSubclass(id) {
    return this.subclasses.find((item) => item.id === id)
  },
  getOption(id) {
    return this.options.find((item) => item.id === id)
  },
  getRace(id) {
    return this.races.find((item) => item.id === id)
  },
  getBackground(id) {
    return this.backgrounds.find((item) => item.id === id)
  },
}
