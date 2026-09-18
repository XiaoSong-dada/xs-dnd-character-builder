import type { ClassRule } from '@/types/rules'
import { psionRule2024 } from '@/rules/data/psion-2024'
import { artificerRule2024 } from '@/rules/data/ua-artificer-2024'
import { barbarianRule2024 } from '@/rules/data/barbarian-2024'
import { bardRule2024 } from '@/rules/data/bard-2024'
import { clericRule2024 } from '@/rules/data/cleric-2024'
import { druidRule2024 } from '@/rules/data/druid-2024'
import { fighterRule2024 } from '@/rules/data/fighter-2024'
import { monkRule2024 } from '@/rules/data/monk-2024'
import { paladinRule2024 } from '@/rules/data/paladin-2024'
import { rangerRule2024 } from '@/rules/data/ranger-2024'
import { rogueRule2024 } from '@/rules/data/rogue-2024'
import { sorcererRule2024 } from '@/rules/data/sorcerer-2024'
import { warlockRule2024 } from '@/rules/data/warlock-2024'
import { wizardRule2024 } from '@/rules/data/wizard-2024'

/** 2024 职业装配列表：核心 12 职业 + 破解奥秘（UA）奇械师；按批次逐批追加。 */
export const classes2024: readonly ClassRule[] = [barbarianRule2024, bardRule2024, clericRule2024, druidRule2024, fighterRule2024, monkRule2024, paladinRule2024, rangerRule2024, rogueRule2024, sorcererRule2024, warlockRule2024, wizardRule2024, artificerRule2024, psionRule2024]
