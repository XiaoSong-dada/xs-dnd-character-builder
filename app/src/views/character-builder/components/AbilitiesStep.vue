<script setup lang="ts">
import { computed } from 'vue'

import { areBaseAbilitiesValid, areOriginAbilitiesWithinCap, pointBuyCost, STANDARD_ARRAY } from '@/rules/abilities'
import type { AbilityKey, AbilityMethod, AbilityScores } from '@/types/character'

const props = defineProps<{
  scores: AbilityScores
  method: AbilityMethod
  bonuses: Partial<AbilityScores>
  flexibleCount: number
  flexibleChoices: readonly AbilityKey[]
  flexibleGroups?: readonly { count: number; value: number }[]
  excludedChoices?: readonly AbilityKey[]
}>()
const emit = defineEmits<{ change: [scores: AbilityScores]; choices: [choices: readonly AbilityKey[]] }>()
const labels: Record<AbilityKey, string> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
const keys: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const pointCost = computed(() => pointBuyCost(props.scores))
const methodValid = computed(() =>
  areBaseAbilitiesValid(props.scores, props.method)
  && areOriginAbilitiesWithinCap(props.scores, props.bonuses),
)

function update(key: AbilityKey, value: number): void {
  const minimum = props.method === 'point-buy' ? 8 : 3
  const maximum = props.method === 'point-buy' ? maximumScore(key) : 20
  emit('change', { ...props.scores, [key]: Math.max(minimum, Math.min(maximum, value)) })
}

function assignStandardValue(key: AbilityKey, value: number): void {
  if (!STANDARD_ARRAY.includes(value as (typeof STANDARD_ARRAY)[number])) return
  const previousValue = props.scores[key]
  const occupiedKey = keys.find((abilityKey) => props.scores[abilityKey] === value)
  if (!occupiedKey || occupiedKey === key) return
  emit('change', {
    ...props.scores,
    [key]: value,
    [occupiedKey]: previousValue,
  })
}

function minimumScore(): number {
  return props.method === 'point-buy' ? 8 : 3
}

function maximumScore(key: AbilityKey): number {
  return props.method === 'point-buy' ? 20 - (props.bonuses[key] ?? 0) : 20
}

function canDecrease(key: AbilityKey): boolean {
  return props.scores[key] > minimumScore()
}

function canIncrease(key: AbilityKey): boolean {
  if (props.scores[key] >= maximumScore(key)) return false
  if (props.method !== 'point-buy') return true
  const next = { ...props.scores, [key]: props.scores[key] + 1 }
  return areBaseAbilitiesValid(next, 'point-buy')
    && areOriginAbilitiesWithinCap(next, props.bonuses)
}

function decrease(key: AbilityKey): void {
  if (canDecrease(key)) update(key, props.scores[key] - 1)
}

function increase(key: AbilityKey): void {
  if (canIncrease(key)) update(key, props.scores[key] + 1)
}

function toggleChoice(key: AbilityKey): void {
  if (choiceDisabled(key)) return
  const next = props.flexibleChoices.includes(key)
    ? props.flexibleChoices.filter((item) => item !== key)
    : [...props.flexibleChoices, key].slice(-props.flexibleCount)
  emit('choices', next)
}

function choiceDisabled(key: AbilityKey): boolean {
  if (props.excludedChoices?.includes(key)) return true
  if (props.flexibleChoices.includes(key)) return false
  return props.scores[key] + (props.bonuses[key] ?? 0) + 1 > 20
}
</script>

<template>
  <section class="abilities-step">
    <p>先填写基础属性，再应用2014种族与子种族加值。职业推荐不会限制分配。</p>
    <aside :class="{ 'abilities-step__method--error': !methodValid }" class="abilities-step__method">
      <strong v-if="method === 'standard-array'">标准数组</strong>
      <strong v-else-if="method === 'point-buy'">27点购点：已使用 {{ pointCost }}/27</strong>
      <strong v-else>自定义属性</strong>
      <span v-if="method === 'standard-array'">将 15、14、13、12、10、8 分别分配给六项基础属性；这里不包含种族加成。选择已使用的数值时，两项属性会自动交换。</span>
      <span v-else-if="method === 'point-buy'">基础值从8开始，每提高1点消耗1点；27点预算只计算本页基础值，不计种族加成和后续属性提升。所有加成后的最终值不能超过20。</span>
      <span v-else>每项范围 3—20；自定义结果应由玩家与DM确认。</span>
    </aside>
    <div v-if="flexibleCount" class="abilities-step__choices">
      <strong v-if="flexibleGroups?.length">种族允许选择{{ flexibleGroups.map((g) => `${g.count}项不同属性 +${g.value}`).join('、') }}</strong>
      <strong v-else>种族允许选择{{ flexibleCount }}项不同属性 +1</strong>
      <button
        v-for="key in keys"
        :key="key"
        type="button"
        :aria-pressed="flexibleChoices.includes(key)"
        :disabled="choiceDisabled(key)"
        @click="toggleChoice(key)"
      >
        {{ flexibleChoices.includes(key) ? '✓ ' : '' }}{{ labels[key] }}{{ excludedChoices?.includes(key) ? '（不可选）' : '' }}
      </button>
    </div>
    <article v-for="key in keys" :key="key" class="abilities-step__ability">
      <span>{{ labels[key] }}</span>
      <small>最终 {{ scores[key] + (bonuses[key] ?? 0) }}</small>
      <label v-if="method === 'standard-array'" class="abilities-step__standard">
        <span class="sr-only">选择{{ labels[key] }}基础值</span>
        <select
          :aria-label="`选择${labels[key]}基础值`"
          :value="scores[key]"
          @change="assignStandardValue(key, Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="value in STANDARD_ARRAY" :key="value" :value="value">{{ value }}</option>
        </select>
      </label>
      <div v-else class="abilities-step__stepper">
        <button
          type="button"
          :aria-label="`减少${labels[key]}基础值`"
          :disabled="!canDecrease(key)"
          @click="decrease(key)"
        >
          −
        </button>
        <output :aria-label="`${labels[key]}基础值`" aria-live="polite">{{ scores[key] }}</output>
        <button
          type="button"
          :aria-label="`增加${labels[key]}基础值`"
          :disabled="!canIncrease(key)"
          @click="increase(key)"
        >
          +
        </button>
      </div>
      <small>
        基础 {{ scores[key] }} + 种族 {{ bonuses[key] ?? 0 }} =
        <b>{{ scores[key] + (bonuses[key] ?? 0) }}</b>
        · 调整值 {{ Math.floor((scores[key] + (bonuses[key] ?? 0) - 10) / 2) >= 0 ? '+' : '' }}{{ Math.floor((scores[key] + (bonuses[key] ?? 0) - 10) / 2) }}
      </small>
    </article>
  </section>
</template>

<style scoped lang="scss">
.abilities-step {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;

  > p { grid-column: 1 / -1; margin: 0; color: var(--color-text-muted); line-height: 1.6; }

  &__method {
    display: grid;
    grid-column: 1 / -1;
    gap: 0.2rem;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);

    span { color: var(--color-text-muted); font-size: 0.75rem; }

    &--error {
      border-color: var(--color-error);
      background: var(--color-error-soft);
    }
  }

  &__choices {
    display: flex;
    grid-column: 1 / -1;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0.75rem;
    border: 1px solid var(--color-gold);
    border-radius: var(--radius-md);
    background: var(--color-gold-soft);

    strong { width: 100%; font-size: 0.8rem; }
    button { min-height: 2.75rem; padding: 0.4rem 0.65rem; border: 1px solid var(--color-border); border-radius: 999px; background: var(--color-surface); }
    button[aria-pressed="true"] { border-color: var(--color-primary); color: var(--color-primary); font-weight: 700; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &__ability {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.4rem 0.5rem;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);

    > span {
      font-size: 0.85rem;
      font-weight: 700;
    }

    > small {
      color: var(--color-text-muted);
      font-size: 0.7rem;

      &:last-child {
        grid-column: 1 / -1;
        line-height: 1.45;
      }
    }
  }

  &__stepper {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: 2.75rem minmax(2.75rem, 1fr) 2.75rem;
    align-items: center;
    gap: 0.35rem;

    button {
      min-width: 2.75rem;
      min-height: 2.75rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-primary);
      background: var(--color-background);
      font-size: 1.35rem;
      font-weight: 700;

      &:disabled {
        color: var(--color-text-muted);
        opacity: 0.45;
        cursor: not-allowed;
      }
    }

    output {
      display: grid;
      min-height: 2.75rem;
      place-items: center;
      border: 1px solid var(--color-gold);
      border-radius: var(--radius-sm);
      background: var(--color-gold-soft);
      font-size: 1.15rem;
      font-variant-numeric: tabular-nums;
      font-weight: 800;
    }
  }

  &__standard {
    display: grid;
    grid-column: 1 / -1;

    select {
      width: 100%;
      min-height: 2.75rem;
      padding: 0 0.75rem;
      border: 1px solid var(--color-gold);
      border-radius: var(--radius-sm);
      color: var(--color-text);
      background: var(--color-gold-soft);
      font-size: 1rem;
      font-variant-numeric: tabular-nums;
      font-weight: 800;
    }
  }
}
</style>
