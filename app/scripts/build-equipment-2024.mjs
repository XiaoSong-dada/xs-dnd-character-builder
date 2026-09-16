import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', '..')
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const mapping = read('docs/需求文档/2014与2024双规则版本支持-B01核验/运行时ID映射.md')
const factsText = read('docs/需求文档/2014与2024双规则版本支持-B01核验/装备.md')
const supplement = read('docs/需求文档/2014与2024双规则版本支持-B01核验/装备-子规格与精通.md')
const factRows = new Map([...factsText.matchAll(/^\| (EQ-\d{3}) \| ([^|]+) \| ([^|]+) \| [^|]+ \| ([^|]+) \|/gm)].map((m) => [m[1], { category: m[3].trim(), facts: m[4].trim() }]))
const mastery = { '顺劈': 'cleave', '擦伤': 'graze', '迅切': 'nick', '迅击': 'nick', '推离': 'push', '削弱': 'sap', '缓速': 'slow', '失衡': 'topple', '侵扰': 'vex' }
const properties = { '灵巧': 'finesse', '轻型': 'light', '重型': 'heavy', '触及': 'reach', '装填': 'loading', '弹药': 'ammunition', '投掷': 'thrown', '双手': 'two-handed', '多用': 'versatile' }
const ability = { '力量': 'str', '敏捷': 'dex', '体质': 'con', '智力': 'int', '感知': 'wis', '魅力': 'cha' }
const money = (facts) => { const m = facts.match(/(?:价格：)?([\d,.]+)\s*(CP|SP|EP|GP|PP)/i); if (!m) return undefined; return Math.round(Number(m[1].replaceAll(',', '')) * ({ CP: 1, SP: 10, EP: 50, GP: 100, PP: 1000 })[m[2].toUpperCase()]) }
const weight = (facts) => { const m = facts.match(/([\d.]+|\d+\/\d+)\s*磅/); if (!m) return undefined; return m[1].includes('/') ? m[1].split('/').reduce((a,b)=>Number(a)/Number(b)) : Number(m[1]) }
const esc = (v) => JSON.stringify(v)
const rows = [...mapping.matchAll(/^\| PHB装备 \| (EQ-\d{3}) \| ([^|]+) \| ([^|]+) \| `([^`]+)` \|/gm)]
  .filter((m) => !['EQ-135', 'EQ-147'].includes(m[1]))
  .map((m) => {
    const number = Number(m[1].slice(3)); const f = factRows.get(m[1])?.facts ?? ''; const cat = factRows.get(m[1])?.category ?? ''
    const category = number <= 38 ? 'weapon' : number <= 50 ? 'armor' : number === 51 ? 'shield' : number <= 75 || number === 157 ? 'tool' : 'gear'
    const displayName = m[2].trim()
    const fields = [`id:${esc(m[4])}`, `name:${esc(displayName)}`, `englishName:${esc(m[3].trim())}`, `ruleset:'5e-2024'`, `status:'implemented'`, `description:${esc(f)}`, `classIds:[]`, `equippable:${category === 'weapon' || category === 'armor' || category === 'shield'}`, `category:'${category}'`, `attunement:'none'`, `sourceIds:['source-2024-phb']`]
    const p = money(f); const w = weight(f); if (p !== undefined) fields.push(`priceCp:${p}`); if (w !== undefined) fields.push(`weightLb:${w}`)
    if (category === 'weapon') {
      const ranged = number >= 11 && number <= 14 || number >= 33
      fields.push(`weaponKind:'${number <= 14 ? 'simple' : 'martial'}-${ranged ? 'ranged' : 'melee'}'`)
      const dice = f.match(/\b(\d+d\d+|1)\b/); if (dice) fields.push(`damageDice:${esc(dice[1])}`)
      const dt = f.match(/(钝击|穿刺|挥砍)/); if (dt) fields.push(`damageType:${esc(dt[1])}`)
      const props = Object.entries(properties).filter(([key]) => f.includes(key)).map(([,value]) => `'${value}'`); if (props.length) fields.push(`weaponProperties:[${props.join(',')}]`)
      const versatile = f.match(/多用（(\d+d\d+)）/); if (versatile) fields.push(`versatileDamageDice:${esc(versatile[1])}`)
      const range = f.match(/射程\s*(\d+)\/(\d+)/); if (range) fields.push(`range:[${range[1]},${range[2]}]`)
      const master = Object.entries(mastery).find(([key]) => f.includes(key)); if (master) fields.push(`masteryId:'mastery-2024-${master[1]}'`)
    } else if (category === 'armor') {
      const base = f.match(/^(\d+)/); if (base) fields.push(`armorBase:${base[1]}`)
      if (f.includes('敏捷调整值')) fields.push('addsDexterityToArmor:true')
      if (f.includes('最大2')) fields.push('armorDexterityCap:2')
      const str = f.match(/力量(\d+)/); if (str) fields.push(`strengthRequirement:${str[1]}`)
      if (f.includes('劣势')) fields.push('stealthDisadvantage:true')
    } else if (category === 'shield') fields.push('armorClassBonus:2')
    const a = Object.entries(ability).find(([key]) => f.includes(`属性：${key}`)); if (a) fields.push(`toolAbility:'${a[1]}'`)
    return `  { ${fields.join(', ')} },`
  })
const slugify = (value) => value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-|-$/g, '')
for (const match of supplement.matchAll(/^\| (ES-\d{3}) \| ([^/|]+) \/ ([^|]+) \| ([^|]+) \| ([^|]+) \|/gm)) {
  const [, , name, englishName, family, facts] = match
  const id = `equipment-2024-${slugify(englishName.trim())}`
  if (rows.some((row) => row.includes(`id:${esc(id)}`))) continue
  const category = /赌具|乐器/.test(family) ? 'tool' : 'gear'
  const fields = [`id:${esc(id)}`, `name:${esc(name.trim())}`, `englishName:${esc(englishName.trim())}`, `ruleset:'5e-2024'`, `status:'implemented'`, `description:${esc(facts.trim())}`, 'classIds:[]', 'equippable:false', `category:'${category}'`, `attunement:'none'`, `sourceIds:['source-2024-phb']`]
  const p = money(facts); const w = weight(facts); if (p !== undefined) fields.push(`priceCp:${p}`); if (w !== undefined) fields.push(`weightLb:${w}`)
  rows.push(`  { ${fields.join(', ')} },`)
}
const output = `// Generated by scripts/build-equipment-2024.mjs from the reviewed B01 matrices.\nimport type { EquipmentRule } from '@/types/rules'\n\nexport const equipment2024: readonly EquipmentRule[] = [\n${rows.join('\n')}\n]\n`
fs.writeFileSync(path.join(root, 'app/src/rules/data/equipment-2024.ts'), output)
