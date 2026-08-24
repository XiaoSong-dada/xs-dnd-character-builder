/**
 * 跑团助手局内状态类型与预置状态常量。
 *
 * 局内状态（当前 HP、已用法术位、力竭层数、debuff）独立于车卡草稿：
 * 不写入 CharacterDraft、不参与 validateDraft、不随草稿导出。
 */

/** 预置普通 debuff 状态（5e 2014 PHB 状态；效果为原创转述，不复制规则书正文）。 */
export interface DebuffStatus {
  readonly id: string
  readonly name: string
  /** 原创转述的效果摘要（用于状态卡片与顶部 tag 详情）。 */
  readonly description: string
}

export const DEBUFF_STATUSES: readonly DebuffStatus[] = [
  { id: 'blinded', name: '目盲', description: '无法看见：攻击检定有劣势，且对你发动的攻击检定有优势。' },
  { id: 'charmed', name: '魅惑', description: '无法攻击魅惑者，魅惑者对你的社交互动检定有优势。' },
  { id: 'deafened', name: '耳聋', description: '听不见声音：依赖听觉的属性检定自动失败。' },
  { id: 'frightened', name: '恐慌', description: '恐惧来源可见时，攻击检定与属性检定有劣势，且无法主动靠近。' },
  { id: 'grappled', name: '擒抱', description: '速度变为 0，无法从擒抱中脱身。' },
  { id: 'incapacitated', name: '失能', description: '无法执行动作或反应。' },
  { id: 'paralyzed', name: '麻痹', description: '无法行动或说话，力量/敏捷豁免自动失败，近战命中自动视为重击。' },
  { id: 'petrified', name: '石化', description: '化为雕像：无法行动，免疫疾病，攻击者对你有优势，力量/敏捷豁免自动失败。' },
  { id: 'poisoned', name: '中毒', description: '攻击检定与属性检定有劣势。' },
  { id: 'prone', name: '倒地', description: '只能爬行：近战攻击命中你有优势、远程攻击有劣势；起身需消耗一半移动力。' },
  { id: 'restrained', name: '束缚', description: '速度变为 0，攻击检定与敏捷豁免有劣势，攻击者对你有优势。' },
  { id: 'stunned', name: '震慑', description: '无法行动或说话，自动失败力量/敏捷豁免，攻击者对你有优势。' },
  { id: 'unconscious', name: '昏迷', description: '失能且倒地：攻击自动命中并视为重击，力量/敏捷豁免自动失败。' },
]

/** 力竭最大层数（2014 规则共 6 级）。 */
export const EXHAUSTION_MAX_LEVEL = 6

/** 力竭规则转述（tag 详情展示用；MVP 只记层数，不实现各层效果计算）。 */
export const EXHAUSTION_DESCRIPTION =
  '每叠 1 层力竭承受对应层级的负面效果：1 层感知检定劣势；2 层速度减半；3 层攻击检定与豁免劣势；4 层生命值上限减半；5 层速度降为 0；6 层死亡。'

/** 休息前状态快照（撤回上次休息用，仅保留最近一次）。 */
export interface SessionRestSnapshot {
  readonly currentHp: number
  readonly usedSpellSlots: Readonly<Record<number, number>>
  readonly exhaustionLevel: number
  readonly debuffs: readonly string[]
  readonly at: string
}

export interface SessionState {
  readonly draftId: string
  /** 当前生命值；首次进入初始化为最大 HP，恒满足 0 ≤ currentHp ≤ maxHp（maxHp 以派生为准，状态中不缓存）。 */
  readonly currentHp: number
  /** 各环已用法术位，key 为环级（1—9），value 为已用数量；首次进入全 0。 */
  readonly usedSpellSlots: Readonly<Record<number, number>>
  /** 力竭层数（0—6，0 = 无力竭）；作为特殊状态单独保存，不进入 debuffs 列表。 */
  readonly exhaustionLevel: number
  /** 已挂载的普通 debuff 状态 ID 列表。 */
  readonly debuffs: readonly string[]
  /** 上次休息前的状态快照（用于撤回）；未执行过休息或无可用快照时为 undefined。 */
  readonly lastRestSnapshot?: SessionRestSnapshot
  readonly updatedAt: string
}
