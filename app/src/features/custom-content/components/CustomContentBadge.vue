<script setup lang="ts">
import { computed } from 'vue'

import UiBadge from '@/components/ui/UiBadge.vue'
import { isCustomSourceId } from '@/rules/custom-content'

const props = defineProps<{ sourceIds: readonly string[] }>()

/** 条目是否来自内容工坊的自定义来源（与来源开关同一判定口径）。 */
const isCustom = computed(() => props.sourceIds.some((id) => isCustomSourceId(id)))
</script>

<template>
  <UiBadge v-if="isCustom" tone="primary">自定义</UiBadge>
</template>
