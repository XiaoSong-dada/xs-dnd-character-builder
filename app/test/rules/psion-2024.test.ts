import { describe, expect, it } from 'vitest'

import { psionFeatures2024, psionOptions2024, psionRule2024, psionSubclasses2024 } from '@/rules/data/psion-2024'
import { psionSpells2024 } from '@/rules/data/psion-spells-2024'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { getDicePoolCount, getDicePoolDie } from '@/rules/resources'
import { rulesRepository2024 } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'
import { buildTimeline } from '@/rules/timeline'

const SOURCE = 'source-2024-ua-psion'
const SUBCLASS_IDS = [
  'subclass-2024-ua-psion-metamorph',
  'subclass-2024-ua-psion-psi-warper',
  'subclass-2024-ua-psion-psykinetic',
  'subclass-2024-ua-psion-telepath',
] as const

describe('灵能使（UA，E06）', () => {
  it('职业基础字段与来源隔离', () => {
    const classRule = rulesRepository2024.getClass('class-2024-ua-psion')
    expect(classRule).toBeDefined()
    expect(classRule?.ruleset).toBe('5e-2024')
    expect(classRule?.status).toBe('selectable')
    expect(classRule?.sourceIds).toEqual([SOURCE])
    expect(classRule?.hitDie).toBe(6)
    expect(classRule?.primaryAbilities).toEqual(['int'])
    expect(classRule?.savingThrowAbilities).toEqual(['int', 'wis'])
    expect(isSourceEnabled(classRule?.sourceIds ?? [], [], rulesRepository2024)).toBe(false)
    expect(isSourceEnabled(classRule?.sourceIds ?? [], [SOURCE], rulesRepository2024)).toBe(true)
  })

  it('职业特性 14 条与灵能骰池按等级表登记', () => {
    expect(psionFeatures2024).toHaveLength(14)
    expect(new Set(psionFeatures2024.map((feature) => feature.id)).size).toBe(14)
    expect(psionFeatures2024.every((feature) => feature.classId === 'class-2024-ua-psion')).toBe(true)
    const pool = psionFeatures2024.find((feature) => feature.id === 'psion-2024-psionic-power')?.dicePool
    if (!pool) throw new Error('缺少灵能骰池')
    expect([1, 4, 5, 8, 9, 11, 13, 17, 20].map((level) => `${getDicePoolCount(pool, level)}${getDicePoolDie(pool, level)}`)).toEqual(['4d6', '4d6', '6d8', '6d8', '8d8', '8d10', '10d10', '12d12', '12d12'])
    expect(pool.recovery).toBe('short-rest')
    expect(pool.shortRestRecovery).toBe(1)
  })

  it('施法配置与 141 条法术列表闭合', () => {
    const config = psionRule2024.spellcasting
    if (!config) throw new Error('缺少施法配置')
    expect(config.mode).toBe('prepared')
    expect(config.ability).toBe('int')
    expect(config.startsAtLevel).toBe(1)
    expect(config.cantripsKnownByLevel?.[0]).toBe(2)
    expect(config.cantripsKnownByLevel?.[3]).toBe(3)
    expect(config.cantripsKnownByLevel?.[9]).toBe(4)
    expect(config.preparedCountByLevel?.[0]).toBe(4)
    expect(config.preparedCountByLevel?.[19]).toBe(22)
    expect(config.slotsByClassLevel?.[0]).toEqual([2])
    expect(config.slotsByClassLevel?.[19]).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1])
    expect(config.classSpellIds).toHaveLength(141)
    expect(new Set(config.classSpellIds).size).toBe(141)
    for (const spellId of config.classSpellIds) {
      expect(rulesRepository2024.getSpell(spellId), spellId).toBeDefined()
    }
    expect(config.classSpellIds).toContain('spell-2024-ua-telekinetic-fling')
    expect(config.classSpellIds).toContain('spell-2024-scrying')
  })

  it('灵能才赋 11 项与选择检查点（2／5／10／13／17）', () => {
    expect(psionOptions2024).toHaveLength(11)
    for (const option of psionOptions2024) {
      expect(rulesRepository2024.getOption(option.id), option.id).toBeDefined()
    }
    const checkpoints = psionRule2024.checkpoints.filter((checkpoint) => checkpoint.id.includes('disciplines'))
    expect(checkpoints.map((checkpoint) => checkpoint.id)).toEqual([
      'psion-2024-disciplines-2', 'psion-2024-disciplines-5', 'psion-2024-disciplines-10', 'psion-2024-disciplines-13', 'psion-2024-disciplines-17',
    ])
    expect(checkpoints.map((checkpoint) => checkpoint.minSelections)).toEqual([2, 1, 1, 1, 1])
    expect(checkpoints.every((checkpoint) => checkpoint.uniqueGroup === 'psion-disciplines')).toBe(true)
  })

  it('4 个子职与始终准备法术闭合', () => {
    expect(psionSubclasses2024.map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    for (const subclass of psionSubclasses2024) {
      expect(rulesRepository2024.getSubclass(subclass.id)?.id).toBe(subclass.id)
      expect(subclass.classId).toBe('class-2024-ua-psion')
      expect(subclass.sourceIds).toEqual([SOURCE])
      expect(subclass.selectionLevel).toBe(3)
      expect(subclass.features.length).toBeGreaterThan(0)
      for (const spellIds of Object.values(subclass.alwaysPreparedSpellIdsByLevel ?? {})) {
        for (const spellId of spellIds) {
          expect(rulesRepository2024.getSpell(spellId), `${subclass.id}:${spellId}`).toBeDefined()
        }
      }
    }
    expect(psionSpells2024).toHaveLength(17)
    expect(psionSpells2024.every((spell) => spell.sourceIds.includes(SOURCE))).toBe(true)
  })

  it('起始装备与 20 级时间线可解析', () => {
    const profile = classStartingEquipment2024.find((item) => item.classId === 'class-2024-ua-psion')
    if (!profile) throw new Error('缺少灵能使起始装备方案')
    for (const option of profile.groups[0]?.options ?? []) {
      for (const grant of option.grants) {
        expect(rulesRepository2024.getEquipment(grant.itemId), `${option.id}:${grant.itemId}`).toBeDefined()
      }
    }
    const timeline = buildTimeline('class-2024-ua-psion', 20, { ruleset: '5e-2024', subclassId: 'subclass-2024-ua-psion-telepath', enabledSourceIds: [SOURCE] })
    for (const checkpoint of timeline) {
      for (const optionId of checkpoint.optionIds) {
        const resolved = rulesRepository2024.getOption(optionId) ?? rulesRepository2024.getFeat(optionId)
        expect(resolved, `${checkpoint.id}:${optionId}`).toBeDefined()
      }
    }
    const withoutSubclass = buildTimeline('class-2024-ua-psion', 20, { ruleset: '5e-2024', enabledSourceIds: [SOURCE] })
    expect(withoutSubclass.some((checkpoint) => checkpoint.kind === 'subclass')).toBe(true)
  })
})
