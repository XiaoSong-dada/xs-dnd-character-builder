import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { DicePoolEntry, LogicalRollResult } from '@/types/dice'

/** Application-session data only. Visual resources belong to the page. */
export const useDiceStore = defineStore('dice', () => {
  const pool = ref<DicePoolEntry[]>([])
  const results = ref<LogicalRollResult[]>([])
  const pendingResults = ref<LogicalRollResult[]>([])
  const activeRollId = ref<string>()
  const skipAnimation = ref(false)
  const soundEnabled = ref(true)
  let sequence = 0

  function invalidate() {
    activeRollId.value = undefined
    results.value = []
    pendingResults.value = []
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

  function prepare(id: string, values: LogicalRollResult[]) {
    if (activeRollId.value === id) pendingResults.value = values
  }

  function publish(id: string | undefined) {
    if (!id || activeRollId.value !== id) return false
    results.value = pendingResults.value
    pendingResults.value = []
    activeRollId.value = undefined
    return true
  }

  return { pool, results, pendingResults, activeRollId, skipAnimation, soundEnabled, begin, beginReroll, prepare, publish, invalidate }
})
