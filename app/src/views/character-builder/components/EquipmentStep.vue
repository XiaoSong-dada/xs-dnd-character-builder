<script setup lang="ts">
import { computed } from 'vue'

import OptionCard from '@/components/ui/OptionCard.vue'
import { rulesRepository } from '@/rules/repository'

const props = defineProps<{ classId?: string; inventory: readonly string[]; equipped: readonly string[] }>()
const emit = defineEmits<{ change: [inventory: readonly string[], equipped: readonly string[]] }>()
const equipment = computed(() => rulesRepository.equipment.filter((item) => item.classIds.includes(props.classId ?? '')))

function toggleOwn(id: string): void {
  const own = props.inventory.includes(id)
  emit(
    'change',
    own ? props.inventory.filter((item) => item !== id) : [...props.inventory, id],
    own ? props.equipped.filter((item) => item !== id) : props.equipped,
  )
}

function toggleEquip(id: string): void {
  if (!props.inventory.includes(id)) return
  emit('change', props.inventory, props.equipped.includes(id) ? props.equipped.filter((item) => item !== id) : [...props.equipped, id])
}
</script>

<template>
  <section class="equipment-step">
    <p>“拥有”与“已装备”是两个状态；只有已装备物品影响角色数值。</p>
    <article v-for="item in equipment" :key="item.id">
      <OptionCard :title="item.name" :description="item.description" :state="inventory.includes(item.id) ? 'complete' : 'default'" @select="toggleOwn(item.id)" />
      <button type="button" :disabled="!inventory.includes(item.id)" :aria-pressed="equipped.includes(item.id)" @click="toggleEquip(item.id)">
        {{ equipped.includes(item.id) ? '✓ 已装备' : '装备' }}
      </button>
    </article>
  </section>
</template>

<style scoped lang="scss">
.equipment-step {
  display: grid;
  gap: 0.75rem;

  > p { margin: 0; color: var(--color-text-muted); line-height: 1.6; }

  article {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;

    > button {
      min-width: 5rem;
      min-height: 2.75rem;
      align-self: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-primary);
      background: var(--color-surface);
      font-weight: 700;

      &:disabled { color: var(--color-text-muted); opacity: 0.5; }
    }
  }
}
</style>
