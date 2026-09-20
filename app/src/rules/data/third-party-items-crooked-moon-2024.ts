// G3-I5：《歪曲之月》(The Crooked Moon) 第三方魔法物品 —— 附录B「寓言遗珍」奇物 14 条。
// 来源 `source-2024-tp-crooked-moon`（第三方合作内容，来源默认关闭、需 DM 同意）。
// 口径：本书参考资料按 2024 版式撰写（词条动作用「魔法动作」），故登记进 2024 注册表。
// 每条物品都含按稀有度分档的多个「词条」，档位与判定均由 DM 掌握，故一律记 `index-only`；
// 只登记类别、稀有度档位、同调与词条清单（含档位），不复制原书正文。
import type { EquipmentRule } from '@/types/rules'

const sourceIds = ['source-2024-tp-crooked-moon'] as const

const cmItem = (
  slug: string,
  name: string,
  englishName: string,
  description: string,
): EquipmentRule => ({
  id: `equipment-2024-tp-cm-${slug}`,
  name,
  englishName,
  ruleset: '5e-2024',
  status: 'index-only',
  description,
  classIds: [],
  equippable: true,
  category: 'magic',
  rarity: 'varies',
  magicItemCategory: 'wondrous',
  attunement: 'required',
  itemAction: 'varies',
  sourceIds,
})

/** 三类稀有度档位的统一说明，供各条描述复用。 */
const TIERS = '珍稀（+1）／极珍稀（+2）／传说（+3）'

export const crookedMoonItems2024: readonly EquipmentRule[] = [
  cmItem('banjo-of-ol-jericho-sticks', '老杰里科·斯提克斯的班卓琴', "Banjo of Ol' Jericho Sticks",
    `奇物·${TIERS}·需同调。可作法器，法术攻击检定、法术豁免 DC 与魅力（表演）检定按稀有度获得加值。词条：诱魔之饵（珍稀+，魅惑邪魔或类人）、稻草人之舞（珍稀+，附赠动作撤离）、共舞之邀（极珍稀+，令盟友同撤）、笼中之鸟（传说，DC 19 将已魅惑目标封入琴中）。`),
  cmItem('bell-of-the-dusk-mother', '黄昏之母的摇铃', 'Bell of the Dusk Mother',
    `奇物·${TIERS}·需同调。可作法器，法术攻击检定与法术豁免 DC 按稀有度获得加值。词条：哀鸣钟声（珍稀+，30 尺光环内感知豁免失败受心灵伤害并被削弱）、鸣钟呼唤（极珍稀+，附赠动作把材料变为活化盔甲人偶）、终亡丧钟（传说，DC 19 对浴血生物造成大量暗蚀伤害，差值 5+ 直接降至 0）。`),
  cmItem('cauldron-of-the-vermin-toll-abomination', '害兽憎恶的坩埚', 'Cauldron of the Vermintoll Abomination',
    `奇物·${TIERS}·需同调。词条：尺寸变换（珍稀+，1 分钟仪式在微型与中型间切换）、炖煮之锅（珍稀+，休整时为至多 10 个生物供餐）、害兽呼唤（珍稀+，泼洒液体施展咒唤兽群）、强体饱食（极珍稀+，进食者获得增益）、集会恶孽（传说，召出鬼婆集会造物）。`),
  cmItem('crown-of-the-barrow-king', '荒冢之王的王冠', 'Crown of the Barrow King',
    `奇物·${TIERS}·需同调。词条：死者所求（珍稀+，向尸体问询）、亡墓擒握（珍稀+，习得并强化颤栗之触）、死灵号令（珍稀+，强化亡灵相关法术）、不死主宰（极珍稀+）、灵魂转移（极珍稀+，濒死时转移灵魂）、摄魂命尸（传说，魔法动作支配 30 尺内亡灵）。`),
  cmItem('eye-of-the-white-worm', '白虫之眼', 'Eye of the White Worm',
    `奇物·${TIERS}·需同调。词条：思维刮掠（珍稀+，可施展侦测思想）、记忆虹吸（极珍稀+，抽取记忆）、永续亵渎（传说，目标难以恢复）。`),
  cmItem('hide-of-the-brimstone-behemoth', '硫磺巨兽之皮', 'Hide of the Brimstone Behemoth',
    `奇物·${TIERS}·需同调。词条：地心住民（珍稀+，火焰抗性与掘穴速度）、炼狱咆哮（珍稀+，可施展恐惧术）、狱炎火喉（极珍稀+，魔法动作喷吐 30 尺锥状地狱烈焰）。`),
  cmItem('idol-of-the-beast-of-blight', '枯朽之兽神像', 'Idol of the Beast of Blight',
    `奇物·${TIERS}·需同调。词条：腐烂触碰（珍稀+，以力量／敏捷／感知进行徒手打击）、湮灭之触（珍稀+）、幻孢侵心（极珍稀+，孢子致幻）、朽入膏肓（极珍稀+）、腐朽空壳（传说，受治疗时获得等于法术环阶的临时生命值）。`),
  cmItem('lantern-of-the-chained-reaper', '缚魂死神的提灯', 'Lantern of the Chained Reaper',
    `奇物·${TIERS}·需同调。词条：幽火不熄（珍稀+，蓝绿光照 30 尺无需燃料）、映影幽火（珍稀+）、秘法视界（极珍稀+，可施展侦测魔法）、召唤灵魄（极珍稀+，魔法动作召唤精魂）、冥焰放射（传说，可施展五环灼热射线）、结界辉光（传说，光照区具有防护法阵效应）。`),
  cmItem('mask-of-lethica-nightborne', '莱希卡·夜嗣的面具', 'Mask of Lethica Nightborne',
    `奇物·${TIERS}·需同调。词条：幽暗抚慰（珍稀+）、暗夜呢喃（珍稀+）、子夜馨香（极珍稀+）、共苦献祭（传说，代盟友承受苦痛）、忘苦消愁（传说）。`),
  cmItem('planchette-of-adela-druskenvald', '阿黛拉·德鲁斯肯瓦尔德的乩板', 'Planchette of Adela Druskenvald',
    `奇物·${TIERS}·需同调。词条：察隐觅形（珍稀+）、星辉结界（珍稀+，光耀伤害抗性与反制）、幻象超越（极珍稀+，9 充能、每日黄昏恢复 1d8+1）、精魂结界（极珍稀+，抵御魔魂壶与附身）、天眼开悟（传说）。`),
  cmItem('runestone-of-the-wild-titan', '荒野泰坦的符文石', 'Runestone of the Wild Titan',
    `奇物·${TIERS}·需同调。词条：泰山压顶（珍稀+）、投掷巨岩（极珍稀+，以力量投掷作简易远程武器）、召回（极珍稀+，1 里内附赠动作召回）、原始体魄（传说，站在肥沃土壤或天然岩石上时力量与体质豁免有优势）、巨岩轰击（传说）。`),
  cmItem('veil-of-the-weeping-widow', '悲泣寡妇的头纱', 'Veil of the Weeping Widow',
    `奇物·${TIERS}·需同调。词条：心念钢壁（珍稀+）、感悲之心（珍稀+，可施展侦测思想）、心念回震（极珍稀+，受到心灵伤害时反震）、思虫寄脑（极珍稀+，可施展篡改记忆）、心灵风暴（传说，一轮内可额外执行一次反应）、掩纱真颜（传说）。`),
  cmItem('visage-of-the-old-ways', '旧途之貌', 'Visage of the Old Ways',
    `奇物·${TIERS}·需同调。词条：秘仪面具（珍稀+，免疫预言系定位）、内蕴焚炎（珍稀+，燃烧时武器攻击额外造成 2d4 火焰伤害）、异火视界（极珍稀+，60 尺黑暗视觉并可看穿烟雾）、驭焰精通（极珍稀+）、祭祀之火（传说）、祭灵回赐（传说）。`),
  cmItem('whistle-of-the-vagrant', '漂泊客哨笛', 'Whistle of the Vagrant',
    `奇物·${TIERS}·需同调。词条：魂兮归来（珍稀+，魔法动作对 30 尺内尸体施展法术）、感知亡灵（珍稀+）、无畏之心（珍稀+，避免或终止恐慌的豁免有优势）、唤灵往生（极珍稀+）、蒸汽迷雾（极珍稀+，可施展云雾术且无需专注）、死之触痕（极珍稀+）、来世特快（传说）。`),
]
