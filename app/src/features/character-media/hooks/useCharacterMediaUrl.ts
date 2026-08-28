import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

import { CharacterMediaStorageService } from '@/services/character-media-storage'

export function useCharacterMediaUrl(mediaId: Ref<string | undefined>) {
  const url = ref<string>()
  const failed = ref(false)
  let mounted = false
  let loadSequence = 0

  function release(): void {
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = undefined
  }

  function clear(): void {
    loadSequence += 1
    failed.value = true
    release()
  }

  async function load(): Promise<void> {
    const sequence = ++loadSequence
    release()
    failed.value = false
    if (!mounted || !mediaId.value) return
    try {
      const blob = await CharacterMediaStorageService.load(mediaId.value)
      if (sequence !== loadSequence || !mounted) return
      if (!blob) {
        failed.value = true
        return
      }
      url.value = URL.createObjectURL(blob)
    } catch {
      if (sequence === loadSequence) failed.value = true
    }
  }

  onMounted(() => {
    mounted = true
    void load()
  })
  watch(mediaId, () => void load())
  onBeforeUnmount(() => {
    mounted = false
    loadSequence += 1
    release()
  })

  return { url, failed, reload: load, clear } as const
}
