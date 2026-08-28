<script setup lang="ts">
import { computed, toRef } from 'vue'

import { useCharacterMediaUrl } from '@/features/character-media/hooks/useCharacterMediaUrl'

const props = defineProps<{
  mediaId?: string
  alt?: string
  decorative?: boolean
  focusX?: number
  focusY?: number
}>()
const { url, clear } = useCharacterMediaUrl(toRef(props, 'mediaId'))
const position = computed(() => `${(props.focusX ?? 0.5) * 100}% ${(props.focusY ?? 0.5) * 100}%`)
</script>

<template>
  <img
    v-if="url"
    :src="url"
    :alt="decorative ? '' : (alt ?? '')"
    :aria-hidden="decorative || undefined"
    :style="{ objectPosition: position }"
    @error="clear"
  >
</template>
