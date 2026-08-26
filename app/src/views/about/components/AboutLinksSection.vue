<script setup lang="ts">
import type { AboutExternalLink } from '@/views/about/hooks/useAboutPage'

defineProps<{
  links: readonly AboutExternalLink[]
  qqGroup: string
  copyFeedback: string
}>()

defineEmits<{
  copyQqGroup: []
}>()
</script>

<template>
  <section class="about-links" aria-labelledby="about-links-title">
    <div class="about-links__heading">
      <div>
        <p class="about-links__eyebrow">保持联系</p>
        <h2 id="about-links-title">相关入口与问题反馈</h2>
      </div>
      <p>遇到问题可以加入 QQ 群反馈，也欢迎在 GitHub 查看项目。</p>
    </div>

    <div class="about-links__grid">
      <a
        v-for="link in links"
        :key="link.id"
        class="about-links__card"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="about-links__icon" aria-hidden="true">{{ link.iconText }}</span>
        <span class="about-links__content">
          <strong>{{ link.label }}</strong>
          <small>{{ link.description }}</small>
        </span>
        <span class="about-links__arrow" aria-hidden="true">↗</span>
      </a>

      <article class="about-links__card about-links__card--qq">
        <span class="about-links__icon about-links__icon--qq" aria-hidden="true">QQ</span>
        <span class="about-links__content">
          <strong>QQ 交流群</strong>
          <small>群号 {{ qqGroup }} · 交流与问题反馈</small>
        </span>
        <button type="button" @click="$emit('copyQqGroup')">复制群号</button>
      </article>
    </div>

    <p class="about-links__feedback" role="status" aria-live="polite">{{ copyFeedback }}</p>
  </section>
</template>

<style scoped lang="scss">
.about-links {
  display: grid;
  gap: 1rem;

  &__heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;

    h2,
    p {
      margin: 0;
    }

    h2 {
      margin-top: 0.2rem;
      font-size: clamp(1.3rem, 4vw, 1.65rem);
    }

    > p {
      max-width: 24rem;
      color: var(--color-text-muted);
      font-size: 0.9rem;
      line-height: 1.6;
    }
  }

  &__eyebrow {
    color: var(--color-primary);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: 0.75rem;
  }

  &__card {
    display: flex;
    min-height: 5.5rem;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    color: var(--color-text);
    background: var(--color-surface);
    text-decoration: none;
    box-shadow: var(--shadow-subtle);

    &:hover {
      border-color: var(--color-primary);
    }

    &--qq {
      flex-wrap: wrap;

      button {
        min-height: 2.75rem;
        margin-left: auto;
        padding: 0.55rem 0.8rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-primary);
        background: var(--color-primary-soft);
        font-weight: 700;
        cursor: pointer;
      }
    }
  }

  &__icon {
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    flex: none;
    place-items: center;
    border-radius: var(--radius-md);
    color: white;
    background: #fb7299;
    font-size: 0.8rem;
    font-weight: 900;

    &--qq {
      background: #2f80ed;
    }
  }

  &__card[href*="github"] &__icon {
    background: #24292f;
  }

  &__content {
    display: grid;
    min-width: 0;
    flex: 1;
    gap: 0.25rem;

    small {
      color: var(--color-text-muted);
      line-height: 1.45;
    }
  }

  &__arrow {
    color: var(--color-primary);
    font-size: 1.2rem;
  }

  &__feedback {
    min-height: 1.5rem;
    margin: 0;
    color: var(--color-success);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  @media (max-width: 40rem) {
    &__heading {
      align-items: flex-start;
      flex-direction: column;
    }
  }
}
</style>
