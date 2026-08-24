import { computed, ref } from 'vue'

import { CharacterImportError } from '@/services/character-json'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { useSessionAssistantStore } from '@/stores/session-assistant'

/** 跑团助手入口 hook：草稿列表、JSON 导入与角色选择/切换（列表视图 ⇄ 局内面板视图）。 */
export function useSessionAssistantPage() {
  const store = useCharacterDraftsStore()
  const viewStore = useSessionAssistantStore()
  const importError = ref('')

  const drafts = computed(() => store.drafts)
  const selectedDraft = computed(() => viewStore.selectedDraft)

  function selectDraft(id: string): void {
    viewStore.selectDraft(id)
    importError.value = ''
  }

  function backToList(): void {
    viewStore.clearSelectedDraft()
    importError.value = ''
  }

  function importRaw(raw: string): void {
    try {
      importError.value = ''
      const draft = store.importDraft(raw)
      viewStore.selectDraft(draft.id)
    } catch (error) {
      importError.value = error instanceof CharacterImportError ? error.message : '无法导入角色文件。'
    }
  }

  function readImportFile(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    void file.text().then(importRaw)
  }

  return {
    drafts,
    selectedDraft,
    selectDraft,
    backToList,
    importError,
    readImportFile,
  } as const
}
