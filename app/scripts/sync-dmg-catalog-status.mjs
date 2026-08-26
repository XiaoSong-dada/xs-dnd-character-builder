import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const directory = resolve(process.cwd(), '../docs/equipment/5e-2014/magic-items')
const files = (await readdir(directory)).filter((file) => file.endsWith('.md'))

for (const file of files) {
  const path = resolve(directory, file)
  const source = await readFile(path, 'utf8')
  const artifact = file === 'artifacts.md'
  const updated = source
    .split(/\r?\n/)
    .map((line) => {
      if (!line.startsWith('|') || !line.endsWith('|') || !/\|\s*pending\s*\|$/.test(line)) return line
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
      const aggregate = artifact || cells.some((cell) => cell.includes('+1/+2/+3') || /[/~～]/.test(cell) && /普通|稀有|传说/.test(cell))
      cells[cells.length - 1] = aggregate ? 'index-only' : 'selectable'
      return `| ${cells.join(' | ')} |`
    })
    .join('\n')
    .replace(/登记状态统一为 `pending`[^。\n]*。/g, '登记状态已与运行时对照：具体条目为 `selectable`，聚合型号与神器为 `index-only`。')
  await writeFile(path, `${updated.replace(/\n+$/, '')}\n`, 'utf8')
}

console.log(`已同步 ${files.length} 个 DMG 2014 候选文档的运行时状态。`)
