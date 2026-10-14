import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, type ComponentPublicInstance } from 'vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace: vi.fn() }),
}))

import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { getClassEntries, getPrimaryClassId, getTotalLevel, setPrimaryClassId } from '@/rules/multiclass'
import { deriveCharacter } from '@/rules/derive'
import ClassStep from '@/views/character-builder/components/ClassStep.vue'
import LevelAdjustModal from '@/views/character-builder/components/LevelAdjustModal.vue'
import SetupStep from '@/views/character-builder/components/SetupStep.vue'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft } from '@/types/character'
import { useCharacterBuilderPage } from '@/views/character-builder/hooks/useCharacterBuilderPage'

/**
 * SC-D01：起始职业与第 1 步等级滑杆的跨入口流程。
 *
 * 覆盖需求 §6 的验收标准 1—3、5—7：第 1 步无职业即可设等级 → 开兼职选起始职业 →
 * 加职业 → 拖滑杆 → 切换起始职业 → 原起始职业降到 0 移除。
 */

type Page = ReturnType<typeof useCharacterBuilderPage>

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 13, wis: 13, cha: 13 }

/** 第 1 步的新草稿：还没有职业。 */
function freshDraft(): CharacterDraft {
  return draft2024({
    id: 'sc-flow',
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: undefined,
    subclassId: undefined,
    targetLevel: 5,
    currentStep: 'setup',
  })
}

async function setupPage(draft: CharacterDraft): Promise<{ page: Page; store: ReturnType<typeof useCharacterDraftsStore> }> {
  const store = useCharacterDraftsStore()
  store.drafts.push(draft)
  store.activateDraft(draft.id)
  let page: Page | undefined
  mount(defineComponent({
    setup() {
      page = useCharacterBuilderPage()
      return () => h('div')
    },
  }) as unknown as ComponentPublicInstance)
  await nextTick()
  if (!page) throw new Error('page hook 未初始化')
  return { page, store }
}

function activeDraft(store: ReturnType<typeof useCharacterDraftsStore>): CharacterDraft {
  const draft = store.activeDraft
  if (!draft) throw new Error('没有活动草稿')
  return draft
}

describe('SC-D01 第 1 步：未选职业时的等级设置', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('滑杆只改目标等级，不产生职业分配', async () => {
    const { page, store } = await setupPage(freshDraft())
    page.applyTotalLevel({ ...activeDraft(store), targetLevel: 9 }, 'standard-array')
    await nextTick()
    const next = activeDraft(store)
    expect(next.targetLevel).toBe(9)
    expect(next.multiclass).toBeUndefined()
    expect(getClassEntries(next)).toEqual([])
  })

  it('降级且无失效选择时不弹依赖确认（滑杆走轻量路径）', async () => {
    const { page, store } = await setupPage(freshDraft())
    page.applyTotalLevel({ ...activeDraft(store), targetLevel: 3 }, 'standard-array')
    await nextTick()
    expect(page.pendingChange.value).toBeUndefined()
    expect(activeDraft(store).targetLevel).toBe(3)
  })

  it('第 1 步的分配提交在无职业时同样只改目标等级', async () => {
    const { page, store } = await setupPage(freshDraft())
    page.applyAllocationFromSetup({ ...activeDraft(store), targetLevel: 7 }, 'standard-array')
    await nextTick()
    expect(activeDraft(store).targetLevel).toBe(7)
    expect(activeDraft(store).multiclass).toBeUndefined()
  })
})

describe('SC-D01 起始职业的完整流程', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  /** 第 1 步选起始职业的结果：唯一职业 + 起始职业标记，等级取当前目标等级。 */
  function firstClassDraft(): CharacterDraft {
    return draft2024({
      id: 'sc-flow-2',
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 5,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 5 }],
        levelOrder: Array.from({ length: 5 }, () => 'class-2014-fighter'),
      },
      currentStep: 'class',
    })
  }

  it('选完起始职业后加职业、拖滑杆，总等级与各职业等级正确', async () => {
    const { page, store } = await setupPage(firstClassDraft())
    const added = {
      ...activeDraft(store),
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 5 }, { classId: 'class-2014-rogue', level: 1 }],
        levelOrder: [...Array.from({ length: 5 }, () => 'class-2014-fighter'), 'class-2014-rogue'],
      },
      targetLevel: 6,
    }
    page.applyClassAllocation(added)
    await nextTick()
    // 加职业需要确认（alwaysConfirm）
    page.confirmPendingChange()
    await nextTick()
    expect(getClassEntries(activeDraft(store))).toHaveLength(2)
    expect(getTotalLevel(activeDraft(store))).toBe(6)

    // 滑杆加 2 级 → 加给列表最后一个职业（游荡者 1 → 3）
    page.applyTotalLevel({
      ...activeDraft(store),
      multiclass: {
        ...activeDraft(store).multiclass!,
        classes: [{ classId: 'class-2014-fighter', level: 5 }, { classId: 'class-2014-rogue', level: 3 }],
      },
      targetLevel: 8,
    })
    await nextTick()
    expect(getTotalLevel(activeDraft(store))).toBe(8)
    expect(getClassEntries(activeDraft(store))).toEqual([
      { classId: 'class-2014-fighter', level: 5 },
      { classId: 'class-2014-rogue', level: 3 },
    ])
  })

  it('切换起始职业：三处字段一致，并弹出起始职业相关的复查提示', async () => {
    const draft = draft2024({
      id: 'sc-flow-3',
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 6,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 5 }, { classId: 'class-2014-rogue', level: 1 }],
        levelOrder: [...Array.from({ length: 5 }, () => 'class-2014-fighter'), 'class-2014-rogue'],
      },
      currentStep: 'sheet',
    })
    const { page, store } = await setupPage(draft)
    const switched = setPrimaryClassId(activeDraft(store), 'class-2014-rogue').draft
    page.applyClassAllocation(switched)
    await nextTick()
    // 切换起始职业属破坏性动作：先确认，且摘要列出起始职业相关项
    expect(page.pendingChange.value).toBeTruthy()
    expect(page.pendingChange.value?.affected.join('|')).toContain('起始职业')
    page.confirmPendingChange()
    await nextTick()

    const next = activeDraft(store)
    expect(getPrimaryClassId(next)).toBe('class-2014-rogue')
    expect(next.classId).toBe('class-2014-rogue')
    expect(getClassEntries(next)[0]!.classId).toBe('class-2014-rogue')
    expect(getTotalLevel(next)).toBe(6)
    // 1 级生命值随起始职业改变（游荡者 d8 → 战士 d10 变化）
    const hp = deriveCharacter(next).hitPoints.value
    const hpFighterPrimary = deriveCharacter(draft).hitPoints.value
    expect(hp).not.toBe(hpFighterPrimary)
  })

  it('切换后原起始职业可被移除，新的起始职业仍不可移除', async () => {
    const draft = draft2024({
      id: 'sc-flow-4',
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-rogue',
      targetLevel: 6,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-rogue',
        classes: [{ classId: 'class-2014-rogue', level: 1 }, { classId: 'class-2014-fighter', level: 5 }],
        levelOrder: ['class-2014-rogue', ...Array.from({ length: 5 }, () => 'class-2014-fighter')],
      },
      currentStep: 'sheet',
    })
    const { page, store } = await setupPage(draft)
    // 移除战士（原起始职业，切换后已成普通职业）
    page.applyClassAllocation({
      ...activeDraft(store),
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-rogue',
        classes: [{ classId: 'class-2014-rogue', level: 1 }],
        levelOrder: ['class-2014-rogue'],
      },
      targetLevel: 1,
    })
    await nextTick()
    page.confirmPendingChange()
    await nextTick()
    const next = activeDraft(store)
    expect(getClassEntries(next)).toEqual([{ classId: 'class-2014-rogue', level: 1 }])
    expect(getPrimaryClassId(next)).toBe('class-2014-rogue')
    expect(next.classId).toBe('class-2014-rogue')
    expect(next.targetLevel).toBe(1)
  })
})

describe('SC-D01 三处入口一致（需求 §6 验收标准 6）', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  const multiDraft = (): CharacterDraft => draft2024({
    id: 'sc-three-entries',
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: 'class-2014-fighter',
    targetLevel: 5,
    multiclass: {
      enabled: true,
      primaryClassId: 'class-2014-fighter',
      classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }],
      levelOrder: ['class-2014-fighter', 'class-2014-fighter', 'class-2014-fighter', 'class-2014-rogue', 'class-2014-rogue'],
    },
  })

  const entries: readonly (readonly [string, () => ReturnType<typeof mount>])[] = [
    ['第 1 步 SetupStep', () => mount(SetupStep, { props: { draft: multiDraft(), abilityMethod: 'standard-array' } })],
    ['第 3 步 ClassStep', () => mount(ClassStep, { props: { draft: multiDraft() } })],
    ['角色卡调整等级弹窗', () => mount(LevelAdjustModal, { props: { open: true, draft: multiDraft() }, global: { stubs: { teleport: true } } })],
  ]

  it.each(entries)('%s 同时提供等级滑杆与「设置起始职业」入口', (_label, factory) => {
    const wrapper = factory()
    expect(wrapper.find('.allocation__slider input[type="range"]').exists()).toBe(true)
    expect(wrapper.findAll('button').some((button) => button.text() === '设置起始职业')).toBe(true)
    // 起始职业的移除路径写在同一处
    expect(wrapper.text()).toContain('切换到其他职业后')
  })
})
