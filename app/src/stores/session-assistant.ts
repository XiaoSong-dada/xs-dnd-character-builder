import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { useCharacterDraftsStore } from '@/stores/character-drafts'

const STORAGE_KEY = 'dnd-session-assistant:view:v1'

interface PersistedView {
  readonly selectedDraftId?: string
  readonly activeTab: string
}

const DEFAULT_TAB = 'overview'

function readPersisted(): PersistedView {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { activeTab: DEFAULT_TAB }
    const parsed = JSON.parse(raw) as Partial<PersistedView>
    return {
      selectedDraftId: typeof parsed.selectedDraftId === 'string' ? parsed.selectedDraftId : undefined,
      activeTab: typeof parsed.activeTab === 'string' ? parsed.activeTab : DEFAULT_TAB,
    }
  } catch {
    return { activeTab: DEFAULT_TAB }
  }
}

/** 跑团助手视图状态：选中角色与当前页签，切页（pinia）与刷新（localStorage）均保持。 */
export const useSessionAssistantStore = defineStore('session-assistant', () => {
  const draftsStore = useCharacterDraftsStore()
  const persisted = readPersisted()
  // 持久化的角色仍存在才恢复；角色已删除时回退列表。
  const selectedDraftId = ref<string | undefined>(
    persisted.selectedDraftId && draftsStore.drafts.some((draft) => draft.id === persisted.selectedDraftId)
      ? persisted.selectedDraftId
      : undefined,
  )
  const activeTab = ref(persisted.activeTab)

  const selectedDraft = computed(() =>
    selectedDraftId.value
      ? draftsStore.drafts.find((draft) => draft.id === selectedDraftId.value)
      : undefined,
  )

  watch([selectedDraftId, activeTab], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      selectedDraftId: selectedDraftId.value,
      activeTab: activeTab.value,
    }))
  })

  function selectDraft(id: string): void {
    selectedDraftId.value = id
  }

  function clearSelectedDraft(): void {
    selectedDraftId.value = undefined
    activeTab.value = DEFAULT_TAB
  }

  function setActiveTab(tab: string): void {
    activeTab.value = tab
  }

  return {
    selectedDraftId,
    selectedDraft,
    activeTab,
    selectDraft,
    clearSelectedDraft,
    setActiveTab,
  }
})
