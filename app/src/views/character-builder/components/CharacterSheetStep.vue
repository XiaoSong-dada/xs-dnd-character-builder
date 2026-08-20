<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import AddItemModal from './AddItemModal.vue'
import AdjustItemModal from './AdjustItemModal.vue'
import CharacterPrintSheet from './CharacterPrintSheet.vue'
import UiModal from '@/components/ui/UiModal.vue'
import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import StatTile from '@/components/ui/StatTile.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import { ABILITY_LABELS } from '@/rules/data/feats-2014'
import { decodeAbilityImprovement } from '@/rules/feats'
import { rulesRepository } from '@/rules/repository'
import { addAdventureItem, decreaseAdventureItem, increaseAdventureItem, removeAdventureItem } from '@/rules/starting-equipment'
import { getMaximumSpellLevel, getRequiredCantripCount, getRequiredSpellbookCount, getRequiredSpellCount, getSelectedSpellIds, getSpellCandidates, getSpellSlots } from '@/rules/spellcasting'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { getClassFeatures2014 } from '@/rules/data/class-features-2014'
import { buildTimeline } from '@/rules/timeline'
import type { AbilityKey, CharacterDraft, DerivedCharacter, InventoryEntry, SpellSelections } from '@/types/character'
import type { SpellRule } from '@/types/rules'

const props = defineProps<{ draft: CharacterDraft; derived: DerivedCharacter }>()
const emit = defineEmits<{
  export: []
  exportXlsx: []
  adjustLevel: []
  reedit: []
  changeSpellSelections: [value: SpellSelections]
  changeInventory: [inventory: readonly InventoryEntry[]]
  changeAdventureGold: [adventureGold: number]
}>()
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
const spellcastingConfig = computed(() => rulesRepository.getSpellcastingConfig(props.draft))
const spellSlots = computed(() => spellcastingConfig.value ? getSpellSlots(spellcastingConfig.value, props.draft.targetLevel) : [])
const spellSlotsLabel = computed(() => {
  if (!spellSlots.value.length) return ''
  if (spellSlots.value[0]?.pact) {
    const slot = spellSlots.value[0]
    return `契约法术位：${slot.count} 个 ${slot.level} 环（短休恢复）`
  }
  return spellSlots.value.map((slot) => `${slot.level}环×${slot.count}`).join(' · ')
})
const cantripSpells = computed(() => props.draft.spellSelections.cantripIds
  .map((id) => rulesRepository.getSpell(id))
  .filter((spell): spell is SpellRule => Boolean(spell)))
const preparedOrKnownSpells = computed(() => {
  const config = spellcastingConfig.value
  if (!config) return []
  // 已准备 / 已掌握法术以规则层 getSelectedSpellIds 为唯一事实源（覆盖 spellbook/prepared/known/pact 四种模式）。
  return getSelectedSpellIds(props.draft, config)
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell))
})
const spellbookSpells = computed(() => {
  if (spellcastingConfig.value?.mode !== 'spellbook') return []
  return props.draft.spellSelections.spellbookSpellIds
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
const hasSelectedSpells = computed(() => cantripSpells.value.length > 0 || preparedOrKnownSpells.value.length > 0 || spellbookSpells.value.length > 0)
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
function applyCurrency(mode: 'add' | 'set'): void {
  const raw = currencyInput.value.trim()
  if (!/^-?\d+$/.test(raw)) {
    currencyError.value = '请输入整数金币数'
    return
  }
  const value = Number(raw)
  const startingGold = props.draft.currency.gp
  const nextGold = mode === 'add' ? props.draft.adventureGold + value : value - startingGold
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
/** 导出：菜单弹层与 PDF 打印视图。 */
const showExportMenu = ref(false)
const showPrintView = ref(false)
function handleExportJson(): void {
  showExportMenu.value = false
  emit('export')
}
function handleExportXlsx(): void {
  showExportMenu.value = false
  emit('exportXlsx')
}
function handleExportPdf(): void {
  showExportMenu.value = false
  showPrintView.value = true
  nextTick(() => window.print())
}
function closePrintView(): void {
  showPrintView.value = false
}
onMounted(() => window.addEventListener('afterprint', closePrintView))
onBeforeUnmount(() => window.removeEventListener('afterprint', closePrintView))
</script>

<template>
  <section class="character-sheet">
    <header>
      <span>规则预览 · 5e-2014</span>
      <h2>{{ draft.name || '未命名角色' }}</h2>
      <p>{{ identityLine }}</p>
      <div v-if="draft.classId" class="character-sheet__header-actions">
        <UiBadge v-if="needsReview" tone="warning">待补全</UiBadge>
        <button type="button" class="character-sheet__level-button" @click="$emit('adjustLevel')">调整等级</button>
      </div>
    </header>
    <UiTabs v-model="activeTab" :items="tabs" />
    <div v-if="activeTab === 'overview'" class="character-sheet__stats">
      <StatTile label="护甲等级" :value="derived.armorClass.value" :note="derived.armorClass.sources.map((item) => item.label).join(' + ')" />
      <StatTile label="生命值" :value="derived.hitPoints.value" note="职业生命骰 + 体质" />
      <StatTile label="先攻" :value="derived.initiative.value >= 0 ? `+${derived.initiative.value}` : derived.initiative.value" note="敏捷调整值" />
      <StatTile label="速度" :value="`${derived.speed.value}尺`" :note="derived.speed.sources[0]?.detail" />
      <StatTile v-for="(value, key) in derived.abilities" :key="key" :label="abilityLabel(String(key))" :value="value" :note="`${derived.modifiers[key] >= 0 ? '+' : ''}${derived.modifiers[key]}`" />
    </div>
    <div v-else-if="activeTab === 'combat'" class="character-sheet__panel"><h3>主要武器</h3><p>命中 +{{ derived.attackBonus.value }} · 伤害骰 + {{ derived.attackDamageBonus.value }}</p><small>{{ derived.attackBonus.sources.map((item) => `${item.label} ${item.value >= 0 ? '+' : ''}${item.value}`).join('，') }}</small></div>
    <div v-else-if="activeTab === 'features'" class="character-sheet__derived">
      <section>
        <h3>豁免</h3>
        <div>
          <StatTile
            v-for="(value, key) in derived.savingThrows"
            :key="key"
            :label="abilityLabel(String(key))"
            :value="value.value >= 0 ? `+${value.value}` : value.value"
            :note="value.sources.map((source) => source.label).join(' + ')"
          />
        </div>
      </section>
      <section>
        <h3>技能</h3>
        <div>
          <StatTile
            v-for="(value, key) in derived.skills"
            :key="key"
            :label="skillLabel(String(key))"
            :value="value.value >= 0 ? `+${value.value}` : value.value"
            :note="value.sources.map((source) => source.detail).join(' · ')"
          />
        </div>
      </section>
      <section v-if="classInfo">
        <section v-if="classInfo.features.length" class="character-sheet__subclass-features">
          <header class="character-sheet__subclass-features-header">
            <h3>职业特性 · {{ classInfo.classRule.name }}</h3>
            <span v-if="classInfo.features.some((feature) => feature.status === 'index-only')" class="character-sheet__subclass-features-note">仅索引 · 未核验</span>
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
                <em v-if="feature.requiresChoice" class="character-sheet__feature-choice">需选择</em>
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
      <p v-else-if="draft.classId" class="character-sheet__empty-features">尚未选择专长或属性提升。</p>
    </div>
    <div v-else-if="activeTab === 'spells'" class="character-sheet__spells">
      <div class="character-sheet__spell-stats">
        <StatTile label="法术攻击" :value="derived.spellAttackBonus ? `+${derived.spellAttackBonus.value}` : '—'" :note="derived.spellAttackBonus?.sources.map((item) => item.label).join(' + ') ?? '当前职业无施法能力'" />
        <StatTile label="法术豁免 DC" :value="derived.spellSaveDc?.value ?? '—'" :note="derived.spellSaveDc?.sources.map((item) => item.label).join(' + ') ?? '当前职业无施法能力'" />
      </div>
      <p v-if="spellSlots.length" class="character-sheet__spell-slots">法术位：{{ spellSlotsLabel }}</p>
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
                :description="`${spell.level}环 · ${spell.englishName}`"
              >
                <template #suffix>
                  <button v-if="canTogglePrepared" type="button" class="character-sheet__spell-action" @click="togglePrepare(spell.id)">取消准备</button>
                </template>
                <template v-if="spell.description" #expanded>{{ spell.description }}</template>
              </ExpandableOptionCard>
            </div>
          </ListShell>
        </section>
        <section v-if="spellbookSpells.length" class="character-sheet__spell-section">
          <h4>法术书 · {{ draft.spellSelections.spellbookSpellIds.length }} / {{ requiredSpellbookCount }}</h4>
          <ListShell>
            <ExpandableOptionCard
              v-for="spell in spellbookSpells"
              expanded-label="法术效果"
              :key="spell.id"
              :title="spell.name"
              :description="`${spell.level}环 · ${spell.englishName}`"
            >
              <template #suffix>
                <em v-if="isPreparedSpell(spell.id)" class="character-sheet__spell-badge">已准备</em>
                <em class="character-sheet__spell-badge">在书中</em>
              </template>
              <template v-if="spell.description" #expanded>{{ spell.description }}</template>
            </ExpandableOptionCard>
          </ListShell>
        </section>
        <section v-if="preparedCandidates.length" class="character-sheet__spell-section">
          <h4>可选法术 · {{ preparedCandidates.length }}</h4>
          <ListShell>
            <div v-for="group in preparedCandidateGroups" :key="group.level" class="character-sheet__spell-level">
              <h5>{{ group.level }}环 · {{ group.spells.length }} 个可准备</h5>
              <ExpandableOptionCard
                v-for="spell in group.spells"
                expanded-label="法术效果"
                :key="spell.id"
                :title="spell.name"
                :description="spell.englishName"
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
        <section v-if="wizardPrepareFromBook.length" class="character-sheet__spell-section">
          <h4>候选准备 · {{ wizardPrepareFromBook.length }}（长休可从法术书换入）</h4>
          <ListShell>
            <ExpandableOptionCard
              v-for="spell in wizardPrepareFromBook"
              expanded-label="法术效果"
              :key="spell.id"
              :title="spell.name"
              :description="`${spell.level}环 · ${spell.englishName}`"
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
        <section v-if="wizardWriteToBook.length" class="character-sheet__spell-section">
          <h4>未写入法术书 · {{ wizardWriteToBook.length }}（升级时可扩充）</h4>
          <ListShell>
            <ExpandableOptionCard
              v-for="spell in wizardWriteToBook"
              expanded-label="法术效果"
              :key="spell.id"
              :title="spell.name"
              :description="`${spell.level}环 · ${spell.englishName}`"
            >
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
          <input v-model="currencyInput" type="text" inputmode="numeric" placeholder="输入金币数（添加可为负）" aria-label="金币调整数值" />
          <button type="button" @click="applyCurrency('add')">添加</button>
          <button type="button" @click="applyCurrency('set')">设置</button>
        </div>
        <p v-if="currencyError" class="character-sheet__coin-error">{{ currencyError }}</p>
        <small>起始金币 {{ draft.currency.gp }} GP，可随冒险增减</small>
      </section>
    </div>
    <div v-else class="character-sheet__panel"><h3>{{ tabs.find((tab) => tab.id === activeTab)?.label }}</h3><p>该部分将在对应职业与施法批次继续扩展。</p></div>
    <AddItemModal :open="showAddItemModal" @close="showAddItemModal = false" @add="handleAddItem" />
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
      <button type="button" class="character-sheet__export" @click="showExportMenu = true">导出</button>
      <button type="button" class="character-sheet__export character-sheet__export--secondary" @click="$emit('reedit')">重新编辑</button>
    </div>
    <UiModal :open="showExportMenu" title="导出角色" @close="showExportMenu = false">
      <div class="character-sheet__export-menu">
        <button type="button" class="character-sheet__export-menu-item" @click="handleExportPdf">导出 PDF 角色卡（打印）</button>
        <button type="button" class="character-sheet__export-menu-item" @click="handleExportXlsx">导出 XLSX 自动计算卡</button>
        <button type="button" class="character-sheet__export-menu-item" @click="handleExportJson">导出 JSON 数据文件</button>
      </div>
    </UiModal>
    <CharacterPrintSheet :open="showPrintView" :draft="draft" :derived="derived" @close="closePrintView" />
  </section>
</template>

<style scoped lang="scss">
.character-sheet {
  display: grid;
  gap: 0.9rem;

  > header {
    padding: 1rem;
    border: 1px solid #dfc49a;
    border-radius: var(--radius-lg);
    background: linear-gradient(125deg, var(--color-gold-soft), var(--color-surface));

    span { color: var(--color-success); font-size: 0.7rem; font-weight: 700; }
    h2 { margin: 0.4rem 0 0; }
    p { margin: 0.25rem 0 0; color: var(--color-text-muted); font-size: 0.8rem; }
  }

  &__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }

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
    grid-template-columns: minmax(0, 1fr) auto auto;
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

  &__export { min-height: 3rem; border: 0; border-radius: var(--radius-md); color: white; background: var(--color-primary); font-weight: 700; }

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
  }

  &__footer { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

  &__export--secondary { color: var(--color-primary); background: var(--color-surface); border: 1px solid var(--color-border); }

  &__header-actions { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.6rem; }

  &__level-button { min-height: 2.25rem; padding: 0 0.9rem; border: 1px solid var(--color-primary); border-radius: var(--radius-md); color: var(--color-primary); background: var(--color-surface); font-size: 0.75rem; font-weight: 700; }

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
  &__feature p { margin: 0; color: var(--color-text-muted); font-size: 0.72rem; line-height: 1.45; }
}
</style>
