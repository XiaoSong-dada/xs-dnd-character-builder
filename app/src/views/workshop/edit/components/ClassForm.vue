<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import StickyActionBar from '@/components/ui/StickyActionBar.vue'
import CustomField from '@/features/custom-content/components/CustomField.vue'
import CustomFormSection from '@/features/custom-content/components/CustomFormSection.vue'
import CustomPreview from '@/features/custom-content/components/CustomPreview.vue'
import CustomTraitList from '@/features/custom-content/components/CustomTraitList.vue'
import { useRulesRepository } from '@/hooks/useRulesRepository'
import { ABILITY_KEYS, ABILITY_LABELS } from '@/rules/data/ability-labels'
import { summarizeCustomEntry, validateCustomEntry } from '@/rules/custom-content'
import type { AbilityKey, RulesetId } from '@/types/character'
import type { CustomEntryInput } from '@/stores/custom-content'
import type { CustomClassEntry, CustomTrait } from '@/types/custom-content'
import type { ArmorTraining } from '@/types/rules'

const props = defineProps<{
  ruleset: RulesetId
  expansionId: string
  expansions: readonly { readonly id: string; readonly title: string }[]
  entry?: CustomClassEntry
}>()
const emit = defineEmits<{ save: [input: CustomEntryInput]; cancel: []; dirty: [dirty: boolean] }>()

const repository = useRulesRepository(() => props.ruleset)

const HIT_DICE = [6, 8, 10, 12] as const
const ARMOR_OPTIONS: readonly { value: ArmorTraining; label: string }[] = [
  { value: 'light', label: '轻甲' },
  { value: 'medium', label: '中甲' },
  { value: 'heavy', label: '重甲' },
  { value: 'shield', label: '盾牌' },
]
const WEAPON_CATEGORIES = [
  { value: 'simple' as const, label: '简易武器' },
  { value: 'martial' as const, label: '军用武器' },
]

const model = reactive({
  name: props.entry?.name ?? '',
  englishName: props.entry?.englishName ?? '',
  expansionId: props.entry?.expansionId ?? props.expansionId,
  summary: props.entry?.summary ?? '',
  description: props.entry?.description ?? '',
  hitDie: props.entry?.hitDie ?? 8,
  primaryAbilities: [...(props.entry?.primaryAbilities ?? [])] as string[],
  savingThrows: [...(props.entry?.savingThrowAbilities ?? [])] as AbilityKey[],
  armorTraining: [...(props.entry?.armorTraining ?? [])] as ArmorTraining[],
  weaponCategories: [...(props.entry?.weaponTraining?.categories ?? [])] as ('simple' | 'martial')[],
  hasUnarmoredDefense: props.entry?.unarmoredDefense !== undefined,
  unarmoredAbility: (props.entry?.unarmoredDefense?.ability ?? 'dex') as AbilityKey,
  unarmoredAllowsShield: props.entry?.unarmoredDefense?.allowsShield ?? false,
  isCaster: props.entry?.spellcastingSourceClassId !== undefined,
  spellcastingSourceClassId: props.entry?.spellcastingSourceClassId ?? '',
  spellcastingAbility: (props.entry?.spellcastingAbility ?? '') as AbilityKey | '',
  features: [...(props.entry?.features ?? [])] as readonly CustomTrait[],
})

const touched = ref(false)
watch(model, () => emit('dirty', true), { deep: true })

/** 可作为法术表来源的职业：当前规则集中具备施法配置且未归档。 */
const casterClassOptions = computed(() => repository.value.classes
  .filter((classRule) => classRule.status !== 'unavailable' && classRule.spellcasting !== undefined)
  .map((classRule) => ({
    id: classRule.id,
    name: classRule.name,
    ability: classRule.spellcasting?.ability,
  })))

const sourceAbility = computed(() => casterClassOptions.value
  .find((option) => option.id === model.spellcastingSourceClassId)?.ability)

function toggleFrom<T>(list: readonly T[], value: T): readonly T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function togglePrimary(label: string): void {
  model.primaryAbilities = toggleFrom(model.primaryAbilities, label) as string[]
}

function toggleSavingThrow(key: AbilityKey): void {
  model.savingThrows = toggleFrom(model.savingThrows, key) as AbilityKey[]
}

function toggleArmor(value: ArmorTraining): void {
  model.armorTraining = toggleFrom(model.armorTraining, value) as ArmorTraining[]
}

function toggleWeaponCategory(value: 'simple' | 'martial'): void {
  model.weaponCategories = toggleFrom(model.weaponCategories, value) as ('simple' | 'martial')[]
}

function buildEntry(): CustomClassEntry {
  return {
    kind: 'class',
    id: props.entry?.id ?? 'custom-class-preview',
    expansionId: model.expansionId,
    ruleset: props.ruleset,
    name: model.name.trim(),
    englishName: model.englishName.trim(),
    summary: model.summary.trim(),
    description: model.description.trim(),
    createdAt: props.entry?.createdAt ?? '',
    updatedAt: '',
    hitDie: model.hitDie,
    primaryAbilities: model.primaryAbilities,
    savingThrowAbilities: model.savingThrows,
    ...(model.armorTraining.length > 0 ? { armorTraining: model.armorTraining } : {}),
    ...(model.weaponCategories.length > 0 ? { weaponTraining: { categories: model.weaponCategories } } : {}),
    ...(model.hasUnarmoredDefense
      ? { unarmoredDefense: { ability: model.unarmoredAbility, allowsShield: model.unarmoredAllowsShield } }
      : {}),
    ...(model.isCaster && model.spellcastingSourceClassId
      ? {
          spellcastingSourceClassId: model.spellcastingSourceClassId,
          ...(model.spellcastingAbility ? { spellcastingAbility: model.spellcastingAbility } : {}),
        }
      : {}),
    ...(model.features.length > 0 ? { features: model.features.filter((feature) => feature.name.trim().length > 0) } : {}),
  }
}

const candidate = computed(() => buildEntry())
const issues = computed(() => validateCustomEntry(candidate.value))
const previewLines = computed(() => {
  const labelOf = (id: string): string => repository.value.getClass(id)?.name ?? id
  return summarizeCustomEntry(candidate.value, { labelOf })
})
const nameError = computed(() => (touched.value && model.name.trim().length === 0 ? '请填写职业名称。' : ''))

function submit(): void {
  touched.value = true
  if (issues.value.length > 0) return
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = candidate.value
  emit('save', input)
}
</script>

<template>
  <form class="class-form" @submit.prevent="submit">
    <CustomFormSection title="基础信息" hint="带 * 的字段为必填。子职请另建「自定义子职」；未创建时时间线不会出现子职节点。">
      <CustomField label="职业名称" required :for-id="'class-name'" :error="nameError">
        <input id="class-name" v-model="model.name" placeholder="例如：烈焰骑士">
      </CustomField>
      <CustomField label="英文名" :for-id="'class-english'">
        <input id="class-english" v-model="model.englishName" placeholder="可留空">
      </CustomField>
      <CustomField label="所属自定义扩展" required :for-id="'class-expansion'">
        <select id="class-expansion" v-model="model.expansionId">
          <option value="" disabled>请选择</option>
          <option v-for="expansion in props.expansions" :key="expansion.id" :value="expansion.id">{{ expansion.title }}</option>
        </select>
      </CustomField>
      <CustomField label="一句话概括" required :for-id="'class-summary'" automation="display">
        <input id="class-summary" v-model="model.summary" placeholder="例如：以火焰为武器的重甲战士">
      </CustomField>
      <CustomField label="详细介绍" required :for-id="'class-description'" automation="display">
        <textarea id="class-description" v-model="model.description" rows="4" />
      </CustomField>
    </CustomFormSection>

    <CustomFormSection title="职业机制" hint="这些字段会进入车卡计算。">
      <CustomField label="生命骰" :for-id="'class-hit-die'" automation="computed">
        <select id="class-hit-die" v-model.number="model.hitDie">
          <option v-for="die in HIT_DICE" :key="die" :value="die">d{{ die }}</option>
        </select>
      </CustomField>

      <fieldset class="class-form__group">
        <legend>主属性 <span class="class-form__legend-note">会影响自动计算</span></legend>
        <div class="class-form__chips">
          <button
            v-for="key in ABILITY_KEYS"
            :key="key"
            type="button"
            class="class-form__chip"
            :class="{ 'class-form__chip--active': model.primaryAbilities.includes(ABILITY_LABELS[key]) }"
            :aria-pressed="model.primaryAbilities.includes(ABILITY_LABELS[key])"
            @click="togglePrimary(ABILITY_LABELS[key])"
          >
            {{ ABILITY_LABELS[key] }}
          </button>
        </div>
      </fieldset>

      <fieldset class="class-form__group">
        <legend>豁免熟练（选两项） <span class="class-form__legend-note">会影响自动计算</span></legend>
        <div class="class-form__chips">
          <button
            v-for="key in ABILITY_KEYS"
            :key="key"
            type="button"
            class="class-form__chip"
            :class="{ 'class-form__chip--active': model.savingThrows.includes(key) }"
            :aria-pressed="model.savingThrows.includes(key)"
            @click="toggleSavingThrow(key)"
          >
            {{ ABILITY_LABELS[key] }}
          </button>
        </div>
        <p class="class-form__hint">当前已选 {{ model.savingThrows.length }} 项，必须恰好两项。</p>
      </fieldset>

      <fieldset class="class-form__group">
        <legend>护甲训练 <span class="class-form__legend-note">会影响自动计算</span></legend>
        <div class="class-form__chips">
          <button
            v-for="option in ARMOR_OPTIONS"
            :key="option.value"
            type="button"
            class="class-form__chip"
            :class="{ 'class-form__chip--active': model.armorTraining.includes(option.value) }"
            :aria-pressed="model.armorTraining.includes(option.value)"
            @click="toggleArmor(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </fieldset>

      <fieldset class="class-form__group">
        <legend>武器训练 <span class="class-form__legend-note">会影响自动计算</span></legend>
        <div class="class-form__chips">
          <button
            v-for="option in WEAPON_CATEGORIES"
            :key="option.value"
            type="button"
            class="class-form__chip"
            :class="{ 'class-form__chip--active': model.weaponCategories.includes(option.value) }"
            :aria-pressed="model.weaponCategories.includes(option.value)"
            @click="toggleWeaponCategory(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </fieldset>

      <label class="class-form__switch">
        <input v-model="model.hasUnarmoredDefense" type="checkbox">
        <span>无甲防御（未着甲时以 10＋属性计算 AC）</span>
      </label>
      <div v-if="model.hasUnarmoredDefense" class="class-form__grid">
        <CustomField label="用于 AC 的属性" :for-id="'class-unarmored-ability'" automation="computed">
          <select id="class-unarmored-ability" v-model="model.unarmoredAbility">
            <option v-for="key in ABILITY_KEYS" :key="key" :value="key">{{ ABILITY_LABELS[key] }}</option>
          </select>
        </CustomField>
        <label class="class-form__switch">
          <input v-model="model.unarmoredAllowsShield" type="checkbox">
          <span>持盾时仍生效</span>
        </label>
      </div>
    </CustomFormSection>

    <CustomFormSection title="施法（可选）" hint="自定义职业不单独配置法术表，而是引用一个已有职业的法术表与数量表。">
      <label class="class-form__switch">
        <input v-model="model.isCaster" type="checkbox">
        <span>该职业是施法者</span>
      </label>

      <template v-if="model.isCaster">
        <CustomField label="法术表来源职业" :for-id="'class-caster-source'" automation="computed" hint="复用该职业的戏法/已知/准备数量、法术位与最大环级表。">
          <select id="class-caster-source" v-model="model.spellcastingSourceClassId">
            <option value="" disabled>请选择</option>
            <option v-for="option in casterClassOptions" :key="option.id" :value="option.id">{{ option.name }}</option>
          </select>
        </CustomField>
        <CustomField label="施法属性" :for-id="'class-caster-ability'" automation="computed" hint="留空则跟随来源职业；改动只影响 DC 与「属性调整值」类数量公式。">
          <select id="class-caster-ability" v-model="model.spellcastingAbility">
            <option value="">跟随来源职业{{ sourceAbility ? `（${ABILITY_LABELS[sourceAbility]}）` : '' }}</option>
            <option v-for="key in ABILITY_KEYS" :key="key" :value="key">{{ ABILITY_LABELS[key] }}</option>
          </select>
        </CustomField>
      </template>
    </CustomFormSection>

    <CustomFormSection title="职业特性" hint="按等级登记，作为文字展示在时间线与角色卡上，不参与自动计算。">
      <CustomTraitList
        :items="model.features"
        add-label="＋ 添加职业特性"
        level-hint="职业等级（1—20）"
        @update:items="model.features = $event"
      />
    </CustomFormSection>

    <CustomFormSection title="规则摘要预览" :collapsible="true">
      <CustomPreview :lines="previewLines" />
      <ul v-if="touched && issues.length > 0" class="class-form__issues">
        <li v-for="issue in issues" :key="issue">{{ issue }}</li>
      </ul>
    </CustomFormSection>

    <StickyActionBar
      primary-label="保存职业"
      secondary-label="取消"
      :primary-disabled="touched && issues.length > 0"
      @primary="submit"
      @secondary="emit('cancel')"
    />
  </form>
</template>

<style scoped lang="scss">
.class-form {
  display: grid;
  gap: 0.9rem;
  padding: 1rem 1rem 0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
    align-items: end;
  }

  &__group {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding: 0.65rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);

    legend {
      padding: 0 0.25rem;
      color: var(--color-text-muted);
      font-size: 0.8rem;
      font-weight: 600;
    }
  }

  &__legend-note {
    color: var(--color-text-muted);
    font-size: 0.7rem;
    font-weight: 400;
  }

  &__hint {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.5;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__chip {
    min-height: 2.25rem;
    padding: 0 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: 0.78rem;

    &--active {
      border-color: var(--color-primary);
      color: var(--color-primary);
      font-weight: 700;
      background: var(--color-primary-soft);
    }
  }

  &__switch {
    display: flex;
    min-height: 2.75rem;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  &__issues {
    display: grid;
    gap: 0.25rem;
    margin: 0;
    padding-left: 1.1rem;
    color: var(--color-danger, #c0392b);
    font-size: 0.8rem;
    line-height: 1.5;
  }
}
</style>
