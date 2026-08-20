import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const subsetFont = require('./node_modules/subset-font/index.js')

const SRC = 'C:/Users/19355/code/dnd-character-builder/app/tools-subset/NotoSansSC.ttf'
const CHARSET = 'C:/Users/19355/code/dnd-character-builder/app/tools-subset/charset.txt'
const OUT = 'C:/Users/19355/code/dnd-character-builder/app/public/templates/fonts/noto-sans-sc-subset.ttf'

const buffer = readFileSync(SRC)
const text = readFileSync(CHARSET, 'utf-8')
// variationAxes 固定 wght=400（Regular），避免可变字体默认实例化为 Thin
const subset = await subsetFont(buffer, text, { targetFormat: 'truetype', variationAxes: { wght: 400 } })
mkdirSync('C:/Users/19355/code/dnd-character-builder/app/public/templates/fonts', { recursive: true })
writeFileSync(OUT, subset)
console.log('子集字体输出:', (subset.byteLength / 1024).toFixed(1) + 'KB')
