import type {
  BackgroundStartingEquipmentRule,
  ClassStartingEquipmentRule,
  EquipmentGrant,
  StartingEquipmentGroup,
  StartingEquipmentOption,
} from '@/types/rules'

const g = (itemId: string, quantity = 1): EquipmentGrant => ({ itemId, quantity })
const option = (
  id: string,
  label: string,
  grants: readonly EquipmentGrant[] = [],
  pick?: StartingEquipmentOption['pick'],
): StartingEquipmentOption => ({ id, label, grants, ...(pick ? { pick } : {}) })
const group = (id: string, title: string, options: readonly StartingEquipmentOption[]): StartingEquipmentGroup => ({ id, title, options })

const simpleWeaponKinds = ['simple-melee', 'simple-ranged'] as const
const simpleMeleeKinds = ['simple-melee'] as const
const martialWeaponKinds = ['martial-melee', 'martial-ranged'] as const
const martialMeleeKinds = ['martial-melee'] as const

export const classStartingEquipment2014: readonly ClassStartingEquipmentRule[] = [
  {
    classId: 'class-2014-barbarian',
    fixedGrants: [g('explorer-pack'), g('javelin', 4)],
    groups: [
      group('barbarian-primary', '选择主要武器', [
        option('greataxe', '巨斧', [g('greataxe')]),
        option('martial-melee', '任意一件军用近战武器', [], { count: 1, allowedWeaponKinds: martialMeleeKinds }),
      ]),
      group('barbarian-secondary', '选择备用武器', [
        option('handaxes', '两把手斧', [g('handaxe', 2)]),
        option('simple-weapon', '任意一件简易武器', [], { count: 1, allowedWeaponKinds: simpleWeaponKinds }),
      ]),
    ],
  },
  {
    classId: 'class-2014-bard',
    fixedGrants: [g('leather-armor'), g('dagger')],
    groups: [
      group('bard-weapon', '选择武器', [
        option('rapier', '刺剑', [g('rapier')]),
        option('longsword', '长剑', [g('longsword')]),
        option('simple-weapon', '任意一件简易武器', [], { count: 1, allowedWeaponKinds: simpleWeaponKinds }),
      ]),
      group('bard-pack', '选择冒险套组', [
        option('diplomat-pack', '外交官套组', [g('diplomat-pack')]),
        option('entertainer-pack', '艺人套组', [g('entertainer-pack')]),
      ]),
      group('bard-instrument', '选择乐器', [
        option('lute', '鲁特琴', [g('lute')]),
        option('instrument', '任意其他乐器', [g('musical-instrument')]),
      ]),
    ],
  },
  {
    classId: 'class-2014-cleric',
    fixedGrants: [g('shield'), g('holy-symbol')],
    groups: [
      group('cleric-weapon', '选择近战武器', [
        option('mace', '硬头锤', [g('mace')]),
        option('warhammer', '战锤（具有熟练时）', [g('warhammer')]),
      ]),
      group('cleric-armor', '选择护甲', [
        option('scale-mail', '鳞甲', [g('scale-mail')]),
        option('leather-armor', '皮甲', [g('leather-armor')]),
        option('chain-mail', '链甲（具有熟练时）', [g('chain-mail')]),
      ]),
      group('cleric-ranged', '选择远程或备用武器', [
        option('crossbow', '轻弩和20支弩矢', [g('light-crossbow'), g('bolts', 20)]),
        option('simple-weapon', '任意一件简易武器', [], { count: 1, allowedWeaponKinds: simpleWeaponKinds }),
      ]),
      group('cleric-pack', '选择冒险套组', [
        option('priest-pack', '祭司套组', [g('priest-pack')]),
        option('explorer-pack', '探索套组', [g('explorer-pack')]),
      ]),
    ],
  },
  {
    classId: 'class-2014-druid',
    fixedGrants: [g('leather-armor'), g('explorer-pack'), g('druidic-focus')],
    groups: [
      group('druid-shield', '选择盾牌或武器', [
        option('shield', '木质盾牌', [g('shield')]),
        option('simple-weapon', '任意一件简易武器', [], { count: 1, allowedWeaponKinds: simpleWeaponKinds }),
      ]),
      group('druid-weapon', '选择主要武器', [
        option('scimitar', '弯刀', [g('scimitar')]),
        option('simple-melee', '任意一件简易近战武器', [], { count: 1, allowedWeaponKinds: simpleMeleeKinds }),
      ]),
    ],
  },
  {
    classId: 'class-2014-fighter',
    fixedGrants: [],
    groups: [
      group('fighter-armor', '选择护甲路线', [
        option('chain-mail', '链甲', [g('chain-mail')]),
        option('leather-bow', '皮甲、长弓、20支箭', [g('leather-armor'), g('longbow'), g('arrows', 20), g('quiver')]),
      ]),
      group('fighter-primary', '选择主要武器组合', [
        option('weapon-shield', '一件军用武器和盾牌', [g('shield')], { count: 1, allowedWeaponKinds: martialWeaponKinds }),
        option('two-weapons', '两件军用武器', [], { count: 2, allowedWeaponKinds: martialWeaponKinds }),
      ]),
      group('fighter-ranged', '选择远程或备用武器', [
        option('crossbow', '轻弩和20支弩矢', [g('light-crossbow'), g('bolts', 20)]),
        option('handaxes', '两把手斧', [g('handaxe', 2)]),
      ]),
      group('fighter-pack', '选择冒险套组', [
        option('dungeoneer-pack', '地城探险套组', [g('dungeoneer-pack')]),
        option('explorer-pack', '探索套组', [g('explorer-pack')]),
      ]),
    ],
  },
  {
    classId: 'class-2014-monk',
    fixedGrants: [g('dart', 10)],
    groups: [
      group('monk-weapon', '选择武器', [
        option('shortsword', '短剑', [g('shortsword')]),
        option('simple-weapon', '任意一件简易武器', [], { count: 1, allowedWeaponKinds: simpleWeaponKinds }),
      ]),
      group('monk-pack', '选择冒险套组', [
        option('dungeoneer-pack', '地城探险套组', [g('dungeoneer-pack')]),
        option('explorer-pack', '探索套组', [g('explorer-pack')]),
      ]),
    ],
  },
  {
    classId: 'class-2014-paladin',
    fixedGrants: [g('chain-mail'), g('holy-symbol')],
    groups: [
      group('paladin-primary', '选择主要武器组合', [
        option('weapon-shield', '一件军用武器和盾牌', [g('shield')], { count: 1, allowedWeaponKinds: martialWeaponKinds }),
        option('two-weapons', '两件军用武器', [], { count: 2, allowedWeaponKinds: martialWeaponKinds }),
      ]),
      group('paladin-secondary', '选择备用武器', [
        option('javelins', '五支标枪', [g('javelin', 5)]),
        option('simple-melee', '任意一件简易近战武器', [], { count: 1, allowedWeaponKinds: simpleMeleeKinds }),
      ]),
      group('paladin-pack', '选择冒险套组', [
        option('priest-pack', '祭司套组', [g('priest-pack')]),
        option('explorer-pack', '探索套组', [g('explorer-pack')]),
      ]),
    ],
  },
  {
    classId: 'class-2014-ranger',
    fixedGrants: [g('longbow'), g('arrows', 20), g('quiver')],
    groups: [
      group('ranger-armor', '选择护甲', [
        option('scale-mail', '鳞甲', [g('scale-mail')]),
        option('leather-armor', '皮甲', [g('leather-armor')]),
      ]),
      group('ranger-weapons', '选择近战武器', [
        option('shortswords', '两把短剑', [g('shortsword', 2)]),
        option('simple-melee', '两件简易近战武器', [], { count: 2, allowedWeaponKinds: simpleMeleeKinds }),
      ]),
      group('ranger-pack', '选择冒险套组', [
        option('dungeoneer-pack', '地城探险套组', [g('dungeoneer-pack')]),
        option('explorer-pack', '探索套组', [g('explorer-pack')]),
      ]),
    ],
  },
  {
    classId: 'class-2014-rogue',
    fixedGrants: [g('leather-armor'), g('dagger', 2), g('thieves-tools')],
    groups: [
      group('rogue-primary', '选择主要武器', [
        option('rapier', '刺剑', [g('rapier')]),
        option('shortsword', '短剑', [g('shortsword')]),
      ]),
      group('rogue-secondary', '选择远程或备用武器', [
        option('shortbow', '短弓、箭袋和20支箭', [g('shortbow'), g('quiver'), g('arrows', 20)]),
        option('shortsword', '短剑', [g('shortsword')]),
      ]),
      group('rogue-pack', '选择冒险套组', [
        option('burglar-pack', '窃贼套组', [g('burglar-pack')]),
        option('dungeoneer-pack', '地城探险套组', [g('dungeoneer-pack')]),
        option('explorer-pack', '探索套组', [g('explorer-pack')]),
      ]),
    ],
  },
  {
    classId: 'class-2014-sorcerer',
    fixedGrants: [g('dagger', 2)],
    groups: [
      group('sorcerer-weapon', '选择武器', [
        option('crossbow', '轻弩和20支弩矢', [g('light-crossbow'), g('bolts', 20)]),
        option('simple-weapon', '任意一件简易武器', [], { count: 1, allowedWeaponKinds: simpleWeaponKinds }),
      ]),
      group('sorcerer-focus', '选择施法用品', [
        option('component-pouch', '材料包', [g('component-pouch')]),
        option('arcane-focus', '奥术法器', [g('arcane-focus')]),
      ]),
      group('sorcerer-pack', '选择冒险套组', [
        option('dungeoneer-pack', '地城探险套组', [g('dungeoneer-pack')]),
        option('explorer-pack', '探索套组', [g('explorer-pack')]),
      ]),
    ],
  },
  {
    classId: 'class-2014-warlock',
    fixedGrants: [g('leather-armor'), g('dagger', 2)],
    groups: [
      group('warlock-ranged', '选择远程或备用武器', [
        option('crossbow', '轻弩和20支弩矢', [g('light-crossbow'), g('bolts', 20)]),
        option('simple-weapon', '任意一件简易武器', [], { count: 1, allowedWeaponKinds: simpleWeaponKinds }),
      ]),
      group('warlock-focus', '选择施法用品', [
        option('component-pouch', '材料包', [g('component-pouch')]),
        option('arcane-focus', '奥术法器', [g('arcane-focus')]),
      ]),
      group('warlock-pack', '选择冒险套组', [
        option('scholar-pack', '学者套组', [g('scholar-pack')]),
        option('dungeoneer-pack', '地城探险套组', [g('dungeoneer-pack')]),
      ]),
      group('warlock-melee', '选择一件简易武器', [
        option('simple-weapon', '任意一件简易武器', [], { count: 1, allowedWeaponKinds: simpleWeaponKinds }),
      ]),
    ],
  },
  {
    classId: 'class-2014-wizard',
    fixedGrants: [g('spellbook')],
    groups: [
      group('wizard-weapon', '选择武器', [
        option('quarterstaff', '长棍', [g('quarterstaff')]),
        option('dagger', '匕首', [g('dagger')]),
      ]),
      group('wizard-focus', '选择施法用品', [
        option('component-pouch', '材料包', [g('component-pouch')]),
        option('arcane-focus', '奥术法器', [g('arcane-focus')]),
      ]),
      group('wizard-pack', '选择冒险套组', [
        option('scholar-pack', '学者套组', [g('scholar-pack')]),
        option('explorer-pack', '探索套组', [g('explorer-pack')]),
      ]),
    ],
  },
]

export const backgroundStartingEquipment2014: readonly BackgroundStartingEquipmentRule[] = [
  { backgroundId: 'background-2014-acolyte', grants: [g('holy-symbol'), g('prayer-book'), g('incense-stick', 5), g('vestments'), g('common-clothes')], gp: 15 },
  { backgroundId: 'background-2014-charlatan', grants: [g('fine-clothes'), g('disguise-kit'), g('con-tools'), g('colored-liquid-bottles')], gp: 15 },
  { backgroundId: 'background-2014-criminal', grants: [g('crowbar'), g('dark-hooded-clothes')], gp: 15 },
  { backgroundId: 'background-2014-entertainer', grants: [g('musical-instrument'), g('favor-token'), g('costume')], gp: 15 },
  { backgroundId: 'background-2014-folk-hero', grants: [g('artisan-tools'), g('shovel'), g('iron-pot'), g('common-clothes')], gp: 10 },
  { backgroundId: 'background-2014-guild-artisan', grants: [g('artisan-tools'), g('introduction-letter'), g('travelers-clothes')], gp: 15 },
  { backgroundId: 'background-2014-hermit', grants: [g('scroll-case-notes'), g('blanket'), g('common-clothes'), g('herbalism-kit')], gp: 5 },
  { backgroundId: 'background-2014-noble', grants: [g('fine-clothes'), g('signet-ring'), g('pedigree-scroll')], gp: 25 },
  { backgroundId: 'background-2014-outlander', grants: [g('quarterstaff'), g('hunting-trap'), g('hunting-trophy'), g('travelers-clothes')], gp: 10 },
  { backgroundId: 'background-2014-sage', grants: [g('ink-bottle'), g('ink-pen'), g('small-knife'), g('colleague-letter'), g('common-clothes')], gp: 10 },
  { backgroundId: 'background-2014-sailor', grants: [g('belaying-pin'), g('silk-rope-50'), g('lucky-charm'), g('common-clothes')], gp: 10 },
  { backgroundId: 'background-2014-soldier', grants: [g('rank-insignia'), g('enemy-trophy'), g('gaming-set'), g('common-clothes')], gp: 10 },
  { backgroundId: 'background-2014-urchin', grants: [g('small-knife'), g('city-map'), g('pet-mouse'), g('parent-token'), g('common-clothes')], gp: 10 },
  { backgroundId: 'background-2014-entertainer-gladiator', grants: [g('trident'), g('favor-token'), g('costume')], gp: 15 },
  { backgroundId: 'background-2014-guild-artisan-merchant', grants: [g('mule'), g('cart'), g('introduction-letter'), g('travelers-clothes')], gp: 15 },
]
