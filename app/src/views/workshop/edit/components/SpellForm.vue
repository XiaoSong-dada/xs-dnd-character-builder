<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import StickyActionBar from '@/components/ui/StickyActionBar.vue'
import CustomField from '@/features/custom-content/components/CustomField.vue'
import CustomFormSection from '@/features/custom-content/components/CustomFormSection.vue'
import CustomPreview from '@/features/custom-content/components/CustomPreview.vue'
import { useRulesRepository } from '@/hooks/useRulesRepository'
import { summarizeCustomEntry, validateCustomEntry } from '@/rules/custom-content'
import type { RulesetId } from '@/types/character'
import type { CustomEntryInput } from '@/stores/custom-content'
import type { CustomSpellEntry } from '@/types/custom-content'

const props = defineProps<{
  ruleset: RulesetId
  expansionId: string
  expansions: readonly { readonly id: string; readonly title: string }[]
  entry?: CustomSpellEntry
}>()
const emit = defineEmits<{ save: [input: CustomEntryInput]; cancel: []; dirty: [dirty: boolean] }>()

const repository = useRulesRepository(() => props.ruleset)

const SCHOOL_OPTIONS: readonly string[] = ['防护', '咒法', '预言', '惑控', '塑能', '幻术', '死灵', '变化']
const LEVEL_OPTIONS = Array.from({ length: 10 }, (_, level) => level)

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
  level: props.entry?.level ?? 0,
  school: props.entry?.school ?? '',
  classIds: [...(props.entry?.classIds ?? [])] as string[],
  ritual: props.entry?.ritual === true,
  castingTime: props.entry?.castingTime ?? '',
  range: props.entry?.range ?? '',
  components: props.entry?.components ?? '',
  duration: props.entry?.duration ?? '',
  concentration: props.entry?.concentration === true,
})

const touched = ref(false)
watch(model, () => emit('dirty', true), { deep: true })

const classOptions = computed(() => repository.value.classes
  .filter((classRule) => classRule.status !== 'unavailable')
  .map((classRule) => ({ id: classRule.id, name: classRule.name })))

function toggleClass(classId: string): void {
  model.classIds = model.classIds.includes(classId)
    ? model.classIds.filter((id) => id !== classId)
    : [...model.classIds, classId]
}

function buildEntry(): CustomSpellEntry {
  return {
    kind: 'spell',
    id: props.entry?.id ?? 'custom-spell-preview',
    expansionId: model.expansionId,
    ruleset: props.ruleset,
    name: model.name.trim(),
    englishName: model.englishName.trim(),
    summary: model.summary.trim(),
    description: model.description.trim(),
    createdAt: props.entry?.createdAt ?? '',
    updatedAt: '',
    level: parseNumber(model.level) ?? 0,
    classIds: model.classIds,
    ...(model.school ? { school: model.school } : {}),
    ...(model.ritual ? { ritual: true } : {}),
    ...(model.castingTime.trim() ? { castingTime: model.castingTime.trim() } : {}),
    ...(model.range.trim() ? { range: model.range.trim() } : {}),
    ...(model.components.trim() ? { components: model.components.trim() } : {}),
    ...(model.duration.trim() ? { duration: model.duration.trim() } : {}),
    ...(model.concentration ? { concentration: true } : {}),
  }
}

const candidate = computed(() => buildEntry())
const issues = computed(() => validateCustomEntry(candidate.value, {
  classIds: repository.value.classes.map((classRule) => classRule.id),
}))
const previewLines = computed(() => {
  const labelOf = (id: string): string => repository.value.getClass(id)?.name ?? id
  return summarizeCustomEntry(candidate.value, { labelOf })
})
const nameError = computed(() => (touched.value && model.name.trim().length === 0 ? '请填写法术名称。' : ''))

function submit(): void {
  touched.value = true
  if (issues.value.length > 0) return
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = candidate.value
  emit('save', input)
}
</script>

<template>
  <form class="spell-form" @submit.prevent="submit">
    <CustomFormSection title="基础信息" hint="带 * 的字段为必填。">
      <CustomField label="法术名称" required :for-id="'spell-name'" :error="nameError">
        <input id="spell-name" v-model="model.name" placeholder="例如：烈焰风暴">
      </CustomField>
      <CustomField label="英文名" :for-id="'spell-english'">
        <input id="spell-english" v-model="model.englishName" placeholder="可留空">
      </CustomField>
      <CustomField label="所属自定义扩展" required :for-id="'spell-expansion'">
        <select id="spell-expansion" v-model="model.expansionId">
          <option value="" disabled>请选择</option>
          <option v-for="expansion in props.expansions" :key="expansion.id" :value="expansion.id">{{ expansion.title }}</option>
        </select>
      </CustomField>
      <CustomField label="一句话概括" required :for-id="'spell-summary'" automation="display">
        <input id="spell-summary" v-model="model.summary" placeholder="例如：在范围内掀起火焰">
      </CustomField>
      <CustomField label="效果说明" :for-id="'spell-description'" automation="display" hint="原创中文描述：目标、豁免、伤害或控制效果。">
        <textarea id="spell-description" v-model="model.description" rows="4" />
      </CustomField>
    </CustomFormSection>

    <CustomFormSection title="环级与法术表" hint="职业归属决定它出现在哪个职业的第 8 步候选池；戏法（0 环）会占用戏法数量。">
      <CustomField label="法术环级" :for-id="'spell-level'" automation="computed">
        <select id="spell-level" v-model="model.level">
          <option v-for="level in LEVEL_OPTIONS" :key="level" :value="level">
            {{ level === 0 ? '戏法（0 环）' : `${level} 环` }}
          </option>
        </select>
      </CustomField>

      <fieldset class="spell-form__group">
        <legend>所属职业法术表 <span class="spell-form__legend-note">会影响自动计算</span></legend>
        <div class="spell-form__chips">
          <button
            v-for="option in classOptions"
            :key="option.id"
            type="button"
            class="spell-form__chip"
            :class="{ 'spell-form__chip--active': model.classIds.includes(option.id) }"
            :aria-pressed="model.classIds.includes(option.id)"
            @click="toggleClass(option.id)"
          >
            {{ option.name }}
          </button>
        </div>
        <p class="spell-form__hint">不选任何职业时，该法术不会自动出现在职业候选池，但可以在法术步骤用「添加系统法术」人工加入。</p>
      </fieldset>

      <label class="spell-form__switch">
        <input v-model="model.ritual" type="checkbox">
        <span>仪式法术（可仪式施法）</span>
      </label>
    </CustomFormSection>

    <CustomFormSection title="施法信息（仅展示）" hint="这些字段不影响计算，只用于车卡与角色卡展示。" :collapsible="true">
      <div class="spell-form__grid">
        <CustomField label="学派" :for-id="'spell-school'" automation="display">
          <select id="spell-school" v-model="model.school">
            <option value="">不指定</option>
            <option v-for="school in SCHOOL_OPTIONS" :key="school" :value="school">{{ school }}</option>
          </select>
        </CustomField>
        <CustomField label="施法时间" :for-id="'spell-casting-time'" automation="display">
          <input id="spell-casting-time" v-model="model.castingTime" placeholder="例如：动作、1 分钟">
        </CustomField>
        <CustomField label="射程" :for-id="'spell-range'" automation="display">
          <input id="spell-range" v-model="model.range" placeholder="例如：60 尺">
        </CustomField>
        <CustomField label="成分" :for-id="'spell-components'" automation="display">
          <input id="spell-components" v-model="model.components" placeholder="例如：V、S、M（一点磷）">
        </CustomField>
        <CustomField label="持续时间" :for-id="'spell-duration'" automation="display">
          <input id="spell-duration" v-model="model.duration" placeholder="例如：立即、1 分钟">
        </CustomField>
      </div>
      <label class="spell-form__switch">
        <input v-model="model.concentration" type="checkbox">
        <span>需要专注</span>
      </label>
    </CustomFormSection>

    <CustomFormSection title="规则摘要预览" :collapsible="true">
      <CustomPreview :lines="previewLines" />
      <ul v-if="touched && issues.length > 0" class="spell-form__issues">
        <li v-for="issue in issues" :key="issue">{{ issue }}</li>
      </ul>
    </CustomFormSection>

    <StickyActionBar
      primary-label="保存法术"
      secondary-label="取消"
      :primary-disabled="touched && issues.length > 0"
      @primary="submit"
      @secondary="emit('cancel')"
    />
  </form>
</template>

<style scoped lang="scss">
.spell-form {
  display: grid;
  gap: 0.9rem;
  padding: 1rem 1rem 0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
