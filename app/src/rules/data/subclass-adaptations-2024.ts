/**
 * 2014 → 2024 子职适配登记（B13-02 / E04）。
 * 只登记官方已给出 2024 版本（含破解奥秘「子职业更新」UA）的概念；
 * 2014 条目保持原样，2024 条目使用独立 ID 与来源。
 */

export interface SubclassAdaptation2024 {
  readonly concept: string
  readonly from2014Id: string
  readonly to2024Id: string
  readonly sourceId: string
  readonly note?: string
}

export const subclassAdaptations2024: readonly SubclassAdaptation2024[] = [
  {
    concept: '先祖守卫道途',
    from2014Id: 'subclass-2014-barbarian-ancestral-guardian',
    to2024Id: 'subclass-2024-ua-barbarian-spiritual-guardian',
    sourceId: 'source-2024-ua-subclass-update',
    note: '2024 版改称「精魂守卫道途」，机制重做为选项式精魂护卫。',
  },
  {
    concept: '风暴先驱道途',
    from2014Id: 'subclass-2014-barbarian-storm-herald',
    to2024Id: 'subclass-2024-ua-barbarian-storm-herald',
    sourceId: 'source-2024-ua-subclass-update',
    note: '灵光与狂怒风暴按 2024 口径重做。',
  },
  {
    concept: '骑兵',
    from2014Id: 'subclass-2014-fighter-cavalier',
    to2024Id: 'subclass-2024-ua-fighter-cavalier',
    sourceId: 'source-2024-ua-subclass-update',
    note: '2024 版译名「骁骑士」；果决印记取消次数限制。',
  },
  {
    concept: '醉拳宗',
    from2014Id: 'subclass-2014-monk-drunken-master',
    to2024Id: 'subclass-2024-ua-monk-intoxication',
    sourceId: 'source-2024-ua-subclass-update',
    note: '2024 版译名「醉拳武者」；新增玄酒琼浆与酒道宗师。',
  },
  {
    concept: '破誓者',
    from2014Id: 'subclass-2014-paladin-oathbreaker',
    to2024Id: 'subclass-2024-ua-paladin-oathbreaker',
    sourceId: 'source-2024-ua-subclass-update',
    note: 'DM 选项语义保留；咒唤亡灵与恐惧之王按 2024 口径重做。',
  },
]

/** 按 2014 子职 ID 取对应 2024 适配登记；无适配时返回 undefined。 */
export function getSubclassAdaptation2024(from2014Id: string): SubclassAdaptation2024 | undefined {
  return subclassAdaptations2024.find((item) => item.from2014Id === from2014Id)
}
