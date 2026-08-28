import { ref } from 'vue'

import { processAvatarImage, processPortraitImage, type ImageFocus } from '@/services/character-image'
import { CharacterMediaStorageService } from '@/services/character-media-storage'
import type { CharacterDraft, CharacterMedia } from '@/types/character'

export function useCharacterMediaEditing(
  draft: () => CharacterDraft,
  change: (media: CharacterMedia | undefined) => void,
) {
  const busy = ref(false)
  const error = ref('')

  async function replace(kind: 'avatar' | 'portrait', file: Blob, focus: ImageFocus): Promise<void> {
    busy.value = true
    error.value = ''
    let savedId: string | undefined
    try {
      const processed = kind === 'avatar'
        ? await processAvatarImage(file, focus)
        : await processPortraitImage(file, focus)
      savedId = await CharacterMediaStorageService.save(processed.blob)
      const current = draft().media
      const oldId = current?.[kind]?.mediaId
      const next = { ...current, [kind]: { ...processed.ref, mediaId: savedId } }
      change(next)
      if (oldId && oldId !== savedId) await CharacterMediaStorageService.remove(oldId).catch(() => undefined)
    } catch (reason) {
      if (savedId) await CharacterMediaStorageService.remove(savedId).catch(() => undefined)
      error.value = reason instanceof Error ? reason.message : '无法保存角色图片。'
    } finally {
      busy.value = false
    }
  }

  async function createAvatarFromPortrait(): Promise<void> {
    const portrait = draft().media?.portrait
    if (!portrait) return
    busy.value = true
    error.value = ''
    try {
      const blob = await CharacterMediaStorageService.load(portrait.mediaId)
      if (!blob) throw new Error('找不到当前立绘，请重新上传。')
      await replace('avatar', blob, { x: portrait.focusX, y: portrait.focusY })
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : '无法从立绘生成头像。'
      busy.value = false
    }
  }

  function updatePortraitFocus(focus: ImageFocus): void {
    const current = draft().media
    if (!current?.portrait) return
    change({
      ...current,
      portrait: { ...current.portrait, focusX: focus.x, focusY: focus.y },
    })
  }

  async function remove(kind: 'avatar' | 'portrait'): Promise<void> {
    const current = draft().media
    const removing = current?.[kind]
    if (!removing) return
    error.value = ''
    const next = { ...current, [kind]: undefined }
    change(next.avatar || next.portrait ? next : undefined)
    await CharacterMediaStorageService.remove(removing.mediaId).catch(() => {
      error.value = '图片已从角色卡移除，但本地文件清理失败。'
    })
  }

  return { busy, error, replace, createAvatarFromPortrait, updatePortraitFocus, remove } as const
}

