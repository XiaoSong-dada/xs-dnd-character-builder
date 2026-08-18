<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { DicePresentation, RollStatus } from '@/types/dice'
import { DiceRenderer } from '@/views/dice/engine/dice-renderer'

const props = defineProps<{
  presentation?: DicePresentation
  status: RollStatus
  reducedMotion: boolean
  physicalCount: number
}>()
const emit = defineEmits<{ complete: [rollId: string]; unavailable: [] }>()
const canvas = ref<HTMLCanvasElement>()
const viewControlsEnabled = computed(() => props.status === 'complete' && Boolean(props.presentation))
let renderer: DiceRenderer | undefined
let resizeObserver: ResizeObserver | undefined
let animationFrame = 0
let playbackId = 0

function stopPlayback() {
  playbackId += 1
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = 0
}

function play(presentation: DicePresentation) {
  if (!renderer) return
  stopPlayback()
  renderer.setPresentation(presentation)
  const currentPlayback = playbackId
  if (props.reducedMotion) {
    renderer.renderAt(presentation.trajectory, presentation.trajectory.durationMs)
    void nextTick(() => emit('complete', presentation.request.id))
    return
  }
  const startedAt = performance.now()
  const frame = (now: number) => {
    if (currentPlayback !== playbackId || !renderer) return
    const elapsed = now - startedAt
    renderer.renderAt(presentation.trajectory, elapsed)
    if (elapsed >= presentation.trajectory.durationMs) {
      animationFrame = 0
      emit('complete', presentation.request.id)
      return
    }
    animationFrame = requestAnimationFrame(frame)
  }
  animationFrame = requestAnimationFrame(frame)
}

watch(() => props.presentation, (presentation) => {
  if (presentation) play(presentation)
  else {
    stopPlayback()
    renderer?.clearPresentation()
  }
})
watch(() => props.physicalCount, (count) => renderer?.setTrayLayout(count))
watch(viewControlsEnabled, (enabled) => renderer?.setInteractionEnabled(enabled))

onMounted(() => {
  if (!canvas.value) return
  try {
    renderer = new DiceRenderer(canvas.value)
    renderer.setTrayLayout(props.physicalCount)
    resizeObserver = new ResizeObserver(([entry]) => { if (entry) renderer?.resize(entry.contentRect.width, entry.contentRect.height) })
    resizeObserver.observe(canvas.value)
    const bounds = canvas.value.getBoundingClientRect()
    renderer.resize(bounds.width || 640, bounds.height || 420)
    if (props.presentation) play(props.presentation)
  } catch {
    emit('unavailable')
  }
})

onBeforeUnmount(() => {
  stopPlayback()
  resizeObserver?.disconnect()
  renderer?.dispose()
})
</script>

<template>
  <section class="dice-tray" aria-label="3D 骰盘">
    <canvas ref="canvas" class="dice-tray__canvas" aria-hidden="true" />
    <div v-if="status === 'preparing'" class="dice-tray__state" role="status"><span class="dice-tray__spinner" aria-hidden="true" />正在准备物理轨迹…</div>
    <div v-else-if="status === 'idle'" class="dice-tray__state dice-tray__state--muted">骰子将在这里滚动并停稳</div>
    <div v-else-if="status === 'rolling'" class="dice-tray__rolling" role="status">投掷中</div>
    <div class="dice-tray__controls" aria-label="骰盘视图控制">
      <button
        class="dice-tray__control" type="button" aria-label="放大骰盘视图"
        :disabled="!viewControlsEnabled" @click="renderer?.zoomIn()"
      >放大</button>
      <button
        class="dice-tray__control" type="button" aria-label="缩小骰盘视图"
        :disabled="!viewControlsEnabled" @click="renderer?.zoomOut()"
      >缩小</button>
      <button
        class="dice-tray__control" type="button" aria-label="复位骰盘视图"
        :disabled="!viewControlsEnabled" @click="renderer?.resetView()"
      >复位</button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.dice-tray {
  position: relative;
  width: 100%;
  height: clamp(19rem, 55vh, 31rem);
  min-height: 19rem;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-subtle);

  &__canvas { display: block; width: 100%; height: 100%; }
  &__state {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    color: var(--color-primary);
    background: rgb(255 253 248 / 62%);
    font-weight: 700;
    backdrop-filter: blur(2px);
    &--muted { color: var(--color-text-muted); font-size: 0.85rem; font-weight: 500; }
  }
  &__spinner {
    width: 1.1rem;
    height: 1.1rem;
    border: 2px solid var(--color-primary-soft);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: dice-spin 0.8s linear infinite;

    @media (prefers-reduced-motion: reduce) { animation: none; }
  }
  &__rolling { position: absolute; top: 0.7rem; left: 50%; padding: 0.35rem 0.7rem; border: 1px solid var(--color-border); border-radius: 999px; color: var(--color-primary); background: rgb(255 253 248 / 88%); font-size: 0.72rem; font-weight: 800; transform: translateX(-50%); }
  &__controls {
    position: absolute;
    right: 0.65rem;
    bottom: 0.65rem;
    display: flex;
    gap: 0.4rem;
    padding: 0.35rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: rgb(255 253 248 / 90%);
    box-shadow: var(--shadow-subtle);
    backdrop-filter: blur(6px);
  }
  &__control {
    min-width: 2.75rem;
    min-height: 2.75rem;
    padding: 0.35rem 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-primary);
    background: var(--color-surface);
    font-size: 0.75rem;
    font-weight: 800;
    cursor: pointer;

    &:focus-visible { outline: 3px solid var(--color-primary-soft); outline-offset: 2px; }
    &:disabled { color: #9d968b; background: #e5ddd1; cursor: not-allowed; }
  }
}

@keyframes dice-spin { to { transform: rotate(360deg); } }
</style>
