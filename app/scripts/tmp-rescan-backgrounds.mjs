// 只读排查：全库重扫疑似「背景」页（宽松判据，输出候选供人工对照）。
// 运行：node app/scripts/tmp-rescan-backgrounds.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const index = JSON.parse(readFileSync(new URL('../../.chm_output/DND.26.09.13/index.json', import.meta.url), 'utf8'))
const sections = index.sections ?? []

// 背景页的三类特征（任一组合即入候选）
const hasSkill = (s) => /技能熟练/.test(s)
const hasTool = (s) => /工具熟练/.test(s)
const hasLang = (s) => /语言[：:]/.test(s)
const hasEquip = (s) => /装备[：:]/.test(s)
const hasGold = (s) => /\d+\s?(GP|gp|金币)/.test(s)
const hasFeature = (s) => /特性[：:]/.test(s)
const hasAbility = (s) => /属性值[：:]|属性[：:]/.test(s)
const hasFeat = (s) => /专长[：:]/.test(s)
// 排除明显的怪物数据块：含 AC/HP/速度 等stat block 字段
const looksStatBlock = (s) => /护甲等级|生命值\s*\d|挑战等级|豁免[：:]\s*[+-]?\d/.test(s)

const rows = []
for (const section of sections) {
  const summary = section.summary ?? ''
  if (looksStatBlock(summary)) continue
  const mechanical = (hasSkill(summary) && (hasTool(summary) || hasLang(summary) || hasEquip(summary) || hasFeature(summary) || hasGold(summary)))
    || (hasAbility(summary) && hasFeat(summary))
  if (!mechanical) continue
  const style = hasAbility(summary) || hasFeat(summary) ? '2024' : '2014'
  const pick = (re) => (summary.match(re) ?? [, ''])[1].replace(/\s+/g, ' ').trim()
  rows.push({
    id: section.id,
    title: section.title,
    style,
    skill: pick(/技能熟练项?[：:]\s*([^。]{0,40})/),
    tool: pick(/工具熟练项?[：:]\s*([^。]{0,40})/),
    lang: pick(/语言[：:]\s*([^。]{0,30})/),
    feature: pick(/特性[：:]\s*([^。]{0,30})/),
  })
}

console.log(`全库疑似背景页：${rows.length}`)
for (const row of rows) {
  console.log([String(row.id).padStart(4), row.title.padEnd(18), row.style, row.skill ? '技能[' + row.skill + ']' : '', row.tool ? '工具[' + row.tool + ']' : '', row.lang ? '语言[' + row.lang + ']' : '', row.feature ? '特性[' + row.feature + ']' : ''].filter(Boolean).join(' | '))
}
writeFileSync(new URL('../../tmp/background-rescan.json', import.meta.url), JSON.stringify(rows, null, 1), 'utf8')
