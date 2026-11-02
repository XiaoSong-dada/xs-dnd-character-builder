<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import StickyActionBar from '@/components/ui/StickyActionBar.vue'
import CustomField from '@/features/custom-content/components/CustomField.vue'
import CustomFormSection from '@/features/custom-content/components/CustomFormSection.vue'
import CustomPreview from '@/features/custom-content/components/CustomPreview.vue'
import CustomTraitList from '@/features/custom-content/components/CustomTraitList.vue'
import { useRulesRepository } from '@/hooks/useRulesRepository'
import { summarizeCustomEntry, validateCustomEntry } from '@/rules/custom-content'
import type { CustomEntryInput } from '@/stores/custom-content'
import type { RulesetId } from '@/types/character'
import type { CustomClassFeature, CustomSubclassEntry, CustomTrait } from '@/types/custom-content'

const props = defineProps<{
  ruleset: RulesetId
  expansionId: string
  expansions: readonly { readonly id: string; readonly title: string }[]
  entry?: CustomSubclassEntry
}>()
const emit = defineEmits<{ save: [input: CustomEntryInput]; cancel: []; dirty: [dirty: boolean] }>()

const repository = useRulesRepository(() => props.ruleset)

const model = reactive({
  name: props.entry?.name ?? '',
  englishName: props.entry?.englishName ?? '',
  expansionId: props.entry?.expansionId ?? props.expansionId,
  summary: props.entry?.summary ?? '',
  description: props.entry?.description ?? '',
  classId: props.entry?.classId ?? '',
  selectionLevel: props.entry?.selectionLevel ?? 3,
  features: [...(props.entry?.features ?? [])] as readonly CustomTrait[],
})

const touched = ref(false)
watch(model, () => emit('dirty', true), { deep: true })

/** 父职业候选：当前规则集未归档职业；编辑时保留当前父职业，便于看到归档警告。 */
const classOptions = computed(() => repository.value.classes
  .filter((classRule) => classRule.status !== 'unavailable' || classRule.id === model.classId)
  .map((classRule) => ({
    id: classRule.id,
    name: classRule.name,
    archived: classRule.status === 'unavailable',
  }))
  .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN')))

const parentClass = computed(() => repository.value.getClass(model.classId))
const siblingSubclasses = computed(() => repository.value.subclasses.filter((subclass) => subclass.classId === model.classId))
const lockedLevel = computed(() => siblingSubclasses.value[0]?.selectionLevel)
const parentArchived = computed(() => parentClass.value?.status === 'unavailable')

watch(
  () => model.classId,
  () => {
    if (lockedLevel.value !== undefined) model.selectionLevel = lockedLevel.value
  },
  { immediate: true },
)

const subclassLevelsByClass = computed(() => {
  const levels: Record<string, number> = {}
  for (const subclass of repository.value.subclasses) {
    if (levels[subclass.classId] === undefined) levels[subclass.classId] = subclass.selectionLevel
  }
  return levels
})

function buildEntry(): CustomSubclassEntry {
  const features = model.features.filter((feature) => feature.name.trim().length > 0) as readonly CustomClassFeature[]
  return {
    kind: 'subclass',
    id: props.entry?.id ?? 'custom-subclass-preview',
    expansionId: model.expansionId,
    ruleset: props.ruleset,
    name: model.name.trim(),
    englishName: model.englishName.trim(),
    summary: model.summary.trim(),
    description: model.description.trim(),
    createdAt: props.entry?.createdAt ?? '',
    updatedAt: '',
    classId: model.classId,
    selectionLevel: model.selectionLevel,
    ...(features.length > 0 ? { features } : {}),
  }
}

const candidate = computed(() => buildEntry())
const issues = computed(() => validateCustomEntry(candidate.value, {
  classIds: classOptions.value.filter((option) => !option.archived).map((option) => option.id),
  subclassLevelsByClass: subclassLevelsByClass.value,
}))
const previewLines = computed(() => {
  const labelOf = (id: string): string => repository.value.getClass(id)?.name ?? id
  return summarizeCustomEntry(candidate.value, { labelOf })
})
const nameError = computed(() => (touched.value && model.name.trim().length === 0 ? '请填写子职名称。' : ''))

const levelHint = computed(() => {
  if (lockedLevel.value !== undefined) return `该职业已有子职，选择等级固定为 ${lockedLevel.value} 级。`
  return '该职业尚无子职，可设定 1—20；保存后同职业其它子职沿用该等级。'
})

function submit(): void {
  touched.value = true
  if (issues.value.length > 0) return
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = candidate.value
  emit('save', input)
}
</script>

<template>
  <form class="subclass-form" @submit.prevent="submit">
    <CustomFormSection title="基础信息" hint="带 * 的字段为必填。子职必须归入一本自制扩展。">
      <CustomField label="子职名称" required :for-id="'subclass-name'" :error="nameError">
        <input id="subclass-name" v-model="model.name" placeholder="例如：烈焰誓约">
      </CustomField>
      <CustomField label="英文名" :for-id="'subclass-english'">
        <input id="subclass-english" v-model="model.englishName" placeholder="可留空">
      </CustomField>
      <CustomField label="所属自定义扩展" required :for-id="'subclass-expansion'">
        <select id="subclass-expansion" v-model="model.expansionId">
          <option value="" disabled>请选择</option>
          <option v-for="expansion in props.expansions" :key="expansion.id" :value="expansion.id">{{ expansion.title }}</option>
        </select>
      </CustomField>
      <CustomField label="一句话概括" required :for-id="'subclass-summary'" automation="display">
        <input id="subclass-summary" v-model="model.summary" placeholder="例如：以誓言换取火焰庇护">
      </CustomField>
      <CustomField label="详细介绍" required :for-id="'subclass-description'" automation="display">
        <textarea id="subclass-description" v-model="model.description" rows="4" />
      </CustomField>
    </CustomFormSection>

    <CustomFormSection title="所属职业与选择等级" hint="子职会进入该职业的时间线选择节点；选择等级由该职业已有子职决定。">
      <CustomField label="所属职业" required :for-id="'subclass-class'">
        <select id="subclass-class" v-model="model.classId">
          <option value="" disabled>请选择</option>
          <option v-for="option in classOptions" :key="option.id" :value="option.id">
            {{ option.name }}{{ option.archived ? '（已归档）' : '' }}
          </option>
        </select>
      </CustomField>
      <p v-if="parentArchived" class="subclass-form__warning">
        所属职业已归档。请改选其它职业，或先恢复该职业。
      </p>
      <CustomField label="选择等级" :for-id="'subclass-level'" :hint="levelHint">
        <input
          id="subclass-level"
          v-model.number="model.selectionLevel"
          type="number"
          min="1"
          max="20"
          :disabled="lockedLevel !== undefined"
        >
      </CustomField>
      <p v-if="siblingSubclasses.length > 0" class="subclass-form__hint">
        该职业已有子职：{{ siblingSubclasses.map((subclass) => subclass.name).join('、') }}。
      </p>
      <p v-else class="subclass-form__hint">
        该职业此前没有子职；保存后，已有该职业的角色会在时间线新增一个子职选择节点。
      </p>
    </CustomFormSection>

    <CustomFormSection title="子职特性" hint="按等级登记，仅作为文字展示；不会自动授予法术、资源、AC 或 HP。">
      <CustomTraitList
        :items="model.features"
        add-label="＋ 添加子职特性"
        level-hint="获得等级（1—20）"
        @update:items="model.features = $event"
      />
    </CustomFormSection>

    <CustomFormSection title="规则摘要预览" :collapsible="true">
      <CustomPreview :lines="previewLines" />
      <ul v-if="touched && issues.length > 0" class="subclass-form__issues">
        <li v-for="issue in issues" :key="issue">{{ issue }}</li>
      </ul>
    </CustomFormSection>

    <StickyActionBar
      primary-label="保存子职"
      secondary-label="取消"
      :primary-disabled="touched && issues.length > 0"
      @primary="submit"
      @secondary="emit('cancel')"
    />
  </form>
</template>

<style scoped lang="scss">
.subclass-form {
  display: grid;
  gap: 0.9rem;
  padding: 1rem 1rem 0;

  &__hint {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.5;
  }

  &__warning {
    margin: 0;
    color: var(--color-warning);
    font-size: 0.8rem;
    line-height: 1.5;
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
