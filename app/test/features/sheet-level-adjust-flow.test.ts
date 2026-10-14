import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace: vi.fn() }),
}))

// 与 CharacterSheetStep.test.ts 相同原因：fake timers 拦截动态 import()，
// 页面级测试直接提供完整目录数据。
vi.mock('@/rules/item-catalog-loader', async () => {
  const { magicItemsCatalog2014 } = await import('@/rules/data/generated/magic-items-catalog-2014')
  return {
    loadItemCatalog: vi.fn(() => Promise.resolve(magicItemsCatalog2014)),
    resetItemCatalogCache: vi.fn(),
  }
})

import CharacterBuilderPage from '@/views/character-builder/index.vue'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import type { CharacterDraft } from '@/types/character'

/**
 * 已完成的 4 级龙族血脉术士：1—4 级检查点与 4 级法术数量（戏法 4／已知 5）都已选齐。
 *
 * 回归背景（用户反馈）：在角色卡里「调整等级」升一级后，
 * ① 不直接进入需要处理的步骤，必须先点引导条；
 * ② 进入目标步骤后「调整等级」弹窗的遮罩仍留在 body 里，导致法术／检查点点不动。
 */
function completedSorcerer4(): CharacterDraft {
  return {
    schemaVersion: 10,
    id: 'sheet-level-adjust-sorcerer',
    ruleset: '5e-2014',
    createdAt: '',
    updatedAt: '',
    targetLevel: 4,
    abilityMethod: 'standard-array',
    preferences: [],
    classId: 'class-2014-sorcerer',
    subclassId: 'subclass-2014-sorcerer-draconic-bloodline',
    raceId: 'race-2014-half-orc',
    raceAbilityChoices: [],
    backgroundId: 'background-2014-soldier',
    backgroundSkillIds: [],
    backgroundToolIds: [],
    languages: [],
    proficiencyReplacements: [],
    baseAbilities: { str: 10, dex: 14, con: 13, int: 8, wis: 12, cha: 15 },
    selections: [
      { checkpointId: 'sorcerer-2014-skills-1', optionIds: ['skill-arcana', 'skill-persuasion'], confirmedAt: '' },
      { checkpointId: 'sorcerer-2014-subclass-1', optionIds: ['subclass-2014-sorcerer-draconic-bloodline'], confirmedAt: '' },
      { checkpointId: 'subclass-feature-sorcerer-draconic-bloodline-draconic-ancestry', optionIds: ['dragon-red'], confirmedAt: '' },
      { checkpointId: 'sorcerer-2014-metamagic-3', optionIds: ['metamagic-careful', 'metamagic-quickened'], confirmedAt: '' },
      { checkpointId: 'sorcerer-2014-asi-4', optionIds: ['asi-cha-2'], confirmedAt: '' },
    ],
    startingEquipmentSelections: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    adventureGold: 0,
    equipmentNeedsReview: false,
    spellSelections: {
      cantripIds: ['spell-2014-fire-bolt', 'spell-2014-acid-splash', 'spell-2014-chill-touch', 'spell-2014-blade-ward'],
      knownSpellIds: ['spell-2014-burning-hands', 'spell-2014-charm-person', 'spell-2014-color-spray', 'spell-2014-magic-missile', 'spell-2014-shield'],
      preparedSpellIds: [],
      spellbookSpellIds: [],
      transcribedSpellIds: [],
    },
    name: '页面流程术士',
    alignment: '',
    notes: '',
    currentStep: 'sheet',
  }
}

function bodyButton(label: string): DOMWrapper<Element> {
  const button = Array.from(document.body.querySelectorAll('button')).find((item) => item.textContent === label)
  if (!button) throw new Error(`未找到按钮：${label}`)
  return new DOMWrapper(button)
}

describe('角色卡「调整等级」后的流程（D37／D44）', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
    setActivePinia(createPinia())
  })

  afterEach(() => { vi.useRealTimers() })

  it('升级确认后直接进入需要处理的步骤，且不再留下遮罩挡住该步骤', async () => {
    const store = useCharacterDraftsStore()
    store.drafts.push(completedSorcerer4())
    store.activateDraft('sheet-level-adjust-sorcerer')

    const wrapper = mount(CharacterBuilderPage, { global: { stubs: { teleport: false } } })
    await flushPromises()
    expect(store.activeDraft?.currentStep).toBe('sheet')

    // 角色卡 →「调整等级」→ 等级卡 ＋1（弹窗内容 Teleport 到 body）
    await wrapper.get('.character-sheet__level-button').trigger('click')
    await flushPromises()
    const plus = document.body.querySelectorAll('.allocation__stepper--total button')[1]
    expect(plus).toBeTruthy()
    await new DOMWrapper(plus!).trigger('click')
    await flushPromises()
    expect(store.activeDraft?.targetLevel).toBe(4)

    // 确认弹窗 →「确认调整」
    await bodyButton('确认调整').trigger('click')
    await flushPromises()

    // ① 等级已生效，并**直接**落在法术步骤（不需要再点引导条）
    expect(store.activeDraft?.targetLevel).toBe(5)
    expect(store.activeDraft?.currentStep).toBe('spells')
    // ② 「调整等级」弹窗随步骤切换关闭：body 里不再有弹窗遮罩
    expect(document.body.querySelectorAll('.ui-modal, .ui-scroll-modal')).toHaveLength(0)

    // ③ 目标步骤可交互：点一个法术候选会写入草稿（点击没有被遮罩吞掉）
    vi.useFakeTimers()
    const before = store.activeDraft!.spellSelections.cantripIds.length
    const card = wrapper.get('.spellcasting-step .expandable-option-card__main')
    await card.trigger('click')
    vi.advanceTimersByTime(300)
    await flushPromises()
    expect(store.activeDraft!.spellSelections.cantripIds.length).not.toBe(before)
  })

  it('降级确认后留在角色卡（只出复查引导条，不跳转）', async () => {
    const draft = completedSorcerer4()
    const store = useCharacterDraftsStore()
    store.drafts.push({ ...draft, targetLevel: 5 })
    store.activateDraft('sheet-level-adjust-sorcerer')

    const wrapper = mount(CharacterBuilderPage, { global: { stubs: { teleport: false } } })
    await flushPromises()

    await wrapper.get('.character-sheet__level-button').trigger('click')
    await flushPromises()
    const minus = document.body.querySelectorAll('.allocation__stepper--total button')[0]
    await new DOMWrapper(minus!).trigger('click')
    await flushPromises()
    await bodyButton('确认调整').trigger('click')
    await flushPromises()

    expect(store.activeDraft?.targetLevel).toBe(4)
    expect(store.activeDraft?.currentStep).toBe('sheet')
  })
})
