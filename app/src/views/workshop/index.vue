<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import WorkshopDeleteDialog from '@/views/workshop/components/WorkshopDeleteDialog.vue'
import WorkshopEntryCard from '@/views/workshop/components/WorkshopEntryCard.vue'
import WorkshopExpansionCard from '@/views/workshop/components/WorkshopExpansionCard.vue'
import WorkshopImportDialog from '@/views/workshop/components/WorkshopImportDialog.vue'
import WorkshopKindPicker from '@/views/workshop/components/WorkshopKindPicker.vue'
import { useWorkshopPage, type WorkshopItem } from '@/views/workshop/hooks/useWorkshopPage'

const {
  rulesetOptions,
  filter,
  query,
  kindPickerOpen,
  ruleset,
  counts,
  kindFilters,
  visibleItems,
  emptyMessage,
  loadError,
  skippedOnLoad,
  selectRuleset,
  setFilter,
  openKindPicker,
  closeKindPicker,
  selectKind,
  openEntry,
  copyEntry,
  pendingDeletion,
  deleteError,
  archiveEntry,
  restoreEntry,
  requestDelete,
  confirmDelete,
  archiveInsteadOfDelete,
  cancelDelete,
  importPreview,
  importError,
  exportBundle,
  readImportFile,
  confirmImport,
  cancelImport,
} = useWorkshopPage()

function openItem(item: WorkshopItem): void {
  openEntry(item.id, item.type === 'expansion' ? 'expansion' : item.kind)
}
</script>

<template>
  <main class="workshop">
    <p class="workshop__lead">
      在这里录入自己的扩展、种族、职业、专长与法术；保存后会出现在车卡的对应步骤。内容只保存在本机浏览器，不会上传。
    </p>

    <div class="workshop__ruleset" role="group" aria-label="规则集">
      <button
        v-for="option in rulesetOptions"
        :key="option.value"
        type="button"
        class="workshop__ruleset-button"
        :class="{ 'workshop__ruleset-button--active': ruleset === option.value }"
        :aria-pressed="ruleset === option.value"
        @click="selectRuleset(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <p v-if="loadError" class="workshop__notice workshop__notice--error">{{ loadError }}</p>
    <p v-else-if="skippedOnLoad > 0" class="workshop__notice">已跳过 {{ skippedOnLoad }} 条无法识别的内容条目。</p>

    <div class="workshop__toolbar">
      <BaseButton variant="primary" @click="openKindPicker">＋ 新建</BaseButton>
      <span class="workshop__summary">
        扩展 {{ counts.expansion }} · 种族 {{ counts.race }} · 职业 {{ counts.class }} · 专长
        {{ counts.feat }} · 法术 {{ counts.spell }}
      </span>
    </div>

    <div class="workshop__filters" role="group" aria-label="类型筛选">
      <button
        v-for="item in kindFilters"
        :key="item.value"
        type="button"
        class="workshop__filter"
        :class="{ 'workshop__filter--active': filter === item.value }"
        :aria-pressed="filter === item.value"
        :disabled="item.disabled"
        @click="setFilter(item.value)"
      >
        {{ item.label }}<template v-if="item.count > 0"> {{ item.count }}</template>
      </button>
    </div>

    <input
      v-model="query"
      type="search"
      class="workshop__search"
      placeholder="搜索名称、英文名或所属扩展"
      aria-label="搜索自定义内容"
    >

    <section class="workshop__list" aria-label="自定义内容列表">
      <template v-for="item in visibleItems" :key="item.id">
        <WorkshopExpansionCard v-if="item.type === 'expansion'" :item="item" @open="openItem(item)" />
        <WorkshopEntryCard
          v-else
          :item="item"
          @open="openItem(item)"
          @copy="copyEntry"
          @archive="archiveEntry"
          @restore="restoreEntry"
          @remove="requestDelete"
        />
      </template>
    </section>

    <p v-if="visibleItems.length === 0" class="workshop__empty">{{ emptyMessage }}</p>

    <p v-if="deleteError" class="workshop__notice workshop__notice--error">{{ deleteError }}</p>

    <p v-if="importError" class="workshop__notice workshop__notice--error">{{ importError }}</p>

    <div class="workshop__transfer">
      <p class="workshop__transfer-title">备份与分享</p>
      <div class="workshop__transfer-actions">
        <button type="button" class="workshop__transfer-button" @click="exportBundle(ruleset)">导出当前规则集</button>
        <button type="button" class="workshop__transfer-button" @click="exportBundle('all')">导出全部规则集</button>
        <label class="workshop__transfer-button workshop__transfer-button--import">
          导入内容包
          <input type="file" accept="application/json,.json" @change="readImportFile">
        </label>
      </div>
      <p class="workshop__transfer-hint">内容只保存在本机浏览器；换设备或清缓存前请先导出备份。</p>
    </div>

    <WorkshopKindPicker :open="kindPickerOpen" @close="closeKindPicker" @select="selectKind" />

    <WorkshopDeleteDialog
      :open="pendingDeletion !== null"
      :name="pendingDeletion?.name ?? ''"
      :reference-count="pendingDeletion?.referenceCount ?? 0"
      :references="pendingDeletion?.references ?? []"
      :blocked-subclasses="pendingDeletion?.blockedSubclasses ?? []"
      @close="cancelDelete"
      @archive="archiveInsteadOfDelete"
      @remove="confirmDelete"
    />

    <WorkshopImportDialog
      :open="importPreview !== null"
      :added="importPreview?.added ?? 0"
      :replaced="importPreview?.replaced ?? 0"
      :skipped="importPreview?.skipped ?? 0"
      @close="cancelImport"
      @confirm="confirmImport"
    />
  </main>
</template>

<style scoped lang="scss">
.workshop {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;

  &__lead {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    line-height: 1.6;
  }

  &__ruleset {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  &__ruleset-button {
    min-height: 2.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-weight: 600;

    &--active {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background: var(--color-primary-soft);
      font-weight: 700;
    }
  }

  &__notice {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;

    &--error {
      color: var(--color-danger, #c0392b);
    }
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__summary {
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__filter {
    min-height: 2.25rem;
    padding: 0 0.7rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: 0.8rem;

    &--active {
      border-color: var(--color-primary);
      color: var(--color-primary);
      font-weight: 700;
    }

    &:disabled {
      opacity: 0.5;
    }
  }

  &__search {
    min-height: 2.75rem;
    padding: 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  &__list {
    display: grid;
    gap: 0.65rem;
  }

  &__empty {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    line-height: 1.6;
  }

  &__transfer {
    display: grid;
    gap: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border);
  }

  &__transfer-title {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 600;
  }

  &__transfer-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__transfer-button {
    display: inline-flex;
    min-height: 2.5rem;
    align-items: center;
    padding: 0 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-primary);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;

    &--import input {
      display: none;
    }
  }

  &__transfer-hint {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.5;
  }
}
</style>
