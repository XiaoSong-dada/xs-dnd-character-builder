import type { ClassRule } from '@/types/rules'
import { fighterRule2024 } from '@/rules/data/fighter-2024'
import { wizardRule2024 } from '@/rules/data/wizard-2024'

/** 2024 职业装配列表：按 B08 批次逐批追加。 */
export const classes2024: readonly ClassRule[] = [fighterRule2024, wizardRule2024]
