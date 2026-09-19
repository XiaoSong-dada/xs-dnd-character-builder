import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import TimelineStep from '@/views/character-builder/components/TimelineStep.vue'
import type { CharacterDraft } from '@/types/character'
import { draft2024, selection } from '../fixtures/draft-2024'

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
    expect(careful?.text()).toContain('已在同一选项组的其他等级掌握')

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

describe('TimelineStep 2024 武器精通', () => {
  function fighter2024Draft(): CharacterDraft {
    return draft2024({
      targetLevel: 1,
      selections: [
        selection('class-2024-fighter-skills-1', ['skill-athletics', 'skill-perception']),
        selection('class-2024-fighter-style-1', ['feat-2024-archery']),
      ],
    })
  }

  function masteryCard(wrapper: ReturnType<typeof mountStep>, name: string) {
    return wrapper.findAll('.expandable-option-card__main').find((card) => card.text().includes(name))
  }

  it('显示武器名称、精通词条与按等级数量', () => {
    const wrapper = mountStep(fighter2024Draft())
    const mastery = wrapper.find('.timeline-step__mastery-candidates')
    expect(mastery.exists()).toBe(true)
    expect(mastery.text()).toContain('长剑')
    expect(mastery.text()).toContain('削弱')
    expect(mastery.text()).toContain('0/3')
  })

  it('点击武器写入精通选择', async () => {
    vi.useFakeTimers()
    const wrapper = mountStep(fighter2024Draft())
    masteryCard(wrapper, '长剑')?.trigger('click')
    await vi.advanceTimersByTimeAsync(300)
    vi.useRealTimers()
    const emitted = wrapper.emitted('select') ?? []
    expect(emitted.some(([checkpointId, optionIds]) =>
      checkpointId === 'class-2024-fighter-mastery-1' && (optionIds as readonly string[]).includes('equipment-2024-longsword'))).toBe(true)
  })
})

describe('TimelineStep 邪术师可展开卡片', () => {
  function warlockDraft(targetLevel: number, selections: CharacterDraft['selections'] = []): CharacterDraft {
    return { ...bardDraft(), classId: 'class-2014-warlock', targetLevel, selections }
  }

  function expandableCard(wrapper: ReturnType<typeof mountStep>, name: string) {
    return wrapper.findAll('.expandable-option-card').find((card) => card.text().includes(name))
  }

  const skillSelection = { checkpointId: 'warlock-2014-skills-1', optionIds: ['skill-arcana', 'skill-deception'], confirmedAt: '' }
  const patronSelection = { checkpointId: 'warlock-2014-subclass-1', optionIds: ['subclass-2014-warlock-fiend'], confirmedAt: '' }

  it('宗主选择使用可展开卡片，展开后显示详情与来源', async () => {
    const wrapper = mountStep(warlockDraft(1, [skillSelection]))
    const card = expandableCard(wrapper, '至高妖精')
    expect(card).toBeDefined()

    await card?.find('.expandable-option-card__arrow').trigger('click')

    const detail = wrapper.find('.timeline-step__option-detail')
    expect(detail.exists()).toBe(true)
    expect(detail.text()).toContain('妖精领主或女王')
    expect(detail.text()).toContain('来源：The Archfey · PHB')
  })

  it('魔能祈唤使用可展开卡片，展开后显示先决条件与来源', async () => {
    const wrapper = mountStep(warlockDraft(3, [skillSelection, patronSelection]))
    const card = expandableCard(wrapper, '苦痛魔爆')
    expect(card).toBeDefined()

    await card?.find('.expandable-option-card__arrow').trigger('click')

    const detail = wrapper.find('.timeline-step__option-detail')
    expect(detail.text()).toContain('先决条件：已习得法术 魔能爆')
    expect(detail.text()).toContain('来源：Agonizing Blast · PHB')
  })

  it('无先决的祈唤不渲染先决条件行', async () => {
    const wrapper = mountStep(warlockDraft(3, [skillSelection, patronSelection]))
    await expandableCard(wrapper, '魔鬼视界')?.find('.expandable-option-card__arrow').trigger('click')

    const detail = wrapper.find('.timeline-step__option-detail')
    expect(detail.text()).not.toContain('先决条件')
    expect(detail.text()).toContain("来源：Devil's Sight · PHB")
  })

  it('魔契恩泽四项均使用可展开卡片', () => {
    const wrapper = mountStep(warlockDraft(3, [
      skillSelection,
      patronSelection,
      { checkpointId: 'warlock-2014-invocations-2', optionIds: ['invocation-devils-sight', 'invocation-2014-armor-of-shadows'], confirmedAt: '' },
    ]))

    for (const name of ['链之魔契', '刃之魔契', '书之魔契', '符之魔契']) {
      expect(expandableCard(wrapper, name), name).toBeDefined()
    }
    expect(wrapper.findAll('.option-card').length).toBe(0)
  })
})
