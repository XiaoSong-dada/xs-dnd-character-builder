import { computed, type Ref } from 'vue'

import {
  getAvailableSpells,
  getRequiredCantripCount,
  getRequiredSpellbookCount,
  getRequiredSpellCount,
  getSelectedSpellIds,
  getSelectedSpellbookReservationIds,
  getSpellbookExtraAllowance,
  listSpellcastingScopes,
  type SpellcastingScope,
} from '@/rules/spellcasting'
import type { CharacterDraft } from '@/types/character'
import type { SpellRule } from '@/types/rules'
import { useSelectionTaskFlow } from '@/views/character-builder/hooks/useSelectionTaskFlow'
import type { SelectionTask } from '@/views/character-builder/selection-task'

/** 一个施法职业自己的第 8 步数据（MC-D03）：计数、候选与可用性都按**该职业等级**取值。 */
export interface SpellcastingTaskScope {
  readonly scope: SpellcastingScope
  /** 该职业等级下可用的全部法术（含戏法）。 */
  readonly availableSpells: readonly SpellRule[]
  /** 该职业的 0 环候选。 */
  readonly cantripOptions: readonly SpellRule[]
  readonly requiredCantripCount: number
  readonly requiredSpellCount: number
  readonly requiredSpellbookCount: number
  readonly selectedSpellIds: readonly string[]
  readonly spellbookExtraIds: readonly string[]
  readonly spellbookReservedIds: readonly string[]
  readonly spellbookExtraAllowance: number
  readonly normalSpellbookCount: number
  readonly invalidCantripCount: number
  readonly invalidSpellbookCount: number
  readonly invalidSelectedCount: number
  readonly invalidSpellSelectionCount: number
  readonly cantripsComplete: boolean
  readonly spellbookComplete: boolean
  readonly spellsComplete: boolean
  readonly tasks: readonly SelectionTask[]
}

/**
 * 第 8 步按**职业作用域**生成的小任务、计数与自动推进状态（MC-D03）。
 *
 * 兼职角色每个施法职业各自制定已知／准备列表（需求 §2.8），因此：
 * - 数量与环级上限按该职业**自己的等级**取值；
 * - 候选池取该职业的法术列表（1/3 施法子职取子职表）；
 * - 任务 id 为 `<classId>:<kind>`（MC-E04），组件按后缀分派、按前缀定位作用域。
 *
 * 单职业草稿只有一个作用域，各项计数与改造前逐字段一致。
 */
export function useSpellcastingStepFlow(
  draft: Readonly<Ref<CharacterDraft>>,
  /** 任务标题元素；由 `SpellcastingStep` 的本地模板 ref 传入（见 `useSelectionTaskFlow`）。 */
  headingRef?: Ref<HTMLElement | undefined>,
) {
  const scopes = computed(() => listSpellcastingScopes(draft.value))

  const scopeData = computed<readonly SpellcastingTaskScope[]>(() => scopes.value.map((scope) => {
    const { config, selections, classLevel } = scope
    const availableSpells = getAvailableSpells(draft.value, config, scope)
    const requiredCantripCount = getRequiredCantripCount(draft.value, config, scope)
    const requiredSpellCount = getRequiredSpellCount(draft.value, config, scope)
    const requiredSpellbookCount = getRequiredSpellbookCount(draft.value, config, scope)
    const selectedSpellIds = getSelectedSpellIds(draft.value, config, scope)
    const spellbookExtraIds = selections.spellbookExtraSpellIds ?? []
    const spellbookReservedIds = [...new Set([
      ...(selections.spellbookReservedSpellIds ?? []),
      ...getSelectedSpellbookReservationIds(draft.value),
    ])]
    const spellbookExtraAllowance = getSpellbookExtraAllowance(draft.value, config, scope)
    const normalSpellbookCount = selections.spellbookSpellIds
      .filter((id) => !selections.transcribedSpellIds.includes(id)
        && (!spellbookExtraIds.includes(id) || spellbookReservedIds.includes(id))).length

    const availableIds = new Set(availableSpells.map((spell) => spell.id))
    const isCantrip = (id: string) => availableSpells.some((spell) => spell.id === id && spell.level === 0)
    const isLeveled = (id: string) => availableSpells.some((spell) => spell.id === id && spell.level > 0)
    const invalidCantripCount = selections.cantripIds.filter((id) => !isCantrip(id)).length
    const invalidSpellbookCount = selections.spellbookSpellIds.filter((id) => !isLeveled(id)).length
    const invalidSelectedCount = selectedSpellIds.filter((id) =>
      !isLeveled(id) || (config.mode === 'spellbook' && !selections.spellbookSpellIds.includes(id))).length
    const invalidSpellSelectionCount = new Set([
      ...selections.cantripIds.filter((id) => !isCantrip(id)),
      ...selections.spellbookSpellIds.filter((id) => !isLeveled(id)),
      ...selectedSpellIds.filter((id) => !isLeveled(id)
        || (config.mode === 'spellbook' && !selections.spellbookSpellIds.includes(id))),
    ]).size

    const cantripsComplete = selections.cantripIds.length === requiredCantripCount
      && selections.cantripIds.every((id) => availableIds.has(id))
    const spellbookComplete = normalSpellbookCount >= requiredSpellbookCount
      && selections.spellbookSpellIds.every((id) => availableIds.has(id))
    const spellsComplete = selectedSpellIds.length === requiredSpellCount
      && selectedSpellIds.every((id) => availableIds.has(id))
      && (config.mode !== 'spellbook' || selectedSpellIds.every((id) => selections.spellbookSpellIds.includes(id)))

    const scopePrefix = scope.classId ? `${scope.classId}:` : ''
    const tasks: SelectionTask[] = []
    if (classLevel >= config.startsAtLevel) {
      if (requiredCantripCount > 0) tasks.push({
        id: `${scopePrefix}cantrips`, label: `选择戏法 · ${scope.className}`, group: '施法', required: true,
        status: invalidCantripCount ? 'invalid' : cantripsComplete ? 'complete' : 'pending',
        summary: cantripsComplete ? '戏法已选齐' : '尚未选齐',
        progress: `${selections.cantripIds.length}/${requiredCantripCount}`,
      })
      if (config.mode === 'spellbook') tasks.push({
        id: `${scopePrefix}spellbook`, label: `写入法术书 · ${scope.className}`, group: '施法', required: true,
        status: invalidSpellbookCount ? 'invalid' : spellbookComplete ? 'complete' : 'pending',
        summary: spellbookComplete ? '升级法术已写入' : '尚未写满',
        progress: `${normalSpellbookCount}/${requiredSpellbookCount}`,
      })
      if (config.mode === 'spellbook' && spellbookExtraAllowance > 0) tasks.push({
        id: `${scopePrefix}spellbook-extra`, label: `子职额外入书 · ${scope.className}`, group: '施法', required: false,
        status: spellbookExtraIds.length ? 'complete' : 'optional',
        summary: spellbookExtraIds.length ? '已使用额外名额' : '可选',
        progress: `${spellbookExtraIds.length}/${spellbookExtraAllowance}`,
      })
      tasks.push({
        id: `${scopePrefix}spells`,
        label: `${config.mode === 'spellbook' ? '准备法术' : config.mode === 'prepared' ? '准备法术' : config.mode === 'pact' ? '掌握契约法术' : '掌握法术'} · ${scope.className}`,
        group: '施法', required: true,
        status: invalidSelectedCount ? 'invalid' : spellsComplete ? 'complete' : 'pending',
        summary: spellsComplete ? '法术已选齐' : '尚未选齐',
        progress: `${selectedSpellIds.length}/${requiredSpellCount}`,
      })
    }

    return {
      scope,
      availableSpells,
      cantripOptions: availableSpells.filter((spell) => spell.level === 0),
      requiredCantripCount,
      requiredSpellCount,
      requiredSpellbookCount,
      selectedSpellIds,
      spellbookExtraIds,
      spellbookReservedIds,
      spellbookExtraAllowance,
      normalSpellbookCount,
      invalidCantripCount,
      invalidSpellbookCount,
      invalidSelectedCount,
      invalidSpellSelectionCount,
      cantripsComplete,
      spellbookComplete,
      spellsComplete,
      tasks,
    }
  }))

  const tasks = computed(() => scopeData.value.flatMap((item) => item.tasks))
  // 兼职时多个职业各自成组，任务列表需按职业分组展示（D9：职业数不设上限）。
  const multiClass = computed(() => scopes.value.length > 1)
  const invalidSpellSelectionCount = computed(() =>
    scopeData.value.reduce((sum, item) => sum + item.invalidSpellSelectionCount, 0))

  const flow = useSelectionTaskFlow(tasks, headingRef)

  /** 当前任务所属的施法职业作用域；任务 id 形如 `<classId>:<kind>`，无前缀时退回首个作用域。 */
  const activeScopeData = computed(() => {
    const id = flow.activeTaskId.value ?? ''
    const classId = id.includes(':') ? id.slice(0, id.indexOf(':')) : ''
    return scopeData.value.find((item) => item.scope.classId === classId) ?? scopeData.value[0]
  })

  return {
    scopes,
    scopeData,
    multiClass,
    activeScopeData,
    tasks,
    flow,
    invalidSpellSelectionCount,
  }
}
