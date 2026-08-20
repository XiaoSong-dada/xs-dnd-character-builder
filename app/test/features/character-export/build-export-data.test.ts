import { describe, expect, it } from 'vitest'

import { buildCharacterExportData } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import type { XlsxExportSection } from '@/services/export-xlsx'
import type { CharacterDraft } from '@/types/character'

const draft: CharacterDraft = {
  schemaVersion: 3,
  id: 'export-data-fixture',
  ruleset: '5e-2014',
  createdAt: '',
  updatedAt: '',
  targetLevel: 4,
  abilityMethod: 'standard-array',
  preferences: [],
  classId: 'class-2014-fighter',
  backgroundId: 'background-2014-soldier',
  raceId: 'race-2014-half-orc',
  raceAbilityChoices: [],
  backgroundSkillIds: ['skill-athletics', 'skill-intimidation'],
  backgroundToolIds: [],
  languages: [],
  proficiencyReplacements: [],
  baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
  selections: [],
  startingEquipmentSelections: [],
  inventory: [
    { id: 'entry-longsword', itemId: 'longsword', quantity: 1, sourceKind: 'class', sourceId: 'class-2014-fighter', equippedQuantity: 1 },
    { id: 'entry-potion', itemId: 'potion-of-healing', quantity: 2, sourceKind: 'adventure', sourceId: 'draft', equippedQuantity: 0 },
  ],
  currency: { cp: 5, sp: 0, ep: 0, gp: 10, pp: 0 },
  adventureGold: 7,
  equipmentNeedsReview: false,
  spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
  name: '测试角色',
  alignment: '守序善良',
  notes: '来自测试夹具',
  currentStep: 'sheet',
}

const wizardDraft: CharacterDraft = {
  ...draft,
  classId: 'class-2014-wizard',
  subclassId: 'subclass-2014-wizard-evocation',
  targetLevel: 3,
  spellSelections: {
    cantripIds: ['spell-2014-fire-bolt', 'spell-2014-mage-hand'],
    knownSpellIds: [],
    preparedSpellIds: ['spell-2014-magic-missile'],
    spellbookSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
  },
}

function findSection(sections: readonly XlsxExportSection[], title: string): XlsxExportSection {
  const section = sections.find((item) => item.title === title)
  expect(section, `缺少区块：${title}`).toBeDefined()
  return section as XlsxExportSection
}

describe('buildCharacterExportData 导出数据组装', () => {
  it('基础信息与身份字段完整且为中文', () => {
    const data = buildCharacterExportData(draft, deriveCharacter(draft))
    expect(data.title).toBe('测试角色')
    expect(data.subtitle).toContain('4 级')
    expect(data.subtitle).toContain('战士')
    expect(data.subtitle).toContain('半兽人')
    const identity = findSection(data.sections, '基础信息')
    expect(identity.rows).toContainEqual(['角色名', '测试角色', ''])
    expect(identity.rows).toContainEqual(['阵营', '守序善良', ''])
    expect(identity.rows).toContainEqual(['等级', 4, ''])
  })

  it('属性行与规则层派生一致（值与调整值）', () => {
    const derived = deriveCharacter(draft)
    const data = buildCharacterExportData(draft, derived)
    const abilities = findSection(data.sections, '属性')
    for (const row of abilities.rows) {
      const key = ['力量', '敏捷', '体质', '智力', '感知', '魅力'].indexOf(String(row[0]))
      expect(key).toBeGreaterThanOrEqual(0)
      expect(row[1]).toBe(derived.abilities[['str', 'dex', 'con', 'int', 'wis', 'cha'][key] as 'str'])
      expect(String(row[2])).toContain(String(derived.modifiers[['str', 'dex', 'con', 'int', 'wis', 'cha'][key] as 'str']))
    }
  })

  it('核心数值含熟练加值、HP、AC、先攻、速度与被动感知', () => {
    const derived = deriveCharacter(draft)
    const data = buildCharacterExportData(draft, derived)
    const core = findSection(data.sections, '核心数值')
    expect(core.rows).toContainEqual(['熟练加值', `+${derived.proficiencyBonus.value}`, expect.any(String)])
    expect(core.rows).toContainEqual(['生命值', derived.hitPoints.value, expect.any(String)])
    expect(core.rows).toContainEqual(['护甲等级', derived.armorClass.value, expect.any(String)])
    expect(core.rows).toContainEqual(['被动感知', 10 + derived.skills['skill-perception'].value, '10 + 察觉'])
  })

  it('技能行数与规则层一致，豁免带符号', () => {
    const derived = deriveCharacter(draft)
    const data = buildCharacterExportData(draft, derived)
    expect(findSection(data.sections, '技能').rows).toHaveLength(Object.keys(derived.skills).length)
    const saves = findSection(data.sections, '豁免')
    expect(saves.rows).toHaveLength(6)
    const strengthSave = saves.rows.find((row) => row[0] === '力量')
    expect(strengthSave).toBeDefined()
    expect(String(strengthSave![1])).toMatch(/^[+-]?\d+$/)
  })

  it('施法职业导出法术位、戏法与按环法术、法术书', () => {
    const derived = deriveCharacter(wizardDraft)
    const data = buildCharacterExportData(wizardDraft, derived)
    const attack = findSection(data.sections, '攻击与法术')
    expect(attack.rows.some((row) => String(row[0]) === '法术位')).toBe(true)
    expect(attack.rows.some((row) => String(row[0]) === '法术豁免 DC' && row[1] !== '—')).toBe(true)

    const cantrips = findSection(data.sections, '戏法')
    expect(cantrips.rows).toHaveLength(2)
    expect(cantrips.rows).toContainEqual(['火焰箭', 'Fire Bolt', ''])

    const level1 = findSection(data.sections, '1 环法术')
    expect(level1.rows).toContainEqual(['魔法飞弹', 'Magic Missile', ''])

    const spellbook = findSection(data.sections, '法术书')
    expect(spellbook.rows).toHaveLength(2)
    expect(spellbook.rows).toContainEqual(['护盾术', 'Shield', '在书中'])
  })

  it('非施法职业不导出法术区块与法术位', () => {
    const derived = deriveCharacter(draft)
    const data = buildCharacterExportData(draft, derived)
    expect(data.sections.some((section) => section.title === '戏法')).toBe(false)
    expect(data.sections.some((section) => section.title === '1 环法术')).toBe(false)
    const attack = findSection(data.sections, '攻击与法术')
    expect(attack.rows.some((row) => String(row[0]) === '法术位')).toBe(false)
    expect(attack.rows).toContainEqual(['法术豁免 DC', '—', '当前职业无施法能力'])
  })

  it('物品与金币：数量、装备数与来源中文标注，金币含冒险净增', () => {
    const derived = deriveCharacter(draft)
    const data = buildCharacterExportData(draft, derived)
    const items = findSection(data.sections, '物品与金币')
    expect(items.rows).toContainEqual(['长剑', '数量 ×1（装备 1）', '起始装备'])
    expect(items.rows).toContainEqual(['治疗药水', '数量 ×2（装备 0）', '冒险获得'])
    expect(items.rows).toContainEqual(['持有金币（GP）', 17, '起始 10 · 冒险净增 +7'])
    expect(items.rows).toContainEqual(['铜币（CP）', 5, ''])
  })
})
