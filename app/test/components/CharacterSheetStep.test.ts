import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineComponent } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import type { CharacterDraft, SpellSelections } from '@/types/character'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'

const draft: CharacterDraft = {
  schemaVersion: 3,
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
  equipmentNeedsReview: false,
  spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [] },
  name: '测试角色',
  alignment: '',
  notes: '',
  currentStep: 'sheet',
}

describe('CharacterSheetStep', () => {
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
    expect(wrapper.text()).toContain('仅索引 · 未核验')
    expect(wrapper.text()).not.toContain('至高治疗')

    const text = wrapper.text()
    expect(text.indexOf('豁免')).toBeLessThan(text.indexOf('技能'))
    expect(text.indexOf('技能')).toBeLessThan(text.indexOf('子职特性'))
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
    { checkpointId: 'fighter-2014-maneuvers-3', optionIds: ['maneuver-precision', 'maneuver-trip', 'maneuver-rally'], confirmedAt: '' },
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
    expect(wrapper.text()).not.toContain('已掌握')
    expect(wrapper.text()).not.toContain('法术书')
    expect(wrapper.text()).not.toContain('在书中')
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

    expect(wrapper.text()).toContain('可选法术')
    expect(wrapper.text()).toContain('引导箭')
    expect(wrapper.text()).toMatch(/1环 · \d+ 个可准备/)
    // 已准备区块提供取消准备，候选区块提供准备
    expect(wrapper.text()).toContain('取消准备')
    expect(wrapper.text()).toContain('准备')
  })

  it('法师（spellbook）展示候选准备与未写入法术书区块', async () => {
    const wrapper = await mountSheet(spellbookDraft)

    expect(wrapper.text()).toContain('候选准备')
    expect(wrapper.text()).toContain('未写入法术书')
    expect(wrapper.text()).toContain('长休可从法术书换入')
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
    const search = document.body.querySelector<HTMLInputElement>('.add-item-modal__search input')
    search!.value = name
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    const main = document.body.querySelector<HTMLElement>('.add-item-modal__list .expandable-option-card__main')
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

  it('金币面板支持添加（增量）与设置（覆盖），拒绝负数结果', async () => {
    const itemDraft: CharacterDraft = { ...draft }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft: itemDraft, derived: deriveCharacter(itemDraft) },
      attachTo: document.body,
    })
    await wrapper.get('[role="tab"]:nth-child(5)').trigger('click')
    const input = wrapper.get('[aria-label="金币调整数值"]')
    const addButton = () => wrapper.findAll('.character-sheet__coin-actions button').find((button) => button.text() === '添加')!
    const setButton = () => wrapper.findAll('.character-sheet__coin-actions button').find((button) => button.text() === '设置')!
    // 模拟父组件把新金币回写为 props（真实场景由 store.updateDraft 回传）。
    const syncProps = async (gp: number) => {
      const next = { ...itemDraft, currency: { ...itemDraft.currency, gp } }
      await wrapper.setProps({ draft: next })
    }

    await input.setValue('10')
    await addButton().trigger('click')
    expect((wrapper.emitted('changeCurrency')![0][0] as { gp: number }).gp).toBe(10)
    await syncProps(10)

    // 负数增量 = 扣减。
    await input.setValue('-5')
    await addButton().trigger('click')
    expect((wrapper.emitted('changeCurrency')![1][0] as { gp: number }).gp).toBe(5)
    await syncProps(5)

    // 设置覆盖。
    await input.setValue('99')
    await setButton().trigger('click')
    expect((wrapper.emitted('changeCurrency')![2][0] as { gp: number }).gp).toBe(99)
    await syncProps(99)

    // 结果为负被拒绝并提示。
    await input.setValue('-1000')
    await addButton().trigger('click')
    expect(wrapper.text()).toContain('金币不能为负')
    expect(wrapper.emitted('changeCurrency')).toHaveLength(3)

    // 非整数被拒绝。
    await input.setValue('1.5')
    await setButton().trigger('click')
    expect(wrapper.text()).toContain('请输入整数金币数')
    expect(wrapper.emitted('changeCurrency')).toHaveLength(3)
  })
})

