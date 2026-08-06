<script setup lang="ts">
import { computed, ref } from 'vue'

import StatTile from '@/components/ui/StatTile.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import { ABILITY_LABELS } from '@/rules/data/feats-2014'
import { rulesRepository } from '@/rules/repository'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { buildTimeline } from '@/rules/timeline'
import type { AbilityKey, CharacterDraft, DerivedCharacter } from '@/types/character'

const props = defineProps<{ draft: CharacterDraft; derived: DerivedCharacter }>()
defineEmits<{ export: []; adjustLevel: []; reedit: [] }>()
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', label: '总览' },
  { id: 'combat', label: '战斗' },
  { id: 'features', label: '能力' },
  { id: 'spells', label: '法术' },
  { id: 'items', label: '物品' },
] as const
function abilityLabel(key: string): string {
  return ABILITY_LABELS[key as AbilityKey] ?? key
}
function skillLabel(skillId: string): string {
  return rulesRepository.getOption(skillId)?.name ?? skillId
}
const identityLine = computed(() => {
  const draft = props.draft
  const names = [
    draft.classId ? rulesRepository.getClass(draft.classId)?.name : undefined,
    draft.subclassId ? rulesRepository.getSubclass(draft.subclassId)?.name : undefined,
    draft.raceId ? rulesRepository.getRace(draft.raceId)?.name : undefined,
    draft.subraceId ? rulesRepository.getRace(draft.subraceId)?.name : undefined,
    draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId)?.name : undefined,
    draft.backgroundVariantId ? rulesRepository.getBackground(draft.backgroundVariantId)?.name : undefined,
  ].filter(Boolean)
  return `${draft.targetLevel}级 · ${names.join(' · ')}`
})
const selectedSpells = computed(() => {
  const config = props.draft.classId ? rulesRepository.getClass(props.draft.classId)?.spellcasting : undefined
  const ids = config?.mode === 'prepared'
    ? props.draft.spellSelections.preparedSpellIds
    : props.draft.spellSelections.knownSpellIds
  return [...props.draft.spellSelections.cantripIds, ...(ids ?? [])].map((id) => rulesRepository.getSpell(id)).filter(Boolean)
})
const subclassInfo = computed(() => {
  const subclassId = props.draft.subclassId
  if (!subclassId) return undefined
  const subclass = rulesRepository.getSubclass(subclassId)
  if (!subclass) return undefined
  // 角色卡只展示当前等级已解锁的特性（更高等级的特性不显示）。
  const features = getSubclassFeatures2014(subclassId)
    .filter((feature) => feature.level <= props.draft.targetLevel)
  return { subclass, features }
})
/** 存在失效选择或未完成的时间线检查点时，角色卡标记为"待补全"。 */
const needsReview = computed(() => {
  const draft = props.draft
  const hasInvalidated = draft.selections.some((item) => Boolean(item.invalidatedAt))
  if (!draft.classId) return hasInvalidated
  const timeline = buildTimeline(draft.classId, draft.targetLevel, { subraceId: draft.subraceId, subclassId: draft.subclassId })
  const incomplete = timeline.some((checkpoint) => {
    const selection = draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)
    return (selection?.optionIds.length ?? 0) < checkpoint.minSelections
  })
  return hasInvalidated || incomplete
})
</script>

<template>
  <section class="character-sheet">
    <header>
      <span>规则预览 · 5e-2014</span>
      <h2>{{ draft.name || '未命名角色' }}</h2>
      <p>{{ identityLine }}</p>
      <div v-if="draft.classId" class="character-sheet__header-actions">
        <UiBadge v-if="needsReview" tone="warning">待补全</UiBadge>
        <button type="button" class="character-sheet__level-button" @click="$emit('adjustLevel')">调整等级</button>
      </div>
    </header>
    <UiTabs v-model="activeTab" :items="tabs" />
    <div v-if="activeTab === 'overview'" class="character-sheet__stats">
      <StatTile label="护甲等级" :value="derived.armorClass.value" :note="derived.armorClass.sources.map((item) => item.label).join(' + ')" />
      <StatTile label="生命值" :value="derived.hitPoints.value" note="职业生命骰 + 体质" />
      <StatTile label="先攻" :value="derived.initiative.value >= 0 ? `+${derived.initiative.value}` : derived.initiative.value" note="敏捷调整值" />
      <StatTile label="速度" :value="`${derived.speed.value}尺`" :note="derived.speed.sources[0]?.detail" />
      <StatTile v-for="(value, key) in derived.abilities" :key="key" :label="abilityLabel(String(key))" :value="value" :note="`${derived.modifiers[key] >= 0 ? '+' : ''}${derived.modifiers[key]}`" />
    </div>
    <div v-else-if="activeTab === 'combat'" class="character-sheet__panel"><h3>主要武器</h3><p>命中 +{{ derived.attackBonus.value }} · 伤害骰 + {{ derived.attackDamageBonus.value }}</p><small>{{ derived.attackBonus.sources.map((item) => `${item.label} ${item.value >= 0 ? '+' : ''}${item.value}`).join('，') }}</small></div>
    <div v-else-if="activeTab === 'features'" class="character-sheet__derived">
      <section>
        <h3>豁免</h3>
        <div>
          <StatTile
            v-for="(value, key) in derived.savingThrows"
            :key="key"
            :label="abilityLabel(String(key))"
            :value="value.value >= 0 ? `+${value.value}` : value.value"
            :note="value.sources.map((source) => source.label).join(' + ')"
          />
        </div>
      </section>
      <section>
        <h3>技能</h3>
        <div>
          <StatTile
            v-for="(value, key) in derived.skills"
            :key="key"
            :label="skillLabel(String(key))"
            :value="value.value >= 0 ? `+${value.value}` : value.value"
            :note="value.sources.map((source) => source.detail).join(' · ')"
          />
        </div>
      </section>
      <template v-if="subclassInfo">
        <section v-if="subclassInfo.features.length" class="character-sheet__subclass-features">
          <header class="character-sheet__subclass-features-header">
            <h3>子职特性 · {{ subclassInfo.subclass.name }}</h3>
            <span v-if="subclassInfo.features.some((feature) => feature.status === 'index-only')" class="character-sheet__subclass-features-note">仅索引 · 未核验</span>
          </header>
          <ul class="character-sheet__feature-list">
            <li v-for="feature in subclassInfo.features" :key="feature.id" class="character-sheet__feature">
              <span class="character-sheet__feature-level">{{ feature.level }}级</span>
              <div>
                <strong>
                  {{ feature.name }} <small>{{ feature.englishName }}</small>
                  <em v-if="feature.requiresChoice" class="character-sheet__feature-choice">需选择</em>
                </strong>
                <p>{{ feature.summary }}</p>
              </div>
            </li>
          </ul>
        </section>
        <p v-else class="character-sheet__empty-features">该子职在当前等级暂无已登记特性。</p>
      </template>
      <p v-else class="character-sheet__empty-features">尚未选择子职，完成时间线步骤后这里会展示子职特性。</p>
    </div>
    <div v-else-if="activeTab === 'spells'" class="character-sheet__spells">
      <div class="character-sheet__spell-stats">
        <StatTile label="法术攻击" :value="derived.spellAttackBonus ? `+${derived.spellAttackBonus.value}` : '—'" :note="derived.spellAttackBonus?.sources.map((item) => item.label).join(' + ') ?? '当前职业无施法能力'" />
        <StatTile label="法术豁免 DC" :value="derived.spellSaveDc?.value ?? '—'" :note="derived.spellSaveDc?.sources.map((item) => item.label).join(' + ') ?? '当前职业无施法能力'" />
      </div>
      <section v-if="selectedSpells.length">
        <h3>已选法术</h3>
        <ul>
          <li v-for="spell in selectedSpells" :key="spell?.id">
            <strong>{{ spell?.name }}</strong>
            <span>{{ spell?.level }}环 · {{ spell?.englishName }}</span>
          </li>
        </ul>
      </section>
      <p v-else>当前没有需要展示的法术。</p>
    </div>
    <div v-else-if="activeTab === 'items'" class="character-sheet__panel">
      <h3>已装备</h3>
      <p>
        {{
          draft.inventory
            .filter((entry) => entry.equippedQuantity > 0)
            .map((entry) => rulesRepository.getEquipment(entry.itemId)?.name ?? entry.itemId)
            .join('、') || '尚未装备物品'
        }}
      </p>
      <h3>物品栏</h3>
      <p>
        {{
          draft.inventory
            .map((entry) => `${rulesRepository.getEquipment(entry.itemId)?.name ?? entry.itemId} ×${entry.quantity}`)
            .join('、') || '尚无物品'
        }}
      </p>
      <p>起始金币：{{ draft.currency.gp }} GP</p>
    </div>
    <div v-else class="character-sheet__panel"><h3>{{ tabs.find((tab) => tab.id === activeTab)?.label }}</h3><p>该部分将在对应职业与施法批次继续扩展。</p></div>
    <div class="character-sheet__footer">
      <button type="button" class="character-sheet__export" @click="$emit('export')">导出角色 JSON</button>
      <button type="button" class="character-sheet__export character-sheet__export--secondary" @click="$emit('reedit')">重新编辑</button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.character-sheet {
  display: grid;
  gap: 0.9rem;

  > header {
    padding: 1rem;
    border: 1px solid #dfc49a;
    border-radius: var(--radius-lg);
    background: linear-gradient(125deg, var(--color-gold-soft), var(--color-surface));

    span { color: var(--color-success); font-size: 0.7rem; font-weight: 700; }
    h2 { margin: 0.4rem 0 0; }
    p { margin: 0.25rem 0 0; color: var(--color-text-muted); font-size: 0.8rem; }
  }

  &__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }

  &__panel {
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);

    h3 { margin: 0; }
    p, small { color: var(--color-text-muted); }
  }

  &__derived {
    display: grid;
    gap: 1rem;

    section {
      display: grid;
      gap: 0.5rem;

      h3 { margin: 0; }

      > div {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }
    }
  }

  &__spells {
    display: grid;
    gap: 0.75rem;

    > section {
      padding: 0.9rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);

      h3 { margin: 0 0 0.6rem; }
      ul { display: grid; gap: 0.45rem; margin: 0; padding: 0; list-style: none; }
      li {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        padding-bottom: 0.4rem;
        border-bottom: 1px solid var(--color-border);
        font-size: 0.78rem;

        span { color: var(--color-text-muted); text-align: right; }
      }
    }

    > p { color: var(--color-text-muted); }
  }

  &__spell-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  &__export { min-height: 3rem; border: 0; border-radius: var(--radius-md); color: white; background: var(--color-primary); font-weight: 700; }

  &__footer { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

  &__export--secondary { color: var(--color-primary); background: var(--color-surface); border: 1px solid var(--color-border); }

  &__header-actions { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.6rem; }

  &__level-button { min-height: 2.25rem; padding: 0 0.9rem; border: 1px solid var(--color-primary); border-radius: var(--radius-md); color: var(--color-primary); background: var(--color-surface); font-size: 0.75rem; font-weight: 700; }

  &__subclass-features { display: grid; gap: 0.5rem; }
  &__subclass-features-header { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  &__subclass-features-header h3 { margin: 0; font-size: 0.85rem; }
  &__subclass-features-note { padding: 0.1rem 0.45rem; border-radius: 999px; color: var(--color-warning, #b58900); background: rgba(181, 137, 0, 0.12); font-size: 0.66rem; white-space: nowrap; }
  &__empty-features { color: var(--color-text-muted); font-size: 0.78rem; }
  &__feature-list { margin: 0; padding: 0; list-style: none; }
  &__feature { display: flex; gap: 0.6rem; padding: 0.45rem 0; border-bottom: 1px solid var(--color-border); }
  &__feature:last-child { border-bottom: 0; }
  &__feature-level { align-self: center; flex: none; padding: 0.1rem 0.5rem; border-radius: 999px; color: white; background: var(--color-primary); font-size: 0.66rem; font-weight: 700; line-height: 1.2; }
  &__feature > div { display: grid; gap: 0.2rem; min-width: 0; }
  &__feature strong { font-size: 0.8rem; }
  &__feature strong small { color: var(--color-text-muted); font-weight: 400; }
  &__feature-choice { margin-left: 0.3rem; padding: 0.05rem 0.4rem; border: 1px solid var(--color-primary); border-radius: 999px; color: var(--color-primary); font-size: 0.62rem; font-style: normal; vertical-align: 0.1em; }
  &__feature p { margin: 0; color: var(--color-text-muted); font-size: 0.72rem; line-height: 1.45; }
}
</style>
