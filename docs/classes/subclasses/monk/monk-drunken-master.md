# 醉拳宗 Way of the Drunken Master

## 基本信息

- 子职 ID：`monk-drunken-master`
- 所属职业：[`monk` 武僧](monk.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；套用2024基础职业时仍在3级取得子职
- 内容来源：Xanathar's Guide to Everything
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要和兼容提示
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

借醉拳步法在疾风连击后自动脱离并提速，通过起身、误导攻击和取消劣势在人群中灵活穿梭。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 附赠熟练项（Bonus Proficiencies） | 无次数限制 |
| 3 | 3 | 醉拳技巧（Drunken Technique） | 依赖疾风连击气消耗 |
| 6 | 6 | 微醺摇摆（Tipsy Sway） | 误导攻击消耗反应 |
| 11 | 11 | 醉者好运（Drunkard's Luck） | 消耗气 |
| 17 | 17 | 酣醉若狂（Intoxicated Frenzy） | 依赖疾风连击气消耗 |

## 特性详解

### 3级：附赠熟练项 Bonus Proficiencies

- 特性 ID：`monk-drunken-master-bonus-proficiencies`
- 动作或触发：被动
- 资源与恢复：无次数限制

获得表演技能和酿酒工具熟练。

实现与校验：

- 熟练来源独立保存；重复熟练不自动转为专精。

### 3级：醉拳技巧 Drunken Technique

- 特性 ID：`monk-drunken-master-drunken-technique`
- 动作或触发：使用疾风连击时
- 资源与恢复：依赖疾风连击气消耗

获得撤离效果，并提高本回合步行速度。

实现与校验：

- 与疾风连击同一触发；记录临时速度；回合结束清除。

### 6级：微醺摇摆 Tipsy Sway

- 特性 ID：`monk-drunken-master-tipsy-sway`
- 动作或触发：从倒地起身或被近战攻击未命中时
- 资源与恢复：误导攻击消耗反应

起身只需少量移动；还可把未命中自己的近战攻击引向身旁另一生物。

实现与校验：

- 分别处理起身成本和反应；新目标需在攻击射程，使用原攻击结果。

### 11级：醉者好运 Drunkard's Luck

- 特性 ID：`monk-drunken-master-drunkards-luck`
- 动作或触发：带劣势进行检定或攻击时
- 资源与恢复：消耗气

取消该次属性检定、攻击检定或豁免的劣势。

实现与校验：

- 在掷骰前扣点；只取消劣势，不赋予优势。

### 17级：酣醉若狂 Intoxicated Frenzy

- 特性 ID：`monk-drunken-master-intoxicated-frenzy`
- 动作或触发：使用疾风连击时
- 资源与恢复：依赖疾风连击气消耗

可进行更多疾风连击攻击，但每次必须针对不同生物。

实现与校验：

- 追踪本次已攻击目标；额外攻击不能重复选择同一目标。

## 兼容与校验

- 战役必须允许该来源，武僧达到3级，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；武艺骰、专注点/气、动作经济、免费次数与独立资源分开追踪。
- 2014子职用于2024职业需要DM许可，气与专注点的名称映射不代表可以混用两版特性数值。
- 新旧同名或替代能力不得叠加；规则数据与自动化测试尚未实现。
