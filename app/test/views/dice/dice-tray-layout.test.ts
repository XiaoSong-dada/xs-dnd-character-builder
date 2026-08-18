import { describe, expect, it } from 'vitest'

import {
  clampDiceViewState,
  getDiceSpawnCells,
  getDiceTrayLayout,
  getTrayFitDistance,
} from '@/views/dice/engine/dice-tray-layout'

describe('dice tray layout', () => {
  it.each([1, 6])('keeps the base tray size for %i physical dice', (count) => {
    expect(getDiceTrayLayout(count)).toMatchObject({ scale: 1, width: 12, depth: 8.8 })
  })

  it('grows monotonically and remains capped for a full tray', () => {
    const scales = [1, 6, 7, 12, 20].map((count) => getDiceTrayLayout(count).scale)
    expect(scales).toEqual([...scales].sort((left, right) => left - right))
    expect(scales[2]).toBeCloseTo(Math.sqrt(7 / 6))
    expect(scales[3]).toBeCloseTo(Math.sqrt(2))
    expect(scales[4]).toBeCloseTo(Math.sqrt(20 / 6))
    expect(scales[4]).toBeLessThanOrEqual(1.85)
  })

  it.each([1, 6, 7, 12, 20])('places %i spawn cells inside the safe tray area', (count) => {
    const layout = getDiceTrayLayout(count)
    const cells = getDiceSpawnCells(count, layout)
    expect(cells).toHaveLength(count)
    for (const cell of cells) {
      expect(Math.abs(cell.x) + cell.jitterX).toBeLessThanOrEqual(layout.halfWidth - layout.spawnPadding)
      expect(Math.abs(cell.z) + cell.jitterZ).toBeLessThanOrEqual(layout.halfDepth - layout.spawnPadding)
    }
  })

  it('centers an incomplete final row', () => {
    const finalRow = getDiceSpawnCells(9).filter((cell) => cell.row === 2)
    expect(finalRow).toHaveLength(1)
    expect(finalRow[0]?.x).toBe(0)
  })

  it('fits narrower viewports farther away and clamps zoom and pan', () => {
    const layout = getDiceTrayLayout(20)
    expect(getTrayFitDistance(layout, 0.5)).toBeGreaterThan(getTrayFitDistance(layout, 1))
    expect(clampDiceViewState(layout, { zoomLevel: 1, targetX: 100, targetZ: -100 }))
      .toEqual({ zoomLevel: 1, targetX: 0, targetZ: -0 })
    const zoomed = clampDiceViewState(layout, { zoomLevel: 9, targetX: 100, targetZ: -100 })
    expect(zoomed.zoomLevel).toBe(3)
    expect(zoomed.targetX).toBeCloseTo(layout.halfWidth * 2 / 3)
    expect(zoomed.targetZ).toBeCloseTo(-layout.halfDepth * 2 / 3)
  })
})
