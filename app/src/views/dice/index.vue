<script setup lang="ts">
import { useDicePage } from '@/views/dice/hooks/useDicePage'

const { title, description } = useDicePage()
</script>

<template>
  <main class="placeholder-view">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </main>
</template>
