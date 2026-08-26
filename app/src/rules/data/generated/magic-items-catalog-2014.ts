// 本文件由 scripts/build-item-catalog.mjs 生成，请勿手动修改。
// 审计与维护源：docs/equipment/5e-2014/magic-items/*.md 与 docs/equipment/5e-2014/expansions/*.md（Markdown 只作为开发维护、核对与审计文档）。
// 修改 Markdown 或同调表后运行 `npm run generate:items` 重新生成。
import type { EquipmentRule } from '@/types/rules'

export const magicItemsCatalog2014: readonly EquipmentRule[] = [
    {
      "id": "adamantine-armor",
      "name": "精金护甲",
      "englishName": "Adamantine Armor",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "精金锻造的护甲；针对穿戴者的重击变为普通命中。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "uncommon",
      "magicItemCategory": "armor",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ammunition-plus-1-2-3",
      "name": "附魔弹药 +1/+2/+3",
      "englishName": "Ammunition, +1/+2/+3",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "命中与伤害骰获得对应魔法加值。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "varies",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "amulet-of-health",
      "name": "健康护符",
      "englishName": "Amulet of Health",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "佩戴者体质值设为 19（除非本就更高）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "amulet-of-proof-against-detection-and-location",
      "name": "侦测定位防护护符",
      "englishName": "Amulet of Proof against Detection and Location",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "佩戴者免疫被侦测与定位的魔法。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "amulet-of-the-planes",
      "name": "位面护符",
      "englishName": "Amulet of the Planes",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可尝试施放位面传送；每次使用有失控落入随机位面的风险。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "animated-shield",
      "name": "活化盾",
      "englishName": "Animated Shield",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可命令盾牌自行悬浮防护，解放双手；效果持续 1 分钟。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "very-rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "apparatus-of-the-crab",
      "name": "蟹形装置",
      "englishName": "Apparatus of the Crab",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可乘坐的蟹形机械舱，多人协作操作，具爪臂与观瞄窗。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "armor-plus-1-2-3",
      "name": "附魔护甲 +1/+2/+3",
      "englishName": "Armor, +1/+2/+3",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "护甲获得对应 AC 魔法加值。",
      "classIds": [],
      "equippable": false,
      "category": "armor",
      "rarity": "varies",
      "magicItemCategory": "armor",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "armor-of-invulnerability",
      "name": "刀枪不入护甲",
      "englishName": "Armor of Invulnerability",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对非魔法伤害免疫；每日有限次数，用尽后 1 小时内失效。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "legendary",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "armor-of-resistance",
      "name": "抗力护甲",
      "englishName": "Armor of Resistance",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对一种伤害类型获得抗力（类型随机）。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "armor-of-vulnerability",
      "name": "易伤护甲",
      "englishName": "Armor of Vulnerability",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对两种伤害类型易伤，同时对其他类型获得抗力；诅咒难除。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "arrow-of-slaying",
      "name": "弑杀箭",
      "englishName": "Arrow of Slaying",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对特定生物类型额外造成大量伤害，目标体质豁免失败即死。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "arrow-catching-shield",
      "name": "接箭盾",
      "englishName": "Arrow-Catching Shield",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "射向持盾者 1.5 米内目标的远程攻击，命中时改射向持盾者。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "axe-of-the-dwarvish-lords",
      "name": "矮人诸王战斧",
      "englishName": "Axe of the Dwarvish Lords",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "矮人王权象征：可施放多种矮人相关法术、号令矮人，对兽人与巨魔伤害加成；含随机属性。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "artifact",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "book-of-exalted-deeds",
      "name": "崇高之书",
      "englishName": "Book of Exalted Deeds",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "善良圣典：阅读提升阵营、获得防护与神圣能力；邪恶生物触碰即受伤害。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "artifact",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "善良阵营生物同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "book-of-vile-darkness",
      "name": "邪恶之书",
      "englishName": "Book of Vile Darkness",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "邪恶秘典：蕴含黑暗知识，阅读者获得禁忌法术与能力；善良生物触碰即受伤害。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "artifact",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "邪恶阵营生物同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "eye-of-vecna",
      "name": "维克纳之眼",
      "englishName": "Eye of Vecna",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "巫妖之王的眼：植入眼眶获得透视、黑暗视觉与多种法术；携带者被维克纳意志侵蚀。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "artifact",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "hand-of-vecna",
      "name": "维克纳之手",
      "englishName": "Hand of Vecna",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "巫妖之手：替换手臂获得巨力、死灵法术与命令不死的能力；携带者被侵蚀。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "artifact",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "orb-of-dragonkind",
      "name": "龙族宝珠",
      "englishName": "Orb of Dragonkind",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "龙类宝珠：可号令龙类、感应龙踪、施放龙语魔法；对龙类生物有强大威慑。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "artifact",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "sword-of-kas",
      "name": "卡斯之剑",
      "englishName": "Sword of Kas",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "背叛者之剑：曾斩断维克纳之手；持剑者获得战斗强化并对亡灵特攻，与维克纳互有感应。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "artifact",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-orcus",
      "name": "奥库斯魔杖",
      "englishName": "Wand of Orcus",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "恶魔领主奥库斯的权杖：可召唤不死军团、施放死亡相关法术；触碰即受黯蚀伤害。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "artifact",
      "magicItemCategory": "staff",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "bag-of-beans",
      "name": "豆袋",
      "englishName": "Bag of Beans",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "掷出魔法豆，落地触发随机效果（植物生长、水池、生物、爆炸等）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "bag-of-devouring",
      "name": "吞噬袋",
      "englishName": "Bag of Devouring",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "袋口会吞噬放入的物品与生物，内部通向虚空，取出困难。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "bag-of-holding",
      "name": "次元袋",
      "englishName": "Bag of Holding",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "内部空间约 64 立方英尺/250 千克，袋重不随内容增加。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "bag-of-tricks",
      "name": "巧技袋",
      "englishName": "Bag of Tricks",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "伸入袋中可取出随机动物（灰/棕/黄三色袋对应不同动物表）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "bead-of-force",
      "name": "力场珠",
      "englishName": "Bead of Force",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "掷出后爆炸成力场球，困住 3 米内目标 1 分钟。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "belt-of-dwarvenkind",
      "name": "矮人腰带",
      "englishName": "Belt of Dwarvenkind",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "体质 +2（上限 20）、获得矮人语与暗视、矮人特质检定优势。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "belt-of-giant-strength",
      "name": "巨人力量腰带",
      "englishName": "Belt of Giant Strength",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "力量值设为 21/23/25/27/29（巨人种类对应不同数值）。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "varies",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "berserker-axe",
      "name": "狂战士斧",
      "englishName": "Berserker Axe",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "装备后强制狂暴：攻击随机目标、获得临时生命；诅咒难除。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "boots-of-elvenkind",
      "name": "精灵靴",
      "englishName": "Boots of Elvenkind",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "行走无声；潜行检定优势。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "boots-of-levitation",
      "name": "漂浮靴",
      "englishName": "Boots of Levitation",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "随意施放漂浮术（可上下移动，不能横移）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "boots-of-speed",
      "name": "疾速靴",
      "englishName": "Boots of Speed",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "10 分钟内步行速度翻倍。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "boots-of-striding-and-springing",
      "name": "大步跳跃靴",
      "englishName": "Boots of Striding and Springing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "速度提升且不受负重减速；跳跃距离增至三倍。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "boots-of-the-winterlands",
      "name": "冬地靴",
      "englishName": "Boots of the Winterlands",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "寒冷伤害抗力；冰面行走不滑倒。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "bowl-of-commanding-water-elementals",
      "name": "水元素号令钵",
      "englishName": "Bowl of Commanding Water Elementals",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "注满水后念诵咒语，可召唤一只水元素。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "bracers-of-archery",
      "name": "射手护腕",
      "englishName": "Bracers of Archery",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "熟练使用长弓或短弓时，伤害 +2。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "bracers-of-defense",
      "name": "防御护腕",
      "englishName": "Bracers of Defense",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "未着甲且未持盾时 AC +2。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "brazier-of-commanding-fire-elementals",
      "name": "火元素号令火盆",
      "englishName": "Brazier of Commanding Fire Elementals",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "点燃焚香后念诵咒语，可召唤一只火元素。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "brooch-of-shielding",
      "name": "防护胸针",
      "englishName": "Brooch of Shielding",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "免疫魔法飞弹；力场伤害抗力。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "broom-of-flying",
      "name": "飞天扫帚",
      "englishName": "Broom of Flying",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可骑乘飞行的扫帚，速度 15 米，最多载 200 千克。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "candle-of-invocation",
      "name": "召唤蜡烛",
      "englishName": "Candle of Invocation",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "点燃时视为特定领域祭坛：施法加成、召唤天界生物或恶魔（视阵营）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "cape-of-the-mountebank",
      "name": "术士披风",
      "englishName": "Cape of the Mountebank",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "每日一次施放任意门（衣料褪色标记）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "carpet-of-flying",
      "name": "飞毯",
      "englishName": "Carpet of Flying",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可载 1–4 人飞行的魔毯，速度与载量随尺寸不同。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "censer-of-controlling-air-elementals",
      "name": "空气元素号令香炉",
      "englishName": "Censer of Controlling Air Elementals",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "点燃焚香后念诵咒语，可召唤一只空气元素。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "chime-of-opening",
      "name": "开锁铃",
      "englishName": "Chime of Opening",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "鸣响可开启一把锁或一道被魔法封闭的门。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "circlet-of-blasting",
      "name": "爆裂头环",
      "englishName": "Circlet of Blasting",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "每日 5 发灼热射线（用尽后头环损坏）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "cloak-of-arachnida",
      "name": "蜘蛛斗篷",
      "englishName": "Cloak of Arachnida",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "蛛行、喷蛛网、毒抗；斗篷可化为黑色蜘蛛形态。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "cloak-of-displacement",
      "name": "错位斗篷",
      "englishName": "Cloak of Displacement",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "穿戴者影像错位，敌人攻击有劣势；受伤害后失效一轮。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "cloak-of-elvenkind",
      "name": "精灵斗篷",
      "englishName": "Cloak of Elvenkind",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "潜行检定优势；隐匿时敌方的感知（察觉）检定劣势。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "cloak-of-invisibility",
      "name": "隐身斗篷",
      "englishName": "Cloak of Invisibility",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "拉起兜帽即隐形；放下兜帽显形。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "cloak-of-protection",
      "name": "防护斗篷",
      "englishName": "Cloak of Protection",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "AC 与豁免 +1。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "cloak-of-the-bat",
      "name": "蝙蝠斗篷",
      "englishName": "Cloak of the Bat",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "暗处潜行优势；可变身蝙蝠、以蝙蝠形态飞行。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "cloak-of-the-manta-ray",
      "name": "蝠鲼斗篷",
      "englishName": "Cloak of the Manta Ray",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "水中呼吸并获得蝠鲼式游泳速度。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "crystal-ball",
      "name": "水晶球",
      "englishName": "Crystal Ball",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "远程观察任意位面的已知地点；传奇版本附加真知、读心等法术。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "cube-of-force",
      "name": "力场方块",
      "englishName": "Cube of Force",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "生成可配置的力场屏障（全阻、只阻生物、只阻非生物等），充能用尽前有效。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "cubic-gate",
      "name": "立方传送门",
      "englishName": "Cubic Gate",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "六个面各对应一个位面，按下可开启通往对应位面的传送门。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "dagger-of-venom",
      "name": "毒匕",
      "englishName": "Dagger of Venom",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命中后可注入毒素，目标体质豁免失败则额外中毒伤害。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "dancing-sword",
      "name": "舞蹈剑",
      "englishName": "Dancing Sword",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可命令剑离手悬空自动攻击，持续 4 轮。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "decanter-of-endless-water",
      "name": "无尽水壶",
      "englishName": "Decanter of Endless Water",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "倾倒可出清水，三种水压档位（溪流/喷泉/水炮）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "deck-of-illusions",
      "name": "幻象牌组",
      "englishName": "Deck of Illusions",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "抽牌在附近生成幻象生物或场景。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "deck-of-many-things",
      "name": "万象牌组",
      "englishName": "Deck of Many Things",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "抽牌触发命运效果（含加经验、获财富与即死、囚禁等危险牌）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "defender",
      "name": "守卫剑",
      "englishName": "Defender",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可把部分命中加值转为 AC 加值，灵活攻守。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "legendary",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "demon-armor",
      "name": "恶魔护甲",
      "englishName": "Demon Armor",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "AC +1、徒手攻击加成、恶魔语；穿戴者诅咒难除，对恶魔攻击劣势。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "very-rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "dimensional-shackles",
      "name": "次元镣铐",
      "englishName": "Dimensional Shackles",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "束缚生物使其无法传送、位面移动或穿越屏障。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "dragon-scale-mail",
      "name": "龙鳞甲",
      "englishName": "Dragon Scale Mail",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对一种龙类伤害抗力；对龙威豁免优势，感知（察觉）优势。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "very-rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "dragon-slayer",
      "name": "屠龙剑",
      "englishName": "Dragon Slayer",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对龙类额外造成 3d6 伤害。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "dust-of-disappearance",
      "name": "消失粉尘",
      "englishName": "Dust of Disappearance",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "撒出后 2 分钟内所有生物与物品隐形。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "dust-of-dryness",
      "name": "干燥粉尘",
      "englishName": "Dust of Dryness",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "吸收大片水域成可携带的珠粒，掷出可再释放水。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "dust-of-sneezing-and-choking",
      "name": "喷嚏窒息粉尘",
      "englishName": "Dust of Sneezing and Choking",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "吸入后剧烈喷嚏窒息，体质豁免失败则失去行动能力。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "dwarven-plate",
      "name": "矮人板甲",
      "englishName": "Dwarven Plate",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "AC +2；穿戴者在恢复生命值时额外恢复 1d8。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "very-rare",
      "magicItemCategory": "armor",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "dwarven-thrower",
      "name": "矮人投掷锤",
      "englishName": "Dwarven Thrower",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命中与伤害 +3；投掷时伤害额外 1d8（对巨人 2d8）且自动回手。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "conditional",
      "attunementCondition": "矮人同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "efficient-quiver",
      "name": "高效箭袋",
      "englishName": "Efficient Quiver",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "箭袋内含三个次元空间，分装箭、弩矢、标枪，随时取用。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "efreeti-bottle",
      "name": "火巨灵之瓶",
      "englishName": "Efreeti Bottle",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "打开瓶塞召唤火巨灵提供三次服务；有被反噬囚禁的风险。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "efreeti-chain",
      "name": "火巨灵链甲",
      "englishName": "Efreeti Chain",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "AC +3、火焰伤害免疫、可施放火焰相关法术、懂得火巨灵语。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "legendary",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "elemental-gem",
      "name": "元素宝石",
      "englishName": "Elemental Gem",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "捏碎宝石召唤一只对应元素的仆从，为其服务 1 小时。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "elven-chain",
      "name": "精灵链甲",
      "englishName": "Elven Chain",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "无需护甲熟练即可正常使用；AC 13 + 敏捷调整值。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "rare",
      "magicItemCategory": "armor",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "eyes-of-charming",
      "name": "魅惑之眼",
      "englishName": "Eyes of Charming",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "每日 3 次对 9 米内生物施放魅惑术（豁免 DC 13）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "eyes-of-minute-seeing",
      "name": "微观视觉之眼",
      "englishName": "Eyes of Minute Seeing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "近距离观察微小细节的检定优势（如搜索陷阱机关）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "eyes-of-the-eagle",
      "name": "鹰眼",
      "englishName": "Eyes of the Eagle",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "远距离观察的感知（察觉）检定优势。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "feather-token",
      "name": "羽毛符",
      "englishName": "Feather Token",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "羽毛状符咒，激活产生不同效果：锚、鸟、扇、天鹅船、树、鞭。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "figurine-of-wondrous-power",
      "name": "奇妙之力雕像",
      "englishName": "Figurine of Wondrous Power",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "小雕像按命令化为真实生物（金狮、玛瑙犬、青铜狮鹫、乌木飞马、翡翠蛇、铁拉马等）。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "varies",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "flame-tongue",
      "name": "焰舌剑",
      "englishName": "Flame Tongue",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命令后剑身燃起火焰，命中额外 2d6 火焰伤害。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "folding-boat",
      "name": "折叠舟",
      "englishName": "Folding Boat",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可折叠成小盒；展开成小船（5 人）或大船（15 人）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "frost-brand",
      "name": "霜噬剑",
      "englishName": "Frost Brand",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命中额外 1d6 寒冷伤害；火焰伤害抗力；可熄灭火焰与魔法火焰。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "gauntlets-of-ogre-power",
      "name": "食人魔力量护手",
      "englishName": "Gauntlets of Ogre Power",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "佩戴者力量值设为 19。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "gem-of-brightness",
      "name": "明亮宝石",
      "englishName": "Gem of Brightness",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "发出强光，可致盲视线内生物（豁免 DC 15）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "gem-of-seeing",
      "name": "视见宝石",
      "englishName": "Gem of Seeing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "30 分钟内获得真实视觉，识破幻术与变形。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "giant-slayer",
      "name": "巨人杀手剑",
      "englishName": "Giant Slayer",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对巨人额外 2d6 伤害；命中时巨人速度减半至下回合。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "gloves-of-missile-snaring",
      "name": "接弹手套",
      "englishName": "Gloves of Missile Snaring",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "用反应接住或偏转远程武器攻击。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "gloves-of-swimming-and-climbing",
      "name": "游泳攀爬手套",
      "englishName": "Gloves of Swimming and Climbing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "游泳与攀爬检定优势。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "goggles-of-night",
      "name": "夜视镜",
      "englishName": "Goggles of Night",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "获得 60 尺黑暗视觉（已有则延长）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "glamoured-studded-leather",
      "name": "华丽镶钉皮甲",
      "englishName": "Glamoured Studded Leather",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "AC 12 + 敏捷调整值；可随意改变外观为普通服装。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "rare",
      "magicItemCategory": "armor",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "hammer-of-thunderbolts",
      "name": "雷霆锤",
      "englishName": "Hammer of Thunderbolts",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "与巨人力量腰带、雷神腰带同用时威力全开：命中/伤害 +1、投掷回手、雷鸣伤害。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "legendary",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "hat-of-disguise",
      "name": "易容帽",
      "englishName": "Hat of Disguise",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "随意施放易容术改变外貌。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "headband-of-intellect",
      "name": "智力头带",
      "englishName": "Headband of Intellect",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "佩戴者智力值设为 19。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "helm-of-brilliance",
      "name": "光辉头盔",
      "englishName": "Helm of Brilliance",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "镶满魔法宝石，可发出光芒、施放火球与日光术；宝石用尽后损坏。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "helm-of-comprehending-languages",
      "name": "通晓语言头盔",
      "englishName": "Helm of Comprehending Languages",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放通晓语言，读懂文字听懂语言。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "helm-of-telepathy",
      "name": "心灵感应头盔",
      "englishName": "Helm of Telepathy",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放侦测思想；可与 36 米内生物心灵交流。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "helm-of-teleportation",
      "name": "传送头盔",
      "englishName": "Helm of Teleportation",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "每日 3 次施放传送术。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "holy-avenger",
      "name": "神圣复仇者",
      "englishName": "Holy Avenger",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "圣武士专属：持用时法术豁免 +2；对邪恶生物额外伤害，展开防护光环。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "legendary",
      "magicItemCategory": "weapon",
      "attunement": "conditional",
      "attunementCondition": "圣武士同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "horn-of-blasting",
      "name": "爆音号角",
      "englishName": "Horn of Blasting",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "吹响发出爆音，9 米内生物受音波伤害；有反震自伤风险。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "horn-of-valhalla",
      "name": "瓦尔哈拉号角",
      "englishName": "Horn of Valhalla",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "吹响召唤狂暴战士协助战斗（银/黄铜/青铜/铁号角召唤数量不同）。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "varies",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "horseshoes-of-a-zephyr",
      "name": "轻风马蹄铁",
      "englishName": "Horseshoes of a Zephyr",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "钉上后坐骑如履平地、跳跃距离三倍、不受困难地形影响。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "horseshoes-of-speed",
      "name": "疾速马蹄铁",
      "englishName": "Horseshoes of Speed",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "钉上后坐骑速度 +9 米。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "instrument-of-the-bards",
      "name": "吟游诗人乐器",
      "englishName": "Instrument of the Bards",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "各色乐器（鲁特琴、里拉琴、竖琴等）；演奏时施法加成，附带魅惑、飞行、召唤等能力。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "varies",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "吟游诗人同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ioun-stone",
      "name": "艾恩石",
      "englishName": "Ioun Stone",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "小宝石绕头盘旋，各具效果：吸收法术、敏捷/感知/智力/力量提升、护甲、幸运、再生、储备法术等。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "varies",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "iron-bands-of-bilarro",
      "name": "比拉罗铁环",
      "englishName": "Iron Bands of Bilarro",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "掷出铁环，命中则束缚目标（逃脱检定可挣脱）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "iron-flask",
      "name": "铁瓶",
      "englishName": "Iron Flask",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可捕捉并关押一个生物（豁免失败），开启瓶口可释放。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "javelin-of-lightning",
      "name": "闪电标枪",
      "englishName": "Javelin of Lightning",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "投掷时化作闪电束（命中直接命中），对目标与路径生物造成伤害，之后回到手中。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "uncommon",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "keoghtom-s-ointment",
      "name": "凯托姆药膏",
      "englishName": "Keoghtom's Ointment",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "涂抹治疗 2d8+2 生命并解除疾病与毒素。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "lantern-of-revealing",
      "name": "显形提灯",
      "englishName": "Lantern of Revealing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "光束范围内隐形生物现形。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "lens-of-detection",
      "name": "侦测透镜",
      "englishName": "Lens of Detection",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "透过透镜观察，发现陷阱与秘密门。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "life-drinker",
      "name": "生命饮者",
      "englishName": "Life Drinker",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命中吸取生命；攻击检定劣势（除非目标是不死生物）。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "luck-blade",
      "name": "幸运剑",
      "englishName": "Luck Blade",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "AC/豁免/属性检定 +1；每日一次重掷；部分含 1d3 个愿望。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "legendary",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "mace-of-disruption",
      "name": "瓦解硬头锤",
      "englishName": "Mace of Disruption",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对亡灵与邪魔额外伤害；亡灵生命值不足时直接摧毁。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "mace-of-smiting",
      "name": "痛击硬头锤",
      "englishName": "Mace of Smiting",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "攻击骰 20 时额外伤害；破坏物体时伤害最大化。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "mace-of-terror",
      "name": "恐惧硬头锤",
      "englishName": "Mace of Terror",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命令后 9 米内生物恐惧（豁免 DC 15），持续 1 分钟。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "mantle-of-spell-resistance",
      "name": "法术抗力斗篷",
      "englishName": "Mantle of Spell Resistance",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对抗法术的豁免检定优势。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "manual-of-bodily-health",
      "name": "健康之书",
      "englishName": "Manual of Bodily Health",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "阅读 48 小时后永久体质 +2（上限 30）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "manual-of-gainful-exercise",
      "name": "增益锻炼之书",
      "englishName": "Manual of Gainful Exercise",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "阅读 48 小时后永久力量 +2（上限 30）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "manual-of-golems",
      "name": "傀儡制作之书",
      "englishName": "Manual of Golems",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "记载制作黏土/血肉/铁/石傀儡的方法，需巨额材料与时间。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "manual-of-quickness-of-action",
      "name": "敏捷行动之书",
      "englishName": "Manual of Quickness of Action",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "阅读 48 小时后永久敏捷 +2（上限 30）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "mariner-s-armor",
      "name": "水手护甲",
      "englishName": "Mariner's Armor",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "获得游泳速度；水下呼吸；水下攻击无劣势。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "uncommon",
      "magicItemCategory": "armor",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "medallion-of-thoughts",
      "name": "思绪徽章",
      "englishName": "Medallion of Thoughts",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "每日 3 次施放侦测思想。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "mirror-of-life-trapping",
      "name": "生命囚禁镜",
      "englishName": "Mirror of Life Trapping",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "12 个次元牢笼；生物映照镜面时被囚禁（逃脱检定）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "mithral-armor",
      "name": "秘银护甲",
      "englishName": "Mithral Armor",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "重量减半；无力量需求；无隐蔽劣势。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "uncommon",
      "magicItemCategory": "armor",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "moonblade",
      "name": "月刃",
      "englishName": "Moonblade",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "精灵传承魔法剑，符文随机生成；随继承者积累效果，可拒绝不合格持者。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "legendary",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "necklace-of-adaptation",
      "name": "适应项链",
      "englishName": "Necklace of Adaptation",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "任意环境中可正常呼吸（水下、毒气等）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "necklace-of-fireballs",
      "name": "火球项链",
      "englishName": "Necklace of Fireballs",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "1d6+3 颗火珠，掷出即爆炸成火球（威力随珠色）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "necklace-of-prayer-beads",
      "name": "祈祷珠项链",
      "englishName": "Necklace of Prayer Beads",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "珠粒可施放祝福、疗伤、复活术、圣言等神术。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "牧师、德鲁伊或圣武士同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "nine-lives-stealer",
      "name": "九命窃窃贼剑",
      "englishName": "Nine Lives Stealer",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命中可窃取生命：目标豁免失败即被击杀（剑内储命）。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "oathbow",
      "name": "誓约弓",
      "englishName": "Oathbow",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "指定誓约目标后，对该目标攻击优势且伤害额外 3d6；对他人攻击劣势。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "oil-of-etherealness",
      "name": "以太化油",
      "englishName": "Oil of Etherealness",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "涂抹后进入以太位面 1 分钟，可穿墙而行。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "oil-of-sharpness",
      "name": "锋锐油",
      "englishName": "Oil of Sharpness",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "涂抹后武器变锋利：重击范围扩大，挥砍可斩断肢体。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "very-rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "oil-of-slipperiness",
      "name": "滑溜油",
      "englishName": "Oil of Slipperiness",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "涂抹后表面滑溜（挣脱束缚优势）；也可施放油腻术。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "uncommon",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "pearl-of-power",
      "name": "力量之珠",
      "englishName": "Pearl of Power",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "每日一次恢复一个已消耗的法术位（最高 3 环）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "施法者同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "periapt-of-health",
      "name": "健康护符",
      "englishName": "Periapt of Health",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "佩戴者免疫疾病。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "periapt-of-proof-against-poison",
      "name": "抗毒护符",
      "englishName": "Periapt of Proof against Poison",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "佩戴者免疫毒素伤害与中毒状态。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "periapt-of-wound-closure",
      "name": "伤口愈合护符",
      "englishName": "Periapt of Wound Closure",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "稳定生命值；倒地昏迷时自动稳定。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "philter-of-love",
      "name": "爱情灵药",
      "englishName": "Philter of Love",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "饮用者被指定生物魅惑 1 小时。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "uncommon",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "pipes-of-haunting",
      "name": "慑魂风笛",
      "englishName": "Pipes of Haunting",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "吹奏令 9 米内生物恐惧（豁免 DC 15）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "pipes-of-the-sewers",
      "name": "下水道风笛",
      "englishName": "Pipes of the Sewers",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "召唤并控制鼠群，可指挥老鼠攻击。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "plate-armor-of-etherealness",
      "name": "以太化板甲",
      "englishName": "Plate Armor of Etherealness",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命令后穿戴者与护甲一同进入以太位面，可穿过物体。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "legendary",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "portable-hole",
      "name": "便携洞",
      "englishName": "Portable Hole",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "展开成直径 1.8 米、深 2.4 米的次元空间布，可收纳大量物品。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-animal-friendship",
      "name": "动物友谊药水",
      "englishName": "Potion of Animal Friendship",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放动物友谊术（豁免 DC 13）。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "uncommon",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-clairvoyance",
      "name": "千里眼药水",
      "englishName": "Potion of Clairvoyance",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放千里眼术，远程观察。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-climbing",
      "name": "攀爬药水",
      "englishName": "Potion of Climbing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "1 小时内获得攀爬速度。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "common",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-resistance-cold-fire-force-lightning-necrotic-poison-psychic-radiant-thunder",
      "name": "抗力药水（各类型）",
      "englishName": "Potion of Resistance (Cold/Fire/Force/Lightning/Necrotic/Poison/Psychic/Radiant/Thunder)",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "1 小时内对对应伤害类型抗力。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "uncommon",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-diminution",
      "name": "缩小药水",
      "englishName": "Potion of Diminution",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "体型缩小一级，相关检定调整。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-flying",
      "name": "飞行药水",
      "englishName": "Potion of Flying",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "1 小时内获得飞行速度。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "very-rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-gaseous-form",
      "name": "气化药水",
      "englishName": "Potion of Gaseous Form",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "气化成云雾，穿缝而行。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-giant-strength",
      "name": "巨人力量药水",
      "englishName": "Potion of Giant Strength",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "1 小时内力量提升（丘陵/霜/火/石/云/风暴六档）。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "uncommon",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-growth",
      "name": "成长药水",
      "englishName": "Potion of Growth",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "体型增大一级，力量检定优势。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "uncommon",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-healing",
      "name": "治疗药水",
      "englishName": "Potion of Healing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "恢复 2d4+2 生命；增强版：Greater 4d4+4（非普通）、Superior 8d4+8（稀有）、Supreme 10d4+20（非常稀有）。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "common",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-heroism",
      "name": "英雄气概药水",
      "englishName": "Potion of Heroism",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "1 小时内获得临时生命，免疫恐惧。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-invisibility",
      "name": "隐形药水",
      "englishName": "Potion of Invisibility",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "1 小时内隐形。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-invulnerability",
      "name": "无敌药水",
      "englishName": "Potion of Invulnerability",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "1 分钟内对非魔法伤害抗力。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-longevity",
      "name": "长寿药水",
      "englishName": "Potion of Longevity",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "饮用者年龄减少 1d6+6 岁。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "very-rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-mind-reading",
      "name": "读心药水",
      "englishName": "Potion of Mind Reading",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放侦测思想。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-poison",
      "name": "毒药水",
      "englishName": "Potion of Poison",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "外观如治疗药水；饮用后中毒受伤害，豁免失败则中毒 1 小时。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "varies",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-speed",
      "name": "迅捷药水",
      "englishName": "Potion of Speed",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "1 分钟内施放加速术。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "very-rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-vitality",
      "name": "活力药水",
      "englishName": "Potion of Vitality",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "治愈疾病、中毒与力竭。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "very-rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "potion-of-water-breathing",
      "name": "水下呼吸药水",
      "englishName": "Potion of Water Breathing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "1 小时内可在水下呼吸。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "uncommon",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-animal-influence",
      "name": "动物影响戒指",
      "englishName": "Ring of Animal Influence",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "每日 3 次：动物交流、动物友好或动物恐惧。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "ring",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-djinni-summoning",
      "name": "巨灵召唤戒指",
      "englishName": "Ring of Djinni Summoning",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "召唤一只巨灵服侍佩戴者（巨灵可挣脱束缚）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-elemental-command",
      "name": "元素号令戒指",
      "englishName": "Ring of Elemental Command",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "四种元素戒指（空气/土/火/水）：对应伤害免疫、号令元素生物、附多种法术。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-evasion",
      "name": "闪避戒指",
      "englishName": "Ring of Evasion",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "敏捷豁免失败时可用反应改为成功（每日 3 次）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-feather-falling",
      "name": "羽落戒指",
      "englishName": "Ring of Feather Falling",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "自由落体时自动施放羽落术。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-free-action",
      "name": "自由行动戒指",
      "englishName": "Ring of Free Action",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "免疫束缚与困难地形，魔法无法限制移动。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-invisibility",
      "name": "隐身戒指",
      "englishName": "Ring of Invisibility",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "佩戴即隐形，摘除显形。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-jumping",
      "name": "跳跃戒指",
      "englishName": "Ring of Jumping",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "随意施放跳跃术。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-mind-shielding",
      "name": "心灵防护戒指",
      "englishName": "Ring of Mind Shielding",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "免疫读心；死亡后灵魂可寄居戒指。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-protection",
      "name": "防护戒指",
      "englishName": "Ring of Protection",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "AC 与豁免 +1。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-regeneration",
      "name": "再生戒指",
      "englishName": "Ring of Regeneration",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "每分钟恢复 1d6 生命；断肢可再植或再生。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-resistance",
      "name": "抗力戒指",
      "englishName": "Ring of Resistance",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对一种伤害类型抗力（类型随机）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-shooting-stars",
      "name": "流星戒指",
      "englishName": "Ring of Shooting Stars",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "暗处发出亮光；可施放舞光、火球、闪电束；昼光下微弱。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "ring",
      "attunement": "conditional",
      "attunementCondition": "仅限夜晚的户外环境同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-spell-storing",
      "name": "储法戒指",
      "englishName": "Ring of Spell Storing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "储存最多 5 环法术（合计），任意生物可施放。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-spell-turning",
      "name": "法术反转戒指",
      "englishName": "Ring of Spell Turning",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对抗法术的豁免投出 20 时，法术反射回施法者。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-swimming",
      "name": "游泳戒指",
      "englishName": "Ring of Swimming",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "获得游泳速度。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "ring",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-telekinesis",
      "name": "心灵遥控戒指",
      "englishName": "Ring of Telekinesis",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "随意施放心灵遥控。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-the-ram",
      "name": "公羊戒指",
      "englishName": "Ring of the Ram",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "发出力场冲击，击退目标并造成伤害。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-three-wishes",
      "name": "三愿戒指",
      "englishName": "Ring of Three Wishes",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "含 3 个愿望，用尽后戒指失去魔力。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "ring",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-warmth",
      "name": "温暖戒指",
      "englishName": "Ring of Warmth",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "寒冷伤害抗力；抵御严寒环境。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-water-walking",
      "name": "水上行走戒指",
      "englishName": "Ring of Water Walking",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可站立于水面行走。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "ring",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "ring-of-x-ray-vision",
      "name": "X 光视觉戒指",
      "englishName": "Ring of X-Ray Vision",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "透视 9 米内物质；每使用 1 分钟获得 1 级力竭。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "saddle-of-the-cavalier",
      "name": "骑士马鞍",
      "englishName": "Saddle of the Cavalier",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "骑乘时不易被击落马；对抗击落的效果优势。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "scimitar-of-speed",
      "name": "迅捷弯刀",
      "englishName": "Scimitar of Speed",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "轻灵迅捷：可用附赠动作进行一次攻击。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "scroll-of-protection",
      "name": "防护卷轴",
      "englishName": "Scroll of Protection",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "展开后在 9 米内形成防护光环，阻止特定类型生物进入。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "sentinel-shield",
      "name": "哨兵盾",
      "englishName": "Sentinel Shield",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "先攻检定优势；感知（察觉）检定优势。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "uncommon",
      "magicItemCategory": "armor",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "shield-plus-1-2-3",
      "name": "附魔盾 +1/+2/+3",
      "englishName": "Shield, +1/+2/+3",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "盾牌获得对应 AC 魔法加值。",
      "classIds": [],
      "equippable": false,
      "category": "armor",
      "rarity": "varies",
      "magicItemCategory": "armor",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "shield-of-missile-attraction",
      "name": "引弹盾",
      "englishName": "Shield of Missile Attraction",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "AC +2 但远程攻击被吸引射向持盾者；诅咒难除。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "slippers-of-spider-climbing",
      "name": "蛛行拖鞋",
      "englishName": "Slippers of Spider Climbing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可攀附垂直表面与天花板倒行。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "sovereign-glue",
      "name": "至尊胶",
      "englishName": "Sovereign Glue",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "粘合任何物体，几乎无法分离（万能溶剂可解）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "spell-scroll",
      "name": "法术卷轴",
      "englishName": "Spell Scroll",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "储存一个法术；职业匹配可读，否则需施法检定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "varies",
      "magicItemCategory": "scroll",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "spellguard-shield",
      "name": "法术防护盾",
      "englishName": "Spellguard Shield",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对抗法术的豁免优势；法术攻击对持盾者有劣势。",
      "classIds": [],
      "equippable": true,
      "category": "armor",
      "rarity": "very-rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "sphere-of-annihilation",
      "name": "湮灭球",
      "englishName": "Sphere of Annihilation",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "直径 0.6 米的黑色球体，吞噬一切接触之物，极难控制。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-charming",
      "name": "魅惑法杖",
      "englishName": "Staff of Charming",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可施放魅惑人类、命令术、魅惑怪物；察觉被魅惑的优势。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "吟游诗人、牧师、德鲁伊、术士、魔契师或法师同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-fire",
      "name": "火焰法杖",
      "englishName": "Staff of Fire",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可施放火球、燃火术、火焰之手、焰击术等火系法术。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "德鲁伊、术士、魔契师或法师同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-frost",
      "name": "寒冰法杖",
      "englishName": "Staff of Frost",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可施放冰风暴、冰墙、寒冰锥等冰系法术；寒冷抗力。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "德鲁伊、术士、魔契师或法师同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-healing",
      "name": "治疗法杖",
      "englishName": "Staff of Healing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可施放疗伤术、次级复原术、群体疗伤术等治疗法术。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "吟游诗人、牧师或德鲁伊同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-power",
      "name": "力量法杖",
      "englishName": "Staff of Power",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "强力战斗法杖：AC/豁免 +2，可施放火球、闪电束、力墙、心灵遥控等。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "术士、魔契师或法师同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-striking",
      "name": "打击法杖",
      "englishName": "Staff of Striking",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "充能近战：消耗充能提升伤害，攻击骰 20 时额外伤害。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "staff",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-swarming-insects",
      "name": "虫群法杖",
      "englishName": "Staff of Swarming Insects",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "召唤虫群：形成虫云、攻击昆虫、虫群护盾。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "吟游诗人、牧师、德鲁伊、术士、魔契师或法师同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-the-adder",
      "name": "蛇杖",
      "englishName": "Staff of the Adder",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命令后法杖化为毒蛇发动攻击。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "牧师、德鲁伊或魔契师同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-the-magi",
      "name": "大法师法杖",
      "englishName": "Staff of the Magi",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "顶级法杖：AC/豁免 +2，可施放大量法术并吸收法术能量。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "术士、魔契师或法师同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-the-python",
      "name": "巨蟒法杖",
      "englishName": "Staff of the Python",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命令后化为巨蟒作战，受到伤害或巨蟒死亡后恢复法杖。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "牧师、德鲁伊或魔契师同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-the-woodlands",
      "name": "林地法杖",
      "englishName": "Staff of the Woodlands",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "德鲁伊法杖：可施放动物交流、树肤、纠缠、变形（树木）、召唤树人等。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "德鲁伊同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-thunder-and-lightning",
      "name": "雷电法杖",
      "englishName": "Staff of Thunder and Lightning",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "攻击附带雷鸣与闪电伤害，可施放雷云术、闪电束。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "staff",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "staff-of-withering",
      "name": "枯萎法杖",
      "englishName": "Staff of Withering",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "攻击汲取目标生命（体质豁免减半）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "牧师、德鲁伊或魔契师同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "stone-of-controlling-earth-elementals",
      "name": "土元素号令石",
      "englishName": "Stone of Controlling Earth Elementals",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "触碰并念咒可召唤一只土元素。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "stone-of-good-luck",
      "name": "好运石",
      "englishName": "Stone of Good Luck",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "佩戴者属性检定、豁免与能力检定 +1。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "sun-blade",
      "name": "日光剑",
      "englishName": "Sun Blade",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "光刃长剑：对亡灵额外伤害、光耀属性；可照亮黑暗。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "sword-of-answering",
      "name": "应誓剑",
      "englishName": "Sword of Answering",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "被攻击时可用反应反击，攻击骰优势且伤害最大化。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "legendary",
      "magicItemCategory": "weapon",
      "attunement": "conditional",
      "attunementCondition": "阵营与剑相同的生物同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "sword-of-life-stealing",
      "name": "生命偷取剑",
      "englishName": "Sword of Life Stealing",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "攻击骰 20 时吸取目标生命并治疗持剑者。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "sword-of-sharpness",
      "name": "锋锐剑",
      "englishName": "Sword of Sharpness",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "重击范围扩大；命中可斩断目标肢体或物体。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "sword-of-vengeance",
      "name": "复仇剑",
      "englishName": "Sword of Vengeance",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "诅咒：装备后强制对伤己者攻击且攻击骰劣势。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "sword-of-wounding",
      "name": "创伤剑",
      "englishName": "Sword of Wounding",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "伤口持续流血（每回合扣血直至治疗），同一伤口累计。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "talisman-of-pure-good",
      "name": "纯粹善良护符",
      "englishName": "Talisman of Pure Good",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "善良阵营持用者攻击骰 +2；邪恶生物触碰即受光耀伤害。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "善良阵营生物同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "talisman-of-the-sphere",
      "name": "球体护符",
      "englishName": "Talisman of the Sphere",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可控制湮灭球体（检定失败有被球体吞噬风险）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "talisman-of-ultimate-evil",
      "name": "终极邪恶护符",
      "englishName": "Talisman of Ultimate Evil",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "邪恶阵营持用者攻击骰 +2；善良生物触碰即受黯蚀伤害。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "邪恶阵营生物同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "tentacle-rod",
      "name": "触手法杖",
      "englishName": "Tentacle Rod",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "命令后长出三根触手攻击并束缚目标。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "tome-of-clear-thought",
      "name": "明思之书",
      "englishName": "Tome of Clear Thought",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "阅读 48 小时后永久智力 +2（上限 30）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "tome-of-leadership-and-influence",
      "name": "领导与影响之书",
      "englishName": "Tome of Leadership and Influence",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "阅读 48 小时后永久魅力 +2（上限 30）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "tome-of-understanding",
      "name": "领悟之书",
      "englishName": "Tome of Understanding",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "阅读 48 小时后永久感知 +2（上限 30）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "trident-of-fish-command",
      "name": "鱼类号令三叉戟",
      "englishName": "Trident of Fish Command",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "对鱼类施放支配动物；水下战斗无劣势。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "uncommon",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "universal-solvent",
      "name": "万能溶剂",
      "englishName": "Universal Solvent",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "溶解至尊胶等一切胶粘物。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "vacuous-grimoire",
      "name": "空虚魔法书",
      "englishName": "Vacuous Grimoire",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "诅咒魔法书：阅读者智力永久 -2，除非移除诅咒。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "vicious-weapon",
      "name": "恶毒武器",
      "englishName": "Vicious Weapon",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "攻击骰 20 时额外造成 2d6 伤害。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-binding",
      "name": "束缚魔杖",
      "englishName": "Wand of Binding",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "可施放束缚类法术（束缚、缓慢、定身等）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wand",
      "attunement": "conditional",
      "attunementCondition": "施法者同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-enemy-detection",
      "name": "侦测敌人魔杖",
      "englishName": "Wand of Enemy Detection",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "10 分钟内侦测 18 米内怀有敌意的生物。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wand",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-fear",
      "name": "恐惧魔杖",
      "englishName": "Wand of Fear",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放恐惧术（豁免 DC 15）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wand",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-fireballs",
      "name": "火球魔杖",
      "englishName": "Wand of Fireballs",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放火球术（豁免 DC 15，每日 7 充能）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wand",
      "attunement": "conditional",
      "attunementCondition": "施法者同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-lightning-bolts",
      "name": "闪电束魔杖",
      "englishName": "Wand of Lightning Bolts",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放闪电束（豁免 DC 15，每日 7 充能）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wand",
      "attunement": "conditional",
      "attunementCondition": "施法者同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-magic-detection",
      "name": "侦测魔法魔杖",
      "englishName": "Wand of Magic Detection",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放侦测魔法。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wand",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-magic-missiles",
      "name": "魔法飞弹魔杖",
      "englishName": "Wand of Magic Missiles",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放魔法飞弹（每日 7 充能）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wand",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-paralysis",
      "name": "麻痹魔杖",
      "englishName": "Wand of Paralysis",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放定身术（豁免 DC 15，每日 7 充能）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wand",
      "attunement": "conditional",
      "attunementCondition": "施法者同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-polymorph",
      "name": "变形魔杖",
      "englishName": "Wand of Polymorph",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放变形术（豁免 DC 15）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wand",
      "attunement": "conditional",
      "attunementCondition": "施法者同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-secrets",
      "name": "秘钥魔杖",
      "englishName": "Wand of Secrets",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "侦测 9 米内的秘密门与机关。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wand",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-the-war-mage",
      "name": "战斗法师魔杖",
      "englishName": "Wand of the War Mage",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "持用时法术攻击检定获得 +1/+2/+3 加值。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "varies",
      "magicItemCategory": "wand",
      "attunement": "conditional",
      "attunementCondition": "施法者同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-web",
      "name": "蛛网魔杖",
      "englishName": "Wand of Web",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放蛛网术（豁免 DC 13，每日 7 充能）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wand",
      "attunement": "conditional",
      "attunementCondition": "施法者同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wand-of-wonder",
      "name": "惊奇魔杖",
      "englishName": "Wand of Wonder",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "施放随机魔法效果（掷表决定，含火球、变羊、彩虹等）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wand",
      "attunement": "conditional",
      "attunementCondition": "施法者同调",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "weapon-plus-1-2-3",
      "name": "附魔武器 +1/+2/+3",
      "englishName": "Weapon, +1/+2/+3",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "武器命中与伤害获得对应魔法加值。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "varies",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "weapon-of-warning",
      "name": "警示武器",
      "englishName": "Weapon of Warning",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "持用时提前警觉危险；先攻检定优势；睡梦中警觉。",
      "classIds": [],
      "equippable": true,
      "category": "weapon",
      "rarity": "uncommon",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "well-of-many-worlds",
      "name": "万界之井",
      "englishName": "Well of Many Worlds",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "打开通往随机位面的传送门（每日 1 次）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wind-fan",
      "name": "风之扇",
      "englishName": "Wind Fan",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "扇出强风（可吹倒生物、吹熄火焰、推动船只）。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "winged-boots",
      "name": "飞行靴",
      "englishName": "Winged Boots",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "每日 4 小时飞行，可中断续用。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "wings-of-flying",
      "name": "飞行之翼",
      "englishName": "Wings of Flying",
      "ruleset": "5e-2014",
      "status": "selectable",
      "description": "背后展开魔法翅膀，每日 2 小时飞行。",
      "classIds": [],
      "equippable": true,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "dmg-2014-index"
      ]
    },
    {
      "id": "breathing-bubble",
      "name": "呼吸泡泡",
      "englishName": "Breathing Bubble",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "coin-of-delving",
      "name": "探洞硬币",
      "englishName": "Coin of Delving",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "ersatz-eye",
      "name": "义眼",
      "englishName": "Ersatz Eye",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "prosthetic-limb",
      "name": "假肢",
      "englishName": "Prosthetic Limb",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "vox-seeker",
      "name": "觅音师",
      "englishName": "Vox Seeker",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "amulet-of-the-drunkard",
      "name": "酒鬼护符",
      "englishName": "Amulet of the Drunkard",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "brooch-of-living-essence",
      "name": "生命精华胸针",
      "englishName": "Brooch of Living Essence",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "dust-of-deliciousness",
      "name": "美味尘",
      "englishName": "Dust of Deliciousness",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物,非普通索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "goggles-of-object-reading",
      "name": "物象解读护目镜",
      "englishName": "Goggles of Object Reading",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "ring-of-obscuring",
      "name": "遮蔽之戒",
      "englishName": "Ring of Obscuring",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的戒指索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "rod-of-retribution",
      "name": "复仇权杖",
      "englishName": "Rod of Retribution",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的权杖索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "rod",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "acheron-blade",
      "name": "冥河之剑",
      "englishName": "Acheron Blade",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（任意剑）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "battering-shield",
      "name": "撞击盾",
      "englishName": "Battering Shield",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的护甲（盾牌）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "armor",
      "rarity": "rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "butcher-s-bib",
      "name": "屠夫围裙",
      "englishName": "Butcher's Bib",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物 珍稀（需同调）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "corpse-slayer",
      "name": "屠尸者",
      "englishName": "Corpse Slayer",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（任意武器）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "needle-of-mending",
      "name": "修补之针",
      "englishName": "Needle of Mending",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（匕首）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "potion-of-maximum-power",
      "name": "极限性能药水",
      "englishName": "Potion of Maximum Power",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的药水索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "ring-of-temporal-salvation",
      "name": "时溯救恩之戒",
      "englishName": "Ring of Temporal Salvation",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的戒指索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "ring",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "staff-of-the-ivory-claw",
      "name": "象牙之爪法杖",
      "englishName": "Staff of the Ivory Claw",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的法杖索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "施法者同调",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "weapon-of-certain-death",
      "name": "绝命武器",
      "englishName": "Weapon of Certain Death",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（任意）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "rare",
      "magicItemCategory": "weapon",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "arcane-cannon",
      "name": "奥术加农炮",
      "englishName": "Arcane Cannon",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "bloodaxe",
      "name": "血斧",
      "englishName": "Bloodaxe",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（巨斧）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "dispelling-stone",
      "name": "解除石",
      "englishName": "Dispelling Stone",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "duskcrusher",
      "name": "碎暮者",
      "englishName": "Duskcrusher",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（战锤）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "hunter-s-coat",
      "name": "猎手外套",
      "englishName": "Hunter's Coat",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的护甲（皮甲）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "armor",
      "rarity": "very-rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "last-stand-armor",
      "name": "背水一战护甲",
      "englishName": "Last Stand Armor",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的护甲（任意护甲）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "armor",
      "rarity": "very-rare",
      "magicItemCategory": "armor",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "orb-of-the-veil",
      "name": "面纱法球",
      "englishName": "Orb of the Veil",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "potion-of-possibility",
      "name": "可能性药水",
      "englishName": "Potion of Possibility",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的药水索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "potion",
      "rarity": "very-rare",
      "magicItemCategory": "potion",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "reincarnation-dust",
      "name": "转生尘",
      "englishName": "Reincarnation Dust",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "staff-of-dunamancy",
      "name": "秘迹学法杖",
      "englishName": "Staff of Dunamancy",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的法杖索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "staff",
      "attunement": "conditional",
      "attunementCondition": "法师同调",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "luxon-beacon",
      "name": "拉克桑信标",
      "englishName": "Luxon Beacon",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "nightfall-pearl",
      "name": "夜幕珍珠",
      "englishName": "Nightfall Pearl",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "spell-bottle",
      "name": "法术瓶",
      "englishName": "Spell Bottle",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "danoth-s-visor",
      "name": "达诺斯护目镜",
      "englishName": "Danoth's Visor",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "grimoire-infinitus",
      "name": "无限秘典",
      "englishName": "Grimoire Infinitus",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "法师同调",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "hide-of-the-feral-guardian",
      "name": "野性守护者的毛皮",
      "englishName": "Hide of the Feral Guardian",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的护甲（镶钉皮甲）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "armor",
      "rarity": "legendary",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "infiltrator-s-key",
      "name": "渗透者之匙",
      "englishName": "Infiltrator's Key",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "stormgirdle",
      "name": "风暴腰带",
      "englishName": "Stormgirdle",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "verminshroud",
      "name": "害兽之幕",
      "englishName": "Verminshroud",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "wreath-of-the-prism",
      "name": "棱彩荆冠",
      "englishName": "Wreath of the Prism",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "blade-of-broken-mirrors",
      "name": "碎镜之锋",
      "englishName": "Blade of Broken Mirrors",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（匕首）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "artifact",
      "magicItemCategory": "weapon",
      "attunement": "conditional",
      "attunementCondition": "类人生物同调",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "grovelthrash",
      "name": "蹂躏者",
      "englishName": "Grovelthrash",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（战锤）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "artifact",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "lash-of-shadows",
      "name": "阴影之鞭",
      "englishName": "Lash of Shadows",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（鞭）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "artifact",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "mace-of-the-black-crown",
      "name": "黑冠权杖",
      "englishName": "Mace of the Black Crown",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（硬头锤）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "artifact",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "ruin-s-wake",
      "name": "毁灭残迹",
      "englishName": "Ruin's Wake",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（矛）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "artifact",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "silken-spite",
      "name": "如丝毒怨",
      "englishName": "Silken Spite",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（刺剑）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "artifact",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "the-bloody-end",
      "name": "血色终焉",
      "englishName": "The Bloody End",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（钉头锤）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "artifact",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "will-of-the-talon",
      "name": "爪之意志",
      "englishName": "Will Of The Talon",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《荒洲探险家指南》的武器（战镐）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "artifact",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "egtw-2020-index"
      ]
    },
    {
      "id": "armblade",
      "name": "臂刃",
      "englishName": "Armblade",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的武器（任意单手近战武器）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "common",
      "magicItemCategory": "weapon",
      "attunement": "conditional",
      "attunementCondition": "战俑同调",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "everbright-lantern",
      "name": "永明提灯",
      "englishName": "Everbright Lantern",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "feather-token",
      "name": "羽符",
      "englishName": "Feather Token",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "imbued-wood-focus",
      "name": "蕴能木法器",
      "englishName": "Imbued Wood Focus",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "keycharm",
      "name": "钥饰",
      "englishName": "Keycharm",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "持有守御龙纹的生物同调",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "orb-of-shielding",
      "name": "护盾法球",
      "englishName": "Orb of Shielding",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "scribe-s-pen",
      "name": "抄录笔",
      "englishName": "Scribe's Pen",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "持有抄录龙纹的生物同调",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "shiftweave",
      "name": "易纺",
      "englishName": "Shiftweave",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "spellshard",
      "name": "法晶",
      "englishName": "Spellshard",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "wand-sheath",
      "name": "魔杖插槽",
      "englishName": "Wand Sheath",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "common",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "战俑同调",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "earworm",
      "name": "耳虫",
      "englishName": "Earworm",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "finder-s-goggles",
      "name": "探寻护目镜",
      "englishName": "Finder's Goggles",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "持有探寻龙纹的生物同调",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "living-gloves",
      "name": "活体手套",
      "englishName": "Living Gloves",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "wheel-of-wind-and-water",
      "name": "风水舵",
      "englishName": "Wheel of Wind and Water",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "uncommon",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "docent",
      "name": "指导附件",
      "englishName": "Docent",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "战俑同调",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "ventilating-lungs",
      "name": "生风铁肺",
      "englishName": "Ventilating Lungs",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "arcane-propulsion-arm",
      "name": "喷流式奥能臂",
      "englishName": "Arcane Propulsion Arm",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "conditional",
      "attunementCondition": "缺失手或臂的生物同调",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "dyrrn-s-tentacle-whip",
      "name": "迪恩的触手长鞭",
      "englishName": "Dyrrn's Tentacle Whip",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的武器（鞭）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "weapon",
      "rarity": "very-rare",
      "magicItemCategory": "weapon",
      "attunement": "required",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "kyrzin-s-ooze",
      "name": "凯尔津的泥怪",
      "englishName": "Kyrzin's Ooze",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "living-armor",
      "name": "活体护甲",
      "englishName": "Living Armor",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的护甲（任意）索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "armor",
      "rarity": "very-rare",
      "magicItemCategory": "armor",
      "attunement": "required",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "speaking-stone",
      "name": "通讯石",
      "englishName": "Speaking Stone",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "very-rare",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "belashyrra-s-beholder-crown",
      "name": "贝拉希拉的眼魔冠冕",
      "englishName": "Belashyrra's Beholder Crown",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "legendary",
      "magicItemCategory": "wondrous",
      "attunement": "required",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    },
    {
      "id": "glamerweave",
      "name": "幻纺",
      "englishName": "Glamerweave",
      "ruleset": "5e-2014",
      "status": "index-only",
      "description": "来自《艾伯伦：战乱后的最后战争》的奇物索引；复杂效果与使用条件由桌面依据来源书裁定。",
      "classIds": [],
      "equippable": false,
      "category": "magic",
      "rarity": "varies",
      "magicItemCategory": "wondrous",
      "attunement": "none",
      "sourceIds": [
        "erftlw-2019-index"
      ]
    }
  ]
