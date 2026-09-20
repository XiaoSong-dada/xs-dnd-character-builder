import type { BackgroundStartingEquipmentRule, ClassStartingEquipmentRule, EquipmentGrant, StartingEquipmentOption } from '@/types/rules'
import { BARD_INSTRUMENT_ITEM_IDS } from '@/rules/data/bard-2024'
import { MONK_TOOL_ITEM_IDS } from '@/rules/data/monk-2024'

const g = (itemId: string, quantity = 1): EquipmentGrant => ({ itemId, quantity })
const gear = (id: string, grants: readonly EquipmentGrant[], gp = 0): StartingEquipmentOption => ({ id, label: `装备方案 ${id.slice(-1).toUpperCase()}`, grants, ...(gp ? { currency: { gp } } : {}) })
const gold = (id: string, gp: number): StartingEquipmentOption => ({ id, label: `${gp} GP`, grants: [], currency: { gp } })

export const backgroundEquipmentA2024: Readonly<Record<string, readonly EquipmentGrant[]>> = {
  acolyte: [g('equipment-2024-calligrapher-s-supplies'), g('equipment-2024-book'), g('equipment-2024-holy-symbol'), g('equipment-2024-parchment', 10), g('equipment-2024-robe')],
  artisan: [g('equipment-2024-pouch', 2), g('equipment-2024-clothes-traveler-s')],
  charlatan: [g('equipment-2024-forgery-kit'), g('equipment-2024-costume'), g('equipment-2024-clothes-fine')],
  criminal: [g('equipment-2024-dagger', 2), g('equipment-2024-thieves-tools'), g('equipment-2024-crowbar'), g('equipment-2024-pouch', 2), g('equipment-2024-clothes-traveler-s')],
  entertainer: [g('equipment-2024-costume', 2), g('equipment-2024-mirror'), g('equipment-2024-perfume'), g('equipment-2024-clothes-traveler-s')],
  farmer: [g('equipment-2024-sickle'), g('equipment-2024-carpenter-s-tools'), g('equipment-2024-healer-s-kit'), g('equipment-2024-pot-iron'), g('equipment-2024-shovel'), g('equipment-2024-clothes-traveler-s')],
  guard: [g('equipment-2024-spear'), g('equipment-2024-light-crossbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-lantern-hooded'), g('equipment-2024-manacles'), g('equipment-2024-quiver'), g('equipment-2024-clothes-traveler-s')],
  guide: [g('equipment-2024-shortbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-cartographer-s-tools'), g('equipment-2024-bedroll'), g('equipment-2024-quiver'), g('equipment-2024-tent'), g('equipment-2024-clothes-traveler-s')],
  hermit: [g('equipment-2024-quarterstaff'), g('equipment-2024-herbalism-kit'), g('equipment-2024-bedroll'), g('equipment-2024-book'), g('equipment-2024-lamp'), g('equipment-2024-oil', 3), g('equipment-2024-clothes-traveler-s')],
  merchant: [g('equipment-2024-navigator-s-tools'), g('equipment-2024-pouch', 2), g('equipment-2024-clothes-traveler-s')],
  noble: [g('equipment-2024-clothes-fine'), g('equipment-2024-perfume')],
  sage: [g('equipment-2024-quarterstaff'), g('equipment-2024-calligrapher-s-supplies'), g('equipment-2024-book'), g('equipment-2024-parchment', 8), g('equipment-2024-robe')],
  sailor: [g('equipment-2024-dagger'), g('equipment-2024-navigator-s-tools'), g('equipment-2024-rope'), g('equipment-2024-clothes-traveler-s')],
  scribe: [g('equipment-2024-calligrapher-s-supplies'), g('equipment-2024-clothes-fine'), g('equipment-2024-lamp'), g('equipment-2024-oil', 3), g('equipment-2024-parchment', 12)],
  soldier: [g('equipment-2024-spear'), g('equipment-2024-shortbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-healer-s-kit'), g('equipment-2024-quiver'), g('equipment-2024-clothes-traveler-s')],
  wayfarer: [g('equipment-2024-dagger', 2), g('equipment-2024-thieves-tools'), g('equipment-2024-bedroll'), g('equipment-2024-pouch', 2), g('equipment-2024-clothes-traveler-s')],

  // ===== G 批次 G-F2：第三方 2024 写法背景的装备方案 A（来源默认关闭）=====
  // 歪曲之月（The Crooked Moon）
  'tp-amnesiac': [g('equipment-2024-book'), g('equipment-2024-ink'), g('equipment-2024-ink-pen'), g('equipment-2024-clothes-traveler-s')],
  'tp-rest-warden': [g('equipment-2024-mason-s-tools'), g('equipment-2024-lantern-hooded'), g('equipment-2024-oil', 3), g('equipment-2024-shovel'), g('equipment-2024-clothes-traveler-s')],
  'tp-experiment': [g('equipment-2024-alchemist-s-supplies'), g('equipment-2024-manacles'), g('equipment-2024-perfume'), g('equipment-2024-clothes-traveler-s')],
  'tp-cultist': [g('equipment-2024-calligrapher-s-supplies'), g('equipment-2024-costume'), g('equipment-2024-holy-symbol'), g('equipment-2024-clothes-traveler-s')],
  'tp-crossroads-gambler': [g('equipment-2024-dice'), g('equipment-2024-clothes-fine'), g('equipment-2024-caltrops')],
  'tp-ghostlight-passenger': [g('equipment-2024-smith-s-tools'), g('equipment-2024-lantern-bullseye'), g('equipment-2024-oil', 3), g('equipment-2024-clothes-fine')],
  'tp-reflected-wanderer': [g('equipment-2024-disguise-kit'), g('equipment-2024-mirror'), g('equipment-2024-clothes-traveler-s')],
  'tp-druskenvald-dweller': [g('equipment-2024-carpenter-s-tools'), g('equipment-2024-map'), g('equipment-2024-clothes-traveler-s')],
  'tp-night-stalker': [g('equipment-2024-leatherworker-s-tools'), g('equipment-2024-book'), g('equipment-2024-lantern-hooded'), g('equipment-2024-hunting-trap'), g('equipment-2024-oil', 3), g('equipment-2024-clothes-traveler-s')],
  'tp-wicker-weaver': [g('equipment-2024-quarterstaff'), g('equipment-2024-weaver-s-tools'), g('equipment-2024-basket'), g('equipment-2024-book'), g('equipment-2024-pot-iron'), g('equipment-2024-clothes-traveler-s')],
  'tp-reveler': [g('equipment-2024-musical-instrument'), g('equipment-2024-ball-bearings'), g('equipment-2024-costume'), g('equipment-2024-hunting-trap'), g('equipment-2024-manacles'), g('equipment-2024-torch', 3), g('equipment-2024-clothes-traveler-s')],
  'tp-crimson-aspirant': [g('equipment-2024-herbalism-kit'), g('equipment-2024-dagger'), g('equipment-2024-clothes-fine'), g('equipment-2024-healer-s-kit'), g('equipment-2024-vial', 3)],
  'tp-scholar-of-the-forbidden': [g('equipment-2024-calligrapher-s-supplies'), g('equipment-2024-book'), g('equipment-2024-ink'), g('equipment-2024-ink-pen'), g('equipment-2024-lamp'), g('equipment-2024-oil', 3), g('equipment-2024-paper', 10)],
  // 德拉肯海姆（Dungeons of Drakkenheim）
  'tp-changeling-traveler': [g('equipment-2024-dagger', 2), g('equipment-2024-thieves-tools'), g('equipment-2024-bedroll'), g('equipment-2024-pouch', 2), g('equipment-2024-clothes-traveler-s')],
  'tp-malenti': [g('equipment-2024-dagger'), g('equipment-2024-thieves-tools'), g('equipment-2024-clothes-traveler-s')],
  'tp-inquisitor': [g('equipment-2024-book'), g('equipment-2024-holy-symbol'), g('equipment-2024-manacles'), g('equipment-2024-clothes-traveler-s')],
  'tp-beast-hunter': [g('equipment-2024-clothes-traveler-s'), g('equipment-2024-healer-s-kit'), g('equipment-2024-herbalism-kit'), g('equipment-2024-dagger'), g('equipment-2024-flask')],
  // 火炬光下的克苏鲁：原书仅给 50 GP（A 项为空，B 项即 50 GP）
  'tp-mythos-investigator': [],

  // ===== G2-B：艾伯伦：奇械锻炉（EFA 2025）家系后裔与通用背景 =====
  // A 项中的 GP 为原书「A 选项」随附金币，统一按 50 GP 基准折入 B 项口径；
  // 需要精确金额的场景由玩家按原书裁定（本项目 2024 装备方案 B 恒为 50 GP）。
  'efa-jorasco-heir': [g('equipment-2024-herbalism-kit'), g('equipment-2024-clothes-fine'), g('equipment-2024-healer-s-kit')],
  'efa-ghallanda-heir': [g('equipment-2024-cook-s-utensils'), g('equipment-2024-clothes-fine'), g('equipment-2024-pot-iron'), g('equipment-2024-lamp'), g('equipment-2024-oil', 5), g('equipment-2024-perfume')],
  'efa-cannith-heir': [g('equipment-2024-crowbar'), g('equipment-2024-clothes-fine'), g('equipment-2024-pouch', 2)],
  'efa-tharashk-heir': [g('equipment-2024-climber-s-kit'), g('equipment-2024-clothes-fine'), g('equipment-2024-hunting-trap'), g('equipment-2024-manacles')],
  'efa-kundarak-heir': [g('equipment-2024-thieves-tools'), g('equipment-2024-clothes-fine')],
  'efa-medani-heir': [g('equipment-2024-disguise-kit'), g('equipment-2024-clothes-fine')],
  'efa-orien-heir': [g('equipment-2024-cartographer-s-tools'), g('equipment-2024-clothes-fine'), g('equipment-2024-map'), g('equipment-2024-case-map-or-scroll')],
  'efa-vadalis-heir': [g('equipment-2024-herbalism-kit'), g('equipment-2024-clothes-fine'), g('equipment-2024-net')],
  'efa-thuranni-heir': [g('equipment-2024-costume'), g('equipment-2024-clothes-fine')],
  'efa-sivis-heir': [g('equipment-2024-calligrapher-s-supplies'), g('equipment-2024-clothes-fine'), g('equipment-2024-ink'), g('equipment-2024-ink-pen', 5), g('equipment-2024-paper', 30), g('equipment-2024-parchment', 9)],
  'efa-phiarlan-heir': [g('equipment-2024-disguise-kit'), g('equipment-2024-clothes-fine')],
  'efa-deneith-heir': [g('equipment-2024-spear'), g('equipment-2024-shortbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-clothes-fine'), g('equipment-2024-healer-s-kit'), g('equipment-2024-quiver')],
  'efa-lyrandar-heir': [g('equipment-2024-navigator-s-tools'), g('equipment-2024-clothes-fine')],
  'efa-aberrant-heir': [g('equipment-2024-dagger'), g('equipment-2024-disguise-kit'), g('equipment-2024-costume'), g('equipment-2024-clothes-traveler-s')],
  'efa-inquisitive': [g('equipment-2024-thieves-tools'), g('equipment-2024-lantern-bullseye'), g('equipment-2024-crowbar'), g('equipment-2024-oil', 10), g('equipment-2024-clothes-traveler-s')],
  'efa-archaeologist': [g('equipment-2024-cartographer-s-tools'), g('equipment-2024-lantern-bullseye'), g('equipment-2024-map'), g('equipment-2024-case-map-or-scroll'), g('equipment-2024-shovel'), g('equipment-2024-tent'), g('equipment-2024-clothes-traveler-s')],
  'efa-house-agent': [g('equipment-2024-clothes-fine')],

  // ===== G2-C：被遗忘的国度：费伦冒险（FR:AI 2025）=====
  'fr-ai-ice-fisher': [g('equipment-2024-woodcarver-s-tools'), g('equipment-2024-basket'), g('equipment-2024-block-and-tackle'), g('equipment-2024-bucket'), g('equipment-2024-chain'), g('equipment-2024-hunting-trap'), g('equipment-2024-net'), g('equipment-2024-pole'), g('equipment-2024-rations', 3), g('equipment-2024-rope'), g('equipment-2024-clothes-traveler-s')],
  'fr-ai-spellfire-initiate': [g('equipment-2024-arcane-focus'), g('equipment-2024-pouch', 2), g('equipment-2024-clothes-traveler-s')],
  'fr-ai-genie-touched': [g('equipment-2024-light-hammer'), g('equipment-2024-glassblower-s-tools'), g('equipment-2024-clothes-fine'), g('equipment-2024-lamp'), g('equipment-2024-oil', 3), g('equipment-2024-waterskin')],
  'fr-ai-shadowmasters-exile': [g('equipment-2024-dagger', 2), g('equipment-2024-thieves-tools'), g('equipment-2024-caltrops'), g('equipment-2024-costume'), g('equipment-2024-grappling-hook'), g('equipment-2024-spikes-iron'), g('equipment-2024-mirror'), g('equipment-2024-pouch', 2), g('equipment-2024-robe'), g('equipment-2024-clothes-traveler-s')],
  'fr-ai-zhentarim-mercenary': [g('equipment-2024-club'), g('equipment-2024-dagger'), g('equipment-2024-forgery-kit'), g('equipment-2024-clothes-fine'), g('equipment-2024-lantern-hooded'), g('equipment-2024-oil', 3), g('equipment-2024-pouch', 2), g('equipment-2024-string'), g('equipment-2024-tinderbox')],
  'fr-ai-moonwell-pilgrim': [g('equipment-2024-quarterstaff'), g('equipment-2024-painter-s-supplies'), g('equipment-2024-bedroll'), g('equipment-2024-bell'), g('equipment-2024-pouch'), g('equipment-2024-robe'), g('equipment-2024-string'), g('equipment-2024-clothes-traveler-s'), g('equipment-2024-waterskin')],
  'fr-ai-dead-magic-dweller': [g('equipment-2024-greatclub'), g('equipment-2024-leatherworker-s-tools'), g('equipment-2024-bedroll'), g('equipment-2024-bucket'), g('equipment-2024-healer-s-kit'), g('equipment-2024-pole'), g('equipment-2024-rations', 3), g('equipment-2024-tent'), g('equipment-2024-tinderbox'), g('equipment-2024-torch', 5), g('equipment-2024-clothes-traveler-s'), g('equipment-2024-waterskin')],
  'fr-ai-flaming-fist-mercenary': [g('equipment-2024-mace'), g('equipment-2024-smith-s-tools'), g('equipment-2024-clothes-fine'), g('equipment-2024-manacles'), g('equipment-2024-ram-portable')],
  'fr-ai-chondathan-freebooter': [g('equipment-2024-dagger'), g('equipment-2024-weaver-s-tools'), g('equipment-2024-backpack'), g('equipment-2024-ball-bearings'), g('equipment-2024-basket'), g('equipment-2024-bedroll'), g('equipment-2024-bucket'), g('equipment-2024-rations', 3), g('equipment-2024-rope'), g('equipment-2024-signal-whistle'), g('equipment-2024-clothes-traveler-s')],
  'fr-ai-mulhorandi-tomb-raider': [g('equipment-2024-dagger'), g('equipment-2024-light-hammer'), g('equipment-2024-mason-s-tools'), g('equipment-2024-backpack'), g('equipment-2024-bedroll'), g('equipment-2024-crowbar'), g('equipment-2024-ladder'), g('equipment-2024-pole'), g('equipment-2024-pouch', 2), g('equipment-2024-rope'), g('equipment-2024-string'), g('equipment-2024-tinderbox'), g('equipment-2024-torch', 5), g('equipment-2024-clothes-traveler-s'), g('equipment-2024-waterskin')],
  'fr-ai-harper': [g('equipment-2024-disguise-kit'), g('equipment-2024-bedroll'), g('equipment-2024-costume'), g('equipment-2024-grappling-hook'), g('equipment-2024-rope'), g('equipment-2024-clothes-traveler-s')],
  'fr-ai-purple-dragon-squire': [g('equipment-2024-spear'), g('equipment-2024-navigator-s-tools'), g('equipment-2024-clothes-fine')],
  'fr-ai-emerald-enclave-caretaker': [g('equipment-2024-shortbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-herbalism-kit'), g('equipment-2024-bedroll'), g('equipment-2024-blanket'), g('equipment-2024-pouch'), g('equipment-2024-tent'), g('equipment-2024-clothes-traveler-s')],
  'fr-ai-knight-of-the-gauntlet': [g('equipment-2024-spear'), g('equipment-2024-smith-s-tools'), g('equipment-2024-lantern-bullseye'), g('equipment-2024-holy-symbol'), g('equipment-2024-manacles'), g('equipment-2024-oil', 5), g('equipment-2024-tinderbox'), g('equipment-2024-clothes-traveler-s')],
  'fr-ai-rashemi-wanderer': [g('equipment-2024-cartographer-s-tools'), g('equipment-2024-backpack'), g('equipment-2024-bedroll'), g('equipment-2024-lantern-hooded'), g('equipment-2024-oil', 3), g('equipment-2024-rope'), g('equipment-2024-tinderbox'), g('equipment-2024-clothes-traveler-s'), g('equipment-2024-waterskin')],
  'fr-ai-mythalkeeper': [g('equipment-2024-quarterstaff'), g('equipment-2024-jeweler-s-tools'), g('equipment-2024-perfume'), g('equipment-2024-pouch'), g('equipment-2024-robe'), g('equipment-2024-shovel'), g('equipment-2024-string'), g('equipment-2024-waterskin')],
  'fr-ai-lords-alliance-vassal': [g('equipment-2024-javelin', 2), g('equipment-2024-calligrapher-s-supplies'), g('equipment-2024-clothes-fine'), g('equipment-2024-ink'), g('equipment-2024-ink-pen', 5), g('equipment-2024-parchment', 9)],
  'fr-ai-dragon-cultist': [g('equipment-2024-calligrapher-s-supplies'), g('equipment-2024-dagger'), g('equipment-2024-bottle-glass'), g('equipment-2024-lamp'), g('equipment-2024-manacles'), g('equipment-2024-oil', 5), g('equipment-2024-pouch', 2), g('equipment-2024-robe'), g('equipment-2024-rope')],

  // ===== G2-C：被遗忘的国度：费伦英雄（FR:HF 2025）=====
  'fr-hf-vampire-survivor': [g('equipment-2024-woodcarver-s-tools'), g('equipment-2024-crowbar'), g('equipment-2024-lantern-hooded'), g('equipment-2024-holy-symbol'), g('equipment-2024-holy-water'), g('equipment-2024-mirror'), g('equipment-2024-oil', 3), g('equipment-2024-tinderbox'), g('equipment-2024-clothes-traveler-s'), g('equipment-2024-waterskin')],
  'fr-hf-vampire-devotee': [g('equipment-2024-cook-s-utensils'), g('equipment-2024-clothes-fine'), g('equipment-2024-bottle-glass', 2), g('equipment-2024-healer-s-kit'), g('equipment-2024-perfume'), g('equipment-2024-lamp'), g('equipment-2024-oil', 3), g('equipment-2024-waterskin')],
  'fr-hf-carouser': [g('equipment-2024-dagger'), g('equipment-2024-clothes-fine'), g('equipment-2024-bottle-glass'), g('equipment-2024-mirror'), g('equipment-2024-perfume'), g('equipment-2024-pouch'), g('equipment-2024-tinderbox')],

  // ===== G2-C：鸦阁魔域：魔障深藏（RTHW 2025）=====
  'rthw-haunted-one': [g('equipment-2024-crowbar'), g('equipment-2024-holy-water'), g('equipment-2024-mirror'), g('equipment-2024-oil', 2), g('equipment-2024-signal-whistle'), g('equipment-2024-tinderbox'), g('equipment-2024-clothes-traveler-s'), g('equipment-2024-torch', 5), g('equipment-2024-waterskin')],
  'rthw-investigator': [g('equipment-2024-disguise-kit'), g('equipment-2024-manacles'), g('equipment-2024-shovel'), g('equipment-2024-clothes-traveler-s'), g('equipment-2024-vial', 3)],
  'rthw-mist-wanderer': [g('equipment-2024-lamp'), g('equipment-2024-oil', 5), g('equipment-2024-pouch'), g('equipment-2024-rope'), g('equipment-2024-tinderbox'), g('equipment-2024-clothes-traveler-s')],
  'rthw-spirit-medium': [g('equipment-2024-dagger'), g('equipment-2024-basket'), g('equipment-2024-bell'), g('equipment-2024-candle', 8), g('equipment-2024-ink'), g('equipment-2024-ink-pen'), g('equipment-2024-paper', 5), g('equipment-2024-tinderbox'), g('equipment-2024-clothes-traveler-s')],

  // ===== G2-D：启封奥秘（AU 2025）第一章背景 =====
  'au-ninth-quill-agent': [g('equipment-2024-dagger'), g('equipment-2024-light-hammer'), g('equipment-2024-thieves-tools'), g('equipment-2024-spikes-iron'), g('equipment-2024-rope'), g('equipment-2024-clothes-traveler-s')],
  'au-bejeweled-conclave-spy': [g('equipment-2024-disguise-kit'), g('equipment-2024-clothes-fine'), g('equipment-2024-perfume')],
  'au-cosmic-dawn-experiment': [g('equipment-2024-backpack'), g('equipment-2024-robe'), g('equipment-2024-clothes-traveler-s')],
  'au-covenant-of-the-grave-recruit': [g('equipment-2024-dagger'), g('equipment-2024-herbalism-kit'), g('equipment-2024-book'), g('equipment-2024-shovel')],
  'au-crucible-storm-chaser': [g('equipment-2024-glassblower-s-tools'), g('equipment-2024-backpack'), g('equipment-2024-rope'), g('equipment-2024-clothes-traveler-s')],
  'au-familiar-trainer': [g('equipment-2024-quarterstaff'), g('equipment-2024-bedroll'), g('equipment-2024-bell'), g('equipment-2024-string'), g('equipment-2024-tinderbox'), g('equipment-2024-clothes-traveler-s'), g('equipment-2024-waterskin')],
  'au-horizon-weaver-initiate': [g('equipment-2024-shortbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-weaver-s-tools'), g('equipment-2024-map'), g('equipment-2024-quiver'), g('equipment-2024-rope'), g('equipment-2024-clothes-traveler-s')],
  'au-phantasmic-circus-trouper': [g('equipment-2024-disguise-kit'), g('equipment-2024-costume'), g('equipment-2024-mirror'), g('equipment-2024-clothes-traveler-s')],
  'au-seer-apprentice': [g('equipment-2024-navigator-s-tools'), g('equipment-2024-candle', 8), g('equipment-2024-ink'), g('equipment-2024-ink-pen'), g('equipment-2024-parchment', 9), g('equipment-2024-pouch'), g('equipment-2024-tinderbox'), g('equipment-2024-clothes-traveler-s')],
  'au-ward-of-the-sheltering-hands': [g('equipment-2024-cook-s-utensils'), g('equipment-2024-blanket'), g('equipment-2024-healer-s-kit'), g('equipment-2024-lamp'), g('equipment-2024-oil', 3), g('equipment-2024-tinderbox'), g('equipment-2024-clothes-traveler-s'), g('equipment-2024-waterskin')],

  // ===== G2-E：吸血鬼：避世潜藏-血之缚（VtM 第三方）=====
  'tp-vtm-ritualist': [g('equipment-2024-alchemist-s-supplies'), g('equipment-2024-dagger'), g('equipment-2024-ink'), g('equipment-2024-book'), g('equipment-2024-clothes-traveler-s')],
  'tp-vtm-scholar-of-the-hunt': [g('equipment-2024-manacles'), g('equipment-2024-mirror'), g('equipment-2024-clothes-traveler-s')],
  'tp-vtm-ghoul': [g('equipment-2024-dagger'), g('equipment-2024-lantern-hooded'), g('equipment-2024-shortbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-clothes-traveler-s')],
  'tp-vtm-thrall': [g('equipment-2024-healer-s-kit'), g('equipment-2024-lantern-bullseye'), g('equipment-2024-clothes-traveler-s')],
  'tp-vtm-touchstone': [g('equipment-2024-clothes-traveler-s')],

  // ===== G2-E：Beyond Drops 26.5（第三方试行内容）=====
  'tp-beyond-pact-seeker': [g('equipment-2024-calligrapher-s-supplies'), g('equipment-2024-book'), g('equipment-2024-parchment', 10), g('equipment-2024-clothes-traveler-s')],
}

export const classStartingEquipment2024: readonly ClassStartingEquipmentRule[] = [
  { classId: 'class-2024-barbarian', fixedGrants: [], groups: [{ id: 'barbarian-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('barbarian-2024-a', [g('equipment-2024-greataxe'), g('equipment-2024-handaxe', 4), g('equipment-2024-explorer-s-pack')], 15),
    gold('barbarian-2024-b', 75),
  ] }] },
  { classId: 'class-2024-bard', fixedGrants: [], groups: [{ id: 'bard-2024-starting', title: '选择职业初始装备或金币', options: [
    { ...gear('bard-2024-a', [g('equipment-2024-leather-armor'), g('equipment-2024-dagger', 2), g('equipment-2024-entertainer-s-pack')], 19), pick: { count: 1, allowedItemIds: BARD_INSTRUMENT_ITEM_IDS } },
    gold('bard-2024-b', 90),
  ] }] },
  { classId: 'class-2024-cleric', fixedGrants: [], groups: [{ id: 'cleric-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('cleric-2024-a', [g('equipment-2024-chain-shirt'), g('equipment-2024-shield'), g('equipment-2024-mace'), g('equipment-2024-holy-symbol'), g('equipment-2024-priest-s-pack')], 7),
    gold('cleric-2024-b', 110),
  ] }] },
  { classId: 'class-2024-druid', fixedGrants: [], groups: [{ id: 'druid-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('druid-2024-a', [g('equipment-2024-leather-armor'), g('equipment-2024-shield'), g('equipment-2024-sickle'), g('equipment-2024-wooden-staff-also-a-quarterstaff'), g('equipment-2024-explorer-s-pack'), g('equipment-2024-herbalism-kit')], 9),
    gold('druid-2024-b', 50),
  ] }] },
  { classId: 'class-2024-fighter', fixedGrants: [], groups: [{ id: 'fighter-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('fighter-2024-a', [g('equipment-2024-chain-mail'), g('equipment-2024-greatsword'), g('equipment-2024-flail'), g('equipment-2024-javelin', 8), g('equipment-2024-dungeoneer-s-pack')], 4),
    gear('fighter-2024-b', [g('equipment-2024-studded-leather-armor'), g('equipment-2024-scimitar'), g('equipment-2024-shortsword'), g('equipment-2024-longbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-quiver'), g('equipment-2024-dungeoneer-s-pack')], 11), gold('fighter-2024-c', 155),
  ] }] },
  { classId: 'class-2024-monk', fixedGrants: [], groups: [{ id: 'monk-2024-starting', title: '选择职业初始装备或金币', options: [
    { ...gear('monk-2024-a', [g('equipment-2024-spear'), g('equipment-2024-dagger', 5), g('equipment-2024-explorer-s-pack')], 11), pick: { count: 1, allowedItemIds: MONK_TOOL_ITEM_IDS } },
    gold('monk-2024-b', 50),
  ] }] },
  { classId: 'class-2024-ranger', fixedGrants: [], groups: [{ id: 'ranger-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('ranger-2024-a', [g('equipment-2024-studded-leather-armor'), g('equipment-2024-scimitar'), g('equipment-2024-shortsword'), g('equipment-2024-longbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-quiver'), g('equipment-2024-sprig-of-mistletoe'), g('equipment-2024-explorer-s-pack')], 7),
    gold('ranger-2024-b', 150),
  ] }] },
  { classId: 'class-2024-rogue', fixedGrants: [], groups: [{ id: 'rogue-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('rogue-2024-a', [g('equipment-2024-leather-armor'), g('equipment-2024-dagger', 2), g('equipment-2024-shortsword'), g('equipment-2024-shortbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-quiver'), g('equipment-2024-thieves-tools'), g('equipment-2024-burglar-s-pack')], 8),
    gold('rogue-2024-b', 100),
  ] }] },
  { classId: 'class-2024-paladin', fixedGrants: [], groups: [{ id: 'paladin-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('paladin-2024-a', [g('equipment-2024-chain-mail'), g('equipment-2024-shield'), g('equipment-2024-longsword'), g('equipment-2024-javelin', 6), g('equipment-2024-holy-symbol'), g('equipment-2024-priest-s-pack')], 9),
    gold('paladin-2024-b', 150),
  ] }] },
  { classId: 'class-2024-sorcerer', fixedGrants: [], groups: [{ id: 'sorcerer-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('sorcerer-2024-a', [g('equipment-2024-spear'), g('equipment-2024-dagger', 2), g('equipment-2024-crystal'), g('equipment-2024-dungeoneer-s-pack')], 28),
    gold('sorcerer-2024-b', 50),
  ] }] },
  { classId: 'class-2024-warlock', fixedGrants: [], groups: [{ id: 'warlock-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('warlock-2024-a', [g('equipment-2024-leather-armor'), g('equipment-2024-sickle'), g('equipment-2024-dagger', 2), g('equipment-2024-orb'), g('equipment-2024-book'), g('equipment-2024-scholar-s-pack')], 15),
    gold('warlock-2024-b', 100),
  ] }] },
  { classId: 'class-2024-wizard', fixedGrants: [], groups: [{ id: 'wizard-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('wizard-2024-a', [g('equipment-2024-dagger', 2), g('equipment-2024-arcane-focus'), g('equipment-2024-robe'), g('equipment-2024-book'), g('equipment-2024-scholar-s-pack')], 5), gold('wizard-2024-b', 55),
  ] }] },
  { classId: 'class-2024-ua-artificer', fixedGrants: [], groups: [{ id: 'artificer-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('artificer-2024-a', [g('equipment-2024-studded-leather-armor'), g('equipment-2024-dagger'), g('equipment-2024-thieves-tools'), g('equipment-2024-tinker-s-tools'), g('equipment-2024-dungeoneer-s-pack')], 16),
    gold('artificer-2024-b', 150),
  ] }] },
  { classId: 'class-2024-ua-psion', fixedGrants: [], groups: [{ id: 'psion-2024-starting', title: '选择职业初始装备或金币', options: [
    gear('psion-2024-a', [g('equipment-2024-spear'), g('equipment-2024-dagger', 2), g('equipment-2024-light-crossbow'), g('equipment-2024-ammunition', 20), g('equipment-2024-case-map-or-scroll'), g('equipment-2024-dungeoneer-s-pack')], 6),
    gold('psion-2024-b', 50),
  ] }] },
]

export const backgroundStartingEquipment2024: readonly BackgroundStartingEquipmentRule[] = Object.entries(backgroundEquipmentA2024).map(([slug, grants]) => ({
  backgroundId: `background-2024-${slug}`,
  groups: [{ id: `background-2024-${slug}-starting`, title: '选择背景初始装备或金币', options: [gear(`background-2024-${slug}-a`, grants), gold(`background-2024-${slug}-b`, 50)] }],
}))
