import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', '..')
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const matrix = read('docs/需求文档/2014与2024双规则版本支持-B01核验/魔法物品-DMG2024.md')
const mechanismIndex = read('docs/需求文档/2014与2024双规则版本支持-B01核验/魔法物品-机制索引.md')

const cells = (line) => line.split('|').slice(1, -1).map((cell) => cell.trim())
const normalizeEnglish = (value) => value.replaceAll('，', ', ').replaceAll('、', '/').replace(/\s+/g, ' ').trim()

function normalizeCategory(raw) {
  const cleaned = raw.replaceAll('__', '').trim()
  if (!cleaned.includes('（')) return cleaned
  const open = cleaned.indexOf('（')
  const close = cleaned.indexOf('）')
  const inner = close > open ? cleaned.slice(open + 1, close) : cleaned.slice(open + 1)
  return `${cleaned.slice(0, open)}（${inner}）`
}

function categoryFields(raw) {
  const label = normalizeCategory(raw)
  if (label.startsWith('武器')) return { label, category: 'weapon', magicItemCategory: 'weapon', equippable: true }
  if (label.startsWith('护甲')) {
    const inner = label.slice(label.indexOf('（') + 1, label.lastIndexOf('）'))
    if (inner === '盾牌') return { label, category: 'shield', magicItemCategory: undefined, equippable: true }
    return { label, category: 'armor', magicItemCategory: 'armor', equippable: true }
  }
  if (label === '卷轴') return { label, category: 'magic', magicItemCategory: 'scroll', equippable: false }
  if (label === '药水') return { label, category: 'potion', magicItemCategory: 'potion', equippable: false }
  if (label === '戒指') return { label, category: 'magic', magicItemCategory: 'ring', equippable: true }
  if (label === '权杖') return { label, category: 'magic', magicItemCategory: 'rod', equippable: false }
  if (label === '法杖') return { label, category: 'magic', magicItemCategory: 'staff', equippable: true }
  if (label === '魔杖') return { label, category: 'magic', magicItemCategory: 'wand', equippable: true }
  if (label === '奇物') return { label, category: 'magic', magicItemCategory: 'wondrous', equippable: true }
  throw new Error(`未知类别：${raw}`)
}

const RARITY = { 普通: 'common', 珍稀: 'rare', 传说: 'legendary', 神器: 'artifact', 多种稀有度: 'varies' }

function attunementFields(text) {
  if (text === '无需同调') return { attunement: 'none' }
  if (text === '需同调') return { attunement: 'required' }
  if (text === '条件同调') return { attunement: 'conditional' }
  if (text === '施法者同调') return { attunement: 'conditional', attunementCondition: '仅限施法者' }
  throw new Error(`未知同调：${text}`)
}

const SINGLE_ACTION = { 动作: 'action', 附赠动作: 'bonus-action', 反应: 'reaction', 魔法动作: 'magic-action' }

function usageFields(resource, item) {
  const charged = resource.includes('充能')
  const consumable = item.category === 'potion' || item.magicItemCategory === 'scroll' || resource.includes('一次性')
  const recovery = []
  if (resource.includes('黎明恢复')) recovery.push('dawn')
  if (resource.includes('短休恢复')) recovery.push('short-rest')
  if (resource.includes('长休恢复')) recovery.push('long-rest')
  if (!charged && !consumable && recovery.length === 0) return undefined
  return { charged, consumable, recovery }
}

// 矩阵：按运行时 ID 登记物品事实
const items = new Map()
for (const line of matrix.split('\n')) {
  if (!line.startsWith('| MI-')) continue
  const [, name, englishName, runtimeId, category, rarity, attunement, mechanisms, , , status] = cells(line)
  const id = runtimeId.replaceAll('`', '')
  const rarityKey = RARITY[rarity]
  if (!rarityKey) throw new Error(`未知稀有度：${rarity}（${id}）`)
  const categoryInfo = categoryFields(category)
  const hasBonusRange = englishName.includes('+1、+2、+3')
  items.set(id, {
    id,
    name: name.replaceAll('__', '') + (hasBonusRange ? ' +1/+2/+3' : ''),
    englishName: normalizeEnglish(englishName),
    status: status.includes('目标selectable') ? 'selectable' : 'index-only',
    categoryText: categoryInfo.label,
    category: categoryInfo.category,
    magicItemCategory: categoryInfo.magicItemCategory,
    equippable: categoryInfo.equippable,
    rarity: rarityKey,
    rarityText: rarity,
    hasBonusRange,
    ...attunementFields(attunement),
    attunementText: attunement,
    mechanisms,
  })
}

// 机制索引：按运行时 ID 合并动作、数值、资源与状态引用
const usages = new Map()
for (const line of mechanismIndex.split('\n')) {
  if (!line.startsWith('| MI-')) continue
  const [, runtimeId, action, numeric, resource, states] = cells(line)
  const id = runtimeId.replaceAll('`', '')
  if (!items.has(id)) throw new Error(`机制索引存在矩阵未登记的条目：${id}`)
  usages.set(id, { action, numeric, resource, states })
}

const missingUsage = [...items.keys()].filter((id) => !usages.has(id))
if (missingUsage.length > 0) throw new Error(`缺少机制索引：${missingUsage.join(', ')}`)
if (items.size !== 348) throw new Error(`物品数量应为 348，实际 ${items.size}`)

const rows = [...items.values()]
  .sort((left, right) => left.id.localeCompare(right.id))
  .map((item) => {
    const usage = usages.get(item.id)
    const usageRule = usageFields(usage.resource, item)
    const fields = [
      `id:${JSON.stringify(item.id)}`,
      `name:${JSON.stringify(item.name)}`,
      `englishName:${JSON.stringify(item.englishName)}`,
      `ruleset:'5e-2024'`,
      `status:'${item.status}'`,
      `description:${JSON.stringify(descriptionFor(item, usage, usageRule))}`,
      'classIds:[]',
      `equippable:${item.equippable}`,
      `category:'${item.category}'`,
      `rarity:'${item.rarity}'`,
    ]
    if (item.magicItemCategory) fields.push(`magicItemCategory:'${item.magicItemCategory}'`)
    fields.push(`attunement:'${item.attunement}'`)
    if (item.attunementCondition) fields.push(`attunementCondition:${JSON.stringify(item.attunementCondition)}`)
    fields.push(`itemAction:'${SINGLE_ACTION[usage.action] ?? 'varies'}'`)
    if (usageRule) {
      const recovery = usageRule.recovery.map((value) => `'${value}'`).join(', ')
      fields.push(`magicItemUsage:{ charged: ${usageRule.charged}, consumable: ${usageRule.consumable}, recovery: [${recovery}] }`)
    }
    if (usage.states !== '无状态引用') fields.push(`stateReferences:${JSON.stringify(usage.states.split('／'))}`)
    fields.push(`sourceIds:['source-2024-dmg']`)
    return `  { ${fields.join(', ')} },`
  })

function descriptionFor(item, usage, usageRule) {
  const parts = [`2024《城主指南》魔法物品。类别：${item.categoryText}；稀有度：${item.rarityText}；${item.attunementText}。`]
  parts.push(`机制：${item.mechanisms}。`)
  parts.push(`动作：${usage.action}。`)
  const resourceText = usageRule?.consumable && !usage.resource.includes('一次性')
    ? `${usage.resource}（使用时消耗）`
    : usage.resource
  parts.push(`资源：${resourceText}。`)
  if (usage.states !== '无状态引用') parts.push(`状态引用：${usage.states}。`)
  if (usage.numeric !== '无固定数值标记') parts.push(`数值标记：${usage.numeric}。`)
  if (item.hasBonusRange) parts.push('魔法加值 +1／+2／+3 的具体型号需在物品实例中确定。')
  parts.push(item.status === 'index-only' ? '当前为索引条目，未参与自动计算。' : '具体效果以《城主指南（2024）》为准。')
  return parts.join('')
}

const output = `// Generated by scripts/build-magic-items-2024.mjs from the reviewed B01 matrices.
// 数据来源：docs/需求文档/2014与2024双规则版本支持-B01核验/魔法物品-DMG2024.md 与 魔法物品-机制索引.md。
// 只登记结构化事实与原创机制摘要，不复制商业规则正文；效果以《城主指南（2024）》为准。
import type { EquipmentRule } from '@/types/rules'

export const magicItems2024: readonly EquipmentRule[] = [
${rows.join('\n')}
]
`
fs.writeFileSync(path.join(root, 'app/src/rules/data/magic-items-2024.ts'), output)
console.log(`已生成 ${items.size} 条 2024 魔法物品`)
