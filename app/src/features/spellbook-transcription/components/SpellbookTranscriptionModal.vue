<script setup lang="ts">
import { watch } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import { useSpellbookTranscription } from '@/features/spellbook-transcription/hooks/useSpellbookTranscription'
import type { CharacterDraft } from '@/types/character'

const props = defineProps<{ open: boolean; draft: CharacterDraft; preselectSpellId?: string }>()
const emit = defineEmits<{ close: [] }>()

const transcription = useSpellbookTranscription(() => props.draft)

watch(() => props.open, (open) => {
  if (open) {
    transcription.reset()
    if (props.preselectSpellId) transcription.toggle(props.preselectSpellId)
  }
})

function confirm(): void {
  if (transcription.transcribe()) emit('close')
}
</script>

<template>
  <UiModal :open="open" title="抄录法术书" @close="$emit('close')">
    <div class="spellbook-transcription">
      <UiNotice tone="info" title="抄录规则">
        每个环级消耗 50 GP 与 2 小时。抄录完成后不可撤销，金币立即扣除。
      </UiNotice>
      <p v-if="!transcription.groupedCandidates.value.length" class="spellbook-transcription__empty">
        当前职业法术池中可抄录的法术都已写入法术书。
      </p>
      <ListShell
        v-for="group in transcription.groupedCandidates.value"
        :key="group.level"
        :title="`${group.level}环法术`"
        :count="`抄录 ${transcription.getTranscribeCost(group.level)} GP`"
        max-height="12rem"
      >
        <ExpandableOptionCard
          v-for="spell in group.spells"
          :key="spell.id"
          :title="spell.name"
          :description="`${spell.level}环 · ${spell.englishName}`"
          :state="transcription.selectedIds.value.includes(spell.id) ? 'selected' : 'default'"
          expanded-label="法术效果"
          expand-on-select
          @select="transcription.toggle(spell.id)"
        >
          <template #suffix>
            {{ transcription.selectedIds.value.includes(spell.id) ? '已选' : '选择' }}
          </template>
          <template v-if="spell.description" #expanded>{{ spell.description }}</template>
        </ExpandableOptionCard>
      </ListShell>
    </div>

    <template #footer>
      <div class="spellbook-transcription__footer">
        <dl class="spellbook-transcription__summary">
          <div>
            <dt>当前持有</dt>
            <dd>{{ transcription.totalGold.value }} GP</dd>
          </div>
          <div>
            <dt>抄录费用</dt>
            <dd>{{ transcription.totalCost.value }} GP</dd>
          </div>
          <div>
            <dt>扣减后余额</dt>
            <dd :class="{ 'spellbook-transcription__summary--danger': transcription.remainingGold.value < 0 }">
              {{ transcription.remainingGold.value }} GP
            </dd>
          </div>
        </dl>
        <p v-if="transcription.totalHours.value" class="spellbook-transcription__hours">
          按规则本次抄录共需 {{ transcription.totalHours.value }} 小时（仅提示）。
        </p>
        <p v-if="transcription.error.value" class="spellbook-transcription__error" role="alert">{{ transcription.error.value }}</p>
        <button
          type="button"
          class="spellbook-transcription__confirm"
          :disabled="!transcription.selectedIds.value.length"
          @click="confirm"
        >
          抄录{{ transcription.totalCost.value ? `（${transcription.totalCost.value} GP）` : '' }}
        </button>
      </div>
    </template>
  </UiModal>
</template>

<style scoped lang="scss">
.spellbook-transcription {
  display: grid;
  gap: 0.8rem;

  &__empty {
    margin: 0;
    padding: 1rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    text-align: center;
  }

  &__footer {
    display: grid;
    gap: 0.5rem;
  }

  &__summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
    margin: 0;

    div {
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      text-align: center;
    }

    dt {
      color: var(--color-text-muted);
      font-size: 0.66rem;
      font-weight: 700;
    }

    dd {
      margin: 0.2rem 0 0;
      font-size: 0.82rem;
      font-weight: 700;
    }
  }

  &__summary--danger {
    color: var(--color-danger, #c0392b);
  }

  &__hours {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.68rem;
  }

  &__error {
    margin: 0;
    color: var(--color-danger, #c0392b);
    font-size: 0.72rem;
  }

  &__confirm {
    min-height: 2.75rem;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-md);
    color: var(--color-surface);
    background: var(--color-primary);
    font-size: 0.8rem;
    font-weight: 700;

    &:disabled {
      border-color: var(--color-border);
      color: var(--color-text-muted);
      background: var(--color-surface);
      opacity: 0.55;
    }
  }
}
</style>
