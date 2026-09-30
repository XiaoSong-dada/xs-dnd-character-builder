<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import ExpandableOptionCard from '@/components/ui/ExpandableOptionCard.vue'
import ListShell from '@/components/ui/ListShell.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiScrollModal from '@/components/ui/UiScrollModal.vue'
import { getFeatEligibility, getFeatStructuredEffectLabels, listFeatGrants } from '@/rules/feats'
import { getFeatEligibilityContext } from '@/rules/feat-eligibility'
import { getRulesRepository } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'
import type { CharacterDraft } from '@/types/character'
import type { FeatCategory, FeatRule } from '@/types/rules'

const props = defineProps<{ open: boolean; draft: CharacterDraft }>()
const emit = defineEmits<{ close: []; add: [featId: string] }>()
const search = ref('')
const sourceId = ref('all')
const category = ref<FeatCategory | 'all'>('all')
const selectedId = ref('')
const repository = computed(() => getRulesRepository(props.draft.ruleset))

const categoryLabels: Readonly<Partial<Record<FeatCategory, string>>> = {
  origin: '起源', general: '通用', 'epic-boon': '传奇恩惠', 'fighting-style': '战斗风格',
  dragonmark: '龙纹', 'wild-talent': '狂野天赋', bloodline: '血族',
}
const sources = computed(() => repository.value.sources.filter((source) =>
  source.category === 'core' || props.draft.enabledSourceIds.includes(source.id)))
const categories = computed(() => [...new Set(repository.value.feats
  .map((feat) => feat.category)
  .filter((item): item is FeatCategory => Boolean(item)))])
const grants = computed(() => listFeatGrants(props.draft, repository.value))
const eligibilityContext = computed(() => getFeatEligibilityContext(props.draft, { checkpointLevel: props.draft.targetLevel }))

function duplicateReason(feat: FeatRule): string {
  return !feat.repeatable && grants.value.some((grant) => grant.featId === feat.id) ? '该专长不可重复获得' : ''
}
function eligibilityReasons(feat: FeatRule): readonly string[] {
  return getFeatEligibility(feat, eligibilityContext.value).reasons
}
function sourceLabel(feat: FeatRule): string {
  return feat.sourceIds.map((id) => repository.value.sources.find((source) => source.id === id)?.shortTitle ?? id).join('、')
}
function automationLabel(feat: FeatRule): string {
  const labels = getFeatStructuredEffectLabels(feat)
  return labels.length ? `自动生效：${labels.join('、')}` : '仅展示：效果需手动处理'
}

const filtered = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('zh-CN')
  return repository.value.feats.filter((feat) => feat.status !== 'unavailable'
    && isSourceEnabled(feat.sourceIds, props.draft.enabledSourceIds, repository.value)
    && (sourceId.value === 'all' || feat.sourceIds.includes(sourceId.value))
    && (category.value === 'all' || feat.category === category.value)
    && (!query || `${feat.name} ${feat.englishName} ${feat.id}`.toLocaleLowerCase('zh-CN').includes(query)))
})
const selected = computed(() => repository.value.getFeat(selectedId.value))

watch(() => props.open, (open) => {
  if (!open) return
  search.value = ''
  sourceId.value = 'all'
  category.value = 'all'
  selectedId.value = ''
})

function select(feat: FeatRule): void {
  if (duplicateReason(feat)) return
  selectedId.value = feat.id
}
function submit(): void {
  if (!selected.value || duplicateReason(selected.value)) return
  emit('add', selected.value.id)
}
</script>

<template>
  <UiScrollModal :open="open" title="添加专长" :body-scroll="false" @close="$emit('close')">
    <div class="manual-feat-modal">
      <div class="manual-feat-modal__version"><UiBadge tone="primary">{{ draft.ruleset === '5e-2024' ? '2024 规则' : '2014 规则' }}</UiBadge><span>先决条件仅提示，不阻止 DM／手工添加。</span></div>
      <div class="manual-feat-modal__filters">
        <input v-model="search" type="search" placeholder="搜索中英文专长名" aria-label="搜索专长">
        <select v-model="sourceId" aria-label="按来源筛选"><option value="all">全部来源</option><option v-for="source in sources" :key="source.id" :value="source.id">{{ source.shortTitle }}</option></select>
        <select v-model="category" aria-label="按类别筛选"><option value="all">全部类别</option><option v-for="item in categories" :key="item" :value="item">{{ categoryLabels[item] ?? item }}</option></select>
      </div>
      <div class="manual-feat-modal__results">
        <ListShell :empty="filtered.length === 0" empty-text="没有符合条件的专长。">
          <ExpandableOptionCard
            v-for="feat in filtered"
            :key="feat.id"
            :title="`${feat.name} · ${feat.englishName}`"
            :description="`${categoryLabels[feat.category ?? 'general'] ?? '未分类'} · ${sourceLabel(feat)} · ${feat.description}`"
            :state="selectedId === feat.id ? 'selected' : duplicateReason(feat) ? 'locked' : 'default'"
            :disabled-reason="duplicateReason(feat)"
            expanded-label="专长详情"
            @select="select(feat)"
          >
            <template #suffix>
              <UiBadge v-if="duplicateReason(feat)" tone="warning">已拥有</UiBadge>
              <UiBadge v-else-if="eligibilityReasons(feat).length" tone="warning">前置不满足</UiBadge>
              <UiBadge v-else-if="getFeatStructuredEffectLabels(feat).length" tone="success">可自动生效</UiBadge>
              <UiBadge v-else tone="neutral">仅展示</UiBadge>
            </template>
            <template #expanded>
              <div class="manual-feat-modal__detail">
                <p>{{ feat.detail }}</p>
                <p><strong>处理范围：</strong>{{ automationLabel(feat) }}</p>
                <p v-if="eligibilityReasons(feat).length" class="manual-feat-modal__warning"><strong>先决条件提示：</strong>{{ eligibilityReasons(feat).join('；') }}。仍可手动添加。</p>
                <p v-if="!getFeatStructuredEffectLabels(feat).length" class="manual-feat-modal__warning">部分效果仅供查阅，未自动计入角色数据。</p>
              </div>
            </template>
          </ExpandableOptionCard>
        </ListShell>
      </div>
    </div>
    <template #footer>
      <div class="manual-feat-modal__actions">
        <BaseButton variant="secondary" @click="$emit('close')">取消</BaseButton>
        <BaseButton :disabled="!selected" @click="submit">{{ selected?.choices?.length ? '添加并配置' : '添加专长' }}</BaseButton>
      </div>
    </template>
  </UiScrollModal>
</template>

<style scoped lang="scss">
.manual-feat-modal { display: flex; flex: 1; min-height: 0; flex-direction: column; gap: 0.75rem; }
.manual-feat-modal__version { display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-muted); font-size: 0.75rem; }
.manual-feat-modal__filters { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.manual-feat-modal__filters input { grid-column: 1 / -1; }
.manual-feat-modal__filters input, .manual-feat-modal__filters select { min-height: 2.75rem; padding: 0.65rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); }
.manual-feat-modal__results { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
.manual-feat-modal__detail { display: grid; gap: 0.5rem; }
.manual-feat-modal__detail p { margin: 0; }
.manual-feat-modal__warning { color: var(--color-warning-text, #8a5b00); }
.manual-feat-modal__actions { display: grid; width: 100%; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
</style>
