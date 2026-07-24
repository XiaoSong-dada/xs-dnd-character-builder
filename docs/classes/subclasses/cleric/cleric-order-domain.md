# 秩序领域 Order Domain

## 基本信息

- 子职 ID：`cleric-order-domain`
- 所属职业：[`cleric` 牧师](cleric.md)
- 规则集：`5e-2014`
- 原版选择等级：1级；套用2024基础职业时在3级取得原本1—3级的领域能力
- 内容来源：Tasha's Cauldron of Everything
- 可用范围：需 DM 允许该来源，并通过2024兼容性检查
- 官方详情：[D&D Beyond — Tasha's Cauldron of Everything](https://www.dndbeyond.com/sources/dnd/tcoe)

## 子职定位

秩序领域通过命令、控制和队友协同塑造战局。它让被己方法术影响的盟友立即反击，以引导神力迫使敌人服从并放下武器，还能加快惑控法术的施展。

## 子职特性

| 原版等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 1 | `cleric-order-domain-spells` | 秩序领域法术 | Order Domain Spells | 获得始终准备的命令、控制与秩序主题法术 |
| 1 | `cleric-order-bonus-proficiency` | 额外熟练 | Bonus Proficiency | 获得重甲训练，以及威吓或游说其中一项技能熟练 |
| 1 | `cleric-order-voice-of-authority` | 权威之声 | Voice of Authority | 用法术影响盟友后，可让其中一名盟友以反应发动武器攻击 |
| 2 | `cleric-order-orders-demand` | 秩序号令 | Order’s Demand | 消耗引导神力魅惑附近目标，并可迫使其丢下持有物 |
| 6 | `cleric-order-embodiment-of-law` | 律法化身 | Embodiment of the Law | 有限次数把符合条件的惑控法术改为附赠动作施展 |
| 8 | `cleric-order-divine-strike` | 神圣打击 | Divine Strike | 旧版武器伤害强化；使用2024基础职业时由神佑打击路线承接 |
| 17 | `cleric-order-orders-wrath` | 秩序之怒 | Order’s Wrath | 神圣打击命中后标记目标，使盟友下一次命中追加伤害 |

## 选择、资源与兼容

- 额外技能必须二选一，重甲训练与2024守护者重复时不叠加。
- 权威之声每次施法只选择一个受法术影响的盟友，并消耗该盟友的反应。
- 秩序号令按范围、目标可见性、豁免和物品可丢弃性分别校验。
- 律法化身改变施法动作类型，仍须遵守每回合法术、附赠动作和资源限制。
- 套用2024牧师时，不再取得旧版8级与17级中依赖旧版神圣打击的完整链路，具体替代需由 DM 决定；至少禁止与2024神佑打击叠加。

## 实现状态

- 资料状态：特性结构与来源已整理；商业法术表、数值和完整规则正文未收录。
- 规则数据路径：尚未实现。
- 自动化测试：尚未实现。
- 最后核验日期：2026-07-24。
