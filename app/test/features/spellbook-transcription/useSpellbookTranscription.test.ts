import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useSpellbookTranscription } from '@/features/spellbook-transcription/hooks/useSpellbookTranscription'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import type { CharacterDraft } from '@/types/character'

function makeWizardDraft(store: ReturnType<typeof useCharacterDraftsStore>): CharacterDraft {
  store.createDraft()
  store.updateDraft({
    name: '抄录法师',
    classId: 'class-2014-wizard',
    targetLevel: 5,
    adventureGold: 500,
    spellSelections: {
      cantripIds: ['spell-2014-fire-bolt', 'spell-2014-mage-hand', 'spell-2014-ray-of-frost'],
      knownSpellIds: [],
      preparedSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
      spellbookSpellIds: ['spell-2014-magic-missile', 'spell-2014-shield'],
      transcribedSpellIds: [],
    },
  })
  return store.activeDraft as CharacterDraft
}

describe('useSpellbookTranscription', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('候选池与费用正确：5 级法师最高 3 环、不含已入书法术', () => {
    const store = useCharacterDraftsStore()
    const draft = makeWizardDraft(store)
    const hook = useSpellbookTranscription(() => store.activeDraft as CharacterDraft)
    const levels = hook.groupedCandidates.value.map((group) => group.level)
    expect(levels).toEqual([1, 2, 3])
    expect(hook.groupedCandidates.value.every((group) => group.spells.length > 0)).toBe(true)
    expect(hook.groupedCandidates.value.flatMap((group) => group.spells).some((spell) => spell.id === 'spell-2014-magic-missile')).toBe(false)
    expect(hook.totalGold.value).toBe(draft.currency.gp + 500)
  })

  it('多选后合计费用、余额预览与金币校验正确', () => {
    const store = useCharacterDraftsStore()
    makeWizardDraft(store)
    const hook = useSpellbookTranscription(() => store.activeDraft as CharacterDraft)
    hook.toggle('spell-2014-magic-missile') // 已在书中，候选不含 → 不参与合计
    hook.toggle('spell-2014-scorching-ray') // 2 环 100 GP
    hook.toggle('spell-2014-fireball') // 3 环 150 GP
    expect(hook.totalCost.value).toBe(250)
    expect(hook.remainingGold.value).toBe(500 - 250)
    expect(hook.canAfford.value.ok).toBe(true)
  })

  it('抄录成功后一次更新 spellSelections 与 adventureGold，并复位选择', () => {
    const store = useCharacterDraftsStore()
    const draft = makeWizardDraft(store)
    const hook = useSpellbookTranscription(() => store.activeDraft as CharacterDraft)
    hook.toggle('spell-2014-fireball')
    const ok = hook.transcribe()
    expect(ok).toBe(true)
    const updated = store.activeDraft as CharacterDraft
    expect(updated.spellSelections.spellbookSpellIds).toContain('spell-2014-fireball')
    expect(updated.spellSelections.transcribedSpellIds).toEqual(['spell-2014-fireball'])
    expect(updated.adventureGold).toBe(draft.adventureGold - 150)
    expect(hook.selectedIds.value).toEqual([])
  })

  it('金币不足时不写入并给出中文原因', () => {
    const store = useCharacterDraftsStore()
    makeWizardDraft(store)
    store.updateDraft({ adventureGold: 10 })
    const hook = useSpellbookTranscription(() => store.activeDraft as CharacterDraft)
    hook.toggle('spell-2014-fireball') // 150 GP > 10 GP
    const ok = hook.transcribe()
    expect(ok).toBe(false)
    expect(hook.error.value).toContain('金币不足')
    const updated = store.activeDraft as CharacterDraft
    expect(updated.spellSelections.spellbookSpellIds).not.toContain('spell-2014-fireball')
    expect(updated.adventureGold).toBe(10)
  })

  it('重复抄录同一法术被去重：再次抄录已入书法术不产生变化', () => {
    const store = useCharacterDraftsStore()
    const draft = makeWizardDraft(store)
    const hook = useSpellbookTranscription(() => store.activeDraft as CharacterDraft)
    hook.toggle('spell-2014-fireball')
    hook.transcribe()
    // 再次打开：候选已不含 fireball
    const hook2 = useSpellbookTranscription(() => store.activeDraft as CharacterDraft)
    expect(hook2.groupedCandidates.value.flatMap((group) => group.spells).some((spell) => spell.id === 'spell-2014-fireball')).toBe(false)
    expect((store.activeDraft as CharacterDraft).adventureGold).toBe(draft.adventureGold - 150)
  })

  it('未选择任何法术时不执行并提示', () => {
    const store = useCharacterDraftsStore()
    const draft = makeWizardDraft(store)
    const hook = useSpellbookTranscription(() => store.activeDraft as CharacterDraft)
    expect(hook.transcribe()).toBe(false)
    expect(hook.error.value).toContain('请先选择')
    expect((store.activeDraft as CharacterDraft).adventureGold).toBe(draft.adventureGold)
  })
})
