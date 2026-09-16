import type { WeaponMasteryRule } from '@/types/rules'

const sourceIds = ['source-2024-phb'] as const
const mastery = (id: WeaponMasteryRule['id'], name: string, englishName: string, summary: string, trigger: WeaponMasteryRule['trigger'], oncePerTurn = false): WeaponMasteryRule =>
  ({ id, ruleset: '5e-2024', name, englishName, summary, trigger, oncePerTurn, status: 'selectable', sourceIds })

export const weaponMasteries2024: readonly WeaponMasteryRule[] = [
  mastery('mastery-2024-cleave', '顺劈', 'Cleave', '近战命中后可攻击相邻第二目标；额外伤害不加正属性调整值。', 'hit', true),
  mastery('mastery-2024-graze', '擦伤', 'Graze', '武器攻击失手时造成攻击属性调整值的同类伤害。', 'miss'),
  mastery('mastery-2024-nick', '迅切', 'Nick', '把轻型武器的额外攻击并入攻击动作；每回合一次。', 'attack', true),
  mastery('mastery-2024-push', '推离', 'Push', '命中大型或更小目标时可将其推离至多 10 尺。', 'hit'),
  mastery('mastery-2024-sap', '削弱', 'Sap', '命中后令目标下一次攻击检定具有劣势。', 'hit'),
  mastery('mastery-2024-slow', '缓速', 'Slow', '命中并造成伤害后令目标速度降低 10 尺，不能由同词条叠加。', 'hit'),
  mastery('mastery-2024-topple', '失衡', 'Topple', '命中后可迫使目标进行体质豁免，失败倒地。', 'hit'),
  mastery('mastery-2024-vex', '侵扰', 'Vex', '命中并造成伤害后，对该目标的下一次攻击具有优势。', 'hit'),
]
