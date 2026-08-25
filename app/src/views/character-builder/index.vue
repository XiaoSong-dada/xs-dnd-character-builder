<script setup lang="ts">
import { ref } from 'vue'

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
import LevelAdjustModal from '@/views/character-builder/components/LevelAdjustModal.vue'
import OriginStep from '@/views/character-builder/components/OriginStep.vue'
import SourcesStep from '@/views/character-builder/components/SourcesStep.vue'
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
  raceFlexibleGroups,
  excludedRaceAbilityChoices,
  derivedSummary,
  validationIssues,
  completion,
  importError,
  exportingFormat,
  exportNotice,
  pendingChange,
  step,
  stepMeta,
  stepNumber,
  canContinue,
  createDraft,
  openDraft,
  returnToStart,
  deleteDraft,
  importDraft,
  nextStep,
  previousStep,
  setStep,
  updateSetup,
  updateSources,
  selectClass,
  selectRace,
  selectSubrace,
  selectBackground,
  selectBackgroundVariant,
  saveTimelineSelection,
  updateEquipment,
  updateInventory,
  updateInfusions,
  updateAdventureGold,
  updateSpells,
  updateIdentity,
  updateAbilities,
  updateRaceAbilityChoices,
  exportDraft,
  exportPdf,
  exportXlsx,
  exportLegacyDraft,
  confirmPendingChange,
  cancelPendingChange,
  levelAdjustNotice,
  dismissLevelAdjustNotice,
  adjustLevel,
  startReedit,
  updateDraft,
} = useCharacterBuilderPage()

/** 等级调整弹窗：仅由角色卡页发起，目标始终为当前活动草稿。 */
const levelModalOpen = ref(false)

function openLevelModal(): void {
  levelModalOpen.value = true
}

function closeLevelModal(): void {
  levelModalOpen.value = false
}

function confirmLevelAdjust(level: number): void {
  levelModalOpen.value = false
  adjustLevel(level)
}

function goToLevelAdjustStep(): void {
  const notice = levelAdjustNotice.value
  if (!notice?.step) return
  dismissLevelAdjustNotice()
  setStep(notice.step)
}

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
      <StepHeader
        :eyebrow="stepMeta.eyebrow"
        :title="stepMeta.title"
        :current="stepNumber"
        :total="11"
        back-label="返回车卡首页"
        auto-save-label="进度已自动保存"
        @back="returnToStart"
      />
    </template>

    <UiNotice v-if="importError" tone="error" title="导入失败">{{ importError }}</UiNotice>
    <div v-if="levelAdjustNotice" class="builder-level-notice" @click="goToLevelAdjustStep">
      <UiNotice :tone="levelAdjustNotice.tone" :title="levelAdjustNotice.message">点击前往对应步骤处理。</UiNotice>
    </div>
    <SetupStep v-if="step === 'setup'" :target-level="activeDraft.targetLevel" :ability-method="activeDraft.abilityMethod" @level="updateLevel" @method="updateMethod" />
    <SourcesStep v-else-if="step === 'sources'" :selected="activeDraft.enabledSourceIds" @change="updateSources" />
    <ClassStep
      v-else-if="step === 'class'"
      :selected="activeDraft.classId"
      :enabled-source-ids="activeDraft.enabledSourceIds"
      @select="selectClass"
    />
    <OriginStep
      v-else-if="step === 'origin'"
      :class-id="activeDraft.classId"
      :race-id="activeDraft.raceId"
      :subrace-id="activeDraft.subraceId"
      :background-id="activeDraft.backgroundId"
      :background-variant-id="activeDraft.backgroundVariantId"
      :enabled-source-ids="activeDraft.enabledSourceIds"
      :languages="activeDraft.languages"
      :race-skill-choices="activeDraft.raceSkillChoices ?? []"
      :race-tool-choice="activeDraft.raceToolChoice"
      @race="selectRace"
      @subrace="selectSubrace"
      @background="selectBackground"
      @variant="selectBackgroundVariant"
      @languages="updateDraft({ languages: $event })"
      @race-skills="updateDraft({ raceSkillChoices: $event })"
      @race-tool="updateDraft({ raceToolChoice: $event })"
    />
    <AbilitiesStep
      v-else-if="step === 'abilities'"
      :scores="activeDraft.baseAbilities"
      :method="activeDraft.abilityMethod"
      :bonuses="raceAbilityBonuses"
      :flexible-count="raceFlexibleCount"
      :flexible-choices="activeDraft.raceAbilityChoices"
      :flexible-groups="raceFlexibleGroups"
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
      :draft="activeDraft"
      @select="saveTimelineSelection"
    />
    <EquipmentStep
      v-else-if="step === 'equipment'"
      :draft="activeDraft"
      @change="updateEquipment"
      @infusions="updateInfusions"
    />
    <SpellcastingStep v-else-if="step === 'spells'" :draft="activeDraft" @change="updateSpells" />
    <IdentityStep v-else-if="step === 'identity'" :name="activeDraft.name" :alignment="activeDraft.alignment" :notes="activeDraft.notes" @change="updateIdentity" />
    <ValidationStep v-else-if="step === 'validation'" :issues="validationIssues" @go="setStep($event as DraftStep)" />
    <CharacterSheetStep v-else-if="step === 'sheet' && derived" :draft="activeDraft" :derived="derived" :exporting-format="exportingFormat" :export-notice="exportNotice" @export="exportDraft" @export-pdf="exportPdf" @export-xlsx="exportXlsx" @adjust-level="openLevelModal" @reedit="startReedit" @change-spell-selections="updateSpells" @change-inventory="updateInventory" @change-adventure-gold="updateAdventureGold" />

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
    <section v-if="pendingChange?.impact?.added?.length" class="builder-impact">
      <h4>待补全（新增检查点）</h4>
      <ul>
        <li v-for="item in pendingChange.impact.added" :key="item.checkpointId">{{ item.title }}</li>
      </ul>
    </section>
    <section v-if="pendingChange?.impact?.spellUpdates?.length" class="builder-impact">
      <h4>需补全（法术配置）</h4>
      <ul>
        <li v-for="item in pendingChange.impact.spellUpdates" :key="item">{{ item }}</li>
      </ul>
    </section>
    <section v-if="pendingChange?.impact?.invalidatedDetails?.length" class="builder-impact">
      <h4>将失效</h4>
      <p>以下已完成选择会保留原值，但被标记为失效，之后可逐项重新确认：</p>
      <ul>
        <li v-for="item in pendingChange.impact.invalidatedDetails" :key="item.checkpointId">{{ item.title }}</li>
      </ul>
    </section>
    <section v-if="pendingChange?.impact?.reviews?.length" class="builder-impact">
      <h4>需复查</h4>
      <ul>
        <li v-for="review in pendingChange.impact.reviews" :key="review">{{ review }}</li>
      </ul>
    </section>
    <p v-if="pendingChange && !pendingChange.impact">以下已完成选择会保留原值，但被标记为失效，之后可逐项重新确认：</p>
    <ul v-if="pendingChange && !pendingChange.impact">
      <li v-for="checkpointId in pendingChange.affected ?? []" :key="checkpointId">{{ checkpointId }}</li>
    </ul>
    <section v-if="pendingChange?.impact?.preserved?.length" class="builder-impact">
      <h4>保留</h4>
      <ul>
        <li v-for="item in pendingChange.impact.preserved" :key="item">{{ item }}</li>
      </ul>
    </section>
    <template #footer>
      <BaseButton variant="secondary" @click="cancelPendingChange">取消</BaseButton>
      <BaseButton variant="danger" @click="confirmPendingChange">确认调整</BaseButton>
    </template>
  </UiModal>
  <LevelAdjustModal
    v-if="levelModalOpen && activeDraft"
    :open="levelModalOpen"
    :draft="activeDraft"
    @close="closeLevelModal"
    @confirm="confirmLevelAdjust"
  />
</template>

<style scoped lang="scss">
.builder-level-notice {
  cursor: pointer;

  :deep(.ui-notice) {
    border-color: var(--color-primary);
  }
}

.builder-impact {
  h4 {
    margin: 0 0 0.3rem;
    font-size: 0.82rem;
  }

  p {
    margin: 0 0 0.3rem;
    color: var(--color-text-muted);
    font-size: 0.78rem;
  }

  ul {
    margin: 0 0 0.8rem;
    padding-left: 1.1rem;
    color: var(--color-text-muted);
    font-size: 0.78rem;
    line-height: 1.6;
  }
}
</style>
