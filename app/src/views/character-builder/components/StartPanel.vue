<script setup lang="ts">
import { computed, ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import { CharacterMediaImage } from '@/features/character-media'
import { siteConfig } from '@/config/site'
import { rulesRepository } from '@/rules/repository'
import { STEP_META } from '@/views/character-builder/steps'
import type { CharacterDraft, LegacyDraftRecord } from '@/types/character'

const props = defineProps<{
  drafts: readonly CharacterDraft[]
  legacyDrafts: readonly LegacyDraftRecord[]
}>()

function readFile(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip') emit('importPackage', file)
  else void file.text().then((raw) => emit('import', raw))
}

const emit = defineEmits<{
  create: []
  open: [id: string]
  delete: [id: string]
  import: [raw: string]
  importPackage: [file: File]
  exportLegacy: [id: string]
}>()

const pendingDeleteId = ref<string>()
const pendingDeleteDraft = computed(() => props.drafts.find((draft) => draft.id === pendingDeleteId.value))

function requestDelete(id: string): void {
  pendingDeleteId.value = id
}

function cancelDelete(): void {
  pendingDeleteId.value = undefined
}

function confirmDelete(): void {
  if (!pendingDeleteId.value) return
  emit('delete', pendingDeleteId.value)
  pendingDeleteId.value = undefined
}

/** 角色条第三段信息：完成态显示职业；进行中已选职业显示"职业 · 第N步"；未选职业显示"第N步 · 步骤名"。 */
function statusText(draft: CharacterDraft): string {
  const meta = STEP_META[draft.currentStep]
  const className = draft.classId ? rulesRepository.getClass(draft.classId)?.name : undefined
  if (draft.currentStep === 'sheet') return className ?? meta.eyebrow
  return className ? `${className} · ${meta.eyebrow}` : `${meta.eyebrow} · ${meta.title}`
}

/** hero 署名行：任一站点信息配置后即渲染（tagline 预留不展示）。 */
const hasSiteInfo = computed(() => Boolean(siteConfig.authorName || siteConfig.githubUrl || siteConfig.version))
</script>

<template>
  <section class="start-panel">
    <div class="start-panel__hero">
      <span aria-hidden="true">◇</span>
      <p>D&amp;D 5e · 2014</p>
      <h1>从一个英雄想法开始</h1>
      <small>每个决定都会说明它影响的规则和数值。</small>
      <p v-if="hasSiteInfo" class="start-panel__signature">
        <span v-if="siteConfig.authorName">由 {{ siteConfig.authorName }} 制作</span>
        <span v-if="siteConfig.authorName && siteConfig.githubUrl" aria-hidden="true">·</span>
        <a
          v-if="siteConfig.githubUrl"
          class="start-panel__signature-link"
          :href="siteConfig.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub
        </a>
        <span v-if="siteConfig.githubUrl && siteConfig.version" aria-hidden="true">·</span>
        <span v-if="siteConfig.version">v{{ siteConfig.version }}</span>
      </p>
    </div>
    <BaseButton @click="$emit('create')">创建新角色</BaseButton>
    <article
      v-for="draft in drafts"
      :key="draft.id"
      class="start-panel__draft"
    >
      <button type="button" class="start-panel__draft-open" @click="$emit('open', draft.id)">
        <CharacterMediaImage v-if="draft.media?.avatar" class="start-panel__draft-avatar" :media-id="draft.media.avatar.mediaId" :alt="`${draft.name || '角色'}头像`" />
        <span><strong>{{ draft.name || '未命名角色' }}</strong><small>{{ draft.targetLevel }}级 · {{ statusText(draft) }}</small></span>
        <b>继续 ›</b>
      </button>
      <button
        type="button"
        class="start-panel__draft-delete"
        :aria-label="`删除角色 ${draft.name || '未命名角色'}`"
        @click="requestDelete(draft.id)"
      >
        删除
      </button>
    </article>
    <UiNotice
      v-if="legacyDrafts.length"
      tone="warning"
      title="发现旧版 2024 草稿"
    >
      这些草稿已安全隔离，当前 2014 车卡不会自动转换或修改它们。你仍可导出原始 JSON 备份。
    </UiNotice>
    <article v-for="draft in legacyDrafts" :key="draft.id" class="start-panel__legacy">
      <span>
        <strong>{{ draft.name }}</strong>
        <small>5e-2024 · {{ draft.targetLevel ? `${draft.targetLevel}级` : '等级未知' }} · 只读</small>
      </span>
      <button type="button" @click="$emit('exportLegacy', draft.id)">导出</button>
    </article>
    <label class="start-panel__import">
      导入角色 JSON 或完整角色包
      <input type="file" accept="application/json,.json,application/zip,.zip" @change="readFile">
    </label>
    <UiModal
      :open="Boolean(pendingDeleteDraft)"
      title="删除这个角色？"
      @close="cancelDelete"
    >
      <p class="start-panel__delete-message">
        “{{ pendingDeleteDraft?.name || '未命名角色' }}”及其全部车卡进度将从本地永久删除，此操作无法撤销。
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="cancelDelete">取消</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">确认删除</BaseButton>
      </template>
    </UiModal>
  </section>
</template>

<style scoped lang="scss">
.start-panel {
  display: grid;
  width: min(100% - 2rem, 30rem);
  margin-inline: auto;
  gap: 0.75rem;
  padding: 1.5rem 0 3rem;

  &__hero {
    min-height: 19rem;
    display: grid;
    place-items: center;
    align-content: center;
    text-align: center;

    > span { display: grid; width: 6rem; height: 7rem; place-items: center; color: var(--color-primary); background: var(--color-gold-soft); clip-path: polygon(50% 0,94% 18%,86% 72%,50% 100%,14% 72%,6% 18%); font-size: 2.5rem; }
    p { margin: 1rem 0 0.35rem; color: var(--color-primary); font-size: 0.72rem; font-weight: 700; }
    h1 { margin: 0; font-size: clamp(1.6rem, 8vw, 2.2rem); }
    small { margin-top: 0.6rem; color: var(--color-text-muted); line-height: 1.6; }

    .start-panel__signature {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 0.4rem;
      margin: 0.6rem 0 0;
      color: var(--color-text-muted);
      font-weight: 400;

      &-link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        min-height: 2.75rem;
        padding: 0 0.25rem;
        color: var(--color-primary);
        text-decoration: underline;
      }
    }
  }

  &__draft {
    display: flex;
    min-height: 4.25rem;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    overflow: hidden;

    &-open {
      display: flex;
      min-width: 0;
      min-height: 4.25rem;
      flex: 1;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0.75rem 0.75rem 1rem;
      border: 0;
      color: var(--color-text);
      background: transparent;
      text-align: left;

      span { display: grid; min-width: 0; flex: 1; }
      small { color: var(--color-text-muted); }
      b { flex: none; color: var(--color-primary); }
    }

    &-delete {
      min-width: 3.5rem;
      min-height: 2.75rem;
      margin-right: 0.5rem;
      border: 0;
      border-left: 1px solid var(--color-border);
      color: var(--color-error);
      background: transparent;
      font-size: 0.75rem;
      font-weight: 700;
    }

    &-avatar { width: 3rem; height: 3rem; flex: none; border-radius: 50%; object-fit: cover; }
  }

  &__delete-message {
    margin: 0;
    color: var(--color-text-muted);
    line-height: 1.7;
  }

  &__import {
    display: grid;
    min-height: 2.75rem;
    place-items: center;
    color: var(--color-primary);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;

    input { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; }
  }

  &__legacy {
    display: flex;
    min-height: 4.25rem;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px dashed var(--color-warning);
    border-radius: var(--radius-md);
    background: var(--color-warning-soft);

    > span {
      display: grid;
      min-width: 0;
      flex: 1;
    }

    small {
      color: var(--color-text-muted);
    }

    button {
      min-width: 3.5rem;
      min-height: 2.75rem;
      border: 1px solid var(--color-warning);
      border-radius: var(--radius-sm);
      color: var(--color-warning);
      background: var(--color-surface);
      font-weight: 700;
    }
  }
}
</style>
