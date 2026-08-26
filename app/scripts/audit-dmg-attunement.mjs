import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const SITE_ROOT = 'https://5echm.kagangtuya.top/'
const docsDirectory = resolve(process.cwd(), '../docs/equipment/5e-2014/magic-items')

function plainText(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
}

function normalized(value) {
  return value.trim().toLocaleLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ')
}

async function candidateEnglishNames() {
  const files = (await readdir(docsDirectory)).filter((file) => file.endsWith('.md'))
  const names = []
  for (const file of files) {
    const source = await readFile(resolve(docsDirectory, file), 'utf8')
    let englishColumn = -1
    for (const line of source.split(/\r?\n/)) {
      if (!line.startsWith('|')) continue
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
      if (cells.includes('英文名')) {
        englishColumn = cells.indexOf('英文名')
        continue
      }
      if (englishColumn >= 0 && !cells.every((cell) => /^-+$/.test(cell)) && cells[englishColumn]) names.push(cells[englishColumn])
    }
  }
  return [...new Set(names)]
}

async function categoryPages() {
  const contents = await fetch(new URL('webhelpcontents.htm', SITE_ROOT)).then((response) => response.text())
  const links = [...contents.matchAll(/href="([^"]+)/gi)].map((match) => match[1])
  const categories = ['/护甲/', '/药水/', '/戒指/', '/卷轴/', '/武器/', '/法杖/', '/权杖/', '/魔杖/', '/奇物/']
  return [...new Set(links.filter((link) => {
    const decoded = decodeURIComponent(link)
    return decoded.includes('城主指南/宝藏/魔法物品/')
      && !decoded.includes('2024')
      && categories.some((category) => decoded.includes(category))
  }))]
}

const names = await candidateEnglishNames()
const normalizedNames = names.map(normalized)
const pages = await categoryPages()
const texts = await Promise.all(pages.map(async (page) => normalized(plainText(await fetch(new URL(page, SITE_ROOT)).then((response) => response.text())))))
const result = {}
const unmatched = []

for (const englishName of names) {
  const key = normalized(englishName)
  const matches = texts.flatMap((text) => {
    const index = text.indexOf(key)
    if (index < 0) return []
    const start = index + key.length
    const nextTitle = normalizedNames
      .filter((candidate) => candidate !== key)
      .map((candidate) => text.indexOf(candidate, start))
      .filter((candidateIndex) => candidateIndex >= 0)
      .reduce((closest, candidateIndex) => Math.min(closest, candidateIndex), start + 180)
    const snippet = text.slice(start, nextTitle).trim()
    return /^(?:护甲|药水|戒指|卷轴|武器|法杖|权杖|魔杖|奇物|弹药)/.test(snippet) ? [snippet] : []
  })
  if (!matches.length) {
    unmatched.push(englishName)
    continue
  }
  const metadata = matches.map((snippet) => snippet.match(/[（(]([^）)]*同调[^）)]*)[）)]/)?.[1]).find(Boolean)
  if (!metadata) continue
  result[key] = metadata === '需同调' ? true : metadata.replace(/^需(?:要)?/, '')
}

console.log(JSON.stringify(result, null, 2))
console.error(`候选 ${names.length}；分类页 ${pages.length}；同调 ${Object.keys(result).length}；未匹配 ${unmatched.length}`)
if (unmatched.length) console.error(`未匹配英文名：${unmatched.join(' | ')}`)
