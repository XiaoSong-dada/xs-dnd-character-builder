import { readFileSync } from 'node:fs'
import { PDFDocument, PDFArray, PDFStream, PDFRef } from 'pdf-lib'

const doc = await PDFDocument.load(readFileSync('C:/Users/19355/code/dnd-character-builder/docs/export-templates/_filled-test.pdf'), { ignoreEncryption: true })
const page = doc.getPage(0)
const contents = page.node.Contents()
const items = contents instanceof PDFArray ? contents.asArray() : [contents]
for (const item of items) {
  const resolved = item instanceof PDFRef ? doc.context.lookup(item) : item
  if (resolved instanceof PDFStream) {
    const data = await resolved.getContents()
    const text = data.toString('latin1')
    console.log(`=== 流 (${text.length} 字节) ===`)
    console.log(text.slice(0, 1000))
    console.log()
  }
}
