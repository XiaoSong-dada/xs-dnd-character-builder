import { describe, expect, it } from 'vitest'

import { emptyBundle } from '@/rules/custom-content'
import { CustomContentStorageService } from '@/services/custom-content-storage'
import type { CustomContentState, CustomExpansion, CustomSubclassEntry } from '@/types/custom-content'

const NOW = '2026-11-02T00:00:00.000Z'
const SOURCE = 'source-custom-test'

function expansion(): CustomExpansion {
  return {
    id: SOURCE,
    ruleset: '5e-2014',
    title: '工坊测试书',
    shortTitle: '工坊',
    defaultEnabled: true,
    createdAt: NOW,
    updatedAt: NOW,
  }
}

function subclass(): CustomSubclassEntry {
  return {
    kind: 'subclass',
    id: 'custom-subclass-1',
    expansionId: SOURCE,
    ruleset: '5e-2014',
    name: '工坊子职',
    englishName: 'Workshop Subclass',
    summary: '自制子职',
    description: '说明',
    createdAt: NOW,
    updatedAt: NOW,
    classId: 'class-2014-wizard',
    selectionLevel: 2,
    features: [{ id: 'feature-1', name: '特性', level: 2, summary: '摘要', description: '说明' }],
  }
}

function stateWithSubclass(): CustomContentState {
  return {
    '5e-2014': {
      ...emptyBundle(),
      expansions: [expansion()],
      subclasses: [subclass()],
    },
    '5e-2024': emptyBundle(),
  }
}

describe('内容工坊存储：子职与旧备份', () => {
  it('导出后再导入保留子职', () => {
    const json = CustomContentStorageService.exportJson(stateWithSubclass(), 'all')
    const imported = CustomContentStorageService.importJson(json)
    const restored = imported.state['5e-2014'].subclasses[0]

    expect(restored).toMatchObject({
      id: 'custom-subclass-1',
      classId: 'class-2014-wizard',
      selectionLevel: 2,
    })
    expect(restored?.features).toHaveLength(1)
  })

  it('旧备份缺少 subclasses 字段时归一化为空数组', () => {
    const raw = JSON.stringify({
      version: 1,
      rulesets: {
        '5e-2014': {
          version: 1,
          expansions: [expansion()],
          feats: [{
            id: 'custom-feat-1',
            expansionId: SOURCE,
            ruleset: '5e-2014',
            name: '旧专长',
            englishName: 'Old Feat',
            summary: '摘要',
            description: '说明',
            createdAt: NOW,
            updatedAt: NOW,
          }],
        },
      },
    })
    const imported = CustomContentStorageService.importJson(raw)

    expect(imported.state['5e-2014'].subclasses).toEqual([])
    expect(imported.state['5e-2014'].feats).toHaveLength(1)
  })
})
