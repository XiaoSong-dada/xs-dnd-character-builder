import type { CharacterDraft, RulesetId } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

type RepositoryData = Pick<
  RulesRepository,
  | 'sources'
  | 'classes'
  | 'subclasses'
  | 'races'
  | 'backgrounds'
  | 'raceFeatures'
  | 'backgroundFeatures'
  | 'options'
  | 'feats'
  | 'equipment'
  | 'classStartingEquipment'
  | 'backgroundStartingEquipment'
  | 'spells'
  | 'weaponMasteries'
>

/** 由某一规则集的独立数据构造只读查询仓库。 */
export function createRulesRepository(ruleset: RulesetId, data: RepositoryData): RulesRepository {
  return {
    ruleset,
    ...data,
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
    getRaceFeatures(raceId) {
      return this.raceFeatures.filter((feature) => feature.raceId === raceId)
    },
    getBackgroundFeatures(backgroundId) {
      return this.backgroundFeatures.filter((feature) => feature.backgroundId === backgroundId)
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
    getWeaponMastery(id) {
      return this.weaponMasteries.find((item) => item.id === id)
    },
  }
}
