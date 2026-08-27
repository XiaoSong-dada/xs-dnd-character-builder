import type {
  AbilityKey,
  CharacterManualEdits,
  ManualAddedSpell,
  ManualDerivedField,
} from '@/types/character'

export const EMPTY_MANUAL_EDITS: CharacterManualEdits = {
  abilityAdjustments: {},
  proficiencyBonusAdjustment: 0,
  derivedAdjustments: {},
  savingThrowAdjustments: {},
  skillAdjustments: {},
  spellSlotAdjustments: {},
  addedSpells: [],
}

function finiteInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value)
}

function normalizeNumberRecord(value: unknown): Readonly<Record<string, number>> {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(Object.entries(value).filter(([, item]) => finiteInteger(item)))
}

const abilityKeys = new Set<AbilityKey>(['str', 'dex', 'con', 'int', 'wis', 'cha'])
const derivedKeys = new Set<ManualDerivedField>([
  'armorClass', 'hitPoints', 'initiative', 'speed', 'attackBonus', 'attackDamageBonus',
  'passivePerception', 'spellAttackBonus', 'spellSaveDc',
])
const destinations = new Set<ManualAddedSpell['destination']>(['known', 'pact-known', 'prepared-list', 'spellbook', 'granted'])

export function normalizeManualEdits(value: unknown): CharacterManualEdits {
  const edits = value && typeof value === 'object' ? value as Partial<CharacterManualEdits> : {}
  const abilities = normalizeNumberRecord(edits.abilityAdjustments)
  const derived = normalizeNumberRecord(edits.derivedAdjustments)
  const saves = normalizeNumberRecord(edits.savingThrowAdjustments)
  const slots = normalizeNumberRecord(edits.spellSlotAdjustments)
  const addedSpells = Array.isArray(edits.addedSpells)
    ? edits.addedSpells.flatMap((item) => {
      if (!item || typeof item !== 'object') return []
      const spell = item as Partial<ManualAddedSpell>
      if (typeof spell.spellId !== 'string' || !destinations.has(spell.destination as ManualAddedSpell['destination'])) return []
      return [{ spellId: spell.spellId, destination: spell.destination as ManualAddedSpell['destination'], prepared: Boolean(spell.prepared) }]
    }).filter((item, index, all) => all.findIndex((candidate) => candidate.spellId === item.spellId) === index)
    : []
  return {
    abilityAdjustments: Object.fromEntries(Object.entries(abilities).filter(([key]) => abilityKeys.has(key as AbilityKey))),
    proficiencyBonusAdjustment: finiteInteger(edits.proficiencyBonusAdjustment) ? edits.proficiencyBonusAdjustment : 0,
    derivedAdjustments: Object.fromEntries(Object.entries(derived).filter(([key]) => derivedKeys.has(key as ManualDerivedField))),
    savingThrowAdjustments: Object.fromEntries(Object.entries(saves).filter(([key]) => abilityKeys.has(key as AbilityKey))),
    skillAdjustments: normalizeNumberRecord(edits.skillAdjustments),
    spellSlotAdjustments: Object.fromEntries(Object.entries(slots).filter(([key]) => Number(key) >= 1 && Number(key) <= 9)),
    addedSpells,
  }
}

export function adjustmentForEnteredValue(enteredValue: number, baseline: number): number {
  return enteredValue - baseline
}

export function setRecordAdjustment<T extends string>(
  record: Readonly<Partial<Record<T, number>>>,
  key: T,
  adjustment: number,
): Readonly<Partial<Record<T, number>>> {
  const next: Partial<Record<T, number>> = { ...record }
  if (adjustment === 0) delete next[key]
  else next[key] = adjustment
  return next
}

export function hasManualEdits(edits: CharacterManualEdits): boolean {
  return Object.keys(edits.abilityAdjustments).length > 0
    || edits.proficiencyBonusAdjustment !== 0
    || Object.keys(edits.derivedAdjustments).length > 0
    || Object.keys(edits.savingThrowAdjustments).length > 0
    || Object.keys(edits.skillAdjustments).length > 0
    || Object.keys(edits.spellSlotAdjustments).length > 0
    || edits.addedSpells.length > 0
}
