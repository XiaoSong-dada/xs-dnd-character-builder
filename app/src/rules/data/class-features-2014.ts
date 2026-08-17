import type { ClassFeature } from '@/types/rules'

/**
 * 2014 基础职业等级特性注册表（纵向切片）。
 *
 * 每条特性登记车卡展示所需的最小信息（名称、等级、类型、原创摘要、是否需
 * 玩家选择）。升级增强项每个等级各登记一条（如战士额外攻击 5/11/20 级三条）。
 * 需要玩家选择的特性（战斗风格、专精、宿敌、子职选择等）标记 `requiresChoice`，
 * 其选择入口由各职业 `checkpoints` 或既有机制提供，本注册表只做展示标记。
 * 具体数值效果以 2014 Basic Rules / SRD 5.1 为准；未经官方文本核验的细节
 * 在摘要中以转述方式说明，不复制原书正文。
 *
 * 规则集：`5e-2014`。新增特性时必须同时满足：
 * - 使用稳定、可序列化的字符串 ID（`<职业slug>-2014-class-<特性slug>`，
 *   同名升级项以 `-<等级>` 或 `-<序号>` 后缀区分）；
 * - 等级与 PHB 2014 职业等级表一致；
 * - 需要玩家选择的特性设置 `requiresChoice: true`；
 * - 摘要为原创中文转述，不复制规则正文。
 */
export const classFeatures2014: readonly ClassFeature[] = [
  // ============ 野蛮人 barbarian ============
  { id: 'barbarian-2014-class-rage', classId: 'class-2014-barbarian', name: '狂暴', englishName: 'Rage', level: 1, summary: '以附赠动作进入狂暴：力量检定与力量豁免优势、近战伤害 +2、钝击/挥砍/穿刺抗性，持续 1 分钟；长休后恢复，10 级起短休也可恢复。', kind: 'bonus-action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-unarmored-defense', classId: 'class-2014-barbarian', name: '无甲防御', englishName: 'Unarmored Defense', level: 1, summary: '未穿护甲时，护甲等级 = 10 + 敏捷调整值 + 体质调整值。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-reckless-attack', classId: 'class-2014-barbarian', name: '鲁莽攻击', englishName: 'Reckless Attack', level: 2, summary: '发动力量近战攻击时可选择鲁莽：本次攻击检定获得优势，同时该回合内攻击你的生物对你也有优势。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-danger-sense', classId: 'class-2014-barbarian', name: '危险感知', englishName: 'Danger Sense', level: 2, summary: '对可见陷阱与明显危害的敏捷豁免获得优势（未处于束缚、失能或震慑时）。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-primal-path', classId: 'class-2014-barbarian', name: '原初道途', englishName: 'Primal Path', level: 3, summary: '选择原初道途（子职），获得对应的道途特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-extra-attack', classId: 'class-2014-barbarian', name: '额外攻击', englishName: 'Extra Attack', level: 5, summary: '攻击动作可进行两次攻击。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-fast-movement', classId: 'class-2014-barbarian', name: '快速移动', englishName: 'Fast Movement', level: 5, summary: '未穿重甲时移动速度增加 10 尺。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-feral-instinct', classId: 'class-2014-barbarian', name: '野性直觉', englishName: 'Feral Instinct', level: 7, summary: '先攻检定获得优势；若在突袭回合仍能行动，可在行动前立即进入狂暴。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-brutal-critical', classId: 'class-2014-barbarian', name: '凶蛮暴击', englishName: 'Brutal Critical', level: 9, summary: '重击时额外投掷 1 个武器伤害骰。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-relentless-rage', classId: 'class-2014-barbarian', name: '无情狂暴', englishName: 'Relentless Rage', level: 11, summary: '狂暴中生命值降至 0 时，可通过体质豁免（DC 10）保持 1 点生命；每次已成功使用后 DC 提高 5。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-brutal-critical-2', classId: 'class-2014-barbarian', name: '凶蛮暴击（强化）', englishName: 'Brutal Critical', level: 13, summary: '重击时的额外武器伤害骰增至 2 个。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-persistent-rage', classId: 'class-2014-barbarian', name: '不屈狂怒', englishName: 'Persistent Rage', level: 15, summary: '狂暴可仅凭愤怒延续：回合开始时若未昏迷且生命值大于 0，可延长狂暴。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-brutal-critical-3', classId: 'class-2014-barbarian', name: '凶蛮暴击（强化）', englishName: 'Brutal Critical', level: 17, summary: '重击时的额外武器伤害骰增至 3 个。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-relentless-rage-2', classId: 'class-2014-barbarian', name: '无情狂暴（强化）', englishName: 'Relentless Rage', level: 18, summary: '生命值降至 0 时保持 1 点生命的豁免 DC 固定为 15。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-unlimited-rage', classId: 'class-2014-barbarian', name: '无限狂暴', englishName: 'Unlimited Rage', level: 20, summary: '狂暴次数不限，且先攻检定不再因突袭劣势而失败。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'barbarian-2014-class-primal-champion', classId: 'class-2014-barbarian', name: '原始冠军', englishName: 'Primal Champion', level: 20, summary: '力量与体质各 +4，两者上限提高至 24。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 吟游诗人 bard ============
  { id: 'bard-2014-class-spellcasting', classId: 'class-2014-bard', name: '施法', englishName: 'Spellcasting', level: 1, summary: '以魅力为施法属性的全施法者：戏法与已知法术数量按 2014 吟游诗人表推进。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-bardic-inspiration', classId: 'class-2014-bard', name: '吟游激励', englishName: 'Bardic Inspiration', level: 1, summary: '以附赠动作授予 60 尺内盟友一枚激励骰（d6），10 分钟内可用于一次属性、攻击或豁免检定；长休后恢复。', kind: 'bonus-action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-jack-of-all-trades', classId: 'class-2014-bard', name: '全才', englishName: 'Jack of All Trades', level: 2, summary: '未熟练的属性检定可附加一半熟练加值。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-song-of-rest', classId: 'class-2014-bard', name: '歌曲休憩', englishName: 'Song of Rest', level: 2, summary: '短休时演奏或吟唱，盟友额外恢复 1d6 生命值。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-bard-college', classId: 'class-2014-bard', name: '吟游学院', englishName: 'Bard College', level: 3, summary: '选择吟游学院（子职），获得对应的学院特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-expertise', classId: 'class-2014-bard', name: '专精', englishName: 'Expertise', level: 3, summary: '选择 2 项已熟练的技能或乐器获得专精，熟练加值翻倍。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-font-of-inspiration', classId: 'class-2014-bard', name: '灵感之源', englishName: 'Font of Inspiration', level: 5, summary: '吟游激励在使用后于短休或长休结束时恢复。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-countercharm', classId: 'class-2014-bard', name: '反制咏唱', englishName: 'Countercharm', level: 6, summary: '以动作演奏至多 10 分钟：30 尺内盟友对魅惑与恐慌的豁免获得优势。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-song-of-rest-2', classId: 'class-2014-bard', name: '歌曲休憩（强化）', englishName: 'Song of Rest', level: 9, summary: '短休额外恢复骰提升为 d8。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-magical-secrets', classId: 'class-2014-bard', name: '吟游诗人魔法奥秘', englishName: 'Magical Secrets', level: 10, summary: '从任意职业法术列表选择 2 个法术加入已知法术（环级不高于当前可用）。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-expertise-2', classId: 'class-2014-bard', name: '专精（强化）', englishName: 'Expertise', level: 10, summary: '再选择 2 项已熟练的技能或乐器获得专精。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-song-of-rest-3', classId: 'class-2014-bard', name: '歌曲休憩（强化）', englishName: 'Song of Rest', level: 13, summary: '短休额外恢复骰提升为 d10。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-magical-secrets-2', classId: 'class-2014-bard', name: '吟游诗人魔法奥秘（强化）', englishName: 'Magical Secrets', level: 14, summary: '再选择 2 个任意职业法术加入已知法术。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-superior-inspiration', classId: 'class-2014-bard', name: '卓越灵感', englishName: 'Superior Inspiration', level: 15, summary: '掷先攻时若吟游激励已耗尽，则恢复 1 枚。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-song-of-rest-4', classId: 'class-2014-bard', name: '歌曲休憩（强化）', englishName: 'Song of Rest', level: 17, summary: '短休额外恢复骰提升为 d12。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'bard-2014-class-magical-secrets-3', classId: 'class-2014-bard', name: '吟游诗人魔法奥秘（强化）', englishName: 'Magical Secrets', level: 18, summary: '再选择 2 个任意职业法术加入已知法术。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 牧师 cleric ============
  { id: 'cleric-2014-class-spellcasting', classId: 'class-2014-cleric', name: '施法', englishName: 'Spellcasting', level: 1, summary: '以感知为施法属性的全施法者：准备数量按“感知调整值 + 牧师等级”推进。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'cleric-2014-class-divine-domain', classId: 'class-2014-cleric', name: '神圣领域', englishName: 'Divine Domain', level: 1, summary: '选择神圣领域（子职），获得领域法术与领域特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'cleric-2014-class-channel-divinity', classId: 'class-2014-cleric', name: '引导神力', englishName: 'Channel Divinity', level: 2, summary: '获得引导神力，每短休或长休可使用 1 次；领域提供具体用法。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'cleric-2014-class-destroy-undead', classId: 'class-2014-cleric', name: '毁灭神术', englishName: 'Destroy Undead', level: 5, summary: '引导神力可令挑战等级 1/2 或更低的不死生物被直接摧毁（经感知豁免）。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'cleric-2014-class-channel-divinity-2', classId: 'class-2014-cleric', name: '引导神力（强化）', englishName: 'Channel Divinity', level: 6, summary: '引导神力每短休或长休可用次数增至 2 次。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'cleric-2014-class-divine-intervention', classId: 'class-2014-cleric', name: '神圣干预', englishName: 'Divine Intervention', level: 10, summary: '以动作请求神明干预：掷 d100，结果不大于牧师等级时神以 DM 决定的形式介入；此后 7 天内不可再次请求。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'cleric-2014-class-destroy-undead-2', classId: 'class-2014-cleric', name: '毁灭神术（强化）', englishName: 'Destroy Undead', level: 11, summary: '可摧毁的不死挑战等级提升至 1 或更低。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'cleric-2014-class-destroy-undead-3', classId: 'class-2014-cleric', name: '毁灭神术（强化）', englishName: 'Destroy Undead', level: 17, summary: '可摧毁的不死挑战等级提升至 2 或更低。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'cleric-2014-class-channel-divinity-3', classId: 'class-2014-cleric', name: '引导神力（强化）', englishName: 'Channel Divinity', level: 18, summary: '引导神力每短休或长休可用次数增至 3 次。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'cleric-2014-class-divine-intervention-2', classId: 'class-2014-cleric', name: '神圣干预（强化）', englishName: 'Divine Intervention', level: 20, summary: '请求神圣干预时不再需要掷骰，直接以 DM 决定的形式介入。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 德鲁伊 druid ============
  { id: 'druid-2014-class-druidic', classId: 'class-2014-druid', name: '德鲁伊语', englishName: 'Druidic', level: 1, summary: '掌握德鲁伊秘密语言，可与德鲁伊交流；该语言不留书面记录。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'druid-2014-class-spellcasting', classId: 'class-2014-druid', name: '施法', englishName: 'Spellcasting', level: 1, summary: '以感知为施法属性的全施法者：准备数量按“感知调整值 + 德鲁伊等级”推进。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'druid-2014-class-wild-shape', classId: 'class-2014-druid', name: '荒野变形', englishName: 'Wild Shape', level: 2, summary: '以动作变形为挑战等级 1/4 或更低、无飞行/游泳速度的野兽；持续小时数等于德鲁伊等级的一半，长休后恢复次数。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'druid-2014-class-druid-circle', classId: 'class-2014-druid', name: '德鲁伊结社', englishName: 'Druid Circle', level: 2, summary: '选择德鲁伊结社（子职），获得对应的结社特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'druid-2014-class-wild-shape-2', classId: 'class-2014-druid', name: '荒野变形（强化）', englishName: 'Wild Shape', level: 4, summary: '可变形野兽的挑战等级提升至 1/2，仍无飞行/游泳速度。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'druid-2014-class-wild-shape-3', classId: 'class-2014-druid', name: '荒野变形（强化）', englishName: 'Wild Shape', level: 8, summary: '可变形野兽的挑战等级提升至 1，并允许飞行或游泳速度。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'druid-2014-class-timeless-body', classId: 'class-2014-druid', name: '时之沙', englishName: 'Timeless Body', level: 18, summary: '衰老速度减慢，且魔法不能再使你衰老。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'druid-2014-class-beast-spells', classId: 'class-2014-druid', name: '野兽法术', englishName: 'Beast Spells', level: 18, summary: '野兽形态下可施放法术：可忽略姿势与语言成分（材料成分除外）。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'druid-2014-class-archdruid', classId: 'class-2014-druid', name: '千形万态', englishName: 'Archdruid', level: 20, summary: '荒野变形不限次数，且变形施法时可忽略材料成分。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 战士 fighter ============
  { id: 'fighter-2014-class-fighting-style', classId: 'class-2014-fighter', name: '战斗风格', englishName: 'Fighting Style', level: 1, summary: '选择一种战斗风格（箭术、防御、决斗、巨武器战斗、保护、双武器战斗）。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'fighter-2014-class-second-wind', classId: 'class-2014-fighter', name: '回气', englishName: 'Second Wind', level: 1, summary: '以附赠动作恢复 1d10 + 战士等级的生命值；短休或长休后恢复使用次数。', kind: 'bonus-action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'fighter-2014-class-action-surge', classId: 'class-2014-fighter', name: '动作如潮', englishName: 'Action Surge', level: 2, summary: '回合内额外执行一个动作；短休或长休后恢复。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'fighter-2014-class-martial-archetype', classId: 'class-2014-fighter', name: '武术范型', englishName: 'Martial Archetype', level: 3, summary: '选择武术范型（子职），获得对应的范型特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'fighter-2014-class-extra-attack', classId: 'class-2014-fighter', name: '额外攻击', englishName: 'Extra Attack', level: 5, summary: '攻击动作可进行两次攻击。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'fighter-2014-class-indomitable', classId: 'class-2014-fighter', name: '不屈', englishName: 'Indomitable', level: 9, summary: '豁免检定失败后可重掷；每长休可使用 1 次。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'fighter-2014-class-extra-attack-2', classId: 'class-2014-fighter', name: '额外攻击（强化）', englishName: 'Extra Attack', level: 11, summary: '攻击动作可进行三次攻击。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'fighter-2014-class-indomitable-2', classId: 'class-2014-fighter', name: '不屈（强化）', englishName: 'Indomitable', level: 13, summary: '不屈每长休可用次数增至 2 次。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'fighter-2014-class-action-surge-2', classId: 'class-2014-fighter', name: '动作如潮（强化）', englishName: 'Action Surge', level: 17, summary: '动作如潮每短休或长休可用次数增至 2 次。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'fighter-2014-class-indomitable-3', classId: 'class-2014-fighter', name: '不屈（强化）', englishName: 'Indomitable', level: 17, summary: '不屈每长休可用次数增至 3 次。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'fighter-2014-class-extra-attack-3', classId: 'class-2014-fighter', name: '额外攻击（强化）', englishName: 'Extra Attack', level: 20, summary: '攻击动作可进行四次攻击。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 武僧 monk ============
  { id: 'monk-2014-class-unarmored-defense', classId: 'class-2014-monk', name: '无甲防御', englishName: 'Unarmored Defense', level: 1, summary: '未穿护甲且未持盾时，护甲等级 = 10 + 敏捷调整值 + 感知调整值。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-martial-arts', classId: 'class-2014-monk', name: '武艺', englishName: 'Martial Arts', level: 1, summary: '徒手或武僧武器可改用敏捷进行攻击与伤害，伤害骰为 d4；以徒手或武僧武器攻击后可用附赠动作再作一次徒手攻击。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-ki', classId: 'class-2014-monk', name: '气', englishName: 'Ki', level: 2, summary: '获得气点，数量等于武僧等级；用于疾风连击、气功、疾步等能力，短休或长休后恢复。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-flurry-of-blows', classId: 'class-2014-monk', name: '疾风连击', englishName: 'Flurry of Blows', level: 2, summary: '消耗 1 气点，以附赠动作进行两次徒手攻击。', kind: 'bonus-action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-patient-defense', classId: 'class-2014-monk', name: '气功', englishName: 'Patient Defense', level: 2, summary: '消耗 1 气点，以附赠动作执行闪避动作。', kind: 'bonus-action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-step-of-the-wind', classId: 'class-2014-monk', name: '疾步', englishName: 'Step of the Wind', level: 2, summary: '消耗 1 气点，以附赠动作执行疾走或脱离动作。', kind: 'bonus-action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-unarmored-movement', classId: 'class-2014-monk', name: '无痕移动', englishName: 'Unarmored Movement', level: 2, summary: '未穿护甲时移动速度增加 10 尺。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-monastic-tradition', classId: 'class-2014-monk', name: '武僧传统', englishName: 'Monastic Tradition', level: 3, summary: '选择武僧传统（子职），获得对应的传统特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-slow-fall', classId: 'class-2014-monk', name: '减缓坠落', englishName: 'Slow Fall', level: 4, summary: '以反应减少坠落伤害，减少量 = 武僧等级 × 5。', kind: 'reaction', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-extra-attack', classId: 'class-2014-monk', name: '额外攻击', englishName: 'Extra Attack', level: 5, summary: '攻击动作可进行两次攻击。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-stunning-strike', classId: 'class-2014-monk', name: '震慑打击', englishName: 'Stunning Strike', level: 5, summary: '近战攻击命中后可消耗 1 气点令目标进行体质豁免，失败则被震慑至你的下回合结束。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-ki-empowered-strikes', classId: 'class-2014-monk', name: '健体', englishName: 'Ki-Empowered Strikes', level: 6, summary: '徒手攻击对非魔法攻击抗性的目标视为魔法武器。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-stillness-of-mind', classId: 'class-2014-monk', name: '脱逃', englishName: 'Stillness of Mind', level: 7, summary: '以动作结束作用于自身的魅惑或恐慌状态。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-unarmored-movement-2', classId: 'class-2014-monk', name: '无痕移动（强化）', englishName: 'Unarmored Movement', level: 9, summary: '可沿垂直表面奔跑，且不会中途坠落。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-purity-of-body', classId: 'class-2014-monk', name: '纯净身心', englishName: 'Purity of Body', level: 10, summary: '免疫疾病与毒素。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-unarmored-movement-3', classId: 'class-2014-monk', name: '无痕移动（强化）', englishName: 'Unarmored Movement', level: 13, summary: '可在液体表面移动。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-diamond-soul', classId: 'class-2014-monk', name: '净化之魂', englishName: 'Diamond Soul', level: 14, summary: '获得全部六项属性豁免熟练；豁免失败后可消耗 1 气点重掷。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-timeless-body', classId: 'class-2014-monk', name: '时之沙', englishName: 'Timeless Body', level: 15, summary: '不再需要饮食，且不会因衰老而虚弱。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-empty-body', classId: 'class-2014-monk', name: '空灵', englishName: 'Empty Body', level: 18, summary: '以动作隐形 1 分钟；或消耗 8 气点获得对非魔法伤害的抗性（魔法伤害除外）。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'monk-2014-class-perfect-self', classId: 'class-2014-monk', name: '完美自我', englishName: 'Perfect Self', level: 20, summary: '战斗开始且气点为 0 时，立即恢复 4 点气。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 圣武士 paladin ============
  { id: 'paladin-2014-class-divine-sense', classId: 'class-2014-paladin', name: '神圣感知', englishName: 'Divine Sense', level: 1, summary: '以动作感知 60 尺内的邪魔、不死或圣洁生物，持续至下回合结束。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-lay-on-hands', classId: 'class-2014-paladin', name: '圣疗', englishName: 'Lay on Hands', level: 1, summary: '拥有圣疗池（5 × 圣武士等级点），以动作治疗 5 尺内生物，或消耗 5 点治愈疾病与毒素。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-fighting-style', classId: 'class-2014-paladin', name: '战斗风格', englishName: 'Fighting Style', level: 2, summary: '选择一种战斗风格（防御、决斗、巨武器战斗、保护）。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-spellcasting', classId: 'class-2014-paladin', name: '施法', englishName: 'Spellcasting', level: 2, summary: '以魅力为施法属性的半施法者：准备数量按“魅力调整值 + 圣武士等级的一半”推进。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-divine-smite', classId: 'class-2014-paladin', name: '神恩斩击', englishName: 'Divine Smite', level: 2, summary: '近战武器命中后可消耗一个法术位附加光耀伤害：1 环 +2d8，每额外环级再 +1d8。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-channel-divinity', classId: 'class-2014-paladin', name: '引导神力', englishName: 'Channel Divinity', level: 3, summary: '获得引导神力，每短休或长休可使用 1 次；誓言提供具体用法。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-sacred-oath', classId: 'class-2014-paladin', name: '神圣誓言', englishName: 'Sacred Oath', level: 3, summary: '选择神圣誓言（子职），获得誓言法术与誓言特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-extra-attack', classId: 'class-2014-paladin', name: '额外攻击', englishName: 'Extra Attack', level: 5, summary: '攻击动作可进行两次攻击。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-aura-of-protection', classId: 'class-2014-paladin', name: '净化灵光', englishName: 'Aura of Protection', level: 6, summary: '你与 10 尺内盟友的豁免检定附加你的魅力调整值。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-aura-of-courage', classId: 'class-2014-paladin', name: '勇气灵光', englishName: 'Aura of Courage', level: 10, summary: '你与 10 尺内盟友免疫恐慌。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-improved-divine-smite', classId: 'class-2014-paladin', name: '神圣打击', englishName: 'Improved Divine Smite', level: 11, summary: '近战武器命中时附加 1d8 光耀伤害。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-cleansing-touch', classId: 'class-2014-paladin', name: '净化之触', englishName: 'Cleansing Touch', level: 14, summary: '以动作结束一名生物身上的一个法术效果；每长休可使用魅力调整值次。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'paladin-2014-class-aura-improvements', classId: 'class-2014-paladin', name: '灵光强化', englishName: 'Aura Improvements', level: 18, summary: '净化灵光与勇气灵光的范围扩大至 30 尺。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 游侠 ranger ============
  { id: 'ranger-2014-class-favored-enemy', classId: 'class-2014-ranger', name: '宿敌', englishName: 'Favored Enemy', level: 1, summary: '选择一类宿敌：对该类型生物的追踪检定与相关知识检定获得优势。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-natural-explorer', classId: 'class-2014-ranger', name: '自然探索者', englishName: 'Natural Explorer', level: 1, summary: '选择一种偏好地形：该地形中旅行时，困难地形不减速、潜行不暴露、追踪有优势且不会迷路。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-fighting-style', classId: 'class-2014-ranger', name: '战斗风格', englishName: 'Fighting Style', level: 2, summary: '选择一种战斗风格（箭术、防御、决斗、双武器战斗）。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-spellcasting', classId: 'class-2014-ranger', name: '施法', englishName: 'Spellcasting', level: 2, summary: '以感知为施法属性的半施法者：已知法术数量按 2014 游侠表推进。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-ranger-archetype', classId: 'class-2014-ranger', name: '游侠范型', englishName: 'Ranger Archetype', level: 3, summary: '选择游侠范型（子职），获得对应的范型特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-extra-attack', classId: 'class-2014-ranger', name: '额外攻击', englishName: 'Extra Attack', level: 5, summary: '攻击动作可进行两次攻击。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-favored-enemy-2', classId: 'class-2014-ranger', name: '宿敌（强化）', englishName: 'Favored Enemy', level: 6, summary: '新增一类宿敌，并获得对应的追踪与知识优势。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-natural-explorer-2', classId: 'class-2014-ranger', name: '自然探索者（强化）', englishName: 'Natural Explorer', level: 6, summary: '新增一种偏好地形，获得对应的探索优势。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-lands-stride', classId: 'class-2014-ranger', name: '无踪步', englishName: "Land's Stride", level: 8, summary: '非魔法困难地形不减速；非魔法植物不伤害你，且穿越时不减速。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-hide-in-plain-sight', classId: 'class-2014-ranger', name: '遁形', englishName: 'Hide in Plain Sight', level: 10, summary: '花费 1 分钟伪装融入环境：未移动时隐匿检定 +10，移动或行动后失效。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-natural-explorer-3', classId: 'class-2014-ranger', name: '自然探索者（强化）', englishName: 'Natural Explorer', level: 10, summary: '新增一种偏好地形，获得对应的探索优势。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-vanish', classId: 'class-2014-ranger', name: '怪诞感官', englishName: 'Vanish', level: 14, summary: '可隐藏自己而不被发现，且不再受非魔法追踪。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-favored-enemy-3', classId: 'class-2014-ranger', name: '宿敌（强化）', englishName: 'Favored Enemy', level: 14, summary: '新增一类宿敌，并获得对应的追踪与知识优势。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-feral-senses', classId: 'class-2014-ranger', name: '森林之魂', englishName: 'Feral Senses', level: 18, summary: '能感知 30 尺内任何隐形生物的位置（需保持未被束缚与失能），且对其攻击不因隐形而劣势。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'ranger-2014-class-foe-slayer', classId: 'class-2014-ranger', name: '猎人之歌', englishName: 'Foe Slayer', level: 20, summary: '对宿敌的攻击伤害附加感知调整值；命中时可重掷攻击骰并取较优结果。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 游荡者 rogue ============
  { id: 'rogue-2014-class-expertise', classId: 'class-2014-rogue', name: '专精', englishName: 'Expertise', level: 1, summary: '选择 2 项已熟练的技能或盗贼工具获得专精，熟练加值翻倍。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-sneak-attack', classId: 'class-2014-rogue', name: '偷袭', englishName: 'Sneak Attack', level: 1, summary: '攻击动作命中有优势或目标 5 尺内有你的盟友时，可附加偷袭伤害（1d6，每两等级 +1d6）。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-thieves-cant', classId: 'class-2014-rogue', name: '贼人黑话', englishName: "Thieves' Cant", level: 1, summary: '掌握盗贼暗语与秘密记号，可与同伙隐蔽交流。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-cunning-action', classId: 'class-2014-rogue', name: '诡诈动作', englishName: 'Cunning Action', level: 2, summary: '每回合以附赠动作执行疾走、脱离或躲藏。', kind: 'bonus-action', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-roguish-archetype', classId: 'class-2014-rogue', name: '游荡者范型', englishName: 'Roguish Archetype', level: 3, summary: '选择游荡者范型（子职），获得对应的范型特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-uncanny-dodge', classId: 'class-2014-rogue', name: '神出鬼没', englishName: 'Uncanny Dodge', level: 5, summary: '以反应将可见攻击者对你造成的伤害减半。', kind: 'reaction', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-expertise-2', classId: 'class-2014-rogue', name: '专精（强化）', englishName: 'Expertise', level: 6, summary: '再选择 2 项已熟练的技能或盗贼工具获得专精。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-evasion', classId: 'class-2014-rogue', name: '翻身', englishName: 'Evasion', level: 7, summary: '敏捷豁免成功时不受伤害，失败时只受一半伤害。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-reliable-talent', classId: 'class-2014-rogue', name: '诡计多端', englishName: 'Reliable Talent', level: 11, summary: '对已熟练技能的检定，掷骰结果低于 10 时视为 10。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-blindsense', classId: 'class-2014-rogue', name: '消除痕迹', englishName: 'Blindsense', level: 14, summary: '能感知 10 尺内未被完全遮蔽的隐形生物的位置。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-slippery-mind', classId: 'class-2014-rogue', name: '误入歧途', englishName: 'Slippery Mind', level: 15, summary: '获得感知豁免熟练。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'rogue-2014-class-stroke-of-luck', classId: 'class-2014-rogue', name: '幸运一击', englishName: 'Stroke of Luck', level: 20, summary: '攻击未命中时可改为命中；属性检定失败时可改为掷出 20；每短休或长休各可用一次。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 术士 sorcerer ============
  { id: 'sorcerer-2014-class-spellcasting', classId: 'class-2014-sorcerer', name: '施法', englishName: 'Spellcasting', level: 1, summary: '以魅力为施法属性的全施法者：戏法与已知法术数量按 2014 术士表推进。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'sorcerer-2014-class-sorcerous-origin', classId: 'class-2014-sorcerer', name: '术法起源', englishName: 'Sorcerous Origin', level: 1, summary: '选择术法起源（子职），获得对应的起源特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'sorcerer-2014-class-font-of-magic', classId: 'class-2014-sorcerer', name: '术法点', englishName: 'Font of Magic', level: 2, summary: '获得术法点（术士等级 × 1 + 2），可在术法点与法术位之间互相转换。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'sorcerer-2014-class-metamagic', classId: 'class-2014-sorcerer', name: '超魔法', englishName: 'Metamagic', level: 3, summary: '选择 2 项超魔法选项，消耗术法点改变法术的施放方式。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'sorcerer-2014-class-metamagic-2', classId: 'class-2014-sorcerer', name: '超魔法（强化）', englishName: 'Metamagic', level: 10, summary: '再选择 1 项超魔法选项。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'sorcerer-2014-class-metamagic-3', classId: 'class-2014-sorcerer', name: '超魔法（强化）', englishName: 'Metamagic', level: 17, summary: '再选择 1 项超魔法选项。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'sorcerer-2014-class-sorcerous-restoration', classId: 'class-2014-sorcerer', name: '超凡力量', englishName: 'Sorcerous Restoration', level: 20, summary: '短休后恢复术法点，恢复量 = 魅力调整值（至少 1 点）。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 邪术师 warlock ============
  { id: 'warlock-2014-class-otherworldly-patron', classId: 'class-2014-warlock', name: '异界宗主', englishName: 'Otherworldly Patron', level: 1, summary: '选择异界宗主（子职），获得对应的宗主特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'warlock-2014-class-pact-magic', classId: 'class-2014-warlock', name: '契约魔法', englishName: 'Pact Magic', level: 1, summary: '以契约法术位施法：法术位数量与环级按 2014 邪术师表推进，短休后恢复。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'warlock-2014-class-eldritch-invocations', classId: 'class-2014-warlock', name: '魔能祈唤', englishName: 'Eldritch Invocations', level: 2, summary: '选择 2 项魔能祈唤，随等级提升解锁更多选项。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'warlock-2014-class-pact-boon', classId: 'class-2014-warlock', name: '契约恩赐', englishName: 'Pact Boon', level: 3, summary: '选择契约恩赐（锁链契约、刀锋契约或魔典契约），获得对应的恩赐能力。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'warlock-2014-class-mystic-arcanum', classId: 'class-2014-warlock', name: '秘法奥秘', englishName: 'Mystic Arcanum', level: 11, summary: '获得 1 个 6 环法术位，用于施放一个 6 环法术；长休后恢复。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'warlock-2014-class-mystic-arcanum-2', classId: 'class-2014-warlock', name: '秘法奥秘（强化）', englishName: 'Mystic Arcanum', level: 13, summary: '获得 1 个 7 环法术位。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'warlock-2014-class-mystic-arcanum-3', classId: 'class-2014-warlock', name: '秘法奥秘（强化）', englishName: 'Mystic Arcanum', level: 15, summary: '获得 1 个 8 环法术位。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'warlock-2014-class-mystic-arcanum-4', classId: 'class-2014-warlock', name: '秘法奥秘（强化）', englishName: 'Mystic Arcanum', level: 17, summary: '获得 1 个 9 环法术位。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'warlock-2014-class-eldritch-master', classId: 'class-2014-warlock', name: '不朽化身', englishName: 'Eldritch Master', level: 20, summary: '以 1 分钟冥想恢复全部契约法术位；长休后恢复使用次数。', kind: 'action', status: 'implemented', sourceIds: ['basic-rules-2014'] },

  // ============ 法师 wizard ============
  { id: 'wizard-2014-class-spellcasting', classId: 'class-2014-wizard', name: '施法', englishName: 'Spellcasting', level: 1, summary: '以智力为施法属性的全施法者：准备数量按“智力调整值 + 法师等级”推进，且必须来自法术书。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'wizard-2014-class-spellbook', classId: 'class-2014-wizard', name: '法术书', englishName: 'Spellbook', level: 1, summary: '拥有法术书：起始记录 6 个 1 环法术，每升 1 级可抄录 2 个新法术，也可花费时间与金币抄录其他来源的法术。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'wizard-2014-class-ritual-casting', classId: 'class-2014-wizard', name: '仪式施法', englishName: 'Ritual Casting', level: 1, summary: '可仪式施放法术书中带仪式标签的法术，无需占用准备位。', kind: 'passive', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'wizard-2014-class-arcane-recovery', classId: 'class-2014-wizard', name: '奥术回想', englishName: 'Arcane Recovery', level: 1, summary: '短休后恢复法术位，合计环级不超过法师等级的一半（向上取整，且不超过 5）；长休后恢复使用次数。', kind: 'resource', status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'wizard-2014-class-arcane-tradition', classId: 'class-2014-wizard', name: '奥术传统', englishName: 'Arcane Tradition', level: 2, summary: '选择奥术传统（子职），获得对应的学派特性。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'wizard-2014-class-spell-mastery', classId: 'class-2014-wizard', name: '法术专精', englishName: 'Spell Mastery', level: 18, summary: '选择法术书中的 1 个 1 环与 1 个 2 环法术，可随时以最低环级施放而无需消耗法术位。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
  { id: 'wizard-2014-class-signature-spells', classId: 'class-2014-wizard', name: '招牌法术', englishName: 'Signature Spells', level: 20, summary: '选择法术书中的 2 个 3 环法术作为招牌法术：长休后可各免费施放一次，且可将其作为 3 环法术准备。', kind: 'choice', requiresChoice: true, status: 'implemented', sourceIds: ['basic-rules-2014'] },
]

const featuresByClass = new Map<string, ClassFeature[]>()
for (const feature of classFeatures2014) {
  const list = featuresByClass.get(feature.classId)
  if (list) list.push(feature)
  else featuresByClass.set(feature.classId, [feature])
}

export function getClassFeatures2014(classId: string): readonly ClassFeature[] {
  return featuresByClass.get(classId) ?? []
}
