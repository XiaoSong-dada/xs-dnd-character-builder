import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import SpellcastingStep from '@/views/character-builder/components/SpellcastingStep.vue'
import type { CharacterDraft } from '@/types/character'

function ekDraft(targetLevel: number, subclassId?: string): CharacterDraft {
  return {
    schemaVersion: 3,
    id: 'ek-flow',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel,
    abilityMethod: 'standard-array',
    preferences: ['spellcasting'],
    classId: 'class-2014-fighter',
    subclassId,
    raceId: 'race-2014-human',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-acolyte',
    backgroundSkillIds: ['skill-insight', 'skill-religion'],
    backgroundToolIds: [],
    languages: ['language-elvish', 'language-dwarvish'],
    proficiencyReplacements: [],
    baseAbilities: { str: 15, dex: 10, con: 13, int: 16, wis: 12, cha: 8 },
    selections: [],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
    name: '奥法骑士流程回归',
    alignment: '',
    notes: '',
    currentStep: 'spells',
  }
}

describe('奥法骑士法术步骤（子职级施法）', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('3 级展示智力施法、戏法/已知法术选择与 1/3 法术位', () => {
    const draft = ekDraft(3, 'subclass-2014-fighter-eldritch-knight')
    const wrapper = mount(SpellcastingStep, { props: { draft } })

    const text = wrapper.text()
    expect(text).toContain('INT施法')
    expect(text).toContain('最高1环')
    expect(text).toContain('1环×2')
    // known 模式：戏法与掌握法术区块；无法术书、无准备。
    expect(text).toContain('戏法')
    expect(text).toContain('掌握法术')
    expect(text).not.toContain('法术书')
    expect(text).not.toContain('已准备')

    // 法师法术池可用：火焰箭（戏法）与魔法飞弹（1 环）出现在候选。
    const config = rulesRepository.getSpellcastingConfig(draft)
    expect(config).toBeDefined()
    expect(rulesRepository.getSpell('spell-2014-fire-bolt')?.classIds).toContain('class-2014-wizard')
  })

  it('未选子职的战士显示无需配置法术', () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: ekDraft(3) } })
    expect(wrapper.text()).toContain('当前职业无需配置法术')
  })

  it('1 级奥法骑士显示施法尚未开始（3 级起）', () => {
    const wrapper = mount(SpellcastingStep, { props: { draft: ekDraft(1, 'subclass-2014-fighter-eldritch-knight') } })
    expect(wrapper.text()).toContain('施法尚未开始')
    expect(wrapper.text()).toContain('奥法骑士从3级开始施法')
  })

  it('诡术师同样获得子职级施法配置', () => {
    const draft = ekDraft(3, 'subclass-2014-rogue-arcane-trickster')
    const wrapper = mount(SpellcastingStep, { props: { draft } })
    expect(wrapper.text()).toContain('INT施法')
    expect(rulesRepository.getSpellcastingConfig(draft)?.mode).toBe('known')
  })
})
