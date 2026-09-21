import { computed, type Ref } from 'vue'

import {
  getAvailableSpells,
  getRequiredCantripCount,
  getRequiredSpellbookCount,
  getRequiredSpellCount,
  getSelectedSpellIds,
  getSpellbookExtraAllowance,
  getSpellcastingConfig,
} from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'
import { useSelectionTaskFlow } from '@/views/character-builder/hooks/useSelectionTaskFlow'
import type { SelectionTask } from '@/views/character-builder/selection-task'

/** 第 8 步按职业施法模式生成的小任务、计数与自动推进状态。 */
export function useSpellcastingStepFlow(draft: Readonly<Ref<CharacterDraft>>) {
  const config = computed(() => getSpellcastingConfig(draft.value))
  const availableSpells = computed(() => config.value ? getAvailableSpells(draft.value, config.value) : [])
  const requiredCantripCount = computed(() => config.value ? getRequiredCantripCount(draft.value, config.value) : 0)
  const requiredSpellCount = computed(() => config.value ? getRequiredSpellCount(draft.value, config.value) : 0)
  const requiredSpellbookCount = computed(() => config.value ? getRequiredSpellbookCount(draft.value, config.value) : 0)
  const selectedSpellIds = computed(() => config.value ? getSelectedSpellIds(draft.value, config.value) : [])
  const spellbookExtraIds = computed(() => draft.value.spellSelections.spellbookExtraSpellIds ?? [])
  const spellbookExtraAllowance = computed(() => config.value ? getSpellbookExtraAllowance(draft.value, config.value) : 0)
  const normalSpellbookCount = computed(() => draft.value.spellSelections.spellbookSpellIds
    .filter((id) => !draft.value.spellSelections.transcribedSpellIds.includes(id) && !spellbookExtraIds.value.includes(id)).length)

  const availableIds = computed(() => new Set(availableSpells.value.map((spell) => spell.id)))
  const invalidCantripCount = computed(() => draft.value.spellSelections.cantripIds.filter((id) => !availableSpells.value.some((spell) => spell.id === id && spell.level === 0)).length)
  const invalidSpellbookCount = computed(() => draft.value.spellSelections.spellbookSpellIds.filter((id) => !availableSpells.value.some((spell) => spell.id === id && spell.level > 0)).length)
  const invalidSelectedCount = computed(() => selectedSpellIds.value.filter((id) =>
    !availableSpells.value.some((spell) => spell.id === id && spell.level > 0)
    || (config.value?.mode === 'spellbook' && !draft.value.spellSelections.spellbookSpellIds.includes(id)),
  ).length)
  const invalidSpellSelectionCount = computed(() => new Set([
    ...draft.value.spellSelections.cantripIds.filter((id) => !availableSpells.value.some((spell) => spell.id === id && spell.level === 0)),
    ...draft.value.spellSelections.spellbookSpellIds.filter((id) => !availableSpells.value.some((spell) => spell.id === id && spell.level > 0)),
    ...selectedSpellIds.value.filter((id) => !availableSpells.value.some((spell) => spell.id === id && spell.level > 0)
      || (config.value?.mode === 'spellbook' && !draft.value.spellSelections.spellbookSpellIds.includes(id))),
  ]).size)
  const cantripsComplete = computed(() => draft.value.spellSelections.cantripIds.length === requiredCantripCount.value
    && draft.value.spellSelections.cantripIds.every((id) => availableIds.value.has(id)))
  const spellbookComplete = computed(() => normalSpellbookCount.value >= requiredSpellbookCount.value
    && draft.value.spellSelections.spellbookSpellIds.every((id) => availableIds.value.has(id)))
  const spellsComplete = computed(() => selectedSpellIds.value.length === requiredSpellCount.value
    && selectedSpellIds.value.every((id) => availableIds.value.has(id))
    && (config.value?.mode !== 'spellbook' || selectedSpellIds.value.every((id) => draft.value.spellSelections.spellbookSpellIds.includes(id))))

  const tasks = computed<readonly SelectionTask[]>(() => {
    const current = config.value
    if (!current || draft.value.targetLevel < current.startsAtLevel) return []
    const result: SelectionTask[] = []
    if (requiredCantripCount.value > 0) result.push({
      id: 'cantrips', label: '选择戏法', group: '施法', required: true,
      status: invalidCantripCount.value ? 'invalid' : cantripsComplete.value ? 'complete' : 'pending',
      summary: cantripsComplete.value ? '戏法已选齐' : '尚未选齐',
      progress: `${draft.value.spellSelections.cantripIds.length}/${requiredCantripCount.value}`,
    })
    if (current.mode === 'spellbook') result.push({
      id: 'spellbook', label: '写入法术书', group: '施法', required: true,
      status: invalidSpellbookCount.value ? 'invalid' : spellbookComplete.value ? 'complete' : 'pending',
      summary: spellbookComplete.value ? '升级法术已写入' : '尚未写满',
      progress: `${normalSpellbookCount.value}/${requiredSpellbookCount.value}`,
    })
    if (current.mode === 'spellbook' && spellbookExtraAllowance.value > 0) result.push({
      id: 'spellbook-extra', label: '子职额外入书', group: '施法', required: false,
      status: spellbookExtraIds.value.length ? 'complete' : 'optional',
      summary: spellbookExtraIds.value.length ? '已使用额外名额' : '可选',
      progress: `${spellbookExtraIds.value.length}/${spellbookExtraAllowance.value}`,
    })
    result.push({
      id: 'spells', label: current.mode === 'spellbook' ? '准备法术' : current.mode === 'prepared' ? '准备法术' : current.mode === 'pact' ? '掌握契约法术' : '掌握法术',
      group: '施法', required: true, status: invalidSelectedCount.value ? 'invalid' : spellsComplete.value ? 'complete' : 'pending',
      summary: spellsComplete.value ? '法术已选齐' : '尚未选齐', progress: `${selectedSpellIds.value.length}/${requiredSpellCount.value}`,
    })
    return result
  })

  const flow = useSelectionTaskFlow(tasks)
  return {
    config, availableSpells, requiredCantripCount, requiredSpellCount, requiredSpellbookCount,
    selectedSpellIds, spellbookExtraIds, spellbookExtraAllowance, normalSpellbookCount,
    invalidCantripCount, invalidSpellbookCount, invalidSelectedCount, invalidSpellSelectionCount, tasks, flow,
  }
}
