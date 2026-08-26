<script setup lang="ts">
import UiModal from '@/components/ui/UiModal.vue'
import type { TipQrCode } from '@/views/about/hooks/useAboutPage'

defineProps<{
  codes: readonly TipQrCode[]
  activeCode?: TipQrCode
}>()

defineEmits<{
  open: [code: TipQrCode]
  close: []
  imageError: [id: TipQrCode['id']]
}>()
</script>

<template>
  <section v-if="codes.length" class="tip-qr" aria-labelledby="tip-qr-title">
    <div class="tip-qr__heading">
      <p class="about-links__eyebrow">咖啡小子</p>
      <h2 id="tip-qr-title">请杯咖啡</h2>
      <span>如果这个工具恰好帮到了你，可以请作者喝杯咖啡。</span>
    </div>

    <div class="tip-qr__grid">
      <button
        v-for="code in codes"
        :key="code.id"
        class="tip-qr__card"
        type="button"
        :aria-label="`查看${code.label}收款码大图`"
        @click="$emit('open', code)"
      >
        <img :src="code.imageUrl" :alt="code.alt" @error="$emit('imageError', code.id)">
        <strong>{{ code.label }}</strong>
        <small>点击查看大图</small>
      </button>
    </div>

    <UiModal :open="Boolean(activeCode)" :title="activeCode ? `${activeCode.label}收款码` : '收款码'" @close="$emit('close')">
      <img
        v-if="activeCode"
        class="tip-qr__preview"
        :src="activeCode.imageUrl"
        :alt="activeCode.alt"
        @error="$emit('imageError', activeCode.id)"
      >
    </UiModal>
  </section>
</template>

<style scoped lang="scss">
.tip-qr {
  display: grid;
  gap: 1rem;

  &__heading {
    display: grid;
    gap: 0.25rem;

    p,
    h2,
    span {
      margin: 0;
    }

    p {
      color: var(--color-primary);
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    h2 {
      font-size: clamp(1.3rem, 4vw, 1.65rem);
    }

    span {
      color: var(--color-text-muted);
      line-height: 1.6;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: 1rem;
  }

  &__card {
    display: grid;
    min-height: 3rem;
    gap: 0.5rem;
    place-items: center;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    color: var(--color-text);
    background: var(--color-surface);
    box-shadow: var(--shadow-subtle);
    cursor: pointer;

    &:hover {
      border-color: var(--color-primary);
    }

    img {
      width: min(100%, 18rem);
      aspect-ratio: 1 / 1;
      object-fit: contain;
      border-radius: var(--radius-md);
      background: white;
    }

    small {
      color: var(--color-text-muted);
    }
  }

  &__preview {
    display: block;
    width: min(100%, 32rem);
    max-height: 65dvh;
    margin-inline: auto;
    object-fit: contain;
  }
}
</style>
