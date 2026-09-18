<script setup lang="ts">
import { computed } from 'vue'

import UiBadge from '@/components/ui/UiBadge.vue'
import UiChip from '@/components/ui/UiChip.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import { getRulesRepository } from '@/rules/repositories'
import { getSelectableSources } from '@/rules/source-books'
import type { RulesetId } from '@/types/character'

const props = withDefaults(defineProps<{ selected: readonly string[]; ruleset?: RulesetId }>(), { ruleset: '5e-2014' })
const emit = defineEmits<{ change: [value: readonly string[]] }>()

const repository = computed(() => getRulesRepository(props.ruleset))
const coreSources = computed(() => repository.value.sources.filter((source) => source.category === 'core'))
/** 按草稿规则集提供可切换来源；2024 当前全部为破解奥秘（UA）游玩测试来源。 */
const selectableSources = computed(() => getSelectableSources(props.ruleset))
const officialSources = computed(() => selectableSources.value.filter((source) => source.contentKind !== 'playtest'))
const playtestSources = computed(() => selectableSources.value.filter((source) => source.contentKind === 'playtest'))

function toggle(id: string): void {
  emit('change', props.selected.includes(id)
    ? props.selected.filter((item) => item !== id)
    : [...props.selected, id])
}
</script>

<template>
  <section class="sources-step">
    <UiNotice tone="info" title="核心规则始终启用">
      {{ coreSources.map((source) => source.title).join('、') }} 不受扩展书开关影响。
    </UiNotice>
    <UiNotice v-if="playtestSources.length > 0" tone="warning" title="破解奥秘为游玩测试内容">
      破解奥秘（UA）不是官方正式规则，只是设计原型；启用后相关内容会显示「游玩测试」标记，使用前请获得 DM 同意。
    </UiNotice>
    <template v-if="selectableSources.length > 0">
      <div class="sources-step__toolbar">
        <button type="button" @click="$emit('change', selectableSources.map((source) => source.id))">全部启用</button>
        <button type="button" @click="$emit('change', [])">只用核心规则</button>
      </div>
      <div v-if="officialSources.length > 0" class="sources-step__list" aria-label="可选扩展书">
        <UiChip
          v-for="source in officialSources"
          :key="source.id"
          :selected="selected.includes(source.id)"
          :title="source.title"
          @toggle="toggle(source.id)"
        >
          {{ source.shortTitle }} · {{ source.title }}
        </UiChip>
      </div>
      <div v-if="playtestSources.length > 0" class="sources-step__list" aria-label="游玩测试来源">
        <UiChip
          v-for="source in playtestSources"
          :key="source.id"
          :selected="selected.includes(source.id)"
          :title="source.title"
          @toggle="toggle(source.id)"
        >
          <span class="sources-step__playtest-label"><UiBadge tone="warning">游玩测试</UiBadge> {{ source.shortTitle }} · {{ source.title }}</span>
        </UiChip>
      </div>
      <p class="sources-step__summary">已启用 {{ selected.length }} / {{ selectableSources.length }} 本扩展资料。关闭来源不会删除已选内容，但相关选择会暂时失效。</p>
    </template>
  </section>
</template>

<style scoped lang="scss">
.sources-step {
  display: grid;
  gap: 1rem;

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;

    button {
      min-height: 44px;
      padding: 0.55rem 0.9rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-primary);
      cursor: pointer;
    }
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  &__playtest-label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  &__summary {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    line-height: 1.6;
  }
}
</style>
