import { computed, ref, type Ref } from 'vue'
import { previewLineageTransformation } from '@/rules/lineage-transformation'
import { getRulesRepository } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'
import { getSpeciesLegacyCandidates } from '@/rules/species-legacy'
import type { CharacterDraft } from '@/types/character'

export function useLineageTransformation(draft: Readonly<Ref<CharacterDraft | undefined>>, update: (patch: Partial<Omit<CharacterDraft, 'id' | 'schemaVersion' | 'ruleset' | 'createdAt'>>) => void) {
  const open = ref(false)
  const target = ref('')
  const retained = ref<readonly string[]>([])
  const repository = computed(() => getRulesRepository(draft.value?.ruleset ?? '5e-2014'))
  const targets = computed(() => draft.value?.ruleset === '5e-2014' ? repository.value.races.filter((race) => race.lineage && race.id !== draft.value?.raceId && isSourceEnabled(race.sourceIds, draft.value?.enabledSourceIds, repository.value)) : [])
  const candidates = computed(() => draft.value ? getSpeciesLegacyCandidates(draft.value, repository.value) : [])
  const result = computed(() => {
    if (!draft.value || !target.value) return { preview: undefined, error: open.value ? '请先启用鸦阁魔域指南来源，并选择可转化的血统。' : '' }
    try { return { preview: previewLineageTransformation(draft.value, target.value, retained.value, new Date().toISOString()), error: '' } }
    catch (error) { return { preview: undefined, error: error instanceof Error ? error.message : '无法转化血统。' } }
  })
  function start(): void { target.value = targets.value[0]?.id ?? ''; retained.value = []; open.value = true }
  function close(): void { open.value = false }
  function toggle(key: string): void { retained.value = retained.value.includes(key) ? retained.value.filter((id) => id !== key) : [...retained.value, key] }
  function confirm(): void {
    if (!open.value) return
    const preview = result.value.preview
    if (!preview) return
    update(preview.draft)
    close()
  }
  return { open, target, retained, targets, candidates, result, start, close, toggle, confirm }
}
