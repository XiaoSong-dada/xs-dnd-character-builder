<script setup lang="ts">
import UiBadge from '@/components/ui/UiBadge.vue'
import type { OfflineAssetStatus } from '@/services/offline-assets'

defineProps<{
  statuses: readonly OfflineAssetStatus[]
  state: 'idle' | 'downloading' | 'completed' | 'partial' | 'unavailable'
  cachedCount: number
  totalCount: number
  allCached: boolean
  progressPercent: number
  estimatedSizeLabel: string
  storagePersisted: boolean
  feedback: string
}>()

defineEmits<{ download: [] }>()
</script>

<template>
  <section class="offline-assets" aria-labelledby="offline-assets-title">
    <p class="offline-assets__eyebrow" id="offline-assets-title">OFFLINE</p>
    <h2 class="offline-assets__heading">离线使用</h2>
    <p class="offline-assets__description">
      把应用添加到主屏幕后，车卡、跑团助手和骰娘断网也能用。导出角色卡需要额外的模板文件（约
      {{ estimatedSizeLabel }}），默认在第一次导出时按需下载，也可以在这里提前存到本机。
    </p>

    <ul class="offline-assets__list">
      <li v-for="item in statuses" :key="item.asset.id" class="offline-assets__item">
        <div class="offline-assets__meta">
          <span class="offline-assets__label">{{ item.asset.label }}</span>
          <span class="offline-assets__hint">{{ item.asset.description }}</span>
        </div>
        <UiBadge :tone="item.cached ? 'success' : 'neutral'">
          {{ item.cached ? '已下载' : '未下载' }}
        </UiBadge>
      </li>
    </ul>

    <div class="offline-assets__footer">
      <p class="offline-assets__summary">
        已就绪 {{ cachedCount }}/{{ totalCount }} 项
        <template v-if="allCached"> · 断网也能导出角色卡</template>
      </p>
      <button
        class="offline-assets__action"
        type="button"
        :disabled="state === 'downloading'"
        @click="$emit('download')"
      >
        {{ state === 'downloading' ? `正在下载 ${progressPercent}%` : allCached ? '重新检查' : '一键下载离线资源' }}
      </button>
    </div>

    <p v-if="feedback" class="offline-assets__feedback" role="status">{{ feedback }}</p>

    <p class="offline-assets__protection">
      本地数据保护：{{ storagePersisted ? '已开启，角色草稿不会被浏览器自动清理' : '未开启（安装到主屏幕后通常会自动开启）' }}
    </p>
  </section>
</template>

<style scoped lang="scss">
.offline-assets {
  display: grid;
  gap: 0.85rem;
  padding: clamp(1.25rem, 4vw, 2rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-subtle);

  &__eyebrow,
  &__heading,
  &__description,
  &__summary,
  &__feedback,
  &__protection {
    margin: 0;
  }

  &__eyebrow {
    color: var(--color-primary);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  &__heading {
    font-size: clamp(1.2rem, 4vw, 1.5rem);
    line-height: 1.2;
  }

  &__description,
  &__protection {
    color: var(--color-text-muted);
    line-height: 1.75;
  }

  &__list {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.7rem 0.85rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
  }

  &__meta {
    display: grid;
    min-width: 0;
    gap: 0.15rem;
  }

  &__label {
    font-weight: 700;
  }

  &__hint {
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  &__summary {
    color: var(--color-text-muted);
    font-size: 0.85rem;
    font-weight: 700;
  }

  &__action {
    min-height: 2.75rem;
    padding: 0.55rem 1rem;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--color-surface);
    background: var(--color-primary);
    font-weight: 700;
    cursor: pointer;

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }

    &:focus-visible {
      outline: 0.15rem solid var(--color-primary);
      outline-offset: 0.15rem;
    }
  }

  &__feedback {
    padding: 0.6rem 0.85rem;
    border-left: 0.25rem solid var(--color-primary);
    border-radius: var(--radius-sm);
    color: var(--color-primary);
    background: var(--color-primary-soft);
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1.6;
  }

  &__protection {
    font-size: 0.8rem;
  }
}
</style>
