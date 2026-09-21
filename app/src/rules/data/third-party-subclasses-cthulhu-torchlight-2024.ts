import type { SubclassFeature, SubclassFeatureKind, SubclassRule } from '@/types/rules'

/**
 * G3-I2：《火炬光下的克苏鲁》第三方子职（2024 口径，12 条）。
 * 仅登记选择与展示所需元数据与原创中文摘要，效果不进入自动计算；
 * 来源 `source-2024-tp-cthulhu-torchlight` 为第三方合作内容，默认关闭、需 DM 同意。
 *
 * 登记口径：
 * - 特性中英文名、等级与法术表取自 CHM v2026.09.13 第三章对应小节正文，未回译、未改写专名；
 * - kind 按主要触发方式登记：资料明示动作／附赠动作／反应者照记，资源池型记 `resource`，
 *   常驻增益与随自身行动生效的改写型能力记 `passive`；
 * - 资料中的阵营示例段、共生表象等投掷表与译注均不作为特性登记；
 * - 需要玩家在使用时二选一的特性（如守道技法、幽影尘埃用法）不建立 RuleOption，只在 description 内说明可选范围。
 */

const SOURCE_IDS = ['source-2024-tp-cthulhu-torchlight'] as const

interface FeatureSeed { readonly slug: string; readonly name: string; readonly englishName: string; readonly level: number; readonly kind: SubclassFeatureKind; readonly summary: string; readonly description: string }
interface SubclassSeed { readonly slug: string; readonly classSlug: string; readonly name: string; readonly englishName: string; readonly summary: string; readonly features: readonly FeatureSeed[] }

const seeds: readonly SubclassSeed[] = [
  // ============ 吟游诗人 bard ============
  {
    slug: 'drama',
    classSlug: 'bard',
    name: '戏剧学院',
    englishName: 'College of Drama',
    summary: '把古老史诗活演出来的吟游诗人学院。他们以魔法改变自己的容貌与嗓音，也能让整个剧团一同入戏，既用英雄传说鼓舞同伴去完成非凡壮举，又擅长带队伍混入邪教仪式与大型集会而不露破绽。',
    features: [
      {
        slug: 'tragic-hero', name: '悲剧英雄', englishName: 'Tragic Hero', level: 3, kind: 'reaction',
        summary: '豁免失败时可让 60 尺内多名可见生物对抗同一效应时获得魅力加值。',
        description: '当你的一次豁免检定失败时，你可以选择自身 60 尺范围内任意数量你可见的其他生物。每个被选中的生物在对抗引发该次失败的同一效应时，其豁免检定获得等于你魅力调整值的加值（至少 +1），因此有可能把失败转为成功。该特性不消耗动作，也没有使用次数限制。',
      },
      {
        slug: 'one-life-many-roles', name: '百面人生', englishName: 'One Life, Many Roles', level: 3, kind: 'bonus-action',
        summary: '附赠动作施展易容术，可模仿所见生物的言行与声音；短休或长休后恢复。',
        description: '你可以用附赠动作施展易容术，借此扮演一个角色；若你以此方式扮演一名你能看见的特定生物，你还能一并模仿该生物的言行举止与声音。使用一次后，你必须完成一次短休或长休，才能再次使用该特性。',
      },
      {
        slug: 'stage-direction', name: '舞台指导', englishName: 'Stage Direction', level: 6, kind: 'passive',
        summary: '能看见你的生物使用诗人激励骰时不必掷骰，直接取最大值；次数＝魅力调整值。',
        description: '当一个能看见你的生物通常需要投掷一枚你的诗人激励骰时，它无需投掷，而是直接取该骰可能的最大值。你能使用本特性的次数等于你的魅力调整值（最少为 1），完成一次长休后重获所有已消耗的使用次数。',
      },
      {
        slug: 'assemble-the-troupe', name: '众星登场', englishName: 'Assemble the Troupe', level: 14, kind: 'passive',
        summary: '以百面人生施展易容术时，可让 30 尺内至多六名自愿生物一同变形并获得魅力加值。',
        description: '当你使用百面人生特性施展易容术时，你可以指定自身 30 尺范围内至多六名你可见的自愿生物为该法术的目标，每个生物变化成的外观由你决定。在以此方式施展的易容术效应持续期间，被选中的生物进行魅力检定时获得等于你魅力调整值的加值（最少为 +1）。',
      },
      {
        slug: 'grand-finale', name: '谢幕绝唱', englishName: 'Grand Finale', level: 14, kind: 'action',
        summary: '魔法动作让 60 尺内至多两名生物本回合各立即执行一个动作；长休后恢复。',
        description: '你可以使用魔法动作选择自身 60 尺范围内至多两名能看见或听见你的其他生物，每个被选中的生物都可以在本回合内立即执行一个动作。该特性一经使用，直至你完成一次长休前都无法再次使用。',
      },
    ],
  },

  // ============ 圣武士 paladin ============
  {
    slug: 'guardian',
    classSlug: 'paladin',
    name: '守护之誓',
    englishName: 'Oath of Guardian',
    summary: '立誓守护平民与边境城镇、对抗肆虐怪物的圣武士誓言，成员从独守边镇的游侠骑士到护卫枢机主教的精锐骑士团皆有。他们以刻印打击牵制敌人、用守护之仪把自身防御分享给同伴，并在高等级化身移动堡垒、不断取回引导神力。',
    features: [
      {
        slug: 'oath-of-guardian-spells', name: '守护之誓法术', englishName: 'Oath of Guardian Spells', level: 3, kind: 'resource',
        summary: '3／5／9／13／17 级按守护之誓法术表始终准备对应法术，不占准备数量。',
        description: '誓言具有的魔法使你始终准备特定法术：3 级警报术、虔诚护盾；5 级次等复原术、守护之链；9 级希望信标、防护能量；13 级防死结界、信仰守卫；17 级高等复原术、死者复活。到达对应圣武士等级即自动获得，且不计入你的准备法术数量。',
      },
      {
        slug: 'defensive-intervention', name: '肃卫干预', englishName: 'Defensive Intervention', level: 3, kind: 'reaction',
        summary: '反应消耗一次引导神力，传送至多 30 尺替 30 尺内被命中的生物承受攻击。',
        description: '当你能看见的一名生物对位于你 30 尺内的另一名生物进行攻击检定并命中时，你可以用一个反应消耗一次引导神力次数，传送至多 30 尺到该攻击触发范围内的一个未占据空间，并取代原目标成为这次攻击的目标。',
      },
      {
        slug: 'marking-strike', name: '刻印打击', englishName: 'Marking Strike', level: 3, kind: 'passive',
        summary: '武器命中时可放弃武器精通标记目标：它攻击他人有劣势，远离你需双倍移动。',
        description: '当你用武器攻击检定命中一个生物时，你可以放弃使用该武器的精通属性来标记目标，效果持续到你下一回合结束：被标记生物对除你以外的目标进行攻击检定时具有劣势，且当它远离你移动时每移动 1 尺必须花费 2 尺移动力。你陷入失能或其他人标记该生物时，此效果提前结束。',
      },
      {
        slug: 'guarding-presence', name: '守护之仪', englishName: 'Guarding Presence', level: 7, kind: 'bonus-action',
        summary: '附赠动作让 5 尺内至多魅力调整值个生物改用你的 AC，离开 5 尺即结束。',
        description: '你可以用一个附赠动作，在自身 5 尺范围内选择数量等于你的魅力调整值（最少为 1）的生物。每个被选择的生物都可以使用你的 AC 代替其自身的 AC，直到它离开你超过 5 尺、或你陷入失能状态为止。',
      },
      {
        slug: 'inspiring-defense', name: '振奋守御', englishName: 'Inspiring Defense', level: 7, kind: 'passive',
        summary: '你进行借机攻击时可攻击两次；受守护之仪影响的生物借机攻击同样攻击两次。',
        description: '当你进行借机攻击时，你可以攻击两次而非一次。此外，在你守护之仪特性影响下、由你所选的生物，他们进行借机攻击时也可以攻击两次而非一次；该增益不需要额外动作或资源，随守护之仪一同生效。',
      },
      {
        slug: 'ward-of-the-guardian', name: '御者之护', englishName: 'Ward of the Guardian', level: 15, kind: 'reaction',
        summary: '反应把被标记生物击倒的盟友生命值改为 1 点，盟友可立刻反击；次数＝魅力调整值。',
        description: '当一个被你标记且你能看见的生物将一名盟友的生命值减少至 0、且未直接杀死该盟友时，你可以用一个反应让该盟友的生命值改为降至 1 点。若你如此做，该盟友可立即用一个反应对标记生物发起一次近战攻击（前提是目标在其触及范围内）。使用次数等于你的魅力调整值（最少 1 次），完成一次长休时重获所有已消耗的次数。',
      },
      {
        slug: 'guardian-angel', name: '守护天使', englishName: 'Guardian Angel', level: 20, kind: 'bonus-action',
        summary: '附赠动作化身防御城堡 1 分钟：守护之仪扩为 100 尺光环，循环取回引导神力。',
        description: '你可以用一个附赠动作化身活生生的防御城堡 1 分钟（可提前结束），并获得：行走堡垒——守护之仪变为 100 尺光环，光环内你选择的生物都可改用你的 AC；无穷神力——你的每个回合若已耗尽引导神力，即可重获一次；至严惩击——每回合一次可无需反应地使用御者之护。此特性用后须完成长休，也可消耗一个五环法术位重置。',
      },
    ],
  },

  // ============ 德鲁伊 druid ============
  {
    slug: 'symbiosis',
    classSlug: 'druid',
    name: '共生结社',
    englishName: 'Circle of the Symbiote',
    summary: '允许植物扎根于肌肤、把共生体变成生命一部分的德鲁伊结社，常被同袍视为极端人士。他们平等对待动植物，以共生转变换取更强防御与持续回复，能借共生反射瞬发加速术，并在危难中自动脱身。',
    features: [
      {
        slug: 'circle-of-the-symbiote-spells', name: '共生结社法术', englishName: 'Circle of the Symbiote Spells', level: 3, kind: 'resource',
        summary: '3／5／7／9 级按共生结社法术表始终准备对应法术，不占准备数量。',
        description: '当你到达表中特定的德鲁伊等级时，你就始终准备着对应的结社法术：3 级神导术、树肤术、纠缠术；5 级植物滋长；7 级幻景；9 级树跃术。这些法术由结社直接赋予，不计入你的准备法术数量。',
      },
      {
        slug: 'primal-symbiote', name: '原初共生', englishName: 'Primal Symbiote', level: 3, kind: 'bonus-action',
        summary: '维持专注的体质豁免有优势；附赠动作耗荒野变形进入共生转变 1 分钟。',
        description: '藤蔓与根茎缠绕着你的身躯。盘根错节：你为维持专注进行的体质豁免具有优势。共生转变：你可以用附赠动作消耗一次荒野变形次数，让共生体转变为类似植物的巨大形态；1 分钟内你的 AC 获得 +2 加值，每个你的回合开始时获得等于 2 + 你德鲁伊等级一半（向下取整）的临时生命值，敏捷（隐匿）检定具有优势。',
      },
      {
        slug: 'symbiotic-reflexes', name: '共生反射', englishName: 'Symbiotic Reflexes', level: 6, kind: 'passive',
        summary: '始终准备加速术；每次激活共生转变时可免法术位与成分对自身施展一次。',
        description: '你的植物共生体赋予你力量：你始终准备着法术加速术。每次激活共生转变限一次，你能够无需法术位、且无需任何法术成分地对你自身施展加速术，该次施法不占用你原本的准备法术数量。',
      },
      {
        slug: 'survival-instinct', name: '生存本能', englishName: 'Survival Instinct', level: 10, kind: 'passive',
        summary: '陷入失能期间仍能执行疾走、撤离或回避动作，并维持回避动作的增益。',
        description: '当你身处危难之中，你的共生体会试图将你转移到安全之地：你陷入失能状态期间，仍然能够执行疾走、撤离或回避动作，并且能够在陷入失能期间维持回避动作所提供的增益。',
      },
      {
        slug: 'surge-of-sustenance', name: '生机迸发', englishName: 'Surge of Sustenance', level: 14, kind: 'action',
        summary: '魔法动作消耗荒野变形，让自身或触碰到的生物获得完成短休的增益；长休一次。',
        description: '你可以用一个魔法动作消耗一次荒野变形次数，令你自身或你触碰的一名生物立即获得完成一次短休所能得到的增益。此特性一经使用，直至你完成一次长休为止都无法再次使用。',
      },
    ],
  },

  // ============ 战士 fighter ============
  {
    slug: 'hero',
    classSlug: 'fighter',
    name: '英雄',
    englishName: 'Hero',
    summary: '能激发人性闪光点的战士，是黑暗时代里宛若灯塔的希望之源。他们以风范鼓舞平民与同伴一同面对威胁，用果断的壮举在关键时刻逆转大局，在盟友眼中既是激励的话语也是最可靠的锋刃。',
    features: [
      {
        slug: 'bolstering-presence', name: '激励之仪', englishName: 'Bolstering Presence', level: 3, kind: 'resource',
        summary: '回合开始时令 30 尺内所选盟友恢复 2d6＋等级一半生命；次数＝魅力调整值。',
        description: '在你的回合开始时，你可以无需动作地激励盟友：距离你 30 尺内、所有能看见或听见你并由你选定的生物恢复生命值，数值等于 2d6 + 你战士职业等级的一半（向下取整）。你陷入失能状态期间无法使用此特性。可使用次数等于你的魅力调整值（最少 1 次），完成一次长休时重获所有已消耗的使用次数。',
      },
      {
        slug: 'heroic-effort', name: '英雄壮举', englishName: 'Heroic Effort', level: 3, kind: 'reaction',
        summary: '反应在其他生物回合结束时移动并攻击，并让 30 尺内一名盟友同样反应行动。',
        description: '你可以用一个反应在一个生物的回合结束时，移动至多等同于你速度的距离并进行一次武器攻击或徒手打击。随后，由你选择的一名位于你 30 尺内、能看见或听见你的盟友也可以用一个反应，移动至多等同于其速度的距离并进行一次武器攻击或徒手打击。使用次数等于你的魅力调整值（最少 1 次），完成一次长休时重获所有已消耗的使用次数。',
      },
      {
        slug: 'lead-by-example', name: '以身作则', englishName: 'Lead by Example', level: 7, kind: 'passive',
        summary: '使用英雄壮举时，你与被指定的盟友身上的魅惑、恐慌、中毒状态立即结束。',
        description: '当你使用英雄壮举特性时，若你正处于魅惑、恐慌或中毒状态，这些状态立即结束。此外，若你以英雄壮举特性指定的那名盟友正处于魅惑、恐慌或中毒状态，其身上的这些状态也会立即结束。',
      },
      {
        slug: 'inspiring-presence', name: '鼓舞之仪', englishName: 'Inspiring Presence', level: 10, kind: 'passive',
        summary: '激励之仪的受益者在 D20 检定与伤害掷骰上获得等于魅力调整值的加值。',
        description: '当你使用激励之仪特性时，每个被选中的生物在 D20 检定和伤害掷骰上获得加值，该加值等于你的魅力调整值（最少为 1），且持续至你的下一回合结束。',
      },
      {
        slug: 'durable-presence', name: '坚韧之仪', englishName: 'Durable Presence', level: 15, kind: 'passive',
        summary: '完成短休或长休后即重获所有激励之仪的使用次数。',
        description: '你在完成一次短休或长休后，重新获得所有激励之仪的使用次数。此前该特性只能在长休时补满，此后短休同样可以恢复，使你在同一天内能够更频繁地激励盟友。',
      },
      {
        slug: 'mighty-effort', name: '超凡壮举', englishName: 'Mighty Effort', level: 18, kind: 'passive',
        summary: '使用英雄壮举时可指定至多两名盟友，而非原本的一个。',
        description: '当你使用英雄壮举特性时，你可以指定至多两个生物为目标，而非原本的一个，因此一次壮举能够同时让两名同伴移动并各发动一次攻击。',
      },
    ],
  },

  // ============ 术士 sorcerer ============
  {
    slug: 'hungering-dark',
    classSlug: 'sorcerer',
    name: '饥欲之暗',
    englishName: 'Hungering Dark',
    summary: '体内魔法如饥饿野兽般撕扯灵魂与心智的术士，本身是通往黑暗阴郁国度的活体门扉。他们拥有强大的黑暗法术，却总在矛盾中挣扎，最终蜕变为介于现实与阴影之间的存在。',
    features: [
      {
        slug: 'innate-darkness-spells', name: '天赋黑暗法术', englishName: 'Innate Darkness Spells', level: 3, kind: 'resource',
        summary: '3／5／7／9 级按天赋黑暗法术表始终准备对应法术，含本书新增法术。',
        description: '当你到达天赋黑暗法术表中特定的术士等级时，你就始终准备着表中对应的法术：3 级惑影术、黑潮、暗影触须、黑暗术；5 级恐惧术、幽暗迸发；7 级艾伐黑触手、高等隐形术；9 级假象术、暗影召唤术。表中带星号者为本书新增法术，这些法术均不占你的准备法术数量。',
      },
      {
        slug: 'shadowed-soul', name: '幽影之魂', englishName: 'Shadowed Soul', level: 3, kind: 'passive',
        summary: '获得 60 尺黑暗视觉（已有则再增 60 尺），并可看穿自己创造的魔法黑暗。',
        description: '你内在的黑暗使你能够摒弃光明：你获得 60 尺黑暗视觉；若你已有黑暗视觉，其范围额外增加 60 尺。此外，只要你没有陷入目盲或失能状态，你就可以看穿由你天赋黑暗特性所创造的魔法黑暗。',
      },
      {
        slug: 'friends-to-darkness', name: '与暗为友', englishName: 'Friends to Darkness', level: 6, kind: 'passive',
        summary: '施展天赋黑暗法术前可选至多魅力调整值个生物，1 分钟内看穿你造的魔法黑暗。',
        description: '当你施展任何来自你天赋黑暗特性列表的法术时，你可以选择至多等同于你魅力调整值的生物（至少一个）。这些被选中的生物在接下来 1 分钟内，能够看穿由你创造的任何魔法黑暗。',
      },
      {
        slug: 'pure-darkness', name: '纯然黑暗', englishName: 'Pure Darkness', level: 14, kind: 'passive',
        summary: '你以天赋黑暗法术创造的黑暗区域内，黑暗视觉与盲视均无法生效。',
        description: '当你施展任何来自你天赋黑暗特性列表、且能创造一片黑暗区域的法术时，黑暗视觉与盲视都无法在该法术创造的区域内生效，因此置身其中的生物即使拥有这些感官也无法看穿那片黑暗。',
      },
      {
        slug: 'one-with-darkness', name: '与暗同体', englishName: 'One with Darkness', level: 18, kind: 'passive',
        summary: '自己的回合内隐形且不被真实视觉或盲视感知；未移动过可传送 30 尺后速度归零。',
        description: '你内在的黑暗因饥欲而翻涌，使你蜕变为一种介于现实与阴影之间的存在：在你的回合中，你处于隐形状态，且无法被真实视觉或盲视所感知。只要你在该回合中尚未移动过，你便可以传送至多 30 尺，到达一处你可见的未占据空间；使用该传送后你的速度降为 0，直至当前回合结束。',
      },
    ],
  },

  // ============ 武僧 monk ============
  {
    slug: 'skybalance',
    classSlug: 'monk',
    name: '天衡武者',
    englishName: 'Warrior of Cosmic Balance',
    summary: '守护世界神秘通道、位面传送门与奥术之门的武僧，每当异界恐怖试图入侵便守候在那里。他们以守道技法扰乱异怪体内的邪恶能量，用功力净化最强大的污染，并把强敌驱回其诞生的深渊。',
    features: [
      {
        slug: 'guardian-of-the-way-technique', name: '守道技法', englishName: 'Guardian of the Way Technique', level: 3, kind: 'passive',
        summary: '每轮一次，疾风连击的徒手打击造成伤害时可封锁传送或把目标传送 15 尺。',
        description: '你研究过异界生物，学会了如何扰乱它们体内流动的邪恶能量：每轮一次，当你使用疾风连击进行徒手打击并造成伤害时，可以造成下列效果之一。定锚击：直到你下一回合结束前，目标无法传送或进行位面旅行，包括进入异次元空间或半位面。放逐击：目标传送至你可见的 15 尺内的一个未占据空间。',
      },
      {
        slug: 'seeker', name: '探寻者', englishName: 'Seeker', level: 3, kind: 'passive',
        summary: '始终准备侦测魔法与通晓语言，可免法术位施展其一；长休或耗 1 点功力恢复。',
        description: '你始终准备着法术侦测魔法与通晓语言。通过此特性，你可以不消耗法术位、且无需材料成分地施展其中一个法术，并使用感知作为你的施法关键属性。一旦你用此特性施展了法术，除非消耗 1 点功力（无需动作）来恢复使用次数，否则你要完成一次长休后才能再次以此方式施法。',
      },
      {
        slug: 'warden-of-harmony', name: '均衡执守', englishName: 'Warden of Harmony', level: 6, kind: 'reaction',
        summary: '60 尺内生物尝试传送时，可用反应并消耗 1 点功力阻止该次传送。',
        description: '当 60 尺内的生物尝试传送时，你可以使用一个反应并消耗 1 点功力来阻止该传送，使这次传送失败。该特性没有次数上限，只要仍有功力即可反复使用。',
      },
      {
        slug: 'cosmic-restoration', name: '寰宇复元', englishName: 'Cosmic Restoration', level: 11, kind: 'bonus-action',
        summary: '附赠动作触碰生物，祛除其身上法术效果或移除一项状态；长休或耗 4 点功力恢复。',
        description: '你可以用一个附赠动作触碰一个自愿的生物（可以是你自己），并选择以下选项之一。祛法触：你终止目标身上任意你选择的所有法术效果。净邪触：你移除目标身上的以下状态之一——目盲、魅惑、耳聋、力竭（减少 1 级）、恐慌、麻痹、石化、中毒或震慑。使用此特性后需完成一次长休才能再次使用，也可消耗 4 点功力（无需动作）恢复使用次数。',
      },
      {
        slug: 'ward-the-profane', name: '邪祟封禁', englishName: 'Ward the Profane', level: 17, kind: 'passive',
        summary: '每回合一次，徒手打击命中时可消耗 3 点功力对其施展放逐术，感知为施法属性。',
        description: '每回合一次，当你的徒手打击命中一个生物时，你可以消耗 3 点功力以对该生物施展放逐术，并使用感知作为此法术的施法关键属性。此举不需要额外动作，只要本回合尚未以此方式施展过该法术即可。',
      },
    ],
  },

  // ============ 法师 wizard ============
  {
    slug: 'scribe',
    classSlug: 'wizard',
    name: '司书',
    englishName: 'Bibliomancy',
    summary: '认为语言才是构建宇宙础石的法师传承：法术公式既调动魔法能量，也诠释现世潜在的特质与规律。司书靠触碰解读文稿与魔法物品，改写所准备法术的参数，并把两道法术编织成一道更强的新法术。',
    features: [
      {
        slug: 'book-learning', name: '司书学识', englishName: 'Book Learning', level: 3, kind: 'passive',
        summary: '持续触碰文稿 1 分钟即可读懂其内容，并识别魔法物品词条与所受法术。',
        description: '若你持续触碰一件承载了一份文稿的物件一分钟，你便可了解关于这份文稿内容的基本信息及实用知识，除非它被以暗语或密码加密。若该物件是一件魔法物品或魔法物件，你还能知晓其词条、该如何使用它、是否需要同调以及具有多少充能；你也能知晓它是否正被一道持续中的法术影响、那是什么法术，以及创造它的法术名称。',
      },
      {
        slug: 'edit-spell', name: '编写法术', englishName: 'Edit Spell', level: 3, kind: 'passive',
        summary: '准备法术时可为其附加豁免 DC +1、更改伤害类型或改为智力豁免等增益。',
        description: '从你的法术书中选择一道一环或更高的法术，准备它时可以赋予以下一条或多条增益：该法术的豁免 DC +1；若它造成伤害，可改为另一种由你选择的伤害类型；若它需要豁免，可改为智力豁免。你可以多次准备这道法术，但每次的增益组合必须不同，被修改的法术照常占用准备数量，完成长休时可以更换所选法术。',
      },
      {
        slug: 'weaver-of-words', name: '织言者', englishName: 'Weaver of Words', level: 6, kind: 'passive',
        summary: '成为通晓所有言语的大师，习得战役中所有角色可以习得的语言。',
        description: '你成为了通晓所有言语的大师：你习得战役中所有角色可以习得的语言，从此能够读懂并说出这些语言，用以研读典籍、与异族交涉或破解古老铭文。',
      },
      {
        slug: 'customized-spell', name: '定制法术', englishName: 'Customized Spell', level: 10, kind: 'passive',
        summary: '把生物名字刻入法术，使其作为唯一目标时可无需维持专注。',
        description: '你可以将一名生物的名字刻录入法术之中，改变其结构：从你的法术书中选择一道带有语言成分、需要专注且环阶为一或更高的法术，当你准备该法术时，可以诵念一个特定的、除你之外的自愿生物的名字。若该生物为该法术的唯一目标，则你对其施展那道法术时可以无需维持专注。',
      },
      {
        slug: 'master-of-words', name: '咒言主宰', englishName: 'Master of Words', level: 14, kind: 'action',
        summary: '准备法术时可将两道一至五环法术编织为一道交联法术，以魔法动作同时生效。',
        description: '当你准备法术时，可以从一环到五环中选择两道法术，用它们编织出交联的一道强大法术，并把它作为单个法术准备；交联法术的环阶等于这两道法术环阶相加，且不能超过六环，所选法术必须具有语言成分且施法时间为动作。你可以用一个魔法动作施展交联法术，同时创造出构成它的那两道法术的效果。',
      },
    ],
  },

  // ============ 游侠 ranger ============
  {
    slug: 'wildpath',
    classSlug: 'ranger',
    name: '荒径守护者',
    englishName: 'Trail Warden',
    summary: '立誓把队伍全员安全带出荒野的游侠向导，只引领技能足以抵御怪物与恶劣环境的人，因此以态度严苛闻名。他们以团队骰协调全队，把骰值用于强化盟友伤害、走位、先攻与围攻，一旦置身荒野便全力守护。',
    features: [
      {
        slug: 'trail-warden-spells', name: '荒径守护者法术', englishName: 'Trail Warden Spells', level: 3, kind: 'resource',
        summary: '3／5／9／13／17 级按荒径守护者法术表始终准备对应法术，不占准备数量。',
        description: '当你到达荒径守护者法术表中特定的游侠等级时，你就始终准备着表中对应的法术：3 级神梅术；5 级行动无踪；9 级灵体卫士；13 级信仰守卫；17 级群体疗伤术。这些法术由子职直接赋予，不计入你的准备法术数量。',
      },
      {
        slug: 'coordinated-tactics', name: '协同战术', englishName: 'Coordinated Tactics', level: 3, kind: 'resource',
        summary: '回合开始掷团队骰（d6 起随等级提升），可用于增伤或令盟友移动。',
        description: '团队骰（3 级 d6、11 级 d8、17 级 d10）决定本子职能力强度。你在自己的回合开始时投掷并保留到下一回合。协同打击：你能看见的另一名生物攻击命中时，可用反应把骰值加为该次伤害（类型相同）。协同战术：投骰后可让 60 尺内能看见你的自愿生物以反应移动骰值 5 倍或自身速度（取低者），且不引发借机攻击。',
      },
      {
        slug: 'lead-the-way', name: '引领前路', englishName: 'Lead the Way', level: 3, kind: 'passive',
        summary: '以专精技能检定成功时，可让 60 尺内生物在同类型检定上获得团队骰加值。',
        description: '当你使用具备专精的技能熟练项进行属性检定并成功时，你可以选择自身 60 尺范围内其他任意生物。直至你下一回合开始前，每个被选中的生物在进行同类型检定时，可获得一个等于你该回合团队骰掷出值的加值。',
      },
      {
        slug: 'tactical-assault', name: '战术突袭', englishName: 'Tactical Assault', level: 7, kind: 'passive',
        summary: '协同战术选中的盟友可额外选择守护策略（减伤）或侦察策略（隐匿加值）。',
        description: '当你使用协同战术选择盟友时，每个能看见或听见你的被选盟友可从以下增益中选择一项。守护策略：直至你下一回合开始前，该盟友首次受到伤害时可减免等同于你团队骰掷出值的伤害。侦察策略：该盟友使用反应移动时可将躲藏动作作为该反应的一部分，其敏捷（隐匿）检定获得等同于团队骰掷出值的加值。',
      },
      {
        slug: 'coordinated-effort', name: '协同奋战', englishName: 'Coordinated Effort', level: 11, kind: 'passive',
        summary: '先攻掷骰时若未失能，可掷团队骰并把结果加到你和 30 尺内盟友的先攻值上。',
        description: '若你进行先攻掷骰时未处于失能状态，你可以投掷团队骰；你和 30 尺范围内所有能看见或听见你的盟友，其先攻值均获得等同于该掷骰结果的加值。',
      },
      {
        slug: 'group-assault', name: '群体围攻', englishName: 'Group Assault', level: 15, kind: 'passive',
        summary: '攻击动作全部指向同一目标时，可让 60 尺内生物对其下次攻击与伤害获骰值加值。',
        description: '你能够协调盟友对强敌发起协同攻击：若你使用攻击动作且所有攻击均指向同一目标，你可以指定自身 60 尺范围内其他任意生物，每个被选中的生物针对该目标的下一次攻击检定及伤害掷骰，均可获得等同于你团队骰掷出值的加值。',
      },
    ],
  },

  // ============ 游荡者 rogue ============
  {
    slug: 'shadowstalker',
    classSlug: 'rogue',
    name: '暗影潜行者',
    englishName: 'Shadow Stalker',
    summary: '听见暗影低语、以献出过去的一部分换取内心充实的游荡者。他们驱使与自身同形的暗影映像完成侦察、换位与偷袭，消耗幽影尘埃施展各种暗影技艺，并在高等级让映像化为致命的复制体。',
    features: [
      {
        slug: 'shadowy-reflection', name: '暗影映像', englishName: 'Shadowy Reflection', level: 3, kind: 'action',
        summary: '魔法动作在 5 尺内唤出同体型的暗影映像，可代你操作物件并移动至多你的速度。',
        description: '你可以用魔法动作把影子驱离并操控，使它出现在你身边 5 尺内一个未占据空间，体型与你相同。映像能代你操控物件、开关未上锁的门与容器；后续回合你可用魔法动作或灵巧动作的附赠动作再次操控它，令其移动至多你速度的距离。影子不能攻击或激活魔法物品、承载不超过 10 磅，受到伤害、成为效果目标或你失能时即消失。',
      },
      {
        slug: 'shadow-motes', name: '幽影尘埃', englishName: 'Shadow Motes', level: 3, kind: 'resource',
        summary: '获得等于游荡者等级的幽影尘埃，可换取暗影斥候、暗影置换与扰目之影三种用法。',
        description: '幽影尘埃数量等于你的游荡者等级，用于三种用法。暗影斥候：魔法动作耗 1 点，借映像的感官视物聆听 1 分钟并令其远离至多 120 尺。暗影置换：灵巧动作的附赠动作中耗 1 点与映像换位。扰目之影：攻击命中且映像在目标 5 尺内时耗 1 点，获得仅对其有效的隐形至你下回合结束。尘埃长休后恢复，击倒敌人也可恢复 1 点。',
      },
      {
        slug: 'shadowed-succor', name: '暗影庇护', englishName: 'Shadowed Succor', level: 9, kind: 'reaction',
        summary: '使用直觉闪避时可把该次攻击的伤害降为 0；一经使用须长休才能再次使用。',
        description: '你可以通过编织暗影来拦截攻击，并将其无害地偏转至虚无之中：当你使用直觉闪避特性时，你可以将该次攻击对你造成的伤害降为 0。此特性一经使用，直至完成长休你都无法再次使用。',
      },
      {
        slug: 'shadow-gate', name: '暗影之门', englishName: 'Shadow Gate', level: 13, kind: 'bonus-action',
        summary: '映像在 5 尺内时，附赠动作消耗 4 枚幽影尘埃施展任意门，智力为施法属性。',
        description: '当你的暗影映像处于你 5 尺范围内时，你可以通过一个附赠动作消耗 4 枚幽影尘埃施展任意门，并以智力作为你施展该法术的施法属性；你的暗影映像也可以通过这道法术一同转移。',
      },
      {
        slug: 'true-shadow', name: '真实暗影', englishName: 'True Shadow', level: 17, kind: 'bonus-action',
        summary: '附赠动作让映像实体化为你的复制体 1 小时并可攻击；对映像附近目标攻击有优势。',
        description: '你可以用一个附赠动作让你的暗影映像变为你自身的完整镜像：映像实体化持续 1 小时，你操控它时还能令它执行攻击、躲藏或操作动作，其攻击动作使用你的游戏数据（含职业特性、专长与武器），生命值降至 0 时消散。此外，你攻击一名位于映像 5 尺范围内的生物时，该攻击检定具有优势。此特性一经使用须完成长休才能再次使用。',
      },
    ],
  },

  // ============ 牧师 cleric ============
  {
    slug: 'apocalypse',
    classSlug: 'cleric',
    name: '天启领域',
    englishName: 'Apocalypse Domain',
    summary: '拥抱万物终结的牧师领域，信徒多为被宗教团体逐出的叛教者与异端。他们从命运、毁灭之神或濒临灾难的群体所共有的阴霾中汲取力量，以领域法术、毁灭愿景与末日之歌一步步加速敌人的终局。',
    features: [
      {
        slug: 'apocalypse-domain-spells', name: '天启领域法术', englishName: 'Apocalypse Domain Spells', level: 3, kind: 'resource',
        summary: '3／5／7／9 级按天启领域法术表始终准备对应法术，不占准备数量。',
        description: '你与此神圣领域的链接使你始终准备着特定的法术：3 级炼狱叱喝、雷鸣波、黑暗术、魅影之力；5 级末日、恐惧术；7 级枯萎术、冰风暴；9 级防活物护罩、疫病虫群。到达天启领域法术表中特定的牧师等级即自动获得，且不计入你的准备法术数量。',
      },
      {
        slug: 'visions-of-annihilation', name: '毁灭愿景', englishName: 'Visions of Annihilation', level: 3, kind: 'bonus-action',
        summary: '附赠动作指定 120 尺内可见生物，对其攻击有优势至你下回合；次数＝感知调整值。',
        description: '你获得预见某个生物末日的能力：你可以用一个附赠动作，选择一名位于你 120 尺内、你能看见的生物。直至你下回合开始，对该生物进行的攻击检定具有优势。你可以使用此特性的次数等于你的感知调整值，完成长休后重获所有已消耗的次数。',
      },
      {
        slug: 'doom-song', name: '末日之歌', englishName: 'Doom Song', level: 3, kind: 'bonus-action',
        summary: '附赠动作消耗引导神力，令 120 尺内目标 10 分钟内 19／20 即重击。',
        description: '你可以使用你的引导神力来加速某个生物的末日：以一个附赠动作消耗一次引导神力次数，选择一名位于你 120 尺内、你能看见的生物；在接下来的 10 分钟内，对该生物进行的攻击检定在 d20 中掷出 19 或 20 时即可造成重击。',
      },
      {
        slug: 'all-will-be-dust', name: '万物终将归于尘土', englishName: 'All Will Be Dust', level: 6, kind: 'bonus-action',
        summary: '附赠动作消耗一次引导神力，令 120 尺内生物对抗你下次法术的豁免具有劣势。',
        description: '你可以使用你的引导神力来扭曲某个生物的命运：以一个附赠动作消耗一次引导神力次数，选择一名位于你 120 尺内、你能看见的生物；直至你的下个回合结束，该生物在对抗你法术所进行的下次豁免检定具有劣势。',
      },
      {
        slug: 'life-beyond-death', name: '死后余生', englishName: 'Life Beyond Death', level: 17, kind: 'reaction',
        summary: '你或 120 尺内盟友进行死亡豁免时，可耗法术位治疗其环阶 ×10 生命值。',
        description: '当你或你 120 尺内的一名盟友将要进行一次死亡豁免时，你可以消耗一个法术位（无需动作）来治疗该目标，治疗量等于所消耗法术位环阶 × 10 点生命值。',
      },
    ],
  },

  // ============ 野蛮人 barbarian ============
  {
    slug: 'antimagic',
    classSlug: 'barbarian',
    name: '蔑法道途',
    englishName: 'Path of the Spell Scorned',
    summary: '唤醒灵魂深处反魔法之力的野蛮人道途，成员包括受训保护法师与神职的保镖，以及以抗魔本事猎杀邪魔的斗士。狂暴期间他们以术法之锤加倍打击、以术法护盾为盟友提供对抗法术的加值。',
    features: [
      {
        slug: 'instinctual-divination', name: '直觉断卜', englishName: 'Instinctual Divination', level: 3, kind: 'passive',
        summary: '进行研究动作的智力（奥秘或宗教）检定时，可改为进行感知（求生）检定。',
        description: '你对这个世界的超自然现象有着直觉性的感知：当你执行研究动作进行智力（奥秘）或智力（宗教）检定时，你可以改为进行感知（求生）检定。',
      },
      {
        slug: 'spell-hammer', name: '术法之锤', englishName: 'Spell Hammer', level: 3, kind: 'passive',
        summary: '狂暴期间每回合一次，以力量攻击命中可造成两倍狂暴伤害加值，特定目标三倍。',
        description: '你的狂暴激活期间一回合一次，你能对你以基于力量的攻击检定命中的目标，造成两倍于你狂暴伤害加值的额外伤害。若目标具有传奇动作、能够施展法术或是被召唤的生物，你可以改为造成三倍狂暴伤害加值。',
      },
      {
        slug: 'spell-shield', name: '术法护盾', englishName: 'Spell Shield', level: 3, kind: 'passive',
        summary: '狂暴期间散发 30 尺灵光，你与灵光内盟友对抗法术的豁免获得狂暴伤害加值。',
        description: '你的身周将形成能够消耗法术的虚无空间：狂暴激活期间，你以自身 30 尺光环区域散发出消耗法术的灵光，你和身处灵光内的盟友在对抗法术的豁免检定上获得等于你狂暴伤害的加值。',
      },
      {
        slug: 'sunder-the-weave', name: '撕裂织网', englishName: 'Sunder the Weave', level: 6, kind: 'reaction',
        summary: '始终准备法术反制；狂暴期间可免法术位以力量施展，并可先移动再攻击目标。',
        description: '你始终准备着法术反制。狂暴激活期间，你能够以此特性无需法术位、且无需法术成分地施展该法术，并以力量作为施法属性；作为你施展此法术的反应的一部分，你能够移动至多等于你速度的距离，并以武器对法术目标发动一次攻击。一旦以此特性施展该法术，直至你完成一次短休或长休，你都无法再以此法施展法术反制。',
      },
      {
        slug: 'blstering-howl', name: '鼓舞怒嗥', englishName: 'Blstering Howl', level: 10, kind: 'reaction',
        summary: '你或能听见你的生物受伤时，以反应赋予其对该次伤害类型至回合结束的抗性。',
        description: '当你或另一名可以听见你的生物受到伤害时，你能够以反应赋予其对那次伤害的抗性；此外，目标获得对那个伤害类型的抗性，直至当前回合结束。',
      },
      {
        slug: 'dimensional-duel', name: '异次元决斗', englishName: 'Dimensional Duel', level: 14, kind: 'bonus-action',
        summary: '始终准备放逐术；狂暴中可附赠动作免法术位以力量施展，并可拉目标入半位面决斗。',
        description: '你始终准备着法术放逐术。你可在激活狂暴时或狂暴中以附赠动作，无需法术位与成分地施展它，以力量为施法属性，狂暴中可维持专注；此法可指定至多三名生物为目标。若你追踪被放逐者，目标不会失能，你与其旅行至一处各维度 30 到 200 尺（施展时选择）的空旷半位面房间。次数等于力量调整值（至少 1 次），长休恢复。',
      },
    ],
  },

  // ============ 魔契师 warlock ============
  {
    slug: 'cat-court',
    classSlug: 'warlock',
    name: '崇高猫猫庭',
    englishName: 'Exalted Assembly of the Feline Court',
    summary: '与由聪慧家猫组成的秘密审判庭缔约的魔契师。这些宗主来自不同位面与宇宙，靠魔法和秘计守护它们驯化人类数世纪的努力，并把猫咪法术、化猫形态与九条命赐给狡猾、勇敢又有礼貌的仆人。',
    features: [
      {
        slug: 'feline-spells', name: '猫咪法术', englishName: 'Feline Spells', level: 3, kind: 'resource',
        summary: '3／5／7／9 级按猫咪法术表始终准备对应法术，不占准备数量。',
        description: '宗主赐予的魔法使你始终准备着特定的法术：3 级猫之跃动、化兽为友、羽落术、动物交谈、猫之优雅、迷踪步；5 级加速术、幻影之豹；7 级行动自如、任意门；9 级猫猫大混乱、心灵遥控。到达猫咪法术表中特定的魔契师等级即自动获得，且不计入你的准备法术数量。',
      },
      {
        slug: 'feline-affiniy', name: '猫之宠爱', englishName: 'Feline Affiniy', level: 3, kind: 'passive',
        summary: '可无需法术位施展动物交谈，但以此法只能与猫咪进行口头交谈。',
        description: '你获得与世界的真正显贵交流的能力：你可以无需法术位地施展法术动物交谈。当你以此法施展该法术时，你只能与猫咪进行口头交谈，不过大多数猫咪不会愿意和你这样头脑简单的无趣家伙交流。',
      },
      {
        slug: 'feline-form', name: '猫之形态', englishName: 'Feline Form', level: 3, kind: 'bonus-action',
        summary: '附赠动作变形为微型猫，持续魔契师等级一半的小时数并保留人格与施法。',
        description: '宗主赐你怜悯：你可以用一个附赠动作变形为一只猫（微型野兽），持续小时数等于魔契师等级的一半（向下取整），再次使用或失能时提前结束。变形期间你保留人格、记忆与说话能力，数据卡被野兽替换但保留生物类型、生命值、生命骰、属性值、职业特性、语言与专长，且只能施展猫咪法术表上的法术。次数等于魅力调整值，长休恢复。',
      },
      {
        slug: 'vexing-distraction', name: '魂牵梦萦心难静', englishName: 'Vexing Distraction', level: 6, kind: 'bonus-action',
        summary: '猫形态下附赠动作令 5 尺内一生物感知豁免，失败则嗔怒、困扰或分心。',
        description: '猫形态下你能把最恼人的举止表现得可爱迷人：以一个附赠动作选择 5 尺内能看见或听见你的一名生物，它必须成功通过对抗你法术豁免 DC 的感知豁免，否则承受由你选择的一种效应直到你下个回合结束——嗔怒使其 D20 检定具有劣势，困扰使其速度降至 0，分心则令你指定的生物对其具有全身掩护。次数等于魅力调整值，长休恢复。',
      },
      {
        slug: 'nine-lives', name: '九命猫', englishName: 'Nine Lives', level: 10, kind: 'resource',
        summary: '获得九条命，可在死亡豁免与致死效应中消耗以换取生还；长休后全部恢复。',
        description: '你获得九条命，消耗方式如下：生命值为 0 时受伤，可耗 1 条命免除一次死亡豁免失败（重击须耗 2 条）；被迫死亡豁免时可耗 1 条命改为成功，或耗 5 条命把骰值改为 20；将因过量伤害被杀死时可耗 1 条命改为降至 0 生命值；被立即致死效应（如律令死亡）指定时可耗 9 条命忽视它。长休后重获全部命。',
      },
      {
        slug: 'summon-the-coutriers', name: '众臣归位', englishName: 'Summon the Coutriers', level: 14, kind: 'reaction',
        summary: '受到 60 尺内生物伤害时以反应召来幽灵猫群：5d10 力场伤害并令其目盲倒地。',
        description: '当你受到位于你 60 尺内的生物的伤害时，你能够以反应唤来猫猫庭的怒火：一大群嘶鸣的幽灵猫自异界天空浮现并向伤害你的生物俯冲而下，该生物受到 5d10 力场伤害，并陷入目盲与倒地状态直至你的下个回合结束。此特性一经使用，直至你完成长休都无法再次使用，你也可以消耗一枚契约法术位（无需动作）以重置该特性的使用权。',
      },
    ],
  },
]

const subclasses: readonly SubclassRule[] = seeds.map((seed) => {
  const id = `subclass-2024-tp-cbt-${seed.classSlug}-${seed.slug}`
  return {
    id,
    classId: `class-2024-${seed.classSlug}`,
    ruleset: '5e-2024',
    name: seed.name,
    englishName: seed.englishName,
    selectionLevel: 3,
    summary: seed.summary,
    status: 'selectable',
    availability: 'player',
    sourceIds: SOURCE_IDS,
    features: seed.features.map((feature): SubclassFeature => ({
      id: `tp-cbt-${seed.classSlug}-${seed.slug}-${feature.slug}`,
      subclassId: id,
      name: feature.name,
      englishName: feature.englishName,
      level: feature.level,
      summary: feature.summary,
      description: feature.description,
      kind: feature.kind,
      status: 'selectable',
      sourceIds: SOURCE_IDS,
    })),
  }
})

export const cthulhuTorchlightSubclasses2024: readonly SubclassRule[] = subclasses
