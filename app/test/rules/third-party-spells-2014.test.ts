import { describe, expect, it } from 'vitest'

import { sources2014 } from '@/rules/data/sources-2014'
import { spells2014 } from '@/rules/data/spells-2014'
import { rulesRepository } from '@/rules/repository'
import { getDefaultEnabledSourceIds, isSourceEnabled } from '@/rules/source-books'
import { getAvailableSpells } from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'

/** S03：第三方合作内容 11 个来源与 250 条法术（Finger Guns 去重后）。 */
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

  it('250 条第三方法术已登记且摘要非空', () => {
    const thirdParty = spells2014.filter((spell) => spell.sourceIds.some((id) => id.startsWith('tp-')))
    expect(thirdParty).toHaveLength(250)
    for (const spell of thirdParty) {
      expect(spell.description.trim().length, spell.id).toBeGreaterThan(0)
      expect(spell.classIds.every((id) => id.startsWith('class-2014-'))).toBe(true)
    }
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
