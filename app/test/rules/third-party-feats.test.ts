import { describe, expect, it } from 'vitest'

import { rulesRepository2014 } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { feats2014 } from '@/rules/data/feats-2014'
import type { FeatCategory, FeatRule } from '@/types/rules'

/**
 * G3-I4：第三方合作专长。
 *
 * 登记口径见各模块头注释：只登记选择与展示所需元数据 + 原创中文摘要（`selectable`），
 * 效果不进入自动计算；来源为第三方合作内容，默认关闭、需 DM 同意。
 *
 * 断言按「每书下界 + 覆盖度」编写，新批次追加条目时无需改测试；
 * 新增书目时在 `groups` 表里加一行。
 */
interface GroupCase {
  readonly label: string
  readonly ruleset: '5e-2014' | '5e-2024'
  readonly sourceId: string
  readonly idPrefix: string
  readonly minimum: number
  readonly sampleNames: readonly string[]
}

const groups: readonly GroupCase[] = [
  { label: '胧忆岛', ruleset: '5e-2014', sourceId: 'tp-obojima-index', idPrefix: 'feat-2014-tp-obojima-', minimum: 20, sampleNames: ['回旋镖专家', '魔女盟誓', '轻度侵蚀', '沼地探索者'] },
  { label: '谦卑林', ruleset: '5e-2014', sourceId: 'tp-humblewood-index', idPrefix: 'feat-2014-tp-hw-', minimum: 7, sampleNames: ['飞翔专家', '空中堡垒', '林木之睿'] },
  { label: '谦卑林故事集', ruleset: '5e-2014', sourceId: 'tp-humblewood-tales-index', idPrefix: 'feat-2014-tp-hwt-', minimum: 3, sampleNames: ['炎焱觉者', '森木贤者', '植物缮者'] },
  { label: '塔尔多雷', ruleset: '5e-2014', sourceId: 'tp-taldorei-index', idPrefix: 'feat-2014-tp-tal-', minimum: 7, sampleNames: ['残酷', '秘法汇流', '生命献祭'] },
  { label: '鬼魅幽谷', ruleset: '5e-2014', sourceId: 'tp-grim-hollow-index', idPrefix: 'feat-2014-tp-gh-', minimum: 2, sampleNames: ['高明工匠', '谨慎工匠'] },
  { label: '火炬光下的克苏鲁', ruleset: '5e-2024', sourceId: 'source-2024-tp-cthulhu-torchlight', idPrefix: 'feat-2024-tp-cbt-', minimum: 5, sampleNames: ['我曾斗战而归', '我曾幸存以述'] },
  { label: 'Beyond Drops', ruleset: '5e-2024', sourceId: 'source-2024-tp-beyond-drops', idPrefix: 'feat-2024-tp-bd-', minimum: 4, sampleNames: ['集群战斗', '俯卧战斗', '移形斗士', '战术斗士'] },
  { label: '歪曲之月（通用）', ruleset: '5e-2024', sourceId: 'source-2024-tp-crooked-moon', idPrefix: 'feat-2024-tp-cm-', minimum: 2, sampleNames: ['拒绝死亡', '迅捷巫术'] },
  { label: '斯坦哈德（通用）', ruleset: '5e-2024', sourceId: 'source-2024-tp-steinhardt', idPrefix: 'feat-2024-tp-sh-', minimum: 2, sampleNames: ['暴徒', '炮手'] },
  { label: '瓦尔达的秘密尖塔', ruleset: '5e-2024', sourceId: 'source-2024-tp-valdas-spire', idPrefix: 'feat-2024-tp-vss-', minimum: 13, sampleNames: ['残暴之握', '铁血英雄', '魔法技师', '神射吉运'] },
  { label: '吸血鬼：避世潜藏（血族／恩惠）', ruleset: '5e-2024', sourceId: 'source-2024-tp-vtm', idPrefix: 'feat-2024-tp-vtm-', minimum: 17, sampleNames: ['血吻', '血律研习', '至高血律研习', '世代传承之恩惠'] },
]

const repoOf = (ruleset: GroupCase['ruleset']) => (ruleset === '5e-2014' ? rulesRepository2014 : rulesRepository2024)

const featsOf = (group: GroupCase): readonly FeatRule[] =>
  repoOf(group.ruleset).feats.filter((feat) => feat.id.startsWith(group.idPrefix))

describe('G3-I4 第三方专长', () => {
  it.each(groups)('$label 已登记且字段完整', (group) => {
    const feats = featsOf(group)
    expect(feats.length, `${group.label} 条数下界`).toBeGreaterThanOrEqual(group.minimum)
    for (const feat of feats) {
      expect(feat.ruleset, feat.id).toBe(group.ruleset)
      expect(feat.sourceIds, feat.id).toContain(group.sourceId)
      expect(feat.status, feat.id).toBe('selectable')
      expect(feat.name.length, feat.id).toBeGreaterThan(1)
      expect(feat.englishName.length, feat.id).toBeGreaterThan(1)
      expect(feat.description.length, feat.id).toBeGreaterThan(10)
      expect(feat.detail.length, feat.id).toBeGreaterThan(40)
      expect(Array.isArray(feat.tags), feat.id).toBe(true)
    }
    expect(feats.map((feat) => feat.name)).toEqual(expect.arrayContaining([...group.sampleNames]))
  })

  it('全部第三方专长 ID 唯一，且 2014 条目不带 category、2024 条目带合法 category', () => {
    const categories = new Set<FeatCategory>(['origin', 'general', 'fighting-style', 'epic-boon', 'dragonmark', 'wild-talent', 'dark-gift', 'bloodline'])
    const thirdParty2014 = rulesRepository2014.feats.filter((feat) => feat.id.startsWith('feat-2014-tp-'))
    const thirdParty2024 = rulesRepository2024.feats.filter((feat) => feat.id.startsWith('feat-2024-tp-'))
    expect(thirdParty2014.length).toBeGreaterThanOrEqual(32)
    expect(thirdParty2024.length).toBeGreaterThanOrEqual(25)
    for (const feat of thirdParty2014) expect(feat.category, feat.id).toBeUndefined()
    for (const feat of thirdParty2024) {
      expect(feat.category, feat.id).toBeDefined()
      expect(categories.has(feat.category as FeatCategory), `${feat.id} → ${feat.category}`).toBe(true)
    }
    const allIds = [...rulesRepository2014.feats, ...rulesRepository2024.feats].map((feat) => feat.id)
    expect(new Set(allIds).size).toBe(allIds.length)
  })

  it('2014 专长目录通过 feats2014 汇总对外暴露（含第三方条目）', () => {
    for (const group of groups.filter((item) => item.ruleset === '5e-2014')) {
      for (const feat of featsOf(group)) {
        expect(feats2014.some((item) => item.id === feat.id), feat.id).toBe(true)
        expect(rulesRepository2014.getFeat(feat.id)?.id, feat.id).toBe(feat.id)
        expect(rulesRepository2014.getOption(feat.id)?.id, feat.id).toBe(feat.id)
      }
    }
  })

  it('2024 第三方专长可从仓库解析，并保留来源门槛', () => {
    for (const group of groups.filter((item) => item.ruleset === '5e-2024')) {
      for (const feat of featsOf(group)) {
        expect(rulesRepository2024.getFeat(feat.id)?.id, feat.id).toBe(feat.id)
        const source = rulesRepository2024.sources.find((item) => item.id === group.sourceId)
        expect(source, group.sourceId).toBeDefined()
        expect(source?.defaultEnabled, group.sourceId).toBe(false)
      }
    }
  })
})
