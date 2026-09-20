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
  - **第三方（默认关闭、需 DM 同意）**：塔尔多雷（4）、胧忆岛（6）、德拉肯海姆（2014 写法 5 + 2024 写法 4）、歪曲之月（13）、火炬光下的克苏鲁（1）。
- 版本勘误记录（2026-08-11 核验）：SCAG 背景为独立完整背景（非“替换 PHB 技能”的变体），特性按原书标 Variant Feature、建议特征表借用 PHB 对应背景；GGR 公会法术加入施法职业法术列表并占用职业法术位，无短休恢复机制；MOT 仅 Athlete 一个新背景。
- 版本勘误记录（G 批次核验，2026-09-20）：**海军（Marine）是 Ghosts of Saltmarsh 的完整背景**，并非「士兵变体」，上一条旧勘误仅指同名的 Ghosts of Saltmarsh「Marine」与其它书的同名条目无关；析米克科学家因 CHM 缺页未纳入。

## 选择性加载

1. 与背景无关的基础设施、样式、构建或规则任务不加载本文档。
2. 已知规则集和目标背景时，先读取本文档的字段与版本约定，再读取对应主文件。
3. 只有目标正式变体明确时才读取变体文件。
4. 禁止把 `docs/backgrounds/` 全目录作为普通开发上下文一次性加载。

## 核验记录

- 全量核验日期：2026-07-27；2026-08-11 扩展背景考察、勘误核验；**2026-09-20 G 批次补全核验**（依据《5e 不全书》CHM v2026.09.13）。
- 当前资料范围：**34 个 `5e-2024` 出身文件**（16 核心 + 18 第三方 2024 写法）、**76 个 `5e-2014` 背景**（13 核心基础 + 5 正式变体 + 22 既有扩展 + 22 本批补齐 + 15 第三方）、**2 条索引条目**（GoS 盐沼背景 DM 工具页、EGtW 英雄编年史），以及本总索引。
- 当前程序注册情况：`5e-2014` 背景 **76** 条（基础 71 + 变体 5，全部带 `description` 与背景特性）、`5e-2024` 背景 **34** 条（16 核心 + 18 第三方，第三方来源默认关闭）。
- G 批次补全清单（22 条官方 + 15 条第三方 2014 写法 + 18 条第三方 2024 写法）：官方来源为 Ghosts of Saltmarsh 4、Acquisitions Incorporated 3、Explorer's Guide to Wildemount 2、龙枪 DSotDQ 2、Planescape SatO 2、Astral Adventurer's Guide 2、Van Richten's Guide to Ravenloft 1、斯翠海文 SCC 5；第三方为塔尔多雷 4、胧忆岛 6、德拉肯海姆（2014 写法 5 + 2024 写法 4）、歪曲之月 13、火炬光下的克苏鲁 1。
- 未纳入：**析米克科学家**（GGR，CHM 无背景页，无法核验）；Plane Shift 等推广材料、怪物数据块与社区内容。
- 2024 第三方背景口径：歪曲之月 13 条与神话调查员 1 条原书不含属性提升行，故未登记属性候选；「任选起源专长」与「原书未核验固定专长」的条目未登记固定专长 ID，均在各自主文件中标注。
