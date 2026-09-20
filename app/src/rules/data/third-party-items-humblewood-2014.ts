// G3-I5：第三方《谦卑林》(Humblewood) 魔法物品（2014 口径）。
// 来源 ID `tp-humblewood-index`：第三方合作内容，来源默认关闭、需 DM 同意。
//
// 收录口径：
// - 条目取自 CHM v2026.09.13「附录D：魔法物品」章节，共 7 件（含神器「北极天光」与「亡灵之书：古鸦禁咒」）；
// - 章节内的「真挚的礼物 A True Gift」是叙事说明段、「环阶／法术／三环／四环…」是本法术书附带的法术表表头，均不是物品，不予登记；
// - 「羽冠」按羽毛所属鸟族分五套法术分支，属多分支表结构，记 `index-only`；「亡灵之书：古鸦禁咒」含诅咒与法术书整合，同样记 `index-only`；
// - `description` 为原创中文机制摘要，只登记类别、稀有度、同调与关键数值，不复制原书正文。
import type { EquipmentRule } from '@/types/rules'

const HUMBLEWOOD = ['tp-humblewood-index'] as const

export const humblewoodItems2014: readonly EquipmentRule[] = [
  { id:"equipment-2014-tp-hw-nest-charm", name:"巢咒护符", englishName:"Nest Charm", ruleset:'5e-2014', status:'selectable', description:"鸟巢状护符，奇物，非普通，需同调。放于地面并说出命令语后可展开为直径 30 尺的枝条平台，下方长出魔法树把平台抬升至 50 尺空中，最多持续 8 小时；再次说出命令语即可解散。力量激活后直至下个黎明前无法再次使用。", classIds:[], equippable:true, category:'magic', rarity:'uncommon', magicItemCategory:'wondrous', attunement:'required', itemAction:'varies', magicItemUsage:{ charged:false, consumable:false, recovery:['dawn'] }, sourceIds:HUMBLEWOOD },
  { id:"equipment-2014-tp-hw-red-feathered-bow", name:"红羽弓", englishName:"Red-Feathered Bow", ruleset:'5e-2014', status:'selectable', description:"任意弓，武器，非普通，需同调。使用此魔法武器的攻击与伤害 +1；弓有 3 发充能、每天黎明恢复 1d3，射出箭时可以附赠动作说出命令语并消耗 1 发充能，从箭矢落点观察周围环境 1 分钟；若箭矢命中生物，则看到受击者所见的景象。", classIds:[], equippable:true, category:'weapon', rarity:'uncommon', magicItemCategory:'weapon', attunement:'required', itemAction:'bonus-action', magicItemUsage:{ charged:true, consumable:false, recovery:['dawn'] }, sourceIds:HUMBLEWOOD },
  { id:"equipment-2014-tp-hw-wing-crest-shield", name:"翼羽盾", englishName:"Wing Crest Shield", ruleset:'5e-2014', status:'selectable', description:"盾牌，非普通，需同调。持握时 AC 获得 +1 加值；可以动作说出命令语施放造风术（豁免 DC 15），一旦以此盾施放该法术，直至下个黎明前都不能再次施放。动作：动作。", classIds:[], equippable:true, category:'shield', rarity:'uncommon', magicItemCategory:'armor', attunement:'required', itemAction:'action', magicItemUsage:{ charged:false, consumable:false, recovery:['dawn'] }, sourceIds:HUMBLEWOOD },
  { id:"equipment-2014-tp-hw-blade-of-the-wood", name:"林地之剑", englishName:"Blade of the Wood", ruleset:'5e-2014', status:'selectable', description:"任意剑，武器，珍稀，需同调。使用此魔法武器的攻击与伤害 +1；剑有 2 发充能、每天黎明恢复 1 发，可以消耗 1 发充能念出命令语，以你自身为中心施放荆棘丛生（豁免 DC 16），你自己可以不受影响地穿过这片地形。", classIds:[], equippable:true, category:'weapon', rarity:'rare', magicItemCategory:'weapon', attunement:'required', itemAction:'varies', magicItemUsage:{ charged:true, consumable:false, recovery:['dawn'] }, sourceIds:HUMBLEWOOD },
  { id:"equipment-2014-tp-hw-feathered-helm", name:"羽冠", englishName:"Feathered Helm", ruleset:'5e-2014', status:'index-only', description:"头盔类奇物，珍稀，需同调。有 3 发充能、每天黎明恢复 1d3；按赋予羽毛的鸟族类型提供不同法术：鸦族、雉族、隼族与鸮族各有 1 发与 2 发充能两档，鸽族则消耗 1 发充能随机施放术士 1 环法术并附带副作用，豁免 DC 为 16。", classIds:[], equippable:true, category:'magic', rarity:'rare', magicItemCategory:'wondrous', attunement:'required', itemAction:'varies', magicItemUsage:{ charged:true, consumable:false, recovery:['dawn'] }, sourceIds:HUMBLEWOOD },
  { id:"equipment-2014-tp-hw-the-borealus", name:"北极天光", englishName:"The Borealus", ruleset:'5e-2014', status:'selectable', description:"法杖，神器，需同调。同调后获得火焰伤害抗性与寒冷伤害免疫；可以动作自口中喷出 100 尺锥形暴风雪，区域内生物过 DC 18 体质豁免，失败受 9d8 寒冷伤害，用后须等下个黎明；可以动作塑造冰墙（类同六环冰墙术），此后三天内不可再用。", classIds:[], equippable:true, category:'magic', rarity:'artifact', magicItemCategory:'staff', attunement:'required', itemAction:'action', magicItemUsage:{ charged:false, consumable:false, recovery:['dawn'] }, sourceIds:HUMBLEWOOD },
  { id:"equipment-2014-tp-hw-necronomicon-ex-corvis", name:"亡灵之书：古鸦禁咒", englishName:"Necronomicon Ex Corvis", ruleset:'5e-2014', status:'index-only', description:"法术书类奇物，神器，需同调。花一周研读可使智力 +2、感知 −1；吟诵一分钟仪式可召唤 1d4+2 个幽影听命，每周一次；可将书中法术抄入法术书，但抄写至少一个法术后须过 DC 16 感知豁免否则被诅咒。当前为索引条目，未参与自动计算。", classIds:[], equippable:true, category:'magic', rarity:'artifact', magicItemCategory:'wondrous', attunement:'required', itemAction:'varies', sourceIds:HUMBLEWOOD },
]
