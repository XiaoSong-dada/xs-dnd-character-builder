import { classPreviews2014 } from '@/rules/data/classes-2014'
import { getClassFeatures2014 } from '@/rules/data/class-features-2014'
import { arcaneCasterClasses2014, arcaneCasterOptions2014 } from '@/rules/data/arcane-casters-2014'
import { fighterOptions, fighterRule } from '@/rules/data/fighter'
import { martialClasses2014, martialOptions2014 } from '@/rules/data/martials-2014'
import { equipment2014 } from '@/rules/data/equipment-2014'
import { magicItems2014 } from '@/rules/data/magic-items-2014'
import { magicItemsXgteTcoe2014 } from '@/rules/data/magic-items-xgte-tcoe-2014'
import { abilityImprovementOptions2014, featChoiceOptions2014, feats2014 } from '@/rules/data/feats-2014'
import { halfCasterClasses2014, halfCasterOptions2014 } from '@/rules/data/half-casters-2014'
import { fullCasterClasses2014 } from '@/rules/data/full-casters-2014'
import { metamagicOptions2014 } from '@/rules/data/metamagic-2014'
import { subclassChoiceOptions2014 } from '@/rules/data/subclass-choice-options-2014'
import { backgrounds2014, races2014 } from '@/rules/data/origins-2014'
import { backgroundStartingEquipment2014, classStartingEquipment2014 } from '@/rules/data/starting-equipment-2014'
import { subclasses2014, subclassOptions2014 } from '@/rules/data/subclasses-2014'
import { spells2014 } from '@/rules/data/spells-2014'
import { sources2014 } from '@/rules/data/sources-2014'
import { artificerClass2014, artificerInfusions2014 } from '@/rules/data/artificer-2014'
import type { RulesRepository } from '@/types/rules'
import type { CharacterDraft } from '@/types/character'

const withoutLegacySubclassOptions = <T extends { readonly id: string }>(options: readonly T[]): readonly T[] =>
  options.filter((option) => !option.id.startsWith('subclass-2014-'))

export const rulesRepository: RulesRepository = {
  sources: sources2014,
  classes: classPreviews2014.map((item) => {
    const classRule = [artificerClass2014, fighterRule, ...martialClasses2014, ...halfCasterClasses2014, ...arcaneCasterClasses2014, ...fullCasterClasses2014].find((classRule) => classRule.id === item.id)
      ?? { ...item, checkpoints: [] }
    return { ...classRule, features: getClassFeatures2014(item.id) }
  }),
  subclasses: subclasses2014,
  races: races2014,
  backgrounds: backgrounds2014,
  options: [
    ...abilityImprovementOptions2014,
    ...featChoiceOptions2014,
    ...feats2014,
    ...subclassOptions2014,
    ...withoutLegacySubclassOptions(fighterOptions),
    ...withoutLegacySubclassOptions(martialOptions2014),
    ...withoutLegacySubclassOptions(halfCasterOptions2014),
    ...withoutLegacySubclassOptions(arcaneCasterOptions2014),
    ...metamagicOptions2014,
    ...subclassChoiceOptions2014,
    ...artificerInfusions2014,
  ],
  feats: feats2014,
  equipment: [...equipment2014, ...magicItems2014, ...magicItemsXgteTcoe2014],
  classStartingEquipment: classStartingEquipment2014,
  backgroundStartingEquipment: backgroundStartingEquipment2014,
  spells: spells2014,
  getClass(id) {
    return this.classes.find((item) => item.id === id)
  },
  getSubclass(id) {
    return this.subclasses.find((item) => item.id === id)
  },
  getSpellcastingConfig(draft: Pick<CharacterDraft, 'classId' | 'subclassId'>) {
    if (draft.subclassId) {
      const subclass = this.getSubclass(draft.subclassId)
      if (subclass?.spellcasting) return subclass.spellcasting
    }
    return draft.classId ? this.getClass(draft.classId)?.spellcasting : undefined
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
