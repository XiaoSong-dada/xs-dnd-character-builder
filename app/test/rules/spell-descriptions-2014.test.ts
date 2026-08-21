import { describe, expect, it } from 'vitest'

import { spells2014 } from '@/rules/data/spells-2014'

/**
 * 应有 5/11/17 级伤害成长标注的戏法（2014 规则，5/11/17 级伤害骰各 +1；
 * 雷鸣刃/绿焰刃为 TCoE 特殊成长格式"5 级起…"）。
 * 数据来源：5e.tools 2014（与 spellDescriptions 登记口径一致）。
 */
const GROWING_CANTRIP_IDS = [
  'spell-2014-acid-splash',
  'spell-2014-chill-touch',
  'spell-2014-create-bonfire',
  'spell-2014-eldritch-blast',
  'spell-2014-fire-bolt',
  'spell-2014-frostbite',
  'spell-2014-infestation',
  'spell-2014-lightning-lure',
  'spell-2014-mind-sliver',
  'spell-2014-poison-spray',
  'spell-2014-primal-savagery',
  'spell-2014-produce-flame',
  'spell-2014-ray-of-frost',
  'spell-2014-sacred-flame',
  'spell-2014-shocking-grasp',
  'spell-2014-sword-burst',
  'spell-2014-thorn-whip',
  'spell-2014-thunderclap',
  'spell-2014-toll-the-dead',
  'spell-2014-vicious-mockery',
  'spell-2014-word-of-radiance',
  'spell-2014-booming-blade',
  'spell-2014-green-flame-blade',
] as const

/**
 * 应有高环施放（upcasting）成长标注的法术（摘要含"每高"字样；
 * 含既有已标注条目与本次补齐条目，以 5e.tools 2014 数据核对）。
 */
const UPCAST_GROWING_SPELL_IDS = [
  'spell-2014-abi-dalzim-s-horrid-wilting',
  'spell-2014-aganazzar-s-scorcher',
  'spell-2014-aid',
  'spell-2014-animate-dead',
  'spell-2014-armor-of-agathys',
  'spell-2014-arms-of-hadar',
  'spell-2014-ashardalon-s-stride',
  'spell-2014-aura-of-vitality',
  'spell-2014-bane',
  'spell-2014-banishing-smite',
  'spell-2014-bigby-s-hand',
  'spell-2014-blade-barrier',
  'spell-2014-bless',
  'spell-2014-blight',
  'spell-2014-blinding-smite',
  'spell-2014-bones-of-the-earth',
  'spell-2014-borrowed-knowledge',
  'spell-2014-branding-smite',
  'spell-2014-burning-hands',
  'spell-2014-call-lightning',
  'spell-2014-catapult',
  'spell-2014-cause-fear',
  'spell-2014-chain-lightning',
  'spell-2014-chaos-bolt',
  'spell-2014-charm-monster',
  'spell-2014-chromatic-orb',
  'spell-2014-circle-of-death',
  'spell-2014-cloud-of-daggers',
  'spell-2014-cloudkill',
  'spell-2014-color-spray',
  'spell-2014-cone-of-cold',
  'spell-2014-conjure-barrage',
  'spell-2014-conjure-volley',
  'spell-2014-crown-of-stars',
  'spell-2014-cure-wounds',
  'spell-2014-dawn',
  'spell-2014-delayed-blast-fireball',
  'spell-2014-destructive-wave',
  'spell-2014-disintegrate',
  'spell-2014-dissonant-whispers',
  'spell-2014-dragon-s-breath',
  'spell-2014-dream',
  'spell-2014-dust-devil',
  'spell-2014-earth-tremor',
  'spell-2014-elemental-bane',
  'spell-2014-enervation',
  'spell-2014-ensnaring-strike',
  'spell-2014-erupting-earth',
  'spell-2014-evard-s-black-tentacles',
  'spell-2014-false-life',
  'spell-2014-finger-of-death',
  'spell-2014-fire-storm',
  'spell-2014-fireball',
  'spell-2014-flame-arrows',
  'spell-2014-flame-blade',
  'spell-2014-flame-strike',
  'spell-2014-flaming-sphere',
  'spell-2014-guiding-bolt',
  'spell-2014-hail-of-thorns',
  'spell-2014-healing-spirit',
  'spell-2014-healing-word',
  'spell-2014-heat-metal',
  'spell-2014-hellish-rebuke',
  'spell-2014-holy-weapon',
  'spell-2014-ice-knife',
  'spell-2014-ice-storm',
  'spell-2014-illusory-dragon',
  'spell-2014-immolation',
  'spell-2014-incendiary-cloud',
  'spell-2014-inflict-wounds',
  'spell-2014-insect-plague',
  'spell-2014-intellect-fortress',
  'spell-2014-life-transference',
  'spell-2014-lightning-arrow',
  'spell-2014-lightning-bolt',
  'spell-2014-maddening-darkness',
  'spell-2014-maelstrom',
  'spell-2014-magic-missile',
  'spell-2014-mass-cure-wounds',
  'spell-2014-mass-healing-word',
  'spell-2014-maximilian-s-earthen-grasp',
  'spell-2014-melf-s-acid-arrow',
  'spell-2014-melf-s-minute-meteors',
  'spell-2014-mental-prison',
  'spell-2014-mind-spike',
  'spell-2014-moonbeam',
  'spell-2014-mordenkainen-s-sword',
  'spell-2014-negative-energy-flood',
  'spell-2014-otiluke-s-freezing-sphere',
  'spell-2014-phantasmal-killer',
  'spell-2014-power-word-pain',
  'spell-2014-prayer-of-healing',
  'spell-2014-raulothim-s-psychic-lance',
  'spell-2014-ray-of-sickness',
  'spell-2014-regenerate',
  'spell-2014-revivify',
  'spell-2014-rime-s-binding-ice',
  'spell-2014-scorching-ray',
  'spell-2014-searing-smite',
  'spell-2014-shadow-blade',
  'spell-2014-shatter',
  'spell-2014-sickening-radiance',
  'spell-2014-sleep',
  'spell-2014-snilloc-s-snowball-swarm',
  'spell-2014-spirit-guardians',
  'spell-2014-spirit-shroud',
  'spell-2014-spiritual-weapon',
  'spell-2014-staggering-smite',
  'spell-2014-steel-wind-strike',
  'spell-2014-sunbeam',
  'spell-2014-sunburst',
  'spell-2014-synaptic-static',
  'spell-2014-tasha-s-caustic-brew',
  'spell-2014-tasha-s-mind-whip',
  'spell-2014-tenser-s-transformation',
  'spell-2014-thunder-step',
  'spell-2014-thunderous-smite',
  'spell-2014-thunderwave',
  'spell-2014-tidal-wave',
  'spell-2014-vampiric-touch',
  'spell-2014-vitriolic-sphere',
  'spell-2014-wall-of-fire',
  'spell-2014-wall-of-light',
  'spell-2014-wall-of-thorns',
  'spell-2014-watery-sphere',
  'spell-2014-whirlwind',
  'spell-2014-witch-bolt',
  'spell-2014-wither-and-bloom',
] as const

describe('2014 法术效果摘要登记', () => {
  it('全部法术（含 XGtE/TCoE 扩展书）description 非空且不含占位文本', () => {
    expect(spells2014.length).toBeGreaterThan(400)
    for (const spell of spells2014) {
      expect(spell.description.trim(), `${spell.id} 应有原创效果摘要`).not.toBe('')
      expect(spell.description, `${spell.id} 不应是占位文本`).not.toContain('元数据条目')
      expect(spell.description, `${spell.id} 不应是占位文本`).not.toContain('效果以规则来源为准')
    }
  })

  it('summary 保持环级元数据语义，与 description 职责分离', () => {
    for (const spell of spells2014) {
      expect(spell.summary, `${spell.id} summary 应含环级/戏法说明`).toMatch(/环法术|戏法/)
    }
  })

  it('摘要包含核心决策信息（抽查基础书与扩展书法术）', () => {
    const byId = new Map(spells2014.map((spell) => [spell.id, spell]))
    expect(byId.get('spell-2014-fire-bolt')?.description).toContain('1d10')
    expect(byId.get('spell-2014-magic-missile')?.description).toContain('1d4')
    expect(byId.get('spell-2014-guidance')?.description).toContain('1d4')
    expect(byId.get('spell-2014-wish')?.description).toContain('愿望')
    expect(byId.get('spell-2014-fireball')?.description).toContain('8d6')
    // 扩展书法术抽查
    expect(byId.get('spell-2014-booming-blade')?.description).toContain('雷鸣')
    expect(byId.get('spell-2014-shadow-blade')?.description).toContain('2d8')
    expect(byId.get('spell-2014-toll-the-dead')?.description).toContain('1d12')
  })

  it('法术 id 全局唯一（摘要键与条目一一对应）', () => {
    const ids = spells2014.map((spell) => spell.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('所有伤害性戏法均含等级成长标注（5/11/17 或 TCoE 5 级起格式，双向防漏）', () => {
    const byId = new Map(spells2014.map((spell) => [spell.id, spell]))
    for (const id of GROWING_CANTRIP_IDS) {
      expect(byId.get(id)?.description, `${id} 应有戏法等级成长标注`).toMatch(/5\/11\/17|5 级起/)
    }
    for (const spell of spells2014) {
      if (spell.level === 0 && spell.description.includes('5/11/17')) {
        expect(GROWING_CANTRIP_IDS, `${spell.id} 不应带清单外戏法成长标注`).toContain(spell.id)
      }
    }
  })

  it('有高环施放成长条款的法术均含"每高 1 环"标注（双向防漏）', () => {
    const byId = new Map(spells2014.map((spell) => [spell.id, spell]))
    for (const id of UPCAST_GROWING_SPELL_IDS) {
      expect(byId.get(id)?.description, `${id} 应有高环施放成长标注`).toContain('每高')
    }
    for (const spell of spells2014) {
      if (spell.description.includes('每高')) {
        expect(UPCAST_GROWING_SPELL_IDS, `${spell.id} 不应带清单外成长标注`).toContain(spell.id)
      }
    }
  })
})
