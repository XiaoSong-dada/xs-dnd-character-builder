import { describe, expect, it } from 'vitest'

import { CharacterImportError, CharacterJsonService } from '@/services/character-json'

describe('CharacterJsonService', () => {
  it('区分无效JSON和规则版本不匹配', () => {
    expect(() => CharacterJsonService.importDraft('{')).toThrowError(CharacterImportError)
    expect(() => CharacterJsonService.importDraft(JSON.stringify({ schemaVersion: 1, ruleset: '5e-2024' }))).toThrowError('版本不受支持')
  })

  it('拒绝未知数据版本', () => {
    expect(() => CharacterJsonService.importDraft(JSON.stringify({ schemaVersion: 2, ruleset: '5e-2024' }))).toThrowError('当前仅支持 5e-2014')
  })
})
