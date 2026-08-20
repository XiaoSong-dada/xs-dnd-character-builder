import { describe, expect, it } from 'vitest'

import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import { fighterDraft, fighterExportModel, wizardExportModel } from '../../fixtures/export-character'

describe('CharacterExportModel', () => {
  it('集中提供身份、属性、战斗、钱币和人物资料', () => {
    const model = fighterExportModel()
    expect(model.identity).toMatchObject({ characterName: '测试角色', className: '战士', level: 4, raceName: '半兽人', backgroundName: '士兵' })
    expect(model.abilities.str.score).toBe(deriveCharacter(fighterDraft).abilities.str)
    expect(model.combat.hitPointCurrent).toBe(model.combat.hitPointMaximum)
    expect(model.combat.hitPointTemporary).toBe(0)
    expect(model.currency).toEqual({ cp: 5, sp: 4, ep: 3, gp: 17, pp: 2 })
    expect(model.profile.backstory).toContain('背景故事')
  })

  it('按 itemId 聚合物品并逐武器派生命中、伤害与熟练', () => {
    const model = fighterExportModel()
    expect(model.inventory.find((item) => item.itemId === 'longsword')).toMatchObject({ name: '长剑', quantity: 2, equippedQuantity: 1 })
    expect(model.attacks[0]).toMatchObject({ name: '长剑' })
    expect(model.attacks[0].damage).toContain('1d8')
    expect(model.attacks[0].note).toContain('双手 1d10')
  })

  it('spellbook 模式输出全部法术书法术并单独标记准备集合', () => {
    const model = wizardExportModel()
    expect(model.spellcasting?.className).toBe('法师')
    expect(model.spellcasting?.spells.filter((spell) => spell.level === 0)).toHaveLength(2)
    expect(model.spellcasting?.spells.filter((spell) => spell.level > 0)).toHaveLength(2)
    expect(model.spellcasting?.spells.find((spell) => spell.id === 'spell-2014-magic-missile')?.prepared).toBe(true)
    expect(model.spellcasting?.spells.find((spell) => spell.id === 'spell-2014-shield')?.prepared).toBe(false)
    expect(model.spellcasting?.slots).toEqual(expect.arrayContaining([{ level: 1, count: 4, pact: false }, { level: 2, count: 2, pact: false }]))
  })

  it.each([
    ['known', 'class-2014-bard', { cantripIds: ['spell-2014-mage-hand'], knownSpellIds: ['spell-2014-magic-missile'], preparedSpellIds: [], spellbookSpellIds: [] }],
    ['prepared', 'class-2014-cleric', { cantripIds: [], knownSpellIds: [], preparedSpellIds: ['spell-2014-magic-missile'], spellbookSpellIds: [] }],
    ['pact', 'class-2014-warlock', { cantripIds: ['spell-2014-mage-hand'], knownSpellIds: ['spell-2014-magic-missile'], preparedSpellIds: [], spellbookSpellIds: [] }],
  ] as const)('%s 模式只输出规则指定的选择集合', (mode, classId, spellSelections) => {
    const draft = { ...fighterDraft, classId, subclassId: undefined, targetLevel: 3, spellSelections }
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    expect(model.spellcasting?.spells.map((spell) => spell.id)).toEqual(expect.arrayContaining([...spellSelections.cantripIds, ...(mode === 'prepared' ? spellSelections.preparedSpellIds : spellSelections.knownSpellIds)]))
    if (mode === 'pact') expect(model.spellcasting?.slots.every((slot) => slot.pact)).toBe(true)
  })

  it('规则项缺失时保留可诊断结果，不猜测数据', () => {
    const broken = { ...fighterDraft, inventory: [{ ...fighterDraft.inventory[0], itemId: 'missing-weapon' }] }
    const model = buildCharacterExportModel(broken, deriveCharacter(broken))
    expect(model.inventory[0].name).toBe('missing-weapon')
    expect(model.diagnostics).toContainEqual(expect.objectContaining({ code: 'missing-rule-data', field: 'inventory.missing-weapon' }))
  })
})
