<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiNotice from '@/components/ui/UiNotice.vue'
import CharacterDrawer from '@/features/quick-build/components/CharacterDrawer.vue'
import QuickBuildShell from '@/features/quick-build/components/QuickBuildShell.vue'
import StepHeader from '@/features/quick-build/components/StepHeader.vue'
import StickyActionBar from '@/features/quick-build/components/StickyActionBar.vue'
import AbilitiesStep from '@/views/character-builder/components/AbilitiesStep.vue'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'
import ClassStep from '@/views/character-builder/components/ClassStep.vue'
import EquipmentStep from '@/views/character-builder/components/EquipmentStep.vue'
import IdentityStep from '@/views/character-builder/components/IdentityStep.vue'
import OriginStep from '@/views/character-builder/components/OriginStep.vue'
import PreferencesStep from '@/views/character-builder/components/PreferencesStep.vue'
import SetupStep from '@/views/character-builder/components/SetupStep.vue'
import SpellcastingStep from '@/views/character-builder/components/SpellcastingStep.vue'
import StartPanel from '@/views/character-builder/components/StartPanel.vue'
import TimelineStep from '@/views/character-builder/components/TimelineStep.vue'
import ValidationStep from '@/views/character-builder/components/ValidationStep.vue'
import { useCharacterBuilderPage } from '@/views/character-builder/hooks/useCharacterBuilderPage'
import type { AbilityMethod, DraftStep } from '@/types/character'

const {
  drafts,
  legacyDrafts,
  activeDraft,
  derived,
  raceAbilityBonuses,
  raceFlexibleCount,
  excludedRaceAbilityChoices,
  derivedSummary,
  validationIssues,
  completion,
  importError,
  pendingChange,
  step,
  stepMeta,
  stepNumber,
  canContinue,
  createDraft,
  openDraft,
  deleteDraft,
  importDraft,
  nextStep,
  previousStep,
  setStep,
  updateSetup,
  selectClass,
  selectRace,
  selectSubrace,
  selectBackground,
  selectBackgroundVariant,
  saveTimelineSelection,
  updateEquipment,
  updateSpells,
  updateIdentity,
  updateAbilities,
  updateRaceAbilityChoices,
  exportDraft,
  exportLegacyDraft,
  confirmPendingChange,
  cancelPendingChange,
  updateDraft,
} = useCharacterBuilderPage()

function updateLevel(value: number): void {
  if (activeDraft.value) updateSetup(value, activeDraft.value.abilityMethod)
}

function updateMethod(value: AbilityMethod): void {
  if (activeDraft.value) updateSetup(activeDraft.value.targetLevel, value)
}
</script>

<template>
  <StartPanel
    v-if="!activeDraft"
    :drafts="drafts"
    :legacy-drafts="legacyDrafts"
    @create="createDraft"
    @open="openDraft"
    @delete="deleteDraft"
    @import="importDraft"
    @export-legacy="exportLegacyDraft"
  />
  <QuickBuildShell v-else :has-drawer="step !== 'sheet'" :has-actions="step !== 'sheet'">
    <template #header>
      <StepHeader :eyebrow="stepMeta.eyebrow" :title="stepMeta.title" :current="stepNumber" :total="11" />
    </template>

    <UiNotice v-if="importError" tone="error" title="导入失败">{{ importError }}</UiNotice>
    <SetupStep v-if="step === 'setup'" :target-level="activeDraft.targetLevel" :ability-method="activeDraft.abilityMethod" @level="updateLevel" @method="updateMethod" />
    <PreferencesStep v-else-if="step === 'preferences'" :selected="activeDraft.preferences" @change="updateDraft({ preferences: $event })" />
    <ClassStep
      v-else-if="step === 'class'"
      :selected="activeDraft.classId"
      :preferences="activeDraft.preferences"
      @select="selectClass"
    />
    <OriginStep
      v-else-if="step === 'origin'"
      :class-id="activeDraft.classId"
      :race-id="activeDraft.raceId"
      :subrace-id="activeDraft.subraceId"
      :background-id="activeDraft.backgroundId"
      :background-variant-id="activeDraft.backgroundVariantId"
      :languages="activeDraft.languages"
      @race="selectRace"
      @subrace="selectSubrace"
      @background="selectBackground"
      @variant="selectBackgroundVariant"
      @languages="updateDraft({ languages: $event })"
    />
    <AbilitiesStep
      v-else-if="step === 'abilities'"
      :scores="activeDraft.baseAbilities"
      :method="activeDraft.abilityMethod"
      :bonuses="raceAbilityBonuses"
      :flexible-count="raceFlexibleCount"
      :flexible-choices="activeDraft.raceAbilityChoices"
      :excluded-choices="excludedRaceAbilityChoices"
      @change="updateAbilities"
      @choices="updateRaceAbilityChoices"
    />
    <TimelineStep
      v-else-if="step === 'timeline' && activeDraft.classId"
      :class-id="activeDraft.classId"
      :target-level="activeDraft.targetLevel"
      :subrace-id="activeDraft.subraceId"
      :background-skill-ids="activeDraft.backgroundSkillIds"
      :selections="activeDraft.selections"
      @select="saveTimelineSelection"
    />
    <EquipmentStep v-else-if="step === 'equipment'" :class-id="activeDraft.classId" :inventory="activeDraft.inventoryItemIds" :equipped="activeDraft.equippedItemIds" @change="updateEquipment" />
    <SpellcastingStep v-else-if="step === 'spells'" :draft="activeDraft" @change="updateSpells" />
    <IdentityStep v-else-if="step === 'identity'" :name="activeDraft.name" :alignment="activeDraft.alignment" :notes="activeDraft.notes" @change="updateIdentity" />
    <ValidationStep v-else-if="step === 'validation'" :issues="validationIssues" @go="setStep($event as DraftStep)" />
    <CharacterSheetStep v-else-if="step === 'sheet' && derived" :draft="activeDraft" :derived="derived" @export="exportDraft" />

    <template v-if="step !== 'sheet' && derivedSummary" #drawer>
      <CharacterDrawer :summary="derivedSummary" :completion="completion" />
    </template>
    <template v-if="step !== 'sheet'" #actions>
      <StickyActionBar
        :secondary-label="step === 'setup' ? '' : '上一步'"
        :primary-label="step === 'validation' ? '生成角色卡' : '继续'"
        :primary-disabled="!canContinue"
        @secondary="previousStep"
        @primary="nextStep"
      />
    </template>
  </QuickBuildShell>
  <UiModal
    :open="Boolean(pendingChange)"
    :title="pendingChange?.title ?? '确认修改'"
    @close="cancelPendingChange"
  >
    <p>以下已完成选择会保留原值，但被标记为失效，之后可逐项重新确认：</p>
    <ul>
      <li v-for="checkpointId in pendingChange?.affected ?? []" :key="checkpointId">{{ checkpointId }}</li>
    </ul>
    <template #footer>
      <BaseButton variant="secondary" @click="cancelPendingChange">取消</BaseButton>
      <BaseButton variant="danger" @click="confirmPendingChange">保留并标记失效</BaseButton>
    </template>
  </UiModal>
</template>
