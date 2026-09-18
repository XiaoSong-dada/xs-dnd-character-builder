import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { rogueFeatures2024, rogueRule2024 } from '@/rules/data/rogue-2024'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { formatDicePoolText, getDicePoolCount, getDicePoolDie } from '@/rules/resources'
import {
  getCheckpointCandidates,
  getMaximumSpellLevel,
  getRequiredCantripCount,
  getRequiredSpellCount,
  getSpellSlots,
  getSpellcastingConfig,
} from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import { isWeaponTrainingCovered } from '@/rules/weapon-training'
import { draft2024 } from '../fixtures/draft-2024'

const SUBCLASS_IDS = [
  'subclass-2024-rogue-assassin',
  'subclass-2024-rogue-thief',
  'subclass-2024-rogue-arcane-trickster',
  'subclass-2024-rogue-soulknife',
] as const

describe('2024 游荡者与子职数据（B08-04）', () => {
  it('职业基础字段与武器训练（简易＋灵巧/轻型军用）', () => {
    const classRule = rulesRepository2024.getClass('class-2024-rogue')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(8)
    expect(classRule?.armorTraining).toEqual(['light'])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple'], martialProperties: ['finesse', 'light'] })
  })

  it('武器训练覆盖灵巧/轻型军用，不覆盖其他军用', () => {
    const training = rulesRepository2024.getClass('class-2024-rogue')?.weaponTraining
    const item = (id: string) => rulesRepository2024.getEquipment(id)!
    expect(isWeaponTrainingCovered(training, item('equipment-2024-dagger'))).toBe(true)
    expect(isWeaponTrainingCovered(training, item('equipment-2024-rapier'))).toBe(true)
    expect(isWeaponTrainingCovered(training, item('equipment-2024-shortsword'))).toBe(true)
    expect(isWeaponTrainingCovered(training, item('equipment-2024-hand-crossbow'))).toBe(true)
    expect(isWeaponTrainingCovered(training, item('equipment-2024-longsword'))).toBe(false)
    expect(isWeaponTrainingCovered(training, item('equipment-2024-greataxe'))).toBe(false)
  })

  it('职业特性 17 条、ID 唯一，选择类特性挂检查点', () => {
    expect(rogueFeatures2024).toHaveLength(17)
    expect(new Set(rogueFeatures2024.map((feature) => feature.id)).size).toBe(17)
    expect(rogueFeatures2024.every((feature) => feature.classId === 'class-2024-rogue')).toBe(true)
    const choiceFeatures = rogueFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('偷袭骰池按等级增长且不属消耗池', () => {
    const sneak = rogueFeatures2024.find((feature) => feature.id === 'rogue-2024-class-sneak-attack')?.dicePool
    if (!sneak) throw new Error('缺少偷袭骰池')
    expect([1, 5, 11, 19, 20].map((level) => getDicePoolCount(sneak, level))).toEqual([1, 3, 6, 10, 10])
    expect(formatDicePoolText(sneak, 5)).toBe('3d6')
    expect(sneak.recovery).toBe('none')
  })

  it('专精与武器精通检查点登记', () => {
    const expertise = rogueRule2024.checkpoints.filter((checkpoint) => checkpoint.kind === 'expertise')
    expect(expertise.map((checkpoint) => checkpoint.id)).toEqual(['class-2024-rogue-expertise-1', 'class-2024-rogue-expertise-6'])
    expect(expertise[0]?.optionIds).toHaveLength(18)
    expect(expertise[0]?.minSelections).toBe(2)

    const mastery = rogueRule2024.checkpoints.find((checkpoint) => checkpoint.candidateKind === 'weapon-mastery')
    if (!mastery) throw new Error('缺少武器精通检查点')
    expect(mastery.weaponMasteryFilter).toBe('proficient')
    const draft = draft2024({ classId: 'class-2024-rogue', targetLevel: 1 })
    expect(getCheckpointSelectionBounds(draft, mastery).max).toBe(2)
    const candidates = getCheckpointCandidates(draft, mastery)
    expect(candidates).toContain('equipment-2024-dagger')
    expect(candidates).toContain('equipment-2024-rapier')
    expect(candidates).toContain('equipment-2024-hand-crossbow')
    expect(candidates).not.toContain('equipment-2024-longsword')
    expect(candidates).not.toContain('equipment-2024-greataxe')
  })

  it('4 个子职各 5 条特性、3／9／13／17 级', () => {
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-rogue' && subclass.sourceIds.includes('source-2024-phb')).map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    for (const id of SUBCLASS_IDS) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.status).toBe('implemented')
      expect(subclass?.features).toHaveLength(5)
      expect(subclass?.features.map((feature) => feature.level)).toEqual([3, 3, 9, 13, 17])
    }
  })

  it('魂刃灵能骰按等级改变骰数与骰面，长休全满/短休 1 枚', () => {
    const psionic = rulesRepository2024.getSubclass('subclass-2024-rogue-soulknife')
      ?.features.find((feature) => feature.id === 'rogue-2024-soulknife-psionic-power')?.dicePool
    if (!psionic) throw new Error('缺少灵能骰池')
    expect([3, 5, 9, 11, 13, 17].map((level) => getDicePoolCount(psionic, level))).toEqual([4, 6, 8, 8, 10, 12])
    expect([3, 5, 9, 11, 13, 17].map((level) => getDicePoolDie(psionic, level))).toEqual(['d6', 'd8', 'd8', 'd10', 'd10', 'd12'])
    expect(formatDicePoolText(psionic, 17)).toBe('12d12')
    expect(psionic.recovery).toBe('short-rest')
  })

  it('诡术师使用智力的三分之一施法配置', () => {
    const config = getSpellcastingConfig({
      classId: 'class-2024-rogue',
      subclassId: 'subclass-2024-rogue-arcane-trickster',
      enabledSourceIds: [],
      ruleset: '5e-2024',
    })
    if (!config) throw new Error('缺少诡术师施法配置')
    expect(config.mode).toBe('prepared')
    expect(config.ability).toBe('int')
    expect(config.startsAtLevel).toBe(3)
    const atThree = draft2024({ classId: 'class-2024-rogue', subclassId: 'subclass-2024-rogue-arcane-trickster', targetLevel: 3 })
    expect(getRequiredSpellCount(atThree, config)).toBe(3)
    expect(getRequiredCantripCount(atThree, config)).toBe(3)
    expect(getMaximumSpellLevel(config, 3)).toBe(1)
    expect(getSpellSlots(config, 3).map((slot) => [slot.level, slot.count])).toEqual([[1, 2]])
    const atTwenty = draft2024({ classId: 'class-2024-rogue', subclassId: 'subclass-2024-rogue-arcane-trickster', targetLevel: 20 })
    expect(getRequiredSpellCount(atTwenty, config)).toBe(13)
    expect(getRequiredCantripCount(atTwenty, config)).toBe(4)
    expect(getMaximumSpellLevel(config, 20)).toBe(4)
  })

  it('时间线展开技能、专精、武器精通、子职与属性提升', () => {
    const levelOne = buildTimeline('class-2024-rogue', 1, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(levelOne.map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-rogue-skills-1',
      'class-2024-rogue-expertise-1',
      'class-2024-rogue-mastery-1',
    ])
    const levelThree = buildTimeline('class-2024-rogue', 3, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(levelThree.find((checkpoint) => checkpoint.kind === 'subclass')?.optionIds).toEqual([...SUBCLASS_IDS])
    const levelTwenty = buildTimeline('class-2024-rogue', 20, { ruleset: '5e-2024', enabledSourceIds: [] })
    expect(levelTwenty.filter((checkpoint) => checkpoint.kind === 'ability-improvement').map((checkpoint) => checkpoint.id)).toEqual([
      'class-2024-rogue-feat-4',
      'class-2024-rogue-feat-8',
      'class-2024-rogue-feat-10',
      'class-2024-rogue-feat-12',
      'class-2024-rogue-feat-16',
      'class-2024-rogue-feat-19',
    ])
  })
})
