/**
 * 生成 2024 旧扩展镜像条目（S04）：
 * 取 spells-2014.ts 中来源命中「旧扩展来源集合」、且英文名未在 PHB 2024（spells-2024.ts）出现的法术，
 * 输出 spell-2024-legacy-* 镜像条目（classIds 映射为 class-2024-*，来源映射为 source-2024-legacy-*）。
 * 运行：node scripts/build-legacy-spell-catalog-2024.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(here, '..')
const sourcePath = resolve(appRoot, 'src/rules/data/spells-2014.ts')
const phb2024Path = resolve(appRoot, 'src/rules/data/spells-2024.ts')
const outPath = resolve(appRoot, 'src/rules/data/generated/spells-2024-legacy.ts')

const LEGACY_SOURCES = {
  'xgte-2017-index': 'source-2024-legacy-xge',
  'tcoe-2020-index': 'source-2024-legacy-tce',
  'ftd-2021-index': 'source-2024-legacy-ftd',
  'scc-2021-index': 'source-2024-legacy-scc',
  'ai-2019-index': 'source-2024-legacy-ai',
  'bmt-2023-index': 'source-2024-legacy-bmt',
  'aag-2022-index': 'source-2024-legacy-aag',
  'sato-2023-index': 'source-2024-legacy-so',
  'idrotf-2020-index': 'source-2024-legacy-idrotf',
  'llok-2018-index': 'source-2024-legacy-llok',
}
const CLASS_MAP = {
  'class-2014-artificer': 'class-2024-ua-artificer',
}

const slug = (englishName) => englishName.replace(/\u2019/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const normalizeName = (name) => name.replace(/\u2019/g, "'").toLowerCase().replace(/\s*\/\s*/g, '/').replace(/\s+/g, ' ').trim()
const unescape = (value) => value.replace(/\\'/g, "'").replace(/\\\\/g, '\\')

const source2014 = readFileSync(sourcePath, 'utf8')
const sourcePhb2024 = readFileSync(phb2024Path, 'utf8')

const phbNames = new Set(
  [...sourcePhb2024.matchAll(/englishName:\s*"((?:[^"\\]|\\.)*)"/g)].map((match) => normalizeName(unescape(match[1]))),
)

// 2014 仪式清单（用于镜像 ritual 字段）。
const ritualBlock = source2014.match(/export const ritualSpellNames2014 = \[([\s\S]*?)\] as const/)
const ritualNames = new Set(ritualBlock ? [...ritualBlock[1].matchAll(/'((?:[^'\\]|\\.)+)'/g)].map((match) => unescape(match[1])) : [])

// 2014 摘要（key 为 spell id）。
const descriptions = new Map()
for (const match of source2014.matchAll(/^\s*'(spell-2014-[a-z0-9-]+)':\s*'((?:[^'\\]|\\.)*)',$/gm)) {
  descriptions.set(match[1], unescape(match[2]))
}

const entries = []
const seedPattern = /\['((?:[^'\\]|\\.)+)', '([^']+)', (\d+), \[([^\]]*)\], \[([^\]]*)\]\]/g
for (const match of source2014.matchAll(seedPattern)) {
  const englishName = unescape(match[1])
  const name = match[2]
  const level = Number(match[3])
  const sources = [...match[5].matchAll(/'([^']+)'/g)].map((item) => item[1])
  const legacySourceId = sources.map((id) => LEGACY_SOURCES[id]).find(Boolean)
  if (!legacySourceId) continue
  if (phbNames.has(normalizeName(englishName))) continue
  const classIds = [...match[4].matchAll(/'([^']+)'/g)].map((item) => {
    const id = item[1]
    if (id === 'artificer' || id === 'class-2014-artificer') return 'class-2024-ua-artificer'
    return id.startsWith('class-2014-') ? id.replace('class-2014-', 'class-2024-') : `class-2024-${id}`
  })
  const id = `spell-2024-legacy-${slug(englishName)}`
  const description = descriptions.get(`spell-2014-${slug(englishName)}`) ?? ''
  entries.push({ id, name, englishName, level, ritual: ritualNames.has(englishName), classIds, description, sourceIds: [legacySourceId] })
}

entries.sort((a, b) => a.level - b.level || a.id.localeCompare(b.id))

const lines = []
lines.push('// 本文件由 scripts/build-legacy-spell-catalog-2024.mjs 生成；请勿手工修改。')
lines.push('// 数据源：spells-2014.ts 中来源命中旧扩展集合、且英文名未在 PHB 2024 出现的法术（S04 旧扩展附注层）。')
lines.push("import type { SpellRule } from '@/types/rules'")
lines.push('')
lines.push('export const legacySpells2024: readonly SpellRule[] = [')
for (const entry of entries) {
  const escape = (value) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  lines.push(`  {`)
  lines.push(`    id: "${entry.id}",`)
  lines.push(`    ruleset: '5e-2024',`)
  lines.push(`    name: "${escape(entry.name)}",`)
  lines.push(`    englishName: "${escape(entry.englishName)}",`)
  lines.push(`    level: ${entry.level},`)
  lines.push(`    ritual: ${entry.ritual},`)
  lines.push(`    classIds: [${entry.classIds.map((id) => `'${id}'`).join(', ')}],`)
  lines.push(`    summary: "${entry.level === 0 ? '戏法' : `${entry.level}环法术`}；旧扩展法术（未在 PHB 2024 重印）；元数据条目，效果以规则来源为准。",`)
  lines.push(`    description: "${escape(entry.description)}",`)
  lines.push(`    status: 'selectable',`)
  lines.push(`    sourceIds: ['${entry.sourceIds[0]}'],`)
  lines.push(`  },`)
}
lines.push(']')
lines.push('')

if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, lines.join('\n'), 'utf8')
console.log(`旧扩展镜像条目：${entries.length}（输出 ${outPath}）`)
