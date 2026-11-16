<script setup lang="ts">
import UiNotice from '@/components/ui/UiNotice.vue'
import StartPanel from '@/views/character-builder/components/StartPanel.vue'
import { useCharacterBuilderLanding } from '@/views/character-builder/hooks/useCharacterBuilderLanding'

const { drafts, legacyDrafts, defaultRuleset, Editor, editor, loading, loadError, openEditor } = useCharacterBuilderLanding()
</script>

<template>
  <component :is="Editor" v-if="Editor" ref="editor" />
  <template v-else>
    <StartPanel
      :drafts="drafts"
      :legacy-drafts="legacyDrafts"
      :default-ruleset="defaultRuleset"
      :busy="loading"
      @create="openEditor((page) => page.createDraft())"
      @open="(id) => openEditor((page) => page.openDraft(id))"
      @delete="(id) => openEditor((page) => page.deleteDraft(id))"
      @import="(raw) => openEditor((page) => page.importDraft(raw))"
      @import-package="(file) => openEditor((page) => page.importPackage(file))"
      @export-legacy="(id) => openEditor((page) => page.exportLegacyDraft(id))"
    />
    <p v-if="loading" role="status">正在加载车卡规则…</p>
    <UiNotice v-if="loadError" tone="error" title="车卡加载失败">
      {{ loadError }}
      <button type="button" @click="openEditor()">重试</button>
    </UiNotice>
  </template>
</template>
