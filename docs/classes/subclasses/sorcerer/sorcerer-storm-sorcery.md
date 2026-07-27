# 风暴术法 Storm Sorcery

## 基本信息

- 子职 ID：`sorcerer-storm-sorcery`
- 所属职业：[`sorcerer` 术士](sorcerer.md)
- 规则集：`5e-2014`
- 选择等级：原版1级；2024兼容时3级
- 来源与边界：Xanathar's Guide to Everything；商业规则，不复制正文
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

围绕雷鸣与闪电法术机动，通过施法位移、范围爆发和飞行带领队伍穿越战场。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 1 | 风语者（Wind Speaker） | 无次数限制 |
| 3 | 1 | 暴风魔法（Tempestuous Magic） | 无次数限制 |
| 6 | 6 | 风暴之心（Heart of the Storm） | 无固定次数 |
| 6 | 6 | 风暴指引（Storm Guide） | 无次数限制 |
| 14 | 14 | 风暴狂怒（Storm's Fury） | 受反应限制 |
| 18 | 18 | 风之魂（Wind Soul） | 分享受持续与休息限制 |

## 特性详解

### 3级（原版1级）：风语者 Wind Speaker

- 特性 ID：`sorcerer-storm-sorcery-wind-speaker`
- 动作或触发：被动
- 资源与恢复：无次数限制

掌握原初语并理解其相关方言。

实现与校验：

- 2024兼容时在3级授予；语言熟练独立保存。

### 3级（原版1级）：暴风魔法 Tempestuous Magic

- 特性 ID：`sorcerer-storm-sorcery-tempestuous-magic`
- 动作或触发：施放1环以上法术前后使用奖励动作
- 资源与恢复：无次数限制

借气流飞行一小段距离且不引发借机攻击。

实现与校验：

- 校验法术环阶与窗口；不消耗普通速度；免除仅限该段移动。

### 6级：风暴之心 Heart of the Storm

- 特性 ID：`sorcerer-storm-sorcery-heart-of-the-storm`
- 动作或触发：被动；施放雷鸣或闪电法术时爆发
- 资源与恢复：无固定次数

获得雷鸣和闪电抗性，并对附近所选生物造成额外对应伤害。

实现与校验：

- 抗性不叠加；每个法术触发一次；保存排除目标和伤害类型。

### 6级：风暴指引 Storm Guide

- 特性 ID：`sorcerer-storm-sorcery-storm-guide`
- 动作或触发：操控附近自然天气
- 资源与恢复：无次数限制

停止附近雨势或改变局部风向。

实现与校验：

- 只影响自然天气；不驱散魔法天气；保存区域与持续。

### 14级：风暴狂怒 Storm's Fury

- 特性 ID：`sorcerer-storm-sorcery-storms-fury`
- 动作或触发：反应；近战攻击命中自己后
- 资源与恢复：受反应限制

对攻击者造成闪电伤害，并可能将其推离。

实现与校验：

- 校验近战命中和距离；力量豁免决定推动。

### 18级：风之魂 Wind Soul

- 特性 ID：`sorcerer-storm-sorcery-wind-soul`
- 动作或触发：被动；可用动作分享飞行
- 资源与恢复：分享受持续与休息限制

免疫雷鸣与闪电并获得飞行；可临时把飞行分享给同伴。

实现与校验：

- 免疫替代抗性；限制目标数、持续和恢复；结束时清理飞行。

## 兼容与校验

- 战役必须允许该来源，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；2014子职兼容2024职业时只移动首次授予等级，不自动采用2024同名数值。
- 额外法术、普通法术、术法点、免费施放和独立资源分开记录。
- 新旧同名或替代能力不得叠加；规则数据与自动化测试尚未实现。
