<script setup lang="ts">
import { computed, ref } from 'vue'

import StatTile from '@/components/ui/StatTile.vue'
import UiTabs from '@/components/ui/UiTabs.vue'
import { rulesRepository } from '@/rules/repository'
import type { CharacterDraft, DerivedCharacter } from '@/types/character'

const props = defineProps<{ draft: CharacterDraft; derived: DerivedCharacter }>()
defineEmits<{ export: [] }>()
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', label: '总览' },
  { id: 'combat', label: '战斗' },
  { id: 'features', label: '能力' },
  { id: 'spells', label: '法术' },
  { id: 'items', label: '物品' },
] as const
const identityLine = computed(() => {
  const draft = props.draft
  const names = [
    draft.classId ? rulesRepository.getClass(draft.classId)?.name : undefined,
    draft.subclassId ? rulesRepository.getOption(draft.subclassId)?.name : undefined,
    draft.raceId ? rulesRepository.getRace(draft.raceId)?.name : undefined,
    draft.subraceId ? rulesRepository.getRace(draft.subraceId)?.name : undefined,
    draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId)?.name : undefined,
    draft.backgroundVariantId ? rulesRepository.getBackground(draft.backgroundVariantId)?.name : undefined,
  ].filter(Boolean)
  return `${draft.targetLevel}级 · ${names.join(' · ')}`
})
</script>

<template>
  <section class="character-sheet">
    <header>
      <span>规则预览 · 5e-2014</span>
      <h2>{{ draft.name || '未命名角色' }}</h2>
      <p>{{ identityLine }}</p>
    </header>
    <UiTabs v-model="activeTab" :items="tabs" />
    <div v-if="activeTab === 'overview'" class="character-sheet__stats">
      <StatTile label="护甲等级" :value="derived.armorClass.value" :note="derived.armorClass.sources.map((item) => item.label).join(' + ')" />
      <StatTile label="生命值" :value="derived.hitPoints.value" note="职业生命骰 + 体质" />
      <StatTile label="先攻" :value="derived.initiative.value >= 0 ? `+${derived.initiative.value}` : derived.initiative.value" note="敏捷调整值" />
      <StatTile label="速度" :value="`${derived.speed.value}尺`" :note="derived.speed.sources[0]?.detail" />
      <StatTile v-for="(value, key) in derived.abilities" :key="key" :label="String(key).toUpperCase()" :value="value" :note="`${derived.modifiers[key] >= 0 ? '+' : ''}${derived.modifiers[key]}`" />
    </div>
    <div v-else-if="activeTab === 'combat'" class="character-sheet__panel"><h3>长剑</h3><p>命中 +{{ derived.attackBonus.value }} · 伤害 1d8 + {{ derived.modifiers.str }}</p><small>{{ derived.attackBonus.sources.map((item) => `${item.label} ${item.value >= 0 ? '+' : ''}${item.value}`).join('，') }}</small></div>
    <div v-else-if="activeTab === 'features'" class="character-sheet__derived">
      <section>
        <h3>豁免</h3>
        <div>
          <StatTile
            v-for="(value, key) in derived.savingThrows"
            :key="key"
            :label="String(key).toUpperCase()"
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
            :label="String(key).replace('skill-', '')"
            :value="value.value >= 0 ? `+${value.value}` : value.value"
            :note="value.sources.map((source) => source.detail).join(' · ')"
          />
        </div>
      </section>
    </div>
    <div v-else-if="activeTab === 'items'" class="character-sheet__panel"><h3>已装备</h3><p>{{ draft.equippedItemIds.join('、') || '尚未装备物品' }}</p></div>
    <div v-else class="character-sheet__panel"><h3>{{ tabs.find((tab) => tab.id === activeTab)?.label }}</h3><p>该部分将在对应职业与施法批次继续扩展。</p></div>
    <button type="button" class="character-sheet__export" @click="$emit('export')">导出角色 JSON</button>
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

  &__export { min-height: 3rem; border: 0; border-radius: var(--radius-md); color: white; background: var(--color-primary); font-weight: 700; }
}
</style>
