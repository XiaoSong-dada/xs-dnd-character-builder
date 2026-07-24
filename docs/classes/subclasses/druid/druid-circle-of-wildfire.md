# 野火结社 Circle of Wildfire

## 基本信息

- 子职 ID：`druid-circle-of-wildfire`
- 所属职业：[`druid` 德鲁伊](druid.md)
- 规则集：`5e-2014`
- 原版选择等级：2级；套用2024基础职业时在3级取得原本2级的结社能力
- 内容来源：Tasha's Cauldron of Everything
- 可用范围：需 DM 允许该来源，并通过2024兼容性检查
- 官方详情：[D&D Beyond — Tasha's Cauldron of Everything](https://www.dndbeyond.com/sources/dnd/tcoe)

## 子职定位

野火结社把毁灭与新生结合，消耗荒野变形召唤野火精魂。精魂能够远程攻击和带队传送，随后作为施法起点强化火焰或治疗法术，并从死亡地点制造治疗或伤害火焰。

## 子职特性

| 原版等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 2 | `druid-wildfire-circle-spells` | 野火结社法术 | Circle of Wildfire Spells | 获得始终准备的火焰、治疗与重生主题法术 |
| 2 | `druid-wildfire-summon-spirit` | 召唤野火精魂 | Summon Wildfire Spirit | 消耗荒野变形召唤精魂，具有独立统计、攻击和传送能力 |
| 6 | `druid-wildfire-enhanced-bond` | 强化联结 | Enhanced Bond | 精魂在场时强化特定火焰或治疗法术，并可作为施法起点 |
| 10 | `druid-wildfire-cauterizing-flames` | 灼疗火焰 | Cauterizing Flames | 生物死亡后产生火焰令牌，可用于治疗或伤害 |
| 14 | `druid-wildfire-blazing-revival` | 炽焰复生 | Blazing Revival | 精魂在场时，德鲁伊可消耗精魂生命值避免倒地并恢复 |

## 选择、资源与兼容

- 召唤精魂消耗2024荒野变形共享次数；精魂必须使用独立稳定ID、统计块、先攻和指令状态。
- 精魂的攻击或传送通常占用德鲁伊附赠动作，必须处理动作竞争。
- 强化联结只影响符合伤害或治疗条件的法术，施法起点改变不等于改变施法者。
- 灼疗火焰令牌具有距离、持续时间、数量和独立次数限制。
- 炽焰复生必须在触发倒地时结算，并同步扣除精魂生命值或使其消失。

## 实现状态

- 资料状态：特性结构与来源已整理；商业数值、精魂统计块和完整正文未收录。
- 规则数据路径：尚未实现。
- 自动化测试：尚未实现。
- 最后核验日期：2026-07-24。
