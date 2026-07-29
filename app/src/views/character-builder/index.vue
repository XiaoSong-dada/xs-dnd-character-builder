<script setup lang="ts">
import { useCharacterBuilderPage } from '@/views/character-builder/hooks/useCharacterBuilderPage'

const { title, description } = useCharacterBuilderPage()
</script>

<template>
  <main class="placeholder-view">
    <p class="placeholder-view__eyebrow">D&amp;D 5e · 2024</p>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </main>
</template>
