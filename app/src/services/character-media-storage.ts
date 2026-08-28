const DATABASE_NAME = 'dnd-character-builder-media'
const DATABASE_VERSION = 1
const STORE_NAME = 'media'

interface MediaRecord {
  readonly id: string
  readonly blob: Blob
  readonly createdAt: string
}

function mediaId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `media-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('当前浏览器不支持本地图片存储。'))
      return
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('无法打开本地图片存储。'))
  })
}

async function runRequest<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = action(transaction.objectStore(STORE_NAME))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('本地图片存储操作失败。'))
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => {
      database.close()
      reject(new Error('本地图片存储操作失败。'))
    }
  })
}

export const CharacterMediaStorageService = {
  async save(blob: Blob, requestedId = mediaId()): Promise<string> {
    const record: MediaRecord = { id: requestedId, blob, createdAt: new Date().toISOString() }
    await runRequest('readwrite', (store) => store.put(record))
    return requestedId
  },

  async load(id: string): Promise<Blob | undefined> {
    const record = await runRequest<MediaRecord | undefined>('readonly', (store) => store.get(id))
    return record?.blob
  },

  async remove(id: string): Promise<void> {
    await runRequest('readwrite', (store) => store.delete(id))
  },

  async removeMany(ids: readonly string[]): Promise<void> {
    await Promise.all([...new Set(ids)].map((id) => this.remove(id)))
  },
}

