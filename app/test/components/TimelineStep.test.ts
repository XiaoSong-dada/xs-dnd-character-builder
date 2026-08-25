import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import TimelineStep from '@/views/character-builder/components/TimelineStep.vue'
import type { CharacterDraft } from '@/types/character'

function bardDraft(): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'timeline-test',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 3,
    abilityMethod: 'standard-array',
    preferences: [],
    classId: 'class-2014-bard',
    raceId: 'race-2014-half-elf',
    backgroundId: 'background-2014-entertainer',
    raceAbilityChoices: [],
    backgroundSkillIds: ['skill-acrobatics', 'skill-performance'],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
    selections: [
      { checkpointId: 'bard-2014-skills-1', optionIds: ['skill-insight', 'skill-history', 'skill-persuasion'], confirmedAt: '' },
      { checkpointId: 'bard-2014-tool-1', optionIds: ['tool-musical-instrument'], confirmedAt: '' },
    ],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    name: '测试',
    alignment: '',
    notes: '',
    currentStep: 'timeline',
  }
}

function mountStep(draft: CharacterDraft) {
  return mount(TimelineStep, {
    props: {
      classId: draft.classId ?? 'class-2014-bard',
      targetLevel: draft.targetLevel,
      backgroundSkillIds: draft.backgroundSkillIds,
      selections: draft.selections,
      draft,
    },
  })
}

function optionCard(wrapper: ReturnType<typeof mountStep>, name: string) {
  return wrapper.findAll('.option-card').find((card) => card.text().includes(name))
}

describe('TimelineStep 专精选择', () => {
  it('锁定未熟练的技能并显示提示，熟练技能与背景技能保持可选', () => {
    const wrapper = mountStep(bardDraft())

    // 欺瞒不在职业技能（洞悉/历史/游说）也不在背景技能（体操/表演）中
    const deception = optionCard(wrapper, '欺瞒')
    expect(deception?.attributes('disabled')).toBeDefined()
    expect(deception?.text()).toContain('需先获得该技能熟练')

    // 洞悉是1级职业技能，可专精
    const insight = optionCard(wrapper, '洞悉')
    expect(insight?.attributes('disabled')).toBeUndefined()

    // 体操是背景技能，可专精
    const acrobatics = optionCard(wrapper, '体操')
    expect(acrobatics?.attributes('disabled')).toBeUndefined()
  })

  it('点击未熟练技能不会触发选择事件', async () => {
    const wrapper = mountStep(bardDraft())

    const deception = optionCard(wrapper, '欺瞒')
    await deception?.trigger('click')

    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('点击已熟练技能可以加入专精选择', async () => {
    const wrapper = mountStep(bardDraft())

    const insight = optionCard(wrapper, '洞悉')
    await insight?.trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual(['bard-2014-expertise-3', ['skill-insight']])
  })

  it('已选中的未熟练技能可以点击取消', async () => {
    const d = bardDraft()
    d.selections.push({ checkpointId: 'bard-2014-expertise-3', optionIds: ['skill-deception'], confirmedAt: '' })
    const wrapper = mountStep(d)

    const deception = optionCard(wrapper, '欺瞒')
    await deception?.trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual(['bard-2014-expertise-3', []])
  })
})

describe('TimelineStep 超魔选择', () => {
  function sorcererDraft(targetLevel: number, selections: CharacterDraft['selections'] = []): CharacterDraft {
    const draft = bardDraft()
    return {
      ...draft,
      classId: 'class-2014-sorcerer',
      targetLevel,
      selections,
    }
  }

  const level3Selections = [
    { checkpointId: 'sorcerer-2014-skills-1', optionIds: ['skill-arcana', 'skill-persuasion'], confirmedAt: '' },
    { checkpointId: 'sorcerer-2014-subclass-1', optionIds: ['subclass-2014-sorcerer-draconic-bloodline'], confirmedAt: '' },
  ]

  it('3 级超魔检查点渲染超魔选项并可多选', async () => {
    const draft = sorcererDraft(3, level3Selections)
    const wrapper = mountStep(draft)

    const checkpoint = wrapper.text()
    expect(checkpoint).toContain('选择2项超魔法')
    expect(wrapper.text()).toContain('谨慎法术')
    expect(wrapper.text()).toContain('孪生法术')

    const careful = optionCard(wrapper, '谨慎法术')
    await careful?.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual(['sorcerer-2014-metamagic-3', ['metamagic-careful']])

    // 模拟父组件写入首次选择后，再次点击应追加（多选规格 max 2）
    // 注意：不可原地 push（level3Selections 是共享常量），改用不可变更新。
    draft.selections = [...draft.selections, { checkpointId: 'sorcerer-2014-metamagic-3', optionIds: ['metamagic-careful'], confirmedAt: '' }]
    await wrapper.setProps({ selections: draft.selections })

    const quickened = optionCard(wrapper, '迅捷法术')
    await quickened?.trigger('click')
    expect(wrapper.emitted('select')?.[1]).toEqual(['sorcerer-2014-metamagic-3', ['metamagic-careful', 'metamagic-quickened']])
  })

  it('10 级超魔检查点锁定已在 3 级掌握的选项并提示原因', async () => {
    const draft = sorcererDraft(10, [
      ...level3Selections,
      { checkpointId: 'sorcerer-2014-metamagic-3', optionIds: ['metamagic-careful', 'metamagic-quickened'], confirmedAt: '' },
      { checkpointId: 'sorcerer-2014-asi-4', optionIds: ['asi-cha-2'], confirmedAt: '' },
      { checkpointId: 'sorcerer-2014-asi-8', optionIds: ['asi-cha-2'], confirmedAt: '' },
    ])
    const wrapper = mountStep(draft)

    const careful = optionCard(wrapper, '谨慎法术')
    expect(careful?.attributes('disabled')).toBeDefined()
    expect(careful?.text()).toContain('已在较低等级掌握')

    const subtle = optionCard(wrapper, '隐蔽法术')
    await subtle?.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual(['sorcerer-2014-metamagic-10', ['metamagic-subtle']])
  })
})

describe('TimelineStep 魔法奥秘动态候选池', () => {
  function bard10Draft(): CharacterDraft {
    const draft = bardDraft()
    return {
      ...draft,
      targetLevel: 10,
      selections: [
        ...draft.selections,
        { checkpointId: 'bard-2014-expertise-3', optionIds: ['skill-insight', 'skill-history'], confirmedAt: '' },
        { checkpointId: 'bard-2014-subclass-3', optionIds: ['subclass-2014-bard-lore'], confirmedAt: '' },
        { checkpointId: 'bard-2014-asi-4', optionIds: ['asi-cha-2'], confirmedAt: '' },
        { checkpointId: 'bard-2014-asi-8', optionIds: ['asi-cha-2'], confirmedAt: '' },
        { checkpointId: 'bard-2014-expertise-10', optionIds: ['skill-insight', 'skill-history'], confirmedAt: '' },
      ],
    }
  }

  it('魔法奥秘检查点渲染全法术候选并按环级分组、支持搜索', async () => {
    const wrapper = mountStep(bard10Draft())

    expect(wrapper.text()).toContain('选择2个魔法奥秘法术')
    expect(wrapper.text()).toContain('环')
    // 候选不含戏法（魔法奥秘只选 1 环及以上，分组从 1 环开始）
    expect(wrapper.text()).not.toContain('0 环')
    expect(optionCard(wrapper, '火球术')).toBeDefined()

    const input = wrapper.find('input[type="search"]')
    await input.setValue('火球')
    expect(optionCard(wrapper, '火球术')).toBeDefined()
    expect(optionCard(wrapper, '魔法飞弹')).toBeUndefined()
  })

  it('点击候选法术可加入魔法奥秘选择', async () => {
    const wrapper = mountStep(bard10Draft())

    const fireball = optionCard(wrapper, '火球术')
    await fireball?.trigger('click')

    expect(wrapper.emitted('select')?.[0]).toEqual(['bard-2014-magical-secrets-10', ['spell-2014-fireball']])
  })
})
