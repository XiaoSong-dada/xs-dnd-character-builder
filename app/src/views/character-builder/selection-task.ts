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
