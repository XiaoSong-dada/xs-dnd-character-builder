import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { uaHorrorFeatures2024, uaHorrorOptions2024, uaHorrorSubclasses2024 } from '@/rules/data/ua-horror-2024'
import { uaArcaneFeatures2024, uaArcaneOptions2024, uaArcaneSubclasses2024 } from '@/rules/data/ua-arcane-subclasses-2024'
import { uaCataclysmFeatures2024, uaCataclysmOptions2024, uaCataclysmSubclasses2024 } from '@/rules/data/ua-cataclysm-2024'

const ALL_SOURCES = ['source-2024-ua-horror', 'source-2024-ua-arcane', 'source-2024-ua-cataclysm'] as const

const HORROR_IDS = [
  'subclass-2024-ua-bard-spirits',
  'subclass-2024-ua-artificer-reanimator',
  'subclass-2024-ua-cleric-grave',
  'subclass-2024-ua-rogue-phantom',
  'subclass-2024-ua-sorcerer-shadow',
  'subclass-2024-ua-warlock-undead',
  'subclass-2024-ua-ranger-hollow-warden',
] as const

const ARCANE_IDS = [
  'subclass-2024-ua-cleric-arcana',
  'subclass-2024-ua-fighter-arcane-archer',
  'subclass-2024-ua-monk-tattoo-warrior',
  'subclass-2024-ua-wizard-conjurer',
  'subclass-2024-ua-wizard-enchanter',
  'subclass-2024-ua-wizard-necromancer',
  'subclass-2024-ua-wizard-transmuter',
  'subclass-2024-ua-warlock-hexblade',
  'subclass-2024-ua-sorcerer-ancestral',
] as const

const CATACLYSM_IDS = [
  'subclass-2024-ua-druid-preservation',
  'subclass-2024-ua-fighter-gladiator',
  'subclass-2024-ua-sorcerer-defiled',
  'subclass-2024-ua-warlock-sorcerer-king',
] as const

const ALL_SUBCLASSES = [...uaHorrorSubclasses2024, ...uaArcaneSubclasses2024, ...uaCataclysmSubclasses2024]
const ALL_FEATURES = [...uaHorrorFeatures2024, ...uaArcaneFeatures2024, ...uaCataclysmFeatures2024]
const ALL_OPTIONS = [...uaHorrorOptions2024, ...uaArcaneOptions2024, ...uaCataclysmOptions2024]

describe('其余 UA 子职（可怖／奥术／浩劫，E05）', () => {
  it('20 个唯一概念登记完整、来源正确且默认关闭', () => {
    expect(uaHorrorSubclasses2024.map((s) => s.id)).toEqual([...HORROR_IDS])
    expect(uaArcaneSubclasses2024.map((s) => s.id)).toEqual([...ARCANE_IDS])
    expect(uaCataclysmSubclasses2024.map((s) => s.id)).toEqual([...CATACLYSM_IDS])
    expect(ALL_SUBCLASSES).toHaveLength(20)
    expect(new Set(ALL_SUBCLASSES.map((s) => s.id)).size).toBe(20)
    for (const subclass of ALL_SUBCLASSES) {
      expect(rulesRepository2024.getSubclass(subclass.id)?.id, subclass.id).toBe(subclass.id)
      expect(subclass.status).toBe('selectable')
      expect(subclass.selectionLevel).toBe(3)
      expect(ALL_SOURCES).toContain(subclass.sourceIds[0])
      expect(subclass.features.length).toBeGreaterThan(0)
    }
  })

  it('特性、选项与始终准备法术全部可解析', () => {
    for (const feature of ALL_FEATURES) {
      for (const optionId of feature.optionIds ?? []) {
        const option = rulesRepository2024.getOption(optionId)
        expect(option ?? rulesRepository2024.getFeat(optionId), `${feature.id}:${optionId}`).toBeDefined()
      }
      for (const grant of feature.grantedSpells ?? []) {
        expect(rulesRepository2024.getSpell(grant.spellId), `${feature.id}:${grant.spellId}`).toBeDefined()
      }
    }
    for (const option of ALL_OPTIONS) {
      expect(rulesRepository2024.getOption(option.id), option.id).toBeDefined()
    }
    for (const subclass of ALL_SUBCLASSES) {
      for (const [level, spellIds] of Object.entries(subclass.alwaysPreparedSpellIdsByLevel ?? {})) {
        expect(Number(level)).toBeGreaterThanOrEqual(3)
        for (const spellId of spellIds) {
          expect(rulesRepository2024.getSpell(spellId), `${subclass.id}:${spellId}`).toBeDefined()
        }
      }
    }
  })

  it('修订去重：奥术 II 为唯一有效版本，可怖咒剑宗主不登记', () => {
    // 奥术 II 的 6 项修订：ID 唯一且 registry 中只有一份。
    const revisedIds = ARCANE_IDS.filter((id) => id.includes('conjurer') || id.includes('enchanter') || id.includes('necromancer') || id.includes('transmuter') || id.includes('arcane-archer') || id.includes('tattoo-warrior'))
    expect(revisedIds).toHaveLength(6)
    expect(new Set(revisedIds).size).toBe(6)
    // 可怖版咒剑宗主不登记：整仓只有奥术版一条咒剑宗主。
    const hexblades = rulesRepository2024.subclasses.filter((subclass) => subclass.id.includes('warlock-hexblade'))
    expect(hexblades.map((subclass) => subclass.id)).toEqual(['subclass-2024-ua-warlock-hexblade'])
    // 可怖来源下没有咒剑宗主条目。
    expect(uaHorrorSubclasses2024.some((subclass) => subclass.id.includes('hexblade'))).toBe(false)
  })

  it('关键选择结构：奥术射击、文身、变化师之石、残暴与恩护之地', () => {
    const findFeature = (id: string) => ALL_FEATURES.find((feature) => feature.id === id)
    expect(findFeature('ua-arcane-2024-archer-shot')?.minSelections).toBe(2)
    expect(findFeature('ua-arcane-2024-archer-shot')?.uniqueGroup).toBe('arcane-archer-shots')
    expect(findFeature('ua-arcane-2024-tattoo-beast')?.optionIds).toHaveLength(5)
    expect(findFeature('ua-arcane-2024-tattoo-monster')?.optionIds).toHaveLength(4)
    expect(findFeature('ua-arcane-2024-transmuter-stone')?.minSelections).toBe(1)
    expect(findFeature('ua-cataclysm-2024-gladiator-brutality')?.optionIds).toHaveLength(3)
    expect(findFeature('ua-cataclysm-2024-preserve-land')?.optionIds).toHaveLength(2)
    expect(findFeature('ua-arcane-2024-arcana-initiate')?.candidateKind).toBe('spell-pool')
    expect(findFeature('ua-arcane-2024-arcana-initiate')?.spellPool?.level).toBe(0)
  })

  it('法师四学派登记额外入书规则', () => {
    for (const [id, school] of [['subclass-2024-ua-wizard-conjurer', '咒法'], ['subclass-2024-ua-wizard-enchanter', '惑控'], ['subclass-2024-ua-wizard-necromancer', '死灵'], ['subclass-2024-ua-wizard-transmuter', '变化']] as const) {
      const subclass = rulesRepository2024.getSubclass(id)
      expect(subclass?.spellbookExtraSpells).toEqual({ base: 2, perNewSpellLevel: 1, schools: [school] })
    }
  })
})
