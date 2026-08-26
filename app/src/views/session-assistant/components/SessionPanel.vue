<script setup lang="ts">
import { computed, ref } from 'vue'

import AddItemModal from '@/components/AddItemModal.vue'
import AdjustItemModal from '@/components/AdjustItemModal.vue'
import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import StatTile from '@/components/ui/StatTile.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import { SpellbookTranscriptionModal } from '@/features/spellbook-transcription'
import { ABILITY_LABELS } from '@/rules/data/feats-2014'
import { getClassFeatures2014 } from '@/rules/data/class-features-2014'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { decodeAbilityImprovement } from '@/rules/feats'
import { rulesRepository } from '@/rules/repository'
import { getAvailableSlotLevels } from '@/rules/session-state'
import { addAdventureItem, decreaseAdventureItem, increaseAdventureItem, removeAdventureItem } from '@/rules/starting-equipment'
import { getMaximumSpellLevel, getSelectedSpellIds, getSpellcastingConfig } from '@/rules/spellcasting'
import { buildTimeline } from '@/rules/timeline'
import { useSessionAssistantStore } from '@/stores/session-assistant'
import { DEBUFF_STATUSES, EXHAUSTION_DESCRIPTION } from '@/types/session-state'
import type { AbilityKey, CharacterDraft, InventoryEntry } from '@/types/character'
import type { SpellRule } from '@/types/rules'
import { formatSpellLabel } from '@/utils/format-spell-label'
import { useSessionPanel } from '../hooks/useSessionPanel'

const props = defineProps<{ draft: CharacterDraft }>()

const panel = useSessionPanel(computed(() => props.draft))

const tabs = [
  { id: 'overview', label: '总览' },
  { id: 'features', label: '能力' },
  { id: 'combat', label: '战斗' },
  { id: 'spells', label: '法术' },
  { id: 'items', label: '物品' },
] as const
// 页签状态持久化（切页/刷新保持，决策 19）；旧数据中的已移除页签（如 status）回退总览。
const viewStore = useSessionAssistantStore()
if (!tabs.some((item) => item.id === viewStore.activeTab)) {
  viewStore.setActiveTab('overview')
}
const activeTab = computed({
  get: () => viewStore.activeTab,
  set: (tab: string) => viewStore.setActiveTab(tab),
})

// ---- 输入量（空输入按 1）----
const hpInput = ref('')
function hpAmount(): number {
  const raw = hpInput.value.trim()
  return /^\d+$/.test(raw) ? Number(raw) : 1
}

// ---- 状态 tag ----
const mountedStatuses = computed(() => {
  const state = panel.sessionState.value
  if (!state) return []
  return DEBUFF_STATUSES.filter((status) => state.debuffs.includes(status.id))
})
const detailStatus = ref<{ id: string; name: string; description: string }>()
function openStatusDetail(id: string): void {
  const status = DEBUFF_STATUSES.find((item) => item.id === id)
  if (!status) return
  detailStatus.value = status
}
function openExhaustionDetail(): void {
  detailStatus.value = {
    id: 'exhaustion',
    name: '力竭',
    description: EXHAUSTION_DESCRIPTION,
  }
}

// ---- 长休确认 ----
const showLongRestConfirm = ref(false)
function confirmLongRest(): void {
  showLongRestConfirm.value = false
  panel.longRest()
}

// ---- 物品 ----
const showAddItemModal = ref(false)
const adjustEntry = ref<InventoryEntry>()
const showAdjustItemModal = ref(false)

function handleAddItem(payload: { itemId: string; quantity: number; equip: boolean }): void {
  // 防御：非可装备物品（如自定义物品）不允许装备。
  const equip = payload.equip && Boolean(rulesRepository.getEquipment(payload.itemId)?.equippable)
  const inventory = addAdventureItem(props.draft.inventory, props.draft.id, {
    itemId: payload.itemId,
    quantity: payload.quantity,
    equip,
  })
  void updateInventory(inventory)
  showAddItemModal.value = false
}
function openAdjustItem(entry: InventoryEntry): void {
  adjustEntry.value = entry
  showAdjustItemModal.value = true
}
function handleAdjustItem(payload: { action: 'decrease' | 'increase' | 'remove'; count: number }): void {
  const entry = adjustEntry.value
  if (!entry) return
  const inventory = payload.action === 'remove'
    ? removeAdventureItem(props.draft.inventory, entry.id)
    : payload.action === 'decrease'
      ? decreaseAdventureItem(props.draft.inventory, entry.id, payload.count)
      : increaseAdventureItem(props.draft.inventory, entry.id, payload.count)
  void updateInventory(inventory)
  showAdjustItemModal.value = false
}
function updateInventory(inventory: readonly InventoryEntry[]): void {
  void panel.updateInventory(inventory)
}

function equipmentName(itemId: string): string {
  return rulesRepository.getEquipment(itemId)?.name ?? itemId
}
function equipmentDescription(itemId: string): string {
  return rulesRepository.getEquipment(itemId)?.description ?? ''
}
function equipmentSummary(itemId: string): string {
  const equipment = rulesRepository.getEquipment(itemId)
  if (!equipment) return ''
  if (equipment.damageDice) return `${equipment.damageDice} ${equipment.damageType ?? ''}伤害`
  if (equipment.armorBase) return `AC ${equipment.armorBase}${equipment.addsDexterityToArmor ? ' + 敏捷调整' : ''}`
  return equipment.description
}
/** 武器条目：命中/伤害加值标签。 */
function weaponBonusLabel(entry: InventoryEntry): string {
  const equipment = rulesRepository.getEquipment(entry.itemId)
  if (equipment?.category !== 'weapon') return ''
  return `命中 +${panel.derived.value.attackBonus.value} · 伤害 +${panel.derived.value.attackDamageBonus.value}`
}
function inventorySourceLabel(entry: InventoryEntry): string {
  return entry.sourceKind === 'class' || entry.sourceKind === 'background' ? '起始装备' : '冒险获得'
}

// ---- 总览派生 ----
const abilityKeys = Object.keys(ABILITY_LABELS) as Array<keyof typeof ABILITY_LABELS>
const equippedEntries = computed(() => props.draft.inventory.filter((entry) => entry.equippedQuantity > 0))
const carriedEntries = computed(() => props.draft.inventory.filter((entry) => entry.equippedQuantity === 0))

// ---- 能力页签（R5B，复用角色卡同套组件与规则函数）----
function abilityLabel(key: string): string {
  return ABILITY_LABELS[key as AbilityKey] ?? key
}
function skillLabel(skillId: string): string {
  return rulesRepository.getOption(skillId)?.name ?? skillId
}
const className = computed(() => props.draft.classId ? (rulesRepository.getClass(props.draft.classId)?.name ?? '') : '')
const classFeatures = computed(() =>
  props.draft.classId
    ? getClassFeatures2014(props.draft.classId).filter((feature) => feature.level <= props.draft.targetLevel)
    : [],
)
const subclassName = computed(() => props.draft.subclassId ? (rulesRepository.getSubclass(props.draft.subclassId)?.name ?? '') : '')
const subclassFeatures = computed(() =>
  props.draft.subclassId
    ? getSubclassFeatures2014(props.draft.subclassId).filter((feature) => feature.level <= props.draft.targetLevel)
    : [],
)
const featAndAsiEntries = computed(() => {
  const draft = props.draft
  if (!draft.classId) return []
  const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId })
  const entries: { id: string; level: number; label: string; detail?: string }[] = []
  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue
    const checkpoint = timeline.find((item) => item.id === selection.checkpointId)
    for (const optionId of selection.optionIds) {
      if (optionId.startsWith('feat-')) {
        const feat = rulesRepository.feats.find((item) => item.id === optionId)
        if (feat) entries.push({ id: feat.id, level: checkpoint?.level ?? 1, label: `${feat.name} · ${feat.englishName}`, detail: feat.detail })
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

// ---- 法术页签（R5A）----
const spellcastingConfig = computed(() => getSpellcastingConfig(props.draft))
const preparedOrKnownLabel = computed(() =>
  spellcastingConfig.value?.mode === 'prepared' || spellcastingConfig.value?.mode === 'spellbook' ? '已准备' : '已掌握',
)
const selectedSpells = computed(() => {
  const config = spellcastingConfig.value
  if (!config) return []
  return getSelectedSpellIds(props.draft, config)
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell))
})
const cantripSpells = computed(() =>
  props.draft.spellSelections.cantripIds
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell)),
)
const spellGroups = computed(() => {
  const config = spellcastingConfig.value
  if (!config) return []
  const maximumLevel = getMaximumSpellLevel(config, props.draft.targetLevel)
  return Array.from({ length: maximumLevel }, (_, index) => index + 1)
    .map((level) => ({ level, spells: selectedSpells.value.filter((spell) => spell.level === level) }))
    .filter((group) => group.spells.length)
})
function slotCount(level: number): number {
  return panel.spellSlots.value.find((slot) => slot.level === level)?.count ?? 0
}
function castableLevels(spell: SpellRule): readonly number[] {
  const state = panel.sessionState.value
  if (!state) return []
  return getAvailableSlotLevels(state, spell.level, panel.spellSlots.value)
}
const castSpell = ref<SpellRule>()
const castNotice = ref('')
function openCastModal(spell: SpellRule): void {
  castSpell.value = spell
}
function confirmCast(level: number): void {
  if (!castSpell.value) return
  // 内部已用 +1 = 可用 −1（施法消耗）
  panel.changeSpellSlot(level, 1)
  castNotice.value = `已使用 ${level} 环法术位`
  castSpell.value = undefined
}

// ---- 抄录法术书（仅 spellbook 模式，与角色卡共享同一草稿数据）----
const showTranscribeModal = ref(false)
const transcribePreselectId = ref<string>()
function openTranscribe(spellId?: string): void {
  transcribePreselectId.value = spellId
  showTranscribeModal.value = true
}
</script>

<template>
  <div class="session-panel">
    <header class="session-panel__header">
      <button type="button" class="session-panel__back" @click="$emit('back')">← 返回列表</button>
      <div class="session-panel__identity">
        <strong>{{ draft.name || '未命名角色' }}</strong>
        <small>
          {{ draft.classId ? `${draft.targetLevel}级 ${panel.className.value}` : `${draft.targetLevel}级` }}
          · {{ draft.raceId ? '已选种族' : '未选种族' }}{{ draft.alignment ? ` · ${draft.alignment}` : '' }}
        </small>
      </div>
      <div class="session-panel__tags" aria-label="已挂载状态">
        <button
          v-for="status in mountedStatuses"
          :key="status.id"
          type="button"
          class="session-panel__tag"
          @click="openStatusDetail(status.id)"
        >
          {{ status.name }}
        </button>
        <button
          v-if="(panel.sessionState.value?.exhaustionLevel ?? 0) > 0"
          type="button"
          class="session-panel__tag session-panel__tag--exhaustion"
          @click="openExhaustionDetail"
        >
          力竭 ×{{ panel.sessionState.value?.exhaustionLevel }}
        </button>
      </div>
    </header>

    <section class="session-panel__base" aria-label="基础信息">
      <p v-if="panel.operationError.value" class="session-panel__base-error" role="alert">{{ panel.operationError.value }}</p>
      <div class="session-panel__hp">
        <h3>生命值</h3>
        <div class="session-panel__content">
          <div class="session-panel__hp-row">
            <button type="button" class="session-panel__step" aria-label="减少生命值" @click="panel.changeHp(-hpAmount())">−</button>
            <div class="session-panel__hp-meter">
              <div class="session-panel__hp-fill" :style="{ width: `${(panel.sessionState.value?.currentHp ?? 0) / panel.maxHp.value * 100}%` }" />
              <span>{{ panel.sessionState.value?.currentHp ?? 0 }} / {{ panel.maxHp.value }}</span>
            </div>
            <button type="button" class="session-panel__step" aria-label="增加生命值" @click="panel.changeHp(hpAmount())">＋</button>
            <input v-model="hpInput" type="text" inputmode="numeric" placeholder="数量（空按1）" aria-label="生命值调整数量" />
          </div>
        </div>
        <div class="session-panel__footer" />
      </div>

      <div class="session-panel__gold">
        <h3>金币</h3>
        <div class="session-panel__content">
          <strong>{{ panel.totalGold.value }} GP</strong>
          <div class="session-panel__gold-actions">
            <input v-model="panel.currencyInput.value" type="text" inputmode="numeric" placeholder="输入金币数" aria-label="金币调整数值" />
            <button type="button" @click="panel.applyCurrency('add')">添加</button>
            <button type="button" @click="panel.applyCurrency('decrease')">减少</button>
            <button type="button" @click="panel.applyCurrency('set')">设置</button>
          </div>
        </div>
        <div class="session-panel__footer">
          <p v-if="panel.currencyError.value" class="session-panel__error">{{ panel.currencyError.value }}</p>
          <small>起始金币 {{ draft.currency.gp }} GP，可随冒险增减</small>
        </div>
      </div>

      <div class="session-panel__rest">
        <h3>休息</h3>
        <div class="session-panel__content">
          <div class="session-panel__rest-actions">
            <button type="button" class="session-panel__rest-button" @click="panel.shortRest()">短休息</button>
            <button type="button" class="session-panel__rest-button" @click="showLongRestConfirm = true">长休息</button>
            <button
              v-if="panel.sessionState.value?.lastRestSnapshot"
              type="button"
              class="session-panel__rest-button session-panel__rest-button--undo"
              @click="panel.undoRest()"
            >
              撤回上次休息
            </button>
          </div>
        </div>
        <div class="session-panel__footer" />
      </div>
    </section>

    <UiTabs v-model="activeTab" wrap :items="tabs" />

    <div v-if="activeTab === 'overview'" class="session-panel__tab">
      <section class="session-panel__section">
        <div class="session-panel__stats">
          <StatTile label="护甲等级" :value="panel.derived.value.armorClass.value" :note="panel.derived.value.armorClass.sources.map((item) => item.label).join(' + ')" />
          <StatTile label="先攻" :value="panel.derived.value.initiative.value >= 0 ? `+${panel.derived.value.initiative.value}` : `${panel.derived.value.initiative.value}`" note="敏捷调整值" />
          <StatTile label="速度" :value="`${panel.derived.value.speed.value}尺`" :note="panel.derived.value.speed.sources[0]?.detail" />
          <StatTile label="熟练加值" :value="`+${panel.derived.value.proficiencyBonus.value}`" :note="`${draft.targetLevel}级角色`" />
          <StatTile v-for="key in abilityKeys" :key="key" :label="ABILITY_LABELS[key]" :value="panel.derived.value.abilities[key]" :note="`${panel.derived.value.modifiers[key] >= 0 ? '+' : ''}${panel.derived.value.modifiers[key]}`" />
        </div>
      </section>
      <section class="session-panel__section">
        <h3>力竭</h3>
        <div class="session-panel__exhaustion">
          <span>当前层数：{{ panel.sessionState.value?.exhaustionLevel ?? 0 }}</span>
          <button type="button" class="session-panel__step" aria-label="减少力竭层数" @click="panel.changeExhaustion(-1)">−</button>
          <button type="button" class="session-panel__step" aria-label="增加力竭层数" @click="panel.changeExhaustion(1)">＋</button>
        </div>
      </section>
      <section class="session-panel__section">
        <h3>状态</h3>
        <div class="session-panel__status-grid">
          <button
            v-for="status in DEBUFF_STATUSES"
            :key="status.id"
            type="button"
            class="session-panel__status-card"
            :class="{ 'session-panel__status-card--active': panel.sessionState.value?.debuffs.includes(status.id) }"
            @click="panel.toggleStatus(status.id)"
          >
            {{ status.name }}
          </button>
        </div>
      </section>
    </div>

    <div v-else-if="activeTab === 'features'" class="session-panel__tab">
      <section class="session-panel__section">
        <h3>豁免</h3>
        <div class="session-panel__stats">
          <StatTile
            v-for="(value, key) in panel.derived.value.savingThrows"
            :key="key"
            :label="abilityLabel(String(key))"
            :value="value.value >= 0 ? `+${value.value}` : `${value.value}`"
            :note="value.sources.map((source) => source.label).join(' + ')"
          />
        </div>
      </section>
      <section class="session-panel__section">
        <h3>技能</h3>
        <div class="session-panel__stats">
          <StatTile
            v-for="(value, key) in panel.derived.value.skills"
            :key="key"
            :label="skillLabel(String(key))"
            :value="value.value >= 0 ? `+${value.value}` : `${value.value}`"
            :note="value.sources.map((source) => source.detail).join(' · ')"
          />
        </div>
      </section>
      <section class="session-panel__section">
        <h3>职业特性{{ className ? ` · ${className}` : '' }}</h3>
        <ListShell v-if="classFeatures.length">
          <ExpandableOptionCard
            v-for="feature in classFeatures"
            :key="feature.id"
            :title="feature.name"
            :description="`${feature.level}级 · ${feature.englishName}`"
            expanded-label="特性详情"
          >
            <template #suffix>
              <em v-if="feature.requiresChoice" class="session-panel__feature-choice">需选择</em>
            </template>
            <template #expanded>{{ feature.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
        <p v-else class="session-panel__empty">该职业在当前等级暂无已登记特性。</p>
      </section>
      <section class="session-panel__section">
        <h3>子职特性{{ subclassName ? ` · ${subclassName}` : '' }}</h3>
        <ListShell v-if="subclassFeatures.length">
          <ExpandableOptionCard
            v-for="feature in subclassFeatures"
            :key="feature.id"
            :title="feature.name"
            :description="`${feature.level}级 · ${feature.englishName}`"
            expanded-label="特性详情"
          >
            <template #suffix>
              <em v-if="feature.requiresChoice" class="session-panel__feature-choice">需选择</em>
            </template>
            <template #expanded>{{ feature.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
        <p v-else-if="subclassName" class="session-panel__empty">该子职在当前等级暂无已登记特性。</p>
        <p v-else class="session-panel__empty">尚未选择子职，完成时间线步骤后这里会展示子职特性。</p>
      </section>
      <section v-if="featAndAsiEntries.length" class="session-panel__section">
        <h3>专长与属性提升</h3>
        <ListShell>
          <ExpandableOptionCard
            v-for="entry in featAndAsiEntries"
            :key="entry.id"
            :title="entry.label"
            :description="`${entry.level}级`"
            expanded-label="效果"
          >
            <template v-if="entry.detail" #expanded>{{ entry.detail }}</template>
          </ExpandableOptionCard>
        </ListShell>
      </section>
    </div>

    <div v-else-if="activeTab === 'combat'" class="session-panel__tab">
      <section class="session-panel__section">
        <h3>武器与护甲</h3>
        <ListShell v-if="equippedEntries.length">
          <ExpandableOptionCard
            v-for="entry in equippedEntries"
            :key="entry.id"
            :title="equipmentName(entry.itemId)"
            :description="equipmentSummary(entry.itemId)"
            expanded-label="装备详情"
          >
            <template #suffix>
              <em v-if="weaponBonusLabel(entry)" class="session-panel__combat-bonus">{{ weaponBonusLabel(entry) }}</em>
              <span class="session-panel__qty">×{{ entry.quantity }}</span>
            </template>
            <template #expanded>{{ equipmentDescription(entry.itemId) }}</template>
          </ExpandableOptionCard>
        </ListShell>
        <p v-else class="session-panel__empty">尚无已装备物品</p>
      </section>

      <section class="session-panel__section">
        <h3>法术位</h3>
        <div v-if="panel.spellSlots.value.length" class="session-panel__slots">
          <div v-for="slot in panel.spellSlots.value" :key="slot.level" class="session-panel__slot-row">
            <span>{{ slot.pact ? `契约位（${slot.level}环）` : `${slot.level}环` }}：可用 {{ panel.availableSlots.value[slot.level] ?? slot.count }} / {{ slot.count }}</span>
            <button type="button" class="session-panel__step" :aria-label="`使用${slot.level}环法术位`" @click="panel.changeSpellSlot(slot.level, 1)">−</button>
            <button type="button" class="session-panel__step" :aria-label="`恢复${slot.level}环法术位`" @click="panel.changeSpellSlot(slot.level, -1)">＋</button>
          </div>
        </div>
        <p v-else class="session-panel__empty">该角色没有法术位</p>
      </section>
    </div>

    <div v-else-if="activeTab === 'spells'" class="session-panel__tab">
      <p v-if="castNotice" class="session-panel__notice" role="status">{{ castNotice }}</p>
      <div v-if="spellcastingConfig?.mode === 'spellbook'" class="session-panel__tab-header">
        <button type="button" class="session-panel__transcribe" aria-label="抄录法术书" @click="openTranscribe()">抄录法术</button>
      </div>
      <section v-if="cantripSpells.length" class="session-panel__section">
        <h3>戏法</h3>
        <ListShell>
          <ExpandableOptionCard
            v-for="spell in cantripSpells"
            :key="spell.id"
            :title="spell.name"
            :description="spell.englishName"
            expanded-label="法术效果"
          >
            <template v-if="spell.description" #expanded>{{ spell.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
      </section>
      <section v-for="group in spellGroups" :key="group.level" class="session-panel__section">
        <h3>{{ group.level }}环 · {{ preparedOrKnownLabel }} {{ group.spells.length }}</h3>
        <div class="session-panel__slot-row">
          <span>法术位 可用 {{ panel.availableSlots.value[group.level] ?? slotCount(group.level) }} / {{ slotCount(group.level) }}</span>
          <button type="button" class="session-panel__step" :aria-label="`使用${group.level}环法术位`" @click="panel.changeSpellSlot(group.level, 1)">−</button>
          <button type="button" class="session-panel__step" :aria-label="`恢复${group.level}环法术位`" @click="panel.changeSpellSlot(group.level, -1)">＋</button>
        </div>
        <ListShell>
          <ExpandableOptionCard
            v-for="spell in group.spells"
            :key="spell.id"
            :title="spell.name"
            :description="formatSpellLabel(spell)"
            expanded-label="法术效果"
          >
            <template #suffix>
              <button
                type="button"
                class="session-panel__adjust"
                :disabled="!castableLevels(spell).length"
                @click="openCastModal(spell)"
              >
                施法
              </button>
            </template>
            <template v-if="spell.description" #expanded>{{ spell.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
      </section>
      <section v-if="panel.unpreparedFromBook.value.length" class="session-panel__section">
        <h3>未准备法术 · {{ panel.unpreparedFromBook.value.length }}（法术书中未准备）</h3>
        <ListShell>
          <ExpandableOptionCard
            v-for="spell in panel.unpreparedFromBook.value"
            :key="spell.id"
            :title="spell.name"
            :description="formatSpellLabel(spell)"
            expanded-label="法术效果"
          >
            <template #suffix>
              <button
                type="button"
                class="session-panel__adjust"
                :disabled="!panel.canPrepareMore.value"
                @click="panel.togglePrepareSpell(spell.id)"
              >
                {{ panel.canPrepareMore.value ? '准备' : '已满' }}
              </button>
            </template>
            <template v-if="spell.description" #expanded>{{ spell.description }}</template>
          </ExpandableOptionCard>
        </ListShell>
      </section>
      <p v-if="!cantripSpells.length && !spellGroups.length" class="session-panel__empty">暂无已准备法术</p>
    </div>

    <div v-else-if="activeTab === 'items'" class="session-panel__tab">
      <section class="session-panel__section">
        <h3>已装备</h3>
        <ListShell v-if="equippedEntries.length">
          <ExpandableOptionCard
            v-for="entry in equippedEntries"
            :key="entry.id"
            :title="equipmentName(entry.itemId)"
            :description="equipmentSummary(entry.itemId)"
            expanded-label="装备详情"
          >
            <template #suffix>
              <span class="session-panel__qty">×{{ entry.quantity }}</span>
              <UiBadge v-if="entry.sourceKind !== 'adventure'">{{ inventorySourceLabel(entry) }}</UiBadge>
              <button v-else type="button" class="session-panel__adjust" @click="openAdjustItem(entry)">调整</button>
            </template>
            <template #expanded>{{ equipmentDescription(entry.itemId) }}</template>
          </ExpandableOptionCard>
        </ListShell>
        <p v-else class="session-panel__empty">尚无已装备物品</p>
      </section>

      <section class="session-panel__section">
        <h3>物品栏</h3>
        <ListShell v-if="carriedEntries.length">
          <ExpandableOptionCard
            v-for="entry in carriedEntries"
            :key="entry.id"
            :title="equipmentName(entry.itemId)"
            :description="equipmentSummary(entry.itemId)"
            expanded-label="装备详情"
          >
            <template #suffix>
              <span class="session-panel__qty">×{{ entry.quantity }}</span>
              <UiBadge v-if="entry.sourceKind !== 'adventure'">{{ inventorySourceLabel(entry) }}</UiBadge>
              <button v-else type="button" class="session-panel__adjust" @click="openAdjustItem(entry)">调整</button>
            </template>
            <template #expanded>{{ equipmentDescription(entry.itemId) }}</template>
          </ExpandableOptionCard>
        </ListShell>
        <p v-else class="session-panel__empty">物品栏为空</p>
        <button type="button" class="session-panel__add-item" @click="showAddItemModal = true">添加物品</button>
      </section>
    </div>

    <UiModal :open="Boolean(detailStatus)" :title="detailStatus?.name ?? ''" @close="detailStatus = undefined">
      <p v-if="detailStatus">{{ detailStatus.description }}</p>
    </UiModal>

    <UiModal :open="Boolean(castSpell)" :title="castSpell ? `施放 ${castSpell.name}` : ''" @close="castSpell = undefined">
      <p class="session-panel__cast-hint">选择消耗的法术位（支持升环施法）：</p>
      <div class="session-panel__cast-levels">
        <button
          v-for="level in castSpell ? castableLevels(castSpell) : []"
          :key="level"
          type="button"
          class="session-panel__cast-level"
          @click="confirmCast(level)"
        >
          消耗 {{ level }} 环法术位
        </button>
        <p v-if="castSpell && !castableLevels(castSpell).length" class="session-panel__empty">没有可用的法术位。</p>
      </div>
    </UiModal>

    <UiModal :open="showLongRestConfirm" title="长休息" @close="showLongRestConfirm = false">
      <p>将恢复全部生命值与法术位，清除所有状态并归零力竭层数。此操作可撤回。</p>
      <div class="session-panel__modal-actions">
        <button type="button" @click="showLongRestConfirm = false">取消</button>
        <button type="button" class="session-panel__modal-confirm" @click="confirmLongRest">确认休息</button>
      </div>
    </UiModal>

    <SpellbookTranscriptionModal
      :open="showTranscribeModal"
      :draft="draft"
      :preselect-spell-id="transcribePreselectId"
      @close="showTranscribeModal = false"
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
  </div>
</template>

<style scoped lang="scss">
.session-panel {
  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  &__back {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-left: -0.5rem;
    padding: 0.5rem;
    border: 0;
    border-radius: var(--radius-sm);
    color: var(--color-primary);
    background: transparent;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  }

  &__identity {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    small {
      color: var(--color-text-muted);
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__tag {
    min-height: 2rem;
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-danger, #c0392b);
    font-size: 0.75rem;
    font-weight: 700;

    &--exhaustion {
      color: var(--color-primary);
    }
  }

  &__base {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.9rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);

    @media (min-width: 48rem) {
      grid-template-columns: repeat(3, 1fr);

      // 三块卡片式（与角色卡页 character-sheet__panel 观感一致）
      .session-panel__hp,
      .session-panel__gold,
      .session-panel__rest {
        padding: 0.75rem 1rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        background: var(--color-surface);
      }
    }

    h3 {
      margin: 0 0 0.4rem;
      font-size: 0.85rem;
    }
  }

  &__base-error {
    grid-column: 1 / -1;
    margin: 0;
    color: var(--color-danger, #c0392b);
    font-size: 0.8rem;
    font-weight: 700;
  }

  &__hp,
  &__gold,
  &__rest {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    // 宽屏占位：预留错误提示行 + 说明行高度，避免错误出现/消失引起三列高度跳动
    @media (min-width: 48rem) {
      min-height: 1.3rem;
      justify-content: flex-end;
    }

    small {
      color: var(--color-text-muted);
      font-size: 0.72rem;
    }
  }

  &__hp-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    input {
      width: 5rem;
      min-height: 2.75rem;
      padding: 0 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }
  }

  &__hp-meter {
    position: relative;
    flex: 1;
    min-height: 2.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;

    span {
      position: relative;
      z-index: 1;
      font-weight: 700;
    }
  }

  &__hp-fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: color-mix(in srgb, var(--color-primary) 25%, transparent);
    transition: width 0.2s ease;
  }

  &__step {
    min-height: 2.75rem;
    min-width: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-size: 1.1rem;
    font-weight: 700;
  }

  &__gold-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;

    input {
      flex: 1 1 8rem;
      min-height: 2.75rem;
      padding: 0 0.7rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }

    button {
      min-height: 2.75rem;
      min-width: 4rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-primary);
      font-size: 0.75rem;
      font-weight: 700;
    }
  }

  &__error {
    margin: 0.25rem 0 0;
    color: var(--color-danger, #c0392b);
    font-size: 0.72rem;
  }

  &__rest-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__rest-button {
    min-height: 2.75rem;
    padding: 0 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-weight: 700;

    &--undo {
      color: var(--color-danger, #c0392b);
    }
  }

  &__tab {
    padding: 1rem;
  }

  &__tab-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.6rem;
  }

  &__transcribe {
    min-height: 2.75rem;
    padding: 0 1rem;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-md);
    color: var(--color-surface);
    background: var(--color-primary);
    font-size: 0.78rem;
    font-weight: 700;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
    gap: 0.5rem;
  }

  &__section {
    margin-bottom: 1rem;

    h3 {
      margin: 0 0 0.5rem;
      font-size: 0.9rem;
    }
  }

  &__qty {
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 700;
  }

  &__combat-bonus {
    color: var(--color-primary);
    font-style: normal;
    font-size: 0.75rem;
    font-weight: 700;
  }

  &__notice {
    margin: 0 0 0.5rem;
    color: var(--color-primary);
    font-size: 0.8rem;
    font-weight: 700;
  }

  &__cast-hint {
    margin: 0 0 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  &__cast-levels {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__cast-level {
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-weight: 700;
  }

  &__adjust {
    align-self: center;
    min-height: 2.75rem;
    padding: 0 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-size: 0.75rem;
    font-weight: 700;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__add-item {
    width: 100%;
    min-height: 2.75rem;
    margin-top: 0.5rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-weight: 700;
  }

  &__empty {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  &__feature-choice {
    color: var(--color-primary);
    font-style: normal;
    font-size: 0.75rem;
    font-weight: 700;
  }

  &__slot-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0;

    span {
      flex: 1;
    }
  }

  &__exhaustion {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    span {
      flex: 1;
      font-weight: 700;
    }
  }

  &__status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
    gap: 0.5rem;
  }

  &__status-card {
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: 0.8rem;
    font-weight: 700;

    &--active {
      border-color: var(--color-danger, #c0392b);
      color: var(--color-danger, #c0392b);
      background: color-mix(in srgb, var(--color-danger, #c0392b) 10%, var(--color-surface));
    }
  }

  &__modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;

    button {
      min-height: 2.75rem;
      padding: 0 1rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font-weight: 700;
    }

    .session-panel__modal-confirm {
      color: var(--color-primary);
    }
  }
}
</style>
