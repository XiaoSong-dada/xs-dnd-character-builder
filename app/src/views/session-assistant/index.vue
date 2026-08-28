<script setup lang="ts">
import { computed } from 'vue'

import { deriveCharacterSummary } from '@/rules/derive'
import { CharacterMediaImage } from '@/features/character-media'
import SessionPanel from './components/SessionPanel.vue'
import { useSessionAssistantPage } from './hooks/useSessionAssistantPage'

const { drafts, selectedDraft, selectDraft, backToList, importError, readImportFile } = useSessionAssistantPage()

const summaries = computed(() =>
  drafts.value.map((draft) => ({ draft, summary: deriveCharacterSummary(draft) })),
)
</script>

<template>
  <main class="session-assistant touch-manipulation">
    <SessionPanel v-if="selectedDraft" :draft="selectedDraft" @back="backToList" />

    <div v-else class="session-assistant__list">
      <header class="session-assistant__header">
        <h1>跑团助手</h1>
        <p>选择角色进入局内面板：调整生命值、金币、法术位，挂载状态，短/长休息。</p>
      </header>

      <div class="session-assistant__import">
        <label class="session-assistant__import-button">
          导入 JSON 或完整角色包
          <input type="file" accept="application/json,.json,application/zip,.zip" @change="readImportFile" />
        </label>
        <p v-if="importError" class="session-assistant__import-error">{{ importError }}</p>
      </div>

      <section class="session-assistant__cards" aria-label="角色列表">
        <button
          v-for="item in summaries"
          :key="item.draft.id"
          type="button"
          class="session-assistant__card"
          @click="selectDraft(item.draft.id)"
        >
          <CharacterMediaImage v-if="item.draft.media?.avatar" class="session-assistant__card-avatar" :media-id="item.draft.media.avatar.mediaId" :alt="`${item.draft.name || '角色'}头像`" />
          <span class="session-assistant__card-copy">
          <strong>{{ item.draft.name || '未命名角色' }}</strong>
          <small>
            {{ item.summary.level }}级{{ item.summary.className ? ` ${item.summary.className}` : '' }}
            · HP {{ item.summary.hitPoints ?? '—' }}
          </small>
          </span>
        </button>
        <p v-if="!summaries.length" class="session-assistant__empty">
          还没有角色。请先到「辅助车卡」创建角色，或通过「导入 JSON」加入已有角色文件。
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
.session-assistant {
  min-height: calc(100dvh - 4.5rem);

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  &__header {
    h1 {
      margin: 0 0 0.4rem;
      font-size: 1.25rem;
    }

    p {
      margin: 0;
      color: var(--color-text-muted);
      font-size: 0.85rem;
    }
  }

  &__import-button {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    padding: 0 1rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-weight: 700;
    cursor: pointer;

    input {
      display: none;
    }
  }

  &__import-error {
    margin: 0.4rem 0 0;
    color: var(--color-danger, #c0392b);
    font-size: 0.8rem;
  }

  &__cards {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  &__card {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 3.5rem;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    text-align: left;

    &-avatar { width: 3rem; height: 3rem; flex: none; border-radius: 50%; object-fit: cover; }
    &-copy { display: grid; min-width: 0; }

    small {
      color: var(--color-text-muted);
    }
  }

  &__empty {
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }
}
</style>
