<script setup lang="ts">
import AboutIntroSection from '@/views/about/components/AboutIntroSection.vue'
import AboutLinksSection from '@/views/about/components/AboutLinksSection.vue'
import TipQrSection from '@/views/about/components/TipQrSection.vue'
import { useAboutPage } from '@/views/about/hooks/useAboutPage'

const {
  title,
  currentVersion,
  projectDescription,
  freeNotice,
  qqGroup,
  externalLinks,
  copyFeedback,
  availableQrCodes,
  activeQrCode,
  copyQqGroup,
  openQrCode,
  closeQrCode,
  markQrCodeFailed,
  openUpdateNotice,
} = useAboutPage()
</script>

<template>
  <main class="about-page">
    <header class="about-page__header">
      <p>PROJECT &amp; COMMUNITY</p>
      <h1>{{ title }}</h1>
    </header>

    <AboutIntroSection
      :description="projectDescription"
      :free-notice="freeNotice"
      :current-version="currentVersion"
      @open-update-notice="openUpdateNotice"
    />
    <AboutLinksSection
      :links="externalLinks"
      :qq-group="qqGroup"
      :copy-feedback="copyFeedback"
      @copy-qq-group="copyQqGroup"
    />
    <TipQrSection
      :codes="availableQrCodes"
      :active-code="activeQrCode"
      @open="openQrCode"
      @close="closeQrCode"
      @image-error="markQrCodeFailed"
    />

    <footer class="about-page__footer">
      本站为非官方社区工具，与相关游戏版权方不存在官方隶属关系。
    </footer>
  </main>
</template>

<style scoped lang="scss">
.about-page {
  display: grid;
  width: min(100% - 2rem, 64rem);
  min-height: 100%;
  margin-inline: auto;
  gap: clamp(2rem, 6vw, 3.5rem);
  padding: clamp(2rem, 7vw, 4rem) 0;

  &__header {
    display: grid;
    gap: 0.25rem;

    p,
    h1 {
      margin: 0;
    }

    p {
      color: var(--color-primary);
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.1em;
    }

    h1 {
      font-size: clamp(2rem, 8vw, 3.5rem);
      line-height: 1.1;
    }
  }

  &__footer {
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.85rem;
    line-height: 1.7;
  }
}
</style>
