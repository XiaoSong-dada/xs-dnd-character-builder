<script setup lang="ts">
import OptionCard from '@/components/ui/OptionCard.vue'
import type { AbilityMethod } from '@/types/character'

defineProps<{ targetLevel: number; abilityMethod: AbilityMethod }>()
defineEmits<{ level: [value: number]; method: [value: AbilityMethod] }>()
</script>

<template>
  <section class="step-stack">
    <label class="field">
      <span>目标等级 <b>{{ targetLevel }}级</b></span>
      <input type="range" min="1" max="20" :value="targetLevel" @input="$emit('level', Number(($event.target as HTMLInputElement).value))">
      <small>等级决定需要完成多少次职业、子职和属性提升选择。</small>
    </label>
    <h2>属性生成方式</h2>
    <OptionCard title="标准数组" description="15、14、13、12、10、8；适合第一次车卡。" :state="abilityMethod === 'standard-array' ? 'selected' : 'default'" @select="$emit('method', 'standard-array')" />
    <OptionCard title="27点购点" description="自由调整六项属性，总消耗不得超过27点。" :state="abilityMethod === 'point-buy' ? 'selected' : 'default'" @select="$emit('method', 'point-buy')" />
    <OptionCard title="自定义" description="适合已有投骰结果或明确团规。" :state="abilityMethod === 'custom' ? 'selected' : 'default'" @select="$emit('method', 'custom')" />
  </section>
</template>

<style scoped lang="scss">
.step-stack {
  display: grid;
  gap: 0.75rem;

  h2 { margin: 0.75rem 0 0; font-size: 1rem; }
}

.field {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);

  span { display: flex; justify-content: space-between; color: var(--color-text-muted); }
  b { color: var(--color-primary); }
  input { width: 100%; accent-color: var(--color-primary); }
  small { color: var(--color-text-muted); line-height: 1.6; }
}
</style>
