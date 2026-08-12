<script setup lang="ts">
import { computed } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import { rulesRepository } from '@/rules/repository'
import {
  buildStartingEquipmentState,
  getAllowedPickItems,
  isStartingEquipmentComplete,
  updateEquippedQuantity,
} from '@/rules/starting-equipment'
import type {
  CharacterDraft,
  CurrencyWallet,
  InventoryEntry,
  StartingEquipmentSelection,
} from '@/types/character'

const props = defineProps<{ draft: CharacterDraft }>()
const emit = defineEmits<{
  change: [
    selections: readonly StartingEquipmentSelection[],
    inventory: readonly InventoryEntry[],
    currency: CurrencyWallet,
  ]
}>()

const classProfile = computed(() =>
  props.draft.classId ? rulesRepository.getClassStartingEquipment(props.draft.classId) : undefined)
const backgroundProfile = computed(() =>
  props.draft.backgroundVariantId || props.draft.backgroundId
    ? rulesRepository.getBackgroundStartingEquipment(props.draft.backgroundVariantId ?? props.draft.backgroundId!)
    : undefined)
const complete = computed(() => isStartingEquipmentComplete(props.draft))
const backgroundEntries = computed(() => props.draft.inventory.filter((entry) => entry.sourceKind === 'background'))

function itemName(itemId: string): string {
  return rulesRepository.getEquipment(itemId)?.name ?? itemId
}

function selectionFor(groupId: string): StartingEquipmentSelection | undefined {
  return props.draft.startingEquipmentSelections.find((selection) => selection.groupId === groupId)
}

function emitSelections(selections: readonly StartingEquipmentSelection[]): void {
  const state = buildStartingEquipmentState({
    ...props.draft,
    startingEquipmentSelections: selections,
  })
  emit('change', selections, state.inventory, state.currency)
}

function selectOption(groupId: string, optionId: string): void {
  const next: StartingEquipmentSelection = { groupId, optionId, pickedItemIds: [] }
  emitSelections([
    ...props.draft.startingEquipmentSelections.filter((selection) => selection.groupId !== groupId),
    next,
  ])
}

function changePickedItem(groupId: string, itemId: string, delta: 1 | -1): void {
  const group = classProfile.value?.groups.find((item) => item.id === groupId)
  const current = selectionFor(groupId)
  const selectedOption = group?.options.find((item) => item.id === current?.optionId)
  if (!current || !selectedOption?.pick) return

  const picked = [...current.pickedItemIds]
  if (delta === 1 && picked.length < selectedOption.pick.count) picked.push(itemId)
  if (delta === -1) {
    const index = picked.lastIndexOf(itemId)
    if (index >= 0) picked.splice(index, 1)
  }
  emitSelections(props.draft.startingEquipmentSelections.map((selection) =>
    selection.groupId === groupId ? { ...selection, pickedItemIds: picked } : selection))
}

function toggleEquipped(entry: InventoryEntry): void {
  const nextInventory = updateEquippedQuantity(
    props.draft.inventory,
    entry.id,
    entry.equippedQuantity > 0 ? 0 : 1,
  )
  emit('change', props.draft.startingEquipmentSelections, nextInventory, props.draft.currency)
}

function sourceLabel(entry: InventoryEntry): string {
  if (entry.sourceKind === 'class') return '职业'
  if (entry.sourceKind === 'background') return '背景'
  if (entry.sourceKind === 'adventure') return '冒险获得'
  return '旧草稿'
}
</script>

<template>
  <section class="equipment-step">
    <UiNotice
      v-if="draft.equipmentNeedsReview"
      tone="warning"
      title="旧装备需要重新确认"
    >
      原有物品已作为迁移记录保留。完成下面的职业装备分支后即可继续。
    </UiNotice>

    <section class="equipment-step__section">
      <header>
        <div>
          <p>职业起始装备</p>
          <h2>{{ rulesRepository.getClass(draft.classId ?? '')?.name ?? '尚未选择职业' }}</h2>
        </div>
        <UiBadge :tone="complete ? 'success' : 'warning'">
          {{ complete ? '已完成' : `${draft.startingEquipmentSelections.length}/${classProfile?.groups.length ?? 0}` }}
        </UiBadge>
      </header>

      <div v-if="classProfile?.fixedGrants.length" class="equipment-step__fixed">
        <strong>必得物品</strong>
        <p>
          <span v-for="grant in classProfile.fixedGrants" :key="grant.itemId">
            {{ itemName(grant.itemId) }}<template v-if="grant.quantity > 1"> ×{{ grant.quantity }}</template>
          </span>
        </p>
      </div>

      <article v-for="(group, groupIndex) in classProfile?.groups ?? []" :key="group.id" class="equipment-step__group">
        <h3><span>{{ groupIndex + 1 }}</span>{{ group.title }}</h3>
        <ListShell>
          <ExpandableOptionCard
            v-for="option in group.options"
            :key="option.id"
            :title="option.label"
            :description="option.pick ? `还需选择 ${option.pick.count} 件具体物品` : ''"
            expanded-label="装备详情"
            :state="selectionFor(group.id)?.optionId === option.id ? 'selected' : 'default'"
            @select="selectOption(group.id, option.id)"
          >
            <template #expanded>
              <ul v-if="option.grants.length" class="equipment-step__grant-list">
                <li v-for="grant in option.grants" :key="grant.itemId">
                  {{ itemName(grant.itemId) }}<template v-if="grant.quantity > 1"> ×{{ grant.quantity }}</template>
                </li>
              </ul>
            </template>
          </ExpandableOptionCard>
        </ListShell>

        <div
          v-if="group.options.find((option) => option.id === selectionFor(group.id)?.optionId)?.pick"
          class="equipment-step__picker"
        >
          <ListShell
            :count="`${selectionFor(group.id)?.pickedItemIds.length ?? 0}/${group.options.find((option) => option.id === selectionFor(group.id)?.optionId)?.pick?.count ?? 0}`"
            count-label="已选 "
          >
            <ExpandableOptionCard
              v-for="item in getAllowedPickItems(group.options.find((option) => option.id === selectionFor(group.id)?.optionId)!.pick!)"
              :key="item.id"
              :title="item.name"
              :description="item.damageDice ? `${item.damageDice} ${item.damageType}伤害` : ''"
              expanded-label="装备详情"
            >
            <template #suffix>
              <div class="equipment-step__qty">
                <button
                  type="button"
                  :aria-label="`减少 ${item.name}`"
                  :disabled="!selectionFor(group.id)?.pickedItemIds.includes(item.id)"
                  @click="changePickedItem(group.id, item.id, -1)"
                >
                  −
                </button>
                <strong>{{ selectionFor(group.id)?.pickedItemIds.filter((id) => id === item.id).length ?? 0 }}</strong>
                <button
                  type="button"
                  :aria-label="`增加 ${item.name}`"
                  :disabled="(selectionFor(group.id)?.pickedItemIds.length ?? 0) >= (group.options.find((option) => option.id === selectionFor(group.id)?.optionId)?.pick?.count ?? 0)"
                  @click="changePickedItem(group.id, item.id, 1)"
                >
                  ＋
                </button>
              </div>
            </template>
            <template #expanded>{{ item.description }}</template>
          </ExpandableOptionCard>
          </ListShell>
        </div>
      </article>
    </section>

    <section class="equipment-step__section">
      <header>
        <div>
          <p>背景固定装备</p>
          <h2>{{ rulesRepository.getBackground(draft.backgroundId ?? '')?.name ?? '尚未选择背景' }}</h2>
        </div>
        <UiBadge v-if="backgroundProfile" tone="success">自动加入</UiBadge>
      </header>
      <p v-if="!backgroundEntries.length" class="equipment-step__empty">选择背景后会自动加入对应物品。</p>
      <ul v-else class="equipment-step__compact-list">
        <li v-for="entry in backgroundEntries" :key="entry.id">
          <span>{{ itemName(entry.itemId) }}</span>
          <strong>×{{ entry.quantity }}</strong>
        </li>
      </ul>
      <p v-if="backgroundProfile" class="equipment-step__coins">起始金币 <strong>{{ draft.currency.gp }} GP</strong></p>
    </section>

    <section class="equipment-step__section">
      <header>
        <div>
          <p>最终物品栏</p>
          <h2>拥有与已装备</h2>
        </div>
        <UiBadge>{{ draft.inventory.length }} 类</UiBadge>
      </header>
      <p class="equipment-step__help">只有已装备的护甲与盾牌会影响角色数值；系统已给出推荐穿戴，可随时调整。</p>
      <ul class="equipment-step__inventory">
        <li v-for="entry in draft.inventory" :key="entry.id">
          <div>
            <strong>{{ itemName(entry.itemId) }} <small>×{{ entry.quantity }}</small></strong>
            <UiBadge :tone="entry.sourceKind === 'legacy' ? 'warning' : 'neutral'">{{ sourceLabel(entry) }}</UiBadge>
          </div>
          <button
            v-if="rulesRepository.getEquipment(entry.itemId)?.equippable"
            type="button"
            :class="{ 'equipment-step__equip--active': entry.equippedQuantity > 0 }"
            :aria-pressed="entry.equippedQuantity > 0"
            @click="toggleEquipped(entry)"
          >
            {{ entry.equippedQuantity > 0 ? '✓ 已装备' : '装备' }}
          </button>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped lang="scss">
.equipment-step {
  display: grid;
  gap: 1rem;

  &__section {
    display: grid;
    gap: 0.85rem;
    padding: 0.9rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);

    > header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;

      p {
        margin: 0 0 0.15rem;
        color: var(--color-primary);
        font-size: 0.7rem;
        font-weight: 700;
      }

      h2 {
        margin: 0;
        font-size: 1rem;
      }
    }
  }

  &__fixed {
    padding: 0.75rem;
    border-radius: var(--radius-md);
    background: var(--color-primary-soft);

    strong {
      font-size: 0.78rem;
    }

    p {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin: 0.45rem 0 0;

      span {
        padding: 0.25rem 0.45rem;
        border: 1px solid var(--color-border);
        border-radius: 999px;
        background: var(--color-surface);
        font-size: 0.72rem;
      }
    }
  }

  &__group {
    display: grid;
    gap: 0.6rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--color-border);

    h3 {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      margin: 0;
      font-size: 0.86rem;

      span {
        display: grid;
        width: 1.5rem;
        height: 1.5rem;
        place-items: center;
        border-radius: 50%;
        color: var(--color-surface);
        background: var(--color-primary);
        font-size: 0.7rem;
      }
    }
  }

  &__picker {
    display: grid;
    gap: 0.4rem;
    padding: 0.65rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
  }

  &__grant-list {
    margin: 0;
    padding-left: 1rem;
    color: var(--color-text-muted);
    font-size: 0.78rem;
    line-height: 1.7;
  }

  &__qty {
    display: grid;
    grid-template-columns: 2.25rem 1.75rem 2.25rem;
    align-items: center;
    text-align: center;

    button {
      min-height: 2.25rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-primary);
      background: var(--color-surface);
      font-size: 1rem;
      font-weight: 700;

      &:disabled {
        color: var(--color-text-muted);
        opacity: 0.45;
      }
    }

    strong { font-size: 0.85rem; }
  }

  &__empty,
  &__help {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.76rem;
    line-height: 1.55;
  }

  &__compact-list,
  &__inventory {
    display: grid;
    gap: 0.45rem;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      display: flex;
      min-height: 2.75rem;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
      padding: 0.45rem 0;
      border-bottom: 1px solid var(--color-border);
      font-size: 0.8rem;

      &:last-child {
        border-bottom: 0;
      }
    }
  }

  &__coins {
    display: flex;
    justify-content: space-between;
    margin: 0;
    padding-top: 0.65rem;
    border-top: 1px solid var(--color-border);
    font-size: 0.8rem;
  }

  &__inventory {
    li {
      > div {
        display: flex;
        min-width: 0;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.35rem;

        strong {
          min-width: 0;
          font-size: 0.8rem;

          small {
            color: var(--color-text-muted);
          }
        }
      }

      > button {
        min-width: 5.25rem;
        min-height: 2.75rem;
        flex: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-primary);
        background: var(--color-surface);
        font-weight: 700;
      }
    }
  }

  &__equip--active {
    border-color: var(--color-success) !important;
    color: var(--color-success) !important;
    background: var(--color-success-soft) !important;
  }
}
</style>
