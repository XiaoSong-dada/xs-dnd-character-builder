/**
 * 「自动检查更新」的周期设置与上次检查时间，两份记录分开放。
 *
 * 分开的原因：周期是**用户偏好**（换设备不需要跟过去，但同一设备要记住），
 * 上次检查时间是**本机运行记录**（只用来判断到期）。语义不同，损坏其中一个不该连累另一个。
 */

const PREFERENCE_STORAGE_KEY = 'dnd-character-builder:update-check-preference:v1'
const STATE_STORAGE_KEY = 'dnd-character-builder:update-check-state:v1'

export const UPDATE_CHECK_PREFERENCE_STORAGE_KEY = PREFERENCE_STORAGE_KEY
export const UPDATE_CHECK_STATE_STORAGE_KEY = STATE_STORAGE_KEY

/** 自动检查周期的默认值（天）。 */
export const DEFAULT_UPDATE_CHECK_INTERVAL_DAYS = 7

/** 周期允许范围（天）：下界是最密的「每天一次」，上界一年。 */
export const MIN_UPDATE_CHECK_INTERVAL_DAYS = 1
export const MAX_UPDATE_CHECK_INTERVAL_DAYS = 365

export const DAY_MS = 24 * 60 * 60 * 1000

interface PersistedPreference {
  readonly intervalDays: number
}

interface PersistedState {
  readonly checkedAt: number
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJson(key: string): Record<string, unknown> | undefined {
  if (!hasLocalStorage()) return undefined
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return undefined
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : undefined
  } catch {
    return undefined
  }
}

function writeJson(key: string, value: unknown): boolean {
  if (!hasLocalStorage()) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/** 校验周期天数：只接受 1—365 的整数。越界与小数都不算合法。 */
export function isValidUpdateCheckIntervalDays(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_UPDATE_CHECK_INTERVAL_DAYS &&
    value <= MAX_UPDATE_CHECK_INTERVAL_DAYS
  )
}

/**
 * 解析用户输入的天数。只认「纯数字」写法，小数、负数、越界、空白都返回 `undefined`，
 * 由调用方给出中文原因——这里不猜意图，也不静默取默认值（那会让玩家以为设置生效了）。
 */
export function parseUpdateCheckIntervalDays(input: string): number | undefined {
  const trimmed = input.trim()
  if (!/^\d+$/.test(trimmed)) return undefined
  const days = Number(trimmed)
  return isValidUpdateCheckIntervalDays(days) ? days : undefined
}

/**
 * 自动检查是否已到期：距上次**有结论**的检查已满一个周期。从未检查过视为到期。
 *
 * `checkedAt` 晚于当前时间（玩家改过系统时钟、或旧记录来自未来）时也视为到期：
 * 否则那个未来时间戳会把自动检查永久锁死，玩家再也收不到更新提示。
 */
export function isAutoCheckDue(checkedAt: number, intervalDays: number, now: number): boolean {
  if (checkedAt <= 0 || checkedAt > now) return true
  return now - checkedAt >= intervalDays * DAY_MS
}

export const UpdateCheckPreferenceService = {
  /** 读取周期设置；未设置或数据损坏时回落到默认 7 天。 */
  loadIntervalDays(): number {
    const days = readJson(PREFERENCE_STORAGE_KEY)?.intervalDays
    return isValidUpdateCheckIntervalDays(days) ? days : DEFAULT_UPDATE_CHECK_INTERVAL_DAYS
  },

  saveIntervalDays(days: number): boolean {
    if (!isValidUpdateCheckIntervalDays(days)) return false
    return writeJson(PREFERENCE_STORAGE_KEY, { intervalDays: days } satisfies PersistedPreference)
  },

  /** 上次**有结论**的检查时刻；从未检查过或数据损坏时为 0。 */
  loadCheckedAt(): number {
    const checkedAt = readJson(STATE_STORAGE_KEY)?.checkedAt
    return typeof checkedAt === 'number' && Number.isFinite(checkedAt) && checkedAt > 0 ? checkedAt : 0
  },

  /** 记录一次有结论的检查。写失败不影响本次会话的运行期取值。 */
  saveCheckedAt(timestamp: number): boolean {
    return writeJson(STATE_STORAGE_KEY, { checkedAt: timestamp } satisfies PersistedState)
  },
}
