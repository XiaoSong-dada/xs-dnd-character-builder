<script setup lang="ts">
import { useNotFoundPage } from '@/views/not-found/hooks/useNotFoundPage'

const { title, description, goToCharacterBuilder } = useNotFoundPage()
</script>

<template>
  <main class="placeholder-view placeholder-view--centered">
    <p class="placeholder-view__code">404</p>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    <button class="placeholder-view__action" type="button" @click="goToCharacterBuilder">
      返回辅助车卡
    </button>
  </main>
</template>
