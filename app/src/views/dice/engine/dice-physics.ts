import {
  Body,
  ContactMaterial,
  ConvexPolyhedron,
  GSSolver,
  Material,
  Plane,
  Quaternion,
  SAPBroadphase,
  Vec3,
  World,
} from 'cannon-es'

import type { DiceWorkerResponse, PhysicalDieSpec, PhysicsTrajectory, RollRequest, Vector3Tuple } from '@/types/dice'
import { DIE_DEFINITIONS } from '@/views/dice/engine/dice-definitions'
import type { DiceSpawnCell } from '@/views/dice/engine/dice-tray-layout'
import { getDiceSpawnCells, getDiceTrayLayout } from '@/views/dice/engine/dice-tray-layout'

const FRAME_RATE = 60
const MAX_FRAMES = 8 * FRAME_RATE
const MAX_ATTEMPTS = 3
const UPWARD_THRESHOLD = 0.906
const DIRECTION_MARGIN = 0.05

function createPrng(seed: number) {
  let state = seed >>> 0 || 0x9e37_79b9
  return () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 0x1_0000_0000
  }
}

function randomBetween(random: () => number, minimum: number, maximum: number): number {
  return minimum + (maximum - minimum) * random()
}

function createWorld(physicalDiceCount: number) {
  const layout = getDiceTrayLayout(physicalDiceCount)
  const solver = new GSSolver()
  solver.iterations = 12
  const world = new World({ gravity: new Vec3(0, -9.82, 0), allowSleep: true, solver })
  world.broadphase = new SAPBroadphase(world)

  const diceMaterial = new Material('dice')
  const trayMaterial = new Material('tray')
  world.defaultContactMaterial.friction = 0.35
  world.defaultContactMaterial.restitution = 0.45
  world.addContactMaterial(new ContactMaterial(diceMaterial, trayMaterial, {
    friction: 0.35,
    restitution: 0.45,
  }))
  world.addContactMaterial(new ContactMaterial(diceMaterial, diceMaterial, {
    friction: 0.28,
    restitution: 0.38,
  }))

  const floor = new Body({ mass: 0, material: trayMaterial, shape: new Plane() })
  floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  world.addBody(floor)

  const walls: Array<{ position: Vector3Tuple; rotation: Vector3Tuple }> = [
    { position: [-layout.halfWidth, layout.wallHeight, 0], rotation: [0, Math.PI / 2, 0] },
    { position: [layout.halfWidth, layout.wallHeight, 0], rotation: [0, -Math.PI / 2, 0] },
    { position: [0, layout.wallHeight, -layout.halfDepth], rotation: [0, 0, 0] },
    { position: [0, layout.wallHeight, layout.halfDepth], rotation: [0, Math.PI, 0] },
  ]
  for (const wall of walls) {
    const body = new Body({ mass: 0, material: trayMaterial, shape: new Plane() })
    body.position.set(...wall.position)
    body.quaternion.setFromEuler(...wall.rotation)
    world.addBody(body)
  }

  return { world, diceMaterial, layout }
}

function getLandingDirection(body: Body, directions: readonly Vector3Tuple[]) {
  const scores = directions.map((direction, index) => {
    const worldDirection = body.quaternion.vmult(new Vec3(...direction))
    return { index, score: worldDirection.y }
  }).sort((left, right) => right.score - left.score)
  const first = scores[0]
  const second = scores[1]
  if (!first || !second) return undefined
  if (first.score < UPWARD_THRESHOLD || first.score - second.score < DIRECTION_MARGIN) return undefined
  return first.index
}

function createDieShape(type: PhysicalDieSpec['type']): ConvexPolyhedron {
  const definition = DIE_DEFINITIONS[type]
  return new ConvexPolyhedron({
    vertices: definition.vertices.map((vertex) => new Vec3(
      vertex[0] * definition.radius,
      vertex[1] * definition.radius,
      vertex[2] * definition.radius,
    )),
    faces: definition.faces,
  })
}

/** 重掷时让活动骰子从离静止骰子最远的出生格落下，尽量避免一出生就与旧骰子重叠。 */
function pickSpawnCells(
  cells: readonly DiceSpawnCell[],
  staticPositions: readonly Vector3Tuple[],
  count: number,
): DiceSpawnCell[] {
  if (staticPositions.length === 0) return cells.slice(0, count)
  const available = [...cells]
  const chosen: DiceSpawnCell[] = []
  for (let index = 0; index < count && available.length > 0; index += 1) {
    let bestIndex = 0
    let bestDistance = -1
    available.forEach((cell, cellIndex) => {
      const distance = Math.min(...staticPositions.map(([x, , z]) => Math.hypot(cell.x - x, cell.z - z)))
      if (distance > bestDistance) {
        bestDistance = distance
        bestIndex = cellIndex
      }
    })
    const cell = available.splice(bestIndex, 1)[0]
    if (cell) chosen.push(cell)
  }
  return chosen
}

function runAttempt(request: RollRequest, attempt: number): PhysicsTrajectory | 'timeout' | 'cocked' {
  const random = createPrng((request.seed + attempt * 0x9e37_79b9) >>> 0)
  const { world, diceMaterial, layout } = createWorld(request.dice.length)
  const spawnCells = getDiceSpawnCells(request.dice.length, layout)
  const hasStaticDice = request.dice.some((die) => Boolean(die.staticPose))
  const staticPositions = request.dice.flatMap((die) => die.staticPose ? [die.staticPose.position] : [])
  const activeDice = request.dice.filter((die) => !die.staticPose)
  if (activeDice.length === 0) return 'cocked'
  const activeSpawnCells = pickSpawnCells(spawnCells, staticPositions, activeDice.length)
  const spawnCellById = new Map<string, DiceSpawnCell>()
  if (hasStaticDice) {
    activeDice.forEach((die, index) => {
      const cell = activeSpawnCells[index]
      if (cell) spawnCellById.set(die.id, cell)
    })
  } else {
    request.dice.forEach((die, index) => {
      const cell = spawnCells[index]
      if (cell) spawnCellById.set(die.id, cell)
    })
  }

  const bodies = request.dice.map((die) => {
    const body = new Body({
      mass: die.staticPose ? 0 : 1,
      material: diceMaterial,
      shape: createDieShape(die.type),
      linearDamping: 0.2,
      angularDamping: 0.3,
      allowSleep: true,
      sleepSpeedLimit: 0.22,
      sleepTimeLimit: 0.4,
    })
    if (die.staticPose) {
      body.position.set(...die.staticPose.position)
      body.quaternion.set(...die.staticPose.quaternion)
      world.addBody(body)
      return body
    }
    const spawnCell = spawnCellById.get(die.id)
    body.position.set(
      (spawnCell?.x ?? 0) + randomBetween(random, -(spawnCell?.jitterX ?? 0), spawnCell?.jitterX ?? 0),
      randomBetween(random, 3.4, 4.2),
      (spawnCell?.z ?? 0) + randomBetween(random, -(spawnCell?.jitterZ ?? 0), spawnCell?.jitterZ ?? 0),
    )
    const initialQuaternion = new Quaternion()
    initialQuaternion.setFromEuler(
      randomBetween(random, 0, Math.PI * 2),
      randomBetween(random, 0, Math.PI * 2),
      randomBetween(random, 0, Math.PI * 2),
    )
    body.quaternion.copy(initialQuaternion)
    const horizontalAngle = randomBetween(random, 0, Math.PI * 2)
    const horizontalSpeed = randomBetween(random, 1.2, 3.2)
    body.velocity.set(
      Math.cos(horizontalAngle) * horizontalSpeed,
      randomBetween(random, 2.5, 5),
      Math.sin(horizontalAngle) * horizontalSpeed,
    )
    body.angularVelocity.set(
      randomBetween(random, -13, 13),
      randomBetween(random, -13, 13),
      randomBetween(random, -13, 13),
    )
    world.addBody(body)
    return body
  })
  const activeBodies = bodies.filter((_, index) => !request.dice[index]?.staticPose)

  const frames: number[] = []
  let sleepingFrames = 0
  let frameCount = 0

  for (let frame = 0; frame < MAX_FRAMES; frame += 1) {
    world.step(1 / FRAME_RATE)
    for (const body of bodies) {
      frames.push(
        body.position.x, body.position.y, body.position.z,
        body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w,
      )
    }
    frameCount += 1
    if (frame > 30 && activeBodies.every((body) => body.sleepState === Body.SLEEPING)) sleepingFrames += 1
    else sleepingFrames = 0
    if (sleepingFrames >= 30) break
  }

  if (sleepingFrames < 30) return 'timeout'
  const landingDirectionIndices = bodies.map((body, index) => {
    const die = request.dice[index]
    if (die?.staticPose) return die.staticPose.landingDirectionIndex
    return die ? getLandingDirection(body, DIE_DEFINITIONS[die.type].resultDirections) : undefined
  })
  if (landingDirectionIndices.some((index) => index === undefined)) return 'cocked'

  return {
    rollId: request.id,
    diceIds: request.dice.map((die) => die.id),
    frameRate: FRAME_RATE,
    frameCount,
    durationMs: frameCount / FRAME_RATE * 1000,
    transforms: new Float32Array(frames),
    landingDirectionIndices: landingDirectionIndices as number[],
  }
}

export function simulateDiceRoll(request: RollRequest): DiceWorkerResponse {
  let lastReason: 'cocked' | 'timeout' = 'timeout'
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const attemptResult = runAttempt(request, attempt)
    if (typeof attemptResult !== 'string') return { type: 'success', trajectory: attemptResult }
    lastReason = attemptResult
  }
  return { type: 'failure', rollId: request.id, reason: lastReason }
}
