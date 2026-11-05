import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { DicePoolEntry, LogicalRollResult } from '@/types/dice'

/** Application-session data only. Visual resources belong to the page. */
export const useDiceStore = defineStore('dice', () => {
  const pool = ref<DicePoolEntry[]>([])
  const results = ref<LogicalRollResult[]>([])
  const pendingResults = ref<LogicalRollResult[]>([])
  const modifierInput = ref('')
  const appliedModifier = ref(0)
  const activeRollId = ref<string>()
  const skipAnimation = ref(false)
  const soundEnabled = ref(true)
  let sequence = 0

  function invalidate() {
    activeRollId.value = undefined
    results.value = []
    pendingResults.value = []
    appliedModifier.value = 0
  }

  function begin() {
    invalidate()
    activeRollId.value = `roll-${Date.now()}-${++sequence}`
    return activeRollId.value
  }

  /** 单颗重掷：保留已公布结果，只在动画/结算期间挂起新一轮投掷标识。 */
  function beginReroll() {
    pendingResults.value = []
    activeRollId.value = `reroll-${Date.now()}-${++sequence}`
    return activeRollId.value
  }

  /** 新一轮整组投掷需显式传入修正值；单颗重掷省略该参数以沿用本次投掷的快照。 */
  function prepare(id: string, values: LogicalRollResult[], modifier?: number) {
    if (activeRollId.value !== id) return
    pendingResults.value = values
    if (modifier !== undefined) appliedModifier.value = modifier
  }

  function publish(id: string | undefined) {
    if (!id || activeRollId.value !== id) return false
    results.value = pendingResults.value
    pendingResults.value = []
    activeRollId.value = undefined
    return true
  }

  return {
    pool,
    results,
    pendingResults,
    modifierInput,
    appliedModifier,
    activeRollId,
    skipAnimation,
    soundEnabled,
    begin,
    beginReroll,
    prepare,
    publish,
    invalidate,
  }
})
