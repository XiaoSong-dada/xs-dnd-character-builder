<script setup lang="ts">
import UiModal from '@/components/ui/UiModal.vue'
import { customKindLabel } from '@/features/custom-content/dictionary'
import ClassForm from '@/views/workshop/edit/components/ClassForm.vue'
import ExpansionForm from '@/views/workshop/edit/components/ExpansionForm.vue'
import FeatForm from '@/views/workshop/edit/components/FeatForm.vue'
import RaceForm from '@/views/workshop/edit/components/RaceForm.vue'
import SpellForm from '@/views/workshop/edit/components/SpellForm.vue'
import SubclassForm from '@/views/workshop/edit/components/SubclassForm.vue'
import WorkshopTemplatePicker from '@/views/workshop/edit/components/WorkshopTemplatePicker.vue'
import { useWorkshopEditor } from '@/views/workshop/edit/hooks/useWorkshopEditor'

const {
  kind,
  isNew,
  title,
  missing,
  ruleset,
  expansions,
  expansionId,
  existingEntry,
  existingExpansion,
  error,
  leavePrompt,
  templatePickerOpen,
  templateEntry,
  templateOptions,
  templatePickerTitle,
  openTemplatePicker,
  closeTemplatePicker,
  applyTemplate,
  backToList,
  setDirty,
  saveEntry,
  saveExpansion,
  confirmLeave,
  cancelLeave,
} = useWorkshopEditor()
</script>

<template>
  <main class="workshop-editor">
    <header class="workshop-editor__header">
      <button type="button" class="workshop-editor__back" @click="backToList">← 返回工坊</button>
      <h2 class="workshop-editor__title">{{ title }}</h2>
      <button
        v-if="isNew && kind !== 'expansion' && expansions.length > 0"
        type="button"
        class="workshop-editor__template"
        @click="openTemplatePicker"
      >
        从内置条目复制
      </button>
    </header>

    <p v-if="missing" class="workshop-editor__notice">
      该自定义内容不存在或已被删除。请返回工坊重新选择。
    </p>

    <p v-else-if="error" class="workshop-editor__notice workshop-editor__notice--error">{{ error }}</p>

    <template v-else>
      <ExpansionForm
        v-if="kind === 'expansion'"
        :ruleset="ruleset"
        :expansion="existingExpansion"
        @save="saveExpansion"
        @cancel="backToList"
        @dirty="setDirty"
      />

      <template v-else-if="kind === 'race'">
        <p v-if="expansions.length === 0" class="workshop-editor__notice">
          还没有自定义扩展。种族必须归入一本自制扩展——请先返回工坊新建「自定义扩展」。
        </p>
        <RaceForm
          v-else
          :key="`${isNew}-${expansionId}-${templateEntry?.name ?? ''}`"
          :ruleset="ruleset"
          :expansion-id="expansionId"
          :expansions="expansions"
          :entry="existingEntry?.kind === 'race' ? existingEntry : templateEntry?.kind === 'race' ? templateEntry : undefined"
          @save="saveEntry"
          @cancel="backToList"
          @dirty="setDirty"
        />
      </template>

      <template v-else-if="kind === 'feat'">
        <p v-if="expansions.length === 0" class="workshop-editor__notice">
          还没有自定义扩展。专长必须归入一本自制扩展——请先返回工坊新建「自定义扩展」。
        </p>
        <FeatForm
          v-else
          :key="`${isNew}-${expansionId}-${templateEntry?.name ?? ''}`"
          :ruleset="ruleset"
          :expansion-id="expansionId"
          :expansions="expansions"
          :entry="existingEntry?.kind === 'feat' ? existingEntry : templateEntry?.kind === 'feat' ? templateEntry : undefined"
          @save="saveEntry"
          @cancel="backToList"
          @dirty="setDirty"
        />
      </template>

      <template v-else-if="kind === 'spell'">
        <p v-if="expansions.length === 0" class="workshop-editor__notice">
          还没有自定义扩展。法术必须归入一本自制扩展——请先返回工坊新建「自定义扩展」。
        </p>
        <SpellForm
          v-else
          :key="`${isNew}-${expansionId}-${templateEntry?.name ?? ''}`"
          :ruleset="ruleset"
          :expansion-id="expansionId"
          :expansions="expansions"
          :entry="existingEntry?.kind === 'spell' ? existingEntry : templateEntry?.kind === 'spell' ? templateEntry : undefined"
          @save="saveEntry"
          @cancel="backToList"
          @dirty="setDirty"
        />
      </template>

      <template v-else-if="kind === 'class'">
        <p v-if="expansions.length === 0" class="workshop-editor__notice">
          还没有自定义扩展。职业必须归入一本自制扩展——请先返回工坊新建「自定义扩展」。
        </p>
        <ClassForm
          v-else
          :key="`${isNew}-${expansionId}-${templateEntry?.name ?? ''}`"
          :ruleset="ruleset"
          :expansion-id="expansionId"
          :expansions="expansions"
          :entry="existingEntry?.kind === 'class' ? existingEntry : templateEntry?.kind === 'class' ? templateEntry : undefined"
          @save="saveEntry"
          @cancel="backToList"
          @dirty="setDirty"
        />
      </template>

      <template v-else-if="kind === 'subclass'">
        <p v-if="expansions.length === 0" class="workshop-editor__notice">
          还没有自定义扩展。子职必须归入一本自制扩展——请先返回工坊新建「自定义扩展」。
        </p>
        <SubclassForm
          v-else
          :key="`${isNew}-${expansionId}-${templateEntry?.name ?? ''}`"
          :ruleset="ruleset"
          :expansion-id="expansionId"
          :expansions="expansions"
          :entry="existingEntry?.kind === 'subclass' ? existingEntry : templateEntry?.kind === 'subclass' ? templateEntry : undefined"
          @save="saveEntry"
          @cancel="backToList"
          @dirty="setDirty"
        />
      </template>

      <p v-else class="workshop-editor__notice">
        「{{ kind ? customKindLabel(kind) : '该类型' }}」编辑器正在接入：下一步将提供分区表单、校验与规则摘要预览。
      </p>
    </template>

    <WorkshopTemplatePicker
      :open="templatePickerOpen"
      :title="templatePickerTitle"
      :options="templateOptions"
      @close="closeTemplatePicker"
      @select="applyTemplate"
    />

    <UiModal :open="leavePrompt" title="放弃未保存的修改？" @close="cancelLeave">
      <p class="workshop-editor__confirm-text">离开后本次填写的内容不会保存。</p>
      <template #footer>
        <button type="button" class="workshop-editor__confirm-button" @click="cancelLeave">继续编辑</button>
        <button type="button" class="workshop-editor__confirm-button workshop-editor__confirm-button--danger" @click="confirmLeave">
          放弃修改
        </button>
      </template>
    </UiModal>
  </main>
</template>

<style scoped lang="scss">
.workshop-editor {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  padding-bottom: 0;

  &__header {
    display: grid;
    gap: 0.5rem;
  }

  &__back {
    justify-self: start;
    min-height: 2.75rem;
    padding: 0 0.25rem;
    border: 0;
    background: none;
    color: var(--color-primary);
    font-weight: 700;
  }

  &__title {
    margin: 0;
    font-size: 1.1rem;
  }

  &__template {
    justify-self: start;
    min-height: 2.5rem;
    padding: 0 0.75rem;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-weight: 600;
  }

  &__notice {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    line-height: 1.6;

    &--error {
      color: var(--color-danger, #c0392b);
    }
  }

  &__confirm-text {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;
  }

  &__confirm-button {
    min-height: 2.75rem;
    flex: 1;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    font-weight: 600;

    &--danger {
      border-color: var(--color-danger, #c0392b);
      color: var(--color-danger, #c0392b);
    }
  }
}
</style>
