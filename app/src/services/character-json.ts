import type { CharacterDraft } from '@/types/character'
import { parseCharacterDraft } from '@/services/draft-storage'
import { isRulesetId } from '@/rules/repositories'

export type ImportErrorCode = 'invalid-json' | 'unsupported-schema' | 'ruleset-mismatch' | 'incomplete-data'

const SUPPORTED_SCHEMA_VERSIONS = new Set([2, 3, 4, 5, 6, 7, 8])

export class CharacterImportError extends Error {
  constructor(
    readonly code: ImportErrorCode,
    message: string,
  ) {
    super(message)
  }
}

export const CharacterJsonService = {
  exportDraft(draft: CharacterDraft): string {
    const { media: _media, ...portableDraft } = draft
    return JSON.stringify(portableDraft, null, 2)
  },
  importDraft(raw: string, options: { readonly preserveMedia?: boolean } = {}): CharacterDraft {
    let value: unknown
    try {
      value = JSON.parse(raw)
    } catch {
      throw new CharacterImportError('invalid-json', '文件不是有效的 JSON。')
    }
    if (!value || typeof value !== 'object') {
      throw new CharacterImportError('incomplete-data', '文件中没有角色数据。')
    }
    const schemaVersion = Number((value as { schemaVersion?: unknown }).schemaVersion)
    if (!SUPPORTED_SCHEMA_VERSIONS.has(schemaVersion)) {
      throw new CharacterImportError('unsupported-schema', '角色文件版本不受支持。')
    }
    const draft = value as Partial<CharacterDraft>
    const ruleset = draft.ruleset
    if (typeof ruleset !== 'string' || ruleset.length === 0) {
      throw new CharacterImportError('ruleset-mismatch', '角色文件缺少有效的规则版本。')
    }
    if (!isRulesetId(ruleset)) {
      throw new CharacterImportError('ruleset-mismatch', `不支持的规则版本：${ruleset}。`)
    }
    if (schemaVersion < 8 && ruleset === '5e-2024') {
      throw new CharacterImportError('ruleset-mismatch', '该文件是旧版 2024 草稿格式，暂不支持导入；请保留原文件作为备份。')
    }
    if (!draft.id || !draft.baseAbilities || !Array.isArray(draft.selections)) {
      throw new CharacterImportError('incomplete-data', '角色文件缺少必要字段。')
    }
    const migrated = parseCharacterDraft(value)
    if (!migrated) throw new CharacterImportError('incomplete-data', '角色文件无法迁移到当前版本。')
    return options.preserveMedia ? migrated : { ...migrated, media: undefined }
  },
  downloadDraft(draft: CharacterDraft): void {
    this.downloadRaw(this.exportDraft(draft), `${draft.name.trim() || 'dnd-character'}-${draft.id}.json`)
  },
  downloadRaw(raw: string, filename: string): void {
    const blob = new Blob([raw], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  },
}
