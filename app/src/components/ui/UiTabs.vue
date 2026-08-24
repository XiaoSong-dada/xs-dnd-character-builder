<script setup lang="ts">
withDefaults(defineProps<{
  items: readonly { id: string; label: string }[]
  modelValue: string
  /** wrap 模式：tab 固定最小宽度、超宽换行（用于页签较多的页面）；默认横向滚动。 */
  wrap?: boolean
}>(), {
  wrap: false,
})
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="ui-tabs flex-around" :class="{ 'ui-tabs--wrap': wrap }" role="tablist">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      role="tab"
      :aria-selected="item.id === modelValue"
      :class="{ 'ui-tabs__tab--active': item.id === modelValue }"
      @click="$emit('update:modelValue', item.id)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.ui-tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--color-border);

  button {
    min-width: 3.5rem;
    min-height: 2.75rem;
    flex: 1;
    border: 0;
    border-bottom: 0.15rem solid transparent;
    color: var(--color-text-muted);
    background: transparent;
    font-size: 0.75rem;
    white-space: nowrap;
  }

  &__tab--active {
    border-bottom-color: var(--color-primary);
    color: var(--color-primary);
    font-weight: 700;
  }

  &--wrap {
    flex-wrap: wrap;
    overflow-x: visible;

    button {
      flex: 0 0 auto;
      padding: 0 0.75rem;
    }
  }
}
</style>
