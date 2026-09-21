import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { APP_BUILD_ID_DIRTY_MARKER, appBuildId, appBuildIdDirty } from '@/config/setting'
import type { AppUpdateCheckOutcome } from '@/services/app-build-id'
import {
  DAY_MS,
  MAX_UPDATE_CHECK_INTERVAL_DAYS,
  MIN_UPDATE_CHECK_INTERVAL_DAYS,
  parseUpdateCheckIntervalDays,
} from '@/services/update-check-preference'
import { useAppUpdateStore } from '@/stores/app-update'

/** 手动检查结论对应的中文说明；`idle` 表示还没查过，不显示任何反馈。 */
const CHECK_FEEDBACK: Record<AppUpdateCheckOutcome, string> = {
  'up-to-date': '已是最新构建。',
  'update-available': '发现新构建，顶部提示条已就绪。',
  unavailable: '暂时无法检查：可能处于离线状态，或服务端没有提供构建清单。',
}

/** 周期非法时的中文原因：说清允许范围，不用「校验失败」这类开发用语。 */
const INTERVAL_ERROR = `请输入 ${MIN_UPDATE_CHECK_INTERVAL_DAYS}—${MAX_UPDATE_CHECK_INTERVAL_DAYS} 之间的整数天数。`

const INTERVAL_SAVE_ERROR = '这次设置没能存到本机，本次访问仍按新周期运行，刷新后会恢复原值。'

/**
 * 「关于本站」的构建版本区块：展示本次构建的 git 标识，给出手动对账入口，
 * 并允许调整自动检查周期。
 *
 * 与 `useAboutPage` 的 `currentVersion` 不是一回事：那是给人看的对外版本号（package.json），
 * 这里是给机器对账的构建指纹（见 `scripts/app-build-id.ts`）。
 */
export function useAppVersion() {
  const store = useAppUpdateStore()
  const { updateAvailable, buildIdMismatch, checking, applying, lastCheck, intervalDays, checkedAt } =
    storeToRefs(store)

  /** 界面只展示 commit 短 hash，脏标记单独用文案说明。 */
  const commit = appBuildId.split(APP_BUILD_ID_DIRTY_MARKER)[0] ?? appBuildId
  const dirty = appBuildIdDirty
  const feedback = computed(() => (lastCheck.value === 'idle' ? '' : CHECK_FEEDBACK[lastCheck.value]))

  /** 周期输入的问题说明；空串表示没有错误。 */
  const intervalError = ref('')

  /**
   * 上次检查距今多久；只做整天的粗粒度描述，不显示具体时刻。
   * 玩家据此判断周期是不是在起作用——只给一个输入框，他无从验证设置生效了没有。
   */
  const intervalHint = computed(() => {
    const at = checkedAt.value
    if (at <= 0) return '上次检查：还没有成功检查过。'
    const days = Math.floor((Date.now() - at) / DAY_MS)
    return days <= 0 ? '上次检查：今天。' : `上次检查：${days} 天前。`
  })

  /**
   * 保存周期。非法输入只给错误说明、不静默改回原值——改回去了玩家会以为设置生效了。
   * 写盘失败（隐私模式、配额已满）同样明说，不让「看起来保存成功」蒙混过去。
   * 草稿值由输入框自己持有，这里只负责校验与落盘。
   */
  function saveInterval(raw: string): void {
    const days = parseUpdateCheckIntervalDays(raw)
    if (days === undefined) {
      intervalError.value = INTERVAL_ERROR
      return
    }
    intervalError.value = store.setIntervalDays(days) ? '' : INTERVAL_SAVE_ERROR
  }

  return {
    commit,
    dirty,
    updateAvailable,
    buildIdMismatch,
    checking,
    applying,
    feedback,
    check: store.checkNow,
    intervalDays,
    intervalError,
    intervalHint,
    intervalMin: MIN_UPDATE_CHECK_INTERVAL_DAYS,
    intervalMax: MAX_UPDATE_CHECK_INTERVAL_DAYS,
    saveInterval,
  }
}
