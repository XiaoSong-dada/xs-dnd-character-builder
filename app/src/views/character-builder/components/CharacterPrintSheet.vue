<script setup lang="ts">
import { computed } from 'vue'

import { buildCharacterExportData } from '@/features/character-export/build-export-data'
import type { CharacterDraft, DerivedCharacter } from '@/types/character'

/**
 * PDF 打印版面（自绘中文）。
 * 与 XLSX 导出共用 buildCharacterExportData 同一事实源，保证数值一致。
 * Teleport 到 body：打印时仅此视图可见（全局 @media print 隐藏其余内容）。
 */
const props = defineProps<{ draft: CharacterDraft; derived: DerivedCharacter; open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const data = computed(() => buildCharacterExportData(props.draft, props.derived))
const generatedAt = new Date().toLocaleString('zh-CN', { hour12: false })
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="print-sheet">
      <header class="print-sheet__header">
        <div>
          <h1>{{ data.title }}</h1>
          <p>{{ data.subtitle }}</p>
        </div>
        <button type="button" class="print-sheet__close" @click="emit('close')">关闭打印预览</button>
      </header>
      <main class="print-sheet__body">
        <section v-for="section in data.sections" :key="section.title" class="print-sheet__section">
          <h2>{{ section.title }}</h2>
          <table>
            <tbody>
              <tr v-for="(row, index) in section.rows" :key="index">
                <th>{{ row[0] }}</th>
                <td>{{ row[1] }}</td>
                <td v-if="row[2]" class="print-sheet__note">{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
      <footer class="print-sheet__footer">
        <span>生成时间：{{ generatedAt }}</span>
        <span>数据基于 SRD 5.1（CC BY 4.0）与 5e-2014 规则集 · 由 D&D 5e 快速车卡生成</span>
      </footer>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.print-sheet {
  max-width: 52rem;
  margin: 0 auto;
  padding: 1.25rem;
  color: #211f1a;
  background: #fff;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.6rem;
    border-bottom: 2px solid #211f1a;

    h1 { margin: 0; font-size: 1.5rem; }
    p { margin: 0.25rem 0 0; color: #555; font-size: 0.8rem; }
  }

  &__close {
    min-height: 2.75rem;
    padding: 0.5rem 1rem;
    border: 1px solid #999;
    border-radius: 0.5rem;
    background: #fff;
    font-weight: 700;
    cursor: pointer;
  }

  &__body {
    display: grid;
    gap: 0.9rem;
    padding: 0.9rem 0;
  }

  &__section {
    break-inside: avoid;

    h2 {
      margin: 0 0 0.35rem;
      padding: 0.3rem 0.5rem;
      border-radius: 0.3rem;
      color: #fff;
      background: #8f2d2d;
      font-size: 0.85rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.72rem;

      th, td {
        padding: 0.3rem 0.5rem;
        border: 1px solid #d8ccb8;
        text-align: left;
        vertical-align: top;
      }

      th {
        width: 7rem;
        color: #444;
        background: #f6f0e4;
        font-weight: 700;
      }

      td:last-child:not(:first-child) {
        color: #6d675c;
      }
    }
  }

  &__note {
    color: #6d675c;
    font-size: 0.65rem;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 0.5rem;
    border-top: 1px solid #d8ccb8;
    color: #6d675c;
    font-size: 0.62rem;
  }
}

@media print {
  .print-sheet {
    max-width: none;
    margin: 0;
    padding: 0;
  }

  .print-sheet__close {
    display: none;
  }

  .print-sheet__header {
    border-bottom-color: #211f1a;
  }

  .print-sheet__section {
    h2 { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
}
</style>
