/** 持久化存储提权结果。 */
export type PersistentStorageOutcome = 'unsupported' | 'granted' | 'denied' | 'failed'

/** 浏览器运行环境；显式注入以便测试（同 `src/services/umami.ts` 的做法）。 */
export interface PersistentStorageRuntime {
  readonly storage: StorageManager
}

function browserRuntime(): PersistentStorageRuntime | undefined {
  if (typeof navigator === 'undefined') return undefined
  const storage = navigator.storage
  if (!storage) return undefined
  return { storage }
}

/**
 * 申请持久化存储。
 *
 * 默认情况下 localStorage 与 IndexedDB 属于「尽力而为」型存储，磁盘紧张时浏览器可以清理，
 * 玩家的角色草稿与头像立绘会一起消失。授予 persistent 权限后不会被自动清理。
 *
 * 浏览器只在满足条件时授予（通常是已安装为 PWA、被收藏或达到一定使用度），
 * 因此拒绝是正常结果，不需要向用户报错；调用时机也应当挑选用户明确表达离线意图的动作。
 */
export async function requestPersistentStorage(
  runtime: PersistentStorageRuntime | undefined = browserRuntime(),
): Promise<PersistentStorageOutcome> {
  const storage = runtime?.storage
  if (!storage || typeof storage.persist !== 'function') return 'unsupported'
  try {
    if (typeof storage.persisted === 'function' && await storage.persisted()) return 'granted'
    return await storage.persist() ? 'granted' : 'denied'
  } catch {
    return 'failed'
  }
}

/** 读取当前持久化状态，用于在界面上说明「本地数据是否受保护」。 */
export async function isStoragePersisted(
  runtime: PersistentStorageRuntime | undefined = browserRuntime(),
): Promise<boolean> {
  const storage = runtime?.storage
  if (!storage || typeof storage.persisted !== 'function') return false
  try {
    return await storage.persisted()
  } catch {
    return false
  }
}
