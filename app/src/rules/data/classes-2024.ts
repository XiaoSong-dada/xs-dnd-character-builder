import type { ClassRule } from '@/types/rules'
import { barbarianRule2024 } from '@/rules/data/barbarian-2024'
import { clericRule2024 } from '@/rules/data/cleric-2024'
import { druidRule2024 } from '@/rules/data/druid-2024'
import { fighterRule2024 } from '@/rules/data/fighter-2024'
import { monkRule2024 } from '@/rules/data/monk-2024'
import { rogueRule2024 } from '@/rules/data/rogue-2024'
import { wizardRule2024 } from '@/rules/data/wizard-2024'

/** 2024 职业装配列表：按 B08 批次逐批追加。 */
export const classes2024: readonly ClassRule[] = [barbarianRule2024, clericRule2024, druidRule2024, fighterRule2024, monkRule2024, rogueRule2024, wizardRule2024]
