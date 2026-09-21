import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { checkRemoteBuildId, type AppUpdateCheckOutcome } from '@/services/app-build-id'
import { applyServiceWorkerUpdate, hasWaitingUpdate, registerServiceWorker } from '@/services/service-worker'
import {
  isAutoCheckDue,
  isValidUpdateCheckIntervalDays,
  UpdateCheckPreferenceService,
} from '@/services/update-check-preference'
import { watchUpdateTriggers } from '@/services/update-watch'

/** 「关于本站」手动检查后要展示的结论；`idle` 表示还没查过。 */
export type UpdateCheckState = 'idle' | AppUpdateCheckOutcome

/**
 * 更新状态：**以构建标识对账为主判据**，等待中的 Service Worker 为兜底信号。
 *
 * 主判据之所以用构建标识而不是 Service Worker 信号：后者只能告诉你「sw.js 字节变了」，
 * 无法回答「现在部署的是哪个提交」，也就无法区分「新提交」与「同一提交的脏构建」。
 *
 * 检查分两类：
 * - **自动检查**（`checkAuto`）：启动、恢复联网、页面重新可见时触发，受「自动检查周期」约束，
 *   距上次**有结论**的检查不满一个周期就跳过。周期由玩家在「关于本站」设置，默认 7 天。
 * - **手动检查**（`checkNow`）：玩家点按钮，永远立即查，不受周期限制。
 *
 * 周期只对「有结论」的结果计时：离线导致的 `unavailable` 不写入检查时间，
 * 否则「打开时断网、之后才连上」这个最需要立刻对账的场景会被周期挡掉。
 *
 * 检测到新版本不会自动刷新页面——玩家可能正停在车卡第 7 步填物品，
 * 因此这里只把状态置为可更新，由 `AppUpdatePrompt` 出非阻断提示，用户点了才切换。
 */
export const useAppUpdateStore = defineStore('app-update', () => {
  const initialized = ref(false)
  /** 远端构建标识与本机不同：主信号。 */
  const buildIdMismatch = ref(false)
  /** 有等待激活的新外壳：兜底信号，覆盖「构建标识相同但 sw.js 字节变了」。 */
  const waitingShell = ref(false)
  const checking = ref(false)
  /** 已经发出切换指令，正在等待浏览器接管并刷新；此时按钮转为进行中。 */
  const applying = ref(false)
  const lastCheck = ref<UpdateCheckState>('idle')
  /** 自动检查周期（天）；来自本设备设置，默认 7 天。 */
  const intervalDays = ref(UpdateCheckPreferenceService.loadIntervalDays())
  /** 上次**有结论**的检查时刻；0 表示从未检查过。 */
  const checkedAt = ref(UpdateCheckPreferenceService.loadCheckedAt())

  const updateAvailable = computed(() => buildIdMismatch.value || waitingShell.value)

  let inFlight: Promise<AppUpdateCheckOutcome> | undefined

  async function initialize(): Promise<void> {
    if (initialized.value) return
    initialized.value = true

    // 并行推进：外壳注册负责离线能力与兜底信号，构建标识对账是主判据。
    // 两者互不阻塞——对账失败（离线）也要完成外壳注册。
    const registration = registerServiceWorker(() => {
      waitingShell.value = true
    })

    // 启动那一次只覆盖「打开页面」这一刻，页面常驻期间靠这两个时机补上。
    // 监听常驻页面生命周期，`initialized` 守卫保证只登记一次，因此不保留解绑句柄。
    watchUpdateTriggers(() => {
      void checkAuto()
    })

    await Promise.all([registration, checkAuto()])
  }

  /** 自动检查是否到期。周期与上次检查时间都随设置与检查结果实时变化。 */
  function shouldAutoCheck(): boolean {
    return isAutoCheckDue(checkedAt.value, intervalDays.value, Date.now())
  }

  /**
   * 自动检查（启动、恢复联网、页面重新可见）。没到期就直接跳过，
   * 避免每次打开页面都打一次请求——周期默认 7 天。
   *
   * 返回 `undefined` 表示本次被周期挡下，没有发起请求。
   */
  function checkAuto(): Promise<AppUpdateCheckOutcome | undefined> {
    if (!shouldAutoCheck()) return Promise.resolve(undefined)
    return checkNow()
  }

  /**
   * 主动对账一次。返回本次结论，供「关于本站」的手动检查直接展示。
   * 并发调用共享同一个进行中的请求，避免后到者拿到一个无意义的结论。
   * 不受自动检查周期限制：用户点按钮就是要立刻看到结果。
   */
  function checkNow(): Promise<AppUpdateCheckOutcome> {
    const task =
      inFlight ??
      (async () => {
        checking.value = true
        try {
          const outcome = await checkRemoteBuildId()
          lastCheck.value = outcome
          if (outcome !== 'unavailable') {
            // 只有拿到结论才记账，两种检查一视同仁：手动查过也算刚查过。
            checkedAt.value = Date.now()
            UpdateCheckPreferenceService.saveCheckedAt(checkedAt.value)
          }
          if (outcome === 'update-available') buildIdMismatch.value = true
          // 对账结论不影响兜底信号：外壳确实还没换就仍然算可更新。
          if (hasWaitingUpdate()) waitingShell.value = true
          return outcome
        } finally {
          checking.value = false
          inFlight = undefined
        }
      })()

    inFlight = task
    return task
  }

  /**
   * 设置自动检查周期（天）。只接受通过 `isValidUpdateCheckIntervalDays` 的值，
   * 非法值原样拒绝、不改动当前设置；写盘失败（隐私模式等）返回 false，
   * 但本次会话仍按新周期运行，不把设置悄悄退回旧值。
   */
  function setIntervalDays(days: number): boolean {
    if (!isValidUpdateCheckIntervalDays(days)) return false
    intervalDays.value = days
    return UpdateCheckPreferenceService.saveIntervalDays(days)
  }

  async function applyUpdate(): Promise<void> {
    if (applying.value || !updateAvailable.value) return
    applying.value = true
    try {
      await applyServiceWorkerUpdate()
    } finally {
      applying.value = false
    }
  }

  return {
    initialized,
    buildIdMismatch,
    waitingShell,
    updateAvailable,
    checking,
    applying,
    lastCheck,
    intervalDays,
    checkedAt,
    initialize,
    shouldAutoCheck,
    checkAuto,
    checkNow,
    setIntervalDays,
    applyUpdate,
  }
})
