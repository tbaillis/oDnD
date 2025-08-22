export type SkillCheckFn = (dc: number, roll: number, bonus: number) => { total: number; dc: number; success: boolean }

export const passFail: SkillCheckFn = (dc, roll, bonus) => {
	const total = roll + bonus
	return { total, dc, success: total >= dc }
}

export interface TumbleDCOptions {
	accelerated?: boolean // moving more than half speed: SRD Accelerated Tumbling (we model as +10 DC)
	opponentsPassed?: number // number of distinct opponents you pass while tumbling past (first is free; +2 DC per additional)
	throughEnemySquare?: boolean // moving through an enemy square requires DC 25 baseline
	terrainModifier?: number // +2 lightly obstructed, +5 severely, etc.
}

export function computeTumbleDC(base: 15 | 25, opts?: TumbleDCOptions) {
	let dc = base
	if (opts?.accelerated) dc += 10
	if (opts?.opponentsPassed && opts.opponentsPassed > 1) dc += (opts.opponentsPassed - 1) * 2
	if (opts?.terrainModifier) dc += opts.terrainModifier
	return dc
}

export const skills = {
	version: 2,
	tumble: {
		dcAvoidAoO(opts?: Omit<TumbleDCOptions, 'throughEnemySquare'>) {
			return computeTumbleDC(15, opts)
		},
		dcThroughEnemy(opts?: Omit<TumbleDCOptions, 'throughEnemySquare'>) {
			return computeTumbleDC(25, opts)
		},
		check: passFail,
	},
}
