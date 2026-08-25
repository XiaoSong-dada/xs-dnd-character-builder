# 0.7.0 SCAG / XGtE / TCoE 来源内容矩阵

本矩阵以稳定 ID 为事实键。“当前采用”表示项目实际使用的 2014 版本；重印内容只保留一个候选实体。效果文本均为原创中文摘要。

| 来源 | 内容域 | 稳定 ID / 范围 | 首发 | 当前采用 | 0.6.x 状态 | 0.7.0 状态 | 核验依据 |
|---|---|---|---|---|---|---|---|
| SCAG | 子职 | `subclass-2014-*-{battlerager,arcana,purple-dragon-knight,long-death,sun-soul,crown,mastermind,swashbuckler,storm-sorcery,undying,bladesinging}` | SCAG | 项目指定的最新 2014 勘误/重印 | 顶层手工 implemented | 特性聚合后 selectable / implemented | `subclasses-2014.ts`, `subclass-features-2014.ts` |
| SCAG | 背景 | `background-2014-{city-watch,clan-crafter,cloistered-scholar,courtier,faction-agent,far-traveler,inheritor,knight-of-the-order,mercenary-veteran,urban-bounty-hunter,uthgardt-tribe-member,waterdhavian-noble}` | SCAG | SCAG | 已登记 | 来源可用性与起始装备校验接入 | `origins-2014.ts`, `starting-equipment-2014.ts` |
| SCAG→TCoE | 法术 | `spell-2014-{booming-blade,green-flame-blade,lightning-lure,sword-burst}` | SCAG | TCoE | 单实体 | 单稳定 ID，TCoE 规则版本 | `spells-2014.ts` |
| XGtE | 子职 | `subclasses-2014.ts` 中 `sourceIds=[xgte-2017-index]` 的 30 个玩家条目 | XGtE | XGtE 勘误 | 摘要/手工状态 | 必选项可操作，情境效果 selectable | 子职特性与选项注册表 |
| XGtE | 种族专长 | `feat-{bountiful-luck,dragon-fear,dragon-hide,drow-high-magic,dwarven-fortitude,elven-accuracy,fade-away,fey-teleportation,flames-of-phlegethos,infernal-constitution,orcish-fury,prodigy,second-chance,squat-nimbleness,wood-elf-magic}` | XGtE | XGtE | 缺失 | selectable；种族/亚种/半专长结构化 | `feats-2014.ts` |
| XGtE | 法术 | `spells-2014.ts` 中 `sourceIds=[xgte-2017-index]` 条目 | XGtE | XGtE 勘误 | 95 条目基线 | 统一来源候选池与重印去重 | 法术数据表和职业池回归测试 |
| XGtE | 魔法物品 | `armor-of-gleaming`—`wraps-of-unarmed-power` 48 个常见物品 | XGtE | XGtE | 已登记 | 来源筛选、类别、稀有度、同调与原创摘要接入 | `magic-items-xgte-tcoe-2014.ts` |
| TCoE | 子职 | `subclasses-2014.ts` 中 `sourceIds=[tcoe-2020-index]` 的 26 个既有职业玩家条目 | TCoE/重印 | TCoE | 摘要/手工状态 | 特性聚合 selectable，内部选择生成检查点 | 子职特性与选项注册表 |
| TCoE | 专长 | `feat-{artificer-initiate,chef,crusher,eldritch-adept,fey-touched,fighting-initiate,gunner,metamagic-adept,piercer,poisoner,shadow-touched,skill-expert,slasher,telekinetic,telepathic}` | TCoE | TCoE | 缺失 | selectable；父子检查点与半专长派生 | `feats-2014.ts` |
| TCoE | 工匠 | `class-2014-artificer` | ERftLW | TCoE | 缺失 | implemented；1—20 级、施法、起始装备、导出 | `artificer-2014.ts` |
| TCoE | 工匠专职 | `subclass-2014-artificer-{alchemist,armorer,artillerist,battle-smith}` | ERftLW / TCoE | TCoE | 缺失 | implemented / selectable；始终准备法术不占上限 | 子职目录与特性注册表 |
| TCoE | 灌注 | `infusion-2014-*`，复制配方使用 `infusion-2014-replicate-*` | ERftLW | TCoE | 缺失 | 已知唯一组、等级前置、物品绑定与生效上限 | `artificer-2014.ts`, `validate.ts` |
| TCoE | 魔法物品 | `magic-items-xgte-tcoe-2014.ts` 中 TCoE 刺青、法器、碎片、魔法书、神器 | TCoE | TCoE | 刺青切片 | 全类别注册；可靠加值才进入派生 | 物品注册表与来源测试 |

## 隔离与延期

- `magicItems2024` 不再装配进 2014 `rulesRepository.equipment`；2024 草稿继续只读隔离。
- TCoE 自定义起源、既有 12 职业整套 Optional Class Features、多职业与 Artificer 多职业规则保持 TODO。
