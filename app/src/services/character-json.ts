import type { CharacterDraft } from '@/types/character'

export type ImportErrorCode = 'invalid-json' | 'unsupported-schema' | 'ruleset-mismatch' | 'incomplete-data'

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
    return JSON.stringify(draft, null, 2)
  },
  importDraft(raw: string): CharacterDraft {
    let value: unknown
    try {
      value = JSON.parse(raw)
    } catch {
      throw new CharacterImportError('invalid-json', '文件不是有效的 JSON。')
    }
    if (!value || typeof value !== 'object') {
      throw new CharacterImportError('incomplete-data', '文件中没有角色数据。')
    }
    const draft = value as Partial<CharacterDraft>
    if (draft.schemaVersion !== 2) {
      throw new CharacterImportError('unsupported-schema', '角色文件版本不受支持。')
    }
    if (draft.ruleset !== '5e-2014') {
      throw new CharacterImportError('ruleset-mismatch', '当前仅支持 5e-2014 角色文件；旧版草稿请保留为备份。')
    }
    if (!draft.id || !draft.baseAbilities || !Array.isArray(draft.selections)) {
      throw new CharacterImportError('incomplete-data', '角色文件缺少必要字段。')
    }
    return {
      ...draft,
      raceAbilityChoices: draft.raceAbilityChoices ?? [],
      backgroundSkillIds: draft.backgroundSkillIds ?? [],
      backgroundToolIds: draft.backgroundToolIds ?? [],
      languages: draft.languages ?? [],
      proficiencyReplacements: draft.proficiencyReplacements ?? [],
      spellSelections: draft.spellSelections ?? {
        cantripIds: [],
        knownSpellIds: [],
        preparedSpellIds: [],
        spellbookSpellIds: [],
      },
    } as CharacterDraft
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
