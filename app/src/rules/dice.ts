import type {
  DicePoolEntry,
  DieType,
  LogicalRollResult,
  PhysicalDieSpec,
  RollPreparation,
} from '@/types/dice'

export const MAX_PHYSICAL_DICE = 20

export const DIE_TYPES: readonly DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']

export const DIE_SIDES: Readonly<Record<Exclude<DieType, 'd100'>, number>> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
}

export function getPhysicalDieCost(type: DieType): number {
  return type === 'd100' ? 2 : 1
}

export function getPhysicalDiceCount(pool: readonly DicePoolEntry[]): number {
  return pool.reduce((total, entry) => total + entry.quantity * getPhysicalDieCost(entry.type), 0)
}

export function formatDiceExpression(pool: readonly DicePoolEntry[]): string {
  const counts = new Map(pool.map((entry) => [entry.type, entry.quantity]))
  return DIE_TYPES.flatMap((type) => {
    const quantity = counts.get(type) ?? 0
    return quantity > 0 ? [`${quantity}${type}`] : []
  }).join(' + ')
}

export function resolveD100(tens: number, ones: number): number {
  if (!Number.isInteger(tens) || tens < 0 || tens > 90 || tens % 10 !== 0) {
    throw new RangeError('百分骰十位必须是 00—90 的整十数。')
  }
  if (!Number.isInteger(ones) || ones < 0 || ones > 9) {
    throw new RangeError('百分骰个位必须是 0—9。')
  }
  return tens === 0 && ones === 0 ? 100 : tens + ones
}

export function splitD100(value: number): { tens: number; ones: number } {
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new RangeError('d100 结果必须是 1—100 的整数。')
  }
  if (value === 100) return { tens: 0, ones: 0 }
  return { tens: Math.floor(value / 10) * 10, ones: value % 10 }
}

export function calculateRollTotal(results: readonly LogicalRollResult[]): number {
  return results.reduce((total, result) => total + result.value, 0)
}

export function groupRollResults(results: readonly LogicalRollResult[]) {
  return DIE_TYPES.flatMap((type) => {
    const values = results.filter((result) => result.type === type)
    return values.length > 0 ? [{ type, results: values }] : []
  })
}

export function prepareRoll(
  pool: readonly DicePoolEntry[],
  rollId: string,
  seed: number,
  randomInteger: (minimum: number, maximum: number) => number,
): RollPreparation {
  if (getPhysicalDiceCount(pool) === 0) {
    throw new RangeError('请先向骰池添加骰子。')
  }
  if (getPhysicalDiceCount(pool) > MAX_PHYSICAL_DICE) {
    throw new RangeError(`单次最多投掷 ${MAX_PHYSICAL_DICE} 个物理骰子。`)
  }

  const results: LogicalRollResult[] = []
  const dice: PhysicalDieSpec[] = []

  for (const type of DIE_TYPES) {
    const quantity = pool.find((entry) => entry.type === type)?.quantity ?? 0
    for (let index = 0; index < quantity; index += 1) {
      const logicalId = `${rollId}:${type}:${index}`
      if (type === 'd100') {
        const value = randomInteger(1, 100)
        const components = splitD100(value)
        results.push({ id: logicalId, type, value, d100: components })
        dice.push(
          {
            id: `${logicalId}:tens`,
            logicalId,
            type: 'd10',
            resultKind: 'percentile-tens',
            targetValue: components.tens / 10,
          },
          {
            id: `${logicalId}:ones`,
            logicalId,
            type: 'd10',
            resultKind: 'percentile-ones',
            targetValue: components.ones,
          },
        )
        continue
      }

      const value = randomInteger(1, DIE_SIDES[type])
      results.push({ id: logicalId, type, value })
      dice.push({ id: logicalId, logicalId, type, resultKind: 'standard', targetValue: value })
    }
  }

  return { request: { id: rollId, seed, dice }, results }
}

