<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import StickyActionBar from '@/components/ui/StickyActionBar.vue'
import CustomField from '@/features/custom-content/components/CustomField.vue'
import CustomFormSection from '@/features/custom-content/components/CustomFormSection.vue'
import CustomPreview from '@/features/custom-content/components/CustomPreview.vue'
import { ABILITY_KEYS, ABILITY_LABELS } from '@/rules/data/ability-labels'
import { summarizeCustomEntry, validateCustomEntry } from '@/rules/custom-content'
import { useRulesRepository } from '@/hooks/useRulesRepository'
import type { AbilityKey, RulesetId } from '@/types/character'
import type { CustomEntryInput } from '@/stores/custom-content'
import type { CustomFeatEntry } from '@/types/custom-content'
import type { ArmorTraining, FeatCategory } from '@/types/rules'

const props = defineProps<{
  ruleset: RulesetId
  expansionId: string
  expansions: readonly { readonly id: string; readonly title: string }[]
  entry?: CustomFeatEntry
}>()
const emit = defineEmits<{ save: [input: CustomEntryInput]; cancel: []; dirty: [dirty: boolean] }>()

const repository = useRulesRepository(() => props.ruleset)

const CATEGORY_OPTIONS: readonly { value: FeatCategory; label: string }[] = [
  { value: 'origin', label: '起源专长' },
  { value: 'general', label: '通用专长' },
  { value: 'fighting-style', label: '战斗风格' },
  { value: 'epic-boon', label: '传奇恩惠' },
]

const ARMOR_OPTIONS: readonly { value: ArmorTraining; label: string }[] = [
  { value: 'light', label: '轻甲' },
  { value: 'medium', label: '中甲' },
  { value: 'heavy', label: '重甲' },
  { value: 'shield', label: '盾牌' },
]

function toText(value: number | undefined): string {
  return value === undefined ? '' : String(value)
}

function parseNumber(value: string | number | undefined | null): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  const trimmed = (value ?? '').trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

const model = reactive({
  name: props.entry?.name ?? '',
  englishName: props.entry?.englishName ?? '',
  expansionId: props.entry?.expansionId ?? props.expansionId,
  summary: props.entry?.summary ?? '',
  description: props.entry?.description ?? '',
  category: (props.entry?.category ?? (props.ruleset === '5e-2024' ? 'general' : '')) as FeatCategory | '',
  repeatable: props.entry?.repeatable === true,
  minimumLevel: toText(props.entry?.prerequisite?.minimumLevel),
  abilityAnyOf: [...(props.entry?.prerequisite?.abilityMinimum?.anyOf ?? [])] as AbilityKey[],
  abilityScore: toText(props.entry?.prerequisite?.abilityMinimum?.score),
  requiresSpellcasting: props.entry?.prerequisite?.requiredCapability === 'spellcasting'
    || props.entry?.prerequisite?.requiredCapability === 'spellcasting-or-pact',
  hitPointBonusPerLevel: toText(props.entry?.hitPointBonusPerLevel),
  hitPointBonus: toText(props.entry?.hitPointBonus),
  speedBonus: toText(props.entry?.speedBonus),
  armorTraining: [...(props.entry?.armorTraining ?? [])] as ArmorTraining[],
  grantedSpellIds: [...(props.entry?.grantedSpellIds ?? [])] as string[],
  spellQuery: '',
})

const touched = ref(false)
watch(model, () => emit('dirty', true), { deep: true })

const is2014 = computed(() => props.ruleset === '5e-2014')

const spellOptions = computed(() => {
  const keyword = model.spellQuery.trim().toLocaleLowerCase('zh-CN')
  return repository.value.spells
    .filter((spell) => !model.grantedSpellIds.includes(spell.id))
    .filter((spell) => !keyword || `${spell.name} ${spell.englishName}`.toLocaleLowerCase('zh-CN').includes(keyword))
    .slice(0, 20)
})

const grantedSpellNames = computed(() => model.grantedSpellIds.map((id) => repository.value.getSpell(id)?.name ?? id))

function toggleAbility(key: AbilityKey): void {
  model.abilityAnyOf = model.abilityAnyOf.includes(key)
    ? model.abilityAnyOf.filter((item) => item !== key)
    : [...model.abilityAnyOf, key]
}

function toggleArmor(value: ArmorTraining): void {
  model.armorTraining = model.armorTraining.includes(value)
    ? model.armorTraining.filter((item) => item !== value)
    : [...model.armorTraining, value]
}

function addGrantedSpell(spellId: string): void {
  model.grantedSpellIds = [...model.grantedSpellIds, spellId]
  model.spellQuery = ''
}

function removeGrantedSpell(spellId: string): void {
  model.grantedSpellIds = model.grantedSpellIds.filter((id) => id !== spellId)
}

function buildEntry(): CustomFeatEntry {
  const score = parseNumber(model.abilityScore)
  const prerequisite = (parseNumber(model.minimumLevel) !== undefined
    || (model.abilityAnyOf.length > 0 && score !== undefined)
    || model.requiresSpellcasting)
    ? {
        minimumLevel: parseNumber(model.minimumLevel),
        ...(model.abilityAnyOf.length > 0 && score !== undefined
          ? { abilityMinimum: { anyOf: model.abilityAnyOf, score } }
          : {}),
        ...(model.requiresSpellcasting ? { requiredCapability: 'spellcasting' as const } : {}),
      }
    : undefined
  return {
    kind: 'feat',
    id: props.entry?.id ?? 'custom-feat-preview',
    expansionId: model.expansionId,
    ruleset: props.ruleset,
    name: model.name.trim(),
    englishName: model.englishName.trim(),
    summary: model.summary.trim(),
    description: model.description.trim(),
    createdAt: props.entry?.createdAt ?? '',
    updatedAt: '',
    ...(model.category ? { category: model.category } : {}),
    ...(model.repeatable ? { repeatable: true } : {}),
    ...(prerequisite ? { prerequisite } : {}),
    hitPointBonusPerLevel: parseNumber(model.hitPointBonusPerLevel),
    hitPointBonus: parseNumber(model.hitPointBonus),
    speedBonus: parseNumber(model.speedBonus),
    ...(model.armorTraining.length > 0 ? { armorTraining: model.armorTraining } : {}),
    ...(model.grantedSpellIds.length > 0 ? { grantedSpellIds: model.grantedSpellIds } : {}),
  }
}

const candidate = computed(() => buildEntry())
const issues = computed(() => validateCustomEntry(candidate.value, {
  spellIds: repository.value.spells.map((spell) => spell.id),
}))
const previewLines = computed(() => summarizeCustomEntry(candidate.value, {
  labelOf: (id) => repository.value.getSpell(id)?.name ?? id,
}))
const nameError = computed(() => (touched.value && model.name.trim().length === 0 ? '请填写专长名称。' : ''))

function submit(): void {
  touched.value = true
  if (issues.value.length > 0) return
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = candidate.value
  emit('save', input)
}
</script>

<template>
  <form class="feat-form" @submit.prevent="submit">
    <CustomFormSection title="基础信息" hint="带 * 的字段为必填。">
      <CustomField label="专长名称" required :for-id="'feat-name'" :error="nameError">
        <input id="feat-name" v-model="model.name" placeholder="例如：火焰亲和">
      </CustomField>
      <CustomField label="英文名" :for-id="'feat-english'">
        <input id="feat-english" v-model="model.englishName" placeholder="可留空">
      </CustomField>
      <CustomField label="所属自定义扩展" required :for-id="'feat-expansion'">
        <select id="feat-expansion" v-model="model.expansionId">
          <option value="" disabled>请选择</option>
          <option v-for="expansion in props.expansions" :key="expansion.id" :value="expansion.id">{{ expansion.title }}</option>
        </select>
      </CustomField>
      <CustomField label="一句话概括" required :for-id="'feat-summary'" automation="display">
        <input id="feat-summary" v-model="model.summary" placeholder="例如：你天生与火焰亲近">
      </CustomField>
      <CustomField label="详细效果" required :for-id="'feat-description'" automation="display" hint="写清触发时机、资源与恢复、数值范围；这段文字会展示在角色卡上。">
        <textarea id="feat-description" v-model="model.description" rows="4" />
      </CustomField>
    </CustomFormSection>

    <CustomFormSection title="类别与前置" hint="2024 需选择类别；前置不满足时车卡不会把该专长列进候选。">
      <CustomField v-if="!is2014" label="专长类别" :for-id="'feat-category'" automation="computed" hint="选「起源专长」会进入背景的「任选起源专长」候选池。">
        <select id="feat-category" v-model="model.category">
          <option v-for="option in CATEGORY_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </CustomField>
      <p v-else class="feat-form__hint">2014 专长没有类别体系，会作为「通用专长」进入候选池。</p>

      <CustomField label="前置等级下限" :for-id="'feat-min-level'" automation="computed" hint="留空表示无等级要求。">
        <input id="feat-min-level" v-model="model.minimumLevel" type="number" inputmode="numeric" min="1" max="20" placeholder="例如：4">
      </CustomField>

      <fieldset class="feat-form__group">
        <legend>属性前置 <span class="feat-form__legend-note">会影响自动计算</span></legend>
        <div class="feat-form__chips">
          <button
            v-for="key in ABILITY_KEYS"
            :key="key"
            type="button"
            class="feat-form__chip"
            :class="{ 'feat-form__chip--active': model.abilityAnyOf.includes(key) }"
            :aria-pressed="model.abilityAnyOf.includes(key)"
            @click="toggleAbility(key)"
          >
            {{ ABILITY_LABELS[key] }}
          </button>
        </div>
        <CustomField label="所需属性值" :for-id="'feat-ability-score'" hint="与上方任一属性组合生效，例如「力量或敏捷 13」。">
          <input id="feat-ability-score" v-model="model.abilityScore" type="number" inputmode="numeric" min="1" max="30" placeholder="13">
        </CustomField>
      </fieldset>

      <label class="feat-form__switch">
        <input v-model="model.requiresSpellcasting" type="checkbox">
        <span>前置：需要施法能力</span>
      </label>
      <label class="feat-form__switch">
        <input v-model="model.repeatable" type="checkbox">
        <span>可以重复选择（同一次车卡内可取多次）</span>
      </label>
    </CustomFormSection>

    <CustomFormSection title="结构化效果" hint="这些字段会进入派生计算；不填则只在角色卡上显示文字。">
      <div class="feat-form__grid">
        <CustomField label="每级最大生命加成" :for-id="'feat-hp-level'" automation="computed">
          <input id="feat-hp-level" v-model="model.hitPointBonusPerLevel" type="number" inputmode="numeric" min="0" max="20" placeholder="0">
        </CustomField>
        <CustomField label="固定最大生命加成" :for-id="'feat-hp'" automation="computed">
          <input id="feat-hp" v-model="model.hitPointBonus" type="number" inputmode="numeric" min="0" max="100" placeholder="0">
        </CustomField>
        <CustomField label="速度加值（尺）" :for-id="'feat-speed'" automation="computed">
          <input id="feat-speed" v-model="model.speedBonus" type="number" inputmode="numeric" min="0" max="60" placeholder="0">
        </CustomField>
      </div>

      <fieldset class="feat-form__group">
        <legend>护甲训练 <span class="feat-form__legend-note">会影响自动计算</span></legend>
        <div class="feat-form__chips">
          <button
            v-for="option in ARMOR_OPTIONS"
            :key="option.value"
            type="button"
            class="feat-form__chip"
            :class="{ 'feat-form__chip--active': model.armorTraining.includes(option.value) }"
            :aria-pressed="model.armorTraining.includes(option.value)"
            @click="toggleArmor(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </fieldset>

      <div class="feat-form__group">
        <p class="feat-form__group-title">固定授予的法术 <span class="feat-form__legend-note">会影响自动计算</span></p>
        <div v-if="grantedSpellNames.length > 0" class="feat-form__chips">
          <button
            v-for="(name, index) in grantedSpellNames"
            :key="`${model.grantedSpellIds[index]}-${name}`"
            type="button"
            class="feat-form__chip feat-form__chip--active"
            @click="removeGrantedSpell(model.grantedSpellIds[index] ?? '')"
          >
            {{ name }} ×
          </button>
        </div>
        <CustomField label="搜索法术并添加" :for-id="'feat-spell-search'">
          <input id="feat-spell-search" v-model="model.spellQuery" type="search" placeholder="搜索中英文法术名">
        </CustomField>
        <ul v-if="spellOptions.length > 0" class="feat-form__options">
          <li v-for="spell in spellOptions" :key="spell.id">
            <button type="button" class="feat-form__option" @click="addGrantedSpell(spell.id)">
              {{ spell.name }} · {{ spell.level === 0 ? '戏法' : `${spell.level} 环` }}
            </button>
          </li>
        </ul>
        <p v-else-if="model.spellQuery" class="feat-form__hint">没有匹配的法术。</p>
      </div>
    </CustomFormSection>

    <CustomFormSection title="规则摘要预览" :collapsible="true">
      <CustomPreview :lines="previewLines" />
      <ul v-if="touched && issues.length > 0" class="feat-form__issues">
        <li v-for="issue in issues" :key="issue">{{ issue }}</li>
      </ul>
    </CustomFormSection>

    <StickyActionBar
      primary-label="保存专长"
      secondary-label="取消"
      :primary-disabled="touched && issues.length > 0"
      @primary="submit"
      @secondary="emit('cancel')"
    />
  </form>
</template>

<style scoped lang="scss">
.feat-form {
  display: grid;
  gap: 0.9rem;
  padding: 1rem 1rem 0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;
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

  &__group-title {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 600;
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

  &__options {
    display: grid;
    gap: 0.3rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__option {
    width: 100%;
    min-height: 2.5rem;
    padding: 0 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    font-size: 0.8rem;
    text-align: left;
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
