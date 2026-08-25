import { computed, ref } from 'vue'

import { rulesRepository } from '@/rules/repository'
import {
  TRANSCRIBE_HOURS_PER_LEVEL,
  applyTranscription,
  canAffordTranscription,
  getTranscribeCandidates,
  getTranscribeCost,
  getTranscribeTotalCost,
} from '@/rules/spellbook'
import { getSpellcastingConfig } from '@/rules/spellcasting'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import type { CharacterDraft } from '@/types/character'
import type { SpellRule } from '@/types/rules'

/**
 * 抄录法术书共享逻辑（角色卡与跑团助手共用）：
 * 候选池、费用合计、余额预览、金币校验与一次 patch 原子写回（spellSelections + adventureGold）。
 * draft 以函数传入以始终读取最新草稿（store 更新后 props 响应式刷新）。
 */
export function useSpellbookTranscription(getDraft: () => CharacterDraft) {
  const store = useCharacterDraftsStore()
  const selectedIds = ref<readonly string[]>([])
  const error = ref('')

  const config = computed(() => getSpellcastingConfig(getDraft()))
  const candidates = computed(() => {
    const draft = getDraft()
    return config.value ? getTranscribeCandidates(draft, config.value) : []
  })
  /** 候选按环级分组（1 环起，升序）。 */
  const groupedCandidates = computed(() => {
    const byLevel = new Map<number, SpellRule[]>()
    for (const spell of candidates.value) {
      const list = byLevel.get(spell.level) ?? []
      list.push(spell)
      byLevel.set(spell.level, list)
    }
    return [...byLevel.entries()]
      .sort((left, right) => left[0] - right[0])
      .map(([level, spells]) => ({ level, spells }))
  })
  const totalCost = computed(() => getTranscribeTotalCost(selectedIds.value))
  /** 抄录耗时（仅提示）：每个法术环级 × 2 小时。 */
  const totalHours = computed(() => selectedIds.value.reduce((sum, id) => {
    const spell = rulesRepository.getSpell(id)
    return sum + (spell ? spell.level * TRANSCRIBE_HOURS_PER_LEVEL : 0)
  }, 0))
  const totalGold = computed(() => {
    const draft = getDraft()
    return draft.currency.gp + draft.adventureGold
  })
  const remainingGold = computed(() => totalGold.value - totalCost.value)
  const canAfford = computed(() => canAffordTranscription(getDraft(), totalCost.value))

  function toggle(id: string): void {
    // 只允许候选池内的法术被勾选（已在书中/不可用的 ID 直接忽略）。
    if (!candidates.value.some((spell) => spell.id === id)) return
    const current = selectedIds.value
    selectedIds.value = current.includes(id)
      ? current.filter((spellId) => spellId !== id)
      : [...current, id]
    error.value = ''
  }

  function reset(): void {
    selectedIds.value = []
    error.value = ''
  }

  /** 执行抄录：金币不足或未选择时返回 false 并给出中文原因；成功则一次更新草稿并复位。 */
  function transcribe(): boolean {
    if (selectedIds.value.length === 0) {
      error.value = '请先选择要抄录的法术'
      return false
    }
    const draft = getDraft()
    const affordability = canAffordTranscription(draft, totalCost.value)
    if (!affordability.ok) {
      error.value = affordability.reason ?? '金币不足，无法抄录'
      return false
    }
    const result = applyTranscription(draft, selectedIds.value)
    if (result.cost === 0) {
      error.value = '所选法术均不可抄录'
      return false
    }
    const ok = store.updateDraftById(draft.id, {
      spellSelections: result.spellSelections,
      adventureGold: result.adventureGold,
    })
    if (!ok) {
      error.value = '抄录失败：角色草稿不存在'
      return false
    }
    reset()
    return true
  }

  return {
    groupedCandidates,
    totalCost,
    totalHours,
    totalGold,
    remainingGold,
    canAfford,
    selectedIds,
    toggle,
    reset,
    transcribe,
    error,
    getTranscribeCost,
  } as const
}
