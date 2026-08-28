import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineComponent, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import type { CharacterDraft, SpellSelections } from '@/types/character'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'

// 与 AddItemModal.test.ts 相同原因：fake timers 拦截动态 import()，
// 组件测试直接提供完整目录数据；加载器真实行为由 item-catalog-loader.test.ts 覆盖。
vi.mock('@/rules/item-catalog-loader', async () => {
  const { magicItemsCatalog2014 } = await import('@/rules/data/generated/magic-items-catalog-2014')
  return {
    loadItemCatalog: vi.fn(() => Promise.resolve(magicItemsCatalog2014)),
    resetItemCatalogCache: vi.fn(),
  }
})

const draft: CharacterDraft = {
  schemaVersion: 4,
  id: 'character-sheet-labels',
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
  inventory: [],
  currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  adventureGold: 0,
  equipmentNeedsReview: false,
  spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
  name: '测试角色',
  alignment: '',
  notes: '',
  currentStep: 'sheet',
}

describe('CharacterSheetStep', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('uses Chinese labels for abilities, saving throws, and skills', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
    })

    expect(wrapper.text()).toContain('力量')
    expect(wrapper.text()).not.toContain('STR')

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('体操')
    expect(wrapper.text()).toContain('驯兽')
    expect(wrapper.text()).toContain('奥秘')
    expect(wrapper.text()).not.toMatch(/\b(?:STR|DEX|CON|INT|WIS|CHA)\b/)
    expect(wrapper.text()).not.toContain('acrobatics')
    expect(wrapper.text()).not.toContain('animal-handling')
    expect(wrapper.text()).not.toContain('arcana')
  })

  it('shows subclass features in the features tab once a subclass is selected', async () => {
    const clericDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-cleric',
      subclassId: 'subclass-2014-cleric-life',
      targetLevel: 3,
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: clericDraft, derived: deriveCharacter(clericDraft) },
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('子职特性 · 生命领域')
    expect(wrapper.text()).toContain('领域法术')
    expect(wrapper.text()).toContain('生命引导者')
    expect(wrapper.text()).not.toContain('仅索引 · 未核验')
    expect(wrapper.text()).not.toContain('至高治疗')

    const text = wrapper.text()
    expect(text.indexOf('豁免')).toBeLessThan(text.indexOf('技能'))
    expect(text.indexOf('技能')).toBeLessThan(text.indexOf('子职特性'))
  })

  it('shows class features in the features tab filtered by current level', async () => {
    const fighterDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-fighter',
      targetLevel: 4,
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: fighterDraft, derived: deriveCharacter(fighterDraft) },
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    // 职业特性区块：当前等级（4）已解锁的特性展示，5 级及以后不展示
    expect(wrapper.text()).toContain('职业特性 · 战士')
    expect(wrapper.text()).toContain('回气')
    expect(wrapper.text()).toContain('动作如潮')
    expect(wrapper.text()).toContain('战斗风格')
    expect(wrapper.text()).toContain('需选择')
    expect(wrapper.text()).not.toContain('额外攻击')

    // 职业特性区块位于技能之后、子职特性之前
    const text = wrapper.text()
    expect(text.indexOf('技能')).toBeLessThan(text.indexOf('职业特性'))
    expect(text.indexOf('职业特性')).toBeLessThan(text.indexOf('尚未选择子职'))
  })

  it('shows an empty hint when the class has no registered features at the current level', async () => {
    const wizardDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-wizard',
      targetLevel: 1,
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: wizardDraft, derived: deriveCharacter(wizardDraft) },
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('职业特性 · 法师')
    expect(wrapper.text()).toContain('法术书')
    expect(wrapper.text()).toContain('奥术回想')
  })

  it('shows feats and ability improvements in the features tab', async () => {
    const fighterDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-fighter',
      targetLevel: 4,
      selections: [
        { checkpointId: 'fighter-2014-asi-4', optionIds: ['feat-lucky'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-6', optionIds: ['asi-int-2'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-str-dex'], confirmedAt: '' },
      ],
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: fighterDraft, derived: deriveCharacter(fighterDraft) },
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('专长与属性提升')
    expect(wrapper.text()).toContain('幸运 · Lucky')
    expect(wrapper.text()).toContain('属性提升（智力+2）')
    expect(wrapper.text()).toContain('属性提升（力量+1、敏捷+1）')
    // 幸运专长可展开查看 detail
    const luckyCard = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('幸运'))
    expect(luckyCard).toBeTruthy()
    await luckyCard!.find('.expandable-option-card__arrow').trigger('click')
    expect(luckyCard!.text()).toContain('幸运点')
  })

  it('shows an empty hint for feats and ability improvements when none are selected', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('尚未选择专长或属性提升')
  })

  it('shows an empty hint in the features tab when no subclass is selected', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('尚未选择子职')
  })

  it('shows the empty feature hint when the subclass has no features at the current level', async () => {
    const lowLevelDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-fighter',
      subclassId: 'subclass-2014-fighter-battle-master',
      targetLevel: 1,
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: lowLevelDraft, derived: deriveCharacter(lowLevelDraft) },
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('该子职在当前等级暂无已登记特性')
  })
})

describe('CharacterSheetStep 升级降级与重新编辑入口', () => {
  const completeSelections = [
    { checkpointId: 'fighter-2014-skills-1', optionIds: ['skill-athletics', 'skill-intimidation'], confirmedAt: '' },
    { checkpointId: 'fighter-2014-style-1', optionIds: ['style-dueling'], confirmedAt: '' },
    { checkpointId: 'fighter-2014-subclass-3', optionIds: ['subclass-2014-fighter-battle-master'], confirmedAt: '' },
    { checkpointId: 'subclass-feature-fighter-battle-master-combat-superiority', optionIds: ['maneuver-precision', 'maneuver-trip', 'maneuver-rally'], confirmedAt: '' },
    { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-str-2'], confirmedAt: '' },
  ]

  it('有职业时展示调整等级与重新编辑按钮并触发事件', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
    })

    await wrapper.get('.character-sheet__level-button').trigger('click')
    expect(wrapper.emitted('adjustLevel')).toEqual([[]])

    await wrapper.get('.character-sheet__export--secondary').trigger('click')
    expect(wrapper.emitted('reedit')).toEqual([[]])
  })

  it('存在未完成检查点或失效选择时显示待补全徽标', () => {
    const incomplete = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
    })
    expect(incomplete.text()).toContain('待补全')

    const invalidatedDraft: CharacterDraft = {
      ...draft,
      selections: completeSelections.map((selection) => selection.checkpointId === 'fighter-2014-asi-4'
        ? { ...selection, invalidatedAt: '2026-08-06T00:00:00.000Z', invalidatedReason: '目标等级调整' }
        : selection),
    }
    const invalidated = mount(CharacterSheetStep, {
      props: { draft: invalidatedDraft, derived: deriveCharacter(invalidatedDraft) },
    })
    expect(invalidated.text()).toContain('待补全')

    const complete = mount(CharacterSheetStep, {
      props: { draft: { ...draft, selections: completeSelections }, derived: deriveCharacter({ ...draft, selections: completeSelections }) },
    })
    expect(complete.text()).not.toContain('待补全')
  })
})

describe('CharacterSheetStep 头部按钮布局（编辑模式收纳）', () => {
  const editedDraft: CharacterDraft = {
    ...draft,
    manualEdits: {
      abilityAdjustments: { str: 2 },
      proficiencyBonusAdjustment: 0,
      derivedAdjustments: {},
      savingThrowAdjustments: {},
      skillAdjustments: {},
      spellSlotAdjustments: {},
      addedSpells: [],
    },
  }

  async function openEditMode(wrapper: ReturnType<typeof mount<typeof CharacterSheetStep>>): Promise<void> {
    const editButton = wrapper.findAll('.character-sheet__level-button').find((button) => button.text() === '编辑角色卡')
    expect(editButton).toBeDefined()
    await editButton!.trigger('click')
    await nextTick()
  }

  async function openMorePanel(wrapper: ReturnType<typeof mount<typeof CharacterSheetStep>>): Promise<void> {
    const moreButton = wrapper.findAll('.character-sheet__level-button').find((button) => button.text().startsWith('更多'))
    expect(moreButton).toBeDefined()
    await moreButton!.trigger('click')
    await nextTick()
  }

  it('编辑模式开启后头部收敛为调整等级/完成编辑/更多，不直接显示次要操作', async () => {
    const wrapper = mount(CharacterSheetStep, { props: { draft, derived: deriveCharacter(draft) } })
    expect(wrapper.text()).not.toContain('更多')
    await openEditMode(wrapper)
    expect(wrapper.text()).toContain('完成编辑')
    expect(wrapper.text()).toContain('更多')
    expect(wrapper.find('.character-sheet__more-panel').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('编辑角色形象')
    expect(wrapper.text()).not.toContain('恢复系统默认')
  })

  it('「更多」展开显示编辑角色形象；无人工编辑时不显示恢复系统默认', async () => {
    const wrapper = mount(CharacterSheetStep, { props: { draft, derived: deriveCharacter(draft) } })
    await openEditMode(wrapper)
    await openMorePanel(wrapper)
    expect(wrapper.find('.character-sheet__more-panel').exists()).toBe(true)
    expect(wrapper.text()).toContain('编辑角色形象')
    expect(wrapper.text()).not.toContain('恢复系统默认')
  })

  it('「更多」面板的编辑角色形象打开媒体编辑器弹窗并收起面板', async () => {
    const wrapper = mount(CharacterSheetStep, { props: { draft, derived: deriveCharacter(draft) } })
    await openEditMode(wrapper)
    await openMorePanel(wrapper)
    const mediaAction = wrapper.findAll('.character-sheet__more-action').find((button) => button.text() === '编辑角色形象')
    expect(mediaAction).toBeDefined()
    await mediaAction!.trigger('click')
    await nextTick()
    expect(document.body.textContent).toContain('编辑角色形象')
    expect(wrapper.find('.character-sheet__more-panel').exists()).toBe(false)
  })

  it('有人工编辑时「更多」面板显示恢复系统默认并可打开恢复确认弹窗', async () => {
    const wrapper = mount(CharacterSheetStep, { props: { draft: editedDraft, derived: deriveCharacter(editedDraft) } })
    await openEditMode(wrapper)
    await openMorePanel(wrapper)
    const resetAction = wrapper.findAll('.character-sheet__more-action').find((button) => button.text() === '恢复系统默认')
    expect(resetAction).toBeDefined()
    await resetAction!.trigger('click')
    await nextTick()
    expect(document.body.textContent).toContain('恢复系统默认')
    expect(wrapper.find('.character-sheet__more-panel').exists()).toBe(false)
  })

  it('面板外点击与 Esc 均可关闭「更多」面板', async () => {
    const wrapper = mount(CharacterSheetStep, { props: { draft, derived: deriveCharacter(draft) } })
    await openEditMode(wrapper)
    await openMorePanel(wrapper)
    expect(wrapper.find('.character-sheet__more-panel').exists()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(wrapper.find('.character-sheet__more-panel').exists()).toBe(false)

    await openMorePanel(wrapper)
    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('.character-sheet__more-panel').exists()).toBe(false)
  })
})

describe('CharacterSheetStep 法术展示', () => {
  const spellbookDraft: CharacterDraft = {
    ...draft,
    classId: 'class-2014-wizard',
    targetLevel: 3,
    spellSelections: {
      cantripIds: ['spell-2014-fire-bolt', 'spell-2014-mage-hand', 'spell-2014-ray-of-frost'],
      knownSpellIds: [],
      preparedSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
      spellbookSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield', 'spell-2014-burning-hands'],
      transcribedSpellIds: [],
    },
  }

  it('法师（spellbook）完整展示戏法、法术书与已准备法术', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: spellbookDraft, derived: deriveCharacter(spellbookDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    expect(wrapper.text()).toContain('火焰箭')
    expect(wrapper.text()).toContain('魔法飞弹')
    expect(wrapper.text()).toContain('护盾')
    expect(wrapper.text()).toContain('燃烧之手')
    expect(wrapper.text()).toContain('戏法 · 3 / 3')
    expect(wrapper.text()).toContain('已准备 · 2 / 2')
    expect(wrapper.text()).toContain('法术书 · 3 / 10')
    expect(wrapper.text()).toContain('1环 · 已选 2')

    const badges = wrapper.findAll('.character-sheet__spell-badge')
    expect(badges.filter((badge) => badge.text() === '已准备')).toHaveLength(2)
    expect(badges.filter((badge) => badge.text() === '在书中')).toHaveLength(3)
  })

  it('法术副标题仅为仪式法术追加仪式标签，并保持英文名', async () => {
    const ritualDraft: CharacterDraft = {
      ...spellbookDraft,
      spellSelections: {
        ...spellbookDraft.spellSelections,
        spellbookSpellIds: [...spellbookDraft.spellSelections.spellbookSpellIds, 'spell-2014-find-familiar'],
      },
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: ritualDraft, derived: deriveCharacter(ritualDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    expect(wrapper.text()).toContain('1环 · Find Familiar · 仪式')
    expect(wrapper.text()).toContain('1环 · Magic Missile')
    expect(wrapper.text()).not.toContain('Magic Missile · 仪式')
  })

  it('牧师（prepared）展示戏法与已准备法术，不出现法术书与已掌握', async () => {
    const preparedDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-cleric',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        cantripIds: ['spell-2014-guidance', 'spell-2014-sacred-flame'],
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-healing-word'],
      },
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: preparedDraft, derived: deriveCharacter(preparedDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    expect(wrapper.text()).toContain('指引术')
    expect(wrapper.text()).toContain('神圣之火')
    expect(wrapper.text()).toContain('祝福术')
    expect(wrapper.text()).toContain('治愈真言')
    expect(wrapper.text()).toContain('已准备')
    expect(wrapper.text()).toContain('未准备法术')
    expect(wrapper.text()).toContain('全部职业法术')
    expect(wrapper.text()).not.toContain('已掌握')
    expect(wrapper.text()).not.toContain('法术书')
    expect(wrapper.text()).not.toContain('在书中')
  })

  it('prepared 三块联动：取消准备移入未准备、准备移回已准备', async () => {
    const preparedDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-cleric',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        cantripIds: ['spell-2014-guidance', 'spell-2014-sacred-flame'],
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-healing-word'],
      },
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: preparedDraft, derived: deriveCharacter(preparedDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    const sections = wrapper.findAll('.character-sheet__spell-section')
    const preparedSection = sections.find((section) => section.find('h4').text().includes('已准备'))
    const unPreparedSection = sections.find((section) => section.find('h4').text().includes('未准备法术'))

    // 第一块：取消准备祝福术 → preparedSpellIds 移除
    const blessCard = preparedSection!.findAll('.expandable-option-card').find((card) => card.text().includes('祝福术'))
    const unprepareButton = blessCard!.findAll('button').find((button) => button.text().includes('取消准备'))
    await unprepareButton!.trigger('click')
    expect(wrapper.emitted('changeSpellSelections')?.[0]).toEqual([{
      ...preparedDraft.spellSelections,
      preparedSpellIds: ['spell-2014-healing-word'],
    }])

    // 第二块：未满时准备疗伤术 → preparedSpellIds 加入
    const cureCard = unPreparedSection!.findAll('.expandable-option-card').find((card) => card.text().includes('疗伤术'))
    const prepareButton = cureCard!.findAll('button').find((button) => button.text() === '准备')
    await prepareButton!.trigger('click')
    expect(wrapper.emitted('changeSpellSelections')?.[1]).toEqual([{
      ...preparedDraft.spellSelections,
      preparedSpellIds: ['spell-2014-bless', 'spell-2014-healing-word', 'spell-2014-cure-wounds'],
    }])
  })

  it('prepared 已满时第二块准备按钮禁用并显示已满', async () => {
    const fullDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-cleric',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-healing-word', 'spell-2014-cure-wounds', 'spell-2014-command'],
      },
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: fullDraft, derived: deriveCharacter(fullDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    const sections = wrapper.findAll('.character-sheet__spell-section')
    const unPreparedSection = sections.find((section) => section.find('h4').text().includes('未准备法术'))
    const prepareButtons = unPreparedSection!.findAll('button').filter((button) => button.text() === '准备' || button.text() === '已满')
    expect(prepareButtons.length).toBeGreaterThan(0)
    expect(prepareButtons[0]?.attributes('disabled')).toBeDefined()
    expect(unPreparedSection!.text()).toContain('已满')
  })

  it('术士（known）展示戏法与已掌握法术', async () => {
    const knownDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-sorcerer',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        cantripIds: ['spell-2014-fire-bolt', 'spell-2014-ray-of-frost'],
        knownSpellIds: ['spell-2014-charm-person', 'spell-2014-burning-hands'],
      },
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: knownDraft, derived: deriveCharacter(knownDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    expect(wrapper.text()).toContain('魅惑人类')
    expect(wrapper.text()).toContain('燃烧之手')
    expect(wrapper.text()).toContain('已掌握')
    expect(wrapper.text()).not.toContain('已准备')
    expect(wrapper.text()).not.toContain('法术书')
  })

  it('邪术师（pact）展示戏法与已掌握法术', async () => {
    const pactDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-warlock',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        cantripIds: ['spell-2014-eldritch-blast', 'spell-2014-mage-hand'],
        knownSpellIds: ['spell-2014-hex', 'spell-2014-armor-of-agathys'],
      },
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: pactDraft, derived: deriveCharacter(pactDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    expect(wrapper.text()).toContain('魔能爆')
    expect(wrapper.text()).toContain('妖火诅咒')
    expect(wrapper.text()).toContain('阿伽迪斯之铠')
    expect(wrapper.text()).toContain('已掌握')
    expect(wrapper.text()).not.toContain('已准备')
  })

  it('无施法能力的职业显示空状态提示', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    expect(wrapper.text()).toContain('当前没有需要展示的法术。')
  })

  it('点击三角形展开法术效果摘要，双击卡片也可展开且不触发准备切换', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: spellbookDraft, derived: deriveCharacter(spellbookDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    // 三角形展开：火焰箭（戏法）展开后可见其原创摘要（含"1d10"）
    const fireBoltCard = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('火焰箭'))
    expect(fireBoltCard).toBeTruthy()
    await fireBoltCard!.find('.expandable-option-card__arrow').trigger('click')
    expect(fireBoltCard!.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(fireBoltCard!.text()).toContain('1d10')

    // 双击主按钮展开魔法飞弹卡片，且不触发 changeSpellSelections
    const magicMissileCard = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('魔法飞弹'))
    const main = magicMissileCard!.find('.expandable-option-card__main')
    await main.trigger('click')
    await main.trigger('click')
    expect(magicMissileCard!.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(wrapper.emitted('changeSpellSelections')).toBeUndefined()
  })

  it('物品页签条目化并可展开装备详情（武器显示伤害摘要）', async () => {
    const itemDraft: CharacterDraft = {
      ...draft,
      inventory: [
        { id: 'inv-greatsword', itemId: 'greatsword', quantity: 1, equippedQuantity: 1, sourceKind: 'class' },
        { id: 'inv-torch', itemId: 'torch', quantity: 2, equippedQuantity: 0, sourceKind: 'class' },
      ],
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: itemDraft, derived: deriveCharacter(itemDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(5)').trigger('click')

    // 条目化：巨剑显示伤害摘要，火把在物品栏带 ×2
    const greatswordCard = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('巨剑'))
    expect(greatswordCard).toBeTruthy()
    expect(greatswordCard!.text()).toContain('2d6')
    expect(wrapper.text()).toContain('×2')

    // 展开巨剑卡片可见装备详情（挥砍伤害）
    await greatswordCard!.find('.expandable-option-card__arrow').trigger('click')
    expect(greatswordCard!.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(greatswordCard!.text()).toContain('装备详情')
    expect(greatswordCard!.text()).toContain('挥砍')
  })
})

describe('CharacterSheetStep 超魔与魔法奥秘展示', () => {
  it('术士能力页签展示超魔完成度与已选选项详情', async () => {
    const sorcererDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-sorcerer',
      targetLevel: 3,
      selections: [
        { checkpointId: 'sorcerer-2014-skills-1', optionIds: ['skill-arcana', 'skill-persuasion'], confirmedAt: '' },
        { checkpointId: 'sorcerer-2014-subclass-1', optionIds: ['subclass-2014-sorcerer-draconic-bloodline'], confirmedAt: '' },
        { checkpointId: 'sorcerer-2014-metamagic-3', optionIds: ['metamagic-careful', 'metamagic-quickened'], confirmedAt: '' },
      ],
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: sorcererDraft, derived: deriveCharacter(sorcererDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('超魔法')
    expect(wrapper.text()).toContain('已选择 2 项')
    expect(wrapper.text()).toContain('已选选项详情')
    expect(wrapper.text()).toContain('谨慎法术')
    expect(wrapper.text()).toContain('迅捷法术')
    expect(wrapper.text()).toContain('Careful Spell')
  })

  it('已选超魔卡片可展开查看英文名与效果摘要', async () => {
    const sorcererDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-sorcerer',
      targetLevel: 3,
      selections: [
        { checkpointId: 'sorcerer-2014-skills-1', optionIds: ['skill-arcana', 'skill-persuasion'], confirmedAt: '' },
        { checkpointId: 'sorcerer-2014-subclass-1', optionIds: ['subclass-2014-sorcerer-draconic-bloodline'], confirmedAt: '' },
        { checkpointId: 'sorcerer-2014-metamagic-3', optionIds: ['metamagic-careful'], confirmedAt: '' },
      ],
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: sorcererDraft, derived: deriveCharacter(sorcererDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    const card = wrapper.findAll('.expandable-option-card').find((item) => item.text().includes('谨慎法术'))
    expect(card?.text()).toContain('Careful Spell')
    await card!.find('.expandable-option-card__arrow').trigger('click')
    expect(card?.text()).toContain('豁免自动视为成功')
  })

  it('战士能力页签展示已选战技并可展开查看详情', async () => {
    const battleMasterDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-fighter',
      subclassId: 'subclass-2014-fighter-battle-master',
      targetLevel: 3,
      selections: [
        { checkpointId: 'fighter-2014-skills-1', optionIds: ['skill-acrobatics', 'skill-athletics'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-style-1', optionIds: ['style-dueling'], confirmedAt: '' },
        { checkpointId: 'fighter-2014-subclass-3', optionIds: ['subclass-2014-fighter-battle-master'], confirmedAt: '' },
        {
          checkpointId: 'subclass-feature-fighter-battle-master-combat-superiority',
          optionIds: ['maneuver-precision', 'maneuver-trip'],
          confirmedAt: '',
        },
      ],
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: battleMasterDraft, derived: deriveCharacter(battleMasterDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('已选选项详情')
    const card = wrapper.findAll('.expandable-option-card').find((item) => item.text().includes('精准攻击'))
    expect(card?.text()).toContain('Precision Attack')
    await card!.find('.expandable-option-card__arrow').trigger('click')
    expect(card?.text()).toContain('优势骰')
  })

  it('术士未完成超魔时能力页签提示需选择', async () => {
    const incomplete: CharacterDraft = {
      ...draft,
      classId: 'class-2014-sorcerer',
      targetLevel: 3,
      selections: [
        { checkpointId: 'sorcerer-2014-skills-1', optionIds: ['skill-arcana', 'skill-persuasion'], confirmedAt: '' },
        { checkpointId: 'sorcerer-2014-subclass-1', optionIds: ['subclass-2014-sorcerer-draconic-bloodline'], confirmedAt: '' },
      ],
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: incomplete, derived: deriveCharacter(incomplete) },
    })
    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    expect(wrapper.text()).toContain('需选择 0/2')
  })

  it('吟游诗人法术页签展示魔法奥秘法术并标记来源', async () => {
    const bardDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-bard',
      targetLevel: 10,
      selections: [
        { checkpointId: 'bard-2014-magical-secrets-10', optionIds: ['spell-2014-fireball', 'spell-2014-cure-wounds'], confirmedAt: '' },
      ],
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: bardDraft, derived: deriveCharacter(bardDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    expect(wrapper.text()).toContain('魔法奥秘 · 2')
    expect(wrapper.text()).toContain('火球术')
    expect(wrapper.text()).toContain('疗伤术')
  })
})

describe('CharacterSheetStep 候选池与点击交互', () => {
  const spellbookDraft: CharacterDraft = {
    ...draft,
    classId: 'class-2014-wizard',
    targetLevel: 3,
    spellSelections: {
      cantripIds: ['spell-2014-fire-bolt', 'spell-2014-mage-hand', 'spell-2014-ray-of-frost'],
      knownSpellIds: [],
      preparedSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
      spellbookSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield', 'spell-2014-burning-hands'],
      transcribedSpellIds: [],
    },
  }

  async function mountSheet(spellDraft: CharacterDraft) {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: spellDraft, derived: deriveCharacter(spellDraft) },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')
    return wrapper
  }

  function spellActionFor(wrapper: ReturnType<typeof mount>, spellName: string) {
    const card = wrapper.findAll('.expandable-option-card').find((item) => item.text().includes(spellName))
    return card?.find('button.character-sheet__spell-action')
  }

  it('牧师（prepared）展示可选法术区块，戏法不进入候选', async () => {
    const clericDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-cleric',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        cantripIds: ['spell-2014-guidance'],
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-healing-word'],
      },
    }
    const wrapper = await mountSheet(clericDraft)

    expect(wrapper.text()).toContain('未准备法术')
    expect(wrapper.text()).toContain('引导箭')
    expect(wrapper.text()).toMatch(/1环 · \d+ 个未准备/)
    // 已准备区块提供取消准备，未准备区块提供准备
    expect(wrapper.text()).toContain('取消准备')
    expect(wrapper.text()).toContain('准备')
  })

  it('法师（spellbook）展示未准备法术与未写入法术书区块', async () => {
    const wrapper = await mountSheet(spellbookDraft)

    expect(wrapper.text()).toContain('未准备法术')
    expect(wrapper.text()).toContain('未写入法术书')
  })

  it('点击候选项准备：emit changeSpellSelections 并加入 preparedSpellIds', async () => {
    const clericDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-cleric',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        preparedSpellIds: ['spell-2014-bless'],
      },
    }
    const wrapper = await mountSheet(clericDraft)
    const button = spellActionFor(wrapper, '引导箭')
    expect(button).toBeTruthy()
    await button!.trigger('click')

    const emitted = wrapper.emitted('changeSpellSelections')
    expect(emitted).toHaveLength(1)
    const value = emitted![0][0] as SpellSelections
    expect(value.preparedSpellIds).toContain('spell-2014-bless')
    expect(value.preparedSpellIds).toContain('spell-2014-guiding-bolt')
  })

  it('点击已准备项取消准备：emit 移除该法术', async () => {
    const clericDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-cleric',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-healing-word'],
      },
    }
    const wrapper = await mountSheet(clericDraft)
    const button = spellActionFor(wrapper, '祝福术')
    expect(button).toBeTruthy()
    await button!.trigger('click')

    const value = wrapper.emitted('changeSpellSelections')![0][0] as SpellSelections
    expect(value.preparedSpellIds).not.toContain('spell-2014-bless')
    expect(value.preparedSpellIds).toContain('spell-2014-healing-word')
  })

  it('准备已满时候选按钮禁用显示已满且点击不生效', async () => {
    // 法师 3 级准备上限 = max(1, 智力调整 -1 + 3) = 2，spellbookDraft 已准备 2 个。
    const wrapper = await mountSheet(spellbookDraft)

    expect(wrapper.text()).toContain('已满')
    const disabledButtons = wrapper.findAll('button.character-sheet__spell-action:disabled')
    expect(disabledButtons.length).toBeGreaterThan(0)
    await disabledButtons[0].trigger('click')
    expect(wrapper.emitted('changeSpellSelections')).toBeUndefined()
  })

  it('术士（known）与邪术师（pact）不出现候选区块', async () => {
    const sorcererDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-sorcerer',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        knownSpellIds: ['spell-2014-charm-person'],
      },
    }
    const sorcerer = await mountSheet(sorcererDraft)
    expect(sorcerer.text()).not.toContain('可选法术')
    expect(sorcerer.text()).not.toContain('候选准备')
    expect(sorcerer.text()).not.toContain('未写入法术书')
    expect(sorcerer.text()).not.toContain('取消准备')

    const warlockDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-warlock',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        knownSpellIds: ['spell-2014-hex'],
      },
    }
    const warlock = await mountSheet(warlockDraft)
    expect(warlock.text()).not.toContain('可选法术')
    expect(warlock.text()).not.toContain('候选准备')
    expect(warlock.text()).not.toContain('未写入法术书')
  })
})

describe('CharacterSheetStep 事件绑定契约', () => {
  it('index.vue 使用 @change-spell-selections 监听（kebab-case 与 defineEmits 的 changeSpellSelections 一致）', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/views/character-builder/index.vue'), 'utf-8')
    const sheetLine = source.split('\n').find((line) => line.includes('<CharacterSheetStep'))
    expect(sheetLine).toBeTruthy()
    expect(sheetLine).toContain('@change-spell-selections="updateSpells"')
    expect(sheetLine).not.toContain('@change-spells=')
  })

  it('点击取消准备经 @change-spell-selections 到达父组件', async () => {
    const Parent = defineComponent({
      components: { CharacterSheetStep },
      props: { draft: { type: Object, required: true } },
      emits: ['spells'],
      template: '<CharacterSheetStep :draft="draft" :derived="derived" @change-spell-selections="$emit(\'spells\', $event)" />',
      setup(props) {
        return { derived: deriveCharacter(props.draft as CharacterDraft) }
      },
    })
    const clericDraft: CharacterDraft = {
      ...draft,
      classId: 'class-2014-cleric',
      targetLevel: 3,
      spellSelections: {
        ...draft.spellSelections,
        preparedSpellIds: ['spell-2014-bless', 'spell-2014-healing-word'],
      },
    }
    const wrapper = mount(Parent, { props: { draft: clericDraft } })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    const blessCard = wrapper.findAll('.expandable-option-card').find((item) => item.text().includes('祝福术'))
    expect(blessCard).toBeTruthy()
    await blessCard!.find('button.character-sheet__spell-action').trigger('click')

    const value = wrapper.emitted('spells')![0][0] as SpellSelections
    expect(value.preparedSpellIds).not.toContain('spell-2014-bless')
    expect(value.preparedSpellIds).toContain('spell-2014-healing-word')
  })
})

describe('CharacterSheetStep 物品添加与金币调整', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  async function mountToItemsTab(patch: Partial<CharacterDraft> = {}): Promise<ReturnType<typeof mount>> {
    const itemDraft: CharacterDraft = { ...draft, ...patch }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: itemDraft, derived: deriveCharacter(itemDraft) },
      attachTo: document.body,
    })
    await wrapper.get('[role="tab"]:nth-child(5)').trigger('click')
    return wrapper
  }

  async function pickLibraryItem(name: string): Promise<void> {
    // 等待完整目录分块按需加载完成（动态 import 需多轮微任务；加载完成前不渲染列表）。
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(0)
    const search = document.body.querySelector<HTMLInputElement>('.ui-scroll-modal .add-item-modal__search input')
    if (!search) throw new Error('未找到添加物品弹窗搜索框')
    search.value = name
    search.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    const main = document.body.querySelector<HTMLElement>('.ui-scroll-modal .add-item-modal__result-area .expandable-option-card__main')
    if (!main) throw new Error(`未找到物品条目：${name}`)
    main!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await vi.advanceTimersByTimeAsync(300)
  }

  function bodyButton(text: string): HTMLButtonElement | undefined {
    return Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === text)
  }

  it('通过弹窗添加内置物品到物品栏并 emit changeInventory', async () => {
    const wrapper = await mountToItemsTab()
    await wrapper.get('.character-sheet__add-item').trigger('click')
    await pickLibraryItem('长剑')
    bodyButton('加入物品栏')!.click()

    const emitted = wrapper.emitted('changeInventory')
    expect(emitted).toHaveLength(1)
    const inventory = emitted![0][0] as readonly {
      itemId: string
      quantity: number
      sourceKind: string
      equippedQuantity: number
    }[]
    expect(inventory).toHaveLength(1)
    expect(inventory[0]).toMatchObject({
      itemId: 'longsword',
      quantity: 1,
      sourceKind: 'adventure',
      equippedQuantity: 0,
    })
  })

  it('重复添加同一物品合并数量（新增与装备都累加）', async () => {
    const wrapper = await mountToItemsTab({
      inventory: [{
        id: 'adventure:character-sheet-labels:longsword:1',
        itemId: 'longsword',
        quantity: 1,
        sourceKind: 'adventure',
        sourceId: 'adventure',
        equippedQuantity: 1,
      }],
    })
    await wrapper.get('.character-sheet__add-item').trigger('click')
    await pickLibraryItem('长剑')
    bodyButton('加入装备栏')!.click()

    const inventory = wrapper.emitted('changeInventory')![0][0] as readonly {
      quantity: number
      equippedQuantity: number
    }[]
    expect(inventory).toHaveLength(1)
    expect(inventory[0].quantity).toBe(2)
    expect(inventory[0].equippedQuantity).toBe(2)
  })

  it('自定义物品添加成功且不可装备', async () => {
    const wrapper = await mountToItemsTab()
    await wrapper.get('.character-sheet__add-item').trigger('click')
    const custom = document.body.querySelector<HTMLInputElement>('.add-item-modal__custom input')
    custom!.value = '治疗药水'
    custom!.dispatchEvent(new Event('focus'))
    custom!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    expect(bodyButton('加入装备栏')!.disabled).toBe(true)
    bodyButton('加入物品栏')!.click()

    const inventory = wrapper.emitted('changeInventory')![0][0] as readonly {
      itemId: string
      equippedQuantity: number
    }[]
    expect(inventory[0].itemId).toBe('治疗药水')
    expect(inventory[0].equippedQuantity).toBe(0)
  })

  it('金币面板支持添加（增量）与设置（持有总额），拒绝负数总额', async () => {
    const itemDraft: CharacterDraft = { ...draft, currency: { ...draft.currency, gp: 50 } }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: itemDraft, derived: deriveCharacter(itemDraft) },
      attachTo: document.body,
    })
    await wrapper.get('[role="tab"]:nth-child(5)').trigger('click')
    const input = wrapper.get('[aria-label="金币调整数值"]')
    const addButton = () => wrapper.findAll('.character-sheet__coin-actions button').find((button) => button.text() === '添加')!
    const setButton = () => wrapper.findAll('.character-sheet__coin-actions button').find((button) => button.text() === '设置')!
    // 模拟父组件把新冒险净增金币回写为 props（真实场景由 store.updateDraft 回传）。
    const syncProps = async (adventureGold: number) => {
      const next = { ...itemDraft, adventureGold }
      await wrapper.setProps({ draft: next })
    }

    // 添加增量：净增 +10（总额 60）。
    await input.setValue('10')
    await addButton().trigger('click')
    expect(wrapper.emitted('changeAdventureGold')![0][0]).toBe(10)
    await syncProps(10)

    // 负数增量 = 扣减：净增 5（总额 55）。
    await input.setValue('-5')
    await addButton().trigger('click')
    expect(wrapper.emitted('changeAdventureGold')![1][0]).toBe(5)
    await syncProps(5)

    // 设置持有总额 99：净增 = 99 - 起始金币 50 = 49。
    await input.setValue('99')
    await setButton().trigger('click')
    expect(wrapper.emitted('changeAdventureGold')![2][0]).toBe(49)
    await syncProps(49)

    // 总额为负被拒绝并提示（净增 -1000 → 总额 -950）。
    await input.setValue('-1000')
    await addButton().trigger('click')
    expect(wrapper.text()).toContain('金币不能为负')
    expect(wrapper.emitted('changeAdventureGold')).toHaveLength(3)

    // 非整数被拒绝。
    await input.setValue('1.5')
    await setButton().trigger('click')
    expect(wrapper.text()).toContain('请输入整数金币数')
    expect(wrapper.emitted('changeAdventureGold')).toHaveLength(3)
  })

  it('金币面板「减少」按钮按输入值扣减，可减到 0', async () => {
    const itemDraft: CharacterDraft = { ...draft, currency: { ...draft.currency, gp: 50 } }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: itemDraft, derived: deriveCharacter(itemDraft) },
      attachTo: document.body,
    })
    await wrapper.get('[role="tab"]:nth-child(5)').trigger('click')
    const input = wrapper.get('[aria-label="金币调整数值"]')
    const addButton = () => wrapper.findAll('.character-sheet__coin-actions button').find((button) => button.text() === '添加')!
    const decreaseButton = () => wrapper.findAll('.character-sheet__coin-actions button').find((button) => button.text() === '减少')!
    // 模拟父组件把新冒险净增金币回写为 props（真实场景由 store.updateDraft 回传）。
    const syncProps = async (adventureGold: number) => {
      const next = { ...itemDraft, adventureGold }
      await wrapper.setProps({ draft: next })
    }

    // 先添加净增 10（总额 60）。
    await input.setValue('10')
    await addButton().trigger('click')
    expect(wrapper.emitted('changeAdventureGold')![0][0]).toBe(10)
    await syncProps(10)

    // 「减少」5：净增 10 → 5（总额 55）。
    await input.setValue('5')
    await decreaseButton().trigger('click')
    expect(wrapper.emitted('changeAdventureGold')![1][0]).toBe(5)
    await syncProps(5)

    // 「减少」输入 0：不产生变化，正常完成不报错。
    await input.setValue('0')
    await decreaseButton().trigger('click')
    expect(wrapper.emitted('changeAdventureGold')![2][0]).toBe(5)
    await syncProps(5)

    // 「减少」5：净增 5 → 0（总额 = 起始金币 50），不报错。
    await input.setValue('5')
    await decreaseButton().trigger('click')
    expect(wrapper.emitted('changeAdventureGold')![3][0]).toBe(0)
    expect(wrapper.text()).not.toContain('金币不能为负')
  })

  it('金币面板「减少」按钮拒绝负数总额、非整数与空输入', async () => {
    const itemDraft: CharacterDraft = { ...draft, currency: { ...draft.currency, gp: 0 } }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: itemDraft, derived: deriveCharacter(itemDraft) },
      attachTo: document.body,
    })
    await wrapper.get('[role="tab"]:nth-child(5)').trigger('click')
    const input = wrapper.get('[aria-label="金币调整数值"]')
    const decreaseButton = () => wrapper.findAll('.character-sheet__coin-actions button').find((button) => button.text() === '减少')!
    const syncProps = async (adventureGold: number) => {
      const next = { ...itemDraft, adventureGold }
      await wrapper.setProps({ draft: next })
    }
    await syncProps(5) // 净增 5（总额 55）

    // 扣减超过净增 → 总额为负被拒并提示。
    await input.setValue('10')
    await decreaseButton().trigger('click')
    expect(wrapper.text()).toContain('金币不能为负')
    expect(wrapper.emitted('changeAdventureGold')).toBeUndefined()

    // 非整数被拒。
    await input.setValue('1.5')
    await decreaseButton().trigger('click')
    expect(wrapper.text()).toContain('请输入整数金币数')
    expect(wrapper.emitted('changeAdventureGold')).toBeUndefined()

    // 空输入被拒。
    await input.setValue('')
    await decreaseButton().trigger('click')
    expect(wrapper.text()).toContain('请输入整数金币数')
    expect(wrapper.emitted('changeAdventureGold')).toBeUndefined()
  })
})

describe('CharacterSheetStep 物品数量调整', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
  })
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  const adjustDraft: CharacterDraft = {
    ...draft,
    inventory: [
      { id: 'adventure:sheet:longsword:1', itemId: 'longsword', quantity: 3, sourceKind: 'adventure', sourceId: 'adventure', equippedQuantity: 2 },
      { id: 'class:fighter:chain-mail', itemId: 'chain-mail', quantity: 1, sourceKind: 'class', sourceId: 'class-2014-fighter', equippedQuantity: 1 },
    ],
  }

  async function mountToItemsTab(patch: Partial<CharacterDraft> = {}): Promise<ReturnType<typeof mount>> {
    const itemDraft: CharacterDraft = { ...adjustDraft, ...patch }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: itemDraft, derived: deriveCharacter(itemDraft) },
      attachTo: document.body,
    })
    await wrapper.get('[role="tab"]:nth-child(5)').trigger('click')
    return wrapper
  }

  function bodyButton(text: string): HTMLButtonElement | undefined {
    return Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === text)
  }

  /** 限定在弹层（.ui-modal）内查找按钮，避免与页面其他同名按钮（如金币面板「减少」）混淆。 */
  function modalButton(text: string): HTMLButtonElement | undefined {
    return Array.from(document.body.querySelectorAll<HTMLButtonElement>('.ui-modal button'))
      .find((button) => button.textContent?.trim() === text)
  }

  async function openAdjust(wrapper: ReturnType<typeof mount>, itemName: string): Promise<void> {
    const card = wrapper.findAll('.expandable-option-card').find((item) => item.text().includes(itemName))
    expect(card).toBeTruthy()
    await card!.find('button.character-sheet__spell-action').trigger('click')
  }

  function setCount(value: string): void {
    const input = document.body.querySelector<HTMLInputElement>('input[aria-label="调整数量数值"]')
    expect(input).toBeTruthy()
    input!.value = value
    input!.dispatchEvent(new Event('input'))
  }

  it('adventure 条目显示调整入口，起始装备条目只显示来源徽标', async () => {
    const wrapper = await mountToItemsTab()
    const longswordCards = wrapper.findAll('.expandable-option-card').filter((item) => item.text().includes('长剑'))
    expect(longswordCards.length).toBeGreaterThan(0)
    for (const card of longswordCards) {
      expect(card.find('button.character-sheet__spell-action').exists()).toBe(true)
    }

    const chainMailCards = wrapper.findAll('.expandable-option-card').filter((item) => item.text().includes('链甲'))
    expect(chainMailCards.length).toBeGreaterThan(0)
    for (const card of chainMailCards) {
      expect(card.find('button.character-sheet__spell-action').exists()).toBe(false)
      expect(card.text()).toContain('起始装备')
    }
    expect(longswordCards[0]!.text()).not.toContain('起始装备')
  })

  it('弹层「减少」emit changeInventory 且数量正确扣减、装备数量收缩', async () => {
    const wrapper = await mountToItemsTab()
    await openAdjust(wrapper, '长剑')
    setCount('2')
    await vi.advanceTimersByTimeAsync(0)
    modalButton('减少')!.click()

    const emitted = wrapper.emitted('changeInventory')
    expect(emitted).toHaveLength(1)
    const inventory = emitted![0][0] as readonly { itemId: string; quantity: number; equippedQuantity: number }[]
    const longsword = inventory.find((entry) => entry.itemId === 'longsword')
    expect(longsword?.quantity).toBe(1)
    expect(longsword?.equippedQuantity).toBe(1)
  })

  it('弹层「增加」emit 且数量追加、装备数量不变', async () => {
    const wrapper = await mountToItemsTab()
    await openAdjust(wrapper, '长剑')
    setCount('2')
    await vi.advanceTimersByTimeAsync(0)
    modalButton('增加')!.click()

    const inventory = wrapper.emitted('changeInventory')![0][0] as readonly { itemId: string; quantity: number; equippedQuantity: number }[]
    const longsword = inventory.find((entry) => entry.itemId === 'longsword')
    expect(longsword?.quantity).toBe(5)
    expect(longsword?.equippedQuantity).toBe(2)
  })

  it('「删除全部」先弹确认：取消不移除，确认后条目消失且不返还金币', async () => {
    const wrapper = await mountToItemsTab()
    await openAdjust(wrapper, '长剑')
    bodyButton('删除全部')!.click()
    await vi.advanceTimersByTimeAsync(0)

    // 确认视图出现，尚未 emit。
    expect(document.body.textContent).toContain('将移除 长剑')
    expect(document.body.textContent).toContain('不返还金币')
    expect(wrapper.emitted('changeInventory')).toBeUndefined()

    bodyButton('取消')!.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(wrapper.emitted('changeInventory')).toBeUndefined()
    expect(modalButton('减少')).toBeTruthy()

    bodyButton('删除全部')!.click()
    await vi.advanceTimersByTimeAsync(0)
    bodyButton('删除')!.click()
    const inventory = wrapper.emitted('changeInventory')![0][0] as readonly { itemId: string }[]
    expect(inventory.some((entry) => entry.itemId === 'longsword')).toBe(false)
    expect(inventory.some((entry) => entry.itemId === 'chain-mail')).toBe(true)
  })

  it('输入数量 ≥ 当前数量的扣减触发确认流程，确认后移除整条', async () => {
    const wrapper = await mountToItemsTab()
    await openAdjust(wrapper, '长剑')
    setCount('3')
    await vi.advanceTimersByTimeAsync(0)
    modalButton('减少')!.click()
    await vi.advanceTimersByTimeAsync(0)

    // 等价于删除整条：进入确认，不直接 emit。
    expect(document.body.textContent).toContain('将移除 长剑')
    expect(wrapper.emitted('changeInventory')).toBeUndefined()

    bodyButton('删除')!.click()
    const inventory = wrapper.emitted('changeInventory')![0][0] as readonly { itemId: string }[]
    expect(inventory.some((entry) => entry.itemId === 'longsword')).toBe(false)
  })

  it('数量输入小于 1 或非整数时操作按钮禁用', async () => {
    const wrapper = await mountToItemsTab()
    await openAdjust(wrapper, '长剑')
    setCount('0')
    await vi.advanceTimersByTimeAsync(0)
    expect(modalButton('减少')!.disabled).toBe(true)
    expect(modalButton('增加')!.disabled).toBe(true)
  })
})

describe('CharacterSheetStep 导出入口', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  async function openExportMenu(): Promise<void> {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
      attachTo: document.body,
    })
    await wrapper.get('.character-sheet__export').trigger('click')
    await nextTick()
    return wrapper
  }

  it('点击导出打开菜单，PDF/XLSX/JSON 三个格式选项齐全', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
      attachTo: document.body,
    })
    expect(document.body.textContent).not.toContain('导出 PDF 角色卡')

    await wrapper.get('.character-sheet__export').trigger('click')
    await nextTick()

    expect(document.body.textContent).toContain('导出 PDF 角色卡')
    expect(document.body.textContent).toContain('导出 XLSX 自动计算卡')
    expect(document.body.textContent).toContain('导出 JSON 数据文件')
    expect(document.body.textContent).toContain('导出完整角色包')
  })

  it('JSON 菜单项触发 export 事件，XLSX 菜单项触发 exportXlsx 事件', async () => {
    const wrapper = await openExportMenu()
    const items = Array.from(document.body.querySelectorAll('.character-sheet__export-menu-item'))
    expect(items).toHaveLength(4)

    ;(items[2] as HTMLButtonElement).click()
    await nextTick()
    expect(wrapper.emitted('export')).toEqual([[]])
    expect(wrapper.emitted('exportXlsx')).toBeUndefined()

    await wrapper.get('.character-sheet__export').trigger('click')
    await nextTick()
    const itemsAgain = Array.from(document.body.querySelectorAll('.character-sheet__export-menu-item'))
    ;(itemsAgain[1] as HTMLButtonElement).click()
    await nextTick()
    expect(wrapper.emitted('exportXlsx')).toEqual([[]])
  })

  it('完整角色包菜单项触发 exportPackage 事件', async () => {
    const wrapper = await openExportMenu()
    const items = Array.from(document.body.querySelectorAll('.character-sheet__export-menu-item'))
    ;(items[3] as HTMLButtonElement).click()
    await nextTick()
    expect(wrapper.emitted('exportPackage')).toEqual([[]])
  })

  it('PDF 菜单项触发 exportPdf 事件（模板填充下载）', async () => {
    const wrapper = await openExportMenu()
    const items = Array.from(document.body.querySelectorAll('.character-sheet__export-menu-item'))
    ;(items[0] as HTMLButtonElement).click()
    await nextTick()

    expect(wrapper.emitted('exportPdf')).toEqual([[]])
    expect(wrapper.emitted('exportXlsx')).toBeUndefined()
    expect(wrapper.emitted('export')).toBeUndefined()
  })

  it('导出期间禁用重复点击并展示中文诊断摘要', async () => {
    const wrapper = mount(CharacterSheetStep, {
      props: {
        draft,
        derived: deriveCharacter(draft),
        exportingFormat: 'pdf',
        exportNotice: { tone: 'warning', title: 'PDF 已导出，但有内容省略', message: '受影响类别：特性。' },
      },
      attachTo: document.body,
    })
    expect(wrapper.get('.character-sheet__export').attributes('disabled')).toBeDefined()
    await wrapper.setProps({ exportingFormat: undefined })
    await wrapper.get('.character-sheet__export').trigger('click')
    await nextTick()
    const buttons = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.character-sheet__export-menu-item'))
    expect(document.body.textContent).toContain('PDF 已导出，但有内容省略')
    await wrapper.setProps({ exportingFormat: 'pdf' })
    expect(buttons.every((button) => button.disabled)).toBe(true)
    expect(document.body.textContent).toContain('正在生成 PDF')
  })
})


describe('角色卡抄录法术书', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function makeWizardDraft(store: ReturnType<typeof useCharacterDraftsStore>): CharacterDraft {
    store.createDraft()
    store.updateDraft({
      name: '抄录法师',
      classId: 'class-2014-wizard',
      targetLevel: 3,
      adventureGold: 500,
      spellSelections: {
        cantripIds: ['spell-2014-fire-bolt', 'spell-2014-mage-hand', 'spell-2014-ray-of-frost'],
        knownSpellIds: [],
        preparedSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
        spellbookSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield', 'spell-2014-burning-hands'],
        transcribedSpellIds: [],
      },
    })
    return store.activeDraft as CharacterDraft
  }

  it('spellbook 模式显示「抄录法术」入口；prepared 模式不显示', async () => {
    const store = useCharacterDraftsStore()
    const wizard = makeWizardDraft(store)
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: wizard, derived: deriveCharacter(wizard) },
      attachTo: document.body,
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')
    expect(wrapper.text()).toContain('抄录法术')
    wrapper.unmount()

    const cleric = {
      ...wizard,
      id: 'cleric-no-transcribe',
      classId: 'class-2014-cleric',
      spellSelections: { ...wizard.spellSelections, spellbookSpellIds: [], transcribedSpellIds: [] },
    }
    const wrapper2 = mount(CharacterSheetStep, {
      props: { draft: cleric, derived: deriveCharacter(cleric) },
      attachTo: document.body,
    })
    await wrapper2.get('[role="tab"]:nth-child(4)').trigger('click')
    expect(wrapper2.text()).not.toContain('抄录法术')
    wrapper2.unmount()
  })

  it('打开抄录弹层：候选按环级分组、费用与余额预览正确', async () => {
    const store = useCharacterDraftsStore()
    const wizard = makeWizardDraft(store)
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: wizard, derived: deriveCharacter(wizard) },
      attachTo: document.body,
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')
    await wrapper.get('[aria-label="抄录法术书"]').trigger('click')

    expect(document.body.textContent).toContain('抄录法术书')
    expect(document.body.textContent).toContain('1环法术')
    expect(document.body.textContent).toContain('2环法术')
    expect(document.body.textContent).toContain('抄录 100 GP')
    expect(document.body.textContent).toContain('当前持有')
    expect(document.body.textContent).toContain('500 GP')
    wrapper.unmount()
  })

  it('确认抄录后法术入书、带「抄录」徽标并扣减金币', async () => {
    const store = useCharacterDraftsStore()
    const wizard = makeWizardDraft(store)
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: wizard, derived: deriveCharacter(wizard) },
      attachTo: document.body,
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')
    await wrapper.get('[aria-label="抄录法术书"]').trigger('click')

    // 选中 2 环法术灼热射线（费用 100 GP）；卡片主按钮带 250ms 双击判定，需等待
    const scorchingCard = Array.from(document.body.querySelectorAll('.spellbook-transcription .expandable-option-card'))
      .find((card) => card.textContent?.includes('灼热射线'))
    expect(scorchingCard).toBeTruthy()
    ;(scorchingCard!.querySelector('button[aria-pressed]') as HTMLButtonElement).click()
    await new Promise((resolve) => setTimeout(resolve, 300))
    expect(document.body.textContent).toContain('抄录（100 GP）')

    const confirm = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.includes('抄录（100 GP）'))
    confirm!.click()
    await nextTick()

    const updated = store.activeDraft as CharacterDraft
    expect(updated.spellSelections.spellbookSpellIds).toContain('spell-2014-scorching-ray')
    expect(updated.spellSelections.transcribedSpellIds).toEqual(['spell-2014-scorching-ray'])
    expect(updated.adventureGold).toBe(400)
    // 弹层关闭；同步最新草稿后法术书区出现「抄录」徽标
    expect(document.body.textContent).not.toContain('抄录法术书')
    await wrapper.setProps({ draft: store.activeDraft as CharacterDraft, derived: deriveCharacter(store.activeDraft as CharacterDraft) })
    await nextTick()
    const badges = wrapper.findAll('.character-sheet__spell-badge')
    expect(badges.some((badge) => badge.text() === '抄录')).toBe(true)
    wrapper.unmount()
  })

  it('金币不足时拒绝抄录并展示中文原因，不写入', async () => {
    const store = useCharacterDraftsStore()
    const wizard = makeWizardDraft(store)
    store.updateDraft({ adventureGold: 10 })
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: store.activeDraft as CharacterDraft, derived: deriveCharacter(store.activeDraft as CharacterDraft) },
      attachTo: document.body,
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')
    await wrapper.get('[aria-label="抄录法术书"]').trigger('click')

    const scorchingCard = Array.from(document.body.querySelectorAll('.spellbook-transcription .expandable-option-card'))
      .find((card) => card.textContent?.includes('灼热射线'))
    ;(scorchingCard!.querySelector('button[aria-pressed]') as HTMLButtonElement).click()
    await new Promise((resolve) => setTimeout(resolve, 300))
    const confirm = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.includes('抄录（100 GP）'))
    confirm!.click()
    await nextTick()

    expect(document.body.textContent).toContain('金币不足')
    const updated = store.activeDraft as CharacterDraft
    expect(updated.spellSelections.spellbookSpellIds).not.toContain('spell-2014-scorching-ray')
    expect(updated.adventureGold).toBe(10)
    wrapper.unmount()
  })
})
