export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

export type PhysicalDieType = Exclude<DieType, 'd100'>

export type RollStatus = 'idle' | 'preparing' | 'rolling' | 'complete' | 'fallback' | 'error'

export type Vector3Tuple = readonly [number, number, number]
export type QuaternionTuple = readonly [number, number, number, number]

export interface DicePoolEntry {
  type: DieType
  quantity: number
}

export interface D100Components {
  tens: number
  ones: number
}

export interface LogicalRollResult {
  id: string
  type: DieType
  value: number
  d100?: D100Components
}

export type PhysicalResultKind = 'standard' | 'percentile-tens' | 'percentile-ones'

export interface PhysicalDieSpec {
  id: string
  logicalId: string
  type: PhysicalDieType
  resultKind: PhysicalResultKind
  targetValue: number
}

export interface RollRequest {
  id: string
  seed: number
  dice: PhysicalDieSpec[]
}

export interface PhysicsTrajectory {
  rollId: string
  diceIds: string[]
  frameRate: number
  frameCount: number
  durationMs: number
  transforms: Float32Array
  landingDirectionIndices: number[]
}

export interface RollPreparation {
  request: RollRequest
  results: LogicalRollResult[]
}

export interface DicePresentation {
  request: RollRequest
  trajectory: PhysicsTrajectory
}

export interface DiceWorkerSuccess {
  type: 'success'
  trajectory: PhysicsTrajectory
}

export interface DiceWorkerFailure {
  type: 'failure'
  rollId: string
  reason: 'cocked' | 'timeout' | 'worker-error'
}

export type DiceWorkerResponse = DiceWorkerSuccess | DiceWorkerFailure

