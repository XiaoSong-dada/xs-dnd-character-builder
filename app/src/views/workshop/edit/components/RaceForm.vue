<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import StickyActionBar from '@/components/ui/StickyActionBar.vue'
import CustomField from '@/features/custom-content/components/CustomField.vue'
import CustomFormSection from '@/features/custom-content/components/CustomFormSection.vue'
import CustomPreview from '@/features/custom-content/components/CustomPreview.vue'
import CustomTraitList from '@/features/custom-content/components/CustomTraitList.vue'
import { DAMAGE_TYPE_OPTIONS, LANGUAGE_OPTIONS, SKILL_OPTIONS, skillLabel } from '@/features/custom-content/labels'
import { ABILITY_KEYS, ABILITY_LABELS } from '@/rules/data/ability-labels'
import { summarizeCustomEntry, validateCustomEntry } from '@/rules/custom-content'
import type { AbilityKey, RulesetId } from '@/types/character'
import type { CustomEntryInput } from '@/stores/custom-content'
import type { CustomRaceEntry, CustomTrait } from '@/types/custom-content'

const props = defineProps<{
  ruleset: RulesetId
  expansionId: string
  expansions: readonly { readonly id: string; readonly title: string }[]
  entry?: CustomRaceEntry
}>()
const emit = defineEmits<{ save: [input: CustomEntryInput]; cancel: []; dirty: [dirty: boolean] }>()

const SIZE_OPTIONS = [
  { value: 'fixed-medium', label: '固定中型' },
  { value: 'fixed-small', label: '固定小型' },
  { value: 'choice', label: '创建时自选（小型 / 中型）' },
] as const

type SizeMode = (typeof SIZE_OPTIONS)[number]['value']

function initialSizeMode(entry: CustomRaceEntry | undefined): SizeMode {
  if (entry?.sizeChoices?.length) return 'choice'
  return entry?.size === 'small' ? 'fixed-small' : 'fixed-medium'
}

function toText(value: number | undefined): string {
  return value === undefined ? '' : String(value)
}

/**
 * 解析数字输入。`v-model` 在 `<input type="number">` 上会自动把值转成 number，
 * 因此这里同时接受字符串与数字，并在非法或空值时返回 undefined（表示"未登记"）。
 */
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
  sizeMode: initialSizeMode(props.entry),
  speed: toText(props.entry?.speed),
  darkvision: toText(props.entry?.darkvision),
  bonuses: Object.fromEntries(
    ABILITY_KEYS.map((key) => [key, toText(props.entry?.fixedAbilityBonuses?.[key])]),
  ) as Record<AbilityKey, string>,
  skillIds: [...(props.entry?.skillProficiencies ?? [])],
  languages: (props.entry?.fixedLanguages ?? []).join('、'),
  languageChoices: toText(props.entry?.languageChoices),
  resistances: [...(props.entry?.damageResistances ?? [])],
  hitPointBonusPerLevel: toText(props.entry?.hitPointBonusPerLevel),
  initiativeProficiency: props.entry?.initiativeProficiency === true,
  climbSpeed: toText(props.entry?.climbSpeed),
  swimSpeed: toText(props.entry?.swimSpeed),
  flySpeed: toText(props.entry?.flySpeed),
  traits: [...(props.entry?.traits ?? [])] as readonly CustomTrait[],
})

const touched = ref(false)
watch(model, () => emit('dirty', true), { deep: true })

const is2014 = computed(() => props.ruleset === '5e-2014')

function buildEntry(): CustomRaceEntry {
  const sizeMode = model.sizeMode
  const bonuses: Partial<Record<AbilityKey, number>> = {}
  for (const key of ABILITY_KEYS) {
    const value = parseNumber(model.bonuses[key])
    if (value !== undefined && value !== 0) bonuses[key] = value
  }
  const languages = model.languages
    .split(/[、,，\\s]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  return {
    kind: 'race',
    id: props.entry?.id ?? 'custom-race-preview',
    expansionId: model.expansionId,
    ruleset: props.ruleset,
    name: model.name.trim(),
    englishName: model.englishName.trim(),
    summary: model.summary.trim(),
    description: model.description.trim(),
    createdAt: props.entry?.createdAt ?? '',
    updatedAt: '',
    ...(sizeMode === 'choice' ? { sizeChoices: ['small', 'medium'] as const } : { size: sizeMode === 'fixed-small' ? 'small' as const : 'medium' as const }),
    speed: parseNumber(model.speed),
    darkvision: parseNumber(model.darkvision),
    ...(is2014.value && Object.keys(bonuses).length > 0 ? { fixedAbilityBonuses: bonuses } : {}),
    ...(model.skillIds.length > 0 ? { skillProficiencies: model.skillIds } : {}),
    ...(languages.length > 0 ? { fixedLanguages: languages } : {}),
    languageChoices: parseNumber(model.languageChoices),
    ...(model.resistances.length > 0 ? { damageResistances: model.resistances } : {}),
    hitPointBonusPerLevel: parseNumber(model.hitPointBonusPerLevel),
    ...(model.initiativeProficiency ? { initiativeProficiency: true } : {}),
    climbSpeed: parseNumber(model.climbSpeed),
    swimSpeed: parseNumber(model.swimSpeed),
    flySpeed: parseNumber(model.flySpeed),
    ...(model.traits.length > 0 ? { traits: model.traits.filter((trait) => trait.name.trim().length > 0) } : {}),
  }
}

const candidate = computed(() => buildEntry())
const issues = computed(() => validateCustomEntry(candidate.value))
const previewLines = computed(() => {
  const entry = candidate.value
  return summarizeCustomEntry(entry, {
    labelOf: (id) => skillLabel(id),
  }).filter((line) => line.length > 0)
})

const nameError = computed(() => (touched.value && model.name.trim().length === 0 ? '请填写种族名称。' : ''))
const expansionError = computed(() => (!model.expansionId ? '请选择所属自定义扩展。' : ''))

function toggleSkill(skillId: string): void {
  model.skillIds = model.skillIds.includes(skillId)
    ? model.skillIds.filter((id) => id !== skillId)
    : [...model.skillIds, skillId]
}

function toggleResistance(type: string): void {
  model.resistances = model.resistances.includes(type)
    ? model.resistances.filter((item) => item !== type)
    : [...model.resistances, type]
}

function toggleLanguage(language: string): void {
  const current = model.languages.split(/[、,，]+/).map((item) => item.trim()).filter(Boolean)
  const next = current.includes(language)
    ? current.filter((item) => item !== language)
    : [...current, language]
  model.languages = next.join('、')
}

function submit(): void {
  touched.value = true
  if (issues.value.length > 0) return
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = candidate.value
  emit('save', input)
}
</script>

<template>
  <form class="race-form" @submit.prevent="submit">
    <CustomFormSection title="基础信息" hint="带 * 的字段为必填；概括会显示在车卡列表卡片上。">
      <CustomField label="种族名称" required :for-id="'race-name'" :error="nameError">
        <input id="race-name" v-model="model.name" placeholder="例如：火焰精灵">
      </CustomField>
      <CustomField label="英文名" :for-id="'race-english'">
        <input id="race-english" v-model="model.englishName" placeholder="例如：Flame Elf（可留空）">
      </CustomField>
      <CustomField label="所属自定义扩展" required :for-id="'race-expansion'" :error="expansionError" hint="内容必须归入一本自制扩展，才能在车卡第 2 步按来源勾选。">
        <select id="race-expansion" v-model="model.expansionId">
          <option value="" disabled>请选择</option>
          <option v-for="expansion in props.expansions" :key="expansion.id" :value="expansion.id">{{ expansion.title }}</option>
        </select>
      </CustomField>
      <CustomField label="一句话概括" required :for-id="'race-summary'" automation="display">
        <input id="race-summary" v-model="model.summary" placeholder="例如：生来与火共处的精灵">
      </CustomField>
      <CustomField label="详细说明" required :for-id="'race-description'" automation="display" hint="原创中文描述：体型、速度、感官、特性的要点。">
        <textarea id="race-description" v-model="model.description" rows="4" />
      </CustomField>
    </CustomFormSection>

    <CustomFormSection title="种族机制" hint="这些字段会进入车卡计算；不填的字段不会改变角色的任何数值。">
      <CustomField label="体型" :for-id="'race-size'" automation="computed">
        <select id="race-size" v-model="model.sizeMode">
          <option v-for="option in SIZE_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </CustomField>
      <div class="race-form__grid">
        <CustomField label="步行速度（尺）" :for-id="'race-speed'" automation="computed">
          <input id="race-speed" v-model="model.speed" type="number" inputmode="numeric" min="0" max="120" placeholder="30">
        </CustomField>
        <CustomField label="黑暗视觉（尺）" :for-id="'race-darkvision'" automation="computed">
          <input id="race-darkvision" v-model="model.darkvision" type="number" inputmode="numeric" min="0" max="240" placeholder="60">
        </CustomField>
      </div>

      <fieldset v-if="is2014" class="race-form__group">
        <legend>固定属性加值 <span class="race-form__legend-note">会影响自动计算</span></legend>
        <p class="race-form__hint">2014 种族直接提供属性加值；2024 的属性加值来自背景，因此这里不显示。</p>
        <div class="race-form__ability-grid">
          <label v-for="key in ABILITY_KEYS" :key="key" class="race-form__ability">
            <span>{{ ABILITY_LABELS[key] }}</span>
            <input v-model="model.bonuses[key]" type="number" inputmode="numeric" min="0" max="3" placeholder="0">
          </label>
        </div>
      </fieldset>

      <fieldset class="race-form__group">
        <legend>固定技能熟练 <span class="race-form__legend-note">会影响自动计算</span></legend>
        <div class="race-form__chips">
          <button
            v-for="skill in SKILL_OPTIONS"
            :key="skill.id"
            type="button"
            class="race-form__chip"
            :class="{ 'race-form__chip--active': model.skillIds.includes(skill.id) }"
            :aria-pressed="model.skillIds.includes(skill.id)"
            @click="toggleSkill(skill.id)"
          >
            {{ skill.label }}
          </button>
        </div>
      </fieldset>

      <CustomField label="固定语言" :for-id="'race-languages'" automation="computed" hint="用「、」分隔；也可以直接点下方常用语言。">
        <input id="race-languages" v-model="model.languages" placeholder="例如：通用语、精灵语">
      </CustomField>
      <div class="race-form__chips">
        <button
          v-for="language in LANGUAGE_OPTIONS"
          :key="language"
          type="button"
          class="race-form__chip race-form__chip--small"
          @click="toggleLanguage(language)"
        >
          {{ language }}
        </button>
      </div>
      <CustomField label="自选语言数量" :for-id="'race-language-choices'" automation="computed" hint="车卡会把这里填的数量计入必须选择的额外语言。">
        <input id="race-language-choices" v-model="model.languageChoices" type="number" inputmode="numeric" min="0" max="5" placeholder="0">
      </CustomField>

      <fieldset class="race-form__group">
        <legend>伤害抗性 <span class="race-form__legend-note">仅展示</span></legend>
        <div class="race-form__chips">
          <button
            v-for="type in DAMAGE_TYPE_OPTIONS"
            :key="type"
            type="button"
            class="race-form__chip"
            :class="{ 'race-form__chip--active': model.resistances.includes(type) }"
            :aria-pressed="model.resistances.includes(type)"
            @click="toggleResistance(type)"
          >
            {{ type }}
          </button>
        </div>
      </fieldset>

      <div class="race-form__grid">
        <CustomField label="每级最大生命加成" :for-id="'race-hp'" automation="computed">
          <input id="race-hp" v-model="model.hitPointBonusPerLevel" type="number" inputmode="numeric" min="0" max="10" placeholder="0">
        </CustomField>
        <CustomField label="攀爬 / 游泳 / 飞行速度" automation="display">
          <div class="race-form__grid race-form__grid--inline">
            <input v-model="model.climbSpeed" type="number" inputmode="numeric" min="0" max="120" aria-label="攀爬速度" placeholder="攀爬">
            <input v-model="model.swimSpeed" type="number" inputmode="numeric" min="0" max="120" aria-label="游泳速度" placeholder="游泳">
            <input v-model="model.flySpeed" type="number" inputmode="numeric" min="0" max="120" aria-label="飞行速度" placeholder="飞行">
          </div>
        </CustomField>
      </div>

      <label class="race-form__switch">
        <input v-model="model.initiativeProficiency" type="checkbox">
        <span>先攻熟练（把熟练加值计入先攻）</span>
      </label>
    </CustomFormSection>

    <CustomFormSection title="种族特性" hint="名称 + 等级 + 说明，作为文字展示在角色卡上，不参与自动计算。">
      <CustomTraitList :items="model.traits" @update:items="model.traits = $event" />
    </CustomFormSection>

    <CustomFormSection title="规则摘要预览" hint="保存前确认这条内容会带来什么。" :collapsible="true">
      <CustomPreview :lines="previewLines" />
      <ul v-if="touched && issues.length > 0" class="race-form__issues">
        <li v-for="issue in issues" :key="issue">{{ issue }}</li>
      </ul>
    </CustomFormSection>

    <StickyActionBar
      primary-label="保存种族"
      secondary-label="取消"
      :primary-disabled="touched && issues.length > 0"
      @primary="submit"
      @secondary="emit('cancel')"
    />
  </form>
</template>

<style scoped lang="scss">
.race-form {
  display: grid;
  gap: 0.9rem;
  padding: 1rem 1rem 0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;

    &--inline {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
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

  &__ability-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
  }

  &__ability {
    display: grid;
    gap: 0.25rem;
    color: var(--color-text-muted);
    font-size: 0.75rem;

    input {
      min-height: 2.5rem;
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
    }
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

    &--small {
      min-height: 2rem;
      font-size: 0.72rem;
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
