export type RNG = () => number;

// mulberry32 PRNG for determinism with a 32-bit seed
export function mulberry32(seed: number): RNG {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function rollDie(rng: RNG, sides: number): number {
  if (sides <= 1) throw new Error('sides must be > 1');
  return 1 + Math.floor(rng() * sides);
}

export function d20(rng: RNG) { return rollDie(rng, 20); }
export function d100(rng: RNG) { return rollDie(rng, 100); }

// Non-SRD test helpers: advantage/disadvantage-like sampling
export function d20WithAdvantage(rng: RNG): number {
  const a = d20(rng)
  const b = d20(rng)
  return a > b ? a : b
}

export function d20WithDisadvantage(rng: RNG): number {
  const a = d20(rng)
  const b = d20(rng)
  return a < b ? a : b
}

// Session-scoped RNG: seeded once for the lifetime of the page
export const sessionRNG: RNG = (() => {
  let seed: number
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).getRandomValues === 'function') {
      const arr = new Uint32Array(1)
      ;(crypto as any).getRandomValues(arr)
      seed = arr[0]! >>> 0
    } else {
      seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0
    }
  } catch {
    seed = (Date.now() ^ 0x9e3779b9) >>> 0
  }
  return mulberry32(seed)
})()

export function seededRNG(seed: number): RNG { return mulberry32(seed >>> 0) }
