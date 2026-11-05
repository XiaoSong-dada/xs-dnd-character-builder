import { createPinia, type Pinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DICE_PRESET_STORAGE_KEY, MAX_DICE_PRESETS, DicePresetStorageService } from '@/services/dice-presets'
import { useDiceStore } from '@/stores/dice'
import type { DiceWorkerResponse, RollRequest } from '@/types/dice'
import { useDicePage } from '@/views/dice/hooks/useDicePage'

function successResponse(request: RollRequest): DiceWorkerResponse {
  return {
    type: 'success',
    trajectory: {
      rollId: request.id,
      diceIds: request.dice.map((die) => die.id),
      frameRate: 60,
      frameCount: 1,
      durationMs: 16,
      transforms: new Float32Array(request.dice.length * 7),
      landingDirectionIndices: request.dice.map(() => 0),
    },
  }
}

function mountPage(pinia: Pinia = createPinia()) {
  const component = defineComponent({
    setup() {
      return useDicePage({
        randomUint32: () => 123,
        randomInteger: (minimum) => minimum,
        createWorkerClient: () => ({ simulate: async (request) => successResponse(request), cancel: vi.fn(), terminate: vi.fn() }),
      })
    },
    template: '<div />',
  })
  return mount(component, { global: { plugins: [pinia] } })
}

type DicePage = ReturnType<typeof useDicePage>

function setModifierInput(pinia: Pinia, value: string) {
  useDiceStore(pinia).modifierInput = value
}

describe('dice pool presets', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('保存当前骰池与固定修正值，而不保存投掷结果', async () => {
    const pinia = createPinia()
    const wrapper = mountPage(pinia)
    const page = wrapper.vm as unknown as DicePage
    page.addDie('d20')
    page.addDie('d6')
    setModifierInput(pinia, '5')
    page.setSkipAnimation(true)
    await page.roll()
    expect(page.results).toHaveLength(2)

    page.savePreset()
    expect(page.presets).toHaveLength(1)
    expect(page.presets[0]?.pool).toEqual([{ type: 'd6', quantity: 1 }, { type: 'd20', quantity: 1 }])
    expect(page.presets[0]?.modifier).toBe(5)
    expect(DicePresetStorageService.loadDicePresets()).toHaveLength(1)
    expect(localStorage.getItem(DICE_PRESET_STORAGE_KEY)).not.toContain('"value"')
    expect(page.presetFeedback).toEqual({ target: 'save', message: '已保存预设 1d6 + 1d20 + 5。' })
    wrapper.unmount()
  })

  it('应用预设后替换骰池与修正值、清除上一轮结果并等待手动投掷', async () => {
    const pinia = createPinia()
    const wrapper = mountPage(pinia)
    const page = wrapper.vm as unknown as DicePage
    page.addDie('d20')
    setModifierInput(pinia, '3')
    page.savePreset()
    const presetId = page.presets[0]?.id ?? ''

    page.clearPool()
    page.addDie('d100')
    setModifierInput(pinia, '-2')
    page.setSkipAnimation(true)
    await page.roll()
    expect(page.results).toHaveLength(1)

    page.applyPreset(presetId)
    expect(page.pool).toEqual([{ type: 'd20', quantity: 1 }])
    expect(useDiceStore(pinia).modifierInput).toBe('3')
    expect(useDiceStore(pinia).appliedModifier).toBe(0)
    expect(page.expression).toBe('1d20')
    expect(page.results).toEqual([])
    expect(page.status).toBe('idle')
    expect(page.presetFeedback).toEqual({ target: 'apply', presetId, message: '已应用 1d20 + 3，请手动投掷。' })
    wrapper.unmount()
  })

  it('应用后修改当前骰池或修正值不会改动已保存的预设', () => {
    const pinia = createPinia()
    const wrapper = mountPage(pinia)
    const page = wrapper.vm as unknown as DicePage
    page.addDie('d20')
    setModifierInput(pinia, '2')
    page.savePreset()
    const saved = JSON.parse(JSON.stringify(page.presets[0]))

    page.applyPreset(saved.id)
    page.addDie('d6')
    expect(page.presetFeedback).toBeUndefined()
    setModifierInput(pinia, '9')
    expect(page.presets[0]).toEqual(saved)
    expect(DicePresetStorageService.loadDicePresets()[0]).toEqual(saved)
    wrapper.unmount()
  })

  it('刷新或重新打开页面后仍能读取预设', () => {
    const first = mountPage()
    const page = first.vm as unknown as DicePage
    page.addDie('d20')
    page.savePreset()
    first.unmount()

    const second = mountPage()
    const restored = second.vm as unknown as DicePage
    expect(restored.presets).toHaveLength(1)
    expect(restored.presets[0]?.pool).toEqual([{ type: 'd20', quantity: 1 }])
    second.unmount()
  })

  it('应用预设后按预设的固定修正值结算下一次投掷', async () => {
    const pinia = createPinia()
    const wrapper = mountPage(pinia)
    const page = wrapper.vm as unknown as DicePage
    page.addDie('d20')
    setModifierInput(pinia, '5')
    page.savePreset()
    const presetId = page.presets[0]?.id ?? ''
    page.setSkipAnimation(true)
    page.applyPreset(presetId)
    await page.roll()
    expect(page.presetFeedback).toBeUndefined()
    expect(page.results[0]?.value).toBe(1)
    expect(page.total).toBe(6)
    expect(page.appliedModifier).toBe(5)
    wrapper.unmount()
  })

  it('固定修正值无效时拒绝保存并说明原因', () => {
    const pinia = createPinia()
    const wrapper = mountPage(pinia)
    const page = wrapper.vm as unknown as DicePage
    page.addDie('d20')
    setModifierInput(pinia, 'abc')
    page.savePreset()
    expect(page.presets).toEqual([])
    expect(page.presetFeedback).toMatchObject({ target: 'save', error: true, message: expect.stringContaining('整数') })
    wrapper.unmount()
  })

  it('同一投掷式重复保存时更新原预设而不是新增', () => {
    const wrapper = mountPage()
    const page = wrapper.vm as unknown as DicePage
    page.addDie('d20')
    page.savePreset()
    const firstId = page.presets[0]?.id
    page.savePreset()
    expect(page.presets).toHaveLength(1)
    expect(page.presets[0]?.id).not.toBe(firstId)
    expect(page.presetFeedback).toEqual({ target: 'save', message: '已更新预设 1d20。' })
    wrapper.unmount()
  })

  it('达到预设数量上限后拒绝继续保存', () => {
    const wrapper = mountPage()
    const page = wrapper.vm as unknown as DicePage
    for (let index = 0; index < MAX_DICE_PRESETS; index += 1) {
      page.addDie('d20')
      page.presets.push({ id: `seed-${index}`, pool: [{ type: 'd20', quantity: 1 }], modifier: index, createdAt: index })
    }
    expect(DicePresetStorageService.saveDicePresets(page.presets)).toBe(true)
    page.addDie('d6')
    page.savePreset()
    expect(page.presets).toHaveLength(MAX_DICE_PRESETS)
    expect(page.presetFeedback).toMatchObject({ target: 'save', error: true, message: expect.stringContaining('最多保存 20 条') })
    wrapper.unmount()
  })

  it('存储写入失败时显示保存错误并保留已保存的预设', () => {
    const wrapper = mountPage()
    const page = wrapper.vm as unknown as DicePage
    page.addDie('d20')
    page.savePreset()
    const original = page.presets[0]
    vi.spyOn(DicePresetStorageService, 'saveDicePresets').mockReturnValue(false)
    page.savePreset()
    expect(page.presets).toEqual([original])
    expect(page.presetFeedback).toEqual({
      target: 'save', error: true, message: '预设保存失败，浏览器本地存储不可用。',
    })
    wrapper.unmount()
  })

  it('删除预设后立即写入浏览器存储', () => {
    const wrapper = mountPage()
    const page = wrapper.vm as unknown as DicePage
    page.addDie('d20')
    page.savePreset()
    const presetId = page.presets[0]?.id ?? ''
    page.deletePreset(presetId)
    expect(page.presets).toEqual([])
    expect(DicePresetStorageService.loadDicePresets()).toEqual([])
    expect(page.presetFeedback).toEqual({ target: 'delete', message: '已删除预设。' })
    wrapper.unmount()
  })

  it('投掷中不允许保存或应用预设', async () => {
    let release: ((response: DiceWorkerResponse) => void) | undefined
    const component = defineComponent({
      setup() {
        return useDicePage({
          randomUint32: () => 1,
          randomInteger: (minimum) => minimum,
          createWorkerClient: () => ({
            simulate: (request) => new Promise((resolve) => { release = () => resolve(successResponse(request)) }),
            cancel: vi.fn(),
            terminate: vi.fn(),
          }),
        })
      },
      template: '<div />',
    })
    const wrapper = mount(component, { global: { plugins: [createPinia()] } })
    const page = wrapper.vm as unknown as DicePage
    page.addDie('d20')
    page.savePreset()
    const presetId = page.presets[0]?.id ?? ''
    const rolling = page.roll()
    expect(page.isBusy).toBe(true)
    page.applyPreset(presetId)
    page.savePreset()
    expect(page.pool).toEqual([{ type: 'd20', quantity: 1 }])
    expect(page.presets).toHaveLength(1)
    release?.(successResponse({ id: page.presentation?.request.id ?? 'pending', seed: 1, dice: [] }))
    await rolling
    wrapper.unmount()
  })
})
