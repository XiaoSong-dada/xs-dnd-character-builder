<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { areBaseAbilitiesValid, areOriginAbilitiesWithinCap, DESTINY_MAX_COUNT, DESTINY_MIN_COUNT, destinyRollTotal, pointBuyCost, STANDARD_ARRAY } from '@/rules/abilities'
import type { AbilityKey, AbilityMethod, AbilityScores, RulesetId } from '@/types/character'
import type { RaceRule } from '@/types/rules'

const props = defineProps<{
  scores: AbilityScores
  method: AbilityMethod
  bonuses: Partial<AbilityScores>
  flexibleCount: number
  flexibleChoices: readonly AbilityKey[]
  flexibleGroups?: readonly { count: number; value: number }[]
  flexibleAlternatives?: RaceRule['flexibleBonusAlternatives']
  flexibleOptionId?: string
  excludedChoices?: readonly AbilityKey[]
  ruleset?: RulesetId
  /** 自定义属性下的天命次数（1—10）与掷出的数组（每组六项，4d6 去最低之和）。 */
  destinyCount?: number
  destinyRolls?: readonly (readonly number[])[]
  destinyError?: string
}>()
const emit = defineEmits<{
  change: [scores: AbilityScores]
  choices: [choices: readonly AbilityKey[]]
  option: [id: string]
  destinyCount: [count: number]
  destinyReroll: []
}>()
const labels: Record<AbilityKey, string> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
const keys: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const pointCost = computed(() => pointBuyCost(props.scores, props.ruleset ?? '5e-2014'))
const methodValid = computed(() =>
  areBaseAbilitiesValid(props.scores, props.method, props.ruleset ?? '5e-2014')
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
  if (props.method !== 'point-buy') return 20
  return props.ruleset === '5e-2024' ? 15 : 20 - (props.bonuses[key] ?? 0)
}

function canDecrease(key: AbilityKey): boolean {
  return props.scores[key] > minimumScore()
}

function canIncrease(key: AbilityKey): boolean {
  if (props.scores[key] >= maximumScore(key)) return false
  if (props.method !== 'point-buy') return true
  const next = { ...props.scores, [key]: props.scores[key] + 1 }
  return areBaseAbilitiesValid(next, 'point-buy', props.ruleset ?? '5e-2014')
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
  const nextChoices = [...props.flexibleChoices, key].slice(-props.flexibleCount)
  const bonusFor = (ability: AbilityKey, choices: readonly AbilityKey[]) => {
    const index = choices.indexOf(ability)
    if (index < 0) return 0
    const values = props.flexibleGroups?.flatMap((group) => Array.from({ length: group.count }, () => group.value))
    return values ? values[index] ?? 0 : index < props.flexibleCount ? 1 : 0
  }
  return keys.some((ability) => props.scores[ability] + (props.bonuses[ability] ?? 0)
    - bonusFor(ability, props.flexibleChoices) + bonusFor(ability, nextChoices) > 20)
}

/**
 * 天命次数输入：只在提交时夹取范围，输入过程中保留原文，
 * 这样清空重填或键入 10 这类两位数不会被提前改写。
 */
const destinyInput = ref<string>(String(props.destinyCount ?? DESTINY_MIN_COUNT))
/** 最近一次实际发出的次数；`null` 表示本次挂载还没有发过。 */
let lastEmittedDestinyCount: number | null = null

watch(() => props.destinyCount, (value) => {
  const next = value ?? DESTINY_MIN_COUNT
  if (Number(destinyInput.value) !== next) destinyInput.value = String(next)
})

function commitDestinyCount(): void {
  const parsed = Number(destinyInput.value)
  const count = Number.isFinite(parsed) && destinyInput.value.trim() !== ''
    ? Math.min(DESTINY_MAX_COUNT, Math.max(DESTINY_MIN_COUNT, Math.floor(parsed)))
    : DESTINY_MIN_COUNT
  destinyInput.value = String(count)
  // 同一个次数只发一次：input/change/blur 都会走到这里，避免每次按键或失焦都重掷
  if (count === (lastEmittedDestinyCount ?? props.destinyCount ?? DESTINY_MIN_COUNT)) return
  lastEmittedDestinyCount = count
  emit('destinyCount', count)
}

function formatDestinyRoll(roll: readonly number[]): string {
  return `[${roll.join(' ,')}] = ${destinyRollTotal(roll)}`
}
</script>

<template>
  <section class="abilities-step">
    <p>{{ ruleset === '5e-2024' ? '先填写基础属性；属性加值来自背景三候选分配，物种不提供加值。' : '先填写基础属性，再应用2014种族与子种族加值。职业推荐不会限制分配。' }}</p>
    <aside :class="{ 'abilities-step__method--error': !methodValid }" class="abilities-step__method">
      <strong v-if="method === 'standard-array'">标准数组</strong>
      <strong v-else-if="method === 'point-buy'">27点购点：已使用 {{ pointCost }}/27</strong>
      <strong v-else>自定义属性</strong>
      <span v-if="method === 'standard-array'">将 15、14、13、12、10、8 分别分配给六项基础属性；这里不包含种族加成。选择已使用的数值时，两项属性会自动交换。</span>
      <span v-else-if="method === 'point-buy'">{{ ruleset === '5e-2024' ? '官方购点：基础值 8—15，每项 9—13 花费 1 点，14 与 15 各花费 2 点；预算 27 点。这里不计背景加值与后续属性提升。' : '基础值从8开始，每提高1点消耗1点；27点预算只计算本页基础值，不计种族加成和后续属性提升。所有加成后的最终值不能超过20。' }}</span>
      <span v-else>每项范围 3—20；自定义结果应由玩家与DM确认。</span>
    </aside>
    <fieldset v-if="flexibleAlternatives?.length" class="abilities-step__choices">
      <legend>种族属性加值</legend>
      <label v-for="option in flexibleAlternatives" :key="option.id">
        <input type="radio" name="race-ability-bonus-option" :value="option.id" :checked="(flexibleOptionId ?? flexibleAlternatives[0]?.id) === option.id" @change="$emit('option', option.id)">
        {{ option.label }}
      </label>
    </fieldset>
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
    <section v-if="method === 'custom'" class="abilities-step__destiny">
      <div class="abilities-step__destiny-control">
        <label for="abilities-destiny-count">天命</label>
        <input
          id="abilities-destiny-count"
          :value="destinyInput"
          type="number"
          inputmode="numeric"
          :min="DESTINY_MIN_COUNT"
          :max="DESTINY_MAX_COUNT"
          step="1"
          aria-label="天命次数"
          @input="destinyInput = ($event.target as HTMLInputElement).value"
          @change="commitDestinyCount"
          @blur="commitDestinyCount"
        >
        <button type="button" @click="$emit('destinyReroll')">重新掷骰</button>
      </div>
      <p class="abilities-step__destiny-note">
        每项属性投 4 个 d6、取最高的三颗之和（3—18）；掷出的数组不含种族与背景加值，由你自己分配到六项属性。
      </p>
      <p v-if="destinyError" class="abilities-step__destiny-error" role="alert">{{ destinyError }}</p>
      <template v-else-if="destinyRolls?.length">
        <strong class="abilities-step__destiny-title">天命随机点数:</strong>
        <ol class="abilities-step__destiny-list">
          <li v-for="(roll, index) in destinyRolls" :key="index">{{ formatDestinyRoll(roll) }}</li>
        </ol>
      </template>
    </section>
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
    legend { font-size: 0.8rem; font-weight: 700; }
    label { display: flex; align-items: center; min-height: 2.75rem; gap: 0.4rem; }
    input { accent-color: var(--color-primary); }
    button { min-height: 2.75rem; padding: 0.4rem 0.65rem; border: 1px solid var(--color-border); border-radius: 999px; background: var(--color-surface); }
    button[aria-pressed="true"] { border-color: var(--color-primary); color: var(--color-primary); font-weight: 700; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  }

  &__destiny {
    display: grid;
    grid-column: 1 / -1;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid var(--color-gold);
    border-radius: var(--radius-md);
    background: var(--color-gold-soft);

    &-control {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;

      label {
        font-size: 0.85rem;
        font-weight: 700;
      }

      input {
        width: 5rem;
        min-height: 2.75rem;
        padding: 0 0.6rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        color: var(--color-text);
        background: var(--color-surface);
        font-size: 1rem;
        font-variant-numeric: tabular-nums;
        font-weight: 700;
        text-align: center;
      }

      button {
        min-height: 2.75rem;
        padding: 0.4rem 0.75rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        color: var(--color-primary);
        background: var(--color-surface);
        font-weight: 700;
      }
    }

    &-note {
      margin: 0;
      color: var(--color-text-muted);
      font-size: 0.7rem;
      line-height: 1.5;
    }

    &-error {
      margin: 0;
      color: var(--color-error);
      font-size: 0.75rem;
      font-weight: 700;
      line-height: 1.5;
    }

    &-title {
      font-size: 0.8rem;
    }

    &-list {
      display: grid;
      gap: 0.2rem;
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
        font-size: 0.95rem;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.02em;
      }
    }
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
