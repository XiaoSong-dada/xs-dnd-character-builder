<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import UiScrollModal from '@/components/ui/UiScrollModal.vue'
import {
  EQUIPMENT_FILTER_ATTUNEMENTS,
  EQUIPMENT_FILTER_CATEGORIES,
  EQUIPMENT_FILTER_RARITIES,
  filterEquipmentCatalog,
  type EquipmentFilterAttunement,
  type EquipmentFilterCategory,
  type EquipmentFilterRarity,
} from '@/rules/equipment-filter'
import { loadItemCatalog } from '@/rules/item-catalog-loader'
import { rulesRepository } from '@/rules/repository'
import { isSourceEnabled } from '@/rules/source-books'
import type { EquipmentRule } from '@/types/rules'

const props = defineProps<{ open: boolean; enabledSourceIds?: readonly string[] }>()
const emit = defineEmits<{
  close: []
  add: [payload: { itemId: string; quantity: number; equip: boolean }]
}>()

const CATEGORY_LABELS: Readonly<Record<EquipmentFilterCategory, string>> = {
  armor: '护甲',
  shield: '盾牌',
  weapon: '武器',
  potion: '药水',
  ring: '戒指',
  rod: '权杖',
  scroll: '卷轴',
  staff: '法杖',
  wand: '魔杖',
  wondrous: '奇物',
  tool: '工具',
  gear: '杂物',
}

const RARITY_LABELS: Readonly<Record<NonNullable<EquipmentRule['rarity']>, string>> = {
  common: '常见',
  uncommon: '非普通',
  rare: '稀有',
  'very-rare': '非常稀有',
  legendary: '传说',
  artifact: '神器',
  varies: '多种稀有度',
}

const ATTUNEMENT_LABELS: Readonly<Record<EquipmentFilterAttunement, string>> = {
  none: '否',
  required: '是',
  conditional: '特殊',
}

const MAGIC_CATEGORY_LABELS: Readonly<Record<NonNullable<EquipmentRule['magicItemCategory']>, string>> = {
  armor: '护甲',
  potion: '药水',
  ring: '戒指',
  rod: '权杖',
  scroll: '卷轴',
  staff: '法杖',
  wand: '魔杖',
  weapon: '武器',
  wondrous: '奇物',
}

/** 按钮式筛选的四个条件组，固定顺序：来源 → 同调 → 类别 → 稀有度。 */
type FilterPanelKey = 'source' | 'attunement' | 'category' | 'rarity'

const search = ref('')
const mode = ref<'library' | 'custom'>('library')
const selectedItemId = ref<string>()
const customName = ref('')
const quantity = ref(1)
/** 当前展开的筛选组；同一时间只展开一组，再次点击收起。 */
const activeFilterPanel = ref<FilterPanelKey | null>(null)
const selectedCategories = ref<EquipmentFilterCategory[]>([...EQUIPMENT_FILTER_CATEGORIES])
const selectedRarities = ref<EquipmentFilterRarity[]>([...EQUIPMENT_FILTER_RARITIES])
const selectedAttunements = ref<EquipmentFilterAttunement[]>([...EQUIPMENT_FILTER_ATTUNEMENTS])
const selectedSourceIds = ref<string[]>([])
const visibleLimit = ref(80)

/** 完整目录加载状态：主界面只带最小运行时索引，目录分块在弹窗打开时按需加载。 */
const catalogState = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const catalogItems = ref<readonly EquipmentRule[]>([])

const sourceOptions = computed(() => [
  ...rulesRepository.sources
    .filter((source) => (props.enabledSourceIds === undefined || source.category === 'core' || props.enabledSourceIds.includes(source.id))
      && rulesRepository.equipment.some((item) => item.sourceIds.includes(source.id)))
    .map((source) => ({ id: source.id, label: source.shortTitle })),
])

watch(() => props.open, (open) => {
  if (!open) return
  search.value = ''
  mode.value = 'library'
  selectedItemId.value = undefined
  customName.value = ''
  quantity.value = 1
  activeFilterPanel.value = null
  selectedCategories.value = [...EQUIPMENT_FILTER_CATEGORIES]
  selectedRarities.value = [...EQUIPMENT_FILTER_RARITIES]
  selectedAttunements.value = [...EQUIPMENT_FILTER_ATTUNEMENTS]
  selectedSourceIds.value = sourceOptions.value.map((source) => source.id)
  visibleLimit.value = 80
  void ensureCatalog()
}, { immediate: true })

async function ensureCatalog(): Promise<void> {
  if (catalogState.value === 'loading' || catalogState.value === 'ready') return
  catalogState.value = 'loading'
  try {
    catalogItems.value = await loadItemCatalog()
    catalogState.value = 'ready'
  } catch {
    catalogState.value = 'error'
  }
}

function retryCatalog(): void {
  if (catalogState.value !== 'error') return
  void ensureCatalog()
}

/** 完整条目视图：最小索引 + 目录分块（含 description）按稳定 ID 覆盖。
 * 只替换索引中的空描述条目（目录轻量投影）；手工条目与静态数据永不被目录重印覆盖。 */
const catalogById = computed(() => {
  const map = new Map<string, EquipmentRule>()
  for (const item of catalogItems.value) {
    const existing = map.get(item.id)
    // 同名重印（如 Feather Token）优先保留 selectable 条目，避免 index-only 覆盖。
    if (!existing || (existing.status === 'index-only' && item.status === 'selectable')) {
      map.set(item.id, item)
    }
  }
  return map
})
const fullItems = computed(() => rulesRepository.equipment.map((item) =>
  item.description === '' ? catalogById.value.get(item.id) ?? item : item))

const filteredItems = computed(() => {
  const availableItems = fullItems.value.filter((item) => isSourceEnabled(item.sourceIds, props.enabledSourceIds))
  return filterEquipmentCatalog(availableItems, {
    query: search.value,
    categories: selectedCategories.value,
    rarities: selectedRarities.value,
    attunements: selectedAttunements.value,
    sourceIds: selectedSourceIds.value,
  })
})
const visibleItems = computed(() => filteredItems.value.slice(0, visibleLimit.value))

const emptyGroupWarning = computed(() => !selectedCategories.value.length
  || !selectedRarities.value.length
  || !selectedAttunements.value.length
  || !selectedSourceIds.value.length)

const filterPanels = computed<Readonly<{ key: FilterPanelKey; label: string; selected: number; total: number }[]>>(() => [
  { key: 'source', label: '来源', selected: selectedSourceIds.value.length, total: sourceOptions.value.length },
  { key: 'attunement', label: '同调', selected: selectedAttunements.value.length, total: EQUIPMENT_FILTER_ATTUNEMENTS.length },
  { key: 'category', label: '类别', selected: selectedCategories.value.length, total: EQUIPMENT_FILTER_CATEGORIES.length },
  { key: 'rarity', label: '稀有度', selected: selectedRarities.value.length, total: EQUIPMENT_FILTER_RARITIES.length },
])

watch(filteredItems, (items) => {
  visibleLimit.value = 80
  if (selectedItemId.value && !items.some((item) => item.id === selectedItemId.value)) selectedItemId.value = undefined
})

const selectedItem = computed(() =>
  fullItems.value.find((item) => item.id === selectedItemId.value)
  ?? rulesRepository.getEquipment(selectedItemId.value ?? ''))

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
  return Boolean(selectedItemId.value) && selectedItem.value?.rarity !== 'varies'
})
const actionHint = computed(() => selectedItem.value?.rarity === 'varies'
  ? '该索引包含多个型号，请搜索具体型号或使用自定义物品。'
  : equipDisabledReason.value)

function selectItem(itemId: string): void {
  mode.value = 'library'
  selectedItemId.value = itemId
}

function toggleAll<T extends string>(selected: readonly T[], all: readonly T[]): T[] {
  return selected.length === all.length ? [] : [...all]
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
  if (item.magicItemCategory) lines.push(`魔法类别：${MAGIC_CATEGORY_LABELS[item.magicItemCategory]}`)
  if (item.rarity) lines.push(`稀有度：${RARITY_LABELS[item.rarity]}`)
  if (item.attunement === 'required') lines.push('需要同调')
  if (item.attunement === 'conditional') lines.push(`特殊同调：${item.attunementCondition ?? '条件见物品说明'}`)
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
  <UiScrollModal :open="open" title="添加物品" :body-scroll="false" max-height="min(96dvh, 60rem)" @close="$emit('close')">
    <div class="add-item-modal">
      <label class="add-item-modal__search">
        <span class="add-item-modal__search-label">搜索物品</span>
        <input v-model="search" type="search" placeholder="输入中文名、英文名或物品 ID" aria-label="搜索物品" />
      </label>

      <div class="add-item-modal__filter-bar" role="group" aria-label="筛选条件">
        <button
          v-for="panel in filterPanels"
          :key="panel.key"
          type="button"
          class="add-item-modal__filter-button"
          :class="{ 'add-item-modal__filter-button--active': activeFilterPanel === panel.key }"
          :aria-expanded="activeFilterPanel === panel.key"
          :aria-controls="`add-item-filter-${panel.key}`"
          @click="activeFilterPanel = activeFilterPanel === panel.key ? null : panel.key"
        >
          {{ panel.label }}<span v-if="panel.selected < panel.total" class="add-item-modal__filter-count">{{ panel.selected }}/{{ panel.total }}</span>
        </button>
      </div>

      <div v-if="activeFilterPanel" class="add-item-modal__filter-panel">
        <fieldset v-if="activeFilterPanel === 'source'" id="add-item-filter-source">
          <legend>来源</legend>
          <button type="button" @click="selectedSourceIds = toggleAll(selectedSourceIds, sourceOptions.map((source) => source.id))">
            {{ selectedSourceIds.length === sourceOptions.length ? '取消全选' : '全选' }}
          </button>
          <label v-for="source in sourceOptions" :key="source.id">
            <input v-model="selectedSourceIds" type="checkbox" :value="source.id" />
            <span>{{ source.label }}</span>
          </label>
        </fieldset>
        <fieldset v-if="activeFilterPanel === 'attunement'" id="add-item-filter-attunement">
          <legend>同调</legend>
          <button type="button" @click="selectedAttunements = toggleAll(selectedAttunements, EQUIPMENT_FILTER_ATTUNEMENTS)">
            {{ selectedAttunements.length === EQUIPMENT_FILTER_ATTUNEMENTS.length ? '取消全选' : '全选' }}
          </button>
          <label v-for="attunement in EQUIPMENT_FILTER_ATTUNEMENTS" :key="attunement">
            <input v-model="selectedAttunements" type="checkbox" :value="attunement" />
            <span>{{ ATTUNEMENT_LABELS[attunement] }}</span>
          </label>
        </fieldset>
        <fieldset v-if="activeFilterPanel === 'category'" id="add-item-filter-category">
          <legend>类别</legend>
          <button type="button" @click="selectedCategories = toggleAll(selectedCategories, EQUIPMENT_FILTER_CATEGORIES)">
            {{ selectedCategories.length === EQUIPMENT_FILTER_CATEGORIES.length ? '取消全选' : '全选' }}
          </button>
          <label v-for="filterCategory in EQUIPMENT_FILTER_CATEGORIES" :key="filterCategory">
            <input v-model="selectedCategories" type="checkbox" :value="filterCategory" />
            <span>{{ CATEGORY_LABELS[filterCategory] }}</span>
          </label>
        </fieldset>
        <fieldset v-if="activeFilterPanel === 'rarity'" id="add-item-filter-rarity">
          <legend>稀有度</legend>
          <button type="button" @click="selectedRarities = toggleAll(selectedRarities, EQUIPMENT_FILTER_RARITIES)">
            {{ selectedRarities.length === EQUIPMENT_FILTER_RARITIES.length ? '取消全选' : '全选' }}
          </button>
          <label v-for="rarity in EQUIPMENT_FILTER_RARITIES" :key="rarity">
            <input v-model="selectedRarities" type="checkbox" :value="rarity" />
            <span>{{ RARITY_LABELS[rarity] }}</span>
          </label>
        </fieldset>
      </div>

      <div class="add-item-modal__result-area">
        <div class="add-item-modal__result-heading">
          <strong>找到 {{ filteredItems.length }} 件物品</strong>
        </div>

        <div v-if="catalogState === 'loading'" class="add-item-modal__catalog-state">正在加载物品目录…</div>
        <div v-else-if="catalogState === 'error'" class="add-item-modal__catalog-state add-item-modal__catalog-state--error">
          <span>物品目录加载失败，请重试。</span>
          <button type="button" @click="retryCatalog">重试</button>
        </div>
        <template v-else>
          <p v-if="emptyGroupWarning" class="add-item-modal__filter-warning">
            至少有一个筛选组未选择任何条件，因此没有匹配结果。
          </p>
          <p v-else-if="!filteredItems.length" class="add-item-modal__empty">没有匹配的物品，可改用下方自定义添加。</p>
          <ExpandableOptionCard
            v-for="item in visibleItems"
            :key="item.id"
            :title="item.name"
            :description="item.damageDice ? `${item.damageDice} ${item.damageType}伤害 · ${item.englishName}` : item.englishName"
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
          <button
            v-if="visibleItems.length < filteredItems.length"
            type="button"
            class="add-item-modal__load-more"
            @click="visibleLimit += 80"
          >
            显示更多（剩余 {{ filteredItems.length - visibleItems.length }} 件）
          </button>
        </template>

        <section class="add-item-modal__custom">
          <header>
            <h4>自定义物品</h4>
            <span>未找到？手动输入物品名（如冒险获得的魔法物品）</span>
          </header>
          <input v-model="customName" type="text" placeholder="输入自定义物品名" @focus="mode = 'custom'" />
        </section>
      </div>
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
        <p v-if="actionHint" class="add-item-modal__hint">{{ actionHint }}</p>
      </div>
    </template>
  </UiScrollModal>
</template>

<style scoped lang="scss">
// 布局固定：标题（UiScrollModal header）、搜索框、筛选按钮行与展开面板、底部数量与添加按钮
// （UiScrollModal footer）均不滚动；只有结果区域（__result-area）随列表滚动。
.add-item-modal {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 0.6rem;

  &__search {
    display: grid;
    flex-shrink: 0;
    gap: 0.3rem;

    &-label {
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

  &__filter-bar {
    display: flex;
    flex-shrink: 0;
    flex-wrap: nowrap;
    gap: 0.4rem;
  }

  &__filter-button {
    display: inline-flex;
    min-width: 0;
    min-height: 2.75rem;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 0 0.7rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-primary);
    background: var(--color-surface);
    font-size: 0.76rem;
    font-weight: 700;
    white-space: nowrap;

    &--active {
      border-color: var(--color-primary);
      background: var(--color-primary-soft);
    }
  }

  &__filter-count {
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    color: var(--color-surface);
    background: var(--color-primary);
    font-size: 0.65rem;
    font-weight: 700;
  }

  &__filter-panel {
    display: grid;
    max-height: min(35dvh, 16rem);
    flex-shrink: 0;
    gap: 0.45rem;
    padding: 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-background);
    overflow-y: auto;
    overscroll-behavior: contain;

    fieldset {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.3rem;
      margin: 0;
      padding: 0.35rem 0;
      border: 0;

      legend {
        float: left;
        min-width: 3.5rem;
        padding: 0.45rem 0;
        font-size: 0.75rem;
        font-weight: 800;
      }

      button,
      label {
        display: inline-flex;
        min-height: 2.75rem;
        align-items: center;
        gap: 0.25rem;
        padding: 0 0.55rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        background: var(--color-surface);
        font-size: 0.72rem;
      }

      button {
        color: var(--color-primary);
        font-weight: 700;
      }

      input {
        width: 1rem;
        height: 1rem;
        accent-color: var(--color-primary);
      }
    }
  }

  &__result-area {
    display: grid;
    flex: 1;
    min-height: 0;
    align-content: start;
    // 展开卡片包含标题区与详情区；显式按内容高度计算隐式行，避免卡片仍被压在最小高度内。
    grid-auto-rows: max-content;
    gap: 0.5rem;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  &__result-heading {
    font-size: 0.75rem;
  }

  &__catalog-state {
    display: flex;
    min-height: 6rem;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.76rem;

    button {
      min-height: 2.75rem;
      padding: 0 0.8rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-primary);
      background: var(--color-surface);
      font-weight: 700;
    }

    &--error {
      color: var(--color-warning, #b58900);
    }
  }

  &__filter-warning {
    margin: 0;
    color: var(--color-warning, #b58900);
    font-size: 0.7rem;
  }

  &__empty {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.76rem;
  }

  &__item-detail {
    margin: 0;
  }

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

  &__load-more {
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-primary);
    background: var(--color-surface);
    font-weight: 700;
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
