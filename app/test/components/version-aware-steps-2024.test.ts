import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import { rulesRepository as rulesRepository2014 } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import AddManualSpellModal from '@/views/character-builder/components/AddManualSpellModal.vue'
import ClassStep from '@/views/character-builder/components/ClassStep.vue'
import FeatChoicePanel from '@/views/character-builder/components/FeatChoicePanel.vue'
import SourcesStep from '@/views/character-builder/components/SourcesStep.vue'
import { draft2024 } from '../fixtures/draft-2024'

vi.mock('@/rules/item-catalog-loader', async () => {
  const { magicItemsCatalog2014 } = await import('@/rules/data/generated/magic-items-catalog-2014')
  return { loadItemCatalog: vi.fn(() => Promise.resolve(magicItemsCatalog2014)), resetItemCatalogCache: vi.fn() }
})

describe('B09-02 各步骤按草稿版本解析', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => vi.useRealTimers())

  it('ClassStep 按版本列出职业并发出对应版本 ID', async () => {
    vi.useFakeTimers()
    const modern = mount(ClassStep, { props: { ruleset: '5e-2024', enabledSourceIds: [] } })
    const modernCards = modern.findAll('.expandable-option-card')
    expect(modernCards).toHaveLength(12)
    await modernCards.find((card) => card.get('strong').text() === '战士')!.find('.expandable-option-card__main').trigger('click')
    vi.advanceTimersByTime(400)
    expect(modern.emitted('select')).toEqual([['class-2024-fighter']])

    const withUa = mount(ClassStep, { props: { ruleset: '5e-2024', enabledSourceIds: ['source-2024-ua-eberron'] } })
    expect(withUa.findAll('.expandable-option-card')).toHaveLength(13)
    expect(withUa.text()).toContain('奇械师')

    const legacy = mount(ClassStep, { props: { ruleset: '5e-2014' } })
    expect(legacy.findAll('.expandable-option-card')).toHaveLength(rulesRepository2014.classes.length)
    await legacy.findAll('.expandable-option-card').find((card) => card.get('strong').text() === '战士')!.find('.expandable-option-card__main').trigger('click')
    vi.advanceTimersByTime(400)
    expect(legacy.emitted('select')).toEqual([['class-2014-fighter']])
  })

  it('SourcesStep 在 2024 展示游玩测试来源，2014 保留扩展书开关', () => {
    const modern = mount(SourcesStep, { props: { selected: [], ruleset: '5e-2024' } })
    expect(modern.text()).toContain('玩家手册（2024）')
    expect(modern.text()).toContain('破解奥秘为游玩测试内容')
    expect(modern.text()).toContain('全部启用')
    // 来源数量随批次增长（G 批次新增第三方来源），按「至少覆盖既有 17 条」断言。
    expect(modern.findAll('.ui-chip').length).toBeGreaterThanOrEqual(17)
    expect(modern.findAll('.ui-chip--selected')).toHaveLength(0)

    const legacy = mount(SourcesStep, { props: { selected: [] } })
    expect(legacy.text()).toContain('全部启用')
    expect(legacy.findAll('.ui-chip').length).toBeGreaterThan(0)
  })

  it('FeatChoicePanel 使用草稿版本专长目录', () => {
    const modern = mount(FeatChoicePanel, {
      props: { checkpointId: 'fighter-2024-fighting-style', checkpointLevel: 1, draft: draft2024({ classId: 'class-2024-fighter' }), allowAbilityImprovement: false },
    })
    expect(modern.text()).toContain(`2024 ·`)
    expect(modern.text()).toContain(`${rulesRepository2024.feats.length}`)

    const legacyDraft = { ...draft2024({ classId: 'class-2024-fighter' }), ruleset: '5e-2014' as const, classId: 'class-2014-fighter' }
    const legacy = mount(FeatChoicePanel, {
      props: { checkpointId: 'fighter-2014-style-1', checkpointLevel: 1, draft: legacyDraft, allowAbilityImprovement: false },
    })
    expect(legacy.text()).toContain(`${rulesRepository2014.feats.length}`)
    expect(legacy.text()).toContain('2014 ·')
  })

  it('AddManualSpellModal 按版本提供法术候选', () => {
    const modern = mount(AddManualSpellModal, { props: { open: true, existingIds: [], ruleset: '5e-2024' }, attachTo: document.body })
    expect(document.body.textContent).toContain('四象法门')
    modern.unmount()
    document.body.innerHTML = ''

    const legacy = mount(AddManualSpellModal, { props: { open: true, existingIds: [] }, attachTo: document.body })
    expect(document.body.textContent).toContain('魔法飞弹')
    expect(document.body.textContent).not.toContain('四象法门')
    legacy.unmount()
    document.body.innerHTML = ''
  })

  it('导出模型按 2024 草稿解析身份与专长', () => {
    const draft = draft2024({ classId: 'class-2024-fighter', raceId: 'species-2024-human', backgroundId: 'background-2024-soldier' })
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    expect(model.identity.className).toBe('战士')
    expect(model.identity.raceName).toContain('人类')
    expect(model.diagnostics.filter((item) => item.code === 'missing-rule-data')).toHaveLength(0)
  })
})
