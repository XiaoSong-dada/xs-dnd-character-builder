<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: number
  note?: string
  editMode: boolean
  minimum?: number
  suffix?: string
}>(), { minimum: Number.NEGATIVE_INFINITY, suffix: '' })
const emit = defineEmits<{ commit: [value: number] }>()

const editing = ref(false)
const input = ref<HTMLInputElement>()
const inputValue = ref('')
const error = ref('')
let lastTouchAt = 0

function begin(): void {
  if (!props.editMode || editing.value) return
  inputValue.value = String(props.value)
  error.value = ''
  editing.value = true
  void nextTick(() => {
    input.value?.focus()
    input.value?.select()
  })
}

function handlePointer(event: PointerEvent): void {
  if (event.pointerType === 'mouse') return
  const now = Date.now()
  if (now - lastTouchAt <= 250) begin()
  lastTouchAt = now
}

function commit(): void {
  if (!editing.value) return
  const parsed = Number(inputValue.value)
  if (!Number.isInteger(parsed) || !Number.isFinite(parsed) || parsed < props.minimum) {
    error.value = Number.isFinite(props.minimum) ? `请输入不小于 ${props.minimum} 的整数` : '请输入整数'
    inputValue.value = String(props.value)
    editing.value = false
    return
  }
  editing.value = false
  error.value = ''
  emit('commit', parsed)
}

function cancel(): void {
  editing.value = false
  error.value = ''
}


watch(() => props.editMode, (enabled) => {
  if (!enabled) cancel()
})
</script>

<template>
  <div
    class="editable-stat"
    :class="{ 'editable-stat--enabled': editMode, 'editable-stat--editing': editing }"
    :role="editMode ? 'button' : undefined"
    :tabindex="editMode ? 0 : undefined"
    :aria-label="editMode ? `编辑${label}，当前值${value}` : undefined"
    @dblclick="begin"
    @pointerup="handlePointer"
    @keydown.enter.prevent="begin"
  >
    <span>{{ label }}</span>
    <input
      v-if="editing"
      ref="input"
      v-model="inputValue"
      type="text"
      :inputmode="Number.isFinite(minimum) && minimum >= 0 ? 'numeric' : 'text'"
      :aria-label="label"
      @blur="commit"
      @keydown.enter.prevent="commit"
      @keydown.esc.prevent="cancel"
    >
    <strong v-else>{{ value }}{{ suffix }}</strong>
    <small v-if="error" class="editable-stat__error">{{ error }}</small>
    <small v-else-if="note">{{ note }}</small>
    <small v-if="editMode && !editing" class="editable-stat__hint">双击编辑</small>
  </div>
</template>

<style scoped lang="scss">
.editable-stat {
  display: grid;
  min-width: 0;
  min-height: 4rem;
  place-items: center;
  align-content: center;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: center;

  span, small { color: var(--color-text-muted); font-size: 0.68rem; }
  strong { font-size: 1.2rem; font-variant-numeric: tabular-nums; }

  input {
    width: 5rem;
    min-height: 2.75rem;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-sm);
    text-align: center;
    font-size: 1rem;
  }

  &--enabled {
    border-style: dashed;
    border-color: var(--color-primary);
    cursor: pointer;
  }

  &--editing { cursor: text; }

  &__hint { color: var(--color-primary) !important; font-weight: 700; }
  &__error { color: var(--color-error) !important; }
}
</style>
