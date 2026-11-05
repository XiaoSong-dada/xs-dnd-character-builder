import type {
  DicePoolEntry,
  DieType,
  LogicalRollResult,
  PhysicalDieSpec,
  PhysicsTrajectory,
  RollPreparation,
  RollRequest,
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

export interface DiceRollSnapshot {
  request: RollRequest
  trajectory: PhysicsTrajectory
}

/** 只替换一颗逻辑骰的点数；d100 同步更新十位与个位读数。 */
export function rerollLogicalResult(
  result: LogicalRollResult,
  randomInteger: (minimum: number, maximum: number) => number,
): LogicalRollResult {
  if (result.type === 'd100') {
    const value = randomInteger(1, 100)
    return { ...result, value, d100: splitD100(value) }
  }
  return { ...result, value: randomInteger(1, DIE_SIDES[result.type]) }
}

function createActiveSpecs(result: LogicalRollResult, previousSpecs: readonly PhysicalDieSpec[]): PhysicalDieSpec[] {
  if (result.type === 'd100') {
    const components = result.d100 ?? splitD100(result.value)
    return [
      {
        id: previousSpecs[0]?.id ?? `${result.id}:tens`,
        logicalId: result.id,
        type: 'd10',
        resultKind: 'percentile-tens',
        targetValue: components.tens / 10,
      },
      {
        id: previousSpecs[1]?.id ?? `${result.id}:ones`,
        logicalId: result.id,
        type: 'd10',
        resultKind: 'percentile-ones',
        targetValue: components.ones,
      },
    ]
  }
  return [{
    id: previousSpecs[0]?.id ?? result.id,
    logicalId: result.id,
    type: result.type,
    resultKind: 'standard',
    targetValue: result.value,
  }]
}

/**
 * 以上一轮停稳的骰盘为基线，只让目标逻辑骰重新参与物理模拟；
 * 其余骰子携带 staticPose，渲染时保持原位。
 */
export function buildRerollRequest(
  results: readonly LogicalRollResult[],
  targetId: string,
  rollId: string,
  seed: number,
  previous: DiceRollSnapshot,
): RollRequest {
  if (!results.some((result) => result.id === targetId)) {
    throw new RangeError('找不到要重掷的骰子。')
  }
  if (previous.request.dice.length === 0 || previous.trajectory.frameCount < 1) {
    throw new RangeError('当前没有可重掷的骰盘状态。')
  }

  const previousSpecsByLogical = new Map<string, PhysicalDieSpec[]>()
  const previousIndexById = new Map<string, number>()
  previous.request.dice.forEach((spec, index) => {
    const specs = previousSpecsByLogical.get(spec.logicalId) ?? []
    specs.push(spec)
    previousSpecsByLogical.set(spec.logicalId, specs)
    previousIndexById.set(spec.id, index)
  })

  const diceCount = previous.request.dice.length
  const lastFrame = previous.trajectory.frameCount - 1
  const transforms = previous.trajectory.transforms
  const dice: PhysicalDieSpec[] = []

  for (const result of results) {
    const previousSpecs = previousSpecsByLogical.get(result.id)
    const expectedPhysicalCount = getPhysicalDieCost(result.type)
    if (!previousSpecs || previousSpecs.length !== expectedPhysicalCount) {
      throw new RangeError('骰盘状态与本次结果不一致，无法重掷。')
    }
    if (result.id === targetId) {
      dice.push(...createActiveSpecs(result, previousSpecs))
      continue
    }
    for (const spec of previousSpecs) {
      const index = previousIndexById.get(spec.id)
      if (index === undefined) throw new RangeError('骰盘状态与本次结果不一致，无法重掷。')
      const offset = (lastFrame * diceCount + index) * 7
      dice.push({
        ...spec,
        staticPose: {
          position: [transforms[offset] ?? 0, transforms[offset + 1] ?? 0, transforms[offset + 2] ?? 0],
          quaternion: [
            transforms[offset + 3] ?? 0,
            transforms[offset + 4] ?? 0,
            transforms[offset + 5] ?? 0,
            transforms[offset + 6] ?? 1,
          ],
          landingDirectionIndex: previous.trajectory.landingDirectionIndices[index] ?? 0,
        },
      })
    }
  }

  return { id: rollId, seed, dice }
}

