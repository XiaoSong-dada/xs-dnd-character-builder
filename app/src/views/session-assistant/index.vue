<script setup lang="ts">
import { useSessionAssistantPage } from '@/views/session-assistant/hooks/useSessionAssistantPage'

const { title, description } = useSessionAssistantPage()
</script>

<template>
  <main class="placeholder-view">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </main>
</template>
