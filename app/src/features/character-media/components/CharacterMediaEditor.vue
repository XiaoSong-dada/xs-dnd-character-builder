<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import CharacterMediaImage from '@/features/character-media/components/CharacterMediaImage.vue'
import { useCharacterMediaEditing } from '@/features/character-media/hooks/useCharacterMediaEditing'
import { clampFocus, type ImageFocus } from '@/services/character-image'
import type { CharacterDraft, CharacterMedia } from '@/types/character'

const props = defineProps<{ draft: CharacterDraft }>()
const emit = defineEmits<{ change: [media: CharacterMedia | undefined] }>()
const editing = useCharacterMediaEditing(() => props.draft, (media) => emit('change', media))
const pendingKind = ref<'avatar' | 'portrait'>()
const pendingFile = ref<File>()
const pendingUrl = ref<string>()
const focusX = ref(0.5)
const focusY = ref(0.5)

function clearPending(): void {
  if (pendingUrl.value) URL.revokeObjectURL(pendingUrl.value)
  pendingKind.value = undefined
  pendingFile.value = undefined
  pendingUrl.value = undefined
  focusX.value = 0.5
  focusY.value = 0.5
}

function choose(kind: 'avatar' | 'portrait', event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  clearPending()
  pendingKind.value = kind
  pendingFile.value = file
  pendingUrl.value = URL.createObjectURL(file)
}

async function confirmPending(): Promise<void> {
  if (!pendingKind.value || !pendingFile.value) return
  await editing.replace(pendingKind.value, pendingFile.value, { x: focusX.value, y: focusY.value })
  if (!editing.error.value) clearPending()
}

function updateFocus(axis: 'x' | 'y', value: string, existing = false): void {
  const numeric = clampFocus(Number(value))
  if (existing) {
    editing.updatePortraitFocus({
      x: axis === 'x' ? numeric : props.draft.media?.portrait?.focusX ?? 0.5,
      y: axis === 'y' ? numeric : props.draft.media?.portrait?.focusY ?? 0.5,
    })
  } else if (axis === 'x') focusX.value = numeric
  else focusY.value = numeric
}

function dragFocus(event: PointerEvent, existing = false): void {
  if (event.type === 'pointermove' && event.buttons !== 1) return
  const element = event.currentTarget as HTMLElement
  if (event.type === 'pointerdown') element.setPointerCapture?.(event.pointerId)
  const bounds = element.getBoundingClientRect()
  const focus: ImageFocus = {
    x: clampFocus((event.clientX - bounds.left) / bounds.width),
    y: clampFocus((event.clientY - bounds.top) / bounds.height),
  }
  if (existing) editing.updatePortraitFocus(focus)
  else {
    focusX.value = focus.x
    focusY.value = focus.y
  }
}

onBeforeUnmount(clearPending)
</script>

<template>
  <section class="character-media-editor" aria-label="角色形象">
    <div class="character-media-editor__heading">
      <div><h3>角色形象</h3><p>可选，仅保存在当前浏览器或完整角色包中。</p></div>
      <span v-if="editing.busy.value">处理中…</span>
    </div>
    <p v-if="editing.error.value" class="character-media-editor__error" role="alert">{{ editing.error.value }}</p>

    <div class="character-media-editor__grid">
      <article>
        <h4>头像</h4>
        <div v-if="draft.media?.avatar" class="character-media-editor__avatar">
          <CharacterMediaImage :media-id="draft.media.avatar.mediaId" :alt="`${draft.name || '角色'}头像`" />
        </div>
        <p v-else class="character-media-editor__empty">尚未上传</p>
        <div class="character-media-editor__actions">
          <label>选择头像<input type="file" accept="image/jpeg,image/png,image/webp" @change="choose('avatar', $event)"></label>
          <button v-if="draft.media?.portrait" type="button" :disabled="editing.busy.value" @click="editing.createAvatarFromPortrait()">从立绘生成</button>
          <button v-if="draft.media?.avatar" type="button" :disabled="editing.busy.value" @click="editing.remove('avatar')">删除头像</button>
        </div>
      </article>

      <article>
        <h4>立绘</h4>
        <div
          v-if="draft.media?.portrait"
          class="character-media-editor__portrait"
          @pointerdown="dragFocus($event, true)"
          @pointermove="dragFocus($event, true)"
        >
          <CharacterMediaImage
            :media-id="draft.media.portrait.mediaId"
            :alt="`${draft.name || '角色'}立绘`"
            :focus-x="draft.media.portrait.focusX"
            :focus-y="draft.media.portrait.focusY"
          />
        </div>
        <p v-else class="character-media-editor__empty">尚未上传</p>
        <div v-if="draft.media?.portrait" class="character-media-editor__focus">
          <label>水平焦点<input type="range" min="0" max="1" step="0.01" :value="draft.media.portrait.focusX" @input="updateFocus('x', ($event.target as HTMLInputElement).value, true)"></label>
          <label>垂直焦点<input type="range" min="0" max="1" step="0.01" :value="draft.media.portrait.focusY" @input="updateFocus('y', ($event.target as HTMLInputElement).value, true)"></label>
        </div>
        <div class="character-media-editor__actions">
          <label>选择立绘<input type="file" accept="image/jpeg,image/png,image/webp" @change="choose('portrait', $event)"></label>
          <button v-if="draft.media?.portrait" type="button" :disabled="editing.busy.value" @click="editing.remove('portrait')">删除立绘</button>
        </div>
      </article>
    </div>

    <div v-if="pendingUrl" class="character-media-editor__pending">
      <h4>调整{{ pendingKind === 'avatar' ? '头像裁切' : '立绘焦点' }}</h4>
      <div :class="pendingKind === 'avatar' ? 'character-media-editor__pending-avatar' : 'character-media-editor__pending-portrait'" @pointerdown="dragFocus($event)" @pointermove="dragFocus($event)">
        <img :src="pendingUrl" alt="待处理图片预览" :style="{ objectPosition: `${focusX * 100}% ${focusY * 100}%` }">
      </div>
      <div class="character-media-editor__focus">
        <label>水平焦点<input v-model.number="focusX" type="range" min="0" max="1" step="0.01"></label>
        <label>垂直焦点<input v-model.number="focusY" type="range" min="0" max="1" step="0.01"></label>
      </div>
      <div class="character-media-editor__pending-actions">
        <BaseButton variant="secondary" @click="clearPending">取消</BaseButton>
        <BaseButton :disabled="editing.busy.value" @click="confirmPending">确认保存</BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.character-media-editor {
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);

  &__heading { display: flex; justify-content: space-between; gap: 1rem; h3, p { margin: 0; } p, span { color: var(--color-text-muted); font-size: 0.75rem; } }
  &__error { margin: 0; color: var(--color-error); font-size: 0.8rem; }
  &__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.8rem; article { display: grid; align-content: start; gap: 0.55rem; } h4 { margin: 0; } }
  &__avatar, &__pending-avatar { width: 7rem; aspect-ratio: 1; border-radius: 50%; overflow: hidden; background: var(--color-gold-soft); img { width: 100%; height: 100%; object-fit: cover; } }
  &__portrait, &__pending-portrait { width: 100%; aspect-ratio: 3 / 4; border-radius: var(--radius-md); overflow: hidden; background: var(--color-gold-soft); touch-action: none; cursor: crosshair; img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; } }
  &__empty { display: grid; min-height: 7rem; place-items: center; margin: 0; border: 1px dashed var(--color-border); border-radius: var(--radius-md); color: var(--color-text-muted); font-size: 0.75rem; }
  &__actions { display: flex; flex-wrap: wrap; gap: 0.4rem; label, button { display: inline-flex; min-height: 2.75rem; align-items: center; padding: 0 0.65rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-primary); background: transparent; font-size: 0.72rem; font-weight: 700; cursor: pointer; } input[type='file'] { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; } }
  &__focus { display: grid; gap: 0.35rem; label { display: grid; gap: 0.2rem; color: var(--color-text-muted); font-size: 0.7rem; } input { width: 100%; } }
  &__pending { display: grid; gap: 0.65rem; padding-top: 0.8rem; border-top: 1px solid var(--color-border); h4 { margin: 0; } }
  &__pending-avatar { margin-inline: auto; touch-action: none; cursor: crosshair; }
  &__pending-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }

  @media (max-width: 32rem) { &__grid { grid-template-columns: 1fr; } }
}
</style>
