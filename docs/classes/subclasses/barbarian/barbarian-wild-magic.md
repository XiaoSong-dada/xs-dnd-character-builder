# 狂野魔法道途 Path of Wild Magic

## 基本信息

- 子职 ID：`barbarian-wild-magic`
- 所属职业：[`barbarian` 野蛮人](barbarian.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；套用 2024 基础职业时按兼容规则在3级取得子职
- 内容来源：Tasha's Cauldron of Everything
- 可用范围：需 DM 允许该来源，并通过 2024 兼容性检查
- 官方详情：[D&D Beyond — Tasha's Cauldron of Everything](https://www.dndbeyond.com/sources/dnd/tcoe)

## 子职定位

狂野魔法道途让野蛮人的狂暴触发随机但偏有利的魔法效果，同时提供侦测魔法、支援队友检定或恢复法术位的能力。其核心是可序列化的狂野魔法表结果，而不是普通施法。

## 子职特性

| 等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 3 | `barbarian-wild-magic-awareness` | 魔法感知 | Magic Awareness | 感知附近的法术与魔法物品，具有有限使用次数 |
| 3 | `barbarian-wild-magic-surge` | 狂野魔法浪涌 | Wild Surge | 进入狂暴时在专属表上掷骰，获得一个随机魔法效果 |
| 6 | `barbarian-wild-magic-bolstering-magic` | 魔法强化 | Bolstering Magic | 强化生物的检定/攻击，或为施法者恢复低阶法术位 |
| 10 | `barbarian-wild-magic-unstable-backlash` | 不稳定反冲 | Unstable Backlash | 狂暴中受攻击或豁免影响时，以反应重新触发浪涌结果 |
| 14 | `barbarian-wild-magic-controlled-surge` | 受控浪涌 | Controlled Surge | 掷出多个浪涌结果并选择采用哪一个，提高可控性 |

## 选择、资源与兼容

- 浪涌结果应保存为稳定 ID，并记录持续时间、动作类型和替换规则。
- 新浪涌可能替换旧效果，不能默认把所有结果叠加。
- 魔法强化的两种用途互斥，恢复法术位必须校验目标与法术位等级。
- 狂暴禁止施法不等于禁止浪涌；浪涌属于子职特性。
- 本条目保持 `5e-2014`，不能与术士的狂野魔法子职混淆。

## 实现状态

- 资料状态：特性结构与来源已整理；浪涌表正文未收录。
- 规则数据路径：未创建。
- 自动化测试：未创建。
- 最后核验日期：2026-07-24。
