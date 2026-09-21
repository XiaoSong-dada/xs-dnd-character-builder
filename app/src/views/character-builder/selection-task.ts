export type SelectionTaskStatus = 'pending' | 'current' | 'complete' | 'optional' | 'invalid'

/** 车卡步骤内部的小任务；只描述展示状态，不写入角色草稿。 */
export interface SelectionTask {
  readonly id: string
  readonly label: string
  readonly group: string
  readonly required: boolean
  readonly status: SelectionTaskStatus
  readonly summary: string
  readonly progress?: string
}

/**
 * 步骤向页面暴露的聚焦句柄（v1.9.1 R3-6／R3-8）：
 * 吸底栏的「去完成」只发事件，由页面经该句柄切到本步首个未完成任务并聚焦任务标题；
 * 任务判定与切换逻辑仍由页面私有 hook `useSelectionTaskFlow` 提供，不在组件内复制。
 */
export interface SelectionTaskFocusHandle {
  focusFirstIncomplete(): void
}
