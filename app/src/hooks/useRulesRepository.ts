import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'

import { getRulesRepository } from '@/rules/repositories'
import { customContentVersion } from '@/stores/custom-content'
import type { RulesetId } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

/**
 * 响应内容工坊变化的仓库获取入口。
 *
 * `getRulesRepository` 本身返回「内置 + 自定义」的合并仓库，但只有在内容版本变化时才会重建；
 * 组件里的 `computed` 若只依赖 `ruleset`，新增内容后不会重新求值。本 hook 把内容工坊的
 * 模块级版本号显式并进依赖，让车卡各步骤、角色卡与跑团面板在保存自定义内容后立即刷新。
 *
 * 纯规则函数内部的 `getRulesRepository(draft.ruleset)` 不受影响：它在 `computed` 求值时读取，
 * 由组件层的这次重算自然带动。
 */
export function useRulesRepository(ruleset: MaybeRefOrGetter<RulesetId>): ComputedRef<RulesRepository> {
  return computed(() => {
    // 读取版本号建立响应式依赖；值本身不参与计算。
    void customContentVersion.value
    return getRulesRepository(toValue(ruleset))
  })
}
