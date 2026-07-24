# 战狂道途 Path of the Battlerager

## 基本信息

- 子职 ID：`barbarian-battlerager`
- 所属职业：[`barbarian` 野蛮人](barbarian.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；套用 2024 基础职业时按兼容规则在3级取得子职
- 内容来源：Sword Coast Adventurer's Guide
- 可用范围：需 DM 允许该来源；原书默认面向矮人角色，DM 可根据战役设定解除限制
- 官方详情：[D&D Beyond — Sword Coast Adventurer's Guide](https://www.dndbeyond.com/sources/dnd/scag)

## 子职定位

战狂道途围绕尖刺护甲进行贴身缠斗：狂暴中用护甲发动攻击，鲁莽攻击时获得临时生命值，以附赠动作冲刺，并在被近战命中时用尖刺反伤。它对装备状态的依赖明显高于其他野蛮人子职。

## 子职特性

| 等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 3 | `barbarian-battlerager-armor` | 战狂护甲 | Battlerager Armor | 取得并使用尖刺护甲；狂暴期间可用附赠动作以护甲攻击，擒抱时也能造成尖刺伤害 |
| 6 | `barbarian-battlerager-reckless-abandon` | 鲁莽舍身 | Reckless Abandon | 狂暴中使用鲁莽攻击时获得与体质相关的临时生命值 |
| 10 | `barbarian-battlerager-charge` | 战狂冲锋 | Battlerager Charge | 狂暴期间可用附赠动作疾走 |
| 14 | `barbarian-battlerager-spiked-retribution` | 尖刺反击 | Spiked Retribution | 狂暴、穿着尖刺护甲且被近身攻击命中时，对攻击者造成尖刺伤害 |

## 选择、资源与兼容

- 必须独立记录“穿着尖刺护甲”状态；未装备时不能启用依赖护甲的能力。
- 护甲攻击、狂暴延长和附赠动作占用需要统一处理。
- 临时生命值不能叠加。
- 原版种族限制属于战役设定约束，应由团规则配置，不要硬编码为所有世界通用。
- 本条目不得与 `5e-2024` 子职能力混合或叠加。

## 实现状态

- 资料状态：特性结构与来源已整理；具体数值需查阅官方内容。
- 规则数据路径：未创建。
- 自动化测试：未创建。
- 最后核验日期：2026-07-24。
