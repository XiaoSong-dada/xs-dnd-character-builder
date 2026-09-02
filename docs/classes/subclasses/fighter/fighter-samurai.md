# 武士 Samurai

## 基本信息

- 子职 ID：`fighter-samurai`
- 所属职业：[`fighter` 战士](fighter.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；套用2024基础职业时仍在3级取得子职
- 内容来源：Xanathar's Guide to Everything
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要和兼容提示
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

用战意换取攻击优势与临时生命，以感知和社交能力增强角色，后期把优势兑换为额外攻击并在0生命前行动。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 附赠熟练项（Bonus Proficiency） | 无次数限制 |
| 3 | 3 | 战意（Fighting Spirit） | 3次/长休 |
| 7 | 7 | 优雅廷臣（Elegant Courtier） | 无次数限制 |
| 10 | 10 | 不竭精神（Tireless Spirit） | 每场战斗按条件 |
| 15 | 15 | 迅捷打击（Rapid Strike） | 每回合一次 |
| 18 | 18 | 死前之力（Strength Before Death） | 长休一次 |

## 特性详解

### 3级：附赠熟练项 Bonus Proficiency

- 特性 ID：`fighter-samurai-bonus-proficiency`
- 动作或触发：被动
- 资源与恢复：无次数限制

从指定技能中获得一种附赠熟练项，或学习一门语言。

实现与校验：

- 保存选择和来源；重复熟练按规则处理。

### 3级：战意 Fighting Spirit

- 特性 ID：`fighter-samurai-fighting-spirit`
- 动作或触发：奖励动作
- 资源与恢复：3次/长休

本回合武器攻击获得优势，并获得随战士等级增长的临时生命。

实现与校验：

- 扣除次数；优势只持续本回合；临时生命不叠加。

### 7级：优雅廷臣 Elegant Courtier

- 特性 ID：`fighter-samurai-elegant-courtier`
- 动作或触发：被动
- 资源与恢复：无次数限制

说服检定额外加入感知调整值，并获得感知豁免熟练或替代熟练。

实现与校验：

- 避免同一调整值重复；已有感知豁免时按来源选择替代。

### 10级：不竭精神 Tireless Spirit

- 特性 ID：`fighter-samurai-tireless-spirit`
- 动作或触发：掷先攻且没有战意次数时
- 资源与恢复：每场战斗按条件

恢复一次战意。

实现与校验：

- 只在剩余为0时触发；不超过资源上限。

### 15级：迅捷打击 Rapid Strike

- 特性 ID：`fighter-samurai-rapid-strike`
- 动作或触发：自己回合采取攻击动作且一次攻击具有优势时
- 资源与恢复：每回合一次

放弃其中一次攻击的优势，换取同一动作中的额外一次武器攻击。

实现与校验：

- 指定哪次攻击失去优势；额外攻击只一次；其他优势来源不恢复被放弃优势。

### 18级：死前之力 Strength Before Death

- 特性 ID：`fighter-samurai-strength-before-death`
- 动作或触发：受伤将降至0生命时用反应
- 资源与恢复：长休一次

在伤害结算前立即获得一个完整回合；回合结束后再承受伤害并按结果倒下。

实现与校验：

- 保存延迟伤害；不能无限嵌套额外回合；回合结束准确结算生命。

## 兼容与校验

- 战役必须允许该来源，战士达到3级，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；动作如潮、回气、不屈、子职骰池和独立次数分开追踪。
- 2014子职用于2024职业需要DM许可，不得隐式采用同名新版数值或叠加替代能力。
- 规则数据与自动化测试尚未实现。
