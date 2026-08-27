import { rulesRepository } from '@/rules/repository'
import { applyAbilityImprovement, decodeAbilityImprovement } from '@/rules/feats'
import { getSubclassDerivedEffects } from '@/rules/subclass-effects'
import { isSourceEnabled } from '@/rules/source-books'
import { artificerInfusions2014 } from '@/rules/data/artificer-2014'
import { getSpellcastingConfig } from '@/rules/spellcasting'
import { normalizeManualEdits } from '@/rules/manual-edits'
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
export function collectRaceSkillIds(draft: Pick<CharacterDraft, 'raceId' | 'subraceId' | 'raceSkillChoices' | 'enabledSourceIds'>): readonly string[] {
  const ids: string[] = [...(draft.raceSkillChoices ?? [])]
  const visited = new Set<string>()
  const visit = (raceId: string | undefined): void => {
    if (!raceId || visited.has(raceId)) return
    visited.add(raceId)
    const race = rulesRepository.getRace(raceId)
    if (!race || !isSourceEnabled(race.sourceIds, draft.enabledSourceIds)) return
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
  const selectedRace = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
  const selectedSubrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
  const race = selectedRace && isSourceEnabled(selectedRace.sourceIds, draft.enabledSourceIds) ? selectedRace : undefined
  const subrace = selectedSubrace && isSourceEnabled(selectedSubrace.sourceIds, draft.enabledSourceIds) ? selectedSubrace : undefined
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
    if (selection.checkpointId.startsWith('feat-child:')) {
      const [, parentCheckpointId, featId] = selection.checkpointId.split(':')
      const parentActive = draft.selections.some((item) => item.checkpointId === parentCheckpointId && !item.invalidatedAt && item.optionIds.includes(featId ?? ''))
      const feat = featId ? rulesRepository.getFeat(featId) : undefined
      if (!parentActive || !feat || !isSourceEnabled(feat.sourceIds, draft.enabledSourceIds)) continue
      for (const optionId of selection.optionIds) {
        const match = /^feat-bonus-(str|dex|con|int|wis|cha)-1$/.exec(optionId)
        const ability = match?.[1] as AbilityKey | undefined
        if (ability) improved = { ...improved, [ability]: Math.min(20, improved[ability] + 1) }
      }
      continue
    }
    const improvementOptionId = selection.optionIds.find((optionId) => {
      if (!decodeAbilityImprovement(optionId)) return false
      const option = rulesRepository.getOption(optionId) ?? rulesRepository.getFeat(optionId)
      return !option || isSourceEnabled(option.sourceIds, draft.enabledSourceIds)
    })
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

function withManualAdjustment(value: DerivedValue<number>, adjustment: number | undefined, field: string): DerivedValue<number> {
  if (!adjustment) return value
  return derived(value.value + adjustment, [...value.sources, {
    id: `manual-${field}`,
    label: '人工调整',
    value: adjustment,
    detail: adjustment > 0 ? `人工增加 ${adjustment}` : `人工减少 ${Math.abs(adjustment)}`,
  }])
}

export function deriveCharacter(draft: CharacterDraft): DerivedCharacter {
  const manual = normalizeManualEdits(draft.manualEdits)
  const systemAbilities = deriveAbilities(draft)
  const abilityKeys: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
  const abilities = Object.fromEntries(abilityKeys.map((key) => [key, systemAbilities[key] + (manual.abilityAdjustments[key] ?? 0)])) as unknown as AbilityScores
  const modifiers = Object.fromEntries(abilityKeys.map((key) => [key, abilityModifier(abilities[key])])) as Record<AbilityKey, number>
  const systemProficiency = proficiencyBonus(draft.targetLevel)
  const proficiency = systemProficiency + manual.proficiencyBonusAdjustment
  const selectedClass = draft.classId ? rulesRepository.getClass(draft.classId) : undefined
  const classRule = selectedClass && isSourceEnabled(selectedClass.sourceIds, draft.enabledSourceIds) ? selectedClass : undefined
  const selectedSubclass = draft.subclassId ? rulesRepository.getSubclass(draft.subclassId) : undefined
  const subclassId = selectedSubclass && isSourceEnabled(selectedSubclass.sourceIds, draft.enabledSourceIds) ? selectedSubclass.id : undefined
  const subclassEffects = getSubclassDerivedEffects(subclassId, draft.targetLevel)
  const selectedRace = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
  const selectedSubrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
  const race = selectedRace && isSourceEnabled(selectedRace.sourceIds, draft.enabledSourceIds) ? selectedRace : undefined
  const subrace = selectedSubrace && isSourceEnabled(selectedSubrace.sourceIds, draft.enabledSourceIds) ? selectedSubrace : undefined
  const hitDie = classRule?.hitDie ?? 8
  const hp = hitDie + modifiers.con
    + Math.max(0, draft.targetLevel - 1) * Math.max(1, Math.floor(hitDie / 2) + 1 + modifiers.con)
    + subclassEffects.hitPointBonus
  const equippedItems = draft.inventory
    .filter((entry) => entry.equippedQuantity > 0)
    .map((entry) => rulesRepository.getEquipment(entry.itemId))
    .filter((item) => Boolean(item && isSourceEnabled(item.sourceIds, draft.enabledSourceIds)))
  const equippedArmor = equippedItems
    .find((item) => item?.category === 'armor')
  const equippedShield = equippedItems
    .find((item) => item?.category === 'shield')
  const equippedWeapon = equippedItems.find((item) => item?.category === 'weapon')
  const activeInfusions = draft.classId === 'class-2014-artificer'
    ? (draft.infusionAssignments ?? []).flatMap((assignment) => {
      const entry = draft.inventory.find((item) => item.id === assignment.inventoryEntryId && item.equippedQuantity > 0)
      const item = entry ? rulesRepository.getEquipment(entry.itemId) : undefined
      const infusion = artificerInfusions2014.find((candidate) => candidate.id === assignment.infusionId)
      const known = draft.selections.some((selection) => !selection.invalidatedAt && selection.optionIds.includes(assignment.infusionId))
      return entry && item && infusion && known && infusion.minimumLevel <= draft.targetLevel
        && isSourceEnabled(infusion.sourceIds, draft.enabledSourceIds)
        && infusion.eligibleCategories.some((category) => category === item.category)
        ? [{ assignment, entry, item, infusion }]
        : []
    })
    : []
  const infusionBonusFor = (itemId: string | undefined): number => {
    const active = activeInfusions.find((record) => record.item?.id === itemId)
    if (!active?.infusion.magicBonus) return 0
    return draft.targetLevel >= 10 && ['infusion-2014-enhanced-defense', 'infusion-2014-enhanced-weapon', 'infusion-2014-enhanced-arcane-focus'].includes(active.infusion.id)
      ? 2
      : active.infusion.magicBonus
  }
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
  const defenseStyle = draft.selections.some((item) => !item.invalidatedAt && item.optionIds.some((id) => {
    if (id !== 'style-defense') return false
    const option = rulesRepository.getOption(id)
    return !option || isSourceEnabled(option.sourceIds, draft.enabledSourceIds)
  }))
  const shieldBonus = equippedShield?.armorClassBonus ?? 0
  const armorInfusionBonus = infusionBonusFor(equippedArmor?.id) + infusionBonusFor(equippedShield?.id)
  const armorClass = baseArmor + shieldBonus + armorInfusionBonus + (defenseStyle && Boolean(equippedArmor) ? 1 : 0) + subclassEffects.armorClassBonus
  const selectedClassSkillIds = (classRule?.checkpoints ?? [])
    .filter((checkpoint) => checkpoint.kind === 'skills')
    .flatMap((checkpoint) => draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)?.optionIds ?? [])
  // 种族熟练：沿父链收集固定项 + 自选结果（子种族不替换父种族熟练）。
  const raceSkillIds = collectRaceSkillIds(draft)
  const background = draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId) : undefined
  const backgroundSkillIds = background && isSourceEnabled(background.sourceIds, draft.enabledSourceIds) ? draft.backgroundSkillIds : []
  const proficientSkillIds = new Set([...backgroundSkillIds, ...selectedClassSkillIds, ...raceSkillIds])
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
    return [key, withManualAdjustment(derived(modifiers[key] + (proficient ? proficiency : 0), [
      { id: `${key}-save-ability`, label: '属性调整值', value: modifiers[key], detail: `${key.toUpperCase()} ${abilities[key]}` },
      ...(proficient ? [{ id: `${key}-save-proficiency`, label: '职业豁免熟练', value: proficiency, detail: classRule?.name ?? '' }] : []),
    ]), manual.savingThrowAdjustments[key], `save-${key}`)]
  })) as Record<AbilityKey, DerivedValue<number>>
  const skills = Object.fromEntries(Object.entries(skillAbilities).map(([skillId, ability]) => {
    const proficient = proficientSkillIds.has(skillId)
    const expertise = expertiseIds.has(skillId)
    return [skillId, withManualAdjustment(derived(modifiers[ability] + (proficient ? proficiency : 0) + (expertise ? proficiency : 0), [
      { id: `${skillId}-ability`, label: `${ability.toUpperCase()}调整值`, value: modifiers[ability], detail: `属性 ${abilities[ability]}` },
      ...(proficient ? [{
        id: `${skillId}-proficiency`,
        label: '技能熟练',
        value: proficiency,
        detail: backgroundSkillIds.includes(skillId) ? '来自背景' : raceSkillIds.includes(skillId) ? '来自种族' : '来自职业',
      }] : []),
      ...(expertise ? [{
        id: `${skillId}-expertise`,
        label: '专精',
        value: proficiency,
        detail: '熟练加值再增加一次',
      }] : []),
    ]), manual.skillAdjustments[skillId], skillId)]
  }))
  const raceSpeed = subrace?.speed ?? race?.speed ?? 30
  const classSpeedBonus = draft.classId === 'class-2014-barbarian' && draft.targetLevel >= 5 && !hasHeavyArmor
    ? 10
    : draft.classId === 'class-2014-monk' && !equippedArmor && !hasShield
      ? draft.targetLevel >= 18 ? 30 : draft.targetLevel >= 14 ? 25 : draft.targetLevel >= 10 ? 20 : draft.targetLevel >= 6 ? 15 : draft.targetLevel >= 2 ? 10 : 0
      : 0
  const speed = raceSpeed + classSpeedBonus + subclassEffects.speedBonus
  const battleSmithMagicWeapon = subclassId === 'subclass-2014-artificer-battle-smith'
    && Boolean(equippedWeapon && ((equippedWeapon.magicBonus ?? 0) > 0 || infusionBonusFor(equippedWeapon.id) > 0))
  const attackAbility: AbilityKey = battleSmithMagicWeapon
    ? 'int'
    : ['class-2014-rogue', 'class-2014-monk', 'class-2014-ranger'].includes(draft.classId ?? '') ? 'dex' : 'str'
  const weaponMagicBonus = (equippedWeapon?.magicBonus ?? 0) + infusionBonusFor(equippedWeapon?.id)
  const spellcasting = getSpellcastingConfig(draft)
  const spellAbilityModifier = spellcasting ? modifiers[spellcasting.ability] : undefined

  const proficiencyValue = withManualAdjustment(
    derived(systemProficiency, [{ id: 'level-proficiency', label: '熟练加值', value: systemProficiency, detail: `${draft.targetLevel}级角色` }]),
    manual.proficiencyBonusAdjustment,
    'proficiency',
  )
  const hitPoints = withManualAdjustment(derived(hp, [
    { id: 'class-hit-die', label: '职业生命骰', value: hitDie, detail: classRule?.name ?? '未选择职业' },
    { id: 'constitution', label: '体质调整值', value: modifiers.con * draft.targetLevel, detail: `体质 ${abilities.con}` },
    ...(subclassEffects.hitPointBonus !== 0 ? [{ id: 'subclass-hit-points', label: '子职生命加成', value: subclassEffects.hitPointBonus, detail: draft.subclassId ? `${rulesRepository.getSubclass(draft.subclassId)?.name ?? '子职'}特性` : '来自子职特性' }] : []),
  ]), manual.derivedAdjustments.hitPoints, 'hit-points')
  const armorClassValue = withManualAdjustment(derived(armorClass, [
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
    ...(armorInfusionBonus ? [{ id: 'artificer-enhanced-defense', label: '工匠灌注', value: armorInfusionBonus, detail: '已绑定并装备的强化防御物品' }] : []),
    ...(subclassEffects.armorClassBonus !== 0 ? [{ id: 'subclass-armor-class', label: '子职护甲加成', value: subclassEffects.armorClassBonus, detail: draft.subclassId ? `${rulesRepository.getSubclass(draft.subclassId)?.name ?? '子职'}特性` : '来自子职特性' }] : []),
  ]), manual.derivedAdjustments.armorClass, 'armor-class')
  const initiativeValue = withManualAdjustment(derived(modifiers.dex, [{ id: 'dex-initiative', label: '敏捷调整值', value: modifiers.dex, detail: `敏捷 ${abilities.dex}` }]), manual.derivedAdjustments.initiative, 'initiative')
  const attackValue = withManualAdjustment(derived(proficiency + modifiers[attackAbility] + weaponMagicBonus + subclassEffects.attackBonus, [
    { id: 'attack-proficiency', label: '熟练加值', value: proficiency, detail: '熟练武器' },
    { id: `attack-${attackAbility}`, label: `${attackAbility.toUpperCase()}调整值`, value: modifiers[attackAbility], detail: `属性 ${abilities[attackAbility]}` },
    ...(weaponMagicBonus ? [{ id: 'magic-weapon-attack', label: '魔法武器加值', value: weaponMagicBonus, detail: equippedWeapon?.name ?? '已灌注武器' }] : []),
    ...(subclassEffects.attackBonus !== 0 ? [{ id: 'subclass-attack', label: '子职攻击加成', value: subclassEffects.attackBonus, detail: '来自子职特性' }] : []),
  ]), manual.derivedAdjustments.attackBonus, 'attack')
  const damageValue = withManualAdjustment(derived(modifiers[attackAbility] + weaponMagicBonus + subclassEffects.damageBonus, [{
    id: `damage-${attackAbility}`,
    label: `${attackAbility.toUpperCase()}调整值`,
    value: modifiers[attackAbility],
    detail: `属性 ${abilities[attackAbility]}`,
  }, ...(weaponMagicBonus ? [{ id: 'magic-weapon-damage', label: '魔法武器加值', value: weaponMagicBonus, detail: equippedWeapon?.name ?? '已灌注武器' }] : []), ...(subclassEffects.damageBonus !== 0 ? [{ id: 'subclass-damage', label: '子职伤害加成', value: subclassEffects.damageBonus, detail: '来自子职特性' }] : [])]), manual.derivedAdjustments.attackDamageBonus, 'damage')
  const speedValue = withManualAdjustment(derived(speed, [{
    id: 'race-speed', label: '种族速度', value: raceSpeed, detail: subrace?.speed ? subrace.name : race?.name ?? '默认',
  }, ...(classSpeedBonus ? [{ id: 'class-speed', label: '职业移动加值', value: classSpeedBonus, detail: classRule?.name ?? '' }] : []), ...(subclassEffects.speedBonus !== 0 ? [{ id: 'subclass-speed', label: '子职移动加值', value: subclassEffects.speedBonus, detail: '来自子职特性' }] : [])]), manual.derivedAdjustments.speed, 'speed')
  const passivePerception = withManualAdjustment(derived(10 + (skills['skill-perception']?.value ?? 0), [
    { id: 'passive-base', label: '被动基础', value: 10, detail: '固定基础值' },
    { id: 'passive-perception-skill', label: '察觉加值', value: skills['skill-perception']?.value ?? 0, detail: '来自察觉技能' },
  ]), manual.derivedAdjustments.passivePerception, 'passive-perception')
  const hasManualSpellAttack = manual.derivedAdjustments.spellAttackBonus !== undefined
  const hasManualSpellDc = manual.derivedAdjustments.spellSaveDc !== undefined
  const baseSpellAttack = spellcasting && spellAbilityModifier !== undefined && draft.targetLevel >= spellcasting.startsAtLevel
    ? derived(proficiency + spellAbilityModifier + subclassEffects.spellAttackBonus, [
      { id: 'spell-attack-proficiency', label: '熟练加值', value: proficiency, detail: `${draft.targetLevel}级角色` },
      { id: 'spell-attack-ability', label: `${spellcasting.ability.toUpperCase()}调整值`, value: spellAbilityModifier, detail: '职业施法属性' },
      ...(subclassEffects.spellAttackBonus !== 0 ? [{ id: 'subclass-spell-attack', label: '子职法术攻击加成', value: subclassEffects.spellAttackBonus, detail: '来自子职特性' }] : []),
    ])
    : hasManualSpellAttack ? derived(0, [{ id: 'manual-spell-base', label: '人工施法基础', value: 0, detail: '当前职业无系统施法能力' }]) : undefined
  const baseSpellDc = spellcasting && spellAbilityModifier !== undefined && draft.targetLevel >= spellcasting.startsAtLevel
    ? derived(8 + proficiency + spellAbilityModifier + subclassEffects.spellSaveDcBonus, [
      { id: 'spell-dc-base', label: '法术豁免基础', value: 8, detail: '固定基础值' },
      { id: 'spell-dc-proficiency', label: '熟练加值', value: proficiency, detail: `${draft.targetLevel}级角色` },
      { id: 'spell-dc-ability', label: `${spellcasting.ability.toUpperCase()}调整值`, value: spellAbilityModifier, detail: '职业施法属性' },
      ...(subclassEffects.spellSaveDcBonus !== 0 ? [{ id: 'subclass-spell-dc', label: '子职法术DC加成', value: subclassEffects.spellSaveDcBonus, detail: '来自子职特性' }] : []),
    ])
    : hasManualSpellDc ? derived(0, [{ id: 'manual-spell-dc-base', label: '人工施法基础', value: 0, detail: '当前职业无系统施法能力' }]) : undefined

  return {
    abilities,
    modifiers,
    proficiencyBonus: proficiencyValue,
    hitPoints,
    armorClass: armorClassValue,
    initiative: initiativeValue,
    attackBonus: attackValue,
    attackDamageBonus: damageValue,
    ...(baseSpellAttack ? { spellAttackBonus: withManualAdjustment(baseSpellAttack, manual.derivedAdjustments.spellAttackBonus, 'spell-attack') } : {}),
    ...(baseSpellDc ? { spellSaveDc: withManualAdjustment(baseSpellDc, manual.derivedAdjustments.spellSaveDc, 'spell-dc') } : {}),
    speed: speedValue,
    passivePerception,
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
