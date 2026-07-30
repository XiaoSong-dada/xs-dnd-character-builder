<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import type { CharacterDraft, LegacyDraftRecord } from '@/types/character'

defineProps<{
  drafts: readonly CharacterDraft[]
  legacyDrafts: readonly LegacyDraftRecord[]
}>()

function readFile(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  void file.text().then((raw) => emit('import', raw))
}

const emit = defineEmits<{
  create: []
  open: [id: string]
  import: [raw: string]
  exportLegacy: [id: string]
}>()
</script>

<template>
  <section class="start-panel">
    <div class="start-panel__hero">
      <span aria-hidden="true">◇</span>
      <p>D&amp;D 5e · 2014</p>
      <h1>从一个英雄想法开始</h1>
      <small>每个决定都会说明它影响的规则和数值。</small>
    </div>
    <BaseButton @click="$emit('create')">创建新角色</BaseButton>
    <button
      v-for="draft in drafts"
      :key="draft.id"
      type="button"
      class="start-panel__draft"
      @click="$emit('open', draft.id)"
    >
      <span><strong>{{ draft.name || '未命名角色' }}</strong><small>{{ draft.targetLevel }}级 · {{ draft.currentStep }}</small></span>
      <b>继续 ›</b>
    </button>
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
      导入角色 JSON
      <input type="file" accept="application/json,.json" @change="readFile">
    </label>
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
  }

  &__draft {
    display: flex;
    min-height: 4.25rem;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-surface);
    text-align: left;

    span { display: grid; flex: 1; }
    small { color: var(--color-text-muted); }
    b { color: var(--color-primary); }
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
