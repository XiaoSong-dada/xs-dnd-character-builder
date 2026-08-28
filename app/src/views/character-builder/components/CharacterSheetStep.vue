<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import AddItemModal from '@/components/AddItemModal.vue'
import AdjustItemModal from '@/components/AdjustItemModal.vue'
import AddManualSpellModal from '@/views/character-builder/components/AddManualSpellModal.vue'
import EditableStatTile from '@/views/character-builder/components/EditableStatTile.vue'
import { SpellbookTranscriptionModal } from '@/features/spellbook-transcription'
import UiModal from '@/components/ui/UiModal.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import { CharacterMediaEditor, CharacterMediaImage } from '@/features/character-media'
import { ABILITY_LABELS } from '@/rules/data/feats-2014'
import { decodeAbilityImprovement } from '@/rules/feats'
import { rulesRepository } from '@/rules/repository'
import { addAdventureItem, decreaseAdventureItem, increaseAdventureItem, removeAdventureItem } from '@/rules/starting-equipment'
import { getAlwaysPreparedSpellIds, getAvailableSpells, getEffectiveSpellSlots, getMaximumSpellLevel, getMagicalSecretsSpellIds, getRequiredCantripCount, getRequiredSpellbookCount, getRequiredSpellCount, getSelectedSpellIds, getSpellCandidates, getSpellcastingConfig } from '@/rules/spellcasting'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { getClassFeatures2014 } from '@/rules/data/class-features-2014'
import { buildTimeline } from '@/rules/timeline'
import { useCharacterSheetEditing } from '@/views/character-builder/hooks/useCharacterSheetEditing'
import type { AbilityKey, CharacterDraft, CharacterManualEdits, CharacterMedia, DerivedCharacter, InventoryEntry, ManualAddedSpell, SpellSelections } from '@/types/character'
import type { ClassFeature, SpellRule } from '@/types/rules'
import { formatSpellLabel } from '@/utils/format-spell-label'

const props = defineProps<{
  draft: CharacterDraft
  derived: DerivedCharacter
  exportingFormat?: 'pdf' | 'xlsx' | 'zip'
  exportNotice?: { readonly tone: 'warning' | 'error' | 'success'; readonly title: string; readonly message: string }
}>()
const emit = defineEmits<{
  export: []
  exportPackage: []
  exportPdf: []
  exportXlsx: []
  adjustLevel: []
  reedit: []
  changeSpellSelections: [value: SpellSelections]
  changeInventory: [inventory: readonly InventoryEntry[]]
  changeAdventureGold: [adventureGold: number]
  changeManualEdits: [manualEdits: CharacterManualEdits]
  changeMedia: [media: CharacterMedia | undefined]
}>()
const showMediaEditor = ref(false)
const showMoreActions = ref(false)
const moreButtonRef = ref<HTMLButtonElement>()
const morePanelRef = ref<HTMLElement>()

function toggleMoreActions(): void {
  showMoreActions.value = !showMoreActions.value
}

function closeMoreActions(event: Event): void {
  const target = event.target as Node
  if (morePanelRef.value?.contains(target) || moreButtonRef.value?.contains(target)) return
  showMoreActions.value = false
}

function handleMoreKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && showMoreActions.value) {
    showMoreActions.value = false
    moreButtonRef.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', closeMoreActions)
  document.addEventListener('keydown', handleMoreKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeMoreActions)
  document.removeEventListener('keydown', handleMoreKeydown)
})
const editing = useCharacterSheetEditing(
  () => props.draft,
  () => props.derived,
  (manualEdits) => emit('changeManualEdits', manualEdits),
)
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', label: '总览' },
  { id: 'combat', label: '战斗' },
  { id: 'features', label: '能力' },
  { id: 'spells', label: '法术' },
  { id: 'items', label: '物品' },
] as const
function abilityLabel(key: string): string {
  return ABILITY_LABELS[key as AbilityKey] ?? key
}
function skillLabel(skillId: string): string {
  return rulesRepository.getOption(skillId)?.name ?? skillId
}
function sourceNote(sources: DerivedCharacter['armorClass']['sources']): string {
  return sources.map((source) => `${source.label} ${source.value >= 0 ? '+' : ''}${source.value}`).join(' · ')
}
function abilityNote(key: AbilityKey): string {
  const modifier = props.derived.modifiers[key]
  const adjustment = editing.manual.value.abilityAdjustments[key]
  return `调整值 ${modifier >= 0 ? '+' : ''}${modifier}${adjustment ? ` · 人工调整 ${adjustment >= 0 ? '+' : ''}${adjustment}` : ''}`
}
const identityLine = computed(() => {
  const draft = props.draft
  const names = [
    draft.classId ? rulesRepository.getClass(draft.classId)?.name : undefined,
    draft.subclassId ? rulesRepository.getSubclass(draft.subclassId)?.name : undefined,
    draft.raceId ? rulesRepository.getRace(draft.raceId)?.name : undefined,
    draft.subraceId ? rulesRepository.getRace(draft.subraceId)?.name : undefined,
    draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId)?.name : undefined,
    draft.backgroundVariantId ? rulesRepository.getBackground(draft.backgroundVariantId)?.name : undefined,
  ].filter(Boolean)
  return `${draft.targetLevel}级 · ${names.join(' · ')}`
})
const spellcastingConfig = computed(() => getSpellcastingConfig(props.draft))
const spellSlots = computed(() => getEffectiveSpellSlots(props.draft))
const editableSpellSlots = computed(() => Array.from({ length: 9 }, (_, index) => ({
  level: index + 1,
  count: spellSlots.value.find((slot) => slot.level === index + 1)?.count ?? 0,
})))
const spellSlotsLabel = computed(() => {
  if (!spellSlots.value.length) return ''
  if (spellSlots.value[0]?.pact) {
    const slot = spellSlots.value[0]
    return `契约法术位：${slot.count} 个 ${slot.level} 环（短休恢复）`
  }
  return spellSlots.value.map((slot) => `${slot.level}环×${slot.count}`).join(' · ')
})
const manualSpellIds = computed(() => new Set(editing.manual.value.addedSpells.map((item) => item.spellId)))
const cantripSpells = computed(() => props.draft.spellSelections.cantripIds
  .filter((id) => !manualSpellIds.value.has(id))
  .map((id) => rulesRepository.getSpell(id))
  .filter((spell): spell is SpellRule => Boolean(spell)))
const preparedOrKnownSpells = computed(() => {
  const config = spellcastingConfig.value
  if (!config) return []
  // 已准备 / 已掌握法术以规则层 getSelectedSpellIds 为唯一事实源（覆盖 spellbook/prepared/known/pact 四种模式）。
  return getSelectedSpellIds(props.draft, config)
    .filter((id) => !manualSpellIds.value.has(id))
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell))
})
const manualAddedSpells = computed(() => editing.manual.value.addedSpells
  .map((entry) => ({ entry, spell: rulesRepository.getSpell(entry.spellId) }))
  .filter((item): item is { entry: ManualAddedSpell; spell: SpellRule } => Boolean(item.spell)))
const existingSpellIds = computed(() => [...new Set([
  ...props.draft.spellSelections.cantripIds,
  ...props.draft.spellSelections.knownSpellIds,
  ...props.draft.spellSelections.preparedSpellIds,
  ...props.draft.spellSelections.spellbookSpellIds,
  ...getMagicalSecretsSpellIds(props.draft),
  ...getAlwaysPreparedSpellIds(props.draft),
  ...editing.manual.value.addedSpells.map((item) => item.spellId),
])])
const showManualSpellModal = ref(false)
const spellbookSpells = computed(() => {
  if (spellcastingConfig.value?.mode !== 'spellbook') return []
  return props.draft.spellSelections.spellbookSpellIds
    .filter((id) => !manualSpellIds.value.has(id))
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell))
})
const requiredCantripCount = computed(() => (spellcastingConfig.value ? getRequiredCantripCount(props.draft, spellcastingConfig.value) : 0))
const requiredSpellCount = computed(() => (spellcastingConfig.value ? getRequiredSpellCount(props.draft, spellcastingConfig.value) : 0))
const requiredSpellbookCount = computed(() => (spellcastingConfig.value ? getRequiredSpellbookCount(props.draft, spellcastingConfig.value) : 0))
/** 已准备 / 已掌握法术按环级分组（戏法由 cantripSpells 单独展示）。 */
const spellGroups = computed(() => {
  const config = spellcastingConfig.value
  if (!config) return []
  const maximumLevel = getMaximumSpellLevel(config, props.draft.targetLevel)
  return Array.from({ length: maximumLevel }, (_, index) => index + 1)
    .map((level) => ({ level, spells: preparedOrKnownSpells.value.filter((spell) => spell.level === level) }))
    .filter((group) => group.spells.length)
})
const preparedOrKnownLabel = computed(() => (spellcastingConfig.value?.mode === 'prepared' || spellcastingConfig.value?.mode === 'spellbook' ? '已准备' : '已掌握'))
/** 候选池：prepared 职业可选未准备的法术（1 环起）。 */
const preparedCandidates = computed(() => {
  const config = spellcastingConfig.value
  if (!config) return []
  return getSpellCandidates(props.draft, config).prepared
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell))
})
/** 法师候选准备：法术书中未准备（长休可换入准备）。 */
const wizardPrepareFromBook = computed(() => {
  const config = spellcastingConfig.value
  if (!config) return []
  return getSpellCandidates(props.draft, config).prepareFromBook
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell))
})
/** 法师候选写入：职业池中未写入法术书（升级时可扩充入书，只读展示）。 */
const wizardWriteToBook = computed(() => {
  const config = spellcastingConfig.value
  if (!config) return []
  return getSpellCandidates(props.draft, config).writeToBook
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell))
})
/** 候选按环级分组。 */
const preparedCandidateGroups = computed(() => {
  const config = spellcastingConfig.value
  if (!config) return []
  const maximumLevel = getMaximumSpellLevel(config, props.draft.targetLevel)
  return Array.from({ length: maximumLevel }, (_, index) => index + 1)
    .map((level) => ({ level, spells: preparedCandidates.value.filter((spell) => spell.level === level) }))
    .filter((group) => group.spells.length)
})
/** 第三块"全部职业法术"（prepared 模式只读参考）：已学戏法 + 全部可达 1+ 环职业法术。 */
const allPreparedSpells = computed(() => {
  const config = spellcastingConfig.value
  if (!config || config.mode !== 'prepared') return []
  const knownCantrips = props.draft.spellSelections.cantripIds
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell))
  const leveled = getAvailableSpells(props.draft, config).filter((spell) => spell.level > 0)
  return [...knownCantrips, ...leveled]
})
/** 第三块法术按环级分组（戏法组为 0 环，置顶）。 */
const allPreparedSpellGroups = computed(() => {
  const byLevel = new Map<number, SpellRule[]>()
  for (const spell of allPreparedSpells.value) {
    const list = byLevel.get(spell.level) ?? []
    list.push(spell)
    byLevel.set(spell.level, list)
  }
  return [...byLevel.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([level, spells]) => ({ level, spells }))
})
const hasCandidates = computed(() => preparedCandidates.value.length > 0 || wizardPrepareFromBook.value.length > 0 || wizardWriteToBook.value.length > 0)
const hasSpellContent = computed(() => hasSelectedSpells.value || hasCandidates.value)
/** 仅 prepared / spellbook 模式支持在角色卡切换准备（2014 规则长休可换）。 */
const canTogglePrepared = computed(() => spellcastingConfig.value?.mode === 'prepared' || spellcastingConfig.value?.mode === 'spellbook')
/** 已准备数量是否未达上限（决定候选项是否可准备）。 */
const canPrepareMore = computed(() => props.draft.spellSelections.preparedSpellIds.length < requiredSpellCount.value)
/** 点击切换准备状态：已准备项取消准备；候选项在未满时加入准备。 */
function togglePrepare(id: string): void {
  if (!canTogglePrepared.value) return
  const current = props.draft.spellSelections.preparedSpellIds
  const next = current.includes(id)
    ? current.filter((spellId) => spellId !== id)
    : canPrepareMore.value
      ? [...current, id]
      : current
  if (next === current) return
  emit('changeSpellSelections', { ...props.draft.spellSelections, preparedSpellIds: next })
}
/** 抄录法术书（仅 spellbook 模式）：弹层开关与可选预选法术。 */
const showTranscribeModal = ref(false)
const transcribePreselectId = ref<string>()
function openTranscribe(spellId?: string): void {
  transcribePreselectId.value = spellId
  showTranscribeModal.value = true
}
/** 法术是否通过抄录获得（展示"抄录"徽标与来源）。 */
function isTranscribedSpell(id: string): boolean {
  return props.draft.spellSelections.transcribedSpellIds.includes(id)
}
const hasSelectedSpells = computed(() => cantripSpells.value.length > 0 || preparedOrKnownSpells.value.length > 0 || spellbookSpells.value.length > 0 || magicalSecretsSpells.value.length > 0)

/** 吟游诗人魔法奥秘法术（来自时间线检查点选择，不计入已知法术上限）。 */
const magicalSecretsSpells = computed(() => getMagicalSecretsSpellIds(props.draft)
  .filter((id) => !manualSpellIds.value.has(id))
  .map((id) => rulesRepository.getSpell(id))
  .filter((spell): spell is SpellRule => Boolean(spell)))

function manualSpellDestinationLabel(entry: ManualAddedSpell): string {
  const labels = {
    known: '已掌握',
    'pact-known': '契约已掌握',
    'prepared-list': '额外准备列表',
    spellbook: '法术书',
    granted: '人工获得',
  } as const
  return `${labels[entry.destination]}${entry.prepared ? ' · 已准备' : ''}`
}

function isAlsoNormallyAcquired(spellId: string): boolean {
  return props.draft.spellSelections.cantripIds.includes(spellId)
    || props.draft.spellSelections.knownSpellIds.includes(spellId)
    || props.draft.spellSelections.preparedSpellIds.includes(spellId)
    || props.draft.spellSelections.spellbookSpellIds.includes(spellId)
    || getMagicalSecretsSpellIds(props.draft).includes(spellId)
    || getAlwaysPreparedSpellIds(props.draft).includes(spellId)
}

/** 已选选择类选项的详情条目（超魔、战技与其余子职选项、法术专精/招牌法术等）：供能力页签"已选选项详情"区块展示。 */
const selectedOptionEntries = computed(() => {
  const draft = props.draft
  if (!draft.classId) return []
  const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId })
  const choiceCheckpointIds = [
    ...(classInfo.value?.features ?? []).flatMap((feature) => feature.checkpointIds ?? []),
    ...(subclassInfo.value?.features ?? [])
      .filter((feature) => feature.requiresChoice)
      .map((feature) => `subclass-feature-${feature.id}`),
  ]
  const entries: {
    id: string
    name: string
    caption: string
    detail?: string
    expandedLabel: string
  }[] = []
  for (const checkpointId of choiceCheckpointIds) {
    if (!timeline.some((item) => item.id === checkpointId)) continue
    const selection = draft.selections.find((item) => item.checkpointId === checkpointId && !item.invalidatedAt)
    for (const optionId of selection?.optionIds ?? []) {
      const spell = rulesRepository.getSpell(optionId)
      if (spell) {
        entries.push({ id: optionId, name: spell.name, caption: formatSpellLabel(spell), detail: spell.description, expandedLabel: '法术效果' })
        continue
      }
      const option = rulesRepository.getOption(optionId)
      if (option) {
        entries.push({
          id: optionId,
          name: option.name,
          caption: option.englishName ?? '',
          detail: option.description,
          expandedLabel: optionId.startsWith('metamagic-') ? '超魔效果' : '选项详情',
        })
      }
    }
  }
  return entries
})

/** 选择类特性的完成度徽标：关联检查点已完成显示"已选择 N 项"，否则"需选择 N/M"。 */
function featureChoiceLabel(feature: ClassFeature): string {
  const checkpointIds = feature.checkpointIds ?? []
  if (checkpointIds.length === 0) return '需选择'
  const draft = props.draft
  if (!draft.classId) return '需选择'
  const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId })
  const unlocked = checkpointIds
    .map((checkpointId) => timeline.find((item) => item.id === checkpointId))
    .filter((checkpoint): checkpoint is NonNullable<typeof checkpoint> => Boolean(checkpoint))
  const total = unlocked.reduce((sum, checkpoint) => sum + checkpoint.minSelections, 0)
  const done = unlocked.reduce((sum, checkpoint) => sum
    + (draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)?.optionIds.length ?? 0), 0)
  return total === 0 ? '需选择' : done >= total ? `已选择 ${total} 项` : `需选择 ${done}/${total}`
}
function isPreparedSpell(id: string): boolean {
  return props.draft.spellSelections.preparedSpellIds.includes(id)
}
/** 物品页签：已装备（equippedQuantity > 0）与全部物品栏条目。 */
const equippedEntries = computed(() => props.draft.inventory.filter((entry) => entry.equippedQuantity > 0))
function equipmentName(itemId: string): string {
  return rulesRepository.getEquipment(itemId)?.name ?? itemId
}
function equipmentSummary(itemId: string): string {
  const equipment = rulesRepository.getEquipment(itemId)
  return equipment?.damageDice ? `${equipment.damageDice} ${equipment.damageType}伤害` : ''
}
/** 添加物品弹窗开关。 */
const showAddItemModal = ref(false)
function handleAddItem(payload: { itemId: string; quantity: number; equip: boolean }): void {
  // 防御：非可装备物品（如自定义物品）不允许装备。
  const equip = payload.equip && Boolean(rulesRepository.getEquipment(payload.itemId)?.equippable)
  const inventory = addAdventureItem(props.draft.inventory, props.draft.id, {
    itemId: payload.itemId,
    quantity: payload.quantity,
    equip,
  })
  emit('changeInventory', inventory)
  showAddItemModal.value = false
}
/** 数量调整弹窗：目标条目与开关。 */
const showAdjustItemModal = ref(false)
const adjustEntryId = ref('')
const adjustEntry = computed(() => props.draft.inventory.find((entry) => entry.id === adjustEntryId.value))
function openAdjustItem(entry: InventoryEntry): void {
  adjustEntryId.value = entry.id
  showAdjustItemModal.value = true
}
function handleAdjustItem(payload: { action: 'decrease' | 'increase' | 'remove'; count: number }): void {
  const entry = adjustEntry.value
  if (!entry) return
  let inventory = props.draft.inventory
  if (payload.action === 'remove') {
    inventory = removeAdventureItem(inventory, entry.id)
  } else if (payload.action === 'decrease') {
    inventory = decreaseAdventureItem(inventory, entry.id, payload.count)
  } else {
    inventory = increaseAdventureItem(inventory, entry.id, payload.count)
  }
  emit('changeInventory', inventory)
  showAdjustItemModal.value = false
}
/** 非冒险物品的来源徽标文案（不提供数量调整）。 */
function inventorySourceLabel(entry: InventoryEntry): string {
  return entry.sourceKind === 'class' || entry.sourceKind === 'background' ? '起始装备' : '旧草稿'
}
/** 金币调整：操作冒险净增金币（adventureGold），持有总额 = currency.gp + adventureGold。 */
const currencyInput = ref('')
const currencyError = ref('')
function applyCurrency(mode: 'add' | 'set' | 'decrease'): void {
  const raw = currencyInput.value.trim()
  if (!/^-?\d+$/.test(raw)) {
    currencyError.value = '请输入整数金币数'
    return
  }
  const value = Number(raw)
  const startingGold = props.draft.currency.gp
  // decrease 对输入值取绝对值作为扣减量（手机端无需输入负号）；输入 0 不产生变化。
  const nextGold = mode === 'add'
    ? props.draft.adventureGold + value
    : mode === 'set'
      ? value - startingGold
      : props.draft.adventureGold - Math.abs(value)
  if (startingGold + nextGold < 0) {
    currencyError.value = '金币不能为负'
    return
  }
  emit('changeAdventureGold', nextGold)
  currencyInput.value = ''
  currencyError.value = ''
}
const classInfo = computed(() => {
  const classId = props.draft.classId
  if (!classId) return undefined
  const classRule = rulesRepository.getClass(classId)
  if (!classRule) return undefined
  // 角色卡只展示当前等级已解锁的特性（更高等级的特性不显示）。
  const features = getClassFeatures2014(classId)
    .filter((feature) => feature.level <= props.draft.targetLevel)
  return { classRule, features }
})
/** 已选择的专长与属性提升（来自草稿 selections，只读展示）。 */
const featAndAsiEntries = computed(() => {
  const draft = props.draft
  if (!draft.classId) return []
  const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId })
  const entries: {
    id: string
    level: number
    label: string
    detail?: string
  }[] = []
  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue
    const checkpoint = timeline.find((item) => item.id === selection.checkpointId)
    for (const optionId of selection.optionIds) {
      if (optionId.startsWith('feat-')) {
        const feat = rulesRepository.feats.find((item) => item.id === optionId)
        if (feat) {
          entries.push({ id: feat.id, level: checkpoint?.level ?? 1, label: `${feat.name} · ${feat.englishName}`, detail: feat.detail })
        }
      } else if (optionId.startsWith('asi-')) {
        const improvement = decodeAbilityImprovement(optionId)
        if (!improvement) continue
        const text = improvement.mode === 'single'
          ? `属性提升（${ABILITY_LABELS[improvement.abilities[0]]}+2）`
          : `属性提升（${improvement.abilities.map((ability) => `${ABILITY_LABELS[ability]}+1`).join('、')}）`
        entries.push({ id: optionId, level: checkpoint?.level ?? 1, label: text })
      }
    }
  }
  return entries.sort((left, right) => left.level - right.level)
})
const subclassInfo = computed(() => {
  const subclassId = props.draft.subclassId
  if (!subclassId) return undefined
  const subclass = rulesRepository.getSubclass(subclassId)
  if (!subclass) return undefined
  // 角色卡只展示当前等级已解锁的特性（更高等级的特性不显示）。
  const features = getSubclassFeatures2014(subclassId)
    .filter((feature) => feature.level <= props.draft.targetLevel)
  return { subclass, features }
})
/** 存在失效选择或未完成的时间线检查点时，角色卡标记为"待补全"。 */
const needsReview = computed(() => {
  const draft = props.draft
  const hasInvalidated = draft.selections.some((item) => Boolean(item.invalidatedAt))
  if (!draft.classId) return hasInvalidated
  const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId })
  const incomplete = timeline.some((checkpoint) => {
    const selection = draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)
    return (selection?.optionIds.length ?? 0) < checkpoint.minSelections
  })
  return hasInvalidated || incomplete
})
/** 导出：菜单弹层；PDF/XLSX 走模板填充下载（hook 处理）。 */
const showExportMenu = ref(false)
function handleExportJson(): void {
  showExportMenu.value = false
  emit('export')
}
function handleExportPackage(): void {
  emit('exportPackage')
}
function handleExportXlsx(): void {
  emit('exportXlsx')
}
function handleExportPdf(): void {
  emit('exportPdf')
}
</script>

<template>
  <section class="character-sheet">
    <header :class="{ 'character-sheet__header--media': draft.media?.avatar || draft.media?.portrait }">
      <div class="character-sheet__header-content" :class="{ 'character-sheet__header-content--portrait': draft.media?.portrait }">
        <CharacterMediaImage v-if="draft.media?.avatar" class="character-sheet__avatar" :media-id="draft.media.avatar.mediaId" :alt="`${draft.name || '角色'}头像`" />
        <div>
          <span>规则预览 · 5e-2014</span>
          <h2>{{ draft.name || '未命名角色' }}</h2>
          <p>{{ identityLine }}</p>
          <div v-if="draft.classId" class="character-sheet__header-actions">
            <UiBadge v-if="needsReview" tone="warning">待补全</UiBadge>
            <button type="button" class="character-sheet__level-button" @click="$emit('adjustLevel')">调整等级</button>
            <button type="button" class="character-sheet__level-button" @click="editing.editMode.value = !editing.editMode.value">{{ editing.editMode.value ? '完成编辑' : '编辑角色卡' }}</button>
            <template v-if="editing.editMode.value">
              <button
                ref="moreButtonRef"
                type="button"
                class="character-sheet__level-button"
                :aria-expanded="showMoreActions"
                aria-controls="character-sheet-more-actions"
                @click="toggleMoreActions"
              >更多{{ showMoreActions ? ' ▴' : ' ▾' }}</button>
              <div v-if="showMoreActions" id="character-sheet-more-actions" ref="morePanelRef" class="character-sheet__more-panel">
                <button type="button" class="character-sheet__more-action" @click="showMediaEditor = true; showMoreActions = false">编辑角色形象</button>
                <button v-if="editing.hasEdits.value" type="button" class="character-sheet__more-action character-sheet__more-action--danger" @click="editing.showResetConfirm.value = true; showMoreActions = false">恢复系统默认</button>
              </div>
            </template>
          </div>
        </div>
      </div>
      <CharacterMediaImage v-if="draft.media?.portrait" class="character-sheet__portrait" :media-id="draft.media.portrait.mediaId" decorative :focus-x="draft.media.portrait.focusX" :focus-y="draft.media.portrait.focusY" />
    </header>
    <UiTabs v-model="activeTab" :items="tabs" />
    <div v-if="activeTab === 'overview'" class="character-sheet__stats">
      <EditableStatTile label="护甲等级" :value="derived.armorClass.value" :edit-mode="editing.editMode.value" :note="sourceNote(derived.armorClass.sources)" @commit="editing.commitDerived('armorClass', $event)" />
      <EditableStatTile label="最大生命值" :value="derived.hitPoints.value" :minimum="1" :edit-mode="editing.editMode.value" :note="sourceNote(derived.hitPoints.sources)" @commit="editing.commitDerived('hitPoints', $event)" />
      <EditableStatTile label="先攻" :value="derived.initiative.value" :edit-mode="editing.editMode.value" :note="sourceNote(derived.initiative.sources)" @commit="editing.commitDerived('initiative', $event)" />
      <EditableStatTile label="速度" :value="derived.speed.value" :minimum="0" suffix="尺" :edit-mode="editing.editMode.value" :note="sourceNote(derived.speed.sources)" @commit="editing.commitDerived('speed', $event)" />
      <EditableStatTile label="熟练加值" :value="derived.proficiencyBonus.value" :edit-mode="editing.editMode.value" :note="sourceNote(derived.proficiencyBonus.sources)" @commit="editing.commitProficiency" />
      <EditableStatTile v-for="(value, key) in derived.abilities" :key="key" :label="abilityLabel(String(key))" :value="value" :minimum="1" :edit-mode="editing.editMode.value" :note="abilityNote(key)" @commit="editing.commitAbility(key, $event)" />
    </div>
    <div v-else-if="activeTab === 'combat'" class="character-sheet__panel">
      <h3>主要武器</h3>
      <div class="character-sheet__combat-stats">
        <EditableStatTile label="武器命中加值" :value="derived.attackBonus.value" :edit-mode="editing.editMode.value" :note="sourceNote(derived.attackBonus.sources)" @commit="editing.commitDerived('attackBonus', $event)" />
        <EditableStatTile label="武器伤害加值" :value="derived.attackDamageBonus.value" :edit-mode="editing.editMode.value" :note="sourceNote(derived.attackDamageBonus.sources)" @commit="editing.commitDerived('attackDamageBonus', $event)" />
      </div>
    </div>
    <div v-else-if="activeTab === 'features'" class="character-sheet__derived">
      <section>
        <h3>豁免</h3>
        <div>
          <EditableStatTile
            v-for="(value, key) in derived.savingThrows"
            :key="key"
            :label="abilityLabel(String(key))"
            :value="value.value"
            :edit-mode="editing.editMode.value"
            :note="sourceNote(value.sources)"
            @commit="editing.commitSavingThrow(key, $event)"
          />
        </div>
      </section>
      <section>
        <h3>技能</h3>
        <div>
          <EditableStatTile
            v-for="(value, key) in derived.skills"
            :key="key"
            :label="skillLabel(String(key))"
            :value="value.value"
            :edit-mode="editing.editMode.value"
            :note="sourceNote(value.sources)"
            @commit="editing.commitSkill(String(key), $event)"
          />
        </div>
      </section>
      <section>
        <h3>被动察觉</h3>
        <div><EditableStatTile label="被动察觉" :value="derived.passivePerception.value" :edit-mode="editing.editMode.value" :note="sourceNote(derived.passivePerception.sources)" @commit="editing.commitDerived('passivePerception', $event)" /></div>
      </section>
      <section v-if="classInfo">
        <section v-if="classInfo.features.length" class="character-sheet__subclass-features">
          <header class="character-sheet__subclass-features-header">
            <h3>职业特性 · {{ classInfo.classRule.name }}</h3>
            <span v-if="classInfo.features.some((feature) => feature.status === 'index-only')" class="character-sheet__subclass-features-note">仅索引 · 未核验</span>
            <span v-else-if="classInfo.features.some((feature) => feature.status === 'selectable')" class="character-sheet__subclass-features-note">可选择 · 情境效果按摘要处理</span>
          </header>
          <ListShell>
            <ExpandableOptionCard
              v-for="feature in classInfo.features"
              :key="feature.id"
              :title="feature.name"
              :description="`${feature.level}级 · ${feature.englishName}`"
              expanded-label="特性详情"
            >
              <template #suffix>
                <template v-if="feature.requiresChoice">
                  <em class="character-sheet__feature-choice">{{ featureChoiceLabel(feature) }}</em>
                </template>
              </template>
              <template #expanded>{{ feature.description }}</template>
            </ExpandableOptionCard>
          </ListShell>
        </section>
        <p v-else class="character-sheet__empty-features">该职业在当前等级暂无已登记特性。</p>
      </section>
      <template v-if="subclassInfo">
        <section v-if="subclassInfo.features.length" class="character-sheet__subclass-features">
          <header class="character-sheet__subclass-features-header">
            <h3>子职特性 · {{ subclassInfo.subclass.name }}</h3>
            <span v-if="subclassInfo.features.some((feature) => feature.status === 'index-only')" class="character-sheet__subclass-features-note">仅索引 · 未核验</span>
            <span v-else-if="subclassInfo.features.some((feature) => feature.status === 'selectable')" class="character-sheet__subclass-features-note">可选择 · 情境效果按摘要处理</span>
          </header>
          <ListShell>
            <ExpandableOptionCard
              v-for="feature in subclassInfo.features"
              :key="feature.id"
              :title="feature.name"
              :description="`${feature.level}级 · ${feature.englishName}`"
              expanded-label="特性详情"
            >
              <template #suffix>
                <em v-if="feature.requiresChoice" class="character-sheet__feature-choice">需选择</em>
              </template>
              <template #expanded>{{ feature.description }}</template>
            </ExpandableOptionCard>
          </ListShell>
        </section>
        <p v-else class="character-sheet__empty-features">该子职在当前等级暂无已登记特性。</p>
      </template>
      <p v-else class="character-sheet__empty-features">尚未选择子职，完成时间线步骤后这里会展示子职特性。</p>
      <section v-if="featAndAsiEntries.length" class="character-sheet__subclass-features">
        <header class="character-sheet__subclass-features-header">
          <h3>专长与属性提升</h3>
        </header>
        <ListShell>
          <ExpandableOptionCard
            v-for="entry in featAndAsiEntries"
            :key="entry.id"
            :title="entry.label"
            :description="`${entry.level}级`"
            expanded-label="专长效果"
          >
            <template v-if="entry.detail" #expanded>{{ entry.detail }}</template>
          </ExpandableOptionCard>
        </ListShell>
      </section>
      <section v-if="selectedOptionEntries.length" class="character-sheet__subclass-features">
        <header class="character-sheet__subclass-features-header">
          <h3>已选选项详情</h3>
        </header>
        <ListShell>
          <ExpandableOptionCard
            v-for="entry in selectedOptionEntries"
            :key="entry.id"
            :title="entry.name"
            :description="entry.caption"
            :expanded-label="entry.expandedLabel"
          >
            <template v-if="entry.detail" #expanded>{{ entry.detail }}</template>
          </ExpandableOptionCard>
        </ListShell>
      </section>
      <p v-else-if="draft.classId" class="character-sheet__empty-features">尚未选择专长或属性提升。</p>
    </div>
    <div v-else-if="activeTab === 'spells'" class="character-sheet__spells">
      <div class="character-sheet__spell-stats">
        <EditableStatTile label="法术攻击" :value="derived.spellAttackBonus?.value ?? 0" :edit-mode="editing.editMode.value" :note="derived.spellAttackBonus ? sourceNote(derived.spellAttackBonus.sources) : '当前职业无施法能力'" @commit="editing.commitDerived('spellAttackBonus', $event)" />
        <EditableStatTile label="法术豁免 DC" :value="derived.spellSaveDc?.value ?? 0" :minimum="0" :edit-mode="editing.editMode.value" :note="derived.spellSaveDc ? sourceNote(derived.spellSaveDc.sources) : '当前职业无施法能力'" @commit="editing.commitDerived('spellSaveDc', $event)" />
      </div>
      <p v-if="spellSlots.length && !editing.editMode.value" class="character-sheet__spell-slots">法术位：{{ spellSlotsLabel }}</p>
      <section v-if="editing.editMode.value" class="character-sheet__spell-section">
        <h4>法术位总量</h4>
        <div class="character-sheet__slot-editor">
          <EditableStatTile v-for="slot in editableSpellSlots" :key="slot.level" :label="`${slot.level}环`" :value="slot.count" :minimum="0" :edit-mode="true" @commit="editing.commitSpellSlot(slot.level, $event)" />
        </div>
      </section>
      <section v-if="editing.editMode.value || manualAddedSpells.length" class="character-sheet__spell-section">
        <div class="character-sheet__spell-section-header">
          <h4>人工添加法术 · {{ manualAddedSpells.length }}</h4>
          <button v-if="editing.editMode.value" type="button" class="character-sheet__spell-action" @click="showManualSpellModal = true">添加法术</button>
        </div>
        <ListShell v-if="manualAddedSpells.length">
          <ExpandableOptionCard v-for="item in manualAddedSpells" :key="item.entry.spellId" :title="item.spell.name" :description="`${formatSpellLabel(item.spell)} · ${manualSpellDestinationLabel(item.entry)}`" expanded-label="法术效果">
            <template #suffix>
              <UiBadge tone="success">{{ isAlsoNormallyAcquired(item.entry.spellId) ? '系统获得 + 人工添加' : '人工添加' }}</UiBadge>
              <button v-if="editing.editMode.value" type="button" class="character-sheet__spell-action" @click="editing.removeSpell(item.entry.spellId)">移除</button>
            </template>
            <template #expanded>{{ item.spell.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
        <p v-else>尚未人工添加法术。</p>
      </section>
      <template v-if="hasSpellContent">
        <section v-if="cantripSpells.length" class="character-sheet__spell-section">
          <h4>戏法 · {{ draft.spellSelections.cantripIds.length }} / {{ requiredCantripCount }}</h4>
          <ListShell>
            <ExpandableOptionCard
              v-for="spell in cantripSpells"
              expanded-label="法术效果"
              :key="spell.id"
              :title="spell.name"
              :description="spell.englishName"
            >
              <template v-if="spell.description" #expanded>{{ spell.description }}</template>
            </ExpandableOptionCard>
          </ListShell>
        </section>
        <section v-if="preparedOrKnownSpells.length" class="character-sheet__spell-section">
          <h4>{{ preparedOrKnownLabel }} · {{ preparedOrKnownSpells.length }} / {{ requiredSpellCount }}</h4>
          <ListShell>
            <div v-for="group in spellGroups" :key="group.level" class="character-sheet__spell-level">
              <h5>{{ group.level }}环 · 已选 {{ group.spells.length }}</h5>
              <ExpandableOptionCard
                v-for="spell in group.spells"
                expanded-label="法术效果"
                :key="spell.id"
                :title="spell.name"
                :description="formatSpellLabel(spell)"
              >
                <template #suffix>
                  <button v-if="canTogglePrepared" type="button" class="character-sheet__spell-action" @click="togglePrepare(spell.id)">取消准备</button>
                </template>
                <template v-if="spell.description" #expanded>{{ spell.description }}</template>
              </ExpandableOptionCard>
            </div>
          </ListShell>
        </section>
        <section v-if="magicalSecretsSpells.length" class="character-sheet__spell-section">
          <h4>魔法奥秘 · {{ magicalSecretsSpells.length }}</h4>
          <ListShell>
            <div class="character-sheet__spell-level">
              <ExpandableOptionCard
                v-for="spell in magicalSecretsSpells"
                expanded-label="法术效果"
                :key="spell.id"
                :title="spell.name"
                :description="formatSpellLabel(spell)"
              >
                <template #suffix><UiBadge tone="success">魔法奥秘</UiBadge></template>
                <template v-if="spell.description" #expanded>{{ spell.description }}</template>
              </ExpandableOptionCard>
            </div>
          </ListShell>
        </section>
        <section v-if="preparedCandidates.length" class="character-sheet__spell-section">
          <h4>未准备法术 · {{ preparedCandidates.length }}</h4>
          <ListShell>
            <div v-for="group in preparedCandidateGroups" :key="group.level" class="character-sheet__spell-level">
              <h5>{{ group.level }}环 · {{ group.spells.length }} 个未准备</h5>
              <ExpandableOptionCard
                v-for="spell in group.spells"
                expanded-label="法术效果"
                :key="spell.id"
                :title="spell.name"
                :description="formatSpellLabel(spell)"
              >
                <template #suffix>
                  <button type="button" class="character-sheet__spell-action" :disabled="!canPrepareMore" @click="togglePrepare(spell.id)">
                    {{ canPrepareMore ? '准备' : '已满' }}
                  </button>
                </template>
                <template v-if="spell.description" #expanded>{{ spell.description }}</template>
              </ExpandableOptionCard>
            </div>
          </ListShell>
        </section>
        <section v-if="allPreparedSpells.length" class="character-sheet__spell-section">
          <h4>全部职业法术 · {{ allPreparedSpells.length }}</h4>
          <ListShell>
            <div v-for="group in allPreparedSpellGroups" :key="group.level" class="character-sheet__spell-level">
              <h5>{{ group.level === 0 ? '戏法' : `${group.level}环` }} · {{ group.spells.length }}</h5>
              <ExpandableOptionCard
                v-for="spell in group.spells"
                expanded-label="法术效果"
                :key="spell.id"
                :title="spell.name"
                :description="formatSpellLabel(spell)"
              >
                <template #suffix>
                  <em v-if="isPreparedSpell(spell.id)" class="character-sheet__spell-badge">已准备</em>
                </template>
                <template v-if="spell.description" #expanded>{{ spell.description }}</template>
              </ExpandableOptionCard>
            </div>
          </ListShell>
        </section>
        <section v-if="wizardPrepareFromBook.length" class="character-sheet__spell-section">
          <h4>未准备法术 · {{ wizardPrepareFromBook.length }}（法术书中未准备）</h4>
          <ListShell>
            <ExpandableOptionCard
              v-for="spell in wizardPrepareFromBook"
              expanded-label="法术效果"
              :key="spell.id"
              :title="spell.name"
              :description="formatSpellLabel(spell)"
            >
              <template #suffix>
                <button type="button" class="character-sheet__spell-action" :disabled="!canPrepareMore" @click="togglePrepare(spell.id)">
                  {{ canPrepareMore ? '准备' : '已满' }}
                </button>
              </template>
              <template v-if="spell.description" #expanded>{{ spell.description }}</template>
            </ExpandableOptionCard>
          </ListShell>
        </section>
        <section v-if="spellbookSpells.length" class="character-sheet__spell-section">
          <div class="character-sheet__spell-section-header">
            <h4>法术书 · {{ draft.spellSelections.spellbookSpellIds.filter((id) => !draft.spellSelections.transcribedSpellIds.includes(id)).length }} / {{ requiredSpellbookCount }}{{ draft.spellSelections.transcribedSpellIds.length ? `（抄录 ${draft.spellSelections.transcribedSpellIds.length}）` : '' }}</h4>
            <button v-if="spellcastingConfig?.mode === 'spellbook'" type="button" class="character-sheet__spell-action" aria-label="抄录法术书" @click="openTranscribe()">抄录法术</button>
          </div>
          <ListShell>
            <ExpandableOptionCard
              v-for="spell in spellbookSpells"
              expanded-label="法术效果"
              :key="spell.id"
              :title="spell.name"
              :description="formatSpellLabel(spell)"
            >
              <template #suffix>
                <em v-if="isPreparedSpell(spell.id)" class="character-sheet__spell-badge">已准备</em>
                <em v-if="isTranscribedSpell(spell.id)" class="character-sheet__spell-badge">抄录</em>
                <em class="character-sheet__spell-badge">在书中</em>
              </template>
              <template v-if="spell.description" #expanded>
                <p>{{ spell.description }}</p>
                <p v-if="isTranscribedSpell(spell.id)" class="character-sheet__spell-source">
                  通过抄录获得：费用 {{ spell.level * 50 }} GP（每环级 50 GP）。
                </p>
              </template>
            </ExpandableOptionCard>
          </ListShell>
        </section>
        <section v-if="wizardWriteToBook.length" class="character-sheet__spell-section">
          <h4>未写入法术书 · {{ wizardWriteToBook.length }}（可抄录扩充）</h4>
          <ListShell>
            <ExpandableOptionCard
              v-for="spell in wizardWriteToBook"
              expanded-label="法术效果"
              :key="spell.id"
              :title="spell.name"
              :description="formatSpellLabel(spell)"
            >
              <template #suffix>
                <button type="button" class="character-sheet__spell-action" :aria-label="`抄录${spell.name}`" @click="openTranscribe(spell.id)">抄录</button>
              </template>
              <template v-if="spell.description" #expanded>{{ spell.description }}</template>
            </ExpandableOptionCard>
          </ListShell>
        </section>
      </template>
      <p v-else>当前没有需要展示的法术。</p>
    </div>
    <div v-else-if="activeTab === 'items'" class="character-sheet__panel">
      <header class="character-sheet__items-header">
        <h3>已装备</h3>
        <button type="button" class="character-sheet__add-item" @click="showAddItemModal = true">添加物品</button>
      </header>
      <div v-if="equippedEntries.length" class="character-sheet__item-list">
        <ListShell>
          <ExpandableOptionCard
            v-for="entry in equippedEntries"
            :key="entry.id"
            :title="equipmentName(entry.itemId)"
            :description="equipmentSummary(entry.itemId)"
            expanded-label="装备详情"
          >
            <template #suffix>
              <span class="character-sheet__item-qty">×{{ entry.equippedQuantity }}</span>
              <em v-if="entry.sourceKind !== 'adventure'" class="character-sheet__item-source">{{ inventorySourceLabel(entry) }}</em>
              <button v-else type="button" class="character-sheet__spell-action" @click="openAdjustItem(entry)">调整</button>
            </template>
            <template #expanded>{{ rulesRepository.getEquipment(entry.itemId)?.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
      </div>
      <p v-else>尚未装备物品</p>
      <h3>物品栏</h3>
      <div v-if="draft.inventory.length" class="character-sheet__item-list">
        <ListShell>
          <ExpandableOptionCard
            v-for="entry in draft.inventory"
            :key="entry.id"
            :title="equipmentName(entry.itemId)"
            :description="equipmentSummary(entry.itemId)"
            expanded-label="装备详情"
          >
            <template #suffix>
              <span class="character-sheet__item-qty">×{{ entry.quantity }}</span>
              <em v-if="entry.sourceKind !== 'adventure'" class="character-sheet__item-source">{{ inventorySourceLabel(entry) }}</em>
              <button v-else type="button" class="character-sheet__spell-action" @click="openAdjustItem(entry)">调整</button>
            </template>
            <template #expanded>{{ rulesRepository.getEquipment(entry.itemId)?.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
      </div>
      <p v-else>尚无物品</p>
      <section class="character-sheet__coins">
        <header>
          <h3>金币</h3>
          <strong>{{ draft.currency.gp + draft.adventureGold }} GP</strong>
        </header>
        <div class="character-sheet__coin-actions">
          <input v-model="currencyInput" type="text" inputmode="numeric" placeholder="输入金币数" aria-label="金币调整数值" />
          <button type="button" @click="applyCurrency('add')">添加</button>
          <button type="button" @click="applyCurrency('decrease')">减少</button>
          <button type="button" @click="applyCurrency('set')">设置</button>
        </div>
        <p v-if="currencyError" class="character-sheet__coin-error">{{ currencyError }}</p>
        <small>起始金币 {{ draft.currency.gp }} GP，可随冒险增减</small>
      </section>
    </div>
    <div v-else class="character-sheet__panel"><h3>{{ tabs.find((tab) => tab.id === activeTab)?.label }}</h3><p>该部分将在对应职业与施法批次继续扩展。</p></div>
    <SpellbookTranscriptionModal
      :open="showTranscribeModal"
      :draft="draft"
      :preselect-spell-id="transcribePreselectId"
      @close="showTranscribeModal = false"
    />
    <AddManualSpellModal
      :open="showManualSpellModal"
      :mode="editing.spellMode.value"
      :existing-ids="existingSpellIds"
      @close="showManualSpellModal = false"
      @add="editing.addSpell"
    />
    <AddItemModal :open="showAddItemModal" :enabled-source-ids="draft.enabledSourceIds" @close="showAddItemModal = false" @add="handleAddItem" />
    <AdjustItemModal
      v-if="adjustEntry"
      :open="showAdjustItemModal"
      :item-name="equipmentName(adjustEntry.itemId)"
      :quantity="adjustEntry.quantity"
      :equipped-quantity="adjustEntry.equippedQuantity"
      @close="showAdjustItemModal = false"
      @adjust="handleAdjustItem"
    />
    <div class="character-sheet__footer">
      <button type="button" class="character-sheet__export" :disabled="Boolean(exportingFormat)" @click="showExportMenu = true">{{ exportingFormat ? '正在导出…' : '导出' }}</button>
      <button type="button" class="character-sheet__export character-sheet__export--secondary" @click="$emit('reedit')">重新编辑</button>
    </div>
    <UiModal :open="showMediaEditor" title="编辑角色形象" @close="showMediaEditor = false">
      <CharacterMediaEditor :draft="draft" @change="$emit('changeMedia', $event)" />
    </UiModal>
    <UiModal :open="showExportMenu" title="导出角色" @close="showExportMenu = false">
      <div class="character-sheet__export-menu">
        <UiNotice v-if="exportNotice" :tone="exportNotice.tone" :title="exportNotice.title">{{ exportNotice.message }}</UiNotice>
        <button type="button" class="character-sheet__export-menu-item" :disabled="Boolean(exportingFormat)" @click="handleExportPdf">{{ exportingFormat === 'pdf' ? '正在生成 PDF…' : '导出 PDF 角色卡' }}</button>
        <button type="button" class="character-sheet__export-menu-item" :disabled="Boolean(exportingFormat)" @click="handleExportXlsx">{{ exportingFormat === 'xlsx' ? '正在生成 XLSX…' : '导出 XLSX 自动计算卡' }}</button>
        <button type="button" class="character-sheet__export-menu-item" :disabled="Boolean(exportingFormat)" @click="handleExportJson">导出 JSON 数据文件（不含图片）</button>
        <button type="button" class="character-sheet__export-menu-item" :disabled="Boolean(exportingFormat)" @click="handleExportPackage">{{ exportingFormat === 'zip' ? '正在生成角色包…' : '导出完整角色包（含图片）' }}</button>
      </div>
    </UiModal>
    <UiModal :open="editing.showResetConfirm.value" title="恢复系统默认" @close="editing.showResetConfirm.value = false">
      <p>这会清除全部人工数值调整和人工添加法术，但不会删除正常车卡选择、抄录法术、装备或跑团状态。</p>
      <template #footer>
        <button type="button" class="character-sheet__export character-sheet__export--secondary" @click="editing.showResetConfirm.value = false">取消</button>
        <button type="button" class="character-sheet__export" @click="editing.resetAll">确认恢复</button>
      </template>
    </UiModal>
  </section>
</template>

<style scoped lang="scss">
.character-sheet {
  display: grid;
  gap: 0.9rem;

  > header {
    position: relative;
    padding: 1rem;
    border: 1px solid #dfc49a;
    border-radius: var(--radius-lg);
    background: linear-gradient(125deg, var(--color-gold-soft), var(--color-surface));
    overflow: hidden;

    span { color: var(--color-success); font-size: 0.7rem; font-weight: 700; }
    h2 { margin: 0.4rem 0 0; }
    p { margin: 0.25rem 0 0; color: var(--color-text-muted); font-size: 0.8rem; }
  }

  &__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }

  &__combat-stats, &__slot-editor {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  &__header--media { min-height: 9rem; }

  &__header-content { position: relative; z-index: 2; display: flex; align-items: center; gap: 0.8rem; &--portrait { max-width: 72%; } }
  &__avatar { width: 4.5rem; height: 4.5rem; flex: none; border: 2px solid var(--color-surface); border-radius: 50%; object-fit: cover; }
  &__portrait { position: absolute; z-index: 1; inset: 0 0 0 auto; width: 45%; height: 100%; object-fit: cover; mask-image: linear-gradient(to right, transparent, #000 40%); opacity: 0.9; }

  &__panel {
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);

    h3 { margin: 0; font-size: 0.85rem; }
    p, small { color: var(--color-text-muted); }
  }

  &__derived {
    display: grid;
    gap: 1rem;

    section {
      display: grid;
      gap: 0.5rem;

      h3 { margin: 0; }

      > div {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }
    }
  }

  &__spells {
    display: grid;
    gap: 0.75rem;
  }

  &__spell-slots {
    margin: 0;
    color: var(--color-primary);
    font-weight: 600;
  }

  &__spell-section {
    display: grid;
    gap: 0.6rem;
    padding: 0.9rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);

    h4 { margin: 0; }
  }

  &__spell-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__spell-level {
    display: grid;
    gap: 0.6rem;

    h5 { margin: 0.15rem 0 0; color: var(--color-text-muted); font-size: 0.72rem; }
  }

  &__spell-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2.25rem;
    padding: 0 0.7rem;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-md);
    color: var(--color-primary);
    background: var(--color-surface);
    font-size: 0.7rem;
    font-weight: 700;

    &:disabled {
      border-color: var(--color-border);
      color: var(--color-text-muted);
      background: var(--color-surface);
    }
  }

  &__spell-badge {
    padding: 0.05rem 0.4rem;
    border: 1px solid var(--color-primary);
    border-radius: 999px;
    color: var(--color-primary);
    font-size: 0.62rem;
    font-style: normal;
    white-space: nowrap;
  }

  &__spell-source {
    margin: 0.4rem 0 0;
    color: var(--color-text-muted);
    font-size: 0.68rem;
  }

  &__items-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
  }

  &__add-item {
    min-height: 2.75rem;
    padding: 0 1.1rem;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-md);
    color: var(--color-surface);
    background: var(--color-primary);
    font-size: 0.8rem;
    font-weight: 700;
    white-space: nowrap;
  }

  &__coins {
    display: grid;
    gap: 0.6rem;
    margin-top: 0.8rem;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;

      h3 {
        margin: 0;
        font-size: 0.85rem;
      }

      strong {
        color: var(--color-primary);
        font-size: 1rem;
      }
    }

    small {
      color: var(--color-text-muted);
    }
  }

  &__coin-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto auto;
    gap: 0.5rem;

    input {
      min-height: 2.75rem;
      min-width: 0;
      padding: 0 0.7rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }

    button {
      min-height: 2.75rem;
      min-width: 4.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-primary);
      background: var(--color-surface);
      font-size: 0.75rem;
      font-weight: 700;
    }
  }

  &__coin-error {
    margin: 0;
    color: var(--color-danger, #c0392b);
    font-size: 0.72rem;
  }

  &__item-qty {
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 700;
  }

  &__item-source {
    padding: 0.05rem 0.4rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    color: var(--color-text-muted);
    font-size: 0.62rem;
    font-style: normal;
    white-space: nowrap;
  }

  &__spell-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  &__export {
    min-height: 3rem;
    border: 0;
    border-radius: var(--radius-md);
    color: white;
    background: var(--color-primary);
    font-weight: 700;

    &:disabled { cursor: wait; opacity: 0.65; }
  }

  &__export-menu { display: grid; gap: 0.5rem; }

  &__export-menu-item {
    min-height: 3rem;
    padding: 0 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-primary);
    background: var(--color-surface);
    font-weight: 700;
    text-align: left;

    &:disabled { cursor: wait; opacity: 0.6; }
  }

  &__footer { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

  &__export--secondary { color: var(--color-primary); background: var(--color-surface); border: 1px solid var(--color-border); }

  &__header-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem; margin-top: 0.6rem; }

  &__level-button,
  &__more-action { min-height: 2.25rem; padding: 0 0.7rem; border: 1px solid var(--color-primary); border-radius: var(--radius-md); color: var(--color-primary); background: var(--color-surface); font-size: 0.75rem; font-weight: 700; white-space: nowrap; }

  &__more-panel { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.35rem; width: 100%; }
  &__more-action--danger { color: var(--color-error); border-color: currentColor; }

  &__subclass-features { display: grid; gap: 0.5rem; }
  &__subclass-features-header { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  &__subclass-features-header h3 { margin: 0; font-size: 0.85rem; }
  &__subclass-features-note { padding: 0.1rem 0.45rem; border-radius: 999px; color: var(--color-warning, #b58900); background: rgba(181, 137, 0, 0.12); font-size: 0.66rem; white-space: nowrap; }
  &__empty-features { color: var(--color-text-muted); font-size: 0.78rem; }
  &__feature-list { margin: 0; padding: 0; list-style: none; }
  &__feature { display: flex; gap: 0.6rem; padding: 0.45rem 0; border-bottom: 1px solid var(--color-border); }
  &__feature:last-child { border-bottom: 0; }
  &__feature-level { align-self: center; flex: none; padding: 0.1rem 0.5rem; border-radius: 999px; color: white; background: var(--color-primary); font-size: 0.66rem; font-weight: 700; line-height: 1.2; }
  &__feature > div { display: grid; gap: 0.2rem; min-width: 0; }
  &__feature strong { font-size: 0.8rem; }
  &__feature strong small { color: var(--color-text-muted); font-weight: 400; }
  &__feature-choice { margin-left: 0.3rem; padding: 0.05rem 0.4rem; border: 1px solid var(--color-primary); border-radius: 999px; color: var(--color-primary); font-size: 0.62rem; font-style: normal; vertical-align: 0.1em; }
  &__feature-selected { margin-left: 0.3rem; color: var(--color-text-muted); font-size: 0.68rem; line-height: 1.5; }
  &__feature p { margin: 0; color: var(--color-text-muted); font-size: 0.72rem; line-height: 1.45; }
}
</style>
