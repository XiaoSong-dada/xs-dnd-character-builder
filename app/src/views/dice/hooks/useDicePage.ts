import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

import {
  DIE_TYPES,
  MAX_PHYSICAL_DICE,
  buildRerollRequest,
  calculateDiceTotal,
  calculateRollTotal,
  formatDiceExpression,
  getPhysicalDiceCount,
  getPhysicalDieCost,
  groupRollResults,
  parseRollModifier,
  prepareRoll,
  rerollLogicalResult,
} from '@/rules/dice'
import { DiceAudioService, type DiceAudio } from '@/services/dice-audio'
import {
  DicePresetStorageService,
  MAX_DICE_PRESETS,
  createDicePoolPreset,
  isSameDicePoolPreset,
} from '@/services/dice-presets'
import { randomIntegerInclusive, secureUint32 } from '@/services/dice-random'
import { useDiceStore } from '@/stores/dice'
import type {
  DicePoolPreset,
  DicePresentation,
  DiceWorkerResponse,
  DieType,
  RollRequest,
  RollStatus,
} from '@/types/dice'
import { DiceWorkerClient } from '@/views/dice/engine/dice-worker-client'

interface WorkerClientLike {
  simulate(request: RollRequest): Promise<DiceWorkerResponse>
  cancel(rollId: string): void
  terminate(): void
}

export const DICE_ROLL_DEADLINE_MS = 3_000

type PresetFeedback =
  | { target: 'save' | 'delete'; message: string; error?: boolean }
  | { target: 'apply'; message: string; presetId: string }

export interface DicePageDependencies {
  randomUint32?: () => number
  randomInteger?: (minimum: number, maximum: number) => number
  createWorkerClient?: () => WorkerClientLike
  createAudio?: () => DiceAudio
}

export function useDicePage(dependencies: DicePageDependencies = {}) {
  const randomUint32 = dependencies.randomUint32 ?? secureUint32
  const randomInteger = dependencies.randomInteger ?? randomIntegerInclusive
  const createWorkerClient = dependencies.createWorkerClient ?? (() => new DiceWorkerClient())
  const store = useDiceStore()
  const { pool, results, modifierInput, appliedModifier, activeRollId, skipAnimation, soundEnabled } = storeToRefs(store)
  const audio = dependencies.createAudio?.() ?? new DiceAudioService()
  let disposed = false
  let soundedRollId: string | undefined
  const presentation = shallowRef<DicePresentation>()
  const status = ref<RollStatus>(results.value.length ? 'complete' : 'idle')
  const notice = ref('')
  const error = ref('')
  const presets = ref<DicePoolPreset[]>([])
  const presetFeedback = ref<PresetFeedback>()
  const visualAvailable = ref(true)
  const reducedMotion = ref(false)
  let mediaQuery: MediaQueryList | undefined
  let workerClient: WorkerClientLike | undefined
  let rollStartedAt = 0
  let deadlineTimer: ReturnType<typeof setTimeout> | undefined
  let playbackPhysicalCount = 0

  const physicalDiceCount = computed(() => getPhysicalDiceCount(pool.value))
  const remainingPhysicalDice = computed(() => MAX_PHYSICAL_DICE - physicalDiceCount.value)
  const expression = computed(() => formatDiceExpression(pool.value))
  const isBusy = computed(() => status.value === 'preparing' || status.value === 'rolling')
  const canReroll = computed(() => !isBusy.value && results.value.length > 0
    && (status.value === 'complete' || status.value === 'fallback'))
  const groupedResults = computed(() => groupRollResults(results.value))
  const modifierState = computed(() => parseRollModifier(modifierInput.value))
  const modifierError = computed(() => modifierState.value.error)
  const diceTotal = computed(() => calculateDiceTotal(results.value))
  const total = computed(() => calculateRollTotal(results.value, appliedModifier.value))

  function canAdd(type: DieType) {
    return !isBusy.value && remainingPhysicalDice.value >= getPhysicalDieCost(type)
  }

  function setModifier(value: string) {
    if (isBusy.value) return
    modifierInput.value = value
    invalidateResult()
  }

  function invalidateResult() {
    clearDeadline()
    store.invalidate()
    audio.stop()
    presentation.value = undefined
    notice.value = ''
    error.value = ''
    presetFeedback.value = undefined
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

  function savePreset() {
    if (isBusy.value || physicalDiceCount.value === 0) return
    if (modifierError.value) {
      presetFeedback.value = { target: 'save', message: modifierError.value, error: true }
      return
    }
    const preset = createDicePoolPreset(pool.value, modifierState.value.value)
    if (!preset) {
      presetFeedback.value = { target: 'save', message: '当前骰池无法保存为预设，请检查骰子数量。', error: true }
      return
    }
    const duplicate = presets.value.find((item) => isSameDicePoolPreset(item, preset))
    if (!duplicate && presets.value.length >= MAX_DICE_PRESETS) {
      presetFeedback.value = { target: 'save', message: `最多保存 ${MAX_DICE_PRESETS} 条预设，请先删除不再使用的预设。`, error: true }
      return
    }
    const next = duplicate
      ? [preset, ...presets.value.filter((item) => item.id !== duplicate.id)]
      : [preset, ...presets.value]
    if (!DicePresetStorageService.saveDicePresets(next)) {
      presetFeedback.value = { target: 'save', message: '预设保存失败，浏览器本地存储不可用。', error: true }
      return
    }
    presets.value = next
    const savedExpression = formatDiceExpression(preset.pool, preset.modifier)
    presetFeedback.value = { target: 'save', message: `${duplicate ? '已更新' : '已保存'}预设 ${savedExpression}。` }
  }

  function applyPreset(id: string) {
    if (isBusy.value) return
    const preset = presets.value.find((item) => item.id === id)
    if (!preset) return
    pool.value = preset.pool.map((entry) => ({ ...entry }))
    setModifier(preset.modifier === 0 ? '' : String(preset.modifier))
    presetFeedback.value = {
      target: 'apply',
      presetId: id,
      message: `已应用 ${formatDiceExpression(preset.pool, preset.modifier)}，请手动投掷。`,
    }
  }

  function deletePreset(id: string) {
    const next = presets.value.filter((item) => item.id !== id)
    if (next.length === presets.value.length) return
    if (!DicePresetStorageService.saveDicePresets(next)) {
      presetFeedback.value = { target: 'delete', message: '预设删除失败，浏览器本地存储不可用。', error: true }
      return
    }
    presets.value = next
    presetFeedback.value = { target: 'delete', message: '已删除预设。' }
  }

  function clearDeadline() {
    if (deadlineTimer) clearTimeout(deadlineTimer)
    deadlineTimer = undefined
  }

  function completeAsTextFallback(message: string, rollId = activeRollId.value) {
    if (!rollId || rollId !== activeRollId.value) return
    clearDeadline()
    store.publish(rollId)
    audio.stop()
    presentation.value = undefined
    notice.value = message
    status.value = 'fallback'
  }

  function handleRollDeadline(rollId: string) {
    if (rollId !== activeRollId.value || !isBusy.value) return
    completeAsTextFallback('本次投掷等待超过 3 秒，已直接显示结果', rollId)
    workerClient?.terminate()
    workerClient = undefined
  }

  function checkDeadline() {
    const id = activeRollId.value
    if (id && performance.now() - rollStartedAt >= DICE_ROLL_DEADLINE_MS) {
      handleRollDeadline(id)
      return true
    }
    return false
  }

  async function roll() {
    if (disposed || isBusy.value || physicalDiceCount.value === 0 || modifierError.value) return
    presetFeedback.value = undefined
    rollStartedAt = performance.now()
    playbackPhysicalCount = physicalDiceCount.value
    error.value = ''
    notice.value = ''
    presentation.value = undefined
    status.value = 'preparing'

    const rollId = store.begin()
    soundedRollId = undefined
    if (!skipAnimation.value && soundEnabled.value && !reducedMotion.value) audio.unlock()
    clearDeadline()
    if (!skipAnimation.value) deadlineTimer = setTimeout(() => handleRollDeadline(rollId), DICE_ROLL_DEADLINE_MS)

    try {
      const seed = randomUint32()
      const preparation = prepareRoll(pool.value, rollId, seed, randomInteger)
      store.prepare(rollId, preparation.results, modifierState.value.value)
      if (skipAnimation.value) {
        store.publish(rollId)
        status.value = 'complete'
        return
      }

      if (checkDeadline()) return
      if (!visualAvailable.value) {
        completeAsTextFallback('当前设备无法显示 3D 骰子，已使用公平文字掷骰。')
        return
      }

      workerClient ??= createWorkerClient()
      const response = await workerClient.simulate(preparation.request)
      if (disposed || rollId !== activeRollId.value || status.value !== 'preparing') return
      if (checkDeadline()) return
      if (response.type === 'failure') {
        completeAsTextFallback('物理骰盘本次未能稳定落骰，已使用公平文字结果。', rollId)
        return
      }
      presentation.value = { request: preparation.request, trajectory: response.trajectory }
      status.value = 'rolling'
    } catch (reason) {
      if (rollId !== activeRollId.value) return
      clearDeadline()
      store.invalidate()
      audio.stop()
      status.value = 'error'
      error.value = reason instanceof Error ? reason.message : '投掷失败，请稍后重试。'
    }
  }

  async function reroll(logicalId: string) {
    if (disposed || !canReroll.value) return
    if (!results.value.some((result) => result.id === logicalId)) return

    const nextResults = results.value.map((result) => result.id === logicalId
      ? rerollLogicalResult(result, randomInteger)
      : result)
    const previous = presentation.value
    const rollId = store.beginReroll()
    soundedRollId = undefined
    error.value = ''
    notice.value = ''

    let request: RollRequest | undefined
    if (!skipAnimation.value && visualAvailable.value && previous) {
      try {
        request = buildRerollRequest(nextResults, logicalId, rollId, randomUint32(), previous)
      } catch {
        request = undefined
      }
    }

    if (!request) {
      store.prepare(rollId, nextResults)
      store.publish(rollId)
      audio.stop()
      presentation.value = undefined
      status.value = 'complete'
      return
    }

    rollStartedAt = performance.now()
    playbackPhysicalCount = request.dice.filter((die) => !die.staticPose).length
    status.value = 'preparing'
    if (soundEnabled.value && !reducedMotion.value) audio.unlock()
    clearDeadline()
    deadlineTimer = setTimeout(() => handleRollDeadline(rollId), DICE_ROLL_DEADLINE_MS)

    try {
      store.prepare(rollId, nextResults)
      workerClient ??= createWorkerClient()
      const response = await workerClient.simulate(request)
      if (disposed || rollId !== activeRollId.value || status.value !== 'preparing') return
      if (checkDeadline()) return
      if (response.type === 'failure') {
        completeAsTextFallback('物理骰盘本次未能稳定落骰，已使用公平文字结果。', rollId)
        return
      }
      presentation.value = { request, trajectory: response.trajectory }
      status.value = 'rolling'
    } catch (reason) {
      if (rollId !== activeRollId.value) return
      completeAsTextFallback(
        reason instanceof Error ? reason.message : '重掷失败，请稍后重试。',
        rollId,
      )
    }
  }

  function handlePlaybackComplete(rollId: string) {
    if (disposed || checkDeadline()) return
    if (activeRollId.value !== rollId || presentation.value?.request.id !== rollId || status.value !== 'rolling') return
    clearDeadline()
    store.publish(rollId)
    audio.stop()
    status.value = 'complete'
  }

  function setSkipAnimation(value: boolean) {
    if (isBusy.value) return
    skipAnimation.value = value
    presentation.value = undefined
    notice.value = ''
    if (value) audio.stop()
    else visualAvailable.value = true
  }

  function setSoundEnabled(value: boolean) {
    soundEnabled.value = value
    if (!value) audio.stop()
  }

  function handlePlaybackStarted(rollId: string, durationMs: number) {
    if (disposed || checkDeadline()) return
    if (disposed || rollId !== activeRollId.value || status.value !== 'rolling' || soundedRollId === rollId) return
    soundedRollId = rollId
    if (soundEnabled.value && !skipAnimation.value && !reducedMotion.value) {
      audio.play(durationMs, playbackPhysicalCount || physicalDiceCount.value)
    }
  }

  function handleRendererUnavailable() {
    visualAvailable.value = false
    if (status.value === 'rolling' || status.value === 'preparing') {
      if (activeRollId.value) workerClient?.cancel(activeRollId.value)
      completeAsTextFallback('当前设备无法显示 3D 骰子，已使用公平文字掷骰。', activeRollId.value)
    } else {
      notice.value = '当前设备无法显示 3D 骰子，投掷时将使用文字结果。'
    }
  }

  function updateReducedMotion(event: MediaQueryListEvent | MediaQueryList) {
    reducedMotion.value = event.matches
  }

  onMounted(() => {
    presets.value = DicePresetStorageService.loadDicePresets()
    document.addEventListener('visibilitychange', checkDeadline)
    if (!globalThis.matchMedia) return
    mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    updateReducedMotion(mediaQuery)
    mediaQuery.addEventListener('change', updateReducedMotion)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', checkDeadline)
    mediaQuery?.removeEventListener('change', updateReducedMotion)
    clearDeadline()
    disposed = true
    const rollId = activeRollId.value
    store.publish(rollId)
    if (rollId) workerClient?.cancel(rollId)
    workerClient?.terminate()
    audio.dispose()
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
    presets,
    presetFeedback,
    maxPresets: MAX_DICE_PRESETS,
    savePreset,
    applyPreset,
    deletePreset,
    physicalDiceCount,
    remainingPhysicalDice,
    expression,
    isBusy,
    canReroll,
    groupedResults,
    modifierInput,
    modifierError,
    appliedModifier,
    diceTotal,
    total,
    reducedMotion,
    skipAnimation,
    soundEnabled,
    setModifier,
    setSkipAnimation,
    setSoundEnabled,
    handlePlaybackStarted,
    canAdd,
    addDie,
    removeDie,
    clearPool,
    roll,
    reroll,
    handlePlaybackComplete,
    handleRendererUnavailable,
  }
}
