import type { CharacterDraft } from '@/types/character'
import type { ClassLevelEntry, MulticlassDraft, MulticlassState } from '@/types/multiclass'

/**
 * 兼职（多职业）草稿的解析与写入纯函数（MC-A01）。
 *
 * 约定：
 * - 本模块保持框架无关，不依赖 Vue、Pinia、Router、DOM、存储或网络。
 * - **总等级是派生值**：恒等于 `Σ 各职业等级`，不单独维护（需求 §5.1.2）。
 * - 无 `multiclass` 字段时按 `classId + targetLevel + subclassId` 合成单职业结果，
 *   且不写回草稿（旧草稿不被批量改写，需求 §7）。
 * - 单职业与多职业共用同一套读取入口，避免调用方分叉。
 */

/** 角色总等级上下限。 */
export const MIN_CHARACTER_LEVEL = 1
export const MAX_CHARACTER_LEVEL = 20
/**
 * 职业等级下限（1）与**兼职时**的职业等级上限（19，留出至少 1 级给其他职业）。
 *
 * 单个职业时职业等级上限等于角色总等级上限（20）——此时不存在「留级给其他职业」的约束，
 * 具体取值统一走 `getMaxClassLevel()`，不要在调用点直接写死本常量（需求 §8，决策 D42）。
 */
export const MIN_CLASS_LEVEL = 1
export const MAX_CLASS_LEVEL = MAX_CHARACTER_LEVEL - 1

export type MulticlassWriteError =
  | 'class-unknown'
  | 'class-duplicate'
  | 'class-not-found'
  | 'primary-class'
  | 'total-level-exceeded'
  | 'invalid-level'

export interface MulticlassWriteResult {
  readonly draft: CharacterDraft
  readonly ok: boolean
  readonly error?: MulticlassWriteError
}

function clampClassLevel(level: number, max: number): number {
  if (!Number.isFinite(level)) return MIN_CLASS_LEVEL
  return Math.min(max, Math.max(MIN_CLASS_LEVEL, Math.trunc(level)))
}

/**
 * 某草稿允许的职业等级上限（需求 §8，决策 D42）。
 *
 * - 兼职（职业数 > 1）：`MAX_CLASS_LEVEL`（19）；
 * - 单职业（职业数为 1，含由旧字段合成的草稿）：`MAX_CHARACTER_LEVEL`（20）。
 */
export function getMaxClassLevel(draft: MulticlassDraft): number {
  return getClassEntries(draft).length > 1 ? MAX_CLASS_LEVEL : MAX_CHARACTER_LEVEL
}

/**
 * 单职业兼容条目：由旧字段合成，非持久化数据。
 *
 * 同时带上 `subclassId`，这样尚未迁移到 `multiclass` 的草稿在
 * `getClassSubclassId`／`getClassSubclassIds`／时间线等统一入口下行为与旧路径一致。
 */
function fallbackEntry(draft: MulticlassDraft): readonly ClassLevelEntry[] {
  const classId = draft.classId
  if (!classId) return []
  const level = Math.max(MIN_CHARACTER_LEVEL, Math.trunc(draft.targetLevel ?? MIN_CHARACTER_LEVEL))
  return [{ classId, level, ...(draft.subclassId ? { subclassId: draft.subclassId } : {}) }]
}

/** 按草稿解析职业等级条目：优先 `multiclass.classes`，否则由旧字段合成。 */
export function getClassEntries(draft: MulticlassDraft): readonly ClassLevelEntry[] {
  const classes = draft.multiclass?.classes
  return classes && classes.length > 0 ? classes : fallbackEntry(draft)
}

/** 统一读取入口：兼职状态缺失时按单职业合成（`enabled` 取 false）。 */
export function getMulticlassState(draft: MulticlassDraft): MulticlassState {
  const classes = getClassEntries(draft)
  const state = draft.multiclass
  if (classes.length === 0) {
    return { enabled: state?.enabled ?? false, primaryClassId: '', classes: [], levelOrder: state?.levelOrder ?? [] }
  }
  const primaryClassId = state?.primaryClassId && classes.some((entry) => entry.classId === state.primaryClassId)
    ? state.primaryClassId
    : classes[0]!.classId
  const total = classes.reduce((sum, entry) => sum + entry.level, 0)
  const levelOrder = state?.levelOrder?.length === total ? state.levelOrder : rebuildLevelOrder(classes)
  return { enabled: state?.enabled ?? false, primaryClassId, classes, levelOrder }
}

/** 起始职业（承载 1 级生命值、起始装备与豁免熟练）。 */
export function getPrimaryClassId(draft: MulticlassDraft): string | undefined {
  const classes = getClassEntries(draft)
  if (classes.length === 0) return undefined
  const state = draft.multiclass
  return state?.primaryClassId && classes.some((entry) => entry.classId === state.primaryClassId)
    ? state.primaryClassId
    : classes[0]!.classId
}

/** 总等级 = Σ 各职业等级。 */
export function getTotalLevel(draft: MulticlassDraft): number {
  return getClassEntries(draft).reduce((sum, entry) => sum + entry.level, 0)
}

/** 某职业的等级；未选取该职业时返回 0。 */
export function getClassLevel(draft: MulticlassDraft, classId: string | undefined): number {
  if (!classId) return 0
  return getClassEntries(draft).find((entry) => entry.classId === classId)?.level ?? 0
}

/** 某职业的子职；未选取该职业时返回 undefined（旧草稿回退到 `draft.subclassId`）。 */
export function getClassSubclassId(draft: MulticlassDraft, classId: string | undefined): string | undefined {
  if (!classId) return undefined
  const entry = getClassEntries(draft).find((item) => item.classId === classId)
  if (entry) return entry.subclassId
  return draft.classId === classId ? draft.subclassId : undefined
}

/** 各职业子职的映射（键为职业 id）；供时间线按职业展开子职特性检查点。 */
export function getClassSubclassIds(draft: MulticlassDraft): Readonly<Record<string, string | undefined>> {
  return Object.fromEntries(getClassEntries(draft).map((entry) => [entry.classId, entry.subclassId]))
}

/** 是否已启用兼职（开关打开**且**至少两个职业）。 */
export function isMulticlassActive(draft: MulticlassDraft): boolean {
  const state = draft.multiclass
  return Boolean(state?.enabled) && (state?.classes.length ?? 0) > 1
}

/**
 * 最近获得等级的职业：按升级顺序从后往前取 n 个。
 * `levelOrder` 缺失或长度不符时由各职业等级重建（决策 D7：不留历史，可重建）。
 */
export function getLastLevelClassIds(draft: MulticlassDraft, count: number): readonly string[] {
  if (count <= 0) return []
  const classes = getClassEntries(draft)
  if (classes.length === 0) return []
  const total = classes.reduce((sum, entry) => sum + entry.level, 0)
  const order = draft.multiclass?.levelOrder?.length === total ? draft.multiclass.levelOrder : rebuildLevelOrder(classes)
  return order.slice(Math.max(0, order.length - Math.min(count, order.length)))
}

/**
 * 升级顺序缺失时的重建（兜底，不表达真实历史）。
 *
 * 语义：先把每个职业的第 1 级按加入顺序排好（保证每个职业都从 1 级起步），
 * 再把剩余等级按加入顺序依次分配，跳过已达自身等级上限的职业。
 */
export function rebuildLevelOrder(classes: readonly ClassLevelEntry[]): readonly string[] {
  const remaining = classes.map((entry) => Math.max(0, Math.trunc(entry.level)))
  const order: string[] = []
  // 每个职业的第 1 级
  classes.forEach((entry, index) => {
    if ((remaining[index] ?? 0) > 0) {
      order.push(entry.classId)
      remaining[index] = (remaining[index] ?? 0) - 1
    }
  })
  // 剩余等级按加入顺序轮流分配，跳过已用尽的职业
  let progressed = true
  while (progressed) {
    progressed = false
    for (let index = 0; index < classes.length; index += 1) {
      const entry = classes[index]
      if (!entry || (remaining[index] ?? 0) <= 0) continue
      order.push(entry.classId)
      remaining[index] = (remaining[index] ?? 0) - 1
      progressed = true
    }
  }
  return order
}

/** 等级分配前后的总等级差：正数为净升级，负数为净降级。 */
export function getLevelDelta(before: MulticlassDraft, after: MulticlassDraft): number {
  return getTotalLevel(after) - getTotalLevel(before)
}

/**
 * 总等级滑杆的可选范围（需求 §3.3）。
 *
 * - 下限 = **当前职业数量**：拖动滑杆不会移除职业，每个职业至少留 1 级；
 * - 上限 = 角色总等级上限 20；
 * - 没有任何职业时下限取角色等级下限（滑杆此时由「选择起始职业」流程接管）。
 */
export function getTotalLevelBounds(draft: MulticlassDraft): { readonly min: number; readonly max: number } {
  const count = getClassEntries(draft).length
  return {
    min: count > 0 ? count : MIN_CHARACTER_LEVEL,
    max: MAX_CHARACTER_LEVEL,
  }
}

/** 用新的职业集合重建兼职状态：重算 `levelOrder` 并同步总等级。 */
function withClassEntries(draft: CharacterDraft, entries: readonly ClassLevelEntry[]): CharacterDraft {
  const total = entries.reduce((sum, entry) => sum + entry.level, 0)
  const before = getClassEntries(draft)
  // 等级总数不变时保留既有升级顺序（重新分配不产生新等级）；否则按各职业等级重建。
  const beforeTotal = before.reduce((sum, entry) => sum + entry.level, 0)
  const levelOrder = draft.multiclass && beforeTotal === total
    ? draft.multiclass.levelOrder
    : rebuildLevelOrder(entries)
  const primaryClassId = getPrimaryClassId(draft) ?? entries[0]?.classId ?? ''
  const state: MulticlassState = {
    enabled: draft.multiclass?.enabled ?? false,
    primaryClassId,
    classes: entries,
    levelOrder,
  }
  return { ...draft, multiclass: state, targetLevel: total }
}

/** 写入某职业的等级（兼职 1—19／单职业 1—20，见 `getMaxClassLevel`）；该职业尚未加入时先加入。总等级超过 20 时拒绝写入。 */
export function setClassLevel(draft: CharacterDraft, classId: string, level: number): MulticlassWriteResult {
  if (!classId) return { draft, ok: false, error: 'class-unknown' }
  const entries = getClassEntries(draft)
  const index = entries.findIndex((entry) => entry.classId === classId)
  if (index < 0) return addClassEntry(draft, classId)
  const next = clampClassLevel(level, getMaxClassLevel(draft))
  const current = entries[index]!
  if (next === current.level) return { draft, ok: true }
  const others = entries.reduce((sum, entry, position) => position === index ? sum : sum + entry.level, 0)
  if (others + next > MAX_CHARACTER_LEVEL) return { draft, ok: false, error: 'total-level-exceeded' }
  const updated = entries.map((entry, position) => position === index ? { ...entry, level: next } : entry)
  return { draft: withClassEntries(draft, updated), ok: true }
}

/** 加入一个职业的 1 级；同职业不可重复加入，总等级达 20 时拒绝。 */
export function addClassEntry(draft: CharacterDraft, classId: string): MulticlassWriteResult {
  if (!classId) return { draft, ok: false, error: 'class-unknown' }
  const entries = getClassEntries(draft)
  if (entries.some((entry) => entry.classId === classId)) return { draft, ok: false, error: 'class-duplicate' }
  const total = entries.reduce((sum, entry) => sum + entry.level, 0)
  if (total + MIN_CLASS_LEVEL > MAX_CHARACTER_LEVEL) return { draft, ok: false, error: 'total-level-exceeded' }
  const updated = [...entries, { classId, level: MIN_CLASS_LEVEL }]
  const next = withClassEntries(draft, updated)
  return { draft: { ...next, multiclass: { ...(next.multiclass as MulticlassState), enabled: true } }, ok: true }
}

/** 移除一个职业（降到 0 的语义）；起始职业不可直接移除。 */
export function removeClassEntry(draft: CharacterDraft, classId: string): MulticlassWriteResult {
  const entries = getClassEntries(draft)
  if (!entries.some((entry) => entry.classId === classId)) return { draft, ok: false, error: 'class-not-found' }
  if (getPrimaryClassId(draft) === classId) return { draft, ok: false, error: 'primary-class' }
  const updated = entries.filter((entry) => entry.classId !== classId)
  if (updated.length === 0) return { draft, ok: false, error: 'primary-class' }
  return { draft: withClassEntries(draft, updated), ok: true }
}

/** 设置某职业的子职；`undefined` 表示清除。 */
export function setClassSubclassId(draft: CharacterDraft, classId: string, subclassId: string | undefined): MulticlassWriteResult {
  const entries = getClassEntries(draft)
  const index = entries.findIndex((entry) => entry.classId === classId)
  if (index < 0) return { draft, ok: false, error: 'class-not-found' }
  const updated = entries.map((entry, position) => position === index
    ? (subclassId ? { ...entry, subclassId } : { classId: entry.classId, level: entry.level })
    : entry)
  return { draft: withClassEntries(draft, updated), ok: true }
}

/** 设置兼职开关（D2／D10）：不改动职业集合与等级，只切换入口可见性。 */
export function setMulticlassEnabled(draft: CharacterDraft, enabled: boolean): CharacterDraft {
  const state = getMulticlassState(draft)
  return { ...draft, multiclass: { ...state, enabled } }
}

/**
 * 直接设置总等级（需求 §3.3，决策 D14）。
 *
 * 拖动总等级滑杆时按下列顺序搬运等级，**不改变职业数量**：
 * - 加级：加给职业列表的**最后一个职业**。
 *   兼职时不需要进位——若末位职业已达 `MAX_CLASS_LEVEL`（19），则总等级 ≥ 19 + (n−1) ≥ 20（n ≥ 2），
 *   此时总等级已到上限、不会再有加级请求；单职业时末位即该职业，上限为 20（`getMaxClassLevel`）。
 * - 减级：从列表**末尾往前**找第一个「等级 > 1」的职业减 1；因此任何职业都不会因拖动被移除
 *   （要移除职业必须显式调用 `removeClassEntry`）。
 * - 越界（低于职业数量或高于 20）、空职业集合、等级不变时：分别返回 `invalid-level`／
 *   `class-not-found`／原草稿（`ok: true`）。
 */
export function setTotalLevel(draft: CharacterDraft, total: number): MulticlassWriteResult {
  const entries = getClassEntries(draft)
  if (entries.length === 0) return { draft, ok: false, error: 'class-not-found' }
  const target = Number.isFinite(total) ? Math.trunc(total) : getTotalLevel(draft)
  const { min, max } = getTotalLevelBounds(draft)
  if (target < min || target > max) return { draft, ok: false, error: 'invalid-level' }
  const current = entries.reduce((sum, entry) => sum + entry.level, 0)
  if (target === current) return { draft, ok: true }

  const updated = entries.map((entry) => ({ ...entry }))
  if (target > current) {
    const last = updated[updated.length - 1]!
    last.level += target - current
  } else {
    let remaining = current - target
    for (let index = updated.length - 1; index >= 0 && remaining > 0; index -= 1) {
      const entry = updated[index]!
      const reducible = Math.min(remaining, entry.level - MIN_CLASS_LEVEL)
      entry.level -= reducible
      remaining -= reducible
    }
    // 下限已保证存在可减的等级；防御性返回，避免写出总等级不符的草稿。
    if (remaining > 0) return { draft, ok: false, error: 'invalid-level' }
  }
  const maxClassLevel = getMaxClassLevel(draft)
  if (updated.some((entry) => entry.level > maxClassLevel || entry.level < MIN_CLASS_LEVEL)) {
    return { draft, ok: false, error: 'invalid-level' }
  }
  return { draft: withClassEntries(draft, updated), ok: true }
}

/**
 * 关闭兼职时的合并（需求 §7，决策 D41）：**总等级不变**，删除其他职业，
 * 起始职业等级取当前总等级（单职业上限 20，决策 D42）。
 *
 * 返回 `enabled: false` 的单职业草稿；无职业或无起始职业时返回 `class-not-found`。
 */
export function mergeIntoPrimaryClass(draft: CharacterDraft): MulticlassWriteResult {
  const entries = getClassEntries(draft)
  const primaryClassId = getPrimaryClassId(draft)
  if (entries.length === 0 || !primaryClassId) return { draft, ok: false, error: 'class-not-found' }
  const total = entries.reduce((sum, entry) => sum + entry.level, 0)
  const subclassId = getClassSubclassId(draft, primaryClassId)
  const merged: ClassLevelEntry = {
    classId: primaryClassId,
    level: Math.min(MAX_CHARACTER_LEVEL, Math.max(MIN_CLASS_LEVEL, total)),
    ...(subclassId ? { subclassId } : {}),
  }
  return {
    draft: {
      ...draft,
      multiclass: {
        enabled: false,
        primaryClassId,
        classes: [merged],
        levelOrder: Array.from({ length: merged.level }, () => primaryClassId),
      },
      classId: primaryClassId,
      subclassId,
      targetLevel: merged.level,
    },
    ok: true,
  }
}

/**
 * 切换起始职业（需求 §4.4，决策 D16／D17）。
 *
 * 语义：
 * - **职业列表重排为起始职业在最前**，使 `classId`／`primaryClassId`／`classes[0]` 三者天然一致；
 * - `levelOrder[0]` 改为新起始职业，其余顺序不变（角色 1 级所升职业与 1 级生命值口径一致）；
 * - 各职业的等级与子职不变；原起始职业变成普通职业，此后可由 `removeClassEntry` 移除。
 */
export function setPrimaryClassId(draft: CharacterDraft, classId: string): MulticlassWriteResult {
  if (!classId) return { draft, ok: false, error: 'class-unknown' }
  const entries = getClassEntries(draft)
  const index = entries.findIndex((entry) => entry.classId === classId)
  if (index < 0) return { draft, ok: false, error: 'class-not-found' }
  // 完全无需改动时才原样返回：起始职业、列表首位与 `classId`／`subclassId` 兼容字段都必须已对齐，
  // 否则下面要继续把它们同步过来（例如刚加入第一个职业时 `classId` 还是空的）。
  const head = entries[0]
  if (getPrimaryClassId(draft) === classId && index === 0
    && draft.classId === classId && (draft.subclassId ?? undefined) === (head?.subclassId ?? undefined)) {
    return { draft, ok: true }
  }

  const reordered = [entries[index]!, ...entries.filter((_, position) => position !== index)]
  const total = reordered.reduce((sum, entry) => sum + entry.level, 0)
  const previousOrder = draft.multiclass?.levelOrder?.length === total
    ? draft.multiclass.levelOrder
    : rebuildLevelOrder(entries)
  // 角色 1 级所升职业必须是起始职业。做法：把起始职业的一次出现挪到最前，
  // 其余顺序原样保留——这样 `levelOrder` 的**长度与各职业出现次数都不变**。
  const rest = [...previousOrder]
  const occurrence = rest.indexOf(classId)
  if (occurrence >= 0) rest.splice(occurrence, 1)
  const levelOrder = [classId, ...rest]
  const state: MulticlassState = {
    enabled: draft.multiclass?.enabled ?? false,
    primaryClassId: classId,
    classes: reordered,
    levelOrder,
  }
  const primaryEntry = reordered[0]
  const { subclassId: _previousSubclassId, ...restDraft } = draft
  return {
    draft: {
      ...restDraft,
      multiclass: state,
      classId,
      targetLevel: total,
      ...(primaryEntry?.subclassId ? { subclassId: primaryEntry.subclassId } : {}),
    },
    ok: true,
  }
}

/**
 * 归一化兼职状态：修正非法等级、补齐/校验起始职业、同步总等级与升级顺序。
 * 没有任何职业信息时返回 undefined（旧草稿只有等级没有职业，无法推断职业集合）。
 */
export function normalizeMulticlass(value: unknown): MulticlassState | undefined {
  if (!value || typeof value !== 'object') return undefined
  const raw = value as Partial<MulticlassState>
  const seen = new Set<string>()
  const rawClasses: { classId: string; level: number; subclassId?: string }[] = []
  for (const candidate of Array.isArray(raw.classes) ? raw.classes : []) {
    if (!candidate || typeof candidate !== 'object') continue
    const entry = candidate as Partial<ClassLevelEntry>
    if (typeof entry.classId !== 'string' || entry.classId.trim().length === 0) continue
    if (seen.has(entry.classId)) continue
    seen.add(entry.classId)
    rawClasses.push({
      classId: entry.classId,
      level: Number(entry.level),
      ...(typeof entry.subclassId === 'string' && entry.subclassId.trim().length > 0 ? { subclassId: entry.subclassId } : {}),
    })
  }
  if (rawClasses.length === 0) return undefined
  // 上限按**最终职业数**判定（需求 §8，决策 D42）：单职业允许 20，兼职仍为 19。
  const maxClassLevel = rawClasses.length > 1 ? MAX_CLASS_LEVEL : MAX_CHARACTER_LEVEL
  const classes: ClassLevelEntry[] = rawClasses.map((entry) => ({
    classId: entry.classId,
    level: clampClassLevel(entry.level, maxClassLevel),
    ...(entry.subclassId ? { subclassId: entry.subclassId } : {}),
  }))
  const primaryClassId = typeof raw.primaryClassId === 'string' && classes.some((entry) => entry.classId === raw.primaryClassId)
    ? raw.primaryClassId
    : classes[0]!.classId
  const total = classes.reduce((sum, entry) => sum + entry.level, 0)
  const levelOrder = Array.isArray(raw.levelOrder)
    ? raw.levelOrder.filter((id): id is string => typeof id === 'string' && seen.has(id))
    : []
  return {
    enabled: Boolean(raw.enabled),
    primaryClassId,
    classes,
    levelOrder: levelOrder.length === total ? levelOrder : rebuildLevelOrder(classes),
  }
}
