import { describe, expect, it } from 'vitest'

import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
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
    ['known', 'class-2014-bard', { cantripIds: ['spell-2014-mage-hand'], knownSpellIds: ['spell-2014-magic-missile'], preparedSpellIds: [], spellbookSpellIds: [],
        transcribedSpellIds: [] }],
    ['prepared', 'class-2014-cleric', { cantripIds: [], knownSpellIds: [], preparedSpellIds: ['spell-2014-bless'], spellbookSpellIds: [],
        transcribedSpellIds: [] }],
    ['pact', 'class-2014-warlock', { cantripIds: ['spell-2014-mage-hand'], knownSpellIds: ['spell-2014-magic-missile'], preparedSpellIds: [], spellbookSpellIds: [],
        transcribedSpellIds: [] }],
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

  it('已选选择类选项（超魔、战技、法术精通）进入导出特性列表', () => {
    const draft = {
      ...fighterDraft,
      classId: 'class-2014-sorcerer',
      subclassId: undefined,
      targetLevel: 3,
      selections: [
        { checkpointId: 'sorcerer-2014-metamagic-3', optionIds: ['metamagic-careful', 'metamagic-quickened'], confirmedAt: '' },
      ],
    }
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    const metamagicFeatures = model.features.filter((feature) => feature.id.startsWith('metamagic-'))
    expect(metamagicFeatures.map((feature) => feature.name)).toEqual(['谨慎法术', '迅捷法术'])
    expect(metamagicFeatures[0]?.summary).toContain('豁免自动视为成功')
  })

  it('prepared 模式导出全部可达职业法术并标记已准备', () => {
    const cleric = {
      ...fighterDraft,
      classId: 'class-2014-cleric',
      subclassId: undefined,
      targetLevel: 3,
      spellSelections: {
        cantripIds: ['spell-2014-guidance'],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2014-bless'],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
    }
    const model = buildCharacterExportModel(cleric, deriveCharacter(cleric))
    const spells = model.spellcasting?.spells ?? []
    // 已学戏法 + 全部可达 1 环职业法术
    expect(spells.find((spell) => spell.id === 'spell-2014-guidance')?.prepared).toBe(false)
    const prepared = spells.find((spell) => spell.id === 'spell-2014-bless')
    expect(prepared?.prepared).toBe(true)
    // 全列表远大于已准备数量（包含未准备的职业法术）
    expect(spells.filter((spell) => spell.level > 0).length).toBeGreaterThan(2)
    expect(spells.filter((spell) => spell.prepared)).toEqual([expect.objectContaining({ id: 'spell-2014-bless' })])
  })

  it('prepared 模式导出排序：已准备法术全部排在未准备之前，组内按环级与名称', () => {
    const cleric = {
      ...fighterDraft,
      classId: 'class-2014-cleric',
      subclassId: undefined,
      targetLevel: 5,
      spellSelections: {
        cantripIds: ['spell-2014-guidance'],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2014-spiritual-weapon', 'spell-2014-bless'],
        spellbookSpellIds: [],
        transcribedSpellIds: [],
      },
    }
    const model = buildCharacterExportModel(cleric, deriveCharacter(cleric))
    const spells = model.spellcasting?.spells ?? []
    // 高环（2 环）已准备法术也应排在任何未准备法术（含 1 环）之前
    const preparedIds = spells.filter((spell) => spell.prepared).map((spell) => spell.id)
    expect(preparedIds).toEqual(['spell-2014-bless', 'spell-2014-spiritual-weapon'])
    const firstUnpreparedIndex = spells.findIndex((spell) => !spell.prepared)
    expect(spells.slice(0, firstUnpreparedIndex).every((spell) => spell.prepared)).toBe(true)
    expect(spells.slice(firstUnpreparedIndex).every((spell) => !spell.prepared)).toBe(true)
  })

  it('战斗大师战技与法术精通选项同样导出', () => {
    const battleMaster = {
      ...fighterDraft,
      targetLevel: 3,
      subclassId: 'subclass-2014-fighter-battle-master',
      selections: [
        { checkpointId: 'subclass-feature-fighter-battle-master-combat-superiority', optionIds: ['maneuver-precision', 'maneuver-trip'], confirmedAt: '' },
      ],
    }
    const model = buildCharacterExportModel(battleMaster, deriveCharacter(battleMaster))
    expect(model.features.find((feature) => feature.id === 'maneuver-precision')?.name).toBe('精准攻击')
    expect(model.features.find((feature) => feature.id === 'maneuver-precision')?.summary).toContain('优势骰')

    const wizard = {
      ...fighterDraft,
      classId: 'class-2014-wizard',
      subclassId: undefined,
      targetLevel: 18,
      spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: ['spell-2014-magic-missile'], transcribedSpellIds: [] },
      selections: [
        { checkpointId: 'wizard-2014-spell-mastery-1', optionIds: ['spell-2014-magic-missile'], confirmedAt: '' },
      ],
    }
    const wizardModel = buildCharacterExportModel(wizard, deriveCharacter(wizard))
    expect(wizardModel.features.find((feature) => feature.id === 'spell-2014-magic-missile')?.name).toBe('魔法飞弹')
  })

  it('非施法职业导出最终人工数值、环位与系统库法术', () => {
    const edited = {
      ...fighterDraft,
      manualEdits: {
        ...EMPTY_MANUAL_EDITS,
        abilityAdjustments: { str: 3 },
        derivedAdjustments: {
          armorClass: 2,
          hitPoints: 20,
          attackBonus: 1,
          attackDamageBonus: 2,
          spellAttackBonus: 7,
          spellSaveDc: 15,
        },
        spellSlotAdjustments: { 1: 2 },
        addedSpells: [{ spellId: 'spell-2014-magic-missile', destination: 'granted' as const, prepared: true }],
      },
    }
    const derived = deriveCharacter(edited)
    const model = buildCharacterExportModel(edited, derived)

    expect(model.abilities.str.score).toBe(derived.abilities.str)
    expect(model.combat.armorClass).toBe(derived.armorClass.value)
    expect(model.combat.hitPointMaximum).toBe(derived.hitPoints.value)
    expect(model.attacks[0]?.attackBonus).toBe(derived.attackBonus.value)
    expect(model.spellcasting).toMatchObject({ className: '战士', saveDc: 15, attackBonus: 7 })
    expect(model.spellcasting?.slots).toEqual([{ level: 1, count: 2, pact: false }])
    expect(model.spellcasting?.spells).toContainEqual(expect.objectContaining({ id: 'spell-2014-magic-missile', prepared: true }))
  })
})
