/**
 * 构建期物品目录生成脚本（批次 6）
 *
 * 输入：
 *   - docs/equipment/5e-2014/magic-items/*.md    15 份 DMG 2014 A–Z/神器目录（表格：中文名/英文名/稀有度/类型/效果摘要（原创转述）/状态）
 *   - docs/equipment/5e-2014/expansions/*.md     2 份 ERftLW、EGtW 扩展目录（表格：中文名/英文名/元数据/来源）
 *   - src/rules/data/dmg-attunement-table.json   同调审计表（与运行时共享的静态数据）
 *
 * 输出（类型化 TS，纳入 vue-tsc 校验；提交进仓库）：
 *   - src/rules/data/generated/magic-items-catalog-index-2014.ts
 *       目录条目轻量投影（description 为空串），静态装配进最小运行时索引
 *   - src/rules/data/generated/magic-items-catalog-2014.ts
 *       目录条目完整数据（含 description），由“添加物品”弹窗首次打开时动态 import
 *
 * 运行时不再解析任何 Markdown；Markdown 只作为开发维护、核对与审计文档。
 * 修改 Markdown 或同调表后运行 `npm run generate:items` 重新生成。
 */
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const appRoot = resolve(process.cwd())
const magicItemsDirectory = resolve(appRoot, '../docs/equipment/5e-2014/magic-items')
const expansionsDirectory = resolve(appRoot, '../docs/equipment/5e-2014/expansions')
const generatedDirectory = resolve(appRoot, 'src/rules/data/generated')
const attunementTablePath = resolve(appRoot, 'src/rules/data/dmg-attunement-table.json')

const RARITY_BY_LABEL = {
  普通: 'common',
  常见: 'common',
  非普通: 'uncommon',
  稀有: 'rare',
  珍稀: 'rare',
  非常稀有: 'very-rare',
  极珍稀: 'very-rare',
  传说: 'legendary',
  神器: 'artifact',
}

function normalizeName(value) {
  return value.trim().toLocaleLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ')
}

function stableId(englishName) {
  return normalizeName(englishName)
    .replace(/\+1\/\+2\/\+3/g, 'plus-1-2-3')
    .replace(/[^a-z0-9+]+/g, '-')
    .replace(/^-|-$/g, '')
}

function rarityFrom(label, artifact) {
  if (artifact) return 'artifact'
  const normalized = (label ?? '').trim()
  if (normalized.includes('/') || normalized.includes('~') || normalized.includes('～')) return 'varies'
  return RARITY_BY_LABEL[normalized] ?? 'varies'
}

function magicCategory(typeLabel, englishName) {
  if (typeLabel.includes('护甲')) return 'armor'
  if (typeLabel.includes('药水') || /^(oil|philter|potion)\b/i.test(englishName)) return 'potion'
  if (typeLabel.includes('戒指')) return 'ring'
  if (typeLabel.includes('权杖')) return 'rod'
  if (typeLabel.includes('卷轴') || /^spell scroll\b/i.test(englishName)) return 'scroll'
  if (typeLabel.includes('法杖')) return 'staff'
  if (typeLabel.includes('魔杖')) return 'wand'
  if (typeLabel.includes('武器') || typeLabel.includes('弹药')) return 'weapon'
  return 'wondrous'
}

function equipmentCategory(category) {
  if (category === 'armor') return 'armor'
  if (category === 'weapon') return 'weapon'
  if (category === 'potion') return 'potion'
  return 'magic'
}

/** 解析 DMG 2014 A–Z/神器目录文档。 */
function parseDmgDocument(source, attunementTable) {
  const artifact = source.startsWith('# 5e-2014 神器')
  const result = []
  let headers = []
  for (const rawLine of source.split(/\r?\n/)) {
    if (!rawLine.startsWith('|')) continue
    const cells = rawLine.split('|').slice(1, -1).map((cell) => cell.trim())
    if (cells.every((cell) => /^-+$/.test(cell))) continue
    if (cells.includes('中文名') && cells.includes('英文名')) {
      headers = cells
      continue
    }
    if (!headers.length || cells.length !== headers.length) continue
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']))
    const name = row['中文名']
    const englishName = row['英文名']
    const description = row['效果摘要（原创转述）']
    if (!name || !englishName || !description) continue
    const typeLabel = row['类型'] || (/^(oil|philter|potion)\b/i.test(englishName) ? '药水' : '奇物')
    const itemCategory = magicCategory(typeLabel, englishName)
    const rarity = rarityFrom(row['稀有度'], artifact)
    const attunementMetadata = attunementTable[normalizeName(englishName)]
    const aggregate = rarity === 'varies' || rarity === 'artifact' || /\+1\/\+2\/\+3/.test(englishName)
    result.push({
      id: stableId(englishName),
      name,
      englishName,
      ruleset: '5e-2014',
      status: aggregate ? 'index-only' : 'selectable',
      description,
      classIds: [],
      equippable: !aggregate && !['potion', 'scroll'].includes(itemCategory),
      category: equipmentCategory(itemCategory),
      rarity,
      magicItemCategory: itemCategory,
      attunement: typeof attunementMetadata === 'string' ? 'conditional' : attunementMetadata ? 'required' : 'none',
      ...(typeof attunementMetadata === 'string' ? { attunementCondition: attunementMetadata } : {}),
      sourceIds: ['dmg-2014-index'],
    })
  }
  return result
}

function expansionRarity(metadata) {
  if (metadata.includes('普通或非普通') || metadata.includes('多种')) return 'varies'
  if (metadata.includes('极珍稀') || metadata.includes('非常稀有')) return 'very-rare'
  if (metadata.includes('非普通')) return 'uncommon'
  if (metadata.includes('珍稀') || metadata.includes('稀有')) return 'rare'
  if (metadata.includes('传说')) return 'legendary'
  if (metadata.includes('神器')) return 'artifact'
  return 'common'
}

function expansionMagicCategory(metadata) {
  if (metadata.includes('护甲')) return 'armor'
  if (metadata.includes('药水')) return 'potion'
  if (metadata.includes('戒指')) return 'ring'
  if (metadata.includes('权杖')) return 'rod'
  if (metadata.includes('卷轴')) return 'scroll'
  if (metadata.includes('法杖')) return 'staff'
  if (metadata.includes('魔杖')) return 'wand'
  if (metadata.includes('武器')) return 'weapon'
  return 'wondrous'
}

/** 解析 ERftLW、EGtW 扩展目录文档。 */
function parseExpansionDocument(source, sourceTitle) {
  const result = []
  for (const line of source.split(/\r?\n/)) {
    if (!line.startsWith('|') || /^\|\s*-/.test(line) || line.includes('| 中文名 |')) continue
    const [name, englishName, metadata, sourceId] = line.split('|').slice(1, -1).map((cell) => cell.trim())
    if (!name || !englishName || !metadata || !sourceId) continue
    const itemCategory = expansionMagicCategory(metadata)
    const attunementMetadata = metadata.match(/（需([^）]*同调)）/)?.[1]
    const condition = attunementMetadata && attunementMetadata !== '同调' ? attunementMetadata : undefined
    result.push({
      id: stableId(englishName),
      name,
      englishName,
      ruleset: '5e-2014',
      status: 'index-only',
      description: `来自《${sourceTitle}》的${metadata.split('，')[0] || '魔法物品'}索引；复杂效果与使用条件由桌面依据来源书裁定。`,
      classIds: [],
      equippable: false,
      category: itemCategory === 'armor' ? 'armor' : itemCategory === 'weapon' ? 'weapon' : itemCategory === 'potion' ? 'potion' : 'magic',
      rarity: expansionRarity(metadata),
      magicItemCategory: itemCategory,
      attunement: condition ? 'conditional' : attunementMetadata ? 'required' : 'none',
      ...(condition ? { attunementCondition: condition } : {}),
      sourceIds: [sourceId],
    })
  }
  return result
}

/** 轻量投影：保留展示/校验/派生所需字段，description 置空串。 */
function toIndexItem(item) {
  return { ...item, description: '' }
}

/** 序列化为 TS 数组字面量（第一层缩进 2，保持对象键插入序便于 diff）。 */
function toTsArray(items, indent = '  ') {
  return JSON.stringify(items, null, 2).replace(/\n/g, `\n${indent}`)
}

const GENERATED_HEADER = `// 本文件由 scripts/build-item-catalog.mjs 生成，请勿手动修改。
// 审计与维护源：docs/equipment/5e-2014/magic-items/*.md 与 docs/equipment/5e-2014/expansions/*.md（Markdown 只作为开发维护、核对与审计文档）。
// 修改 Markdown 或同调表后运行 \`npm run generate:items\` 重新生成。
import type { EquipmentRule } from '@/types/rules'

`

async function main() {
  const attunementTable = JSON.parse(await readFile(attunementTablePath, 'utf8'))

  const dmgFiles = (await readdir(magicItemsDirectory)).filter((file) => file.endsWith('.md')).sort()
  const dmgItems = []
  for (const file of dmgFiles) {
    const source = await readFile(resolve(magicItemsDirectory, file), 'utf8')
    dmgItems.push(...parseDmgDocument(source, attunementTable))
  }

  const expansionFiles = (await readdir(expansionsDirectory)).filter((file) => file.endsWith('.md')).sort()
  const expansionItems = []
  for (const file of expansionFiles) {
    const source = await readFile(resolve(expansionsDirectory, file), 'utf8')
    const sourceTitle = file.includes('erftlw') ? '艾伯伦：战乱后的最后战争' : file.includes('egtw') ? '荒洲探险家指南' : file
    expansionItems.push(...parseExpansionDocument(source, sourceTitle))
  }

  const catalogItems = [...dmgItems, ...expansionItems]
  const indexItems = catalogItems.map(toIndexItem)

  await mkdir(generatedDirectory, { recursive: true })
  await writeFile(
    resolve(generatedDirectory, 'magic-items-catalog-2014.ts'),
    `${GENERATED_HEADER}export const magicItemsCatalog2014: readonly EquipmentRule[] = ${toTsArray(catalogItems)}\n`,
    'utf8',
  )
  await writeFile(
    resolve(generatedDirectory, 'magic-items-catalog-index-2014.ts'),
    `${GENERATED_HEADER}export const magicItemsDmgCatalogIndex2014: readonly EquipmentRule[] = ${toTsArray(dmgItems.map(toIndexItem))}\n\nexport const magicItemsExpansionCatalogIndex2014: readonly EquipmentRule[] = ${toTsArray(expansionItems.map(toIndexItem))}\n`,
    'utf8',
  )

  const idSet = new Set(catalogItems.map((item) => item.id))
  console.log(`DMG 目录条目：${dmgItems.length}；扩展目录条目：${expansionItems.length}；合计：${catalogItems.length}；唯一 ID：${idSet.size}`)
}

main().catch((error) => {
  console.error('生成物品目录失败：', error)
  process.exitCode = 1
})
