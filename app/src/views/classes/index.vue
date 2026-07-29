<script setup lang="ts">
import { useClassesPage } from '@/views/classes/hooks/useClassesPage'

const { title, description } = useClassesPage()
</script>

<template>
  <main class="placeholder-view">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </main>
</template>
