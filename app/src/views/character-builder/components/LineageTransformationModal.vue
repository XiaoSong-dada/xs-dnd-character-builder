<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import { ABILITY_LABELS } from '@/rules/data/ability-labels'
import type { LineageTransformationPreview } from '@/rules/lineage-transformation'
import type { SpeciesLegacyCandidate } from '@/rules/species-legacy'
import type { RaceRule } from '@/types/rules'

defineProps<{ open: boolean; target: string; targets: readonly RaceRule[]; retained: readonly string[]; candidates: readonly SpeciesLegacyCandidate[]; preview?: LineageTransformationPreview; error: string }>()
defineEmits<{ close: []; confirm: []; target: [id: string]; toggle: [key: string] }>()
</script>

<template>
  <UiModal :open="open" title="血统转化" @close="$emit('close')">
    <div class="lineage-transformation">
      <label>目标血统<select :value="target" @change="$emit('target', ($event.target as HTMLSelectElement).value)"><option v-for="race in targets" :key="race.id" :value="race.id">{{ race.name }}</option></select></label>
      <h3>保留先祖遗产</h3>
      <label v-for="candidate in candidates" :key="candidate.key"><input type="checkbox" :checked="retained.includes(candidate.key)" @change="$emit('toggle', candidate.key)">{{ candidate.name }}</label>
      <p v-if="!retained.length">未保留遗产：转化后需选择两项技能熟练。</p>
      <UiNotice v-if="error" tone="error" title="转化条件未满足">{{ error }}</UiNotice>
      <template v-if="preview">
        <h3>数值变化</h3>
        <dl><dt>最大生命值</dt><dd>{{ preview.before.hitPoints.value }} → {{ preview.after.hitPoints.value }}</dd><dt>护甲等级</dt><dd>{{ preview.before.armorClass.value }} → {{ preview.after.armorClass.value }}</dd><dt>速度</dt><dd>{{ preview.before.speed.value }} → {{ preview.after.speed.value }}尺</dd><template v-for="(name, key) in ABILITY_LABELS" :key="key"><dt>{{ name }}</dt><dd>{{ preview.before.abilities[key] }} → {{ preview.after.abilities[key] }}</dd></template></dl>
        <h3>原种族收益失效</h3><p>{{ preview.removedFeatures.join('、') || '无已生效特性' }}</p>
        <h3>保留语言</h3><p>{{ preview.draft.lineageHistory?.[preview.draft.lineageHistory.length - 1]?.origin.languages.join('、') || '无已登记语言' }}</p>
        <h3>待补选择与复查</h3><ul><li v-for="item in preview.pending" :key="item">{{ item }}</li></ul>
      </template>
    </div>
    <template #footer><BaseButton variant="secondary" @click="$emit('close')">取消</BaseButton><BaseButton :disabled="!preview" @click="$emit('confirm')">确认转化</BaseButton></template>
  </UiModal>
</template>

<style scoped lang="scss">
.lineage-transformation {
  display: grid; gap: 0.75rem;
  label { display: flex; align-items: center; gap: 0.5rem; min-height: 2.75rem; }
  select { flex: 1; min-width: 0; min-height: 2.75rem; }
  h3 { margin: 0; font-size: 0.95rem; }
  p { margin: 0; overflow-wrap: anywhere; }
  dl { display: grid; grid-template-columns: 1fr 1fr; margin: 0; gap: 0.25rem; }
  dd { margin: 0; }
  ul { margin: 0; padding-left: 1.25rem; }
}
</style>
