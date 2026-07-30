<script setup lang="ts">
import OptionCard from '@/components/ui/OptionCard.vue'

const props = defineProps<{ inventory: readonly string[]; equipped: readonly string[] }>()
const emit = defineEmits<{ change: [inventory: readonly string[], equipped: readonly string[]] }>()
const equipment = [
  ['chain-mail', '链甲', '基础 AC 16'],
  ['shield', '盾牌', '装备时 AC +2'],
  ['longsword', '长剑', '战士常用近战武器'],
] as const

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
    <article v-for="[id, name, description] in equipment" :key="id">
      <OptionCard :title="name" :description="description" :state="inventory.includes(id) ? 'complete' : 'default'" @select="toggleOwn(id)" />
      <button type="button" :disabled="!inventory.includes(id)" :aria-pressed="equipped.includes(id)" @click="toggleEquip(id)">
        {{ equipped.includes(id) ? '✓ 已装备' : '装备' }}
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
