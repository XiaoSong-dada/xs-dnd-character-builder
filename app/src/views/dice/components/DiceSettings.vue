<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'

defineProps<{ skipAnimation: boolean; soundEnabled: boolean; busy: boolean }>()
defineEmits<{ skip: [value: boolean]; sound: [value: boolean] }>()
</script>

<template>
  <section class="dice-settings" aria-label="投掷设置">
    <div class="dice-settings__row">
      <label for="dice-skip-animation">跳过动画</label>
      <SwitchRoot id="dice-skip-animation" class="dice-settings__switch" :model-value="skipAnimation" :disabled="busy" @update:model-value="$emit('skip', $event)">
        <SwitchThumb class="dice-settings__thumb" />
      </SwitchRoot>
    </div>
    <div class="dice-settings__row">
      <label for="dice-sound">投掷音效</label>
      <SwitchRoot id="dice-sound" class="dice-settings__switch" :model-value="soundEnabled" :disabled="skipAnimation" :aria-describedby="skipAnimation ? 'dice-sound-hint' : undefined" @update:model-value="$emit('sound', $event)">
        <SwitchThumb class="dice-settings__thumb" />
      </SwitchRoot>
    </div>
    <p v-if="skipAnimation" id="dice-sound-hint" class="dice-settings__hint">跳过动画时不播放音效</p>
  </section>
</template>

<style scoped lang="scss">
.dice-settings {
  display: grid;
  gap: 0.35rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  &__row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 44px; }
  &__switch {
    display: flex;
    align-items: center;
    width: 72px;
    height: 44px;
    padding: 8px;
    border: 0;
    border-radius: 22px;
    background: var(--color-text-muted);
    flex-shrink: 0;
    transition: background-color 160ms ease-out;
    @media (prefers-reduced-motion: reduce) { transition: none; }
    cursor: pointer;
    &[data-state='checked'] { background: var(--color-primary); }
    &:disabled { opacity: 0.5; cursor: default; }
    &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; }
  }
  &__thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: white;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgb(0 0 0 / 18%);
    transition: transform 160ms ease-out;
    @media (prefers-reduced-motion: reduce) { transition: none; }
    &[data-state='checked'] { transform: translateX(28px); }
  }
  &__hint { margin: 0; color: var(--color-text-muted); font-size: 0.8rem; }
}
</style>
