<script setup lang="ts">
defineProps<{ hasDrawer?: boolean; hasActions?: boolean }>()
</script>

<template>
  <div
    class="quick-build-shell"
    :class="{
      'quick-build-shell--drawer': hasDrawer,
      'quick-build-shell--actions': hasActions,
    }"
  >
    <slot name="header" />
    <main class="quick-build-shell__content"><slot /></main>
    <!-- 当前角色框与操作栏同属一块吸底区（v1.9.1 R3-2）：操作栏因提示行增高时抽屉整体上移，
         不再依赖固定的让位常量（旧写法会让提示行盖住当前角色框底部）。 -->
    <div v-if="$slots.drawer || $slots.actions" class="quick-build-shell__bottom">
      <div v-if="$slots.drawer" class="quick-build-shell__drawer"><slot name="drawer" /></div>
      <div v-if="$slots.actions" class="quick-build-shell__actions"><slot name="actions" /></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.quick-build-shell {
  position: relative;
  width: min(100%, 32rem);
  min-height: 100%;
  margin-inline: auto;
  background: var(--color-background);

  &__content { padding: 0.75rem 1rem 2rem; }
  // 吸底区为流内 sticky：滚到底部时回到自然位置，最后一条内容不会被永久遮挡，
  // 因此这里只需一点呼吸留白，不再按吸底高度做让位（v1.9.1 R3-3）。
  &--drawer &__content,
  &--actions &__content { padding-bottom: 1.25rem; }

  &__bottom {
    position: sticky;
    z-index: 5;
    bottom: 0;
  }
}
</style>
