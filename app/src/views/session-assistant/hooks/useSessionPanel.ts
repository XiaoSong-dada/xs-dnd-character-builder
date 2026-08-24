import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'

import { deriveCharacter } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import { getSpellSlots } from '@/rules/spellcasting'
import {
  applyExhaustionChange,
  applyHpChange,
  applyLongRest,
  applyShortRest,
  applySpellSlotChange,
  clampCurrentHp,
  createInitialSessionState,
  restoreLastRest,
  toggleDebuff,
} from '@/rules/session-state'
import { SessionStateStorageService } from '@/services/session-state-storage'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import type { CharacterDraft } from '@/types/character'
import type { SessionState } from '@/types/session-state'

/** 局内面板 hook：SessionState 读写、HP/金币/法术位/力竭/休息/撤回操作。 */
export function useSessionPanel(draft: Ref<CharacterDraft>) {
  const store = useCharacterDraftsStore()

  // ---- 派生数据 ----
  const derived = computed(() => deriveCharacter(draft.value))
  const maxHp = computed(() => derived.value.hitPoints.value)
  const className = computed(() => draft.value.classId ? (rulesRepository.getClass(draft.value.classId)?.name ?? '') : '')
  const spellcastingConfig = computed(() => rulesRepository.getSpellcastingConfig(draft.value))
  const spellSlots = computed(() =>
    spellcastingConfig.value ? getSpellSlots(spellcastingConfig.value, draft.value.targetLevel) : [],
  )
  const pactSlotLevels = computed(() => spellSlots.value.filter((slot) => slot.pact).map((slot) => slot.level))

  // ---- 局内状态（首次进入初始化；按草稿 id 独立存储）----
  const sessionState = ref<SessionState>()

  function ensureState(): SessionState {
    const existing = sessionState.value
    if (existing) return existing
    const loaded = SessionStateStorageService.load(draft.value.id)
    const next = loaded
      ? clampCurrentHp(loaded, maxHp.value)
      : createInitialSessionState(draft.value.id, maxHp.value)
    sessionState.value = next
    return next
  }
  ensureState()

  // 角色升级/重新编辑后最大 HP 变化 → 当前 HP 按新上限钳制
  watch(maxHp, (value) => {
    if (!sessionState.value) return
    sessionState.value = clampCurrentHp(sessionState.value, value)
    SessionStateStorageService.save(sessionState.value)
  })

  function persist(next: SessionState): void {
    sessionState.value = next
    SessionStateStorageService.save(next)
  }

  // ---- 操作越界提示（钳制类操作统一出口）----
  const operationError = ref('')

  // ---- 血量 ----
  function changeHp(delta: number): void {
    const state = ensureState()
    const next = state.currentHp + delta
    if (next > maxHp.value) {
      operationError.value = `生命值不能超过最大生命值（${maxHp.value}）`
      return
    }
    if (next < 0) {
      operationError.value = '生命值不能低于 0'
      return
    }
    operationError.value = ''
    persist(applyHpChange(state, delta, maxHp.value))
  }

  // ---- 法术位 ----
  function changeSpellSlot(level: number, delta: number): void {
    const state = ensureState()
    const maxForLevel = spellSlots.value.find((slot) => slot.level === level)?.count ?? 0
    const next = (state.usedSpellSlots[level] ?? 0) + delta
    if (next < 0) {
      operationError.value = `${level}环法术位不能少于 0`
      return
    }
    if (next > maxForLevel) {
      operationError.value = `${level}环法术位不能超过 ${maxForLevel}`
      return
    }
    operationError.value = ''
    persist(applySpellSlotChange(state, level, delta, maxForLevel))
  }

  // ---- 力竭 ----
  function changeExhaustion(delta: number): void {
    const state = ensureState()
    const next = state.exhaustionLevel + delta
    if (next < 0 || next > 6) {
      operationError.value = '力竭层数范围 0—6'
      return
    }
    operationError.value = ''
    persist(applyExhaustionChange(state, delta))
  }

  // ---- debuff ----
  function toggleStatus(debuffId: string): void {
    persist(toggleDebuff(ensureState(), debuffId))
  }

  // ---- 休息与撤回 ----
  function shortRest(): void {
    persist(applyShortRest(ensureState(), pactSlotLevels.value, maxHp.value))
  }

  function longRest(): void {
    persist(applyLongRest(ensureState(), maxHp.value))
  }

  function undoRest(): void {
    persist(restoreLastRest(ensureState()))
  }

  // ---- 金币（写回 adventureGold，与角色卡页共享事实源）----
  const totalGold = computed(() => draft.value.currency.gp + draft.value.adventureGold)

  function changeAdventureGold(adventureGold: number): void {
    store.updateDraftById(draft.value.id, { adventureGold })
  }

  /** 物品变更（新增/调整/删除）写回草稿；复用角色卡页同一套纯函数与事件语义。 */
  function updateInventory(inventory: readonly import('@/types/character').InventoryEntry[]): boolean {
    return store.updateDraftById(draft.value.id, { inventory })
  }

  const currencyInput = ref('')
  const currencyError = ref('')
  function applyCurrency(mode: 'add' | 'set' | 'decrease'): void {
    const raw = currencyInput.value.trim()
    if (!/^-?\d+$/.test(raw)) {
      currencyError.value = '请输入整数金币数'
      return
    }
    const value = Number(raw)
    const startingGold = draft.value.currency.gp
    // decrease 对输入值取绝对值作为扣减量；输入 0 不产生变化。
    const nextGold = mode === 'add'
      ? draft.value.adventureGold + value
      : mode === 'set'
        ? value - startingGold
        : draft.value.adventureGold - Math.abs(value)
    if (startingGold + nextGold < 0) {
      currencyError.value = '金币不能为负'
      return
    }
    changeAdventureGold(nextGold)
    currencyInput.value = ''
    currencyError.value = ''
  }

  return {
    derived,
    className,
    maxHp,
    spellSlots,
    sessionState,
    totalGold,
    changeHp,
    changeSpellSlot,
    changeExhaustion,
    toggleStatus,
    shortRest,
    longRest,
    undoRest,
    updateInventory,
    operationError,
    currencyInput,
    currencyError,
    applyCurrency,
  } as const
}
