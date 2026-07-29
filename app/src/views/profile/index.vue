<script setup lang="ts">
import { useProfilePage } from '@/views/profile/hooks/useProfilePage'

const { title, description } = useProfilePage()
</script>

<template>
  <main class="placeholder-view">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </main>
</template>
