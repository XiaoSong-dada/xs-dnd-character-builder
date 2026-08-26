import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const SITE_ROOT = 'https://5echm.kagangtuya.top/'
const outputDirectory = resolve(process.cwd(), '../docs/equipment/5e-2014/expansions')

function text(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim()
}

async function webhelpLinks() {
  const contents = await fetch(new URL('webhelpcontents.htm', SITE_ROOT)).then((response) => response.text())
  return [...contents.matchAll(/href="([^"]+)/gi)].map((match) => match[1])
}

async function entriesFromPages(links, matcher) {
  const pages = links.filter((link) => matcher(decodeURIComponent(link)))
  const entries = []
  for (const page of pages) {
    const html = await fetch(new URL(page, SITE_ROOT)).then((response) => response.text())
    const headings = [...html.matchAll(/<H6[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/H6>/gi)]
    for (let index = 0; index < headings.length; index += 1) {
      const match = headings[index]
      const start = (match.index ?? 0) + match[0].length
      const end = headings[index + 1]?.index ?? html.length
      const title = text(match[2])
      const englishMatch = title.match(/([A-Z][\x20-\x7e]*)$/)
      const englishName = englishMatch?.[1]?.trim() ?? match[1].trim()
      const name = title.slice(0, title.length - englishName.length).trim()
      const metadata = text(html.slice(start, end).match(/<P[^>]*>([\s\S]*?)<BR>/i)?.[1] ?? '')
      if (name && englishName && metadata) entries.push({ name, englishName, metadata })
    }
  }
  return entries
}

function markdown(title, sourceId, entries) {
  return `# ${title}\n\n> 来源：5e 不全书对应的 2014 官方扩展书页面，仅同步中英文名、目录元数据和同调标题行；不复制效果正文。\n> 运行时状态：\`index-only\`，复杂效果由桌面依据来源书裁定。\n\n| 中文名 | 英文名 | 目录元数据 | 来源 ID | 状态 |\n| --- | --- | --- | --- | --- |\n${entries.map((entry) => `| ${entry.name} | ${entry.englishName} | ${entry.metadata} | ${sourceId} | index-only |`).join('\n')}\n`
}

const links = await webhelpLinks()
const erftlw = await entriesFromPages(links, (path) => /艾伯伦：从终末战争中崛起\/第五章\/(普通|非普通|珍稀|极珍稀|传说|多种稀有度)\.htm$/.test(path))
const egtw = await entriesFromPages(links, (path) => /荒洲探险家指南\/荒洲宝藏\/(荒洲的魔法物品|诀别遗物|叛神武具)\.(html|htm)$/.test(path))

await mkdir(outputDirectory, { recursive: true })
await writeFile(resolve(outputDirectory, 'erftlw-2019.md'), markdown('ERftLW 2019 魔法物品索引', 'erftlw-2019-index', erftlw), 'utf8')
await writeFile(resolve(outputDirectory, 'egtw-2020.md'), markdown('EGtW 2020 魔法物品索引', 'egtw-2020-index', egtw), 'utf8')
console.log(`已同步 ERftLW ${erftlw.length} 条、EGtW ${egtw.length} 条扩展物品元数据。`)
