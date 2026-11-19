import { computed, ref, shallowRef } from 'vue'

import { collectCharacterContent, listBundleEntries, mergeCharacterContent, previewCharacterContent } from '@/rules/custom-content-package'
import { CharacterPackageService, type ParsedCharacterPackage } from '@/services/character-package'
import { CustomContentStorageService } from '@/services/custom-content-storage'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { useCustomContentStore } from '@/stores/custom-content'
import type { CharacterDraft } from '@/types/character'
import type { CustomContentBundle } from '@/types/custom-content'

export interface CharacterPackageImportPreview {
  readonly open: boolean
  readonly canInstall: boolean
  readonly alreadyImported: boolean
  readonly items: ReturnType<typeof previewCharacterContent>
  readonly missing: readonly string[]
  readonly usePackaged: ReadonlySet<string>
  readonly busy: boolean
  readonly error: string
}

export function useCharacterPackageImport(onImported: (draft: CharacterDraft) => void, onError: (message: string) => void) {
  const drafts = useCharacterDraftsStore()
  const content = useCustomContentStore()
  const pending = shallowRef<ParsedCharacterPackage>()
  const incoming = shallowRef<CustomContentBundle>()
  const imported = shallowRef<CharacterDraft>()
  const usePackaged = ref<ReadonlySet<string>>(new Set())
  const busy = ref(false)
  const error = ref('')
  const items = computed(() => pending.value && incoming.value
    ? previewCharacterContent(content.bundleOf(pending.value.draft.ruleset), incoming.value) : [])
  const selectedIds = computed(() => new Set(items.value.filter((item) =>
    item.status === 'new' || (item.status === 'conflict' && usePackaged.value.has(item.id))).map((item) => item.id)))
  const missing = computed(() => {
    if (!pending.value) return []
    const draft = pending.value.draft
    const local = content.bundleOf(draft.ruleset)
    const merged = incoming.value ? mergeCharacterContent(local, incoming.value, selectedIds.value) : local
    return collectCharacterContent(draft, merged).missing
  })

  function clear(): void {
    pending.value = undefined
    incoming.value = undefined
    imported.value = undefined
    usePackaged.value = new Set()
    error.value = ''
  }

  function close(): void {
    if (!busy.value) clear()
  }

  function choose(id: string, replace: boolean): void {
    if (busy.value) return
    const next = new Set(usePackaged.value)
    if (replace) next.add(id)
    else next.delete(id)
    usePackaged.value = next
  }

  async function open(file: Blob): Promise<void> {
    if (busy.value || pending.value) return
    busy.value = true
    try {
      const parsed = await CharacterPackageService.inspect(file)
      if (parsed.customContent === undefined) {
        onImported(await drafts.importParsedPackage(parsed))
        return
      }
      pending.value = parsed
      try {
        const bundle = CustomContentStorageService.importCharacterContent(parsed.customContent, parsed.draft.ruleset)
        const reachable = collectCharacterContent(parsed.draft, bundle)
        if (reachable.count !== listBundleEntries(bundle).length || reachable.bundle.expansions.length !== bundle.expansions.length) {
          throw new Error('角色包包含此角色未引用的自定义内容。')
        }
        incoming.value = bundle
      } catch (cause) {
        error.value = cause instanceof Error ? cause.message : '角色包中的自定义内容无法读取。'
      }
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : '无法导入完整角色包。')
    } finally {
      busy.value = false
    }
  }

  async function confirm(withContent: boolean): Promise<void> {
    const parsed = pending.value
    const bundle = incoming.value
    if (!parsed || busy.value || (withContent && !bundle)) return
    busy.value = true
    error.value = ''
    const selection = selectedIds.value
    const before = items.value
    try {
      if (withContent && bundle && selection.size) {
        content.validateCharacterContent(parsed.draft.ruleset, bundle, selection)
      }
      imported.value ??= await drafts.importParsedPackage(parsed)
      if (withContent && bundle) {
        if (JSON.stringify(before) !== JSON.stringify(items.value)) {
          usePackaged.value = new Set()
          throw new Error('本机内容已变化，请重新核对冲突后再继续。')
        }
        content.applyCharacterContent(parsed.draft.ruleset, bundle, selection)
      }
      onImported(imported.value)
      clear()
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : '无法导入完整角色包。'
      if (imported.value) onImported(imported.value)
    } finally {
      busy.value = false
    }
  }

  const dialog = computed<CharacterPackageImportPreview>(() => ({
    open: Boolean(pending.value),
    canInstall: Boolean(incoming.value),
    alreadyImported: Boolean(imported.value),
    items: items.value,
    missing: missing.value,
    usePackaged: usePackaged.value,
    busy: busy.value,
    error: error.value,
  }))
  return { dialog, open, choose, close, confirm }
}
