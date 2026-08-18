export interface DiceTrayLayout {
  scale: number
  width: number
  depth: number
  halfWidth: number
  halfDepth: number
  wallHeight: number
  spawnPadding: number
}

export interface DiceSpawnCell {
  column: number
  row: number
  x: number
  z: number
  jitterX: number
  jitterZ: number
}

export interface DiceViewState {
  zoomLevel: number
  targetX: number
  targetZ: number
}

const BASE_TRAY_WIDTH = 12
const BASE_TRAY_DEPTH = 8.8
const BASE_DICE_CAPACITY = 6
const MAX_TRAY_SCALE = 1.85
const SPAWN_PADDING = 1.25

export function getDiceTrayLayout(physicalDiceCount: number): DiceTrayLayout {
  const count = Math.max(1, physicalDiceCount)
  const scale = Math.min(MAX_TRAY_SCALE, Math.max(1, Math.sqrt(count / BASE_DICE_CAPACITY)))
  const width = BASE_TRAY_WIDTH * scale
  const depth = BASE_TRAY_DEPTH * scale
  return {
    scale,
    width,
    depth,
    halfWidth: width / 2,
    halfDepth: depth / 2,
    wallHeight: 2,
    spawnPadding: SPAWN_PADDING,
  }
}

export function getDiceSpawnCells(
  physicalDiceCount: number,
  layout = getDiceTrayLayout(physicalDiceCount),
): DiceSpawnCell[] {
  if (physicalDiceCount <= 0) return []
  const columns = Math.min(
    physicalDiceCount,
    Math.ceil(Math.sqrt(physicalDiceCount * layout.width / layout.depth)),
  )
  const rows = Math.ceil(physicalDiceCount / columns)
  const usableWidth = layout.width - layout.spawnPadding * 2
  const usableDepth = layout.depth - layout.spawnPadding * 2
  const cellWidth = usableWidth / columns
  const cellDepth = usableDepth / rows
  const jitterX = Math.min(0.18, cellWidth * 0.1)
  const jitterZ = Math.min(0.18, cellDepth * 0.1)
  const cells: DiceSpawnCell[] = []

  for (let row = 0; row < rows; row += 1) {
    const rowStart = row * columns
    const rowCount = Math.min(columns, physicalDiceCount - rowStart)
    for (let column = 0; column < rowCount; column += 1) {
      cells.push({
        column,
        row,
        x: (column - (rowCount - 1) / 2) * cellWidth,
        z: (row - (rows - 1) / 2) * cellDepth,
        jitterX,
        jitterZ,
      })
    }
  }
  return cells
}

export function getTrayFitDistance(layout: DiceTrayLayout, aspect: number, verticalFovDegrees = 35): number {
  const verticalFov = verticalFovDegrees * Math.PI / 180
  const safeAspect = Math.max(0.1, aspect)
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * safeAspect)
  const limitingFov = Math.min(verticalFov, horizontalFov)
  const boundingRadius = Math.hypot(layout.width, layout.depth) / 2
  return boundingRadius / Math.tan(limitingFov / 2) * 1.08
}

export function clampDiceViewState(layout: DiceTrayLayout, state: DiceViewState): DiceViewState {
  const zoomLevel = Math.min(3, Math.max(1, state.zoomLevel))
  const panRatio = 1 - 1 / zoomLevel
  const maxX = layout.halfWidth * panRatio
  const maxZ = layout.halfDepth * panRatio
  return {
    zoomLevel,
    targetX: Math.min(maxX, Math.max(-maxX, state.targetX)),
    targetZ: Math.min(maxZ, Math.max(-maxZ, state.targetZ)),
  }
}
