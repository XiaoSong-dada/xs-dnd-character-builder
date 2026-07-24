# 坟墓领域 Grave Domain

## 基本信息

- 子职 ID：`cleric-grave-domain`
- 所属职业：[`cleric` 牧师](cleric.md)
- 规则集：`5e-2014`
- 原版选择等级：1级；套用2024基础职业时在3级取得原本1—3级的领域能力
- 内容来源：Xanathar's Guide to Everything
- 可用范围：需 DM 允许该来源，并通过2024兼容性检查
- 官方详情：[D&D Beyond — Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)

## 子职定位

坟墓领域维护生死边界，擅长抢救倒地同伴并为队伍制造爆发窗口。它强化对零生命目标的治疗、感知亡灵、使敌人易受下一次伤害，并能取消关键重击。

## 子职特性

| 原版等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 1 | `cleric-grave-domain-spells` | 坟墓领域法术 | Grave Domain Spells | 获得始终准备的侦测、衰弱与复生主题法术 |
| 1 | `cleric-grave-circle-of-mortality` | 生死循环 | Circle of Mortality | 对零生命目标进行治疗时最大化治疗骰，并强化稳定伤势戏法 |
| 1 | `cleric-grave-eyes-of-the-grave` | 坟墓之眼 | Eyes of the Grave | 有限次数感知附近亡灵的存在和方向 |
| 2 | `cleric-grave-path-to-the-grave` | 通往坟墓之路 | Path to the Grave | 消耗引导神力，使目标易受下一次攻击造成的全部伤害 |
| 6 | `cleric-grave-sentinel-at-deaths-door` | 死亡之门哨卫 | Sentinel at Death’s Door | 以反应把附近目标遭受的重击改为普通命中 |
| 8 | `cleric-grave-potent-spellcasting` | 强力施法 | Potent Spellcasting | 旧版戏法伤害强化；使用2024基础职业时由神佑打击路线承接 |
| 17 | `cleric-grave-keeper-of-souls` | 灵魂守护者 | Keeper of Souls | 附近敌人死亡时为自身或附近生物恢复生命值 |

## 选择、资源与兼容

- 生死循环必须在治疗结算前确认目标当前为零生命值。
- 坟墓之眼具有独立次数、范围和遮蔽限制，不能显示亡灵身份的全部信息。
- 通往坟墓之路消耗共享引导神力，只由下一次符合条件的攻击触发并及时清除标记。
- 死亡之门哨卫消耗反应和独立次数，必须在重击伤害结算前触发。
- 套用2024牧师时，不再叠加旧版8级强力施法；7级按基础职业选择神佑打击。

## 实现状态

- 资料状态：特性结构与来源已整理；商业法术表、数值和完整规则正文未收录。
- 规则数据路径：尚未实现。
- 自动化测试：尚未实现。
- 最后核验日期：2026-07-24。
