# 奥秘领域 Arcana Domain

## 基本信息

- 子职 ID：`cleric-arcana-domain`
- 所属职业：[`cleric` 牧师](cleric.md)
- 规则集：`5e-2014`
- 原版选择等级：1级；套用2024基础职业时在3级取得原本1—3级的领域能力
- 内容来源：Sword Coast Adventurer's Guide
- 可用范围：需 DM 允许该来源，并通过2024兼容性检查
- 官方详情：[D&D Beyond — Sword Coast Adventurer's Guide](https://www.dndbeyond.com/sources/dnd/scag)

## 子职定位

奥秘领域研究神术与奥术的交界。它获得法师戏法，以引导神力驱逐异界生物，治疗时解除法术效果，并在高等级从法师列表取得强力法术。

## 子职特性

| 原版等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 1 | `cleric-arcana-domain-spells` | 奥秘领域法术 | Arcana Domain Spells | 获得始终准备的侦测、反制与奥术主题法术 |
| 1 | `cleric-arcana-arcane-initiate` | 奥术启蒙 | Arcane Initiate | 获得奥秘技能熟练与两个法师戏法，并作为牧师戏法使用 |
| 2 | `cleric-arcana-arcane-abjuration` | 奥术驱逐 | Arcane Abjuration | 消耗引导神力驱散或暂时放逐特定异界生物 |
| 6 | `cleric-arcana-spell-breaker` | 法术破除者 | Spell Breaker | 以治疗法术恢复生命值时可结束目标身上的一个法术 |
| 8 | `cleric-arcana-potent-spellcasting` | 强力施法 | Potent Spellcasting | 旧版戏法伤害强化；使用2024基础职业时由神佑打击路线承接 |
| 17 | `cleric-arcana-arcane-mastery` | 奥术精通 | Arcane Mastery | 从法师法术列表选择高环法术并作为领域法术 |

## 选择、资源与兼容

- 法师戏法使用感知，并视为牧师戏法；选项必须去重并保留原列表来源。
- 奥术驱逐按生物类型、挑战等级、豁免和持续条件处理，消耗共享引导神力。
- 法术破除者只移除符合环阶限制的法术效果，不能泛化为清除所有状态。
- 奥术精通的每个环阶选择必须持久化，并标记为始终准备的领域法术。
- 套用2024牧师时，不再叠加旧版8级强力施法；7级按基础职业选择神佑打击。

## 实现状态

- 资料状态：特性结构与来源已整理；商业法术表、数值和完整规则正文未收录。
- 规则数据路径：尚未实现。
- 自动化测试：尚未实现。
- 最后核验日期：2026-07-24。
