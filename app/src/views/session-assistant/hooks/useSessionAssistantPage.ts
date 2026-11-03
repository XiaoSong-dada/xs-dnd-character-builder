import { computed, ref } from 'vue'

import { describeMissingCustomContent } from '@/features/custom-content/missing-content'
import { CharacterImportError } from '@/services/character-json'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { useCustomContentStore } from '@/stores/custom-content'
import { useSessionAssistantStore } from '@/stores/session-assistant'
import type { CharacterDraft } from '@/types/character'

/** 跑团助手入口 hook：草稿列表、JSON 导入与角色选择/切换（列表视图 ⇄ 局内面板视图）。 */
export function useSessionAssistantPage() {
  const store = useCharacterDraftsStore()
  const viewStore = useSessionAssistantStore()
  const customContentStore = useCustomContentStore()
  const importError = ref('')
  /** 导入成功后：角色引用了本机不存在的自定义内容时的提示（R9）。 */
  const importNotice = ref('')

  const drafts = computed(() => store.drafts)
  const selectedDraft = computed(() => viewStore.selectedDraft)

  function missingNoticeOf(draft: CharacterDraft): string {
    return describeMissingCustomContent(draft, (id) => Boolean(customContentStore.findEntry(draft.ruleset, id))).message
  }

  function selectDraft(id: string): void {
    viewStore.selectDraft(id)
    importError.value = ''
    importNotice.value = ''
  }

  function backToList(): void {
    viewStore.clearSelectedDraft()
    importError.value = ''
    importNotice.value = ''
  }

  function importRaw(raw: string): void {
    try {
      importError.value = ''
      importNotice.value = ''
      const draft = store.importDraft(raw)
      importNotice.value = missingNoticeOf(draft)
      viewStore.selectDraft(draft.id)
    } catch (error) {
      importError.value = error instanceof CharacterImportError ? error.message : '无法导入角色文件。'
    }
  }

  async function readImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    if (file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip') {
      try {
        importError.value = ''
        importNotice.value = ''
        const draft = await store.importPackage(file)
        importNotice.value = missingNoticeOf(draft)
        viewStore.selectDraft(draft.id)
      } catch (error) {
        importError.value = error instanceof Error ? error.message : '无法导入完整角色包。'
      }
      return
    }
    importRaw(await file.text())
  }

  return {
    drafts,
    selectedDraft,
    selectDraft,
    backToList,
    importError,
    importNotice,
    readImportFile,
  } as const
}
