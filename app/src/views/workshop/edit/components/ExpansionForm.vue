<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import StickyActionBar from '@/components/ui/StickyActionBar.vue'
import CustomField from '@/features/custom-content/components/CustomField.vue'
import CustomFormSection from '@/features/custom-content/components/CustomFormSection.vue'
import type { RulesetId } from '@/types/character'
import type { CustomExpansion } from '@/types/custom-content'
import type { SaveExpansionInput } from '@/stores/custom-content'

const props = defineProps<{ ruleset: RulesetId; expansion?: CustomExpansion }>()
const emit = defineEmits<{ save: [input: SaveExpansionInput]; cancel: []; dirty: [dirty: boolean] }>()

const model = reactive({
  title: props.expansion?.title ?? '',
  shortTitle: props.expansion?.shortTitle ?? '',
  note: props.expansion?.note ?? '',
  defaultEnabled: props.expansion?.defaultEnabled ?? true,
})
const touched = ref(false)

watch(model, () => emit('dirty', true), { deep: true })

const titleError = computed(() => (touched.value && model.title.trim().length === 0 ? '请填写扩展名称。' : ''))
const shortTitleError = computed(() => (touched.value && model.shortTitle.trim().length === 0 ? '请填写扩展简称，它会显示在车卡来源列表里。' : ''))

function submit(): void {
  touched.value = true
  if (titleError.value || shortTitleError.value) return
  emit('save', {
    id: props.expansion?.id,
    ruleset: props.ruleset,
    title: model.title.trim(),
    shortTitle: model.shortTitle.trim(),
    note: model.note.trim() || undefined,
    defaultEnabled: model.defaultEnabled,
  })
}
</script>

<template>
  <form class="expansion-form" @submit.prevent="submit">
    <CustomFormSection title="基础信息" hint="扩展书是其它内容的容器，也是车卡第 2 步的来源开关。">
      <CustomField label="扩展名称" required :for-id="'expansion-title'" :error="titleError" hint="例如：我的自制扩展、DM 的北欧战役书。">
        <input id="expansion-title" v-model="model.title" placeholder="填写扩展名称">
      </CustomField>
      <CustomField label="简称" required :for-id="'expansion-short'" :error="shortTitleError" hint="显示为「简称 · 书名」，建议 2—4 个字。">
        <input id="expansion-short" v-model="model.shortTitle" placeholder="例如：自制">
      </CustomField>
      <CustomField label="简介 / 备注" :for-id="'expansion-note'" automation="display" hint="可写这本书的主题、来源或 DM 约定，会显示在列表与角色卡来源说明里。">
        <textarea id="expansion-note" v-model="model.note" rows="3" />
      </CustomField>
    </CustomFormSection>

    <CustomFormSection title="来源开关" hint="关闭后该扩展下的内容不会出现在新车卡的候选池，但仍可手动勾选。">
      <label class="expansion-form__switch">
        <input v-model="model.defaultEnabled" type="checkbox">
        <span>新车卡默认启用这本扩展</span>
      </label>
      <p class="expansion-form__hint">
        建议保持勾选：否则玩家保存内容后，在车卡里看不到新条目，需要自己到第 2 步手动启用。
      </p>
    </CustomFormSection>

    <StickyActionBar
      primary-label="保存扩展"
      secondary-label="取消"
      @primary="submit"
      @secondary="emit('cancel')"
    />
  </form>
</template>

<style scoped lang="scss">
.expansion-form {
  display: grid;
  gap: 0.9rem;
  padding: 1rem 1rem 0;

  &__switch {
    display: flex;
    min-height: 2.75rem;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  &__hint {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.78rem;
    line-height: 1.5;
  }
}
</style>
