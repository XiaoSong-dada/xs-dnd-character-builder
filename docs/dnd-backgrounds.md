# D&D 5e 出身与背景资料索引

> 本文档是出身、背景、背景特性与正式变体的选择性加载入口，不属于每次开发任务的立即加载文档。
> 当前覆盖 2024《玩家手册》16 个核心出身，以及 2014《玩家手册》13 个核心背景和 5 个正式变体。

> 实现状态（2026-09-02，v1.1.8）：2014 背景特性已落地为 `app/src/rules/data/background-features-2014.ts`
> （44 条，与本文档资料一致），角色卡与跑团助手「能力」页签展示；变体背景沿用父背景特性。

## 作用与版本边界

背景回答角色在成为冒险者前生活在哪里、从事什么工作，以及什么变化促使角色踏上冒险。叙事描述可以按角色故事调整，但机械字段只有在规则或 DM 明确允许时才能替换。

| 规则集 | 项目术语 | 1 级机械内容 | 不得自动混入 |
| --- | --- | --- | --- |
| `5e-2024` | 出身（Background） | 三项属性候选、起源专长、两项技能、一个工具、装备包或 50 GP | 2014 背景特性、种族属性提升 |
| `5e-2014` | 背景（Background） | 两项技能、工具或语言、装备包、背景特性、人物特征建议 | 2024 属性提升、起源专长 |

- 2024 属性加值只能在出身列出的三项属性中分配为 `+2/+1` 或 `+1/+1/+1`，且不得把属性提升到 20 以上。
- 2024 语言在角色起源的其他步骤中选择，不把 2014 背景语言自动带入。
- 2014 若两个来源给予相同技能或工具熟练，可按该版规则改选同类熟练；程序必须保留原始来源和替换结果。
- 旧背景转换到 2024 是显式兼容流程：忽略旧物种属性提升，分配三点背景属性提升；旧背景没有专长时获得一个自选起源专长。该流程必须由 DM 允许，不能同时叠加两版背景收益。

## 选择流程

1. 锁定 `ruleset`、可用书目、起始装备规则和 DM 对自定义背景的许可。
2. 回答“角色原来做什么”“发生了什么才开始冒险”。
3. 2024 先检查出身属性候选是否覆盖职业主要属性，再检查固定起源专长、技能和工具。
4. 2014 先检查叙事身份与背景特性，再检查技能、工具、语言和正式变体。
5. 选择装备包或规则允许的金币方案，禁止重复领取。
6. 记录每项熟练、专长、语言和装备的来源，处理重复与互斥选择。
7. 最后填写人格、理想、羁绊、缺点和促使角色冒险的事件。

## 文档字段约定

每个背景主文件至少记录：

- 稳定 ID、中文名、英文名、`ruleset`、获得等级、来源与版权边界。
- 叙事定位、创建角色必选项、熟练、装备和互斥选择。
- 2024 的属性候选与起源专长；2014 的语言、背景特性和人物特征提示。
- 效果说明、实现字段、合法性校验和版本兼容边界。
- 正式变体入口，以及变体继承、替换或保留的内容。

### 2014 人物特征候选约定

- 每个 2014 基础背景文件均提供 8 项人格特征、6 项理想、6 项羁绊和 6 项缺点；正式变体也在自己的文件中提供独立候选。
- 角色选择两项人格特征，以及一项理想、一项羁绊和一项缺点；可以选取、按 `d8/d6` 随机决定或自定义填写。
- 每项理想末尾的 `（守序）`、`（混乱）`、`（善良）`、`（邪恶）`、`（中立）` 或 `（任意）` 是叙事关联标签，不是阵营前置条件。角色可以选择与当前阵营不同的理想，用来表达矛盾、成长或信念变化。
- 候选内容是人物塑造建议，不产生属性、熟练或检定修正，也不作为角色规则合法性的硬性来源。
- 商业背景与变体的候选为项目原创转述或补充，不复制商业规则正文；它们不能冒充官方逐字文本。
- 2024 背景不具有同结构的官方独立候选表。若界面沿用这些人物字段，应标记为可选的通用人物塑造内容，而非背景机械收益。

ID 使用版本前缀，例如：

```text
background-2024-acolyte
background-2014-acolyte
background-2014-sailor-pirate
```

## 2024 核心出身

| 出身 | 英文名 | 详细资料 | 内容边界 |
| --- | --- | --- | --- |
| 侍僧 | Acolyte | [2024 侍僧](backgrounds/5e-2024/acolyte/acolyte.md) | 开放规则，实现级 |
| 工匠 | Artisan | [2024 工匠](backgrounds/5e-2024/artisan/artisan.md) | 商业内容，原创摘要 |
| 江湖骗子 | Charlatan | [2024 江湖骗子](backgrounds/5e-2024/charlatan/charlatan.md) | 商业内容，原创摘要 |
| 罪犯 | Criminal | [2024 罪犯](backgrounds/5e-2024/criminal/criminal.md) | 开放规则，实现级 |
| 艺人 | Entertainer | [2024 艺人](backgrounds/5e-2024/entertainer/entertainer.md) | 商业内容，原创摘要 |
| 农夫 | Farmer | [2024 农夫](backgrounds/5e-2024/farmer/farmer.md) | 商业内容，原创摘要 |
| 卫兵 | Guard | [2024 卫兵](backgrounds/5e-2024/guard/guard.md) | 商业内容，原创摘要 |
| 向导 | Guide | [2024 向导](backgrounds/5e-2024/guide/guide.md) | 商业内容，原创摘要 |
| 隐士 | Hermit | [2024 隐士](backgrounds/5e-2024/hermit/hermit.md) | 商业内容，原创摘要 |
| 商人 | Merchant | [2024 商人](backgrounds/5e-2024/merchant/merchant.md) | 商业内容，原创摘要 |
| 贵族 | Noble | [2024 贵族](backgrounds/5e-2024/noble/noble.md) | 商业内容，原创摘要 |
| 学者 | Sage | [2024 学者](backgrounds/5e-2024/sage/sage.md) | 开放规则，实现级 |
| 水手 | Sailor | [2024 水手](backgrounds/5e-2024/sailor/sailor.md) | 商业内容，原创摘要 |
| 抄写员 | Scribe | [2024 抄写员](backgrounds/5e-2024/scribe/scribe.md) | 商业内容，原创摘要 |
| 士兵 | Soldier | [2024 士兵](backgrounds/5e-2024/soldier/soldier.md) | 开放规则，实现级 |
| 流浪者 | Wayfarer | [2024 流浪者](backgrounds/5e-2024/wayfarer/wayfarer.md) | 商业内容，原创摘要 |

## 2014 核心背景

| 背景 | 英文名 | 详细资料 | 正式变体 |
| --- | --- | --- | --- |
| 侍僧 | Acolyte | [2014 侍僧](backgrounds/5e-2014/acolyte/acolyte.md) | 无 |
| 江湖骗子 | Charlatan | [2014 江湖骗子](backgrounds/5e-2014/charlatan/charlatan.md) | 无 |
| 罪犯 | Criminal | [2014 罪犯](backgrounds/5e-2014/criminal/criminal.md) | [间谍](backgrounds/5e-2014/criminal/criminal-spy.md) |
| 艺人 | Entertainer | [2014 艺人](backgrounds/5e-2014/entertainer/entertainer.md) | [角斗士](backgrounds/5e-2014/entertainer/entertainer-gladiator.md) |
| 民间英雄 | Folk Hero | [2014 民间英雄](backgrounds/5e-2014/folk-hero/folk-hero.md) | 无 |
| 行会工匠 | Guild Artisan | [2014 行会工匠](backgrounds/5e-2014/guild-artisan/guild-artisan.md) | [行会商人](backgrounds/5e-2014/guild-artisan/guild-artisan-merchant.md) |
| 隐士 | Hermit | [2014 隐士](backgrounds/5e-2014/hermit/hermit.md) | 无 |
| 贵族 | Noble | [2014 贵族](backgrounds/5e-2014/noble/noble.md) | [骑士](backgrounds/5e-2014/noble/noble-knight.md) |
| 化外之民 | Outlander | [2014 化外之民](backgrounds/5e-2014/outlander/outlander.md) | 无 |
| 学者 | Sage | [2014 学者](backgrounds/5e-2014/sage/sage.md) | 无 |
| 水手 | Sailor | [2014 水手](backgrounds/5e-2014/sailor/sailor.md) | [海盗](backgrounds/5e-2014/sailor/sailor-pirate.md) |
| 士兵 | Soldier | [2014 士兵](backgrounds/5e-2014/soldier/soldier.md) | 无 |
| 贫儿 | Urchin | [2014 贫儿](backgrounds/5e-2014/urchin/urchin.md) | 无 |

## 2014 扩展背景（商业内容）

以下背景来自商业补充书，只记录稳定 ID、技能/工具/语言、装备要点、原创玩法摘要、兼容边界与官方链接，不复制规则正文。SCAG 背景为**独立完整背景**（技能/工具/语言/装备均独立给出），其背景特性按原书标注为 Variant Feature，且建议特征表（人格/理想/羁绊/缺点）沿用 PHB 对应背景；GGR 公会背景的特性 Guild Spells 前置为拥有施法或契约魔法特性，效果是把公会法术加入施法职业的法术列表（照常占用法术位），无短休恢复机制。

| 背景 | 英文名 | 来源 | 详细资料 | 借用 PHB 特征表 |
| --- | --- | --- | --- | --- |
| 城市守卫 | City Watch | SCAG | [2014 城市守卫](backgrounds/5e-2014/city-watch/city-watch.md) | 士兵（含调查员变体：以调查替换运动） |
| 氏族工匠 | Clan Crafter | SCAG | [2014 氏族工匠](backgrounds/5e-2014/clan-crafter/clan-crafter.md) | 行会工匠 |
| 隐修学者 | Cloistered Scholar | SCAG | [2014 隐修学者](backgrounds/5e-2014/cloistered-scholar/cloistered-scholar.md) | 学者 |
| 宫廷贵族 | Courtier | SCAG | [2014 宫廷贵族](backgrounds/5e-2014/courtier/courtier.md) | 行会工匠 |
| 派系特工 | Faction Agent | SCAG | [2014 派系特工](backgrounds/5e-2014/faction-agent/faction-agent.md) | 侍僧 |
| 远方旅人 | Far Traveler | SCAG | [2014 远方旅人](backgrounds/5e-2014/far-traveler/far-traveler.md) | 自带完整特征表 |
| 遗产继承者 | Inheritor | SCAG | [2014 遗产继承者](backgrounds/5e-2014/inheritor/inheritor.md) | 民间英雄 |
| 骑士团骑士 | Knight of the Order | SCAG | [2014 骑士团骑士](backgrounds/5e-2014/knight-of-the-order/knight-of-the-order.md) | 士兵 |
| 雇佣兵老兵 | Mercenary Veteran | SCAG | [2014 雇佣兵老兵](backgrounds/5e-2014/mercenary-veteran/mercenary-veteran.md) | 士兵 |
| 城市赏金猎人 | Urban Bounty Hunter | SCAG | [2014 城市赏金猎人](backgrounds/5e-2014/urban-bounty-hunter/urban-bounty-hunter.md) | 罪犯 |
| 乌斯加德部落成员 | Uthgardt Tribe Member | SCAG | [2014 乌斯加德部落成员](backgrounds/5e-2014/uthgardt-tribe-member/uthgardt-tribe-member.md) | 化外之民 |
| 深水城贵族 | Waterdhavian Noble | SCAG | [2014 深水城贵族](backgrounds/5e-2014/waterdhavian-noble/waterdhavian-noble.md) | 贵族 |
| 俄佐立执行者 | Azorius Functionary | GGR | [2014 俄佐立执行者](backgrounds/5e-2014/azorius-functionary/azorius-functionary.md) | 公会背景，自带特征表 |
| 波洛斯军团兵 | Boros Legionnaire | GGR | [2014 波洛斯军团兵](backgrounds/5e-2014/boros-legionnaire/boros-legionnaire.md) | 公会背景，自带特征表 |
| 底密尔特工 | Dimir Operative | GGR | [2014 底密尔特工](backgrounds/5e-2014/dimir-operative/dimir-operative.md) | 公会背景，自带特征表 |
| 葛加理密探 | Golgari Agent | GGR | [2014 葛加理密探](backgrounds/5e-2014/golgari-agent/golgari-agent.md) | 公会背景，自带特征表 |
| 古鲁无政府主义者 | Gruul Anarch | GGR | [2014 古鲁无政府主义者](backgrounds/5e-2014/gruul-anarch/gruul-anarch.md) | 公会背景，自带特征表 |
| 伊捷工程师 | Izzet Engineer | GGR | [2014 伊捷工程师](backgrounds/5e-2014/izzet-engineer/izzet-engineer.md) | 公会背景，自带特征表 |
| 欧佐夫代表 | Orzhov Representative | GGR | [2014 欧佐夫代表](backgrounds/5e-2014/orzhov-representative/orzhov-representative.md) | 公会背景，自带特征表 |
| 拉铎斯信徒 | Rakdos Cultist | GGR | [2014 拉铎斯信徒](backgrounds/5e-2014/rakdos-cultist/rakdos-cultist.md) | 公会背景，自带特征表 |
| 瑟雷尼亚见习生 | Selesnya Initiate | GGR | [2014 瑟雷尼亚见习生](backgrounds/5e-2014/selesnya-initiate/selesnya-initiate.md) | 公会背景，自带特征表 |
| 运动员 | Athlete | MOT | [2014 运动员](backgrounds/5e-2014/athlete/athlete.md) | 自带特征表 |

## 2014 扩展背景（G 批次补齐：整本源与单点缺失）

G 批次按《5e 不全书》CHM v2026.09.13 逐条核验补齐。以下条目与上表口径一致（只记录机械索引与原创摘要）；**`index-only` 类索引条目不进入运行时仓库**，详见各节说明。

| 背景 | 英文名 | 来源 | 详细资料 | 备注 |
| --- | --- | --- | --- | --- |
| 海军 | Marine | GoS | [2014 海军](backgrounds/5e-2014/marine/marine.md) | 盐沼怪谈完整背景 |
| 渔民 | Fisher | GoS | [2014 渔民](backgrounds/5e-2014/fisher/fisher.md) | 同上 |
| 船工 | Shipwright | GoS | [2014 船工](backgrounds/5e-2014/shipwright/shipwright.md) | 同上 |
| 走私者 | Smuggler | GoS | [2014 走私者](backgrounds/5e-2014/smuggler/smuggler.md) | 同上 |
| 失败商人 | Failed Merchant | AI | [2014 失败商人](backgrounds/5e-2014/failed-merchant/failed-merchant.md) | 艾奎兹玄 |
| 竞争对手实习生 | Rival Intern | AI | [2014 竞争对手实习生](backgrounds/5e-2014/rival-intern/rival-intern.md) | 同上 |
| 赌徒 | Gambler | AI | [2014 赌徒](backgrounds/5e-2014/gambler/gambler.md) | 同上 |
| 笑面人 | Grinner | EGtW | [2014 笑面人](backgrounds/5e-2014/grinner/grinner.md) | 荒洲 |
| 沃什塔克特工 | Volstrucker Agent | EGtW | [2014 沃什塔克特工](backgrounds/5e-2014/volstrucker-agent/volstrucker-agent.md) | 同上 |
| 索兰尼亚骑士 | Knight of Solamnia | DSotDQ | [2014 索兰尼亚骑士](backgrounds/5e-2014/knight-of-solamnia/knight-of-solamnia.md) | 战役先决；专长授予按原书处理 |
| 高等术法会大法师 | Mage of High Sorcery | DSotDQ | [2014 高等术法会大法师](backgrounds/5e-2014/mage-of-high-sorcery/mage-of-high-sorcery.md) | 同上 |
| 位面哲学家 | Planar Philosopher | SatO | [2014 位面哲学家](backgrounds/5e-2014/planar-philosopher/planar-philosopher.md) | 战役先决；派系技能对照见文件 |
| 门镇守卫 | Gate Warden | SatO | [2014 门镇守卫](backgrounds/5e-2014/gate-warden/gate-warden.md) | 战役先决 |
| 星界浪客 | Astral Drifter | AAG | [2014 星界浪客](backgrounds/5e-2014/astral-drifter/astral-drifter.md) | 神性之遇专长按原书处理 |
| 荒宇人 | Wildspacer | AAG | [2014 荒宇人](backgrounds/5e-2014/wildspacer/wildspacer.md) | — |
| 精界迷失者 | Feylost | VRGtR | [2014 精界迷失者](backgrounds/5e-2014/feylost/feylost.md) | — |
| 粹丽学生 | Prismari Student | SCC | [2014 粹丽学生](backgrounds/5e-2014/prismari-student/prismari-student.md) | 斯翠海文；专长与法术扩表按原书处理 |
| 衡鉴学生 | Lorehold Student | SCC | [2014 衡鉴学生](backgrounds/5e-2014/lorehold-student/lorehold-student.md) | 同上 |
| 量析学生 | Quandrix Student | SCC | [2014 量析学生](backgrounds/5e-2014/quandrix-student/quandrix-student.md) | 同上 |
| 银毫学生 | Silverquill Student | SCC | [2014 银毫学生](backgrounds/5e-2014/silverquill-student/silverquill-student.md) | 同上 |
| 靡华学生 | Witherbloom Student | SCC | [2014 靡华学生](backgrounds/5e-2014/witherbloom-student/witherbloom-student.md) | 同上 |

说明：**析米克科学家（Simic Scientist，GGR）**未纳入——该条目在 CHM v2026.09.13 中检索不到背景页（其余拉尼卡公会背景页同样未收录），无法逐条核验，需依官方原书另行补录。

## 2014 第三方合作内容背景（G 批次，来源默认关闭、需 DM 同意）

| 背景 | 英文名 | 来源 | 详细资料 | 备注 |
| --- | --- | --- | --- | --- |
| 学苑学者 | Lyceum Scholar | 塔尔多雷 | [2014 学苑学者](backgrounds/5e-2014/lyceum-scholar/lyceum-scholar.md) | 技能三选二，按固定项登记 |
| 扣环帮成员 | Clasp Member | 塔尔多雷 | [2014 扣环帮成员](backgrounds/5e-2014/clasp-member/clasp-member.md) | 技能二选一 |
| 白石城步枪团 | Whitestone Rifle Corps | 塔尔多雷 | [2014 白石城步枪团](backgrounds/5e-2014/whitestone-rifle-corps/whitestone-rifle-corps.md) | 火器不在项目装备库，仅文字说明 |
| 阿沙里人 | Ashari | 塔尔多雷 | [2014 阿沙里人](backgrounds/5e-2014/ashari/ashari.md) | 技能二选一 |
| AHA学徒 | Apprentice of AHA | 胧忆岛 | [2014 AHA学徒](backgrounds/5e-2014/apprentice-of-aha/apprentice-of-aha.md) | 学徒派系与导师设定 |
| 亲灵者 | Spirit Kin | 胧忆岛 | [2014 亲灵者](backgrounds/5e-2014/spirit-kin/spirit-kin.md) | 自有技能「工程」，按文字登记 |
| 机械师 | Mechanic | 胧忆岛 | [2014 机械师](backgrounds/5e-2014/mechanic/mechanic.md) | 自有技能「回收」 |
| 潜水学徒 | Apprentice Diver | 胧忆岛 | [2014 潜水学徒](backgrounds/5e-2014/apprentice-diver/apprentice-diver.md) | 自有工具「潜水甲」 |
| 速递队学员 | Courier Brigade Cadet | 胧忆岛 | [2014 速递队学员](backgrounds/5e-2014/courier-brigade-cadet/courier-brigade-cadet.md) | — |
| 魔女学徒 | Apprentice Witch | 胧忆岛 | [2014 魔女学徒](backgrounds/5e-2014/apprentice-witch/apprentice-witch.md) | — |
| 大陆贵族 | Continental Nobility | 德拉肯海姆 | [2014 大陆贵族](backgrounds/5e-2014/continental-nobility/continental-nobility.md) | 技能四选二 |
| 寻宝者 | Treasure Seeker | 德拉肯海姆 | [2014 寻宝者](backgrounds/5e-2014/treasure-seeker/treasure-seeker.md) | 附 1d8 秘宝表 |
| 幸存者 | Survivor | 德拉肯海姆 | [2014 幸存者](backgrounds/5e-2014/survivor/survivor.md) | 技能四选二 |
| 虔诚传教士 | Devoted Missionary | 德拉肯海姆 | [2014 虔诚传教士](backgrounds/5e-2014/devoted-missionary/devoted-missionary.md) | 技能四选二 |
| 魔法血脉 | Mageborn | 德拉肯海姆 | [2014 魔法血脉](backgrounds/5e-2014/mageborn/mageborn.md) | 技能四选二 |

> 胧忆岛使用来源自有技能表（工程／回收）与自有货币（金花币），项目技能表与货币表无对应条目，故对应字段留空、以文字登记；德拉肯海姆的 1d8 秘宝／传闻表写入背景描述，不建结构化表。

## 2014 扩展背景（G2 批次补齐：万象无常书／毕格比／寻路者指南）

| 背景 | 英文名 | 来源 | 详细资料 | 备注 |
| --- | --- | --- | --- | --- |
| 受宠者 | Rewarded | BMT | [2014 受宠者](backgrounds/5e-2014/rewarded/rewarded.md) | 特性授予幸运／魔法学徒／熟习三选一，按原书处理 |
| 受难者 | Ruined | BMT | [2014 受难者](backgrounds/5e-2014/ruined/ruined.md) | 特性授予警觉／熟习／健壮三选一 |
| 巨人养子 | Giant Foundling | Bigby | [2014 巨人养子](backgrounds/5e-2014/giant-foundling/giant-foundling.md) | 授予「巨人打击」专长 |
| 符文雕刻者 | Rune Carver | Bigby | [2014 符文雕刻者](backgrounds/5e-2014/rune-carver/rune-carver.md) | 授予「符文塑形者」专长 |
| 家族代理人 | House Agent | ERftLW | [2014 家族代理人](backgrounds/5e-2014/house-agent/house-agent.md) | 旧版（家族工具熟练表）；本书 2024 重制版见下文奇械锻炉 |

> **归属勘误（G2 批次）**：CHM 中 `6874` 书页标题为「魔邓肯的众敌卷册（旧版）」，但 `6875`—`6965` 的内容实为《范·里希腾的鸦阁魔域指南》的重复渲染（与 `6580`—`6873` 段对应），本批不重复登记；CHM 内不存在 MToF 2018 的背景条目，故本轮不计 MToF 缺口。

## 2014 第三方合作内容背景（G2 批次，来源默认关闭、需 DM 同意）

| 背景 | 英文名 | 来源 | 详细资料 | 备注 |
| --- | --- | --- | --- | --- |
| 维齐尔 | Vizier | Plane Shift·阿芒凯 | [2014 维齐尔](backgrounds/5e-2014/vizier/vizier.md) | 试行内容，登记为 `dm-only` |
| 审判官 | Inquisitor | Plane Shift·依尼翠 | [2014 审判官](backgrounds/5e-2014/inquisitor/inquisitor.md) | 同上 |

> 异界传送 Plane Shift 为威世智免费发布的非正式试玩内容，按 G2 决策 Q3-C 登记为 `dm-only`（需 DM 同意），不进入默认候选。

## 索引条目（非可选背景）

| 条目 | 来源 | 说明 |
| --- | --- | --- |
| 盐沼背景（Saltmarsh Backgrounds） | GoS | DM 工具页：为 PHB 各背景补充与盐沼镇 NPC 的联系及猩红兄弟会线索。**仅登记索引**：项目背景候选不按 `status` 过滤，入库会被当作普通可选，故不写入运行时仓库。 |
| 英雄编年史（Heroic Chronicle） | EGtW | 叙事生成工具：提供预言、出身故事等角色背景生成表。**仅登记索引**，同上。 |

## 2024 第三方出身（G 批次，来源默认关闭、需 DM 同意）

第三方书采用 2024 写法（起源专长 + 技能 + 工具 + 装备 A/B），按 Q8-B 登记进 `5e-2024` 仓库。

| 出身 | 英文名 | 来源 | 详细资料 | 备注 |
| --- | --- | --- | --- | --- |
| 失忆者 | Amnesiac | 歪曲之月 | [2024 失忆者](backgrounds/5e-2024/tp-amnesiac/tp-amnesiac.md) | 原书无属性提升行；技能／工具自选 |
| 安魂墓卫 | Rest Warden | 歪曲之月 | [2024 安魂墓卫](backgrounds/5e-2024/tp-rest-warden/tp-rest-warden.md) | 同上 |
| 实验体 | Experiment | 歪曲之月 | [2024 实验体](backgrounds/5e-2024/tp-experiment/tp-experiment.md) | 同上 |
| 密教徒 | Cultist | 歪曲之月 | [2024 密教徒](backgrounds/5e-2024/tp-cultist/tp-cultist.md) | 同上 |
| 岔路赌徒 | Crossroads Gambler | 歪曲之月 | [2024 岔路赌徒](backgrounds/5e-2024/tp-crossroads-gambler/tp-crossroads-gambler.md) | 同上 |
| 幽灯乘客 | Ghostlight Passenger | 歪曲之月 | [2024 幽灯乘客](backgrounds/5e-2024/tp-ghostlight-passenger/tp-ghostlight-passenger.md) | 同上 |
| 彷徨镜影 | Reflected Wanderer | 歪曲之月 | [2024 彷徨镜影](backgrounds/5e-2024/tp-reflected-wanderer/tp-reflected-wanderer.md) | 同上 |
| 德鲁斯肯瓦尔德居民 | Druskenvald Dweller | 歪曲之月 | [2024 德鲁斯肯瓦尔德居民](backgrounds/5e-2024/tp-druskenvald-dweller/tp-druskenvald-dweller.md) | 任选起源专长 |
| 暗夜猎手 | Night Stalker | 歪曲之月 | [2024 暗夜猎手](backgrounds/5e-2024/tp-night-stalker/tp-night-stalker.md) | 原书无属性提升行 |
| 柳编咒匠 | Wicker Weaver | 歪曲之月 | [2024 柳编咒匠](backgrounds/5e-2024/tp-wicker-weaver/tp-wicker-weaver.md) | 同上 |
| 狂欢者 | Reveler | 歪曲之月 | [2024 狂欢者](backgrounds/5e-2024/tp-reveler/tp-reveler.md) | 同上 |
| 猩红求道者 | Crimson Aspirant | 歪曲之月 | [2024 猩红求道者](backgrounds/5e-2024/tp-crimson-aspirant/tp-crimson-aspirant.md) | 同上 |
| 禁忌学者 | Scholar of the Forbidden | 歪曲之月 | [2024 禁忌学者](backgrounds/5e-2024/tp-scholar-of-the-forbidden/tp-scholar-of-the-forbidden.md) | 同上 |
| 幻身灵旅者 | Changeling Traveler | 德拉肯海姆 | [2024 幻身灵旅者](backgrounds/5e-2024/tp-changeling-traveler/tp-changeling-traveler.md) | 三项属性候选 |
| 马伦蒂 | Malenti | 德拉肯海姆 | [2024 马伦蒂](backgrounds/5e-2024/tp-malenti/tp-malenti.md) | 装备随吞噬对象，按原书裁定 |
| 异端裁判官 | Inquisitor | 德拉肯海姆 | [2024 异端裁判官](backgrounds/5e-2024/tp-inquisitor/tp-inquisitor.md) | 固定专长待核验 |
| 猎兽人 | Beast Hunter | 德拉肯海姆 | [2024 猎兽人](backgrounds/5e-2024/tp-beast-hunter/tp-beast-hunter.md) | 同上 |
| 神话调查员 | Mythos Investigator | 火炬光下的克苏鲁 | [2024 神话调查员](backgrounds/5e-2024/tp-mythos-investigator/tp-mythos-investigator.md) | 属性任选；起源专长任选；仅 50 GP |

配套第三方起源专长登记在 `app/src/rules/data/third-party-feats-2024.ts`（歪曲之月 12 + 德拉肯海姆 2）。

## 2024 官方扩展出身（G2 批次）

以下为 2025 年起的官方扩展，均采用 2024 写法（属性候选 + 起源专长 + 技能 + 工具 + 装备 A/B），登记进 `5e-2024` 仓库。

| 出身 | 英文名 | 来源 | 详细资料 | 备注 |
| --- | --- | --- | --- | --- |
| 乔拉斯科家族后裔 | House Jorasco Heir | 奇械锻炉 | [2024 乔拉斯科家族后裔](backgrounds/5e-2024/efa-jorasco-heir/efa-jorasco-heir.md) | 起源专长＝医疗龙纹（接入 UA 艾伯伦龙纹专长条目） |
| 伽兰达家族后裔 | House Ghallanda Heir | 奇械锻炉 | [2024 伽兰达家族后裔](backgrounds/5e-2024/efa-ghallanda-heir/efa-ghallanda-heir.md) | 招待龙纹 |
| 坎尼斯家族后裔 | House Cannith Heir | 奇械锻炉 | [2024 坎尼斯家族后裔](backgrounds/5e-2024/efa-cannith-heir/efa-cannith-heir.md) | 创造龙纹 |
| 撒剌释克家族后裔 | House Tharashk Heir | 奇械锻炉 | [2024 撒剌释克家族后裔](backgrounds/5e-2024/efa-tharashk-heir/efa-tharashk-heir.md) | 探寻龙纹 |
| 昆达拉克家族后裔 | House Kundarak Heir | 奇械锻炉 | [2024 昆达拉克家族后裔](backgrounds/5e-2024/efa-kundarak-heir/efa-kundarak-heir.md) | 守御龙纹 |
| 梅丹尼家族后裔 | House Medani Heir | 奇械锻炉 | [2024 梅丹尼家族后裔](backgrounds/5e-2024/efa-medani-heir/efa-medani-heir.md) | 侦测龙纹 |
| 欧瑞恩家族后裔 | House Orien Heir | 奇械锻炉 | [2024 欧瑞恩家族后裔](backgrounds/5e-2024/efa-orien-heir/efa-orien-heir.md) | 通行龙纹 |
| 瓦达利斯家族后裔 | House Vadalis Heir | 奇械锻炉 | [2024 瓦达利斯家族后裔](backgrounds/5e-2024/efa-vadalis-heir/efa-vadalis-heir.md) | 畜牧龙纹 |
| 苏兰尼家族后裔 | House Thuranni Heir | 奇械锻炉 | [2024 苏兰尼家族后裔](backgrounds/5e-2024/efa-thuranni-heir/efa-thuranni-heir.md) | 阴影龙纹 |
| 西维斯家族后裔 | House Sivis Heir | 奇械锻炉 | [2024 西维斯家族后裔](backgrounds/5e-2024/efa-sivis-heir/efa-sivis-heir.md) | 抄录龙纹 |
| 费亚兰家族后裔 | House Phiarlan Heir | 奇械锻炉 | [2024 费亚兰家族后裔](backgrounds/5e-2024/efa-phiarlan-heir/efa-phiarlan-heir.md) | 阴影龙纹 |
| 邓奈斯家族后裔 | House Deneith Heir | 奇械锻炉 | [2024 邓奈斯家族后裔](backgrounds/5e-2024/efa-deneith-heir/efa-deneith-heir.md) | 哨戒龙纹；2014 旧版译名「邓奈斯」 |
| 黎兰达家族后裔 | House Lyrandar Heir | 奇械锻炉 | [2024 黎兰达家族后裔](backgrounds/5e-2024/efa-lyrandar-heir/efa-lyrandar-heir.md) | 暴风龙纹 |
| 异种后裔 | Aberrant Heir | 奇械锻炉 | [2024 异种后裔](backgrounds/5e-2024/efa-aberrant-heir/efa-aberrant-heir.md) | 异种龙纹 |
| 探事员 | Inquisitive | 奇械锻炉 | [2024 探事员](backgrounds/5e-2024/efa-inquisitive/efa-inquisitive.md) | 起源专长：警戒 |
| 考古学家 | Archaeologist | 奇械锻炉 | [2024 考古学家](backgrounds/5e-2024/efa-archaeologist/efa-archaeologist.md) | 起源专长：熟习 |
| 家族代理人 | House Agent | 奇械锻炉 | [2024 家族代理人](backgrounds/5e-2024/efa-house-agent/efa-house-agent.md) | 起源专长：幸运；与 2014 旧版同名并存 |
| 冰上钓客 | Ice Fisher | 费伦冒险 | [2024 冰上钓客](backgrounds/5e-2024/fr-ai-ice-fisher/fr-ai-ice-fisher.md) | 起源专长：警戒 |
| 咒火学徒 | Spellfire Initiate | 费伦冒险 | [2024 咒火学徒](backgrounds/5e-2024/fr-ai-spellfire-initiate/fr-ai-spellfire-initiate.md) | 起源专长为本书新增专长，未登记 ID |
| 巨灵接触者 | Genie Touched | 费伦冒险 | [2024 巨灵接触者](backgrounds/5e-2024/fr-ai-genie-touched/fr-ai-genie-touched.md) | 起源专长：魔法学徒（法师） |
| 影宗流亡者 | Shadowmasters Exile | 费伦冒险 | [2024 影宗流亡者](backgrounds/5e-2024/fr-ai-shadowmasters-exile/fr-ai-shadowmasters-exile.md) | 起源专长：凶蛮打手 |
| 散塔林会佣兵 | Zhentarim Mercenary | 费伦冒险 | [2024 散塔林会佣兵](backgrounds/5e-2024/fr-ai-zhentarim-mercenary/fr-ai-zhentarim-mercenary.md) | 新增专长未登记 ID |
| 月井朝圣者 | Moonwell Pilgrim | 费伦冒险 | [2024 月井朝圣者](backgrounds/5e-2024/fr-ai-moonwell-pilgrim/fr-ai-moonwell-pilgrim.md) | 起源专长：魔法学徒（德鲁伊） |
| 死魔区住民 | Dead Magic Dweller | 费伦冒险 | [2024 死魔区住民](backgrounds/5e-2024/fr-ai-dead-magic-dweller/fr-ai-dead-magic-dweller.md) | 新增专长未登记 ID |
| 焰拳佣兵 | Flaming Fist Mercenary | 费伦冒险 | [2024 焰拳佣兵](backgrounds/5e-2024/fr-ai-flaming-fist-mercenary/fr-ai-flaming-fist-mercenary.md) | 起源专长：健壮 |
| 琼达斯海盗 | Chondathan Freebooter | 费伦冒险 | [2024 琼达斯海盗](backgrounds/5e-2024/fr-ai-chondathan-freebooter/fr-ai-chondathan-freebooter.md) | 起源专长：熟习 |
| 穆尔霍兰德盗墓者 | Mulhorandi Tomb Raider | 费伦冒险 | [2024 穆尔霍兰德盗墓者](backgrounds/5e-2024/fr-ai-mulhorandi-tomb-raider/fr-ai-mulhorandi-tomb-raider.md) | 起源专长：幸运 |
| 竖琴手 | Harper | 费伦冒险 | [2024 竖琴手](backgrounds/5e-2024/fr-ai-harper/fr-ai-harper.md) | 新增专长未登记 ID |
| 紫龙骑士侍从 | Purple Dragon Squire | 费伦冒险 | [2024 紫龙骑士侍从](backgrounds/5e-2024/fr-ai-purple-dragon-squire/fr-ai-purple-dragon-squire.md) | 同上 |
| 翠绿闲庭庇护者 | Emerald Enclave Caretaker | 费伦冒险 | [2024 翠绿闲庭庇护者](backgrounds/5e-2024/fr-ai-emerald-enclave-caretaker/fr-ai-emerald-enclave-caretaker.md) | 同上 |
| 臂铠骑士 | Knight of the Gauntlet | 费伦冒险 | [2024 臂铠骑士](backgrounds/5e-2024/fr-ai-knight-of-the-gauntlet/fr-ai-knight-of-the-gauntlet.md) | 同上 |
| 莱瑟曼流浪者 | Rashemi Wanderer | 费伦冒险 | [2024 莱瑟曼流浪者](backgrounds/5e-2024/fr-ai-rashemi-wanderer/fr-ai-rashemi-wanderer.md) | 起源专长：健壮 |
| 迷锁守卫者 | Mythalkeeper | 费伦冒险 | [2024 迷锁守卫者](backgrounds/5e-2024/fr-ai-mythalkeeper/fr-ai-mythalkeeper.md) | 起源专长：巧匠 |
| 领主联盟臣属 | Lords' Alliance Vassal | 费伦冒险 | [2024 领主联盟臣属](backgrounds/5e-2024/fr-ai-lords-alliance-vassal/fr-ai-lords-alliance-vassal.md) | 新增专长未登记 ID |
| 龙巫教信徒 | Dragon Cultist | 费伦冒险 | [2024 龙巫教信徒](backgrounds/5e-2024/fr-ai-dragon-cultist/fr-ai-dragon-cultist.md) | 同上 |
| 吸血鬼幸存者 | Vampire Survivor | 费伦英雄 | [2024 吸血鬼幸存者](backgrounds/5e-2024/fr-hf-vampire-survivor/fr-hf-vampire-survivor.md) | 新增专长未登记 ID |
| 吸血鬼皈依者 | Vampire Devotee | 费伦英雄 | [2024 吸血鬼皈依者](backgrounds/5e-2024/fr-hf-vampire-devotee/fr-hf-vampire-devotee.md) | 同上 |
| 狂欢客 | Carouser | 费伦英雄 | [2024 狂欢客](backgrounds/5e-2024/fr-hf-carouser/fr-hf-carouser.md) | 同上 |
| 噩梦缠身者 | Haunted One | 魔障深藏 | [2024 噩梦缠身者](backgrounds/5e-2024/rthw-haunted-one/rthw-haunted-one.md) | 黑暗赠礼专长类别未登记，按原书处理 |
| 调查员 | Investigator | 魔障深藏 | [2024 调查员](backgrounds/5e-2024/rthw-investigator/rthw-investigator.md) | 同上 |
| 迷雾漫游者 | Mist Wanderer | 魔障深藏 | [2024 迷雾漫游者](backgrounds/5e-2024/rthw-mist-wanderer/rthw-mist-wanderer.md) | 同上 |
| 降灵师 | Spirit Medium | 魔障深藏 | [2024 降灵师](backgrounds/5e-2024/rthw-spirit-medium/rthw-spirit-medium.md) | 同上 |
| 第九翎羽特工 | Agent of the Ninth Quill | 启封奥秘 | [2024 第九翎羽特工](backgrounds/5e-2024/au-ninth-quill-agent/au-ninth-quill-agent.md) | 十个背景的起源专长均为本书新增，未登记 ID |
| 瑰宝秘社间谍 | Bejeweled Conclave Spy | 启封奥秘 | [2024 瑰宝秘社间谍](backgrounds/5e-2024/au-bejeweled-conclave-spy/au-bejeweled-conclave-spy.md) | 同上 |
| 寰宇黎明实验体 | Cosmic Dawn Experiment | 启封奥秘 | [2024 寰宇黎明实验体](backgrounds/5e-2024/au-cosmic-dawn-experiment/au-cosmic-dawn-experiment.md) | 工具自选 |
| 亡陵誓盟新晋者 | Covenant of the Grave Recruit | 启封奥秘 | [2024 亡陵誓盟新晋者](backgrounds/5e-2024/au-covenant-of-the-grave-recruit/au-covenant-of-the-grave-recruit.md) | — |
| 熔炉追风者 | Crucible Storm Chaser | 启封奥秘 | [2024 熔炉追风者](backgrounds/5e-2024/au-crucible-storm-chaser/au-crucible-storm-chaser.md) | — |
| 魔宠训练家 | Familiar Trainer | 启封奥秘 | [2024 魔宠训练家](backgrounds/5e-2024/au-familiar-trainer/au-familiar-trainer.md) | 工具自选（赌具） |
| 织界者门徒 | Horizon Weaver Initiate | 启封奥秘 | [2024 织界者门徒](backgrounds/5e-2024/au-horizon-weaver-initiate/au-horizon-weaver-initiate.md) | — |
| 幻影马戏团艺人 | Phantasmic Circus Trouper | 启封奥秘 | [2024 幻影马戏团艺人](backgrounds/5e-2024/au-phantasmic-circus-trouper/au-phantasmic-circus-trouper.md) | — |
| 先知学徒 | Seer Apprentice | 启封奥秘 | [2024 先知学徒](backgrounds/5e-2024/au-seer-apprentice/au-seer-apprentice.md) | — |
| 庇护之手受护者 | Ward of the Sheltering Hands | 启封奥秘 | [2024 庇护之手受护者](backgrounds/5e-2024/au-ward-of-the-sheltering-hands/au-ward-of-the-sheltering-hands.md) | — |

## 2024 第三方出身（G2 批次，来源默认关闭、需 DM 同意）

| 出身 | 英文名 | 来源 | 详细资料 | 备注 |
| --- | --- | --- | --- | --- |
| 仪式专家 | Ritualist | 避世潜藏 | [2024 仪式专家](backgrounds/5e-2024/tp-vtm-ritualist/tp-vtm-ritualist.md) | 起源专长：魔法学徒（法师） |
| 猎魔学者 | Scholar of the Hunt | 避世潜藏 | [2024 猎魔学者](backgrounds/5e-2024/tp-vtm-scholar-of-the-hunt/tp-vtm-scholar-of-the-hunt.md) | 本设定自有专长「博学」未登记 ID |
| 血仆 | Ghoul | 避世潜藏 | [2024 血仆](backgrounds/5e-2024/tp-vtm-ghoul/tp-vtm-ghoul.md) | 同上（夜行） |
| 血族之奴 | Thrall | 避世潜藏 | [2024 血族之奴](backgrounds/5e-2024/tp-vtm-thrall/tp-vtm-thrall.md) | 同上（康健） |
| 触石 | Touchstone | 避世潜藏 | [2024 触石](backgrounds/5e-2024/tp-vtm-touchstone/tp-vtm-touchstone.md) | 同上（受护） |
| 契约追寻者 | Pact Seeker | Beyond Drops | [2024 契约追寻者](backgrounds/5e-2024/tp-beyond-pact-seeker/tp-beyond-pact-seeker.md) | 试行内容，登记为 `dm-only` |

> **归属修正（G2-E Q1-A）**：幻身灵旅者／马伦蒂／异端裁判官／猎兽人 4 条在 CHM 中位于《斯坦哈德的诡怖猎杀指南：玩家包》书目段（书锚点 `4954`），现已同时登记 `source-2024-tp-steinhardt`；原「德拉肯海姆」归属保留以兼容既有草稿。
> Beyond Drops 为 2026 年线上连载的试行内容，按 G2 决策 Q3-C 登记为 `dm-only`。

## 来源与版权边界

- 2024 通用机制与侍僧、罪犯、学者、士兵依据 [2024 Free Rules：Character Origins](https://www.dndbeyond.com/sources/dnd/br-2024/character-origins) 与 SRD 5.2.1，可用原创表述整理到实现级。
- 2024 其余核心出身依据 [官方 2024 背景介绍](https://www.dndbeyond.com/posts/1785-the-backgrounds-and-origin-feats-in-the-2024) 与 2024《玩家手册》，只记录机械索引、原创摘要、选择提示和官方入口。
- 2014 通用机制与侍僧依据 [2014 Basic Rules：Personality and Background](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/personality-and-background) 与 SRD 5.1，可整理到实现级。
- 2014 其他背景和变体来自 [2014 Player’s Handbook](https://www.dndbeyond.com/sources/dnd/phb-2014)，只记录机械索引、原创摘要、兼容边界和官方入口，不复制商业规则正文。
- 2014 扩展背景来源索引：
  - **SCAG**：Sword Coast Adventurer’s Guide（城市守卫、氏族工匠、隐修学者、宫廷贵族、派系特工、远方旅人、遗产继承者、骑士团骑士、雇佣兵老兵、城市赏金猎人、乌斯加德部落成员、深水城贵族）。
  - **GGR**：Guildmaster’s Guide to Ravnica（9 个公会背景，含公会法术特性；Simic Scientist 析米克科学家未纳入本次精选）。
  - **MOT**：Mythic Odysseys of Theros（运动员）。
  - **GoS**：Ghosts of Saltmarsh（海军 Marine、渔民 Fisher、船工 Shipwright、走私者 Smuggler；另含「盐沼背景」DM 工具页，仅登记索引）。
  - **AI**：Acquisitions Incorporated（失败商人、竞争对手实习生、赌徒）。
  - **EGtW**：Explorer’s Guide to Wildemount（笑面人、沃什塔克特工；另含英雄编年史叙事工具，仅登记索引）。
  - **DSotDQ**：Dragonlance: Shadow of the Dragon Queen（索兰尼亚骑士、高等术法会大法师；均带战役先决与组织位阶）。
  - **SatO**：Planescape: Adventures in the Multiverse（门镇守卫、位面哲学家；均带战役先决）。
  - **AAG**：Astral Adventurer’s Guide（星界浪客、荒宇人）。
  - **VRGtR**：Van Richten’s Guide to Ravenloft（精界迷失者；勘误：CHM 中未收录「暗影迷失者」独立背景页）。
  - **SCC**：Strixhaven: A Curriculum of Chaos（五学院学生）。
  - **BMT**（G2 批次）：The Book of Many Things（受宠者、受难者，出自第八章「命运」）。
  - **Bigby**（G2 批次）：Bigby Presents: Glory of the Giants（巨人养子、符文雕刻者；特性授予本书专长）。
  - **ERftLW**（G2 批次）：Eberron: Rising from the Last War（旧版家族代理人；本书 `5740`—`5757` 段在 CHM 中为 2024 写法，见下方 2024 官方扩展）。
  - **PS**（第三方，`dm-only`）：Plane Shift 免费试玩材料（阿芒凯维齐尔、依尼翠审判官）。
- 2024 官方扩展来源索引（G2 批次）：
  - **EFA**：Eberron: Forge of the Artificer（12 家系后裔 + 家族代理人 + 异种后裔 + 探事员 + 考古学家，另含 2024 重制版家族代理人；龙纹专长沿用已登记的 UA 艾伯伦条目）。
  - **FR:AI**：Forgotten Realms: Adventures in Faerûn（18，含竖琴手、紫龙骑士侍从、散塔林会佣兵等）。
  - **FR:HF**：Forgotten Realms: Heroes of Faerûn（吸血鬼幸存者、吸血鬼皈依者、狂欢客；同书起源专长未登记，见各自主文件）。
  - **RTHW**：Ravenloft: The Horrors Within（调查员、噩梦缠身者、降灵师、迷雾漫游者；以黑暗赠礼专长为起源专长）。
  - **AU**：Arcana Unleashed（十个背景，含九个与魔法派系关联者 + 魔宠训练家）。
  - **第三方（默认关闭、需 DM 同意）**：歪曲之月（13）、火炬光下的克苏鲁（1）、德拉肯海姆（2024 写法 4）、避世潜藏（5）、斯坦哈德（4 条归属修正）、Beyond Drops（1，`dm-only`）。
- 版本勘误记录（2026-08-11 核验）：SCAG 背景为独立完整背景（非“替换 PHB 技能”的变体），特性按原书标 Variant Feature、建议特征表借用 PHB 对应背景；GGR 公会法术加入施法职业法术列表并占用职业法术位，无短休恢复机制；MOT 仅 Athlete 一个新背景。
- 版本勘误记录（G 批次核验，2026-09-20）：**海军（Marine）是 Ghosts of Saltmarsh 的完整背景**，并非「士兵变体」，上一条旧勘误仅指同名的 Ghosts of Saltmarsh「Marine」与其它书的同名条目无关；析米克科学家因 CHM 缺页未纳入。
- 版本勘误记录（G2 批次核验，2026-09-21）：①`5528 背景` 属**艾伯伦寻路者指南**（旧版家族代理人），第一轮误记为黯潮之书；②CHM 中 `6874` 书页虽标「魔邓肯的众敌卷册（旧版）」，但 `6875`—`6965` 的内容是**《范·里希腾的鸦阁魔域指南》的重复渲染**，故 CHM 内不存在 MToF 2018 背景，本轮不计 MToF 缺口；③施坦哈德书锚点为 `4954`，其背景条目（`4936`—`4938`）与「探秘艾伯伦」同段混排。

## 选择性加载

1. 与背景无关的基础设施、样式、构建或规则任务不加载本文档。
2. 已知规则集和目标背景时，先读取本文档的字段与版本约定，再读取对应主文件。
3. 只有目标正式变体明确时才读取变体文件。
4. 禁止把 `docs/backgrounds/` 全目录作为普通开发上下文一次性加载。

## 核验记录

- 全量核验日期：2026-07-27；2026-08-11 扩展背景考察、勘误核验；**2026-09-20 G 批次补全核验**；**2026-09-21 G2 批次补全核验**（依据《5e 不全书》CHM v2026.09.13）。
- 当前资料范围：**92 个 `5e-2024` 出身文件**（16 核心 + 5 官方扩展书 52 + 第三方 24）、**102 个 `5e-2014` 背景**（13 核心基础 + 5 正式变体 + 22 既有扩展 + 22 G 批次补齐 + 19 G2 批次补齐 + 第三方 21）、**2 条索引条目**（GoS 盐沼背景 DM 工具页、EGtW 英雄编年史），以及本总索引。
- 当前程序注册情况：`5e-2014` 背景 **102** 条（基础 97 + 变体 5，全部带 `description`；`background-features-2014` 共 **87** 条特性）、`5e-2024` 背景 **92** 条（16 核心 + 52 官方扩展 + 24 第三方）。
- G2 批次补全清单（19 条官方 2014 + 34 条官方 2024 + 12 条第三方 = 65 条新增，含 1 条同名重制版）：官方 2014 为万象无常书 2、毕格比的巨人荣光 2、艾伯伦寻路者指南（旧版家族代理人）1，另勘误排除 MToF（CHM 该段实为 VRGtR 重复渲染）；官方 2024 为艾伯伦：奇械锻炉 17（16 条同批 + 2024 重制版家族代理人）、费伦冒险 18、费伦英雄 3、鸦阁魔域：魔障深藏 4、启封奥秘 10；第三方为避世潜藏 5、异界传送 Plane Shift 2、Beyond Drops 1，另将幻身灵旅者等 4 条补登斯坦哈德来源。
- 未纳入：**析米克科学家**（GGR，CHM 无背景页，无法核验）；CHM 中无背景节的第三方书（惊奇一发节日包、拳斗士、狮鹫的珍宝鞍包Ⅱ、瓦尔达的秘密尖塔玩家包、铳士、花卉龙博考、谦卑林两册、邪狱使、艾弗瑞斯巢穴集、黯潮之书、洛温：初光、耐瑟瑞尔之陨）。
- 2024 扩展背景口径：费伦冒险／费伦英雄／启封奥秘／鸦阁魔障深藏等书的起源专长多为各书新增类别（如黑暗赠礼专长、奥法系列专长），尚未登记为规则条目，故对应背景的 `originFeatId` 留空并在各自主文件中写明专长名，不编造 ID。
