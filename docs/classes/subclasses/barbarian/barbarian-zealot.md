# 狂信者道途 Path of the Zealot

## 基本信息

- 子职 ID：`barbarian-zealot`
- 所属职业：[`barbarian` 野蛮人](barbarian.md)
- 规则集：`5e-2024`
- 选择等级：3级
- 内容来源：2024《玩家手册》
- 许可边界：记录官方目录、特性结构与简要转述，不复制商业规则正文
- 核验状态：名称、等级结构与公开玩法摘要已核验
- 官方详情：[2024 Barbarian vs. 2014 Barbarian](https://www.dndbeyond.com/posts/1750-2024-barbarian-vs-2014-barbarian-whats-new)

## 子职定位

狂信者以神圣或超自然信念强化狂暴。它在攻击中加入神圣伤害，提供自我治疗和团队爆发，并在高等级用飞行、抗性和避免降至0 HP的能力保持战线。

## 子职特性

| 等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 3 | `barbarian-zealot-divine-fury` | 神圣狂怒 | Divine Fury | 狂暴期间每回合首次以武器或徒手攻击命中时追加神圣类型伤害 |
| 3 | `barbarian-zealot-warrior-of-the-gods` | 诸神战士 | Warrior of the Gods | 获得有限的治疗骰池，可用附赠动作恢复自身生命值 |
| 6 | `barbarian-zealot-fanatical-focus` | 狂信专注 | Fanatical Focus | 狂暴期间失败豁免时获得重掷机会 |
| 10 | `barbarian-zealot-zealous-presence` | 狂热气场 | Zealous Presence | 以附赠动作短暂强化附近盟友的攻击与豁免 |
| 14 | `barbarian-zealot-rage-of-the-gods` | 诸神之怒 | Rage of the Gods | 进入神圣强化状态，获得飞行与抗性，并能阻止自己或盟友降至0 HP |

## 选择、资源与校验

- 神圣狂怒具有每回合触发上限，并依赖狂暴与命中事件。
- 伤害类型选择、治疗骰数量和恢复时机必须作为规则数据保存。
- 狂信专注不能绕过其使用次数与恢复限制。
- 狂热气场消耗附赠动作，其重复使用与狂暴次数存在关联。
- 诸神之怒涉及持续时间、抗性、飞行与防止0 HP，应分别建模而非写成单一布尔值。

## 实现状态

- 规则数据路径：待授权后创建。
- 校验重点：每回合触发、治疗骰池、重掷、范围增益、阻止0 HP。
- 自动化测试：待授权后创建。
- 最后核验日期：2026-07-24。
