export type DurationUnit = 'rounds' | 'minutes' | 'hours'

export interface Duration { amount: number; unit: DurationUnit }

export function toRounds(d: Duration): number {
  const amt = d.amount <= 0 ? 0 : d.amount
  switch (d.unit) {
    case 'rounds': return amt
    case 'minutes': return amt * 10
    case 'hours': return amt * 600
  }
}

export const ROUND_SECONDS = 6
