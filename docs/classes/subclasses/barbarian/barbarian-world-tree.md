# 世界树道途 Path of the World Tree

## 基本信息

- 子职 ID：`barbarian-world-tree`
- 所属职业：[`barbarian` 野蛮人](barbarian.md)
- 规则集：`5e-2024`
- 选择等级：3级
- 内容来源：2024《玩家手册》
- 许可边界：记录官方公开文章中的结构和简要转述，不复制商业规则正文
- 核验状态：特性名称、等级与公开玩法摘要已核验
- 官方详情：[Path of the World Tree Barbarian](https://www.dndbeyond.com/posts/1786-path-of-the-world-tree-barbarian-rage-with)

## 子职定位

世界树道途将野蛮人转向“保护与战场控制”。它能在狂暴期间向自己和队友提供临时生命值、移动敌人、延长近战触及，并通过世界树进行短距离或跨位面移动。

## 子职特性

| 等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 3 | `barbarian-world-tree-vitality-of-the-tree` | 世界树活力 | Vitality of the Tree | 进入狂暴时获得临时生命值，并在狂暴期间持续保护附近队友 |
| 6 | `barbarian-world-tree-branches-of-the-tree` | 世界树枝桠 | Branches of the Tree | 以反应召出枝桠，将附近敌人拉向指定位置并干扰其行动 |
| 10 | `barbarian-world-tree-battering-roots` | 重击根须 | Battering Roots | 延长特定近战武器触及，并为命中增加可选的 Push 或 Topple 精通效果 |
| 14 | `barbarian-world-tree-travel-along-the-tree` | 沿树而行 | Travel Along the Tree | 进入狂暴及狂暴期间进行传送，并在特定条件下带领盟友远行 |

## 选择、资源与校验

- 临时生命值不叠加，只比较并保留适用值。
- 枝桠效果消耗反应，涉及豁免、体型和目标位置合法性。
- 重击根须只适用于规则指定属性的近战武器；新增精通效果不应覆盖武器原有精通。
- 传送要求目标空间合法且可见；携带盟友的数量和范围需取得授权数据后实现。
- 多数特性依赖狂暴状态，狂暴结束时同步失效。

## 实现状态

- 规则数据路径：待授权后创建。
- 校验重点：临时生命值来源、反应消耗、强制位移、武器条件、传送空间。
- 自动化测试：待授权后创建。
- 最后核验日期：2026-07-24。
