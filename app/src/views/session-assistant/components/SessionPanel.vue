<script setup lang="ts">
import { computed, ref } from 'vue'

import AddItemModal from '@/components/AddItemModal.vue'
import AdjustItemModal from '@/components/AdjustItemModal.vue'
import ListShell from '@/components/ui/ListShell.vue'
import StatTile from '@/components/ui/StatTile.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import { ABILITY_LABELS } from '@/rules/data/feats-2014'
import { rulesRepository } from '@/rules/repository'
import { addAdventureItem, decreaseAdventureItem, increaseAdventureItem, removeAdventureItem } from '@/rules/starting-equipment'
import { DEBUFF_STATUSES, EXHAUSTION_DESCRIPTION } from '@/types/session-state'
import type { CharacterDraft, InventoryEntry } from '@/types/character'
import { useSessionPanel } from '../hooks/useSessionPanel'

const props = defineProps<{ draft: CharacterDraft }>()

const panel = useSessionPanel(computed(() => props.draft))

const tabs = [
  { id: 'overview', label: '总览' },
  { id: 'combat', label: '战斗' },
  { id: 'items', label: '物品' },
  { id: 'status', label: '状态' },
] as const
const activeTab = ref<string>('overview')

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
function inventorySourceLabel(entry: InventoryEntry): string {
  return entry.sourceKind === 'class' || entry.sourceKind === 'background' ? '起始装备' : '冒险获得'
}

// ---- 总览派生 ----
const abilityKeys = Object.keys(ABILITY_LABELS) as Array<keyof typeof ABILITY_LABELS>
const equippedWeapons = computed(() => props.draft.inventory.filter((entry) => entry.equippedQuantity > 0))
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
      <div class="session-panel__hp">
        <h3>生命值</h3>
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

      <div class="session-panel__gold">
        <h3>金币</h3>
        <strong>{{ panel.totalGold.value }} GP</strong>
        <div class="session-panel__gold-actions">
          <input v-model="panel.currencyInput.value" type="text" inputmode="numeric" placeholder="输入金币数" aria-label="金币调整数值" />
          <button type="button" @click="panel.applyCurrency('add')">添加</button>
          <button type="button" @click="panel.applyCurrency('decrease')">减少</button>
          <button type="button" @click="panel.applyCurrency('set')">设置</button>
        </div>
        <p v-if="panel.currencyError.value" class="session-panel__error">{{ panel.currencyError.value }}</p>
        <p v-if="panel.operationError.value" class="session-panel__error">{{ panel.operationError.value }}</p>
        <small>起始金币 {{ draft.currency.gp }} GP，可随冒险增减</small>
      </div>

      <div class="session-panel__rest">
        <h3>休息</h3>
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
    </section>

    <UiTabs v-model="activeTab" :items="tabs" />

    <div v-if="activeTab === 'overview'" class="session-panel__tab">
      <div class="session-panel__stats">
        <StatTile label="护甲等级" :value="panel.derived.value.armorClass.value" :note="panel.derived.value.armorClass.sources.map((item) => item.label).join(' + ')" />
        <StatTile label="先攻" :value="panel.derived.value.initiative.value >= 0 ? `+${panel.derived.value.initiative.value}` : `${panel.derived.value.initiative.value}`" note="敏捷调整值" />
        <StatTile label="速度" :value="`${panel.derived.value.speed.value}尺`" :note="panel.derived.value.speed.sources[0]?.detail" />
        <StatTile label="熟练加值" :value="`+${panel.derived.value.proficiencyBonus.value}`" :note="`${draft.targetLevel}级角色`" />
        <StatTile v-for="key in abilityKeys" :key="key" :label="ABILITY_LABELS[key]" :value="panel.derived.value.abilities[key]" :note="`${panel.derived.value.modifiers[key] >= 0 ? '+' : ''}${panel.derived.value.modifiers[key]}`" />
      </div>
    </div>

    <div v-else-if="activeTab === 'combat'" class="session-panel__tab">
      <section class="session-panel__section">
        <h3>武器与护甲</h3>
        <ListShell v-if="equippedWeapons.length" class="session-panel__items">
          <div v-for="entry in equippedWeapons" :key="entry.id" class="session-panel__item-row">
            <div class="session-panel__item-main">
              <strong>{{ equipmentName(entry.itemId) }}</strong>
              <small>{{ equipmentDescription(entry.itemId) }}</small>
              <em v-if="rulesRepository.getEquipment(entry.itemId)?.category === 'weapon'">命中 +{{ panel.derived.value.attackBonus.value }} · 伤害 +{{ panel.derived.value.attackDamageBonus.value }}</em>
            </div>
          </div>
        </ListShell>
        <p v-else>尚无已装备物品</p>
      </section>

      <section class="session-panel__section">
        <h3>法术位</h3>
        <div v-if="panel.spellSlots.value.length" class="session-panel__slots">
          <div v-for="slot in panel.spellSlots.value" :key="slot.level" class="session-panel__slot-row">
            <span>{{ slot.pact ? `契约位（${slot.level}环）` : `${slot.level}环` }}：{{ panel.sessionState.value?.usedSpellSlots[slot.level] ?? 0 }} / {{ slot.count }}</span>
            <button type="button" class="session-panel__step" :aria-label="`减少${slot.level}环法术位`" @click="panel.changeSpellSlot(slot.level, -1)">−</button>
            <button type="button" class="session-panel__step" :aria-label="`增加${slot.level}环法术位`" @click="panel.changeSpellSlot(slot.level, 1)">＋</button>
          </div>
        </div>
        <p v-else>该角色没有法术位</p>
      </section>
    </div>

    <div v-else-if="activeTab === 'items'" class="session-panel__tab">
      <section class="session-panel__section">
        <h3>已装备</h3>
        <ListShell v-if="equippedWeapons.length" class="session-panel__items">
          <div v-for="entry in equippedWeapons" :key="entry.id" class="session-panel__item-row">
            <div class="session-panel__item-main">
              <strong>{{ equipmentName(entry.itemId) }}</strong>
              <small>{{ equipmentDescription(entry.itemId) }}</small>
              <span class="session-panel__qty">×{{ entry.quantity }}</span>
              <button v-if="entry.sourceKind === 'adventure'" type="button" class="session-panel__adjust" @click="openAdjustItem(entry)">调整</button>
              <UiBadge v-else>{{ inventorySourceLabel(entry) }}</UiBadge>
            </div>
          </div>
        </ListShell>
        <p v-else>尚无已装备物品</p>
      </section>

      <section class="session-panel__section">
        <h3>物品栏</h3>
        <ListShell v-if="draft.inventory.some((entry) => entry.equippedQuantity === 0)" class="session-panel__items">
          <div v-for="entry in draft.inventory.filter((item) => item.equippedQuantity === 0)" :key="entry.id" class="session-panel__item-row">
            <div class="session-panel__item-main">
              <strong>{{ equipmentName(entry.itemId) }}</strong>
              <small>{{ equipmentDescription(entry.itemId) }}</small>
              <span class="session-panel__qty">×{{ entry.quantity }}</span>
              <button v-if="entry.sourceKind === 'adventure'" type="button" class="session-panel__adjust" @click="openAdjustItem(entry)">调整</button>
              <UiBadge v-else>{{ inventorySourceLabel(entry) }}</UiBadge>
            </div>
          </div>
        </ListShell>
        <p v-else>物品栏为空</p>
        <button type="button" class="session-panel__add-item" @click="showAddItemModal = true">添加物品</button>
      </section>
    </div>

    <div v-else class="session-panel__tab">
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

    <UiModal :open="Boolean(detailStatus)" :title="detailStatus?.name ?? ''" @close="detailStatus = undefined">
      <p v-if="detailStatus">{{ detailStatus.description }}</p>
    </UiModal>

    <UiModal :open="showLongRestConfirm" title="长休息" @close="showLongRestConfirm = false">
      <p>将恢复全部生命值与法术位，清除所有状态并归零力竭层数。此操作可撤回。</p>
      <div class="session-panel__modal-actions">
        <button type="button" @click="showLongRestConfirm = false">取消</button>
        <button type="button" class="session-panel__modal-confirm" @click="confirmLongRest">确认休息</button>
      </div>
    </UiModal>

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
  </div>
</template>

<style scoped lang="scss">
.session-panel {
  &__header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--color-border);
  }

  &__back {
    align-self: flex-start;
    min-height: 2.75rem;
    padding: 0 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-weight: 700;
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
    gap: 0.75rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--color-border);

    @media (min-width: 48rem) {
      grid-template-columns: repeat(3, 1fr);
    }

    h3 {
      margin: 0 0 0.4rem;
      font-size: 0.85rem;
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
    padding: 0.75rem;
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

  &__item-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &__item-main {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;

    small {
      color: var(--color-text-muted);
      font-size: 0.75rem;
    }

    em {
      color: var(--color-primary);
      font-style: normal;
      font-size: 0.75rem;
    }
  }

  &__qty {
    color: var(--color-text-muted);
    font-size: 0.8rem;
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
