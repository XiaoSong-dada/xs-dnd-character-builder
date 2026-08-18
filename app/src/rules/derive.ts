import { rulesRepository } from '@/rules/repository'
import { applyAbilityImprovement, decodeAbilityImprovement } from '@/rules/feats'
import { getSubclassDerivedEffects } from '@/rules/subclass-effects'
import type { RaceRule } from '@/types/rules'
import type {
  AbilityKey,
  AbilityScores,
  CharacterDraft,
  DerivedCharacter,
  DerivedCharacterSummary,
  DerivedValue,
  ValueSource,
} from '@/types/character'

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function proficiencyBonus(level: number): number {
  return 2 + Math.floor((Math.max(1, level) - 1) / 4)
}

/**
 * 收集种族固定技能熟练与自选结果（沿 parentRaceId 链叠加，子种族不替换父种族）。
 */
export function collectRaceSkillIds(draft: Pick<CharacterDraft, 'raceId' | 'subraceId' | 'raceSkillChoices'>): readonly string[] {
  const ids: string[] = [...(draft.raceSkillChoices ?? [])]
  const visited = new Set<string>()
  const visit = (raceId: string | undefined): void => {
    if (!raceId || visited.has(raceId)) return
    visited.add(raceId)
    const race = rulesRepository.getRace(raceId)
    if (!race) return
    if (race.parentRaceId) visit(race.parentRaceId)
    ids.push(...(race.skillProficiencies ?? []))
  }
  visit(draft.subraceId ?? draft.raceId)
  return ids
}

/** 全部 18 项 2014 技能 ID（种族自选规格的缺省选项列表）。 */
export const SKILL_IDS: readonly string[] = [
  'skill-acrobatics',
  'skill-animal-handling',
  'skill-arcana',
  'skill-athletics',
  'skill-deception',
  'skill-history',
  'skill-insight',
  'skill-intimidation',
  'skill-investigation',
  'skill-medicine',
  'skill-nature',
  'skill-perception',
  'skill-performance',
  'skill-persuasion',
  'skill-religion',
  'skill-sleight-of-hand',
  'skill-stealth',
  'skill-survival',
]

function addAbilities(base: AbilityScores, bonus: Partial<AbilityScores>): AbilityScores {
  return {
    str: base.str + (bonus.str ?? 0),
    dex: base.dex + (bonus.dex ?? 0),
    con: base.con + (bonus.con ?? 0),
    int: base.int + (bonus.int ?? 0),
    wis: base.wis + (bonus.wis ?? 0),
    cha: base.cha + (bonus.cha ?? 0),
  }
}

export function getFlexibleBonusRule(race: RaceRule | undefined, subrace: RaceRule | undefined): RaceRule | undefined {
  if (subrace && (subrace.flexibleBonusCount ?? 0) > 0) return subrace
  if (subrace && (subrace.flexibleBonusGroups?.length ?? 0) > 0) return subrace
  return race
}

export function getRaceAbilityBonuses(draft: CharacterDraft): Partial<AbilityScores> {
  const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
  const baseBonuses = subrace?.replacesParentBonuses ? {} : race?.fixedAbilityBonuses ?? {}
  const fixedBonuses: Partial<Record<AbilityKey, number>> = { ...baseBonuses, ...subrace?.fixedAbilityBonuses }
  const flexibleRule = getFlexibleBonusRule(race, subrace)

  if (flexibleRule?.flexibleBonusGroups?.length) {
    let index = 0
    for (const group of flexibleRule.flexibleBonusGroups) {
      for (let i = 0; i < group.count; i++) {
        const key = draft.raceAbilityChoices[index++]
        if (key) fixedBonuses[key] = (fixedBonuses[key] ?? 0) + group.value
      }
    }
  } else {
    const flexibleValue = flexibleRule?.flexibleBonusValue ?? 1
    for (const key of draft.raceAbilityChoices.slice(0, flexibleRule?.flexibleBonusCount ?? 0)) {
      fixedBonuses[key] = (fixedBonuses[key] ?? 0) + flexibleValue
    }
  }
  return fixedBonuses
}

function applyAbilityImprovements(
  abilities: AbilityScores,
  draft: CharacterDraft,
  ignoredCheckpointId?: string,
): AbilityScores {
  let improved = { ...abilities }

  for (const selection of draft.selections) {
    if (selection.invalidatedAt || selection.checkpointId === ignoredCheckpointId) continue
    const improvementOptionId = selection.optionIds.find((optionId) => decodeAbilityImprovement(optionId))
    if (improvementOptionId) improved = applyAbilityImprovement(improved, improvementOptionId)
  }

  return improved
}

export function deriveAbilities(draft: CharacterDraft, ignoredCheckpointId?: string): AbilityScores {
  const originAbilities = addAbilities(draft.baseAbilities, getRaceAbilityBonuses(draft))
  return applyAbilityImprovements(originAbilities, draft, ignoredCheckpointId)
}

function derived(value: number, sources: readonly ValueSource[]): DerivedValue<number> {
  return { value, sources }
}

export function deriveCharacter(draft: CharacterDraft): DerivedCharacter {
  const abilities = deriveAbilities(draft)
  const abilityKeys: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
  const modifiers = Object.fromEntries(abilityKeys.map((key) => [key, abilityModifier(abilities[key])])) as Record<AbilityKey, number>
  const proficiency = proficiencyBonus(draft.targetLevel)
  const classRule = draft.classId ? rulesRepository.getClass(draft.classId) : undefined
  const subclassEffects = getSubclassDerivedEffects(draft.subclassId, draft.targetLevel)
  const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
  const hitDie = classRule?.hitDie ?? 8
  const hp = hitDie + modifiers.con
    + Math.max(0, draft.targetLevel - 1) * Math.max(1, Math.floor(hitDie / 2) + 1 + modifiers.con)
    + subclassEffects.hitPointBonus
  const equippedItems = draft.inventory
    .filter((entry) => entry.equippedQuantity > 0)
    .map((entry) => rulesRepository.getEquipment(entry.itemId))
  const equippedArmor = equippedItems
    .find((item) => item?.category === 'armor')
  const equippedShield = equippedItems
    .find((item) => item?.category === 'shield')
  const hasHeavyArmor = equippedArmor?.id === 'chain-mail'
  const hasShield = Boolean(equippedShield)
  const barbarianUnarmored = draft.classId === 'class-2014-barbarian' && !equippedArmor
  const monkUnarmored = draft.classId === 'class-2014-monk' && !equippedArmor && !hasShield
  const baseArmor = equippedArmor
    ? (equippedArmor.armorBase ?? 10) + (equippedArmor.addsDexterityToArmor
      ? Math.min(modifiers.dex, equippedArmor.armorDexterityCap ?? Number.POSITIVE_INFINITY)
      : 0)
    : barbarianUnarmored
      ? 10 + modifiers.dex + modifiers.con
      : monkUnarmored
        ? 10 + modifiers.dex + modifiers.wis
        : subclassEffects.armorClassBase
          ? subclassEffects.armorClassBase + modifiers.dex
          : 10 + modifiers.dex
  const defenseStyle = draft.selections.some((item) => item.optionIds.includes('style-defense'))
  const shieldBonus = equippedShield?.armorClassBonus ?? 0
  const armorClass = baseArmor + shieldBonus + (defenseStyle && Boolean(equippedArmor) ? 1 : 0) + subclassEffects.armorClassBonus
  const selectedClassSkillIds = (classRule?.checkpoints ?? [])
    .filter((checkpoint) => checkpoint.kind === 'skills')
    .flatMap((checkpoint) => draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)?.optionIds ?? [])
  // 种族熟练：沿父链收集固定项 + 自选结果（子种族不替换父种族熟练）。
  const raceSkillIds = collectRaceSkillIds(draft)
  const proficientSkillIds = new Set([...draft.backgroundSkillIds, ...selectedClassSkillIds, ...raceSkillIds])
  const expertiseIds = new Set((classRule?.checkpoints ?? [])
    .filter((checkpoint) => checkpoint.kind === 'expertise')
    .flatMap((checkpoint) => draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)?.optionIds ?? []))
  const skillAbilities: Readonly<Record<string, AbilityKey>> = {
    'skill-acrobatics': 'dex',
    'skill-animal-handling': 'wis',
    'skill-arcana': 'int',
    'skill-athletics': 'str',
    'skill-deception': 'cha',
    'skill-history': 'int',
    'skill-insight': 'wis',
    'skill-intimidation': 'cha',
    'skill-investigation': 'int',
    'skill-medicine': 'wis',
    'skill-nature': 'int',
    'skill-perception': 'wis',
    'skill-performance': 'cha',
    'skill-persuasion': 'cha',
    'skill-religion': 'int',
    'skill-sleight-of-hand': 'dex',
    'skill-stealth': 'dex',
    'skill-survival': 'wis',
  }
  const savingThrows = Object.fromEntries(abilityKeys.map((key) => {
    const proficient = classRule?.savingThrowAbilities.includes(key) ?? false
    return [key, derived(modifiers[key] + (proficient ? proficiency : 0), [
      { id: `${key}-save-ability`, label: '属性调整值', value: modifiers[key], detail: `${key.toUpperCase()} ${abilities[key]}` },
      ...(proficient ? [{ id: `${key}-save-proficiency`, label: '职业豁免熟练', value: proficiency, detail: classRule?.name ?? '' }] : []),
    ])]
  })) as Record<AbilityKey, DerivedValue<number>>
  const skills = Object.fromEntries(Object.entries(skillAbilities).map(([skillId, ability]) => {
    const proficient = proficientSkillIds.has(skillId)
    const expertise = expertiseIds.has(skillId)
    return [skillId, derived(modifiers[ability] + (proficient ? proficiency : 0) + (expertise ? proficiency : 0), [
      { id: `${skillId}-ability`, label: `${ability.toUpperCase()}调整值`, value: modifiers[ability], detail: `属性 ${abilities[ability]}` },
      ...(proficient ? [{
        id: `${skillId}-proficiency`,
        label: '技能熟练',
        value: proficiency,
        detail: draft.backgroundSkillIds.includes(skillId) ? '来自背景' : raceSkillIds.includes(skillId) ? '来自种族' : '来自职业',
      }] : []),
      ...(expertise ? [{
        id: `${skillId}-expertise`,
        label: '专精',
        value: proficiency,
        detail: '熟练加值再增加一次',
      }] : []),
    ])]
  }))
  const raceSpeed = subrace?.speed ?? race?.speed ?? 30
  const classSpeedBonus = draft.classId === 'class-2014-barbarian' && draft.targetLevel >= 5 && !hasHeavyArmor
    ? 10
    : draft.classId === 'class-2014-monk' && !equippedArmor && !hasShield
      ? draft.targetLevel >= 18 ? 30 : draft.targetLevel >= 14 ? 25 : draft.targetLevel >= 10 ? 20 : draft.targetLevel >= 6 ? 15 : draft.targetLevel >= 2 ? 10 : 0
      : 0
  const speed = raceSpeed + classSpeedBonus + subclassEffects.speedBonus
  const attackAbility: AbilityKey = ['class-2014-rogue', 'class-2014-monk', 'class-2014-ranger'].includes(draft.classId ?? '') ? 'dex' : 'str'
  const spellcasting = rulesRepository.getSpellcastingConfig(draft)
  const spellAbilityModifier = spellcasting ? modifiers[spellcasting.ability] : undefined

  return {
    abilities,
    modifiers,
    proficiencyBonus: derived(proficiency, [{ id: 'level-proficiency', label: '熟练加值', value: proficiency, detail: `${draft.targetLevel}级角色` }]),
    hitPoints: derived(hp, [
      { id: 'class-hit-die', label: '职业生命骰', value: hitDie, detail: classRule?.name ?? '未选择职业' },
      { id: 'constitution', label: '体质调整值', value: modifiers.con * draft.targetLevel, detail: `体质 ${abilities.con}` },
      ...(subclassEffects.hitPointBonus !== 0 ? [{ id: 'subclass-hit-points', label: '子职生命加成', value: subclassEffects.hitPointBonus, detail: draft.subclassId ? `${rulesRepository.getSubclass(draft.subclassId)?.name ?? '子职'}特性` : '来自子职特性' }] : []),
    ]),
    armorClass: derived(armorClass, [
      {
        id: 'armor-base',
        label: equippedArmor?.name ?? (barbarianUnarmored ? '野蛮人无甲防御' : monkUnarmored ? '武僧无甲防御' : subclassEffects.armorClassBase ? '子职护甲公式' : '基础护甲'),
        value: baseArmor,
        detail: equippedArmor
          ? equippedArmor.description
          : barbarianUnarmored
            ? '10 + 敏捷调整值 + 体质调整值'
            : monkUnarmored
              ? '10 + 敏捷调整值 + 感知调整值'
              : subclassEffects.armorClassBase
                ? `${subclassEffects.armorClassBase} + 敏捷调整值`
                : '10 + 敏捷调整值',
      },
      ...(hasShield ? [{ id: 'shield', label: equippedShield?.name ?? '盾牌', value: shieldBonus, detail: '已装备' }] : []),
      ...(defenseStyle && equippedArmor ? [{ id: 'defense-style', label: '防御战斗风格', value: 1, detail: '穿着护甲时生效' }] : []),
      ...(subclassEffects.armorClassBonus !== 0 ? [{ id: 'subclass-armor-class', label: '子职护甲加成', value: subclassEffects.armorClassBonus, detail: draft.subclassId ? `${rulesRepository.getSubclass(draft.subclassId)?.name ?? '子职'}特性` : '来自子职特性' }] : []),
    ]),
    initiative: derived(modifiers.dex, [{ id: 'dex-initiative', label: '敏捷调整值', value: modifiers.dex, detail: `敏捷 ${abilities.dex}` }]),
    attackBonus: derived(proficiency + modifiers[attackAbility] + subclassEffects.attackBonus, [
      { id: 'attack-proficiency', label: '熟练加值', value: proficiency, detail: '熟练武器' },
      { id: `attack-${attackAbility}`, label: `${attackAbility.toUpperCase()}调整值`, value: modifiers[attackAbility], detail: `属性 ${abilities[attackAbility]}` },
      ...(subclassEffects.attackBonus !== 0 ? [{ id: 'subclass-attack', label: '子职攻击加成', value: subclassEffects.attackBonus, detail: '来自子职特性' }] : []),
    ]),
    attackDamageBonus: derived(modifiers[attackAbility] + subclassEffects.damageBonus, [{
      id: `damage-${attackAbility}`,
      label: `${attackAbility.toUpperCase()}调整值`,
      value: modifiers[attackAbility],
      detail: `属性 ${abilities[attackAbility]}`,
    }, ...(subclassEffects.damageBonus !== 0 ? [{ id: 'subclass-damage', label: '子职伤害加成', value: subclassEffects.damageBonus, detail: '来自子职特性' }] : [])]),
    ...(spellcasting && spellAbilityModifier !== undefined && draft.targetLevel >= spellcasting.startsAtLevel ? {
      spellAttackBonus: derived(proficiency + spellAbilityModifier + subclassEffects.spellAttackBonus, [
        { id: 'spell-attack-proficiency', label: '熟练加值', value: proficiency, detail: `${draft.targetLevel}级角色` },
        { id: 'spell-attack-ability', label: `${spellcasting.ability.toUpperCase()}调整值`, value: spellAbilityModifier, detail: '职业施法属性' },
        ...(subclassEffects.spellAttackBonus !== 0 ? [{ id: 'subclass-spell-attack', label: '子职法术攻击加成', value: subclassEffects.spellAttackBonus, detail: '来自子职特性' }] : []),
      ]),
      spellSaveDc: derived(8 + proficiency + spellAbilityModifier + subclassEffects.spellSaveDcBonus, [
        { id: 'spell-dc-base', label: '法术豁免基础', value: 8, detail: '固定基础值' },
        { id: 'spell-dc-proficiency', label: '熟练加值', value: proficiency, detail: `${draft.targetLevel}级角色` },
        { id: 'spell-dc-ability', label: `${spellcasting.ability.toUpperCase()}调整值`, value: spellAbilityModifier, detail: '职业施法属性' },
        ...(subclassEffects.spellSaveDcBonus !== 0 ? [{ id: 'subclass-spell-dc', label: '子职法术DC加成', value: subclassEffects.spellSaveDcBonus, detail: '来自子职特性' }] : []),
      ]),
    } : {}),
    speed: derived(speed, [{
      id: 'race-speed',
      label: '种族速度',
      value: raceSpeed,
      detail: subrace?.speed ? subrace.name : race?.name ?? '默认',
    }, ...(classSpeedBonus ? [{
      id: 'class-speed',
      label: '职业移动加值',
      value: classSpeedBonus,
      detail: classRule?.name ?? '',
    }] : []), ...(subclassEffects.speedBonus !== 0 ? [{
      id: 'subclass-speed',
      label: '子职移动加值',
      value: subclassEffects.speedBonus,
      detail: '来自子职特性',
    }] : [])]),
    savingThrows,
    skills,
  }
}

export function deriveCharacterSummary(draft: CharacterDraft): DerivedCharacterSummary {
  const values = deriveCharacter(draft)
  return {
    level: draft.targetLevel,
    className: draft.classId ? rulesRepository.getClass(draft.classId)?.name : undefined,
    proficiencyBonus: `+${values.proficiencyBonus.value}`,
    hitPoints: values.hitPoints.value,
    armorClass: values.armorClass.value,
    initiative: values.initiative.value >= 0 ? `+${values.initiative.value}` : `${values.initiative.value}`,
    speed: values.speed.value,
  }
}
