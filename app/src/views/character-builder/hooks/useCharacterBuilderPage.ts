import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import { deriveCharacter, getFlexibleBonusGroups, getFlexibleBonusRule, getRaceAbilityBonuses } from '@/rules/derive'
import { getBackgroundAbilityBonuses, getOriginStepBlockers, isOriginStepComplete } from '@/rules/origins'
import { getRulesRepository } from '@/rules/repositories'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { areBaseAbilitiesValid, areOriginAbilitiesWithinCap, clampDestinyCount, rollAbilityScoreSets, STANDARD_ARRAY_DEFAULT } from '@/rules/abilities'
import { getDependencyImpact, type DraftChange } from '@/rules/dependency'
import { hasBuildChoices } from '@/rules/draft-progress'
import { isSourceEnabled, normalizeEnabledSourceIds } from '@/rules/source-books'
import { buildTimelineForDraft } from '@/rules/timeline'
import { applySpellbookReservationSelection, isSpellbookReservationCheckpoint, validateSpellSelections } from '@/rules/spellcasting'
import {
  deleteInactiveSpellSelection,
  reconcileSpellSelections,
  restoreInactiveSpellSelection,
} from '@/rules/spell-selection-reconciliation'
import { getClassEntries, getPrimaryClassId } from '@/rules/multiclass'
import { buildStartingEquipmentState, isStartingEquipmentComplete } from '@/rules/starting-equipment'
import { STEP_META, STEP_ORDER } from '@/views/character-builder/steps'
import { useLineageTransformation } from '@/views/character-builder/hooks/useLineageTransformation'
import { CharacterImportError, CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { RulesetPreferenceService, resolveInitialRuleset } from '@/services/ruleset-preference'
import { randomIntegerInclusive, secureUint32 } from '@/services/dice-random'
import { downloadXlsx, fillTemplate, loadCharacterSheetTemplate } from '@/services/export-xlsx'
import { buildCharacterSheetPdf, downloadPdf } from '@/services/export-pdf'
import { buildCharacterExportModel, type ExportDiagnostic } from '@/features/character-export/build-export-data'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import type {
  AbilityKey,
  AbilityMethod,
  AbilityScores,
  CharacterDraft,
  CharacterManualEdits,
  CurrencyWallet,
  DependencyImpact,
  DraftStep,
  InventoryEntry,
  InfusionAssignment,
  RulesetId,
  SpellSelections,
  StartingEquipmentSelection,
} from '@/types/character'

function isDraftStep(value: unknown): value is DraftStep {
  return typeof value === 'string' && STEP_ORDER.includes(value as DraftStep)
}

export function useCharacterBuilderPage() {
  const route = useRoute()
  const router = useRouter()
  const store = useCharacterDraftsStore()
  const { drafts, legacyDrafts, activeDraft, derivedSummary, validationIssues, completion } = storeToRefs(store)
  const lineageTransformation = useLineageTransformation(activeDraft, store.updateDraft)
  const importError = ref('')
  /** 新建默认版本（按本设备偏好解析，B00-02）；起点页 hero 与第一页共用。 */
  const defaultRuleset = ref<RulesetId>(resolveInitialRuleset().ruleset)
  /** 记忆版本尚未开放时的回退说明（Q-B09-1：第一页内联提示）。 */
  const rulesetFallbackNotice = ref<RulesetId>()
  /** 已有构筑时改用另一版本的待确认目标（B00-04：另建，不原地转换）。 */
  const rulesetRebuild = ref<RulesetId>()
  /** 按草稿版本取仓库（B09-02）：绑定、名称与校验均不得使用固定 2014 仓库。 */
  const repositoryFor = (draft: { readonly ruleset: RulesetId } | undefined) => getRulesRepository(draft?.ruleset ?? defaultRuleset.value)
  const exportingFormat = ref<'pdf' | 'xlsx' | 'zip'>()
  const exportNotice = ref<{ readonly tone: 'warning' | 'error' | 'success'; readonly title: string; readonly message: string }>()
  const pendingChange = ref<{
    readonly title: string
    readonly affected: readonly string[]
    readonly explicitAffected: readonly string[]
    readonly impact?: DependencyImpact
    readonly apply: () => void
  }>()
  const derived = computed(() => activeDraft.value ? deriveCharacter(activeDraft.value) : undefined)
  const raceAbilityBonuses = computed(() => {
    const draft = activeDraft.value
    if (!draft) return {}
    return {
      ...getRaceAbilityBonuses(draft),
      ...getBackgroundAbilityBonuses(draft, getRulesRepository(draft.ruleset)),
    }
  })
  const raceFlexibleCount = computed(() => {
    const draft = activeDraft.value
    if (!draft) return 0
    const race = draft.raceId ? repositoryFor(draft).getRace(draft.raceId) : undefined
    const subrace = draft.subraceId ? repositoryFor(draft).getRace(draft.subraceId) : undefined
    const flexibleRule = getFlexibleBonusRule(race, subrace)
    return getFlexibleBonusGroups(flexibleRule, draft.raceAbilityBonusOptionId)?.reduce((sum, group) => sum + group.count, 0)
      ?? flexibleRule?.flexibleBonusCount ?? 0
  })
  const raceFlexibleGroups = computed(() => {
    const draft = activeDraft.value
    if (!draft) return undefined
    const race = draft.raceId ? repositoryFor(draft).getRace(draft.raceId) : undefined
    const subrace = draft.subraceId ? repositoryFor(draft).getRace(draft.subraceId) : undefined
    return getFlexibleBonusGroups(getFlexibleBonusRule(race, subrace), draft.raceAbilityBonusOptionId)
  })
  const raceFlexibleAlternatives = computed(() => {
    const draft = activeDraft.value
    if (!draft) return undefined
    const race = draft.raceId ? repositoryFor(draft).getRace(draft.raceId) : undefined
    const subrace = draft.subraceId ? repositoryFor(draft).getRace(draft.subraceId) : undefined
    return getFlexibleBonusRule(race, subrace)?.flexibleBonusAlternatives
  })
  const excludedRaceAbilityChoices = computed(() => {
    const draft = activeDraft.value
    if (!draft) return []
    const race = draft.raceId ? repositoryFor(draft).getRace(draft.raceId) : undefined
    const subrace = draft.subraceId ? repositoryFor(draft).getRace(draft.subraceId) : undefined
    return subrace?.excludedFlexibleAbilityKeys ?? race?.excludedFlexibleAbilityKeys ?? []
  })
  const step = computed(() => activeDraft.value?.currentStep ?? 'setup')
  const stepMeta = computed(() => STEP_META[step.value])
  const stepNumber = computed(() => Math.max(1, STEP_ORDER.indexOf(step.value) + 1))
  const timelineComplete = computed(() => {
    const draft = activeDraft.value
    if (!draft?.classId) return false
    const classRule = getRulesRepository(draft.ruleset).getClass(draft.classId)
    if (classRule?.status !== 'implemented') return true
    const timeline = buildTimelineForDraft(draft)
    return timeline.length > 0 && timeline.every((checkpoint) => {
      const selection = draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)
      const bounds = getCheckpointSelectionBounds(draft, checkpoint)
      const count = selection?.optionIds.length ?? 0
      return count >= bounds.min && count <= bounds.max
    })
  })
  /** 起源步骤未完成原因（与门禁同源，供起源页提示）。 */
  const originBlockers = computed(() => {
    const draft = activeDraft.value
    return draft ? getOriginStepBlockers(draft, repositoryFor(draft)) : []
  })
  /**
   * 第 3 步继续条件（决策 D6）：分配已完成即可继续，不要求玩家重做一次选择。
   * 未选职业时，只要总等级合法（分配控件已把总等级设为各职业等级之和）即可继续。
   */
  const allocationComplete = computed(() => {
    const draft = activeDraft.value
    if (!draft) return false
    const entries = getClassEntries(draft)
    const total = entries.reduce((sum, entry) => sum + entry.level, 0)
    if (total < 1 || total > 20) return false
    if (entries.length === 0) return true
    if (entries.some((entry) => entry.level < 1)) return false
    return total === draft.targetLevel
  })
  const canContinue = computed(() => {
    const draft = activeDraft.value
    if (!draft) return false
    if (step.value === 'class') return allocationComplete.value
    if (step.value === 'sources') return true
    // 起源完成判定与起源页提示、完成校验同源（B09-07）；不再使用 2014 的 background.languageChoices。
    if (step.value === 'origin') return isOriginStepComplete(draft, repositoryFor(draft))
    if (step.value === 'abilities') {
      return draft.raceAbilityChoices.length === raceFlexibleCount.value
        && areBaseAbilitiesValid(draft.baseAbilities, draft.abilityMethod, draft.ruleset)
        && areOriginAbilitiesWithinCap(draft.baseAbilities, raceAbilityBonuses.value)
    }
    if (step.value === 'timeline') return timelineComplete.value
    if (step.value === 'equipment') {
      return isStartingEquipmentComplete(draft) && !draft.equipmentNeedsReview
    }
    if (step.value === 'spells') return validateSpellSelections(draft)
    if (step.value === 'identity') return Boolean(draft.name.trim())
    if (step.value === 'validation') return !validationIssues.value.some((issue) => issue.severity === 'error')
    return true
  })

  function syncRoute(draft: CharacterDraft): void {
    void router.replace({ name: 'character-builder', query: { draft: draft.id, step: draft.currentStep } })
  }

  function createDraft(): void {
    const resolved = resolveInitialRuleset()
    syncRoute(store.createDraft(resolved.ruleset))
    defaultRuleset.value = resolved.ruleset
    rulesetFallbackNotice.value = resolved.fellBack ? resolved.preferred : undefined
  }

  /** 第一页显式选择版本（B00-02）：无构筑可直接改；已有构筑走另建确认（B00-04）。 */
  function updateRuleset(value: RulesetId): void {
    const draft = store.activeDraft
    if (!draft || draft.ruleset === value) return
    if (hasBuildChoices(draft)) {
      rulesetRebuild.value = value
      return
    }
    if (!store.changeRuleset(value)) return
    RulesetPreferenceService.savePreferredRuleset(value)
    defaultRuleset.value = value
    rulesetFallbackNotice.value = undefined
  }

  /** 确认另建：新建目标版本角色并切换；原卡完整保留，不复制版本相关选择（Q-B09-2）。 */
  function confirmRulesetRebuild(): void {
    const value = rulesetRebuild.value
    if (!value) return
    rulesetRebuild.value = undefined
    const draft = store.duplicateAsRuleset(value)
    if (!draft) return
    RulesetPreferenceService.savePreferredRuleset(value)
    defaultRuleset.value = value
    rulesetFallbackNotice.value = undefined
    syncRoute(draft)
  }

  function cancelRulesetRebuild(): void {
    rulesetRebuild.value = undefined
  }

  function dismissRulesetFallbackNotice(): void {
    rulesetFallbackNotice.value = undefined
  }

  function openDraft(id: string): void {
    if (store.activateDraft(id) && store.activeDraft) syncRoute(store.activeDraft)
  }

  function returnToStart(): void {
    store.closeActiveDraft()
    void router.replace({ name: 'character-builder' })
  }

  function deleteDraft(id: string): void {
    const deletingActiveDraft = store.activeDraftId === id
    if (!store.deleteDraft(id)) return
    if (deletingActiveDraft) void router.replace({ name: 'character-builder' })
  }

  function importDraft(raw: string): void {
    try {
      importError.value = ''
      syncRoute(store.importDraft(raw))
    } catch (error) {
      importError.value = error instanceof CharacterImportError ? error.message : '无法导入角色文件。'
    }
  }

  function setStep(next: DraftStep): void {
    store.setStep(next)
    if (store.activeDraft) syncRoute(store.activeDraft)
  }

  function nextStep(): void {
    if (!canContinue.value) return
    const next = STEP_ORDER[Math.min(STEP_ORDER.length - 1, STEP_ORDER.indexOf(step.value) + 1)]
    if (next) setStep(next)
  }

  function previousStep(): void {
    const previous = STEP_ORDER[Math.max(0, STEP_ORDER.indexOf(step.value) - 1)]
    if (previous) setStep(previous)
  }

  function requestChange(
    change: DraftChange,
    title: string,
    apply: () => void,
    additionalAffected: readonly string[] = [],
    options: { readonly alwaysConfirm?: boolean } = {},
  ): void {
    const draft = activeDraft.value
    if (!draft) return
    const impact = getDependencyImpact(draft, change)
    const affected = [
      ...impact.invalidated.filter((checkpointId) =>
        draft.selections.some((selection) => selection.checkpointId === checkpointId && !selection.invalidatedAt)),
      ...additionalAffected,
    ]
    if (!affected.length && !options.alwaysConfirm) {
      apply()
      return
    }
    pendingChange.value = { title, affected, explicitAffected: additionalAffected, impact, apply }
  }

  function confirmPendingChange(): void {
    const pending = pendingChange.value
    if (!pending) return
    pending.apply()
    pendingChange.value = undefined
  }

  function cancelPendingChange(): void {
    pendingChange.value = undefined
  }

  function updateSetup(targetLevel: number, abilityMethod: AbilityMethod): void {
    const draft = activeDraft.value
    const abilityPatch = draft
      && abilityMethod === 'standard-array'
      && !areBaseAbilitiesValid(draft.baseAbilities, 'standard-array', draft.ruleset)
      ? { baseAbilities: STANDARD_ARRAY_DEFAULT }
      : {}
    if (!draft || targetLevel === draft.targetLevel) {
      store.updateDraft({ targetLevel, abilityMethod, ...abilityPatch })
      return
    }
    const change = { kind: 'target-level', value: targetLevel } as const
    const archivedSpellCount = targetLevel < draft.targetLevel
      ? reconcileSpellSelections(draft, {
          nextClassId: draft.classId,
          nextSubclassId: draft.subclassId,
          nextTargetLevel: targetLevel,
          reason: 'level-reduced',
          invalidatedAt: new Date().toISOString(),
        }).archived.length
      : 0
    requestChange(change, '修改目标等级', () => {
      const impact = getDependencyImpact(draft, change)
      const spellReconciliation = targetLevel < draft.targetLevel
        ? reconcileSpellSelections(draft, {
            nextClassId: draft.classId,
            nextSubclassId: draft.subclassId,
            nextTargetLevel: targetLevel,
            reason: 'level-reduced',
            invalidatedAt: new Date().toISOString(),
          })
        : undefined
      store.invalidateSelections(impact.invalidated, `目标等级调整为${targetLevel}级`)
      store.updateDraft({
        targetLevel,
        abilityMethod,
        ...abilityPatch,
        ...(spellReconciliation ? {
          spellSelections: spellReconciliation.spellSelections,
          inactiveSpellSelections: spellReconciliation.inactiveSpellSelections,
        } : {}),
      })
    }, archivedSpellCount > 0 ? [`${archivedSpellCount} 项高等级法术将移入停用记录`] : [])
  }

  /** 角色完成后升级/降级引导条：升级提示补全新检查点，降级提示复查失效选择。 */
  const levelAdjustNotice = ref<{ tone: 'success' | 'warning'; message: string; step?: DraftStep }>()

  function buildLevelAdjustNotice(
    direction: 'up' | 'down',
    targetLevel: number,
    impact: DependencyImpact,
    archivedSpellCount = 0,
  ): { tone: 'success' | 'warning'; message: string; step?: DraftStep } {
    if (direction === 'up') {
      const added = impact.added ?? []
      const spellUpdates = impact.spellUpdates ?? []
      if (added.length === 0 && spellUpdates.length === 0) {
        return { tone: 'success', message: `等级已提升至 ${targetLevel} 级，派生数值已更新。` }
      }
      const message = added.length > 0
        ? `等级提升至 ${targetLevel} 级，请完成新增检查点：${added.map((item) => item.title).join('、')}${spellUpdates.length ? `；${spellUpdates.join('、')}` : ''}`
        : `等级提升至 ${targetLevel} 级，请完成：${spellUpdates.join('、')}`
      return {
        tone: 'success',
        message,
        step: added.length > 0 ? 'timeline' : 'spells',
      }
    }
    const invalidated = impact.invalidatedDetails ?? []
    const reviews = impact.reviews ?? []
    const parts = [
      ...invalidated.map((item) => item.title),
      ...(archivedSpellCount > 0 ? [`${archivedSpellCount} 项高等级法术已移入停用记录`] : []),
      ...reviews,
    ]
    return {
      tone: 'warning',
      message: parts.length
        ? `等级降至 ${targetLevel} 级，需复查：${parts.join('、')}`
        : `等级已降至 ${targetLevel} 级，派生数值已更新。`,
      step: archivedSpellCount > 0 ? 'spells' : 'timeline',
    }
  }

  /**
   * 角色卡调整后的引导（需求 §3，决策 D28—D30）。
   *
   * 只在有待办项时写引导条（没有待补／待复查项就清掉上一条过期提示），
   * 且只有「升级 + 确认路径」才自动跳转：降级只提示复查、滑杆路径只提示补全，
   * 是否前往由用户点击引导条决定，避免把正在看角色卡的用户强行带走。
   */
  function guideLevelAdjust(
    direction: 'up' | 'down',
    targetLevel: number,
    impact: DependencyImpact,
    archivedSpellCount: number,
    options: { readonly navigate?: boolean } = {},
  ): void {
    const notice = buildLevelAdjustNotice(direction, targetLevel, impact, archivedSpellCount)
    levelAdjustNotice.value = notice.step ? notice : undefined
    if (notice.step && direction === 'up' && options.navigate !== false) setStep(notice.step)
  }

  function dismissLevelAdjustNotice(): void {
    levelAdjustNotice.value = undefined
  }

  /** 角色完成后重新编辑：智能定位到需要处理的步骤，否则进入属性步骤。 */
  function startReedit(): void {
    const draft = activeDraft.value
    if (!draft) return
    if (!draft.classId) {
      setStep('setup')
      return
    }
    const timeline = buildTimelineForDraft(draft)
    const hasInvalidated = draft.selections.some((selection) => Boolean(selection.invalidatedAt))
    const hasIncompleteCheckpoint = timeline.some((checkpoint) => {
      const selection = draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)
      const bounds = getCheckpointSelectionBounds(draft, checkpoint)
      const count = selection?.optionIds.length ?? 0
      return count < bounds.min || count > bounds.max
    })
    if (hasInvalidated || hasIncompleteCheckpoint) {
      setStep('timeline')
      return
    }
    if (!validateSpellSelections(draft)) {
      setStep('spells')
      return
    }
    setStep('abilities')
  }

  /**
   * 应用职业与等级分配（MC-E02，决策 D2／D5／D6）。
   *
   * 由第 1 步、第 3 步与角色卡弹窗共用的 `ClassAllocationControl` 提交：
   * 走 `class-allocation` 依赖变更（旧分配 vs 新分配两条时间线求差），
   * 降级与移除职业时把失效选择标记失效、并把法术按归属归档到停用历史，不静默删除。
   *
   * 引导（需求 §3，决策 D28—D30）：在角色卡步骤提交后必须把新增检查点／复查项告诉用户；
   * `navigate: false`（总等级滑杆）只写引导条、不强制跳转。
   */
  function applyClassAllocation(nextDraft: CharacterDraft, options: { readonly alwaysConfirm?: boolean; readonly navigate?: boolean } = {}): void {
    const draft = activeDraft.value
    if (!draft) return
    const classes = nextDraft.multiclass?.classes ?? []
    if (classes.length === 0) return
    const beforeTotal = draft.targetLevel
    const afterTotal = classes.reduce((sum, entry) => sum + entry.level, 0)
    const change = {
      kind: 'class-allocation',
      classes,
      levelOrder: nextDraft.multiclass?.levelOrder,
      enabled: nextDraft.multiclass?.enabled,
      primaryClassId: nextDraft.multiclass?.primaryClassId,
    } as const
    const beforeIds = new Set(getClassEntries(draft).map((entry) => entry.classId))
    const afterIds = new Set(classes.map((entry) => entry.classId))
    const removedClasses = [...beforeIds].filter((id) => !afterIds.has(id))
    // 起始职业（SC-A03）：取 `primaryClassId` 而不是 `classes[0]`——两者在允许切换起始职业后不再等价，
    // 而 `draft.classId`／`subclassId` 是装备步骤、兼容读取与导出共同依赖的字段。
    const primaryClassId = nextDraft.multiclass?.primaryClassId ?? classes[0]?.classId
    const nextPrimary = classes.find((entry) => entry.classId === primaryClassId) ?? classes[0]
    const primaryChanged = primaryClassId !== undefined && primaryClassId !== getPrimaryClassId(draft)
    const additionalAffected: string[] = []
    if (removedClasses.length > 0) {
      additionalAffected.push(`已移除职业：${removedClasses.map((id) => repositoryFor(draft).getClass(id)?.name ?? id).join('、')}`)
    }
    if (afterTotal < beforeTotal) additionalAffected.push('法术位与已知／准备法术（超出新等级的将移入停用记录）')
    const subclassChanged = getClassEntries(draft)
      .some((entry) => classes.find((item) => item.classId === entry.classId)?.subclassId !== entry.subclassId)
    if (subclassChanged) additionalAffected.push('子职及其特性选择')
    // 更换起始职业会改变 1 级生命值、起始装备与豁免熟练：确认摘要里必须显式列出。
    if (primaryChanged) additionalAffected.push('起始职业（1 级生命值、起始装备、豁免熟练）')

    requestChange(change, '调整职业与等级分配', () => {
      const impact = getDependencyImpact(draft, change)
      const targetSubclassId = nextPrimary?.subclassId
      const spellReconciliation = afterTotal < beforeTotal || removedClasses.length > 0
        ? reconcileSpellSelections(draft, {
            nextClassId: nextPrimary?.classId,
            nextSubclassId: targetSubclassId,
            nextTargetLevel: afterTotal,
            // 兼职口径（MC-D04）：按各职业自己的作用域核对，并把归属职业写进 sourceKey。
            nextMulticlass: nextDraft.multiclass,
            removedClassIds: removedClasses,
            reason: afterTotal < beforeTotal ? 'level-reduced' : 'source-removed',
            invalidatedAt: new Date().toISOString(),
          })
        : undefined
      const { subclassId: _previousSubclassId, ...rest } = draft
      store.updateDraft({
        ...rest,
        multiclass: nextDraft.multiclass,
        classId: nextPrimary?.classId,
        ...(targetSubclassId ? { subclassId: targetSubclassId } : {}),
        targetLevel: afterTotal,
        ...(spellReconciliation ? {
          spellSelections: spellReconciliation.spellSelections,
          inactiveSpellSelections: spellReconciliation.inactiveSpellSelections,
        } : {}),
      })
      // 先写入新分配、再标记失效：`rest.selections` 是变更前的快照，顺序反过来会把
      // `invalidateSelections` 刚写下的 `invalidatedAt` 覆盖掉（实施期发现的既有缺陷，见更新任务 §6.3）。
      store.invalidateSelections(impact.invalidated, '职业与等级分配已调整')
      // 角色卡上的调整必须给出补全引导（需求 §3，决策 D28—D30）：
      // 第 1／3 步属于线性流程，后面本就会走到第 6 步，因此不在此处提示、也不跳转。
      if (step.value !== 'sheet') return
      const navigate = options.navigate ?? true
      if (primaryChanged) {
        const before = getPrimaryClassId(draft)
        levelAdjustNotice.value = {
          tone: 'warning',
          message: `已更换起始职业：${before ? repositoryFor(draft).getClass(before)?.name ?? before : '无'} → ${repositoryFor(draft).getClass(primaryClassId)?.name ?? primaryClassId}。1 级生命值与豁免熟练已按新起始职业重算；起始装备需在装备步骤重新选择。`,
          step: 'equipment',
        }
        // TODO(primary-class-equipment): 起始装备不会随起始职业变更重算（需求 §7.2），
        // 是否清空重建或标记需复核需单独决策；当前只在引导条里指向装备步骤。
        if (navigate) setStep('equipment')
        return
      }
      guideLevelAdjust(
        afterTotal >= beforeTotal ? 'up' : 'down',
        afterTotal,
        impact,
        spellReconciliation?.archived.length ?? 0,
        { navigate },
      )
    }, additionalAffected, { alwaysConfirm: options.alwaysConfirm ?? true })
  }

  /**
   * 第 1 步的等级分配：未选职业时只改目标等级（走轻量的 `target-level` 路径），已选职业时走分配变更。
   */
  function applyAllocationFromSetup(nextDraft: CharacterDraft, abilityMethod: AbilityMethod): void {
    const draft = activeDraft.value
    if (!draft) return
    if (getClassEntries(nextDraft).length === 0) {
      updateSetup(Math.max(1, nextDraft.targetLevel ?? 1), abilityMethod)
      return
    }
    if (abilityMethod === draft.abilityMethod) {
      applyClassAllocation(nextDraft)
      return
    }
    store.updateDraft({ abilityMethod })
    applyClassAllocation(nextDraft)
  }

  /**
   * 总等级滑杆的提交（需求 §3.4）：与逐职业步进分开，使用更轻的确认策略——
   * 仅当有选择将失效时才弹确认，单纯升级或同级重排不打断。
   *
   * 但「不打断」不等于「不提示」（需求 §3.3，决策 D29）：滑杆提交同样要写引导条，
   * 只是不自动跳转（滑杆常被连续微调，强制跳转会打断操作）。
   */
  function applyTotalLevel(nextDraft: CharacterDraft, abilityMethod?: AbilityMethod): void {
    const draft = activeDraft.value
    if (!draft) return
    if (getClassEntries(nextDraft).length === 0) {
      updateSetup(Math.max(1, nextDraft.targetLevel ?? 1), abilityMethod ?? draft.abilityMethod)
      return
    }
    applyClassAllocation(nextDraft, { alwaysConfirm: false, navigate: false })
  }

  function selectClass(classId: string): void {
    const draft = activeDraft.value
    if (!draft || draft.classId === classId) return
    const change = { kind: 'class', value: classId } as const
    const hadSpells = Object.values(draft.spellSelections).some((ids) => ids.length > 0)
    requestChange(change, '更换职业', () => {
      const impact = getDependencyImpact(draft, change)
      const spellReconciliation = reconcileSpellSelections(draft, {
        nextClassId: classId,
        nextSubclassId: undefined,
        nextTargetLevel: draft.targetLevel,
        reason: 'class-changed',
        invalidatedAt: new Date().toISOString(),
      })
      store.invalidateSelections(impact.invalidated, '更换职业后需要重新确认')
      const equipmentDraft = { ...draft, classId, startingEquipmentSelections: [] }
      const equipment = buildStartingEquipmentState(equipmentDraft)
      store.updateDraft({
        classId,
        subclassId: undefined,
        startingEquipmentSelections: [],
        inventory: equipment.inventory,
        currency: equipment.currency,
        equipmentNeedsReview: false,
        spellSelections: spellReconciliation.spellSelections,
        inactiveSpellSelections: spellReconciliation.inactiveSpellSelections,
      })
    }, [
      ...(draft.inventory.some((entry) => entry.sourceKind === 'class') ? ['职业起始装备'] : []),
      ...(hadSpells ? ['法术选择（将移入停用记录，可在法术步骤查看）'] : []),
    ])
  }

  function sourceChangeAffectedContent(draft: CharacterDraft, enabledSourceIds: readonly string[]): readonly string[] {
    const affected: string[] = []
    const repository = repositoryFor(draft)
    const add = (label: string, rule: { readonly sourceIds: readonly string[] } | undefined): void => {
      if (rule && !isSourceEnabled(rule.sourceIds, enabledSourceIds, repository)) affected.push(label)
    }
    add(`职业：${draft.classId ? repositoryFor(draft).getClass(draft.classId)?.name ?? draft.classId : ''}`, draft.classId ? repositoryFor(draft).getClass(draft.classId) : undefined)
    add(`子职：${draft.subclassId ? repositoryFor(draft).getSubclass(draft.subclassId)?.name ?? draft.subclassId : ''}`, draft.subclassId ? repositoryFor(draft).getSubclass(draft.subclassId) : undefined)
    add(`种族：${draft.raceId ? repositoryFor(draft).getRace(draft.raceId)?.name ?? draft.raceId : ''}`, draft.raceId ? repositoryFor(draft).getRace(draft.raceId) : undefined)
    add(`子种族：${draft.subraceId ? repositoryFor(draft).getRace(draft.subraceId)?.name ?? draft.subraceId : ''}`, draft.subraceId ? repositoryFor(draft).getRace(draft.subraceId) : undefined)
    add(`背景：${draft.backgroundId ? repositoryFor(draft).getBackground(draft.backgroundId)?.name ?? draft.backgroundId : ''}`, draft.backgroundId ? repositoryFor(draft).getBackground(draft.backgroundId) : undefined)
    add(`背景变体：${draft.backgroundVariantId ? repositoryFor(draft).getBackground(draft.backgroundVariantId)?.name ?? draft.backgroundVariantId : ''}`, draft.backgroundVariantId ? repositoryFor(draft).getBackground(draft.backgroundVariantId) : undefined)
    for (const selection of draft.selections.filter((item) => !item.invalidatedAt)) {
      for (const optionId of selection.optionIds) {
        const option = repositoryFor(draft).getOption(optionId)
        add(`选择：${option?.name ?? optionId}`, option)
      }
    }
    const spellIds = Object.values(draft.spellSelections).flat()
    for (const spellId of new Set(spellIds)) {
      const spell = repositoryFor(draft).getSpell(spellId)
      add(`法术：${spell?.name ?? spellId}`, spell)
    }
    for (const entry of draft.inventory) {
      const item = repositoryFor(draft).getEquipment(entry.itemId)
      add(`物品：${item?.name ?? entry.itemId}`, item)
    }
    return [...new Set(affected.filter((item) => !item.endsWith('：')))]
  }

  function updateSources(sourceIds: readonly string[]): void {
    const draft = activeDraft.value
    if (!draft) return
    const normalized = normalizeEnabledSourceIds(sourceIds, draft.ruleset)
    if (normalized.length === draft.enabledSourceIds.length && normalized.every((id) => draft.enabledSourceIds.includes(id))) return
    const affected = sourceChangeAffectedContent(draft, normalized)
    const apply = () => store.updateDraft({ enabledSourceIds: normalized })
    if (!affected.length) {
      apply()
      return
    }
    pendingChange.value = { title: '调整扩展书', affected, explicitAffected: [], apply }
  }

  function selectRace(id: string): void {
    const draft = activeDraft.value
    if (!draft || draft.raceId === id) return
    const change = { kind: 'race', value: id } as const
    requestChange(change, '更换种族', () => {
      const impact = getDependencyImpact(draft, change)
      store.invalidateSelections(impact.invalidated, '更换种族后需要重新确认')
      store.updateDraft({ raceId: id, subraceId: undefined, raceAbilityChoices: [], raceAbilityBonusOptionId: undefined, raceSkillChoices: [], raceToolChoice: undefined, raceToolChoices: undefined })
    })
  }

  function selectSubrace(id: string | undefined): void {
    const draft = activeDraft.value
    if (!draft || draft.subraceId === id) return
    const change = { kind: 'subrace', value: id } as const
    requestChange(change, '更换子种族', () => {
      const impact = getDependencyImpact(draft, change)
      store.invalidateSelections(impact.invalidated, '更换子种族后需要重新确认')
      store.updateDraft({ subraceId: id, raceAbilityChoices: [], raceAbilityBonusOptionId: undefined, raceSkillChoices: [], raceToolChoice: undefined, raceToolChoices: undefined })
    })
  }

  function selectBackground(id: string): void {
    const draft = activeDraft.value
    const background = repositoryFor(draft).getBackground(id)
    if (!draft || draft.backgroundId === id) return
    const change = { kind: 'background', value: id, previousValue: draft.backgroundId } as const
    const apply = () => {
      // 换背景后旧背景的起源专长选择不再适用（H1）：先标失效，再写入新背景。
      const impact = getDependencyImpact(draft, change)
      store.invalidateSelections(impact.invalidated, '更换背景后需要重新确认起源专长')
      const equipment = buildStartingEquipmentState({ ...draft, backgroundId: id })
      store.updateDraft({
        backgroundId: id,
        backgroundVariantId: undefined,
        backgroundSkillIds: background?.skillIds ?? [],
        backgroundToolIds: background?.toolIds ?? [],
        languages: [],
        inventory: equipment.inventory,
        currency: equipment.currency,
      })
    }
    requestChange(
      change,
      '更换背景',
      apply,
      draft.inventory.some((entry) => entry.sourceKind === 'background') ? ['背景固定装备与起始金币'] : [],
    )
  }

  function selectBackgroundVariant(id: string | undefined): void {
    const draft = activeDraft.value
    if (!draft || draft.backgroundVariantId === id) return
    const equipment = buildStartingEquipmentState({ ...draft, backgroundVariantId: id })
    store.updateDraft({
      backgroundVariantId: id,
      inventory: equipment.inventory,
      currency: equipment.currency,
    })
  }

  function saveTimelineSelection(checkpointId: string, optionIds: readonly string[]): void {
    const current = activeDraft.value
    if (!current) return
    if (isSpellbookReservationCheckpoint(checkpointId)) {
      const reconciled = applySpellbookReservationSelection(current, checkpointId, optionIds)
      store.updateDraft(reconciled)
    } else {
      store.saveSelection(checkpointId, optionIds)
    }
    const draft = activeDraft.value
    if (!draft?.classId) return
    const checkpoint = buildTimelineForDraft(draft)
      .find((item) => item.id === checkpointId)
    if (checkpoint?.kind === 'subclass') {
      store.updateDraft({ subclassId: optionIds[0] })
    }
  }

  function updateEquipment(
    startingEquipmentSelections: readonly StartingEquipmentSelection[],
    inventory: readonly InventoryEntry[],
    currency: CurrencyWallet,
  ): void {
    store.updateDraft({
      startingEquipmentSelections,
      inventory,
      currency,
      equipmentNeedsReview: false,
    })
  }

  function updateInventory(inventory: readonly InventoryEntry[]): void {
    store.updateDraft({ inventory })
  }

  function updateInfusions(infusionAssignments: readonly InfusionAssignment[]): void {
    store.updateDraft({ infusionAssignments })
  }

  function updateAdventureGold(adventureGold: number): void {
    store.updateDraft({ adventureGold })
  }

  function updateSpells(value: SpellSelections): void {
    store.updateDraft({ spellSelections: value })
  }

  function restoreInactiveSpell(inactiveId: string): void {
    const draft = activeDraft.value
    if (!draft) return
    const restored = restoreInactiveSpellSelection(draft, inactiveId)
    if (restored) store.updateDraft(restored)
  }

  function deleteInactiveSpell(inactiveId: string): void {
    const draft = activeDraft.value
    if (!draft) return
    store.updateDraft({ inactiveSpellSelections: deleteInactiveSpellSelection(draft, inactiveId) })
  }

  async function importPackage(file: File): Promise<void> {
    try {
      importError.value = ''
      syncRoute(await store.importPackage(file))
    } catch (error) {
      importError.value = error instanceof Error ? error.message : '无法导入完整角色包。'
    }
  }

  function updateManualEdits(value: CharacterManualEdits): void {
    store.updateManualEdits(value)
  }

  function updateIdentity(value: Pick<CharacterDraft, 'name' | 'alignment' | 'notes'>): void {
    store.updateDraft(value)
  }

  function updateAbilities(value: AbilityScores): void {
    store.updateDraft({ baseAbilities: value })
  }

  /**
   * 第 5 步「自定义属性」的天命掷骰。
   *
   * 随机源从 `services/dice-random` 注入，`rules/abilities` 保持框架无关；
   * 「天命次数」与「掷出的数组」都作为原始选择写进草稿，刷新与 JSON／ZIP 往返后仍在。
   */
  const destinyCount = computed(() => activeDraft.value?.abilityDestiny?.count ?? 1)
  const destinyRolls = computed<readonly (readonly number[])[]>(
    () => activeDraft.value?.abilityDestiny?.rolls ?? [],
  )
  const destinyError = ref('')

  function rollDestiny(count: number): readonly (readonly number[])[] | undefined {
    try {
      destinyError.value = ''
      return rollAbilityScoreSets(count, (minimum, maximum) => randomIntegerInclusive(minimum, maximum, secureUint32))
    } catch (error) {
      destinyError.value = error instanceof Error
        ? `${error.message}请刷新页面后重试；当前结果沿用上一次记录。`
        : '生成天命随机点数失败，请刷新页面后重试。'
      return undefined
    }
  }

  function updateDestinyCount(value: number): void {
    const count = clampDestinyCount(value)
    const rolls = rollDestiny(count)
    store.updateDraft({ abilityDestiny: { count, ...(rolls ? { rolls } : {}) } })
  }

  /** 次数不变时重掷：用于「重新掷骰」，也用于重新打开草稿时补齐缺失的掷骰结果。 */
  function rerollDestiny(): void {
    updateDestinyCount(destinyCount.value)
  }

  // 打开草稿或进入第 5 步时，若记录了天命次数但还没有掷骰结果（例如换设备后首次打开），补掷一次。
  watch([step, destinyCount, destinyRolls], () => {
    if (step.value !== 'abilities') return
    if (activeDraft.value?.abilityMethod !== 'custom') return
    if (destinyRolls.value.length > 0) return
    rerollDestiny()
  }, { immediate: true })

  function updateRaceAbilityChoices(value: readonly AbilityKey[]): void {
    store.updateDraft({ raceAbilityChoices: value })
  }

  function updateRaceAbilityBonusOption(id: string): void {
    if (!raceFlexibleAlternatives.value?.some((option) => option.id === id)) return
    store.updateDraft({ raceAbilityBonusOptionId: id })
  }

  function exportDraft(): void {
    if (activeDraft.value) CharacterJsonService.downloadDraft(activeDraft.value)
  }

  async function exportPackage(): Promise<void> {
    const draft = activeDraft.value
    if (!draft || exportingFormat.value) return
    exportingFormat.value = 'zip'
    exportNotice.value = undefined
    try {
      await CharacterPackageService.download(draft)
      exportNotice.value = { tone: 'success', title: '完整角色包导出完成', message: '角色数据、头像与立绘已打包并开始下载。' }
    } catch (error) {
      exportNotice.value = { tone: 'error', title: '角色包导出失败', message: exportErrorMessage(error) }
    } finally {
      exportingFormat.value = undefined
    }
  }

  function diagnosticSummary(diagnostics: readonly ExportDiagnostic[]): string {
    const warnings = [...new Set(diagnostics.filter((item) => item.severity === 'warning').map((item) => item.message))]
    return warnings.length ? warnings.join('；') : ''
  }

  function blockingMessage(diagnostics: readonly ExportDiagnostic[]): string | undefined {
    const first = diagnostics.find((item) => item.severity === 'error')
    return first?.message
  }

  function exportErrorMessage(error: unknown): string {
    return error instanceof Error && error.message ? error.message : '导出失败，请稍后重试。'
  }

  /** PDF 角色卡导出：统一模型 → 三页 AcroForm 模板 → 诊断 → 下载。 */
  async function exportPdf(): Promise<void> {
    const draft = activeDraft.value
    const currentDerived = derived.value
    if (!draft || !currentDerived || exportingFormat.value) return
    exportingFormat.value = 'pdf'
    exportNotice.value = undefined
    try {
      const model = buildCharacterExportModel(draft, currentDerived)
      const modelBlocker = blockingMessage(model.diagnostics)
      if (modelBlocker) throw new Error(modelBlocker)
      const result = await buildCharacterSheetPdf(model)
      const blocker = blockingMessage(result.diagnostics)
      if (blocker) throw new Error(blocker)
      await downloadPdf(result.bytes, `${draft.name.trim() || 'dnd-character'}-dnd5e.pdf`)
      const warning = diagnosticSummary(result.diagnostics)
      exportNotice.value = warning ? { tone: 'warning', title: 'PDF 已导出，但有内容省略', message: warning } : { tone: 'success', title: 'PDF 导出完成', message: '三页角色卡已生成并开始下载。' }
    } catch (error) {
      exportNotice.value = { tone: 'error', title: 'PDF 导出失败', message: exportErrorMessage(error) }
    } finally {
      exportingFormat.value = undefined
    }
  }

  async function exportXlsx(): Promise<void> {
    const draft = activeDraft.value
    const currentDerived = derived.value
    if (!draft || !currentDerived || exportingFormat.value) return
    exportingFormat.value = 'xlsx'
    exportNotice.value = undefined
    try {
      const model = buildCharacterExportModel(draft, currentDerived)
      const modelBlocker = blockingMessage(model.diagnostics)
      if (modelBlocker) throw new Error(modelBlocker)
      const workbook = await loadCharacterSheetTemplate()
      const result = fillTemplate(workbook, model)
      const blocker = blockingMessage(result.diagnostics)
      if (blocker) throw new Error(blocker)
      await downloadXlsx(workbook, `${draft.name.trim() || 'dnd-character'}-dnd5e.xlsx`)
      const warning = diagnosticSummary(result.diagnostics)
      exportNotice.value = warning ? { tone: 'warning', title: 'XLSX 已导出，但有内容省略', message: warning } : { tone: 'success', title: 'XLSX 导出完成', message: '自动计算角色卡已校验并开始下载。' }
    } catch (error) {
      exportNotice.value = { tone: 'error', title: 'XLSX 导出失败', message: exportErrorMessage(error) }
    } finally {
      exportingFormat.value = undefined
    }
  }

  onMounted(() => {
    const draftId = typeof route.query.draft === 'string' ? route.query.draft : undefined
    if (draftId && store.activateDraft(draftId)) {
      const routeStep = route.query.step
      if (isDraftStep(routeStep) && routeStep !== store.activeDraft?.currentStep) store.setStep(routeStep)
    }
  })

  watch(
    () => [route.query.draft, route.query.step] as const,
    ([draftId, routeStep]) => {
      if (typeof draftId === 'string' && draftId !== store.activeDraftId) store.activateDraft(draftId)
      if (isDraftStep(routeStep) && routeStep !== store.activeDraft?.currentStep) store.setStep(routeStep)
    },
  )

  return {
    title: '辅助车卡',
    lineageTransformation,
    drafts,
    legacyDrafts,
    activeDraft,
    derived,
    raceAbilityBonuses,
    raceFlexibleCount,
    raceFlexibleGroups,
    raceFlexibleAlternatives,
    excludedRaceAbilityChoices,
    derivedSummary,
    validationIssues,
    completion,
    importError,
    exportingFormat,
    exportNotice,
    pendingChange,
    step,
    stepMeta,
    stepNumber,
    canContinue,
    originBlockers,
    createDraft,
    defaultRuleset,
    rulesetFallbackNotice,
    rulesetRebuild,
    dismissRulesetFallbackNotice,
    updateRuleset,
    confirmRulesetRebuild,
    cancelRulesetRebuild,
    openDraft,
    returnToStart,
    deleteDraft,
    importDraft,
    importPackage,
    nextStep,
    previousStep,
    setStep,
    updateSetup,
    applyClassAllocation,
    applyAllocationFromSetup,
    applyTotalLevel,
    updateSources,
    selectClass,
    selectRace,
    selectSubrace,
    selectBackground,
    selectBackgroundVariant,
    saveTimelineSelection,
    updateEquipment,
    updateInventory,
    updateInfusions,
    updateAdventureGold,
    updateSpells,
    restoreInactiveSpell,
    deleteInactiveSpell,
    updateManualEdits,
    updateIdentity,
    updateAbilities,
    destinyCount,
    destinyRolls,
    destinyError,
    updateDestinyCount,
    rerollDestiny,
    updateRaceAbilityChoices,
    updateRaceAbilityBonusOption,
    exportDraft,
    exportPackage,
    exportPdf,
    exportXlsx,
    exportLegacyDraft: store.exportLegacyDraft,
    confirmPendingChange,
    cancelPendingChange,
    levelAdjustNotice,
    dismissLevelAdjustNotice,
    startReedit,
    updateDraft: store.updateDraft,
  } as const
}
