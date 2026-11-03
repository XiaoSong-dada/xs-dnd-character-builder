import { afterEach, describe, expect, it } from 'vitest'

import { draft2024 } from '../fixtures/draft-2024'
import { emptyBundle } from '@/rules/custom-content'
import { deriveCharacter } from '@/rules/derive'
import { getRulesRepository, registerCustomContent, resetCustomContent } from '@/rules/repositories'
import { getSpellcastingConfig } from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft } from '@/types/character'
import type { CustomClassEntry, CustomExpansion } from '@/types/custom-content'

const NOW = '2026-10-19T00:00:00.000Z'
const SOURCE = 'source-custom-test'

function expansion(): CustomExpansion {
  return {
    id: SOURCE,
    ruleset: '5e-2014',
    title: '职业测试书',
    shortTitle: '职测',
    defaultEnabled: true,
    createdAt: NOW,
    updatedAt: NOW,
  }
}

function classEntry(overrides: Partial<CustomClassEntry> = {}): CustomClassEntry {
  return {
    kind: 'class',
    id: 'custom-class-1',
    expansionId: SOURCE,
    ruleset: '5e-2014',
    name: '工坊战士',
    englishName: 'Workshop Fighter',
    summary: '自制职业',
    description: '说明',
    createdAt: NOW,
    updatedAt: NOW,
    hitDie: 10,
    primaryAbilities: ['力量'],
    savingThrowAbilities: ['wis', 'cha'],
    unarmoredDefense: { ability: 'con', allowsShield: false },
    spellcastingSourceClassId: 'class-2014-wizard',
    spellcastingAbility: 'int',
    features: [{ id: 'feature-1', name: '战意', level: 2, summary: '摘要', description: '说明' }],
    ...overrides,
  }
}

function customClassDraft(classes: readonly CustomClassEntry[], overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  registerCustomContent('5e-2014', {
    ...emptyBundle(),
    expansions: [expansion()],
    classes: [...classes],
  })
  return {
    ...draft2024({
      ruleset: '5e-2014',
      classId: classes[0]?.id ?? 'custom-class-1',
      targetLevel: 4,
      enabledSourceIds: [SOURCE],
      ...overrides,
    }),
    multiclass: undefined,
  }
}

describe('内容工坊：自定义职业的派生与时间线', () => {
  afterEach(() => {
    resetCustomContent()
  })

  it('生命骰参与最大生命值计算', () => {
    const d10 = deriveCharacter(customClassDraft([classEntry()]))
    // d10、体质 13（+1）、4 级：首级 11 + 3×(6+1) = 32
    expect(d10.hitPoints.value).toBe(32)

    resetCustomContent()
    const d6 = deriveCharacter(customClassDraft([classEntry({ hitDie: 6 })]))
    // d6：首级 7 + 3×(4+1) = 22
    expect(d6.hitPoints.value).toBe(22)
  })

  it('豁免熟练只加在所选的两项上', () => {
    const derived = deriveCharacter(customClassDraft([classEntry()]))
    // 4 级熟练加值 +2；感知 12（+1）、魅力 10（0）、力量 15（+2，未选）
    expect(derived.savingThrows.wis.value).toBe(3)
    expect(derived.savingThrows.cha.value).toBe(2)
    expect(derived.savingThrows.str.value).toBe(2)
  })

  it('无甲防御按所配属性计算 AC', () => {
    const derived = deriveCharacter(customClassDraft([classEntry()]))
    // 10 + 敏捷 2 + 体质 1
    expect(derived.armorClass.value).toBe(13)
  })

  it('不生成子职与额外选择检查点', () => {
    const draft = customClassDraft([classEntry()])
    const checkpoints = buildTimeline('custom-class-1', 4, {
      ruleset: '5e-2014',
      repository: getRulesRepository('5e-2014'),
    })
    expect(checkpoints).toHaveLength(0)
  })

  it('施法配置复用所引用职业的法术表与模式', () => {
    const draft = customClassDraft([classEntry()])
    const config = getSpellcastingConfig(draft)
    const wizardConfig = getRulesRepository('5e-2014').getClass('class-2014-wizard')?.spellcasting

    expect(config?.ability).toBe('int')
    expect(config?.mode).toBe(wizardConfig?.mode)
    expect(config?.classSpellIds).toEqual(wizardConfig?.classSpellIds)
  })

  it('未开启施法时不提供施法配置', () => {
    const draft = customClassDraft([classEntry({
      spellcastingSourceClassId: undefined,
      spellcastingAbility: undefined,
    })])
    expect(getSpellcastingConfig(draft)).toBeUndefined()
  })

  it('职业特性进入时间线的能力展示数据（通过仓库可读）', () => {
    const draft = customClassDraft([classEntry()])
    const classRule = getRulesRepository('5e-2014').getClass('custom-class-1')
    expect(classRule?.features?.map((feature) => feature.name)).toEqual(['战意'])
    expect(classRule?.features?.[0]?.level).toBe(2)
    expect(draft.classId).toBe('custom-class-1')
  })
})
