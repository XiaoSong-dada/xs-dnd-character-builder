<script setup lang="ts">
defineProps<{ name: string; alignment: string; notes: string }>()
defineEmits<{ change: [value: { name: string; alignment: string; notes: string }] }>()

const alignments = [
  '守序善良',
  '中立善良',
  '混乱善良',
  '守序中立',
  '绝对中立',
  '混乱中立',
  '守序邪恶',
  '中立邪恶',
  '混乱邪恶',
] as const
</script>

<template>
  <section class="identity-step">
    <label>角色姓名<input :value="name" placeholder="例如：凯恩" @input="$emit('change', { name: ($event.target as HTMLInputElement).value, alignment, notes })"></label>
    <label>
      阵营
      <select :value="alignment" @change="$emit('change', { name, alignment: ($event.target as HTMLSelectElement).value, notes })">
        <option value="">请选择</option>
        <option v-for="option in alignments" :key="option" :value="option">{{ option }}</option>
      </select>
    </label>
    <label>人物细节<textarea :value="notes" rows="6" placeholder="外貌、理想、羁绊或背景故事（可选）" @input="$emit('change', { name, alignment, notes: ($event.target as HTMLTextAreaElement).value })" /></label>
  </section>
</template>

<style scoped lang="scss">
.identity-step {
  display: grid;
  gap: 0.85rem;

  label { display: grid; gap: 0.35rem; color: var(--color-text-muted); font-size: 0.8rem; font-weight: 600; }
  input, select, textarea { min-height: 2.75rem; padding: 0.7rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text); background: var(--color-surface); }
  textarea { resize: vertical; }
}
</style>
