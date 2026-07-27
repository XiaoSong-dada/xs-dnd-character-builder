# 龙族术法 Draconic Sorcery

## 基本信息

- 子职 ID：`sorcerer-draconic-sorcery`
- 所属职业：[`sorcerer` 术士](sorcerer.md)
- 规则集：`5e-2024`
- 选择等级：3级
- 来源与边界：2024 Free Rules / SRD 5.2.1；开放规则
- 官方详情：[2024 Free Rules / SRD 5.2.1](https://www.dndbeyond.com/sources/dnd/br-2024/character-classes)
- 最后核验：2026-07-27

## 玩法定位

用龙族血脉提升无甲防护与生命成长，强化元素伤害，并在后期获得飞翼和巨龙盟友。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 龙族韧性（Draconic Resilience） | 无次数限制 |
| 3 | 3 | 龙族法术（Draconic Spells） | 自动常备 |
| 6 | 6 | 元素亲和（Elemental Affinity） | 按特性结算 |
| 14 | 14 | 龙翼（Dragon Wings） | 无次数限制 |
| 18 | 18 | 巨龙伙伴（Dragon Companion） | 依赖法术位或免费施放 |

## 特性详解

### 3级：龙族韧性 Draconic Resilience

- 特性 ID：`sorcerer-draconic-sorcery-draconic-resilience`
- 动作或触发：被动
- 资源与恢复：无次数限制

未着甲时基础AC由敏捷与魅力共同决定；最大生命按术士等级提高。

实现与校验：

- 只在未着甲时使用替代AC；生命增量按等级追溯且不可重复。

### 3级：龙族法术 Draconic Spells

- 特性 ID：`sorcerer-draconic-sorcery-draconic-spells`
- 动作或触发：被动；随等级解锁
- 资源与恢复：自动常备

获得龙族主题法术，不占普通法术数量。

实现与校验：

- 绑定5e-2024法术版本并独立记录。

### 6级：元素亲和 Elemental Affinity

- 特性 ID：`sorcerer-draconic-sorcery-elemental-affinity`
- 动作或触发：施放造成所选元素伤害的法术时
- 资源与恢复：按特性结算

对应法术伤害加入魅力调整值，并可获得短时元素抗性。

实现与校验：

- 一次法术只加一次；校验元素、抗性持续和术法点费用。

### 14级：龙翼 Dragon Wings

- 特性 ID：`sorcerer-draconic-sorcery-dragon-wings`
- 动作或触发：奖励动作；显现或收起
- 资源与恢复：无次数限制

显现龙翼并获得与自身速度相关的飞行能力。

实现与校验：

- 保存开启状态；结束时移除；不与替代速度叠加。

### 18级：巨龙伙伴 Dragon Companion

- 特性 ID：`sorcerer-draconic-sorcery-dragon-companion`
- 动作或触发：施放指定召唤巨龙法术时
- 资源与恢复：依赖法术位或免费施放

强化召唤巨龙的动作与持续能力，使巨龙伙伴更易投入战斗。

实现与校验：

- 只作用于指定法术；区分免费次数、法术位、动作与专注。

## 兼容与校验

- 战役必须允许该来源，且子职选择位尚未占用。
- 规则数据保留 `5e-2024`；2014子职兼容2024职业时只移动首次授予等级，不自动采用2024同名数值。
- 额外法术、普通法术、术法点、免费施放和独立资源分开记录。
- 新旧同名或替代能力不得叠加；规则数据与自动化测试尚未实现。
