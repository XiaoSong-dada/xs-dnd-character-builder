import { nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'

import { loadDraftSummaries, loadLegacyDrafts } from '@/services/draft-records'
import { resolveInitialRuleset } from '@/services/ruleset-preference'

type EditorComponent = typeof import('@/views/character-builder/components/CharacterBuilderEditor.vue')['default']
type Editor = InstanceType<EditorComponent>
type EditorAction = (editor: Editor) => void | Promise<void>

export function useCharacterBuilderLanding() {
  const route = useRoute()
  const drafts = ref<ReturnType<typeof loadDraftSummaries>>([])
  const legacyDrafts = ref<ReturnType<typeof loadLegacyDrafts>>([])
  const defaultRuleset = ref<ReturnType<typeof resolveInitialRuleset>['ruleset']>('5e-2014')
  const Editor = shallowRef<EditorComponent>()
  const editor = shallowRef<Editor>()
  const loading = ref(false)
  const loadError = ref('')
  let pendingAction: EditorAction | undefined

  async function openEditor(action?: EditorAction): Promise<void> {
    if (loading.value || Editor.value) return
    pendingAction = action ?? pendingAction
    loading.value = true
    loadError.value = ''
    try {
      const module = await import('@/views/character-builder/components/CharacterBuilderEditor.vue')
      Editor.value = module.default
      await nextTick()
      if (editor.value && pendingAction) await pendingAction(editor.value)
      pendingAction = undefined
    } catch {
      Editor.value = undefined
      loadError.value = '请检查网络后重试。如果仍无法加载，请刷新页面。'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    drafts.value = loadDraftSummaries()
    legacyDrafts.value = loadLegacyDrafts()
    defaultRuleset.value = resolveInitialRuleset().ruleset
    watch(
      () => [route.query.draft, route.query.enableSource],
      ([draft, source]) => {
        if (typeof draft === 'string' || typeof source === 'string') void openEditor()
      },
      { immediate: true },
    )
  })

  return { drafts, legacyDrafts, defaultRuleset, Editor, editor, loading, loadError, openEditor }
}
