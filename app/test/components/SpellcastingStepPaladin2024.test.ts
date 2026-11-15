import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAvailableSpells, getSpellcastingConfig, validateSpellSelections } from '@/rules/spellcasting'
import SpellcastingStep from '@/views/character-builder/components/SpellcastingStep.vue'
import type { CharacterDraft } from '@/types/character'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'

/**
 * 缺陷回归（v1.14.2）：5e-2024 1 级圣武士第 8 步曾显示「最高0环」、候选为空且无法完成。
 * 这里在组件层确认：渲染出 1 环候选、计数 0/2 可推进到 2/2、写回后规则校验通过。
 */
const paladinDraft = (preparedSpellIds: readonly string[] = []): CharacterDraft =>
  draft2024({
    classId: 'class-2024-paladin',
    targetLevel: 1,
    currentStep: 'spells',
    spellSelections: { ...emptySpellSelections(), preparedSpellIds: [...preparedSpellIds] },
  })

describe('2024 圣武士法术步骤（缺陷回归：1 级可选 2 个一环法术）', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  /** 单击主按钮 = 选择，但选择在 250ms 双击判定窗口后 emit；测试需推进定时器。 */
  async function clickMain(button: { trigger: (event: string) => Promise<void> }) {
    await button.trigger('click')
    await vi.advanceTimersByTimeAsync(250)
  }

  const chooseCard = async (wrapper: ReturnType<typeof mount>) => {
    const candidate = wrapper.findAll('.expandable-option-card')
      .find((card) => card.find('.expandable-option-card__badges').text().includes('选择'))
    expect(candidate, '应存在可选法术候选').toBeTruthy()
    await clickMain(candidate!.get('.expandable-option-card__main'))
    return wrapper.emitted('change')?.at(-1)?.[0] as CharacterDraft['spellSelections']
  }

  it('1 级渲染 1 环候选，不再显示「最高0环」或空列表文案', () => {
    const draft = paladinDraft()
    const config = getSpellcastingConfig({ classId: 'class-2024-paladin', enabledSourceIds: [], ruleset: '5e-2024' })
    if (!config) throw new Error('缺少圣武士施法配置')
    expect(getAvailableSpells(draft, config).filter((spell) => spell.level === 1).length).toBeGreaterThanOrEqual(2)

    const wrapper = mount(SpellcastingStep, { props: { draft } })
    expect(wrapper.text()).toContain('最高1环')
    expect(wrapper.text()).not.toContain('最高0环')
    expect(wrapper.text()).not.toContain('没有匹配的法术。')
    expect(wrapper.text()).not.toContain('施法尚未开始')
    expect(wrapper.get('[data-task-id$=":spells"]').text()).toContain('0/2')
    // 候选列表真的渲染出了一环法术（此前被「最高0环」过滤成空）。
    expect(wrapper.text()).toContain('祝福术')
  })

  it('连续选择 2 个一环法术后计数 2/2 且规则校验通过', async () => {
    let draft = paladinDraft()
    const wrapper = mount(SpellcastingStep, { props: { draft } })
    expect(wrapper.get('[data-task-id$=":spells"]').text()).toContain('0/2')

    for (let index = 0; index < 2; index += 1) {
      const selections = await chooseCard(wrapper)
      expect(selections.preparedSpellIds.length).toBe(index + 1)
      draft = { ...draft, spellSelections: selections }
      await wrapper.setProps({ draft })
    }

    expect(draft.spellSelections.preparedSpellIds).toHaveLength(2)
    expect(validateSpellSelections(draft)).toBe(true)
    expect(wrapper.get('[data-task-id$=":spells"]').text()).toContain('2/2')
  })
})
