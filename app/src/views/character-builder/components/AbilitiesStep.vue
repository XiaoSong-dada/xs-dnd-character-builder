<script setup lang="ts">
import { computed } from 'vue'

import { areBaseAbilitiesValid, pointBuyCost } from '@/rules/abilities'
import type { AbilityKey, AbilityMethod, AbilityScores } from '@/types/character'

const props = defineProps<{
  scores: AbilityScores
  method: AbilityMethod
  bonuses: Partial<AbilityScores>
  flexibleCount: number
  flexibleChoices: readonly AbilityKey[]
  excludedChoices?: readonly AbilityKey[]
}>()
const emit = defineEmits<{ change: [scores: AbilityScores]; choices: [choices: readonly AbilityKey[]] }>()
const labels: Record<AbilityKey, string> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
const keys: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const pointCost = computed(() => pointBuyCost(props.scores))
const methodValid = computed(() => areBaseAbilitiesValid(props.scores, props.method))

function update(key: AbilityKey, value: number): void {
  const minimum = props.method === 'point-buy' ? 8 : 3
  const maximum = props.method === 'point-buy' ? 15 : 20
  emit('change', { ...props.scores, [key]: Math.max(minimum, Math.min(maximum, value)) })
}

function minimumScore(): number {
  return props.method === 'point-buy' ? 8 : 3
}

function maximumScore(): number {
  return props.method === 'point-buy' ? 15 : 20
}

function canDecrease(key: AbilityKey): boolean {
  return props.scores[key] > minimumScore()
}

function canIncrease(key: AbilityKey): boolean {
  if (props.scores[key] >= maximumScore()) return false
  if (props.method !== 'point-buy') return true
  return pointBuyCost({ ...props.scores, [key]: props.scores[key] + 1 }) <= 27
}

function decrease(key: AbilityKey): void {
  if (canDecrease(key)) update(key, props.scores[key] - 1)
}

function increase(key: AbilityKey): void {
  if (canIncrease(key)) update(key, props.scores[key] + 1)
}

function toggleChoice(key: AbilityKey): void {
  if (props.excludedChoices?.includes(key)) return
  const next = props.flexibleChoices.includes(key)
    ? props.flexibleChoices.filter((item) => item !== key)
    : [...props.flexibleChoices, key].slice(-props.flexibleCount)
  emit('choices', next)
}
</script>

<template>
  <section class="abilities-step">
    <p>先填写基础属性，再应用2014种族与子种族加值。职业推荐不会限制分配。</p>
    <aside :class="{ 'abilities-step__method--error': !methodValid }" class="abilities-step__method">
      <strong v-if="method === 'standard-array'">标准数组</strong>
      <strong v-else-if="method === 'point-buy'">27点购点：已使用 {{ pointCost }}/27</strong>
      <strong v-else>自定义属性</strong>
      <span v-if="method === 'standard-array'">六项基础值必须恰好使用 15、14、13、12、10、8。</span>
      <span v-else-if="method === 'point-buy'">每项范围 8—15，总花费不能超过27点。</span>
      <span v-else>每项范围 3—20；自定义结果应由玩家与DM确认。</span>
    </aside>
    <div v-if="flexibleCount" class="abilities-step__choices">
      <strong>种族允许选择{{ flexibleCount }}项不同属性 +1</strong>
      <button
        v-for="key in keys"
        :key="key"
        type="button"
        :aria-pressed="flexibleChoices.includes(key)"
        :disabled="excludedChoices?.includes(key)"
        @click="toggleChoice(key)"
      >
        {{ flexibleChoices.includes(key) ? '✓ ' : '' }}{{ labels[key] }}{{ excludedChoices?.includes(key) ? '（不可选）' : '' }}
      </button>
    </div>
    <article v-for="key in keys" :key="key" class="abilities-step__ability">
      <span>{{ labels[key] }}</span>
      <small>最终 {{ scores[key] + (bonuses[key] ?? 0) }}</small>
      <div class="abilities-step__stepper">
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
}
</style>
