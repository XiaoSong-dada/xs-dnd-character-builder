import 'fake-indexeddb/auto'

import { Blob as NodeBlob } from 'node:buffer'
import { beforeEach, describe, expect, it } from 'vitest'

import { CharacterJsonService } from '@/services/character-json'
import { CharacterMediaStorageService } from '@/services/character-media-storage'
import { CharacterPackageService } from '@/services/character-package'
import type { CharacterDraft } from '@/types/character'

function draftWith(media?: CharacterDraft['media']): CharacterDraft {
  return CharacterJsonService.importDraft(JSON.stringify({
    schemaVersion: 7,
    id: 'package-character',
    ruleset: '5e-2014',
    name: '包内角色',
    baseAbilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    selections: [],
    media,
  }), { preserveMedia: true })
}

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

describe('完整角色包', () => {
  beforeEach(async () => {
    Object.defineProperty(globalThis, 'Blob', { value: NodeBlob, configurable: true })
    await resetDatabase()
  })

  it('头像与立绘可完整往返，并重建角色和媒体 ID', async () => {
    await CharacterMediaStorageService.save(new NodeBlob(['avatar'], { type: 'image/webp' }) as Blob, 'avatar-old')
    await CharacterMediaStorageService.save(new NodeBlob(['portrait'], { type: 'image/webp' }) as Blob, 'portrait-old')
    const draft = draftWith({
      avatar: { mediaId: 'avatar-old', mimeType: 'image/webp', width: 512, height: 512 },
      portrait: { mediaId: 'portrait-old', mimeType: 'image/webp', width: 800, height: 1200, focusX: 0.3, focusY: 0.2 },
    })

    const bytes = await CharacterPackageService.build(draft)
    const imported = await CharacterPackageService.import(new Blob([bytes as BlobPart], { type: 'application/zip' }))

    expect(imported.id).not.toBe(draft.id)
    expect(imported.media?.avatar?.mediaId).not.toBe('avatar-old')
    expect(imported.media?.portrait).toMatchObject({ focusX: 0.3, focusY: 0.2 })
    expect(await readText(await CharacterMediaStorageService.load(imported.media!.avatar!.mediaId))).toBe('avatar')
    expect(await readText(await CharacterMediaStorageService.load(imported.media!.portrait!.mediaId))).toBe('portrait')
  })

  it('无图片角色仍可往返', async () => {
    const draft = draftWith()
    const bytes = await CharacterPackageService.build(draft)
    const imported = await CharacterPackageService.import(new Blob([bytes as BlobPart], { type: 'application/zip' }))
    expect(imported.name).toBe('包内角色')
    expect(imported.media).toBeUndefined()
  })

  it('区分损坏 ZIP 与缺少 character.json', async () => {
    await expect(CharacterPackageService.import(new Blob(['bad'], { type: 'application/zip' }))).rejects.toThrow('ZIP')
    const { zipSync } = await import('fflate')
    await expect(CharacterPackageService.import(new Blob([zipSync({ 'other.txt': new Uint8Array([1]) }) as BlobPart], { type: 'application/zip' }))).rejects.toThrow('character.json')
  })
})
