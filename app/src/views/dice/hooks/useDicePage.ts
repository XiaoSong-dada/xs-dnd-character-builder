import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

import {
  DIE_TYPES,
  MAX_PHYSICAL_DICE,
  calculateRollTotal,
  formatDiceExpression,
  getPhysicalDiceCount,
  getPhysicalDieCost,
  groupRollResults,
  prepareRoll,
} from '@/rules/dice'
import { randomIntegerInclusive, secureUint32 } from '@/services/dice-random'
import type {
  DicePoolEntry,
  DicePresentation,
  DiceWorkerResponse,
  DieType,
  LogicalRollResult,
  RollRequest,
  RollStatus,
} from '@/types/dice'
import { DiceWorkerClient } from '@/views/dice/engine/dice-worker-client'

interface WorkerClientLike {
  simulate(request: RollRequest): Promise<DiceWorkerResponse>
  terminate(): void
}

export interface DicePageDependencies {
  randomUint32?: () => number
  randomInteger?: (minimum: number, maximum: number) => number
  createWorkerClient?: () => WorkerClientLike
}

export function useDicePage(dependencies: DicePageDependencies = {}) {
  const randomUint32 = dependencies.randomUint32 ?? secureUint32
  const randomInteger = dependencies.randomInteger ?? randomIntegerInclusive
  const createWorkerClient = dependencies.createWorkerClient ?? (() => new DiceWorkerClient())
  const pool = ref<DicePoolEntry[]>([])
  const results = ref<LogicalRollResult[]>([])
  const pendingResults = ref<LogicalRollResult[]>([])
  const presentation = shallowRef<DicePresentation>()
  const status = ref<RollStatus>('idle')
  const notice = ref('')
  const error = ref('')
  const visualAvailable = ref(true)
  const reducedMotion = ref(false)
  let mediaQuery: MediaQueryList | undefined
  let workerClient: WorkerClientLike | undefined
  let rollSequence = 0

  const physicalDiceCount = computed(() => getPhysicalDiceCount(pool.value))
  const remainingPhysicalDice = computed(() => MAX_PHYSICAL_DICE - physicalDiceCount.value)
  const expression = computed(() => formatDiceExpression(pool.value))
  const isBusy = computed(() => status.value === 'preparing' || status.value === 'rolling')
  const groupedResults = computed(() => groupRollResults(results.value))
  const total = computed(() => calculateRollTotal(results.value))

  function canAdd(type: DieType) {
    return !isBusy.value && remainingPhysicalDice.value >= getPhysicalDieCost(type)
  }

  function invalidateResult() {
    results.value = []
    pendingResults.value = []
    presentation.value = undefined
    notice.value = ''
    error.value = ''
    status.value = 'idle'
  }

  function addDie(type: DieType) {
    if (!canAdd(type)) return
    const entry = pool.value.find((item) => item.type === type)
    pool.value = entry
      ? pool.value.map((item) => item.type === type ? { ...item, quantity: item.quantity + 1 } : item)
      : [...pool.value, { type, quantity: 1 }]
    invalidateResult()
  }

  function removeDie(type: DieType) {
    if (isBusy.value) return
    const entry = pool.value.find((item) => item.type === type)
    if (!entry) return
    pool.value = entry.quantity <= 1
      ? pool.value.filter((item) => item.type !== type)
      : pool.value.map((item) => item.type === type ? { ...item, quantity: item.quantity - 1 } : item)
    invalidateResult()
  }

  function clearPool() {
    if (isBusy.value) return
    pool.value = []
    invalidateResult()
  }

  function completeAsTextFallback(message: string) {
    results.value = pendingResults.value
    pendingResults.value = []
    presentation.value = undefined
    notice.value = message
    status.value = 'fallback'
  }

  async function roll() {
    if (isBusy.value || physicalDiceCount.value === 0) return
    error.value = ''
    notice.value = ''
    results.value = []
    presentation.value = undefined
    status.value = 'preparing'

    try {
      const seed = randomUint32()
      const rollId = `roll-${Date.now()}-${seed}-${rollSequence += 1}`
      const preparation = prepareRoll(pool.value, rollId, seed, randomInteger)
      pendingResults.value = preparation.results

      if (!visualAvailable.value) {
        completeAsTextFallback('当前设备无法显示 3D 骰子，已使用公平文字掷骰。')
        return
      }

      workerClient ??= createWorkerClient()
      const response = await workerClient.simulate(preparation.request)
      if (response.type === 'failure') {
        completeAsTextFallback('物理骰盘本次未能稳定落骰，已使用公平文字结果。')
        return
      }
      presentation.value = { request: preparation.request, trajectory: response.trajectory }
      status.value = 'rolling'
    } catch (reason) {
      pendingResults.value = []
      status.value = 'error'
      error.value = reason instanceof Error ? reason.message : '投掷失败，请稍后重试。'
    }
  }

  function handlePlaybackComplete(rollId: string) {
    if (presentation.value?.request.id !== rollId || status.value !== 'rolling') return
    results.value = pendingResults.value
    pendingResults.value = []
    status.value = 'complete'
  }

  function handleRendererUnavailable() {
    visualAvailable.value = false
    if (status.value === 'rolling' || status.value === 'preparing') {
      completeAsTextFallback('当前设备无法显示 3D 骰子，已使用公平文字掷骰。')
    } else {
      notice.value = '当前设备无法显示 3D 骰子，投掷时将使用文字结果。'
    }
  }

  function updateReducedMotion(event: MediaQueryListEvent | MediaQueryList) {
    reducedMotion.value = event.matches
  }

  onMounted(() => {
    if (!globalThis.matchMedia) return
    mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    updateReducedMotion(mediaQuery)
    mediaQuery.addEventListener('change', updateReducedMotion)
  })

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', updateReducedMotion)
    workerClient?.terminate()
  })

  return {
    title: '赛博骰娘',
    description: '选择骰子，让它们在真实碰撞中落定，并自动计算本次总和。',
    dieTypes: DIE_TYPES,
    maxPhysicalDice: MAX_PHYSICAL_DICE,
    pool,
    results,
    presentation,
    status,
    notice,
    error,
    physicalDiceCount,
    remainingPhysicalDice,
    expression,
    isBusy,
    groupedResults,
    total,
    reducedMotion,
    canAdd,
    addDie,
    removeDie,
    clearPool,
    roll,
    handlePlaybackComplete,
    handleRendererUnavailable,
  }
}
