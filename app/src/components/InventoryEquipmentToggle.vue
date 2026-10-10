<script setup lang="ts">
import type { InventoryEntry } from '@/types/character'
import type { EquipmentRule } from '@/types/rules'

defineProps<{ entry: InventoryEntry; equipment?: EquipmentRule }>()
defineEmits<{ toggle: [entryId: string] }>()
</script>

<template>
  <button
    v-if="equipment?.equippable && entry.quantity > 0"
    type="button"
    class="inventory-equipment-toggle"
    :aria-pressed="entry.equippedQuantity > 0"
    :aria-label="`${entry.equippedQuantity > 0 ? '卸下' : '装备'}${equipment.name}`"
    @click.stop="$emit('toggle', entry.id)"
  >
    {{ entry.equippedQuantity > 0 ? '卸下' : '装备' }}
  </button>
</template>

<style scoped lang="scss">
.inventory-equipment-toggle {
  min-height: 2.75rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: transparent;
  color: inherit;
  font: inherit;
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
</style>
