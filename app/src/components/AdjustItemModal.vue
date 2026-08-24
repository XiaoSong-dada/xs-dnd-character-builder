<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import UiModal from '@/components/ui/UiModal.vue'

const props = defineProps<{
  open: boolean
  itemName: string
  quantity: number
  equippedQuantity: number
}>()
const emit = defineEmits<{
  close: []
  adjust: [payload: { action: 'decrease' | 'increase' | 'remove'; count: number }]
}>()

const countText = ref('1')
/** 待确认的删除操作（整条删除或扣减至 0 的减少）。 */
const pendingRemove = ref(false)

watch(() => props.open, (open) => {
  if (!open) return
  countText.value = '1'
  pendingRemove.value = false
})

const count = computed(() => Number(countText.value))
const validCount = computed(() => Number.isInteger(count.value) && count.value >= 1)

/** 减少：输入数量 ≥ 当前数量等价于删除整条，需二次确认。 */
function decrease(): void {
  if (!validCount.value) return
  if (count.value >= props.quantity) {
    pendingRemove.value = true
    return
  }
  emit('adjust', { action: 'decrease', count: count.value })
}

function increase(): void {
  if (!validCount.value) return
  emit('adjust', { action: 'increase', count: count.value })
}

/** 删除全部：直接进入二次确认。 */
function removeAll(): void {
  pendingRemove.value = true
}

function cancelRemove(): void {
  pendingRemove.value = false
}

function confirmRemove(): void {
  emit('adjust', { action: 'remove', count: 0 })
}
</script>

<template>
  <UiModal :open="open" :title="pendingRemove ? '删除物品' : '调整数量'" @close="$emit('close')">
    <div v-if="!pendingRemove" class="adjust-item-modal">
      <p class="adjust-item-modal__summary">
        {{ itemName }} · 当前 ×{{ quantity }}<template v-if="equippedQuantity > 0">（装备 {{ equippedQuantity }}）</template>
      </p>
      <div class="adjust-item-modal__count">
        <label for="adjust-item-count">数量</label>
        <input id="adjust-item-count" v-model="countText" type="number" min="1" step="1" inputmode="numeric" aria-label="调整数量数值" />
      </div>
      <div class="adjust-item-modal__actions">
        <button type="button" class="adjust-item-modal__action" :disabled="!validCount" @click="decrease">减少</button>
        <button type="button" class="adjust-item-modal__action" :disabled="!validCount" @click="increase">增加</button>
        <button type="button" class="adjust-item-modal__action adjust-item-modal__action--danger" @click="removeAll">删除全部</button>
      </div>
      <p class="adjust-item-modal__hint">扣减至 0 将移除整条物品；删除不返还金币。</p>
    </div>
    <div v-else class="adjust-item-modal">
      <p class="adjust-item-modal__summary">将移除 {{ itemName }} × {{ quantity }}<template v-if="equippedQuantity > 0">（含已装备 {{ equippedQuantity }} 件）</template>。</p>
      <p class="adjust-item-modal__hint">此操作不可撤销，且不返还金币。</p>
      <div class="adjust-item-modal__actions">
        <button type="button" class="adjust-item-modal__action" @click="cancelRemove">取消</button>
        <button type="button" class="adjust-item-modal__action adjust-item-modal__action--danger" @click="confirmRemove">删除</button>
      </div>
    </div>
  </UiModal>
</template>

<style scoped lang="scss">
.adjust-item-modal {
  display: grid;
  gap: 0.8rem;

  &__summary {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 700;
  }

  &__count {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 0.6rem;

    label {
      color: var(--color-text-muted);
      font-size: 0.78rem;
    }

    input {
      min-height: 2.75rem;
      min-width: 0;
      padding: 0 0.7rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }
  }

  &__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  &__action {
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-primary);
    background: var(--color-surface);
    font-size: 0.78rem;
    font-weight: 700;

    &--danger {
      border-color: var(--color-danger, #c0392b);
      color: var(--color-danger, #c0392b);
    }

    &:disabled {
      border-color: var(--color-border);
      color: var(--color-text-muted);
      background: var(--color-surface);
      opacity: 0.55;
    }
  }

  &__hint {
    margin: 0;
    color: var(--color-warning, #b58900);
    font-size: 0.7rem;
  }
}
</style>
