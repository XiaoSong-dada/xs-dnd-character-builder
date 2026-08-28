import 'fake-indexeddb/auto'

import { Blob as NodeBlob } from 'node:buffer'
import { beforeEach, describe, expect, it } from 'vitest'

import { CharacterImageError, clampFocus, validateCharacterImage } from '@/services/character-image'
import { CharacterMediaStorageService } from '@/services/character-media-storage'

function resetDatabase(): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase('dnd-character-builder-media')
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
    request.onblocked = () => resolve()
  })
}

async function readText(blob: Blob | undefined): Promise<string | undefined> {
  if (!blob) return Promise.resolve(undefined)
  return new TextDecoder().decode(await (blob as Blob & { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer())
}

describe('角色媒体服务', () => {
  beforeEach(resetDatabase)

  it('保存、读取和删除 Blob', async () => {
    const id = await CharacterMediaStorageService.save(new NodeBlob(['avatar'], { type: 'image/webp' }) as Blob)
    expect(await readText(await CharacterMediaStorageService.load(id))).toBe('avatar')
    await CharacterMediaStorageService.remove(id)
    expect(await CharacterMediaStorageService.load(id)).toBeUndefined()
  })

  it('批量删除会去重', async () => {
    const first = await CharacterMediaStorageService.save(new NodeBlob(['a'], { type: 'image/webp' }) as Blob)
    const second = await CharacterMediaStorageService.save(new NodeBlob(['b'], { type: 'image/webp' }) as Blob)
    await CharacterMediaStorageService.removeMany([first, second, first])
    expect(await CharacterMediaStorageService.load(first)).toBeUndefined()
    expect(await CharacterMediaStorageService.load(second)).toBeUndefined()
  })
})

describe('角色图片输入校验', () => {
  it('焦点钳制在 0—1', () => {
    expect(clampFocus(-2)).toBe(0)
    expect(clampFocus(0.35)).toBe(0.35)
    expect(clampFocus(2)).toBe(1)
    expect(clampFocus(Number.NaN)).toBe(0.5)
  })

  it('拒绝 SVG、空文件和超过 10MB 的图片', () => {
    expect(() => validateCharacterImage(new Blob(['<svg/>'], { type: 'image/svg+xml' }))).toThrow(CharacterImageError)
    expect(() => validateCharacterImage(new Blob([], { type: 'image/png' }))).toThrow('图片文件为空')
    expect(() => validateCharacterImage(new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], { type: 'image/png' }))).toThrow('10 MB')
  })
})
