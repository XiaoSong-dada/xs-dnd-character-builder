import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAvailableSpells, validateSpellSelections } from '@/rules/spellcasting'
import { rulesRepository } from '@/rules/repository'
import SpellcastingStep from '@/views/character-builder/components/SpellcastingStep.vue'
import type { CharacterDraft } from '@/types/character'

function bardDraft(targetLevel: number): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'bard-flow',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-bard',
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: ['language-elvish', 'language-dwarvish'],
    proficiencyReplacements: [],
    baseAbilities: { str: 10, dex: 12, con: 13, int: 8, wis: 10, cha: 16 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
    name: '吟游诗人流程回归',
    alignment: '',
    notes: '',
    currentStep: 'spells',
  }
}

describe('吟游诗人法术步骤(回归:法术池充足且可在手机宽度完成)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  /** 单击主按钮 = 选择，但选择在 250ms 双击判定窗口后 emit；测试需推进定时器。 */
  async function clickMain(wrapper: ReturnType<typeof mount>, button: ReturnType<typeof mount>['element']) {
    await button.trigger('click')
    await vi.advanceTimersByTimeAsync(250)
  }

  it('1 级渲染至少 2 个戏法与 4 个 1 环法术可选', () => {
    // 模拟手机宽度视口
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))

    const draft = bardDraft(1)
    const config = rulesRepository.getClass('class-2014-bard')?.spellcasting
    expect(config).toBeDefined()
    if (!config) return

    const available = getAvailableSpells(draft, config)
    const cantrips = available.filter((spell) => spell.level === 0)
    const level1 = available.filter((spell) => spell.level === 1)
    expect(cantrips.length).toBeGreaterThanOrEqual(2)
    expect(level1.length).toBeGreaterThanOrEqual(4)

    const wrapper = mount(SpellcastingStep, { props: { draft } })
    const cards = wrapper.findAll('.expandable-option-card__main')
    // 渲染出的可点选项数 >= 需求(2 戏法 + 4 法术)
    expect(cards.length).toBeGreaterThanOrEqual(6)
    // 顶部计数显示 0 / 4
    expect(wrapper.text()).toContain('0 / 4')
  })

  it('在手机宽度下选择 2 戏法 + 4 个 1 环法术后可完成法术步骤', async () => {
    let draft = bardDraft(1)
    const wrapper = mount(SpellcastingStep, { props: { draft } })

    // 受控组件:每次点击后把 change 结果回写 draft 再渲染
    const buttons = wrapper.findAll('.expandable-option-card__main')
    // 前 2 个为戏法;1 环法术按钮文本含 "1环"
    const cantripButtons = buttons.slice(0, 2)
    const level1Buttons = buttons.filter((b) => b.text().includes('1环')).slice(0, 4)
    expect(level1Buttons.length).toBe(4)
    for (const button of [...cantripButtons, ...level1Buttons]) {
      await clickMain(wrapper, button)
      const changes = wrapper.emitted('change')
      const latest = changes?.[changes.length - 1]?.[0] as CharacterDraft['spellSelections']
      draft = { ...draft, spellSelections: latest }
      await wrapper.setProps({ draft })
    }

    const withSelections = draft
    expect(withSelections.spellSelections.cantripIds.length).toBe(2)
    expect(withSelections.spellSelections.knownSpellIds.length).toBe(4)
    expect(validateSpellSelections(withSelections)).toBe(true)
  })

  it('点击右侧三角形展开法术效果摘要，双击卡片也可展开且不改变选择', async () => {
    const draft = bardDraft(1)
    const wrapper = mount(SpellcastingStep, { props: { draft } })

    // 三角形展开：找到恶毒嘲笑（诗人戏法）卡片，展开后可见其原创摘要（含"1d4"）
    const firstCard = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('恶毒嘲笑'))
    expect(firstCard).toBeTruthy()
    await firstCard!.find('.expandable-option-card__arrow').trigger('click')
    expect(firstCard!.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(firstCard!.text()).toContain('1d4')

    // 双击主按钮展开第二个戏法卡片，且不触发 change
    const secondCard = wrapper.findAll('.expandable-option-card')[1]
    const main = secondCard.find('.expandable-option-card__main')
    await main.trigger('click')
    await main.trigger('click')
    expect(secondCard.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(wrapper.emitted('change')).toBeUndefined()
  })
})
