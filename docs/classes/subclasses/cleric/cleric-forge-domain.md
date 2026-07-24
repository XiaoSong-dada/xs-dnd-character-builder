# 锻造领域 Forge Domain

## 基本信息

- 子职 ID：`cleric-forge-domain`
- 所属职业：[`cleric` 牧师](cleric.md)
- 规则集：`5e-2014`
- 原版选择等级：1级；套用2024基础职业时在3级取得原本1—3级的领域能力
- 内容来源：Xanathar's Guide to Everything
- 可用范围：需 DM 允许该来源，并通过2024兼容性检查
- 官方详情：[D&D Beyond — Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)

## 子职定位

锻造领域围绕装备强化、金属制造和重装生存构筑。它每日祝福一件武器或护甲，用引导神力重塑金属，逐步获得火焰抗性、重甲防护，最终免疫火焰并抵抗常见物理伤害。

## 子职特性

| 原版等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 1 | `cleric-forge-domain-spells` | 锻造领域法术 | Forge Domain Spells | 获得始终准备的制造、防护与火焰主题法术 |
| 1 | `cleric-forge-bonus-proficiencies` | 额外熟练 | Bonus Proficiencies | 获得重甲训练和锻造工具熟练 |
| 1 | `cleric-forge-blessing-of-the-forge` | 锻炉祝福 | Blessing of the Forge | 长休后临时强化一件非魔法武器或护甲 |
| 2 | `cleric-forge-artisans-blessing` | 工匠祝福 | Artisan’s Blessing | 以仪式和引导神力，把金属材料重塑为符合价值限制的物品 |
| 6 | `cleric-forge-soul-of-the-forge` | 锻炉之魂 | Soul of the Forge | 获得火焰抗性，并在穿重甲时提高防护 |
| 8 | `cleric-forge-divine-strike` | 神圣打击 | Divine Strike | 旧版武器伤害强化；使用2024基础职业时由神佑打击路线承接 |
| 17 | `cleric-forge-saint-of-forge-and-fire` | 锻火圣者 | Saint of Forge and Fire | 获得火焰免疫，并在重甲下抵抗常见武器伤害 |

## 选择、资源与兼容

- 锻炉祝福同时只能作用一件合法的非魔法物品，并在下次长休选择后替换。
- 工匠祝福消耗共享引导神力，必须校验金属材料、物品价值、制作时间和成品类别。
- 重甲训练与2024守护者重复时不叠加；锻造工具熟练仍独立保留。
- 锻炉之魂与锻火圣者的护甲条件必须根据当前穿戴状态动态判断。
- 套用2024牧师时，不再叠加旧版8级神圣打击；7级按基础职业选择神佑打击。

## 实现状态

- 资料状态：特性结构与来源已整理；商业法术表、数值和完整规则正文未收录。
- 规则数据路径：尚未实现。
- 自动化测试：尚未实现。
- 最后核验日期：2026-07-24。
