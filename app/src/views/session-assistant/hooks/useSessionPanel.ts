import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'

import { deriveCharacter } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import { getEffectiveSpellSlots, getRequiredSpellCount, getSpellCandidates, getSpellcastingConfig, getUnpreparedManualSpellIds } from '@/rules/spellcasting'
import { normalizeManualEdits } from '@/rules/manual-edits'
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
  const spellcastingConfig = computed(() => getSpellcastingConfig(draft.value))
  const spellSlots = computed(() => getEffectiveSpellSlots(draft.value))
  const pactSlotLevels = computed(() => spellSlots.value.filter((slot) => slot.pact).map((slot) => slot.level))

  // ---- 法术书（spellbook 模式）：未准备法术与准备切换 ----
  const requiredSpellCount = computed(() =>
    spellcastingConfig.value ? getRequiredSpellCount(draft.value, spellcastingConfig.value) : 0,
  )
  /** 法术书中未准备的法术（长休可换入准备）；仅 spellbook 模式有值。 */
  const unpreparedFromBook = computed(() => {
    const config = spellcastingConfig.value
    const normal = config ? getSpellCandidates(draft.value, config).prepareFromBook : []
    return [...new Set([...normal, ...getUnpreparedManualSpellIds(draft.value)])]
      .map((id) => rulesRepository.getSpell(id))
      .filter((spell): spell is NonNullable<typeof spell> => Boolean(spell))
  })
  const canPrepareMore = computed(() =>
    draft.value.spellSelections.preparedSpellIds.length < requiredSpellCount.value,
  )

  /** 准备/取消准备法术书中未准备的法术（与角色卡 togglePrepare 同一语义）。 */
  function togglePrepareSpell(spellId: string): void {
    const manual = normalizeManualEdits(draft.value.manualEdits)
    const manualSpell = manual.addedSpells.find((item) => item.spellId === spellId)
    if (manualSpell) {
      store.updateDraftById(draft.value.id, {
        manualEdits: {
          ...manual,
          addedSpells: manual.addedSpells.map((item) => item.spellId === spellId ? { ...item, prepared: !item.prepared } : item),
        },
      })
      return
    }
    const current = draft.value.spellSelections.preparedSpellIds
    const next = current.includes(spellId)
      ? current.filter((id) => id !== spellId)
      : canPrepareMore.value
        ? [...current, spellId]
        : current
    if (next === current) return
    store.updateDraftById(draft.value.id, {
      spellSelections: { ...draft.value.spellSelections, preparedSpellIds: next },
    })
  }

  function canPrepareSpell(spellId: string): boolean {
    return normalizeManualEdits(draft.value.manualEdits).addedSpells.some((item) => item.spellId === spellId)
      || canPrepareMore.value
  }

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

  // Store 会先协调并持久化 HP/环位；草稿刷新后重新载入，避免面板内存态覆盖协调结果。
  watch([maxHp, () => spellSlots.value.map((slot) => `${slot.level}:${slot.count}`).join('|')], ([value]) => {
    const stored = SessionStateStorageService.load(draft.value.id)
    if (!stored) return
    sessionState.value = clampCurrentHp(stored, value)
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
    // 双向钳制：加血超过最大生命值自动满血，减血低于 0 自动归零，均不弹错误。
    const next = Math.min(maxHp.value, Math.max(0, state.currentHp + delta))
    operationError.value = ''
    persist(applyHpChange(state, next - state.currentHp, maxHp.value))
  }

  // ---- 法术位 ----
  /** 各环可用数（可用 = 总量 − 已用；展示层语义，内部仍存已用）。 */
  const availableSlots = computed(() =>
    Object.fromEntries(
      spellSlots.value.map((slot) => [slot.level, Math.max(0, slot.count - (sessionState.value?.usedSpellSlots[slot.level] ?? 0))]),
    ),
  )

  function changeSpellSlot(level: number, delta: number): void {
    const state = ensureState()
    const maxForLevel = spellSlots.value.find((slot) => slot.level === level)?.count ?? 0
    const next = (state.usedSpellSlots[level] ?? 0) + delta
    if (next < 0) {
      operationError.value = `${level}环法术位已全部恢复`
      return
    }
    if (next > maxForLevel) {
      operationError.value = `${level}环法术位已用尽`
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
    availableSlots,
    totalGold,
    unpreparedFromBook,
    canPrepareMore,
    togglePrepareSpell,
    canPrepareSpell,
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
