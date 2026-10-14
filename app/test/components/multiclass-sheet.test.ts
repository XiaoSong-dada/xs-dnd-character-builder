import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'
import { deriveCharacter } from '@/rules/derive'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft } from '@/types/character'

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 13, wis: 13, cha: 13 }

beforeEach(() => {
  setActivePinia(createPinia())
})

function sheetDraft(classes: readonly { readonly classId: string; readonly level: number; readonly subclassId?: string }[], overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  const first = classes[0]
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: first?.classId,
    subclassId: first?.subclassId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: first?.classId ?? '', classes, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
    ...overrides,
  })
}

function mountSheet(draft: CharacterDraft) {
  return mount(CharacterSheetStep, {
    props: { draft, derived: deriveCharacter(draft) },
    global: { stubs: { teleport: true } },
  })
}

async function mountSheetOnTab(draft: CharacterDraft, tab: 3 | 4) {
  const wrapper = mountSheet(draft)
  await wrapper.get(`[role="tab"]:nth-child(${tab})`).trigger('click')
  return wrapper
}

describe('MC-E03 角色卡多职业展示', () => {
  it('兼职时头部显示「职业+该职业等级」并按总等级给出角色等级', () => {
    const wrapper = mountSheet(sheetDraft([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ]))
    const header = wrapper.get('.character-sheet__header-content')
    expect(header.text()).toContain('战士3 / 游荡者2（5 级角色）')
  })

  it('单职业时头部保持「职业+等级」且不出现括号总等级', () => {
    const wrapper = mountSheet(sheetDraft([{ classId: 'class-2014-fighter', level: 5 }]))
    const header = wrapper.get('.character-sheet__header-content')
    expect(header.text()).toContain('战士5')
    expect(header.text()).not.toContain('级角色')
  })

  it('职业特性按职业分区，标题显示各职业等级与起始职业标记', async () => {
    const wrapper = await mountSheetOnTab(sheetDraft([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ]), 3)
    const headings = wrapper.findAll('.character-sheet__subclass-features-header h3').map((item) => item.text())
    const classHeadings = headings.filter((text) => text.startsWith('职业特性'))
    expect(classHeadings.some((text) => text.includes('战士3 级') && text.includes('起始职业'))).toBe(true)
    expect(classHeadings.some((text) => text.includes('游荡者2 级') && !text.includes('起始职业'))).toBe(true)
  })

  it('特性只累积到各职业自己的等级（战士 3 级不含 5 级额外攻击）', async () => {
    const wrapper = await mountSheetOnTab(sheetDraft([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-barbarian', level: 5 },
    ]), 3)
    const text = wrapper.text()
    // 野蛮人 5 级有额外攻击；战士 3 级没有
    expect(text).toContain('额外攻击')
    const fighterSection = wrapper.findAll('.character-sheet__subclass-features')
      .find((section) => section.get('h3').text().includes('战士3 级'))
    expect(fighterSection?.text()).not.toContain('额外攻击')
  })

  it('每个职业各自展示自己的子职特性', async () => {
    const wrapper = await mountSheetOnTab(sheetDraft([
      { classId: 'class-2014-fighter', level: 3, subclassId: 'subclass-2014-fighter-battle-master' },
      { classId: 'class-2014-rogue', level: 3, subclassId: 'subclass-2014-rogue-assassin' },
    ]), 3)
    const headings = wrapper.findAll('.character-sheet__subclass-features-header h3').map((item) => item.text())
    expect(headings.some((text) => text.includes('战斗大师') && text.includes('战士3 级'))).toBe(true)
    expect(headings.some((text) => text.includes('刺客') && text.includes('游荡者3 级'))).toBe(true)
  })

  it('子职等级不足时给出该子职的空特性提示', async () => {
    const wrapper = await mountSheetOnTab(sheetDraft([
      { classId: 'class-2014-fighter', level: 1, subclassId: 'subclass-2014-fighter-battle-master' },
      { classId: 'class-2014-rogue', level: 2 },
    ]), 3)
    expect(wrapper.text()).toContain('该子职在当前等级暂无已登记特性')
  })

  it('未选择子职时给出提示', async () => {
    const wrapper = await mountSheetOnTab(sheetDraft([{ classId: 'class-2014-fighter', level: 3 }]), 3)
    expect(wrapper.text()).toContain('尚未选择子职')
  })

  it('兼职法术位同时展示通用池与契约池', async () => {
    const wrapper = await mountSheetOnTab(sheetDraft([
      { classId: 'class-2014-warlock', level: 3 },
      { classId: 'class-2014-wizard', level: 5 },
    ]), 4, 4)
    const label = wrapper.text()
    expect(label).toContain('契约：')
    expect(label).toContain('1环×4')
  })

  it('2024 边界说明已更新：兼职已支持', () => {
    const wrapper = mountSheet(sheetDraft([{ classId: 'class-2014-fighter', level: 3 }], { ruleset: '5e-2024', classId: 'class-2024-fighter' }))
    expect(wrapper.text()).toContain('兼职（多职业）已支持')
  })

  it('戏法按角色总等级标注成长值，基础值不标注', async () => {
    // 总等级 7：火焰箭应为 2d10
    const upgraded = await mountSheetOnTab(sheetDraft([
      { classId: 'class-2014-fighter', level: 4 },
      { classId: 'class-2014-wizard', level: 3 },
    ], {
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt'],
        knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [ 'spell-2014-magic-missile' ], transcribedSpellIds: [],
      },
    }), 4)
    expect(upgraded.text()).toContain('按角色总等级 7 级：当前 2d10')

    // 总等级 3：未达成长节点，不显示成长标注
    const base = await mountSheetOnTab(sheetDraft([
      { classId: 'class-2014-fighter', level: 1 },
      { classId: 'class-2014-wizard', level: 2 },
    ], {
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt'],
        knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: ['spell-2014-magic-missile'], transcribedSpellIds: [],
      },
    }), 4)
    expect(base.text()).not.toContain('按角色总等级')
  })

  it('未登记成长规则的法术不显示成长标注（决策 D12）', async () => {
    const wrapper = await mountSheetOnTab(sheetDraft([
      { classId: 'class-2014-fighter', level: 1 },
      { classId: 'class-2014-wizard', level: 16 },
    ], {
      spellSelections: {
        cantripIds: ['spell-2014-mage-hand'],
        knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: ['spell-2014-magic-missile'], transcribedSpellIds: [],
      },
    }), 4)
    expect(wrapper.text()).not.toContain('按角色总等级')
  })
})
