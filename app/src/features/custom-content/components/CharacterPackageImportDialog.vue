<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import type { CharacterPackageImportPreview } from '@/features/custom-content/hooks/useCharacterPackageImport'

defineProps<CharacterPackageImportPreview>()
const emit = defineEmits<{ close: []; confirm: [withContent: boolean]; choose: [id: string, replace: boolean] }>()
const statusLabels = { new: '新增', same: '相同', conflict: '冲突' }
</script>

<template>
  <UiModal :open="open" title="导入角色包" @close="emit('close')">
    <UiNotice v-if="error" tone="error" :title="alreadyImported ? '角色已导入，自定义内容保存失败' : '导入提示'">{{ error }}</UiNotice>
    <p v-if="missing.length">按当前选择导入后仍缺少 {{ missing.length }} 项自定义内容。</p>
    <ul v-if="missing.length">
      <li v-for="id in missing" :key="id">{{ id }}</li>
    </ul>
    <ul v-if="items.length" class="package-import">
      <li v-for="item in items" :key="item.id" class="package-import__item">
        <strong>{{ item.name }}</strong> · {{ statusLabels[item.status] }}
        <label v-if="item.status === 'conflict'" class="package-import__choice">
          <select :disabled="busy" :value="usePackaged.has(item.id) ? 'package' : 'local'" @change="emit('choose', item.id, ($event.target as HTMLSelectElement).value === 'package')">
            <option value="local">保留本机版本（{{ item.localName }}）</option>
            <option value="package">使用包内版本（{{ item.name }}）</option>
          </select>
        </label>
        <template v-if="item.status === 'conflict' && item.localSummary !== item.summary">
          <small>本机摘要 · {{ item.localSummary || '无' }}</small>
          <small>包内摘要 · {{ item.summary || '无' }}</small>
        </template>
        <small>{{ item.id }}</small>
      </li>
    </ul>
    <template #footer>
      <BaseButton variant="secondary" :disabled="busy" @click="emit('confirm', false)">{{ alreadyImported ? '保留已导入角色' : '仅导入角色' }}</BaseButton>
      <BaseButton v-if="canInstall" :disabled="busy" @click="emit('confirm', true)">{{ alreadyImported ? '重试导入自定义内容' : '导入角色和所选内容' }}</BaseButton>
    </template>
  </UiModal>
</template>

<style scoped lang="scss">
.package-import {
  display: grid;
  gap: 0.75rem;
  padding-inline-start: 1.25rem;

  &__item {
    overflow-wrap: anywhere;

    small { display: block; }
  }

  &__choice {
    display: block;

    select { max-width: 100%; min-height: 2.75rem; }
  }
}
</style>
