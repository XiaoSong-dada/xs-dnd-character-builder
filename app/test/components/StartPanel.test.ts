import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import StartPanel from '@/views/character-builder/components/StartPanel.vue'
import type { CharacterDraft } from '@/types/character'

const mockConfig = vi.hoisted(() => ({
  siteConfig: { authorName: '小宋哒哒', githubUrl: 'https://github.com/XiaoSong-dada', version: '0.1.0' },
}))
vi.mock('@/config/site', () => mockConfig)

const draft: CharacterDraft = {
  schemaVersion: 4,
  id: 'draft-delete-test',
  ruleset: '5e-2014',
  createdAt: '',
  updatedAt: '',
  targetLevel: 3,
  abilityMethod: 'standard-array',
  preferences: [],
  raceAbilityChoices: [],
  backgroundSkillIds: [],
  backgroundToolIds: [],
  languages: [],
  proficiencyReplacements: [],
  baseAbilities: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  selections: [],
  startingEquipmentSelections: [],
  inventory: [],
  currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  adventureGold: 0,
  equipmentNeedsReview: false,
  spellSelections: { cantripIds: [], knownSpellIds: [], preparedSpellIds: [], spellbookSpellIds: [], transcribedSpellIds: [] },
  name: '阿尔文',
  alignment: '',
  notes: '',
  currentStep: 'origin',
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('StartPanel draft deletion', () => {
  it('requires confirmation before emitting delete', async () => {
    const wrapper = mount(StartPanel, {
      props: { drafts: [draft], legacyDrafts: [] },
      attachTo: document.body,
    })

    await wrapper.get('[aria-label="删除角色 阿尔文"]').trigger('click')
    expect(wrapper.emitted('delete')).toBeUndefined()
    expect(document.body.textContent).toContain('此操作无法撤销')

    const confirmButton = Array.from(document.body.querySelectorAll('button'))
      .find((button) => button.textContent?.trim() === '确认删除')
    expect(confirmButton).toBeTruthy()
    confirmButton?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('delete')).toEqual([['draft-delete-test']])
  })
})

describe('StartPanel 角色条信息展示', () => {
  function sheetWithClass(): CharacterDraft {
    return { ...draft, classId: 'class-2014-fighter', currentStep: 'sheet' }
  }

  it('完成态（sheet）显示职业名，不出现英文步骤 ID', () => {
    const wrapper = mount(StartPanel, { props: { drafts: [sheetWithClass()], legacyDrafts: [] } })

    expect(wrapper.text()).toContain('3级 · 战士')
    expect(wrapper.text()).not.toContain('sheet')
  })

  it('进行中已选职业显示"职业 · 第N步"', () => {
    const inProgress = { ...draft, classId: 'class-2014-fighter' }
    const wrapper = mount(StartPanel, { props: { drafts: [inProgress], legacyDrafts: [] } })

    expect(wrapper.text()).toContain('3级 · 战士 · 第4步')
    expect(wrapper.text()).not.toContain('origin')
  })

  it('进行中未选职业显示"第N步 · 步骤名"', () => {
    const wrapper = mount(StartPanel, { props: { drafts: [draft], legacyDrafts: [] } })

    expect(wrapper.text()).toContain('3级 · 第4步 · 确定角色起源')
    expect(wrapper.text()).not.toContain('origin')
  })

  it('职业查询不到时回退：完成态显示"角色完成"', () => {
    const unknownClass = { ...draft, classId: 'class-2014-unknown', currentStep: 'sheet' }
    const wrapper = mount(StartPanel, { props: { drafts: [unknownClass], legacyDrafts: [] } })

    expect(wrapper.text()).toContain('3级 · 角色完成')
    expect(wrapper.text()).not.toContain('sheet')
  })
})

describe('StartPanel hero 署名行', () => {
  beforeEach(() => {
    mockConfig.siteConfig.authorName = '小宋哒哒'
    mockConfig.siteConfig.githubUrl = 'https://github.com/XiaoSong-dada'
    mockConfig.siteConfig.version = '0.1.0'
  })

  it('配置齐全时显示作者、GitHub 链接与版本', () => {
    const wrapper = mount(StartPanel, { props: { drafts: [draft], legacyDrafts: [] } })

    expect(wrapper.text()).toContain('由 小宋哒哒 制作')
    expect(wrapper.text()).toContain('v0.1.0')
    const link = wrapper.get('.start-panel__signature-link')
    expect(link.attributes('href')).toBe('https://github.com/XiaoSong-dada')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toContain('noopener')
    expect(link.attributes('rel')).toContain('noreferrer')
  })

  it('部分配置时对应段省略', () => {
    mockConfig.siteConfig.githubUrl = undefined
    mockConfig.siteConfig.version = undefined
    const wrapper = mount(StartPanel, { props: { drafts: [draft], legacyDrafts: [] } })

    expect(wrapper.text()).toContain('由 小宋哒哒 制作')
    expect(wrapper.text()).not.toContain('GitHub')
    expect(wrapper.text()).not.toContain('v0.1.0')
  })

  it('全部未配置时署名行不渲染且无 GitHub 链接', () => {
    mockConfig.siteConfig.authorName = undefined
    mockConfig.siteConfig.githubUrl = undefined
    mockConfig.siteConfig.version = undefined
    const wrapper = mount(StartPanel, { props: { drafts: [draft], legacyDrafts: [] } })

    expect(wrapper.find('.start-panel__signature').exists()).toBe(false)
    expect(wrapper.find('a[href*="github"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('GitHub')
  })
})
