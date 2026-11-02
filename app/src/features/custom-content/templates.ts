import type { RulesetId } from '@/types/character'
import type { RulesRepository } from '@/types/rules'
import type {
  CustomClassEntry,
  CustomEntry,
  CustomEntryKind,
  CustomFeatEntry,
  CustomRaceEntry,
  CustomSpellEntry,
  CustomSubclassEntry,
} from '@/types/custom-content'

/** 模板候选：只提供列表展示所需的字段。 */
export interface CustomTemplateOption {
  readonly id: string
  readonly name: string
  readonly summary: string
}

export interface CustomTemplateDefaults {
  readonly expansionId: string
  readonly ruleset: RulesetId
}

function toHitDie(value: number): 6 | 8 | 10 | 12 {
  return value === 6 ? 6 : value === 10 ? 10 : value === 12 ? 12 : 8
}

/**
 * 2014 法术数据用短职业键（`wizard`），2024 用完整 ID。
 * 内容库统一保存完整 ID，因此模板复制时需要按仓库解析回来。
 */
function resolveClassId(repository: RulesRepository, ruleset: RulesetId, token: string): string | undefined {
  if (repository.getClass(token)) return token
  const fullPrefix = `class-${ruleset}-`
  const direct = repository.getClass(`${fullPrefix}${token}`)
  if (direct) return direct.id
  const suffixMatch = repository.classes.find((classRule) => classRule.id.endsWith(`-${token}`))
  return suffixMatch?.id
}

/** 列出一类内容的内置模板（排除归档条目；种族不含子种族/血统）。 */
export function listCustomTemplateOptions(
  repository: RulesRepository,
  kind: CustomEntryKind,
): readonly CustomTemplateOption[] {
  if (kind === 'race') {
    return repository.races
      .filter((race) => !race.parentRaceId && race.status !== 'unavailable')
      .map((race) => ({ id: race.id, name: race.name, summary: race.summary }))
  }
  if (kind === 'class') {
    return repository.classes
      .filter((classRule) => classRule.status !== 'unavailable')
      .map((classRule) => ({ id: classRule.id, name: classRule.name, summary: classRule.summary }))
  }
  if (kind === 'subclass') {
    return repository.subclasses
      .filter((subclass) => subclass.status !== 'unavailable')
      .map((subclass) => {
        const classRule = repository.getClass(subclass.classId)
        return {
          id: subclass.id,
          name: subclass.name,
          summary: `${classRule?.name ?? subclass.classId} · ${subclass.selectionLevel} 级`,
        }
      })
  }
  if (kind === 'feat') {
    return repository.feats
      .filter((feat) => feat.status !== 'unavailable')
      .map((feat) => ({ id: feat.id, name: feat.name, summary: feat.description }))
  }
  return repository.spells
    .filter((spell) => spell.status !== 'unavailable')
    .map((spell) => ({
      id: spell.id,
      name: spell.name,
      summary: spell.level === 0 ? '戏法' : `${spell.level} 环`,
    }))
}

function toRaceTemplate(repository: RulesRepository, id: string, defaults: CustomTemplateDefaults): CustomRaceEntry | undefined {
  const race = repository.getRace(id)
  if (!race) return undefined
  const traits = repository.getRaceFeatures(id).map((feature) => ({
    id: `trait-${feature.id}`,
    name: feature.name,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
  }))
  return {
    kind: 'race',
    id: '',
    expansionId: defaults.expansionId,
    ruleset: defaults.ruleset,
    name: `${race.name}（自制）`,
    englishName: race.englishName,
    summary: race.summary,
    description: race.description,
    createdAt: '',
    updatedAt: '',
    ...(race.size ? { size: race.size } : {}),
    ...(race.sizeChoices?.length ? { sizeChoices: race.sizeChoices } : {}),
    speed: race.speed,
    darkvision: race.darkvision,
    ...(defaults.ruleset === '5e-2014' && race.fixedAbilityBonuses ? { fixedAbilityBonuses: { ...race.fixedAbilityBonuses } } : {}),
    ...(race.skillProficiencies?.length ? { skillProficiencies: [...race.skillProficiencies] } : {}),
    ...(race.fixedLanguages?.length ? { fixedLanguages: [...race.fixedLanguages] } : {}),
    languageChoices: race.languageChoices,
    ...(race.damageResistances?.length ? { damageResistances: [...race.damageResistances] } : {}),
    hitPointBonusPerLevel: race.hitPointBonusPerLevel,
    ...(race.initiativeProficiency ? { initiativeProficiency: true } : {}),
    climbSpeed: race.climbSpeed,
    swimSpeed: race.swimSpeed,
    flySpeed: race.flySpeed,
    ...(traits.length > 0 ? { traits } : {}),
  }
}

function toClassTemplate(repository: RulesRepository, id: string, defaults: CustomTemplateDefaults): CustomClassEntry | undefined {
  const classRule = repository.getClass(id)
  if (!classRule) return undefined
  const features = (classRule.features ?? []).map((feature) => ({
    id: `feature-${feature.id}`,
    name: feature.name,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
  }))
  return {
    kind: 'class',
    id: '',
    expansionId: defaults.expansionId,
    ruleset: defaults.ruleset,
    name: `${classRule.name}（自制）`,
    englishName: classRule.englishName,
    summary: classRule.summary,
    description: classRule.introduction ?? classRule.summary,
    createdAt: '',
    updatedAt: '',
    hitDie: toHitDie(classRule.hitDie),
    primaryAbilities: [...classRule.primaryAbilities],
    savingThrowAbilities: [...classRule.savingThrowAbilities],
    ...(classRule.armorTraining?.length ? { armorTraining: [...classRule.armorTraining] } : {}),
    ...(classRule.weaponTraining ? { weaponTraining: classRule.weaponTraining } : {}),
    ...(classRule.unarmoredDefense ? { unarmoredDefense: classRule.unarmoredDefense } : {}),
    // 复制职业时沿用该职业自己的法术表（需求 §7.3.1 的"引用已有职业"）。
    ...(classRule.spellcasting
      ? { spellcastingSourceClassId: classRule.id, spellcastingAbility: classRule.spellcasting.ability }
      : {}),
    ...(features.length > 0 ? { features } : {}),
  }
}

function toSubclassTemplate(repository: RulesRepository, id: string, defaults: CustomTemplateDefaults): CustomSubclassEntry | undefined {
  const subclass = repository.getSubclass(id)
  if (!subclass) return undefined
  const features = (subclass.features ?? []).map((feature) => ({
    id: `feature-${feature.id}`,
    name: feature.name,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
  }))
  return {
    kind: 'subclass',
    id: '',
    expansionId: defaults.expansionId,
    ruleset: defaults.ruleset,
    name: `${subclass.name}（自制）`,
    englishName: subclass.englishName,
    summary: subclass.summary,
    description: subclass.summary,
    createdAt: '',
    updatedAt: '',
    classId: subclass.classId,
    selectionLevel: subclass.selectionLevel,
    ...(features.length > 0 ? { features } : {}),
  }
}

function toFeatTemplate(repository: RulesRepository, id: string, defaults: CustomTemplateDefaults): CustomFeatEntry | undefined {
  const feat = repository.getFeat(id)
  if (!feat) return undefined
  const prerequisite = feat.prerequisite
    ? {
        minimumLevel: feat.prerequisite.minimumLevel,
        ...(feat.prerequisite.abilityMinimum
          ? { abilityMinimum: { anyOf: [...feat.prerequisite.abilityMinimum.anyOf], score: feat.prerequisite.abilityMinimum.score } }
          : {}),
        ...(feat.prerequisite.requiredCapability?.includes('spellcasting') ? { requiredCapability: 'spellcasting' as const } : {}),
      }
    : undefined
  const grantedSpellIds = feat.grantedSpells?.map((grant) => grant.spellId)
  return {
    kind: 'feat',
    id: '',
    expansionId: defaults.expansionId,
    ruleset: defaults.ruleset,
    name: `${feat.name}（自制）`,
    englishName: feat.englishName,
    summary: feat.description,
    description: feat.detail,
    createdAt: '',
    updatedAt: '',
    ...(feat.category ? { category: feat.category } : {}),
    ...(feat.repeatable ? { repeatable: true } : {}),
    ...(prerequisite ? { prerequisite } : {}),
    hitPointBonusPerLevel: feat.hitPointBonusPerLevel,
    hitPointBonus: feat.hitPointBonus,
    speedBonus: feat.speedBonus,
    ...(feat.armorTraining?.length ? { armorTraining: [...feat.armorTraining] } : {}),
    ...(grantedSpellIds?.length ? { grantedSpellIds } : {}),
  }
}

function toSpellTemplate(repository: RulesRepository, id: string, defaults: CustomTemplateDefaults): CustomSpellEntry | undefined {
  const spell = repository.getSpell(id)
  if (!spell) return undefined
  const classIds = spell.classIds
    .map((token) => resolveClassId(repository, defaults.ruleset, token))
    .filter((value): value is string => Boolean(value))
  return {
    kind: 'spell',
    id: '',
    expansionId: defaults.expansionId,
    ruleset: defaults.ruleset,
    name: `${spell.name}（自制）`,
    englishName: spell.englishName,
    summary: spell.summary,
    description: spell.description,
    createdAt: '',
    updatedAt: '',
    level: spell.level,
    classIds,
    ...(spell.school ? { school: spell.school } : {}),
    ...(spell.ritual ? { ritual: true } : {}),
    ...(spell.castingTime ? { castingTime: spell.castingTime } : {}),
    ...(spell.range ? { range: spell.range } : {}),
    ...(spell.components ? { components: spell.components } : {}),
    ...(spell.duration ? { duration: spell.duration } : {}),
    ...(spell.concentration !== undefined ? { concentration: spell.concentration } : {}),
  }
}

/**
 * 由内置条目生成"表单初值"。
 *
 * 返回值故意把 `id` 留空：保存时由 `stores/custom-content#createEntry` 重新生成
 * `custom-*` ID，因此模板复制永远不会覆盖内置内容。
 */
export function buildTemplateEntry(
  repository: RulesRepository,
  kind: CustomEntryKind,
  id: string,
  defaults: CustomTemplateDefaults,
): CustomEntry | undefined {
  if (kind === 'race') return toRaceTemplate(repository, id, defaults)
  if (kind === 'class') return toClassTemplate(repository, id, defaults)
  if (kind === 'subclass') return toSubclassTemplate(repository, id, defaults)
  if (kind === 'feat') return toFeatTemplate(repository, id, defaults)
  return toSpellTemplate(repository, id, defaults)
}
