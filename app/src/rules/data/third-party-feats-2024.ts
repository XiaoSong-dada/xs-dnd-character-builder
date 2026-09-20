import type { FeatRule } from '@/types/rules'

/**
 * 2024 第三方起源专长（G 批次 G-F）。
 *
 * 这些专长由第三方 2024 写法背景固定授予：
 * - 歪曲之月（The Crooked Moon）12 条，来源 `source-2024-tp-crooked-moon`
 * - 德拉肯海姆（Dungeons of Drakkenheim）2 条，来源 `source-2024-tp-drakkenheim`
 *
 * 登记口径：
 * - 来源均为 `contentKind: 'third-party'` 且默认关闭，界面显示「合作内容，需 DM 同意」；
 * - 条目状态 `selectable`：结构化登记中英文名、来源与原创中文摘要，
 *   具体数值效果以第三方原书为准（项目未经核验的效果不进入自动计算）；
 * - 英文名为项目转写（原书以中文条目呈现时按通行译名回写），稳定 ID 使用 `feat-2024-tp-*` 前缀，
 *   与 PHB／UA 专长 ID 完全隔离。
 */
const crookedMoon = ['source-2024-tp-crooked-moon'] as const
const drakkenheim = ['source-2024-tp-drakkenheim'] as const

const thirdPartyFeat = (
  slug: string,
  name: string,
  englishName: string,
  detail: string,
  sourceIds: readonly string[],
): FeatRule => ({
  id: `feat-2024-tp-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  description: detail,
  detail,
  tags: ['起源'],
  category: 'origin',
  status: 'selectable',
  sourceIds,
})

export const thirdPartyOriginFeats2024: readonly FeatRule[] = [
  // ===== 歪曲之月（The Crooked Moon）=====
  thirdPartyFeat('memory-hunger', '记忆饥渴', 'Memory Hunger',
    '记忆被虚空吞噬后留下的空洞仍在索取：你以追寻与拼凑他人记忆的方式获得力量。具体效果见《歪曲之月》第五章；本项按第三方原书处理，不进入自动计算。', crookedMoon),
  thirdPartyFeat('gravetender', '守墓人', 'Gravetender',
    '长期守护亡者安眠使你熟悉死亡的气息与墓葬的知识，能更从容地面对不死生物与墓穴环境。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),
  thirdPartyFeat('the-changed', '异变者', 'The Changed',
    '身体改造留下的扭曲既是伤痕也是武器：你因非自然的改造而获得超出常人的体质反应。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),
  thirdPartyFeat('coven-initiate', '教团新进者', 'Coven Initiate',
    '被秘密教团接纳为新进者，习得其仪式、暗语与部分禁忌知识。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),
  thirdPartyFeat('fate-gambler', '命运赌徒', 'Fate Gambler',
    '你以赌局与命运讨价还价，能在紧要关头押上运气换取转机。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),
  thirdPartyFeat('ghostlight-medium', '幽灯灵媒', 'Ghostlight Medium',
    '乘坐幽灯特快列车的经历让你能与亡者对话，并感知生与死之间的界线。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),
  thirdPartyFeat('shapeless-form', '无影之形', 'Shapeless Form',
    '你的倒影与阴影被剥离后，形体变得不再稳固，变化与隐匿因此更为自然。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),
  thirdPartyFeat('hunt-hunter', '猎兽猎手', 'Beast Hunter',
    '为对抗天灾野兽而受训，你熟悉怪物的弱点、踪迹与猎杀手法。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),
  thirdPartyFeat('wicker-weaver', '咒饰编织者', 'Wicker Weaver',
    '掌握只在原始森林幽影中流传的柳编仪式，能以咒饰驱逐厄运或施加诅咒。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),
  thirdPartyFeat('revel-fool', '狂欢愚者', 'Revel Fool',
    '与愚人之王的狂欢队伍同游后，你学会了在混乱与荒诞中保全自己并带动他人。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),
  thirdPartyFeat('crimson-ritualist', '猩红祭仪师', 'Crimson Ritualist',
    '对驱动生命之力的研究让你能以猩红仪轨强化自身或影响他人。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),
  thirdPartyFeat('dread-whisper', '恐惧秘言', 'Dread Whisper',
    '研读亵渎铭文与禁忌典籍使你掌握令人胆寒的秘言，可用于威吓与施压。具体效果见《歪曲之月》第五章；本项按第三方原书处理。', crookedMoon),

  // ===== 德拉肯海姆（Dungeons of Drakkenheim）=====
  thirdPartyFeat('focused-mask', '专注面具', 'Focused Mask',
    '漂泊城市间学会用一副面具稳定心神与他人的观感：你更善于在压力下维持伪装与专注。具体效果见《德拉肯海姆》相关章节；本项按第三方原书处理。', drakkenheim),
  thirdPartyFeat('aquatic-adaptation', '水生适性', 'Aquatic Adaptation',
    '马伦蒂的血脉使你在水中行动自如，游泳与呼吸不再受限制。具体效果见《德拉肯海姆》相关章节；本项按第三方原书处理。', drakkenheim),
]
