import { describe, expect, it } from 'vitest'

import { sources2014 } from '@/rules/data/sources-2014'
import { spells2014 } from '@/rules/data/spells-2014'
import { rulesRepository } from '@/rules/repository'
import { getDefaultEnabledSourceIds, isSourceEnabled } from '@/rules/source-books'
import { getAvailableSpells } from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'

/** S03：第三方合作内容 11 个来源与 250 条法术（Finger Guns 去重后）；G3-I3 补录斯坦哈德 16 条、瓦尔达玩家包Ⅱ 21 条。 */
const THIRD_PARTY_SOURCE_IDS = [
  'tp-ebon-tides-index',
  'tp-obojima-index',
  'tp-crooked-moon-index',
  'tp-cthulhu-torchlight-index',
  'tp-valdas-spire-index',
  'tp-grim-hollow-index',
  'tp-drakkenheim-index',
  'tp-humblewood-index',
  'tp-humblewood-tales-index',
  'tp-illrigger-index',
  'tp-taldorei-index',
  'tp-steinhardt-index',
] as const

function wizardDraft(enabledSourceIds?: readonly string[]): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'third-party',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 20,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-wizard',
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: ['language-elvish', 'language-dwarvish'],
    proficiencyReplacements: [],
    baseAbilities: { str: 10, dex: 10, con: 10, int: 20, wis: 10, cha: 10 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    ...(enabledSourceIds ? { enabledSourceIds } : {}),
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
    name: '第三方回归',
    alignment: '',
    notes: '',
    currentStep: 'spells',
  } as unknown as CharacterDraft
}

describe('第三方合作法术（S03）', () => {
  it('11 个来源登记为合作内容且默认关闭', () => {
    const defaults = getDefaultEnabledSourceIds('5e-2014')
    for (const id of THIRD_PARTY_SOURCE_IDS) {
      const source = sources2014.find((item) => item.id === id)
      expect(source, id).toBeTruthy()
      expect(source?.contentKind, id).toBe('third-party')
      expect(source?.defaultEnabled, id).toBe(false)
      expect(defaults, id).not.toContain(id)
    }
    expect(isSourceEnabled(['tp-ebon-tides-index'], ['tp-ebon-tides-index'])).toBe(true)
    expect(isSourceEnabled(['tp-ebon-tides-index'], [])).toBe(false)
  })

  it('第三方法术已登记且摘要非空（S03 的 250 条 + G3-I3 补录）', () => {
    const thirdParty = spells2014.filter((spell) => spell.sourceIds.some((id) => id.startsWith('tp-')))
    // 下界断言：第三方法术随批次增长（S03 250 条 → G3-I3 补录后 287 条），不锁死总数。
    expect(thirdParty.length).toBeGreaterThanOrEqual(287)
    for (const spell of thirdParty) {
      expect(spell.description.trim().length, spell.id).toBeGreaterThan(0)
      expect(spell.classIds.every((id) => id.startsWith('class-2014-')), spell.id).toBe(true)
      expect(spell.name.length, spell.id).toBeGreaterThan(0)
      expect(spell.englishName.length, spell.id).toBeGreaterThan(1)
      expect(spell.level, spell.id).toBeGreaterThanOrEqual(0)
      expect(spell.level, spell.id).toBeLessThanOrEqual(9)
    }
    // 每条第三方来源都必须有法术覆盖（G3-I3 起斯坦哈德也纳入）
    const bySource = new Map<string, number>()
    for (const spell of thirdParty) {
      for (const id of spell.sourceIds.filter((value) => value.startsWith('tp-'))) {
        bySource.set(id, (bySource.get(id) ?? 0) + 1)
      }
    }
    for (const id of THIRD_PARTY_SOURCE_IDS) expect(bySource.get(id) ?? 0, id).toBeGreaterThan(0)
    expect(bySource.get('tp-steinhardt-index')).toBe(16)
    expect(bySource.get('tp-valdas-spire-index')).toBe(44)
    // 第三方法术的中文名与英文名均不得与其它法术冲突（重名须改名登记）
    const names = spells2014.map((spell) => spell.name)
    expect(new Set(names).size).toBe(names.length)
    const englishNames = spells2014.map((spell) => spell.englishName)
    expect(new Set(englishNames).size).toBe(englishNames.length)
  })

  it('来源关闭时第三方不进入候选，开启后按职业可选', () => {
    const open = wizardDraft(['tp-ebon-tides-index'])
    const config = rulesRepository.getSpellcastingConfig(open)
    expect(config).toBeTruthy()
    const openNames = getAvailableSpells(open, config!).map((spell) => spell.englishName)
    expect(openNames).toContain('Bright Sparks')

    const closed = wizardDraft([])
    const closedNames = getAvailableSpells(closed, config!).map((spell) => spell.englishName)
    expect(closedNames).not.toContain('Bright Sparks')
  })
})
