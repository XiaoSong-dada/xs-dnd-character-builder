import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getAvailableSpells, validateSpellSelections } from '@/rules/spellcasting'
import { rulesRepository } from '@/rules/repository'
import SpellcastingStep from '@/views/character-builder/components/SpellcastingStep.vue'
import type { CharacterDraft } from '@/types/character'

function clericDraft(targetLevel: number): CharacterDraft {
  return {
    schemaVersion: 3,
    id: 'cleric-flow',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-cleric',
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: ['language-elvish', 'language-dwarvish'],
    proficiencyReplacements: [],
    baseAbilities: { str: 15, dex: 10, con: 13, int: 8, wis: 12, cha: 14 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    name: '牧师流程回归',
    alignment: '',
    notes: '',
    currentStep: 'spells',
  }
}

describe('牧师法术步骤（缺陷回归：1 级可选 3 个职业戏法）', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  /** 单击主按钮 = 选择，但选择在 250ms 双击判定窗口后 emit；测试需推进定时器。 */
  async function clickMain(wrapper: ReturnType<typeof mount>, button: ReturnType<typeof mount>['element']) {
    await button.trigger('click')
    await vi.advanceTimersByTimeAsync(250)
  }

  it('1 级渲染戏法区块：候选为职业 0 环法术，计数 0 / 3', () => {
    const draft = clericDraft(1)
    const config = rulesRepository.getClass('class-2014-cleric')?.spellcasting
    expect(config).toBeDefined()
    if (!config) return

    const available = getAvailableSpells(draft, config)
    const cantrips = available.filter((spell) => spell.level === 0)
    expect(cantrips.length).toBeGreaterThanOrEqual(3)

    const wrapper = mount(SpellcastingStep, { props: { draft } })
    // 戏法区块存在且计数为 0 / 3；准备法术计数为 0 / 2（wis 调整 +1、1 级）
    expect(wrapper.text()).toContain('戏法')
    expect(wrapper.text()).toContain('0 / 3')
    expect(wrapper.text()).toContain('0 / 2')
  })

  it('选择 3 个戏法与 2 个准备法术后计数与校验均通过', async () => {
    let draft = clericDraft(1)
    const wrapper = mount(SpellcastingStep, { props: { draft } })

    // 受控组件：每次点击后把 change 结果回写 draft 再渲染
    const buttons = wrapper.findAll('.expandable-option-card__main')
    const cantripButtons = buttons.slice(0, 3)
    const level1Buttons = buttons.filter((b) => b.text().includes('1环')).slice(0, 2)
    expect(level1Buttons.length).toBe(2)
    for (const button of [...cantripButtons, ...level1Buttons]) {
      await clickMain(wrapper, button)
      const changes = wrapper.emitted('change')
      const latest = changes?.[changes.length - 1]?.[0] as CharacterDraft['spellSelections']
      draft = { ...draft, spellSelections: latest }
      await wrapper.setProps({ draft })
    }

    expect(draft.spellSelections.cantripIds.length).toBe(3)
    expect(draft.spellSelections.preparedSpellIds.length).toBe(2)
    expect(validateSpellSelections(draft)).toBe(true)
    expect(wrapper.text()).toContain('3 / 3')
  })

  it('戏法已满（3/3）时再点击第 4 个候选不会增加选择', async () => {
    let draft = clericDraft(1)
    const wrapper = mount(SpellcastingStep, { props: { draft } })

    const buttons = wrapper.findAll('.expandable-option-card__main')
    const cantripButtons = buttons.slice(0, 3)
    for (const button of cantripButtons) {
      await clickMain(wrapper, button)
      const changes = wrapper.emitted('change')
      const latest = changes?.[changes.length - 1]?.[0] as CharacterDraft['spellSelections']
      draft = { ...draft, spellSelections: latest }
      await wrapper.setProps({ draft })
    }
    expect(draft.spellSelections.cantripIds.length).toBe(3)

    // 已满状态下点击第 4 个戏法候选（第 4 张卡片，1 环区块之前）不产生新选择
    const fullWrapper = wrapper
    const fourth = fullWrapper.findAll('.expandable-option-card')[3]
    expect(fourth.text()).toContain('已满')
    await clickMain(fullWrapper, fourth.find('.expandable-option-card__main'))
    const changes = fullWrapper.emitted('change')
    const latest = changes?.[changes.length - 1]?.[0] as CharacterDraft['spellSelections']
    expect(latest.cantripIds.length).toBe(3)
  })
})
