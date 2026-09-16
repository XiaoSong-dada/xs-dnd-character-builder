import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, type ComponentPublicInstance } from 'vue'

const routerReplace = vi.fn()
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ replace: routerReplace }),
}))

import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { RulesetPreferenceService } from '@/services/ruleset-preference'
import { rulesRepository } from '@/rules/repository'
import type { CharacterDraft } from '@/types/character'
import { useCharacterBuilderPage } from '@/views/character-builder/hooks/useCharacterBuilderPage'

type Page = ReturnType<typeof useCharacterBuilderPage>

function makeFighterDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return {
    schemaVersion: 4,
    id: 'test-fighter',
    ruleset: '5e-2014',
    createdAt: '2026-08-06T00:00:00.000Z',
    updatedAt: '2026-08-06T00:00:00.000Z',
    targetLevel: 5,
    abilityMethod: 'standard-array',
    preferences: [],
    classId: 'class-2014-fighter',
    subclassId: 'subclass-2014-fighter-battle-master',
    raceId: 'race-2014-half-orc',
    raceAbilityChoices: [],
    backgroundSkillIds: [],
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
    name: '测试战士',
    alignment: '',
    notes: '',
    currentStep: 'sheet',
    ...overrides,
  }
}

/** 5 级战斗大师战士已完成 1—5 级全部时间线检查点的选择。 */
const level5Selections = [
  { checkpointId: 'fighter-2014-skills-1', optionIds: ['skill-acrobatics', 'skill-athletics'], confirmedAt: '' },
  { checkpointId: 'fighter-2014-style-1', optionIds: ['style-dueling'], confirmedAt: '' },
  { checkpointId: 'fighter-2014-subclass-3', optionIds: ['subclass-2014-fighter-battle-master'], confirmedAt: '' },
  { checkpointId: 'subclass-feature-fighter-battle-master-combat-superiority', optionIds: ['maneuver-precision', 'maneuver-trip', 'maneuver-rally'], confirmedAt: '' },
  { checkpointId: 'fighter-2014-asi-4', optionIds: ['asi-str-2'], confirmedAt: '' },
]

/** 10 级战斗大师战士在 5 级基础上补全 6/7/8/10 级检查点。 */
const level10Selections = [
  ...level5Selections,
  { checkpointId: 'fighter-2014-asi-6', optionIds: ['asi-con-2'], confirmedAt: '' },
  { checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-7', optionIds: ['maneuver-riposte', 'maneuver-menacing'], confirmedAt: '' },
  { checkpointId: 'fighter-2014-asi-8', optionIds: ['asi-dex-2'], confirmedAt: '' },
  { checkpointId: 'subclass-feature-fighter-battle-master-extra-maneuvers-10', optionIds: ['maneuver-pushing', 'maneuver-disarming'], confirmedAt: '' },
]

/** 从规则库取术士指定环级的法术 ID（测试使用真实注册表数据）。 */
function sorcererSpellIds(levels: readonly number[]): readonly string[] {
  const config = rulesRepository.getSpellcastingConfig({ classId: 'class-2014-sorcerer', subclassId: undefined })
  return (config?.classSpellIds ?? [])
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(spell && levels.includes(spell.level)))
    .map((spell) => spell.id)
}

/** 4 级术士：已完成 1 级技能/子职、3 级超魔与 4 级属性提升，法术选择满足 4 级需求（4 戏法 + 5 已知）。 */
function makeSorcererDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return makeFighterDraft({
    id: 'test-sorcerer',
    classId: 'class-2014-sorcerer',
    subclassId: undefined,
    targetLevel: 4,
    baseAbilities: { str: 10, dex: 14, con: 13, int: 8, wis: 12, cha: 15 },
    selections: [
      { checkpointId: 'sorcerer-2014-skills-1', optionIds: ['skill-arcana', 'skill-persuasion'], confirmedAt: '' },
      { checkpointId: 'sorcerer-2014-subclass-1', optionIds: ['subclass-2014-sorcerer-draconic-bloodline'], confirmedAt: '' },
      { checkpointId: 'sorcerer-2014-metamagic-3', optionIds: ['metamagic-careful', 'metamagic-quickened'], confirmedAt: '' },
      { checkpointId: 'sorcerer-2014-asi-4', optionIds: ['asi-cha-2'], confirmedAt: '' },
    ],
    spellSelections: {
      cantripIds: sorcererSpellIds([0]).slice(0, 4),
      knownSpellIds: sorcererSpellIds([1, 2]).slice(0, 5),
      preparedSpellIds: [],
      spellbookSpellIds: [],
      transcribedSpellIds: [],
    },
    ...overrides,
  })
}

/** 通过真实组件挂载调用页面 hook，返回 page 引用与当前 store。 */
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

describe('useCharacterBuilderPage 升级降级与重新编辑流程', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    routerReplace.mockClear()
  })

  it('adjustLevel 升级：始终弹确认，确认后更新等级并跳转时间线', async () => {
    const { page, store } = await setupPage(makeFighterDraft({ selections: level5Selections }))

    page.adjustLevel(6)

    expect(page.pendingChange.value?.title).toBe('升级至 6 级')
    expect(page.pendingChange.value?.impact?.added).toContainEqual({
      checkpointId: 'fighter-2014-asi-6',
      title: '6级 · 属性提升或专长',
    })

    page.confirmPendingChange()

    expect(store.activeDraft?.targetLevel).toBe(6)
    expect(store.activeDraft?.selections.some((item) => item.invalidatedAt)).toBe(false)
    expect(page.step.value).toBe('timeline')
    expect(page.levelAdjustNotice.value?.message).toContain('请完成新增检查点')
    expect(page.levelAdjustNotice.value?.step).toBe('timeline')
  })

  it('adjustLevel 降级：确认后作废超限选择并留在当前步骤', async () => {
    const { page, store } = await setupPage(makeFighterDraft({ targetLevel: 10, selections: level10Selections }))

    page.adjustLevel(7)

    expect(page.pendingChange.value?.title).toBe('降级至 7 级')
    expect(page.pendingChange.value?.impact?.invalidatedDetails).toContainEqual({
      checkpointId: 'fighter-2014-asi-8',
      title: '8级 · 属性提升或专长',
    })

    page.confirmPendingChange()

    expect(store.activeDraft?.targetLevel).toBe(7)
    const asi8 = store.activeDraft?.selections.find((item) => item.checkpointId === 'fighter-2014-asi-8')
    expect(asi8?.invalidatedAt).toBeTruthy()
    expect(asi8?.optionIds).toEqual(['asi-dex-2'])
    expect(page.step.value).toBe('sheet')
    expect(page.levelAdjustNotice.value?.tone).toBe('warning')
    expect(page.levelAdjustNotice.value?.message).toContain('需复查')
  })

  it('adjustLevel 同级或未选职业时不弹确认、不修改', async () => {
    const { page, store } = await setupPage(makeFighterDraft({ selections: level5Selections }))

    page.adjustLevel(5)
    expect(page.pendingChange.value).toBeUndefined()

    store.updateDraft({ classId: undefined })
    page.adjustLevel(6)
    expect(page.pendingChange.value).toBeUndefined()
    expect(store.activeDraft?.targetLevel).toBe(5)
  })

  it('startReedit 智能定位：无未完成项进入属性步骤', async () => {
    const { page } = await setupPage(makeFighterDraft({ selections: level5Selections }))

    page.startReedit()

    expect(page.step.value).toBe('abilities')
  })

  it('startReedit 智能定位：存在失效选择时进入时间线', async () => {
    const invalidated = level10Selections.map((selection, index) =>
      index === level10Selections.length - 1
        ? { ...selection, invalidatedAt: '2026-08-06T00:00:00.000Z', invalidatedReason: '目标等级调整' }
        : selection,
    )
    const { page } = await setupPage(makeFighterDraft({ targetLevel: 10, selections: invalidated }))

    page.startReedit()

    expect(page.step.value).toBe('timeline')
  })

  it('startReedit 智能定位：未选职业时进入 setup', async () => {
    const { page } = await setupPage(makeFighterDraft({ classId: undefined, subclassId: undefined, selections: [] }))

    page.startReedit()

    expect(page.step.value).toBe('setup')
  })

  it('adjustLevel 升级到无新增检查点等级：确认后进入法术步骤补选', async () => {
    const { page, store } = await setupPage(makeSorcererDraft())

    page.adjustLevel(5)

    expect(page.pendingChange.value?.title).toBe('升级至 5 级')
    expect(page.pendingChange.value?.impact?.added).toEqual([])
    expect(page.pendingChange.value?.impact?.spellUpdates).toEqual(['已知法术 5/6', '戏法 4/5'])

    page.confirmPendingChange()

    expect(store.activeDraft?.targetLevel).toBe(5)
    expect(page.step.value).toBe('spells')
    expect(page.levelAdjustNotice.value?.message).toContain('已知法术 5/6')
    expect(page.levelAdjustNotice.value?.step).toBe('spells')
  })

  it('adjustLevel 升级到属性提升等级：新增检查点优先进入时间线', async () => {
    const { page, store } = await setupPage(makeSorcererDraft({
      targetLevel: 3,
      selections: [
        { checkpointId: 'sorcerer-2014-skills-1', optionIds: ['skill-arcana', 'skill-persuasion'], confirmedAt: '' },
        { checkpointId: 'sorcerer-2014-subclass-1', optionIds: ['subclass-2014-sorcerer-draconic-bloodline'], confirmedAt: '' },
      ],
    }))

    page.adjustLevel(4)

    expect(page.pendingChange.value?.impact?.added).toContainEqual({
      checkpointId: 'sorcerer-2014-asi-4',
      title: '4级 · 属性提升或专长',
    })

    page.confirmPendingChange()

    expect(store.activeDraft?.targetLevel).toBe(4)
    expect(page.step.value).toBe('timeline')
    expect(page.levelAdjustNotice.value?.step).toBe('timeline')
  })

  it('adjustLevel 升级到超魔等级：确认后进入时间线补选超魔', async () => {
    const { page, store } = await setupPage(makeSorcererDraft({
      targetLevel: 2,
      selections: [
        { checkpointId: 'sorcerer-2014-skills-1', optionIds: ['skill-arcana', 'skill-persuasion'], confirmedAt: '' },
        { checkpointId: 'sorcerer-2014-subclass-1', optionIds: ['subclass-2014-sorcerer-draconic-bloodline'], confirmedAt: '' },
      ],
    }))

    page.adjustLevel(3)

    expect(page.pendingChange.value?.impact?.added).toContainEqual({
      checkpointId: 'sorcerer-2014-metamagic-3',
      title: '3级 · 选择2项超魔法',
    })

    page.confirmPendingChange()

    expect(store.activeDraft?.targetLevel).toBe(3)
    expect(page.step.value).toBe('timeline')
  })
})

describe('useCharacterBuilderPage 改版与改职业的数据保护（B09-03）', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    routerReplace.mockClear()
  })

  /** 无构筑选择的草稿：只保留版本与等级参数。 */
  function makeEmptyDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
    return makeFighterDraft({
      id: 'test-empty',
      classId: undefined,
      subclassId: undefined,
      raceId: undefined,
      backgroundId: undefined,
      selections: [],
      inventory: [],
      ...overrides,
    })
  }

  it('无构筑时直接改版并写记忆偏好', async () => {
    const { page, store } = await setupPage(makeEmptyDraft())

    page.updateRuleset('5e-2024')

    expect(store.activeDraft?.ruleset).toBe('5e-2024')
    expect(page.rulesetRebuild.value).toBeUndefined()
    expect(RulesetPreferenceService.loadPreferredRuleset()).toBe('5e-2024')
  })

  it('已有构筑时改版进入另建确认，确认后原卡保留且新卡从空白开始', async () => {
    const { page, store } = await setupPage(makeFighterDraft({ name: '旧版战士' }))
    const originalId = store.activeDraftId

    page.updateRuleset('5e-2024')
    expect(page.rulesetRebuild.value).toBe('5e-2024')
    expect(store.activeDraft?.ruleset).toBe('5e-2014')

    page.cancelRulesetRebuild()
    expect(store.drafts).toHaveLength(1)

    page.updateRuleset('5e-2024')
    page.confirmRulesetRebuild()

    expect(page.rulesetRebuild.value).toBeUndefined()
    expect(store.drafts).toHaveLength(2)
    const original = store.drafts.find((draft) => draft.id === originalId)
    expect(original?.ruleset).toBe('5e-2014')
    expect(original?.classId).toBe('class-2014-fighter')
    const rebuilt = store.activeDraft!
    expect(rebuilt.ruleset).toBe('5e-2024')
    expect(rebuilt.name).toBe('旧版战士')
    expect(rebuilt.classId).toBeUndefined()
    expect(rebuilt.selections).toEqual([])
    expect(rebuilt.spellSelections.cantripIds).toEqual([])
    expect(RulesetPreferenceService.loadPreferredRuleset()).toBe('5e-2024')
  })

  it('更换职业会清空法术选择并在确认中列出影响', async () => {
    const { page, store } = await setupPage(makeSorcererDraft())

    page.selectClass('class-2014-wizard')

    expect(page.pendingChange.value?.affected).toContain('法术选择（将清空并重新选择）')
    page.confirmPendingChange()

    expect(store.activeDraft?.classId).toBe('class-2014-wizard')
    expect(store.activeDraft?.spellSelections.cantripIds).toEqual([])
    expect(store.activeDraft?.spellSelections.knownSpellIds).toEqual([])
  })

  it('取消改职业不产生任何修改', async () => {
    const { page, store } = await setupPage(makeSorcererDraft())
    const before = JSON.stringify(store.activeDraft)

    page.selectClass('class-2014-wizard')
    page.cancelPendingChange()

    expect(JSON.stringify(store.activeDraft)).toBe(before)
  })
})

describe('useCharacterBuilderPage 起源步骤完成判定（B09-07）', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    routerReplace.mockClear()
  })

  function makeWizardOriginDraft(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
    return makeFighterDraft({
      id: 'test-2024-origin',
      ruleset: '5e-2024',
      classId: 'class-2024-wizard',
      subclassId: undefined,
      raceId: 'species-2024-elf',
      subraceId: 'species-2024-elf-high-elf-lineage',
      backgroundId: 'background-2024-sage',
      currentStep: 'origin',
      raceSkillChoices: ['skill-perception'],
      backgroundAbilityAllocation: { int: 2, con: 1 },
      languages: [],
      ...overrides,
    })
  }

  it('2024 语言未选满不可继续，选满 2 门后可继续', async () => {
    const { page, store } = await setupPage(makeWizardOriginDraft())

    expect(page.step.value).toBe('origin')
    expect(page.canContinue.value).toBe(false)
    expect(page.originBlockers.value.map((blocker) => blocker.id)).toContain('background-languages')

    store.updateDraft({ languages: ['龙语'] })
    expect(page.canContinue.value).toBe(false)

    store.updateDraft({ languages: ['龙语', '精灵语'] })
    expect(page.originBlockers.value).toEqual([])
    expect(page.canContinue.value).toBe(true)
  })
})
