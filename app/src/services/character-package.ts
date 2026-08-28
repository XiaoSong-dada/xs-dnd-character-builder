import type { CharacterDraft, CharacterMedia, CharacterMediaRef, CharacterPortraitRef } from '@/types/character'
import { CHARACTER_PACKAGE_MAX_SIZE, validateCharacterImage } from '@/services/character-image'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterMediaStorageService } from '@/services/character-media-storage'

const CHARACTER_FILE = 'character.json'
const AVATAR_FILE = 'media/avatar.webp'
const PORTRAIT_FILE = 'media/portrait.webp'

export class CharacterPackageError extends Error {}

function newId(prefix: string): string {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function mediaIds(media?: CharacterMedia): string[] {
  return [media?.avatar?.mediaId, media?.portrait?.mediaId].filter((id): id is string => Boolean(id))
}

async function loadPackagedMedia(ref: CharacterMediaRef | CharacterPortraitRef | undefined): Promise<Uint8Array | undefined> {
  if (!ref) return undefined
  const blob = await CharacterMediaStorageService.load(ref.mediaId)
  if (!blob) return undefined
  const arrayBuffer = (blob as Blob & { arrayBuffer?: () => Promise<ArrayBuffer> }).arrayBuffer
  if (arrayBuffer) return new Uint8Array(await arrayBuffer.call(blob))
  const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new CharacterPackageError('无法读取本地角色图片。'))
    reader.readAsArrayBuffer(blob)
  })
  return new Uint8Array(bytes)
}

export const CharacterPackageService = {
  async build(draft: CharacterDraft): Promise<Uint8Array> {
    const [{ strToU8, zipSync }, avatar, portrait] = await Promise.all([
      import('fflate'),
      loadPackagedMedia(draft.media?.avatar),
      loadPackagedMedia(draft.media?.portrait),
    ])
    const media: CharacterMedia | undefined = avatar || portrait
      ? {
          avatar: avatar ? draft.media?.avatar : undefined,
          portrait: portrait ? draft.media?.portrait : undefined,
        }
      : undefined
    const packagedDraft = { ...draft, media }
    const files: Record<string, Uint8Array> = {
      [CHARACTER_FILE]: strToU8(JSON.stringify(packagedDraft, null, 2)),
    }
    if (avatar) files[AVATAR_FILE] = avatar
    if (portrait) files[PORTRAIT_FILE] = portrait
    return zipSync(files, { level: 6 })
  },

  async import(file: Blob): Promise<CharacterDraft> {
    if (file.size > CHARACTER_PACKAGE_MAX_SIZE) throw new CharacterPackageError('完整角色包不能超过 25 MB。')
    let archive: Record<string, Uint8Array>
    try {
      const { unzipSync } = await import('fflate')
      archive = unzipSync(new Uint8Array(await file.arrayBuffer()))
    } catch {
      throw new CharacterPackageError('角色包已损坏或不是有效的 ZIP 文件。')
    }
    const totalSize = Object.values(archive).reduce((sum, bytes) => sum + bytes.byteLength, 0)
    if (totalSize > CHARACTER_PACKAGE_MAX_SIZE) throw new CharacterPackageError('角色包解压后的内容超过 25 MB。')
    const characterBytes = archive[CHARACTER_FILE]
    if (!characterBytes) throw new CharacterPackageError('角色包缺少 character.json。')
    const allowedFiles = new Set([CHARACTER_FILE, AVATAR_FILE, PORTRAIT_FILE])
    if (Object.keys(archive).some((path) => !allowedFiles.has(path))) throw new CharacterPackageError('角色包包含不受支持的文件。')

    let draft: CharacterDraft
    try {
      const { strFromU8 } = await import('fflate')
      draft = CharacterJsonService.importDraft(strFromU8(characterBytes), { preserveMedia: true })
    } catch (error) {
      throw error instanceof CharacterPackageError ? error : new CharacterPackageError(error instanceof Error ? error.message : '角色包中的角色数据无效。')
    }

    const avatarBytes = archive[AVATAR_FILE]
    const portraitBytes = archive[PORTRAIT_FILE]
    if (draft.media?.avatar && !avatarBytes) throw new CharacterPackageError('角色包缺少头像文件。')
    if (draft.media?.portrait && !portraitBytes) throw new CharacterPackageError('角色包缺少立绘文件。')
    if (!draft.media?.avatar && avatarBytes) throw new CharacterPackageError('角色包中的头像缺少元数据。')
    if (!draft.media?.portrait && portraitBytes) throw new CharacterPackageError('角色包中的立绘缺少元数据。')

    const savedIds: string[] = []
    try {
      let avatar: CharacterMediaRef | undefined
      let portrait: CharacterPortraitRef | undefined
      if (avatarBytes && draft.media?.avatar) {
        const blob = new Blob([avatarBytes as BlobPart], { type: 'image/webp' })
        validateCharacterImage(blob)
        const id = await CharacterMediaStorageService.save(blob)
        savedIds.push(id)
        avatar = { ...draft.media.avatar, mediaId: id }
      }
      if (portraitBytes && draft.media?.portrait) {
        const blob = new Blob([portraitBytes as BlobPart], { type: 'image/webp' })
        validateCharacterImage(blob)
        const id = await CharacterMediaStorageService.save(blob)
        savedIds.push(id)
        portrait = { ...draft.media.portrait, mediaId: id }
      }
      return {
        ...draft,
        id: newId('draft'),
        updatedAt: new Date().toISOString(),
        media: avatar || portrait ? { avatar, portrait } : undefined,
      }
    } catch (error) {
      await CharacterMediaStorageService.removeMany(savedIds).catch(() => undefined)
      throw new CharacterPackageError(error instanceof Error ? error.message : '无法保存角色包中的图片。')
    }
  },

  async download(draft: CharacterDraft): Promise<void> {
    const bytes = await this.build(draft)
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/zip' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${draft.name.trim() || 'dnd-character'}-${draft.id}.zip`
    link.click()
    URL.revokeObjectURL(url)
  },

  mediaIds,
}
