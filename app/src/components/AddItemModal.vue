<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiScrollModal from '@/components/ui/UiScrollModal.vue'
import { rulesRepository } from '@/rules/repository'
import { isSourceEnabled } from '@/rules/source-books'
import type { EquipmentRule } from '@/types/rules'

const props = defineProps<{ open: boolean; enabledSourceIds?: readonly string[] }>()
const emit = defineEmits<{
  close: []
  add: [payload: { itemId: string; quantity: number; equip: boolean }]
}>()

const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'armor', label: '护甲' },
  { id: 'shield', label: '盾牌' },
  { id: 'weapon', label: '武器' },
  { id: 'potion', label: '药水' },
  { id: 'magic', label: '魔法' },
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
const sourceFilter = ref('all')
const sourceOptions = computed(() => [
  { id: 'all', label: '全部来源' },
  ...rulesRepository.sources.filter((source) => source.category === 'core' || props.enabledSourceIds?.includes(source.id)).map((source) => ({ id: source.id, label: source.shortTitle })),
])

watch(() => props.open, (open) => {
  if (!open) return
  search.value = ''
  category.value = 'all'
  mode.value = 'library'
  selectedItemId.value = undefined
  customName.value = ''
  quantity.value = 1
  sourceFilter.value = 'all'
})

const filteredItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rulesRepository.equipment.filter((item) => {
    if (!isSourceEnabled(item.sourceIds, props.enabledSourceIds)) return false
    if (sourceFilter.value !== 'all' && !item.sourceIds.includes(sourceFilter.value)) return false
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

/** 稀有度中文标签（用于装备详情展示）。 */
const RARITY_LABELS: Readonly<Record<NonNullable<EquipmentRule['rarity']>, string>> = {
  common: '常见',
  uncommon: '非普通',
  rare: '稀有',
  'very-rare': '非常稀有',
  legendary: '传说',
  artifact: '神器',
}

/** 装备详情行：由规则字段推导的结构化属性（展示用，不含价格/重量等未登记字段）。 */
function detailLines(item: EquipmentRule): string[] {
  const lines: string[] = []
  if (item.category === 'armor') {
    lines.push(
      item.addsDexterityToArmor
        ? `AC ${item.armorBase} + 敏捷调整值${item.armorDexterityCap ? `（最多 +${item.armorDexterityCap}）` : '（不限）'}`
        : `基础 AC ${item.armorBase}`,
    )
  } else if (item.category === 'shield') {
    lines.push(`持握时 AC 加值 +${item.armorClassBonus ?? 0}`)
  }
  if (item.weaponKind && item.damageDice) {
    lines.push(`${item.damageDice} ${item.damageType ?? ''}伤害`.trim())
  }
  if (item.magicBonus) lines.push(`魔法加值 +${item.magicBonus}`)
  if (item.rarity) lines.push(`稀有度：${RARITY_LABELS[item.rarity]}`)
  if (item.requiresAttunement) lines.push('需要同调')
  lines.push(item.equippable ? '可装备' : '不可装备')
  return lines
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
  <UiScrollModal :open="open" title="添加物品" @close="$emit('close')">
    <div class="add-item-modal">
      <ListShell
        searchable
        search-label="搜索物品"
        search-placeholder="输入名称查找（如：长剑、药水）"
        :query="search"
        @update:query="search = $event"
        :filters="CATEGORIES"
        :filter="category"
        @update:filter="category = $event as CategoryId"
        :empty="!filteredItems.length"
        empty-text="没有匹配的物品，可改用下方自定义添加。"
      >
        <template #header>
          <label class="add-item-modal__source-filter">
            <span>来源</span>
            <select v-model="sourceFilter">
              <option v-for="source in sourceOptions" :key="source.id" :value="source.id">{{ source.label }}</option>
            </select>
          </label>
        </template>
        <ExpandableOptionCard
          v-for="item in filteredItems"
          :key="item.id"
          :title="item.name"
          :description="item.damageDice ? `${item.damageDice} ${item.damageType}伤害` : ''"
          :state="mode === 'library' && selectedItemId === item.id ? 'selected' : 'default'"
          expanded-label="装备详情"
          expand-on-select
          @select="selectItem(item.id)"
        >
          <template #expanded>
            <p class="add-item-modal__item-detail">{{ item.description }}</p>
            <ul v-if="detailLines(item).length" class="add-item-modal__item-meta">
              <li v-for="line in detailLines(item)" :key="line">{{ line }}</li>
            </ul>
          </template>
        </ExpandableOptionCard>
      </ListShell>

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
  </UiScrollModal>
</template>

<style scoped lang="scss">
.add-item-modal {
  display: grid;
  gap: 0.8rem;

  &__item-detail {
    margin: 0;
  }

  &__source-filter { display: flex; min-height: 2.75rem; align-items: center; gap: 0.5rem; color: var(--color-text-muted); font-size: 0.75rem; }
  &__source-filter select { min-height: 2.4rem; padding: 0 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); }

  &__item-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      padding: 0.15rem 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: 999px;
      color: var(--color-primary);
      background: var(--color-surface);
      font-size: 0.68rem;
      font-weight: 700;
      white-space: nowrap;
    }
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
