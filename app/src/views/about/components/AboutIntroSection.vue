<script setup lang="ts">
defineProps<{
  description: string
  freeNotice: string
}>()
</script>

<template>
  <section class="about-intro" aria-labelledby="about-intro-title">
    <p id="about-intro-title" class="about-intro__eyebrow">D&amp;D 5e 2014</p>
    <p class="about-intro__description">{{ description }}</p>
    <p class="about-intro__notice">{{ freeNotice }}</p>
  </section>
</template>

<style scoped lang="scss">
.about-intro {
  display: grid;
  gap: 0.85rem;
  padding: clamp(1.25rem, 4vw, 2rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: linear-gradient(145deg, var(--color-surface), var(--color-gold-soft));
  box-shadow: var(--shadow-subtle);

  &__eyebrow,
  &__description,
  &__notice {
    margin: 0;
  }

  &__eyebrow {
    color: var(--color-primary);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__description {
    font-size: clamp(1rem, 3vw, 1.15rem);
    line-height: 1.8;
  }

  &__notice {
    padding: 0.9rem 1rem;
    border-left: 0.25rem solid var(--color-success);
    border-radius: var(--radius-sm);
    color: var(--color-success);
    background: var(--color-success-soft);
    font-weight: 700;
    line-height: 1.7;
  }
}
</style>
