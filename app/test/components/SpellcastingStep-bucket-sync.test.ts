import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import { getClassSpellSelections, getRequiredCantripCount, getRequiredSpellCount, getSpellcastingConfig } from '@/rules/spellcasting'
import SpellcastingStep from '@/views/character-builder/components/SpellcastingStep.vue'
import { draft2024 } from '../fixtures/draft-2024'
import type { CharacterDraft, SpellSelections } from '@/types/character'

const WIZARD = 'class-2014-wizard'
const SORCERER = 'class-2014-sorcerer'

/** 术士 5 级：戏法与已知法术都刚好选满（用于验证「名额已满」时的点击反馈）。 */
function fullSorcerer(): CharacterDraft {
  const base = draft2024({
    ruleset: '5e-2014',
    classId: SORCERER,
    targetLevel: 5,
    baseAbilities: { str: 10, dex: 14, con: 13, int: 8, wis: 12, cha: 15 },
  })
  const config = getSpellcastingConfig(base)
  const spells = (config?.classSpellIds ?? []).map((id) => rulesRepository.getSpell(id)).filter((spell): spell is NonNullable<typeof spell> => Boolean(spell))
  return {
    ...base,
    spellSelections: {
      cantripIds: spells.filter((spell) => spell.level === 0).slice(0, config ? getRequiredCantripCount(base, config) : 0).map((spell) => spell.id),
      knownSpellIds: spells.filter((spell) => spell.level > 0).slice(0, config ? getRequiredSpellCount(base, config) : 0).map((spell) => spell.id),
      preparedSpellIds: [],
      spellbookSpellIds: [],
      transcribedSpellIds: [],
    },
  }
}

/**
 * 回归用例（用户反馈）：带「按职业分桶」的旧卡法术加不上也删不掉。
 *
 * 根因：读取（`getClassSpellSelections`）只要该职业有分桶就以分桶为准，
 * 而法术步骤原先只在「施法作用域数 > 1」时才写分桶，单职业（v10 迁移给每张旧卡都建了一个分桶）
 * 写入落在顶层数组上 → 界面读分桶 → 改动看不见。
 *
 * 断言口径：把 emit 出的负载套回草稿后，**按读取口径取值**必须真的变了。
 */
function wizardWithStaleBucket(): CharacterDraft {
  return draft2024({
    ruleset: '5e-2014',
    classId: WIZARD,
    subclassId: 'subclass-2014-wizard-evocation',
    targetLevel: 5,
    spellSelections: {
      cantripIds: ['spell-2014-fire-bolt'],
      knownSpellIds: [],
      preparedSpellIds: [],
      spellbookSpellIds: ['spell-2014-magic-missile'],
      transcribedSpellIds: [],
      classSpellSelections: [{
        classId: WIZARD,
        cantripIds: ['spell-2014-fire-bolt'],
        knownSpellIds: [],
        preparedSpellIds: [],
        spellbookSpellIds: ['spell-2014-magic-missile'],
      }],
    },
  })
}

/** 单击判定有 250ms 双击窗口（ExpandableOptionCard），测试用假定时器越过它。 */
async function clickCard(wrapper: VueWrapper, selector: string): Promise<void> {
  await wrapper.get(selector).trigger('click')
  vi.advanceTimersByTime(300)
  await flushPromises()
}

function lastChange(wrapper: VueWrapper): SpellSelections {
  const events = wrapper.emitted('change')
  expect(events, '未触发 change 事件').toBeTruthy()
  return (events as unknown[][])[events!.length - 1]![0] as SpellSelections
}

describe('法术步骤：写入必须落在读取用的那份数据上（分桶同步）', () => {
  afterEach(() => { vi.useRealTimers() })

  it('新增法术：带残留分桶的单职业卡也能生效', async () => {
    vi.useFakeTimers()
    const draft = wizardWithStaleBucket()
    const before = getClassSpellSelections(draft, WIZARD).cantripIds
    const wrapper = mount(SpellcastingStep, { props: { draft } })

    // 找一个未选中的候选（当前任务默认是「选择戏法」）
    const candidate = wrapper.findAll('.expandable-option-card').find((card) => !card.classes().includes('expandable-option-card--selected'))
    expect(candidate).toBeTruthy()
    const title = candidate!.get('strong').text()
    await candidate!.get('.expandable-option-card__main').trigger('click')
    vi.advanceTimersByTime(300)
    await flushPromises()

    const applied: CharacterDraft = { ...draft, spellSelections: lastChange(wrapper) }
    const after = getClassSpellSelections(applied, WIZARD).cantripIds
    expect(after.length).toBe(before.length + 1)
    expect(after).not.toEqual(before)
    expect(wrapper.text()).toContain(title)
  })

  it('移除法术：已选中的法术也能被取消', async () => {
    vi.useFakeTimers()
    const draft = wizardWithStaleBucket()
    const before = getClassSpellSelections(draft, WIZARD).cantripIds
    expect(before).toEqual(['spell-2014-fire-bolt'])
    const wrapper = mount(SpellcastingStep, { props: { draft } })

    // 「当前已选」区块里的第一张卡 = 已选法术，点它即取消
    const selected = wrapper.findAll('.expandable-option-card--selected')[0]
    expect(selected).toBeTruthy()
    await selected!.get('.expandable-option-card__main').trigger('click')
    vi.advanceTimersByTime(300)
    await flushPromises()

    const applied: CharacterDraft = { ...draft, spellSelections: lastChange(wrapper) }
    const after = getClassSpellSelections(applied, WIZARD).cantripIds
    expect(after).toEqual([])
  })

  it('名额已满时点击候选项：不写入，但聚焦「当前名额已选满」提示（不再静默无效）', async () => {
    vi.useFakeTimers()
    const draft = fullSorcerer()
    const wrapper = mount(SpellcastingStep, { props: { draft }, attachTo: document.body })
    const candidate = wrapper.findAll('.expandable-option-card').find((card) => !card.classes().includes('expandable-option-card--selected'))
    expect(candidate).toBeTruthy()

    await candidate!.get('.expandable-option-card__main').trigger('click')
    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(wrapper.emitted('change')).toBeFalsy()
    expect(document.activeElement).toBe(wrapper.get('.spellcasting-step__capacity').element)
    wrapper.unmount()
  })
})
