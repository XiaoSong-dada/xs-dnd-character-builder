/**
 * 从 B01 分环核验矩阵生成 2024 法术运行时目录。
 *
 * 数据源：docs/需求文档/2014与2024双规则版本支持-B01核验/法术-<N>环.md
 * 产物：src/rules/data/spells-2024.ts（提交进仓库，纳入 vue-tsc 校验）
 * 用法：node scripts/build-spell-catalog-2024.mjs
 *
 * 说明：矩阵中的“效果核对线索”是项目原创中文摘要，脚本按字段原样搬运；
 * 稳定 ID 规则与 2014 一致：spell-2024-<小写英文名连字符>。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MATRIX_DIR = resolve(APP_DIR, '../docs/需求文档/2014与2024双规则版本支持-B01核验')
const OUTPUT = resolve(APP_DIR, 'src/rules/data/spells-2024.ts')

const EXPECTED_COUNTS = [34, 64, 63, 52, 41, 48, 34, 21, 18, 16]

/** 中文职业名 → 2024 运行时职业 ID；顺序用于稳定输出。 */
const CLASS_MAP = new Map([
  ['野蛮人', 'barbarian'],
  ['吟游诗人', 'bard'],
  ['牧师', 'cleric'],
  ['德鲁伊', 'druid'],
  ['战士', 'fighter'],
  ['武僧', 'monk'],
  ['圣武士', 'paladin'],
  ['游侠', 'ranger'],
  ['游荡者', 'rogue'],
  ['术士', 'sorcerer'],
  ['魔契师', 'warlock'],
  ['法师', 'wizard'],
])

/** 依赖生物数据或 DM 裁定的效果：保持 selectable，不冒充自动结算。 */
const SITUATIONAL_SLUGS = new Set([
  'wish',
  'true-polymorph',
  'polymorph',
  'shapechange',
  'animal-shapes',
  'simulacrum',
  'clone',
  'awaken',
  'fabricate',
  'conjure-animals',
  'conjure-celestial',
  'conjure-elemental',
  'conjure-fey',
  'conjure-minor-elementals',
  'conjure-woodland-beings',
  'summon-aberration',
  'summon-beast',
  'summon-celestial',
  'summon-construct',
  'summon-dragon',
  'summon-elemental',
  'summon-fey',
  'summon-fiend',
  'summon-shadowspawn',
  'summon-undead',
])

function spellSlug(englishName) {
  return englishName.toLowerCase().replace(/\u2019/g, '').replace(/[^a-z0-9]+/g, '-')
}

function parseLevel(level) {
  const file = resolve(MATRIX_DIR, `法术-${level}环.md`)
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  const spells = []
  for (const [index, line] of lines.entries()) {
    if (!line.startsWith('| SP-')) continue
    const cells = line.split('|').map((cell) => cell.trim())
    if (cells.length !== 13) {
      throw new Error(`${file}:${index + 1} 单元格数量为 ${cells.length}，预期 13`)
    }
    const [, id, nameCell, , schoolCell, timeCell, range, components, duration, effect] = cells
    if (!/^SP-\d+-\d{3}$/.test(id)) throw new Error(`${file}:${index + 1} 编号格式异常：${id}`)
    const nameParts = nameCell.split(' / ')
    if (nameParts.length !== 2) throw new Error(`${file}:${index + 1} 名称格式异常：${nameCell}`)
    const [name, englishName] = nameParts
    const schoolMatch = /^[零一二三四五六七八九]环\s*(.*?)（([^）]*)）$/.exec(schoolCell)
      ?? /^(.*?)\s*戏法\s*（([^）]*)）$/.exec(schoolCell)
    if (!schoolMatch) throw new Error(`${file}:${index + 1} 学派／职业格式异常：${schoolCell}`)
    const school = schoolMatch[1].trim()
    const classIds = schoolMatch[2]
      .split('、')
      .map((className) => className.trim())
      .filter((className) => className.length > 0)
      .map((className) => {
        const slug = CLASS_MAP.get(className)
        if (!slug) throw new Error(`${file}:${index + 1} 未知职业名：${className}`)
        return `class-2024-${slug}`
      })
    const ritual = timeCell.includes('仪式')
    const castingTime = timeCell.replace(/或仪式/g, '').replace(/仪式/g, '').trim() || '仪式'
    const slug = spellSlug(englishName)
    spells.push({
      id,
      slug,
      name,
      englishName,
      level,
      school,
      castingTime,
      range,
      components,
      duration,
      concentration: duration.includes('专注'),
      ritual,
      classIds,
      description: effect,
      status: SITUATIONAL_SLUGS.has(slug) ? 'selectable' : 'implemented',
    })
  }
  const expected = EXPECTED_COUNTS[level]
  if (spells.length !== expected) {
    throw new Error(`${file} 解析 ${spells.length} 条，预期 ${expected} 条`)
  }
  return spells
}

function render(spells) {
  const rows = spells.map((spell) => {
    const fields = [
      `slug: ${JSON.stringify(spell.slug)}`,
      `name: ${JSON.stringify(spell.name)}`,
      `englishName: ${JSON.stringify(spell.englishName)}`,
      `level: ${spell.level}`,
      `school: ${JSON.stringify(spell.school)}`,
      `castingTime: ${JSON.stringify(spell.castingTime)}`,
      `range: ${JSON.stringify(spell.range)}`,
      `components: ${JSON.stringify(spell.components)}`,
      `duration: ${JSON.stringify(spell.duration)}`,
      `concentration: ${spell.concentration}`,
      `ritual: ${spell.ritual}`,
      `classIds: [${spell.classIds.map((id) => JSON.stringify(id)).join(', ')}]`,
      `description: ${JSON.stringify(spell.description)}`,
      `status: ${JSON.stringify(spell.status)}`,
    ]
    return `  { ${fields.join(', ')} },`
  })
  return `// 本文件由 scripts/build-spell-catalog-2024.mjs 从 B01 分环矩阵生成；请勿手工修改字段顺序。
// 数据源：docs/需求文档/2014与2024双规则版本支持-B01核验/法术-<N>环.md
import type { CompatibilityStatus } from '@/types/character'
import type { SpellRule } from '@/types/rules'

const sourceIds = ['source-2024-phb'] as const

interface Spell2024Seed {
  readonly slug: string
  readonly name: string
  readonly englishName: string
  readonly level: number
  readonly school: string
  readonly castingTime: string
  readonly range: string
  readonly components: string
  readonly duration: string
  readonly concentration: boolean
  readonly ritual: boolean
  readonly classIds: readonly string[]
  readonly description: string
  readonly status: CompatibilityStatus
}

const seeds: readonly Spell2024Seed[] = [
${rows.join('\n')}
]

export const spells2024: readonly SpellRule[] = seeds.map((seed) => ({
  id: \`spell-2024-\${seed.slug}\`,
  ruleset: '5e-2024',
  name: seed.name,
  englishName: seed.englishName,
  level: seed.level,
  ritual: seed.ritual,
  classIds: seed.classIds,
  summary: \`\${seed.level === 0 ? '戏法' : \`\${seed.level} 环\`} · \${seed.school}\`,
  description: seed.description,
  status: seed.status,
  sourceIds,
  school: seed.school,
  castingTime: seed.castingTime,
  range: seed.range,
  components: seed.components,
  duration: seed.duration,
  concentration: seed.concentration,
}))
`
}

const allSpells = EXPECTED_COUNTS.flatMap((_, level) => parseLevel(level))
const slugs = new Set(allSpells.map((spell) => spell.slug))
if (slugs.size !== allSpells.length) {
  const duplicates = allSpells.map((spell) => spell.slug).filter((slug, index, list) => list.indexOf(slug) !== index)
  throw new Error(`法术 ID 重复：${[...new Set(duplicates)].join('、')}`)
}
writeFileSync(OUTPUT, render(allSpells), 'utf8')
console.log(`法术目录已生成：${allSpells.length} 条 → ${OUTPUT}`)
