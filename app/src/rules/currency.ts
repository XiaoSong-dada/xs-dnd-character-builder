import type { CurrencyWallet } from '@/types/character'

const VALUES = { cp: 1, sp: 10, ep: 50, gp: 100, pp: 1000 } as const

export function walletToCopper(wallet: Partial<CurrencyWallet>): number {
  return Math.round(Object.entries(VALUES).reduce((total, [key, value]) => total + (wallet[key as keyof CurrencyWallet] ?? 0) * value, 0))
}

export function copperToWallet(total: number): CurrencyWallet {
  let remaining = Math.max(0, Math.trunc(total))
  const pp = Math.floor(remaining / VALUES.pp); remaining %= VALUES.pp
  const gp = Math.floor(remaining / VALUES.gp); remaining %= VALUES.gp
  const ep = Math.floor(remaining / VALUES.ep); remaining %= VALUES.ep
  const sp = Math.floor(remaining / VALUES.sp); remaining %= VALUES.sp
  return { cp: remaining, sp, ep, gp, pp }
}

export function addCurrency(left: Partial<CurrencyWallet>, right: Partial<CurrencyWallet>): CurrencyWallet {
  return {
    cp: (left.cp ?? 0) + (right.cp ?? 0), sp: (left.sp ?? 0) + (right.sp ?? 0),
    ep: (left.ep ?? 0) + (right.ep ?? 0), gp: (left.gp ?? 0) + (right.gp ?? 0),
    pp: (left.pp ?? 0) + (right.pp ?? 0),
  }
}

export function subtractCurrency(wallet: Partial<CurrencyWallet>, priceCp: number): CurrencyWallet | undefined {
  const remaining = walletToCopper(wallet) - Math.max(0, Math.trunc(priceCp))
  return remaining < 0 ? undefined : copperToWallet(remaining)
}
