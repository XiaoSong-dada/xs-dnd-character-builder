<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import UiModal from '@/components/ui/UiModal.vue'
import { rulesRepository } from '@/rules/repository'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  add: [payload: { itemId: string; quantity: number; equip: boolean }]
}>()

const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'armor', label: '护甲' },
  { id: 'shield', label: '盾牌' },
  { id: 'weapon', label: '武器' },
  { id: 'tool', label: '工具' },
  { id: 'gear', label: '杂物' },
] as const
type CategoryId = (typeof CATEGORIES)[number]['id']

const search = ref('')
const category = ref<CategoryId>('all')
const mode = ref<'library' | 'custom'>('library')
const selectedItemId = ref<string>()
const customName = ref('')
const quantity = ref(1)

watch(() => props.open, (open) => {
  if (!open) return
  search.value = ''
  category.value = 'all'
  mode.value = 'library'
  selectedItemId.value = undefined
  customName.value = ''
  quantity.value = 1
})

const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rulesRepository.equipment.filter((item) => {
    if (category.value !== 'all' && item.category !== category.value) return false
    if (!keyword) return true
    return item.name.toLowerCase().includes(keyword) || item.id.toLowerCase().includes(keyword)
  })
})

const selectedItem = computed(() => rulesRepository.getEquipment(selectedItemId.value ?? ''))

/** 当前选中是否可装备：自定义物品与规则标记不可装备的物品均不可。 */
const canEquip = computed(() => mode.value === 'library' && Boolean(selectedItem.value?.equippable))
const equipDisabledReason = computed(() => {
  if (!selectedItemId.value && mode.value === 'library') return '请先选择物品'
  if (mode.value === 'custom') return '自定义物品无法装备'
  if (!canEquip.value) return '该物品无法装备'
  return ''
})
const canAdd = computed(() => {
  if (mode.value === 'custom') return customName.value.trim().length > 0
  return Boolean(selectedItemId.value)
})

function selectItem(itemId: string): void {
  mode.value = 'library'
  selectedItemId.value = itemId
}

function changeQuantity(delta: 1 | -1): void {
  quantity.value = Math.max(1, quantity.value + delta)
}

function addItem(equip: boolean): void {
  if (!canAdd.value) return
  const itemId = mode.value === 'custom' ? customName.value.trim() : selectedItemId.value!
  emit('add', { itemId, quantity: quantity.value, equip })
}
</script>

<template>
  <UiModal :open="open" title="添加物品" @close="$emit('close')">
    <div class="add-item-modal">
      <label class="add-item-modal__search">
        <span>搜索物品</span>
        <input v-model="search" type="search" placeholder="输入名称查找（如：长剑、药水）" />
      </label>

      <div class="add-item-modal__categories" role="group" aria-label="物品分类">
        <button
          v-for="item in CATEGORIES"
          :key="item.id"
          type="button"
          class="add-item-modal__category"
          :class="{ 'add-item-modal__category--active': category === item.id }"
          :aria-pressed="category === item.id"
          @click="category = item.id"
        >
          {{ item.label }}
        </button>
      </div>

      <div v-if="filteredItems.length" class="add-item-modal__list">
        <ExpandableOptionCard
          v-for="item in filteredItems"
          :key="item.id"
          :title="item.name"
          :description="item.damageDice ? `${item.damageDice} ${item.damageType}伤害` : ''"
          :state="mode === 'library' && selectedItemId === item.id ? 'selected' : 'default'"
          expanded-label="物品介绍"
          @select="selectItem(item.id)"
        >
          <template v-if="item.description" #expanded>{{ item.description }}</template>
        </ExpandableOptionCard>
      </div>
      <p v-else class="add-item-modal__empty">没有匹配的物品，可改用下方自定义添加。</p>

      <section class="add-item-modal__custom">
        <header>
          <h4>自定义物品</h4>
          <span>未找到？手动输入物品名（如冒险获得的魔法物品）</span>
        </header>
        <input v-model="customName" type="text" placeholder="输入自定义物品名" @focus="mode = 'custom'" />
      </section>
    </div>

    <template #footer>
      <div class="add-item-modal__footer">
        <div class="add-item-modal__qty">
          <button type="button" :aria-label="`减少数量（当前 ${quantity}）`" @click="changeQuantity(-1)">−</button>
          <strong>{{ quantity }}</strong>
          <button type="button" :aria-label="`增加数量（当前 ${quantity}）`" @click="changeQuantity(1)">＋</button>
        </div>
        <div class="add-item-modal__actions">
          <button type="button" class="add-item-modal__action" :disabled="!canAdd" @click="addItem(false)">加入物品栏</button>
          <button type="button" class="add-item-modal__action add-item-modal__action--equip" :disabled="!canAdd || !canEquip" @click="addItem(true)">加入装备栏</button>
        </div>
        <p v-if="equipDisabledReason" class="add-item-modal__hint">{{ equipDisabledReason }}</p>
      </div>
    </template>
  </UiModal>
</template>

<style scoped lang="scss">
.add-item-modal {
  display: grid;
  gap: 0.8rem;

  &__search {
    display: grid;
    gap: 0.3rem;

    span {
      color: var(--color-text-muted);
      font-size: 0.72rem;
      font-weight: 700;
    }

    input {
      min-height: 2.75rem;
      padding: 0 0.7rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-background);
    }
  }

  &__categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__category {
    min-height: 2.25rem;
    padding: 0 0.7rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    color: var(--color-text-muted);
    background: var(--color-surface);
    font-size: 0.72rem;
    font-weight: 700;

    &--active {
      border-color: var(--color-primary);
      color: var(--color-surface);
      background: var(--color-primary);
    }
  }

  &__list {
    display: grid;
    max-height: 15rem;
    gap: 0.45rem;
    overflow: auto;
  }

  &__empty {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.76rem;
  }

  &__custom {
    display: grid;
    gap: 0.4rem;
    padding: 0.7rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);

    header {
      display: grid;
      gap: 0.15rem;

      h4 {
        margin: 0;
        font-size: 0.8rem;
      }

      span {
        color: var(--color-text-muted);
        font-size: 0.68rem;
      }
    }

    input {
      min-height: 2.75rem;
      padding: 0 0.7rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }
  }

  &__footer {
    display: grid;
    gap: 0.5rem;
  }

  &__qty {
    display: grid;
    grid-template-columns: 2.75rem 2rem 2.75rem;
    align-items: center;
    text-align: center;

    button {
      min-height: 2.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-primary);
      background: var(--color-surface);
      font-size: 1rem;
      font-weight: 700;
    }

    strong {
      font-size: 0.9rem;
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

    &--equip {
      color: var(--color-surface);
      background: var(--color-primary);
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
