<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import DicePoolPanel from '@/views/dice/components/DicePoolPanel.vue'
import DiceResultPanel from '@/views/dice/components/DiceResultPanel.vue'
import DiceSettings from '@/views/dice/components/DiceSettings.vue'
import DiceTray from '@/views/dice/components/DiceTray.vue'
import DiceTypeSelector from '@/views/dice/components/DiceTypeSelector.vue'
import { useDicePage } from '@/views/dice/hooks/useDicePage'

const {
  title, description, dieTypes, maxPhysicalDice, pool, results, presentation, status, notice, error,
  physicalDiceCount, remainingPhysicalDice, expression, isBusy, groupedResults, total, reducedMotion,
  canAdd, addDie, removeDie, clearPool, roll, handlePlaybackComplete, handleRendererUnavailable,
  skipAnimation, soundEnabled, setSkipAnimation, setSoundEnabled, handlePlaybackStarted,
} = useDicePage()
</script>

<template>
  <main class="dice-page touch-manipulation">
    <header class="dice-page__header"><p>桌上冒险工具</p><h1>{{ title }}</h1><span>{{ description }}</span></header>
    <DiceTypeSelector :die-types="dieTypes" :disabled="isBusy" :can-add="canAdd" @add="addDie" />
    <DicePoolPanel
      :entries="pool" :expression="expression" :physical-count="physicalDiceCount"
      :remaining="remainingPhysicalDice" :maximum="maxPhysicalDice" :disabled="isBusy"
      :can-add="canAdd" @add="addDie" @remove="removeDie"
    />
    <DiceSettings :skip-animation="skipAnimation" :sound-enabled="soundEnabled" :busy="isBusy" @skip="setSkipAnimation" @sound="setSoundEnabled" />
    <DiceResultPanel v-if="results.length" :groups="groupedResults" :total="total" />
    <p v-if="skipAnimation" class="dice-page__notice">已跳过动画，投掷后直接显示结果。</p>
    <DiceTray v-else
      :presentation="presentation" :status="status" :reduced-motion="reducedMotion" :physical-count="physicalDiceCount"
      @complete="handlePlaybackComplete" @unavailable="handleRendererUnavailable"
      @started="handlePlaybackStarted"
    />
    <p v-if="notice" class="dice-page__notice" role="status">{{ notice }}</p>
    <p v-if="error" class="dice-page__error" role="alert">{{ error }}</p>
    <div class="dice-page__actions">
      <BaseButton class="dice-page__roll" :disabled="isBusy || physicalDiceCount === 0" @click="roll">
        {{ results.length ? '再次投掷' : isBusy ? '投掷中…' : '投掷骰子' }}
      </BaseButton>
      <BaseButton variant="secondary" :disabled="isBusy || physicalDiceCount === 0" @click="clearPool">清空骰池</BaseButton>
    </div>
  </main>
</template>

<style scoped lang="scss">
.dice-page {
  display: grid;
  width: min(100% - 2rem, 48rem);
  margin-inline: auto;
  padding: 1.25rem 0 calc(1.25rem + env(safe-area-inset-bottom));
  gap: 1rem;

  &__header {
    padding: 0.45rem 0 0.2rem;
    p, h1, span { margin: 0; }
    p { color: var(--color-primary); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.1em; }
    h1 { margin-top: 0.2rem; font-size: clamp(1.75rem, 8vw, 2.65rem); line-height: 1.1; }
    span { display: block; margin-top: 0.4rem; color: var(--color-text-muted); font-size: 0.86rem; line-height: 1.6; }
  }

  &__notice,
  &__error { margin: 0; padding: 0.7rem 0.85rem; border-radius: var(--radius-md); font-size: 0.8rem; line-height: 1.5; }
  &__notice { color: var(--color-warning); background: var(--color-warning-soft); }
  &__error { color: var(--color-error); background: var(--color-error-soft); }
  &__actions {
    position: sticky;
    bottom: 0;
    z-index: 3;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.65rem;
    padding: 0.7rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: rgb(255 253 248 / 94%);
    box-shadow: 0 -0.35rem 1rem rgb(70 52 32 / 8%);
    backdrop-filter: blur(8px);
  }
  &__roll { width: 100%; }
  @media (max-width: 24rem) { width: min(100% - 1.25rem, 48rem); &__actions { grid-template-columns: 1fr; } }
}
</style>
