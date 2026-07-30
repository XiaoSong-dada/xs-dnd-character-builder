import { rulesRepository } from '@/rules/repository'
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

export function getRaceAbilityBonuses(draft: CharacterDraft): Partial<AbilityScores> {
  const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
  const baseBonuses = subrace?.replacesParentBonuses ? {} : race?.fixedAbilityBonuses ?? {}
  const fixedBonuses: Partial<Record<AbilityKey, number>> = { ...baseBonuses, ...subrace?.fixedAbilityBonuses }
  const flexibleRule = subrace?.flexibleBonusCount ? subrace : race
  const flexibleValue = flexibleRule?.flexibleBonusValue ?? 1

  for (const key of draft.raceAbilityChoices.slice(0, flexibleRule?.flexibleBonusCount ?? 0)) {
    fixedBonuses[key] = (fixedBonuses[key] ?? 0) + flexibleValue
  }
  return fixedBonuses
}

function applyAbilityImprovements(abilities: AbilityScores, draft: CharacterDraft): AbilityScores {
  const improved = { ...abilities }

  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue

    if (selection.optionIds.includes('asi-str-2')) {
      improved.str = Math.min(20, improved.str + 2)
    }

    if (selection.optionIds.includes('asi-str-con')) {
      improved.str = Math.min(20, improved.str + 1)
      improved.con = Math.min(20, improved.con + 1)
    }
  }

  return improved
}

function derived(value: number, sources: readonly ValueSource[]): DerivedValue<number> {
  return { value, sources }
}

export function deriveCharacter(draft: CharacterDraft): DerivedCharacter {
  const originAbilities = addAbilities(draft.baseAbilities, getRaceAbilityBonuses(draft))
  const abilities = applyAbilityImprovements(originAbilities, draft)
  const abilityKeys: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
  const modifiers = Object.fromEntries(abilityKeys.map((key) => [key, abilityModifier(abilities[key])])) as Record<AbilityKey, number>
  const proficiency = proficiencyBonus(draft.targetLevel)
  const classRule = draft.classId ? rulesRepository.getClass(draft.classId) : undefined
  const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
  const hitDie = classRule?.hitDie ?? 8
  const hp = hitDie + modifiers.con
    + Math.max(0, draft.targetLevel - 1) * Math.max(1, Math.floor(hitDie / 2) + 1 + modifiers.con)
  const hasChainMail = draft.equippedItemIds.includes('chain-mail')
  const hasShield = draft.equippedItemIds.includes('shield')
  const baseArmor = hasChainMail ? 16 : 10 + modifiers.dex
  const defenseStyle = draft.selections.some((item) => item.optionIds.includes('style-defense'))
  const armorClass = baseArmor + (hasShield ? 2 : 0) + (defenseStyle && hasChainMail ? 1 : 0)
  const selectedClassSkillIds = (classRule?.checkpoints ?? [])
    .filter((checkpoint) => checkpoint.kind === 'skills')
    .flatMap((checkpoint) => draft.selections.find((item) => item.checkpointId === checkpoint.id && !item.invalidatedAt)?.optionIds ?? [])
  const proficientSkillIds = new Set([...draft.backgroundSkillIds, ...selectedClassSkillIds])
  const skillAbilities: Readonly<Record<string, AbilityKey>> = {
    'skill-acrobatics': 'dex',
    'skill-animal-handling': 'wis',
    'skill-arcana': 'int',
    'skill-athletics': 'str',
    'skill-deception': 'cha',
    'skill-history': 'int',
    'skill-insight': 'wis',
    'skill-intimidation': 'cha',
    'skill-medicine': 'wis',
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
    return [skillId, derived(modifiers[ability] + (proficient ? proficiency : 0), [
      { id: `${skillId}-ability`, label: `${ability.toUpperCase()}调整值`, value: modifiers[ability], detail: `属性 ${abilities[ability]}` },
      ...(proficient ? [{
        id: `${skillId}-proficiency`,
        label: '技能熟练',
        value: proficiency,
        detail: draft.backgroundSkillIds.includes(skillId) ? '来自背景' : '来自职业',
      }] : []),
    ])]
  }))
  const speed = subrace?.speed ?? race?.speed ?? 30

  return {
    abilities,
    modifiers,
    proficiencyBonus: derived(proficiency, [{ id: 'level-proficiency', label: '熟练加值', value: proficiency, detail: `${draft.targetLevel}级角色` }]),
    hitPoints: derived(hp, [
      { id: 'class-hit-die', label: '职业生命骰', value: hitDie, detail: classRule?.name ?? '未选择职业' },
      { id: 'constitution', label: '体质调整值', value: modifiers.con * draft.targetLevel, detail: `体质 ${abilities.con}` },
    ]),
    armorClass: derived(armorClass, [
      { id: 'armor-base', label: hasChainMail ? '链甲' : '基础护甲', value: baseArmor, detail: hasChainMail ? '已装备' : '10 + 敏捷调整值' },
      ...(hasShield ? [{ id: 'shield', label: '盾牌', value: 2, detail: '已装备' }] : []),
      ...(defenseStyle && hasChainMail ? [{ id: 'defense-style', label: '防御战斗风格', value: 1, detail: '穿着护甲时生效' }] : []),
    ]),
    initiative: derived(modifiers.dex, [{ id: 'dex-initiative', label: '敏捷调整值', value: modifiers.dex, detail: `敏捷 ${abilities.dex}` }]),
    attackBonus: derived(proficiency + modifiers.str, [
      { id: 'attack-proficiency', label: '熟练加值', value: proficiency, detail: '熟练武器' },
      { id: 'attack-strength', label: '力量调整值', value: modifiers.str, detail: `力量 ${abilities.str}` },
    ]),
    speed: derived(speed, [{
      id: 'race-speed',
      label: '种族速度',
      value: speed,
      detail: subrace?.speed ? subrace.name : race?.name ?? '默认',
    }]),
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
