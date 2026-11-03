<script setup lang="ts">
const props = defineProps<{ lines: readonly string[] }>()
</script>

<template>
  <div class="custom-preview">
    <p v-if="props.lines.length === 0" class="custom-preview__empty">
      填写上方字段后，这里会用文字复述这条内容会带来什么，方便确认没有填错。
    </p>
    <ul v-else class="custom-preview__list">
      <li v-for="line in props.lines" :key="line">{{ line }}</li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.custom-preview {
  &__empty {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    line-height: 1.5;
  }

  &__list {
    display: grid;
    gap: 0.3rem;
    margin: 0;
    padding-left: 1.1rem;
    color: var(--color-text-muted);
    font-size: 0.82rem;
    line-height: 1.5;
  }
}
</style>
