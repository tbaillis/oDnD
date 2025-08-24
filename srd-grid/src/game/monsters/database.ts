import type { MonsterData } from './types'

// Comprehensive D&D 3.5 SRD Monster Database - Complete Collection
export const MONSTER_DATABASE: MonsterData[] = [
  // ===== ABERRATIONS =====
  {
    id: 'aboleth',
    name: 'Aboleth',
    size: 'Huge',
    type: 'Aberration',
    subtype: ['Aquatic'],
    hitDice: '8d8+40',
    hitPoints: { average: 76, roll: '8d8+40' },
    initiative: 1,
    speed: { land: 10, swim: 60 },
    armorClass: {
      total: 16,
      touch: 9,
      flatFooted: 15,
      size: -2,
      dex: 1,
      natural: 7
    },
    baseAttack: 6,
    grapple: 22,
    attacks: [
      { name: 'Tentacle', attackBonus: 12, damage: '1d6+8', type: 'melee' }
    ],
    fullAttacks: [
      { name: '4 Tentacles', attackBonus: 12, damage: '1d6+8', type: 'melee' }
    ],
    space: '15 ft.',
    reach: '10 ft.',
    abilities: { STR: 26, DEX: 12, CON: 20, INT: 15, WIS: 17, CHA: 17 },
    saves: { fortitude: 7, reflex: 3, will: 11 },
    skills: { Concentration: 16, 'Knowledge (any one)': 13, Listen: 16, Spot: 16, Swim: 8 },
    feats: ['Alertness', 'Combat Casting', 'Iron Will'],
    specialAttacks: [
      { name: 'Enslave', type: 'Su', description: 'DC 17 Will save or dominated as by dominate person (CL 16th)' },
      { name: 'Psionics', type: 'Sp', description: 'At will—hypnotic pattern (DC 15), illusory wall (DC 17), various illusion spells' },
      { name: 'Slime', type: 'Ex', description: 'Tentacle hit causes transformation (DC 19 Fort save)' }
    ],
    specialQualities: [
      { name: 'Aquatic subtype', type: 'Ex', description: 'Breathes water, +8 swim checks' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Mucus Cloud', type: 'Ex', description: 'Underwater cloud prevents air breathing (DC 19 Fort save)' }
    ],
    challengeRating: 7,
    environment: 'Underground',
    organization: 'Solitary, brood (2-4), or slaver brood (1d3+1 plus 7-12 skum)',
    treasure: 'Double standard',
    alignment: 'Lawful Evil'
  },

  {
    id: 'owlbear',
    name: 'Owlbear',
    size: 'Large',
    type: 'Magical Beast',
    hitDice: '5d10+25',
    hitPoints: { average: 52, roll: '5d10+25' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 10,
      flatFooted: 14,
      size: -1,
      dex: 1,
      natural: 5
    },
    baseAttack: 5,
    grapple: 16,
    attacks: [
      { name: 'Claw', attackBonus: 11, damage: '1d6+7', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Claws', attackBonus: 11, damage: '1d6+7', type: 'melee' },
      { name: 'Bite', attackBonus: 6, damage: '1d8+3', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 25, DEX: 12, CON: 21, INT: 2, WIS: 12, CHA: 10 },
    saves: { fortitude: 9, reflex: 5, will: 2 },
    skills: { Listen: 6, Spot: 6 },
    feats: ['Alertness', 'Track'],
    specialAttacks: [
      { name: 'Improved Grab', type: 'Ex', description: 'Can grapple as a free action if claw attack hits' }
    ],
    specialQualities: [
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies, sniff out hidden foes, and track by sense of smell' }
    ],
    challengeRating: 4,
    environment: 'Temperate forests',
    organization: 'Solitary, pair, or pack (3-8)',
    treasure: 'Standard',
    alignment: 'Chaotic Neutral'
  },

  // ===== HUMANOIDS =====
  {
    id: 'goblin',
    name: 'Goblin',
    size: 'Small',
    type: 'Humanoid',
    subtype: ['Goblinoid'],
    hitDice: '1d8+1',
    hitPoints: { average: 5, roll: '1d8+1' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 12,
      flatFooted: 14,
      size: 1,
      dex: 1,
      natural: 0,
      armor: 2,
      shield: 1
    },
    baseAttack: 1,
    grapple: -3,
    attacks: [
      { name: 'Morningstar', attackBonus: 2, damage: '1d6', type: 'melee' },
      { name: 'Javelin', attackBonus: 3, damage: '1d4', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 11, DEX: 13, CON: 12, INT: 10, WIS: 9, CHA: 6 },
    saves: { fortitude: 3, reflex: 1, will: -1 },
    skills: { Hide: 5, Listen: 2, 'Move Silently': 5, Ride: 4, Spot: 2 },
    feats: ['Alertness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' }
    ],
    challengeRating: '1/3',
    environment: 'Temperate plains',
    organization: 'Gang (4-9), band (10-100 plus 100% noncombatants), or tribe (40-400)',
    treasure: 'Standard',
    alignment: 'Neutral Evil',
    advancement: 'By character class',
    levelAdjustment: '+0'
  },

  {
    id: 'hobgoblin',
    name: 'Hobgoblin',
    size: 'Medium',
    type: 'Humanoid',
    subtype: ['Goblinoid'],
    hitDice: '1d8+1',
    hitPoints: { average: 5, roll: '1d8+1' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 11,
      flatFooted: 14,
      size: 0,
      dex: 1,
      natural: 0,
      armor: 3,
      shield: 1
    },
    baseAttack: 1,
    grapple: 2,
    attacks: [
      { name: 'Longsword', attackBonus: 2, damage: '1d8+1', type: 'melee' },
      { name: 'Javelin', attackBonus: 2, damage: '1d6+1', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 13, DEX: 13, CON: 12, INT: 10, WIS: 10, CHA: 9 },
    saves: { fortitude: 3, reflex: 1, will: 0 },
    skills: { Hide: 3, Listen: 2, 'Move Silently': 3, Spot: 2 },
    feats: ['Alertness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' }
    ],
    challengeRating: '1/2',
    environment: 'Temperate hills',
    organization: 'Gang (4-9), band (10-100 plus 100% noncombatants plus 1 3rd-level sergeant and 1 leader of 4th-6th level), warband (10-24 plus worg mounts), or tribe (30-300)',
    treasure: 'Standard',
    alignment: 'Lawful Evil'
  },

  {
    id: 'orc',
    name: 'Orc',
    size: 'Medium',
    type: 'Humanoid',
    subtype: ['Orc'],
    hitDice: '1d8+1',
    hitPoints: { average: 5, roll: '1d8+1' },
    initiative: 0,
    speed: { land: 30 },
    armorClass: {
      total: 13,
      touch: 10,
      flatFooted: 13,
      size: 0,
      dex: 0,
      natural: 0,
      armor: 3
    },
    baseAttack: 1,
    grapple: 4,
    attacks: [
      { name: 'Falchion', attackBonus: 4, damage: '2d4+4', type: 'melee' },
      { name: 'Javelin', attackBonus: 1, damage: '1d6+3', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 17, DEX: 11, CON: 12, INT: 8, WIS: 10, CHA: 8 },
    saves: { fortitude: 3, reflex: 0, will: -1 },
    skills: { Listen: 3, Spot: 3 },
    feats: ['Alertness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Light Sensitivity', type: 'Ex', description: '-1 penalty on attack rolls in bright sunlight' }
    ],
    challengeRating: '1/2',
    environment: 'Temperate hills',
    organization: 'Gang (2-4), squad (11-20 plus 2 3rd-level sergeants and 1 leader of 3rd-6th level), or band (30-100)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil',
    advancement: 'By character class',
    levelAdjustment: '+0'
  },

  {
    id: 'kobold',
    name: 'Kobold',
    size: 'Small',
    type: 'Humanoid',
    subtype: ['Reptilian'],
    hitDice: '1d8',
    hitPoints: { average: 4, roll: '1d8' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 12,
      flatFooted: 14,
      size: 1,
      dex: 1,
      natural: 1,
      armor: 2
    },
    baseAttack: 1,
    grapple: -4,
    attacks: [
      { name: 'Spear', attackBonus: 1, damage: '1d6-1', type: 'melee' },
      { name: 'Sling', attackBonus: 3, damage: '1d3-1', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 9, DEX: 13, CON: 10, INT: 10, WIS: 9, CHA: 8 },
    saves: { fortitude: 2, reflex: 1, will: -1 },
    skills: { Craft: 2, Hide: 6, Listen: 2, 'Move Silently': 2, 'Profession (miner)': 2, Search: 3, Spot: 2 },
    feats: ['Alertness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Light Sensitivity', type: 'Ex', description: '-1 penalty on attack rolls in bright sunlight' }
    ],
    challengeRating: '1/4',
    environment: 'Temperate underground',
    organization: 'Gang (4-9), warband (10-100 plus 100% noncombatants plus 1 3rd-level sergeant per 20 adults and 1 leader of 4th-6th level), or tribe (40-400 plus 100% noncombatants)',
    treasure: 'Standard',
    alignment: 'Lawful Evil',
    advancement: 'By character class',
    levelAdjustment: '+0'
  },

  {
    id: 'gnoll',
    name: 'Gnoll',
    size: 'Medium',
    type: 'Humanoid',
    subtype: ['Gnoll'],
    hitDice: '2d8+2',
    hitPoints: { average: 11, roll: '2d8+2' },
    initiative: 0,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 10,
      flatFooted: 15,
      size: 0,
      dex: 0,
      natural: 1,
      armor: 4
    },
    baseAttack: 1,
    grapple: 3,
    attacks: [
      { name: 'Battleaxe', attackBonus: 3, damage: '1d8+2', type: 'melee' },
      { name: 'Shortbow', attackBonus: 1, damage: '1d6', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 15, DEX: 10, CON: 13, INT: 8, WIS: 11, CHA: 8 },
    saves: { fortitude: 4, reflex: 0, will: 0 },
    skills: { Listen: 2, Spot: 3 },
    feats: ['Power Attack'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' }
    ],
    challengeRating: 1,
    environment: 'Warm plains',
    organization: 'Solitary, pair, gang (3-5), band (10-100 plus 50% noncombatants plus 1 3rd-level sergeant per 20 adults and 1 leader of 4th-6th level), or tribe (20-200 plus 1 3rd-level sergeant per 20 adults, 1 or 2 lieutenants of 4th or 5th level, 1 leader of 6th-8th level, and 1-4 brown bears)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'bugbear',
    name: 'Bugbear',
    size: 'Medium',
    type: 'Humanoid',
    subtype: ['Goblinoid'],
    hitDice: '3d8+3',
    hitPoints: { average: 16, roll: '3d8+3' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 17,
      touch: 11,
      flatFooted: 16,
      size: 0,
      dex: 1,
      natural: 3,
      armor: 3
    },
    baseAttack: 2,
    grapple: 4,
    attacks: [
      { name: 'Morningstar', attackBonus: 5, damage: '1d8+2', type: 'melee' },
      { name: 'Javelin', attackBonus: 3, damage: '1d6+2', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 15, DEX: 12, CON: 13, INT: 10, WIS: 10, CHA: 9 },
    saves: { fortitude: 4, reflex: 2, will: 1 },
    skills: { Climb: 3, Hide: 4, Listen: 4, 'Move Silently': 6, Spot: 4 },
    feats: ['Alertness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies, sniff out hidden foes, and track by sense of smell' }
    ],
    challengeRating: 2,
    environment: 'Temperate mountains',
    organization: 'Solitary, pair, gang (3-5), or band (6-15)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  // ===== GIANTS =====
  {
    id: 'ogre',
    name: 'Ogre',
    size: 'Large',
    type: 'Giant',
    hitDice: '4d8+8',
    hitPoints: { average: 26, roll: '4d8+8' },
    initiative: -1,
    speed: { land: 30 },
    armorClass: {
      total: 16,
      touch: 8,
      flatFooted: 16,
      size: -1,
      dex: -1,
      natural: 5,
      armor: 3
    },
    baseAttack: 3,
    grapple: 12,
    attacks: [
      { name: 'Greatclub', attackBonus: 8, damage: '2d8+7', type: 'melee' },
      { name: 'Javelin', attackBonus: 1, damage: '1d8+5', type: 'ranged' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 21, DEX: 8, CON: 15, INT: 6, WIS: 10, CHA: 7 },
    saves: { fortitude: 6, reflex: 0, will: 1 },
    skills: { Climb: 5, Listen: 2, Spot: 2 },
    feats: ['Weapon Focus (greatclub)'],
    specialAttacks: [],
    specialQualities: [],
    challengeRating: 3,
    environment: 'Temperate hills',
    organization: 'Solitary, pair, gang (3-4), or band (5-8)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'troll',
    name: 'Troll',
    size: 'Large',
    type: 'Giant',
    hitDice: '6d8+36',
    hitPoints: { average: 63, roll: '6d8+36' },
    initiative: 2,
    speed: { land: 30 },
    armorClass: {
      total: 16,
      touch: 11,
      flatFooted: 14,
      size: -1,
      dex: 2,
      natural: 5
    },
    baseAttack: 4,
    grapple: 14,
    attacks: [
      { name: 'Claw', attackBonus: 9, damage: '1d6+6', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Claws', attackBonus: 9, damage: '1d6+6', type: 'melee' },
      { name: 'Bite', attackBonus: 4, damage: '1d6+3', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 23, DEX: 14, CON: 23, INT: 6, WIS: 9, CHA: 6 },
    saves: { fortitude: 11, reflex: 4, will: 3 },
    skills: { Listen: 6, Spot: 6 },
    feats: ['Alertness', 'Iron Will', 'Track'],
    specialAttacks: [
      { name: 'Rend', type: 'Ex', description: 'If both claw attacks hit, deals additional 2d6+9 damage' }
    ],
    specialQualities: [
      { name: 'Regeneration', type: 'Ex', description: 'Regenerates 5 hp per round. Fire and acid deal normal damage' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies, sniff out hidden foes, and track by sense of smell' }
    ],
    challengeRating: 5,
    environment: 'Cold mountains',
    organization: 'Solitary or gang (2-4)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil',
    vulnerability: ['fire', 'acid']
  },

  // ===== UNDEAD =====
  {
    id: 'skeleton',
    name: 'Human Skeleton',
    size: 'Medium',
    type: 'Undead',
    hitDice: '1d12',
    hitPoints: { average: 6, roll: '1d12' },
    initiative: 5,
    speed: { land: 30 },
    armorClass: {
      total: 13,
      touch: 11,
      flatFooted: 12,
      size: 0,
      dex: 1,
      natural: 2
    },
    baseAttack: 0,
    grapple: 1,
    attacks: [
      { name: 'Claw', attackBonus: 1, damage: '1d4+1', type: 'melee' },
      { name: 'Scimitar', attackBonus: 1, damage: '1d6+1', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 13, DEX: 13, CON: 0, INT: 0, WIS: 10, CHA: 1 },
    saves: { fortitude: 0, reflex: 1, will: 2 },
    skills: {},
    feats: ['Improved Initiative'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Undead Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, sleep, paralysis, stunning, disease, death effects, and necromantic effects' },
      { name: 'Damage Reduction', type: 'Ex', description: 'DR 5/bludgeoning' }
    ],
    challengeRating: '1/3',
    environment: 'Any',
    organization: 'Any',
    treasure: 'None',
    alignment: 'Neutral Evil',
    damageReduction: { amount: 5, bypass: 'bludgeoning' },
    damageImmunity: ['mind-affecting', 'poison', 'sleep', 'paralysis', 'stunning', 'disease', 'death effects', 'necromantic effects']
  },

  {
    id: 'zombie',
    name: 'Human Zombie',
    size: 'Medium',
    type: 'Undead',
    hitDice: '2d12+3',
    hitPoints: { average: 16, roll: '2d12+3' },
    initiative: -1,
    speed: { land: 30 },
    armorClass: {
      total: 11,
      touch: 9,
      flatFooted: 11,
      size: 0,
      dex: -1,
      natural: 2
    },
    baseAttack: 1,
    grapple: 3,
    attacks: [
      { name: 'Slam', attackBonus: 3, damage: '1d6+3', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 15, DEX: 8, CON: 0, INT: 0, WIS: 10, CHA: 1 },
    saves: { fortitude: 0, reflex: -1, will: 3 },
    skills: {},
    feats: ['Toughness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Undead Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, sleep, paralysis, stunning, disease, death effects, and necromantic effects' },
      { name: 'Single Actions Only', type: 'Ex', description: 'Can only perform a single move or attack action each round' },
      { name: 'Partial Actions Only', type: 'Ex', description: 'Can only take partial actions' }
    ],
    challengeRating: '1/2',
    environment: 'Any',
    organization: 'Any',
    treasure: 'None',
    alignment: 'Neutral Evil',
    damageImmunity: ['mind-affecting', 'poison', 'sleep', 'paralysis', 'stunning', 'disease', 'death effects', 'necromantic effects']
  },

  {
    id: 'ghoul',
    name: 'Ghoul',
    size: 'Medium',
    type: 'Undead',
    hitDice: '2d12',
    hitPoints: { average: 13, roll: '2d12' },
    initiative: 2,
    speed: { land: 30 },
    armorClass: {
      total: 14,
      touch: 12,
      flatFooted: 12,
      size: 0,
      dex: 2,
      natural: 2
    },
    baseAttack: 1,
    grapple: 2,
    attacks: [
      { name: 'Bite', attackBonus: 2, damage: '1d6+1', type: 'melee' },
      { name: 'Claw', attackBonus: 0, damage: '1d3', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 2, damage: '1d6+1', type: 'melee' },
      { name: '2 Claws', attackBonus: 0, damage: '1d3', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 13, DEX: 15, CON: 0, INT: 13, WIS: 14, CHA: 12 },
    saves: { fortitude: 0, reflex: 2, will: 5 },
    skills: { Balance: 6, Climb: 5, Hide: 7, Jump: 5, 'Move Silently': 7, Spot: 7 },
    feats: ['Multiattack'],
    specialAttacks: [
      { name: 'Paralysis', type: 'Ex', description: 'DC 12 Fort save or paralyzed for 1d4+1 rounds' },
      { name: 'Ghoul Fever', type: 'Su', description: 'DC 12 Fort save or contract ghoul fever disease' }
    ],
    specialQualities: [
      { name: 'Undead Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, sleep, paralysis, stunning, disease, death effects, and necromantic effects' },
      { name: 'Turn Resistance', type: 'Ex', description: '+2 turn resistance' }
    ],
    challengeRating: 1,
    environment: 'Any',
    organization: 'Solitary, gang (2-4), or pack (7-12)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'wight',
    name: 'Wight',
    size: 'Medium',
    type: 'Undead',
    subtype: ['Incorporeal'],
    hitDice: '4d12',
    hitPoints: { average: 26, roll: '4d12' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 13,
      flatFooted: 14,
      size: 0,
      dex: 1,
      natural: 4
    },
    baseAttack: 2,
    grapple: 3,
    attacks: [
      { name: 'Slam', attackBonus: 3, damage: '1d4+1', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 12, DEX: 12, CON: 0, INT: 11, WIS: 13, CHA: 15 },
    saves: { fortitude: 1, reflex: 2, will: 5 },
    skills: { Hide: 8, Listen: 7, 'Move Silently': 16, Spot: 8 },
    feats: ['Alertness', 'Blind-Fight'],
    specialAttacks: [
      { name: 'Energy Drain', type: 'Su', description: 'Living creature hit by slam attack gains one negative level' },
      { name: 'Create Spawn', type: 'Su', description: 'Humanoid slain by energy drain rises as wight in 1d4 rounds' }
    ],
    specialQualities: [
      { name: 'Undead Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, sleep, paralysis, stunning, disease, death effects, and necromantic effects' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' }
    ],
    challengeRating: 3,
    environment: 'Any',
    organization: 'Solitary, pair, gang (3-5), or pack (6-11)',
    treasure: 'None',
    alignment: 'Lawful Evil'
  },

  // ===== MONSTROUS HUMANOIDS =====
  {
    id: 'minotaur',
    name: 'Minotaur',
    size: 'Large',
    type: 'Monstrous Humanoid',
    hitDice: '6d8+12',
    hitPoints: { average: 39, roll: '6d8+12' },
    initiative: 0,
    speed: { land: 30 },
    armorClass: {
      total: 14,
      touch: 9,
      flatFooted: 14,
      size: -1,
      dex: 0,
      natural: 5
    },
    baseAttack: 6,
    grapple: 14,
    attacks: [
      { name: 'Greataxe', attackBonus: 9, damage: '3d6+6', type: 'melee' },
      { name: 'Gore', attackBonus: 4, damage: '1d8+2', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Greataxe', attackBonus: 9, damage: '3d6+6', type: 'melee' },
      { name: 'Gore', attackBonus: 4, damage: '1d8+2', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 19, DEX: 10, CON: 15, INT: 7, WIS: 10, CHA: 8 },
    saves: { fortitude: 4, reflex: 5, will: 6 },
    skills: { Intimidate: 4, Jump: 8, Listen: 7, Search: 7, Spot: 7 },
    feats: ['Great Fortitude', 'Power Attack', 'Track'],
    specialAttacks: [
      { name: 'Powerful Charge', type: 'Ex', description: 'When charging, gore attack deals 4d6+6 damage' }
    ],
    specialQualities: [
      { name: 'Natural Cunning', type: 'Ex', description: 'Never becomes lost and can track enemies' }
    ],
    challengeRating: 4,
    environment: 'Underground',
    organization: 'Solitary, pair, or gang (3-4)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'harpy',
    name: 'Harpy',
    size: 'Medium',
    type: 'Monstrous Humanoid',
    hitDice: '7d8+7',
    hitPoints: { average: 38, roll: '7d8+7' },
    initiative: 2,
    speed: { land: 20, fly: 80 },
    armorClass: {
      total: 13,
      touch: 12,
      flatFooted: 11,
      size: 0,
      dex: 2,
      natural: 1
    },
    baseAttack: 7,
    grapple: 7,
    attacks: [
      { name: 'Morningstar', attackBonus: 7, damage: '1d8', type: 'melee' },
      { name: 'Javelin', attackBonus: 9, damage: '1d6', type: 'ranged' }
    ],
    fullAttacks: [
      { name: 'Morningstar', attackBonus: 7, damage: '1d8', type: 'melee' },
      { name: 'Javelin', attackBonus: 9, damage: '1d6', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 10, DEX: 15, CON: 12, INT: 7, WIS: 14, CHA: 17 },
    saves: { fortitude: 3, reflex: 7, will: 7 },
    skills: { Bluff: 7, Intimidate: 5, Listen: 8, Perform: 7, Spot: 4 },
    feats: ['Dodge', 'Flyby Attack', 'Persuasive'],
    specialAttacks: [
      { name: 'Captivating Song', type: 'Su', description: 'All creatures within 300 feet must make DC 16 Will save or become captivated' }
    ],
    specialQualities: [],
    challengeRating: 4,
    environment: 'Temperate marshes',
    organization: 'Solitary, pair, or flight (7-12)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  // ===== ANIMALS =====
  {
    id: 'dire-wolf',
    name: 'Dire Wolf',
    size: 'Large',
    type: 'Animal',
    hitDice: '6d8+18',
    hitPoints: { average: 45, roll: '6d8+18' },
    initiative: 2,
    speed: { land: 50 },
    armorClass: {
      total: 14,
      touch: 11,
      flatFooted: 12,
      size: -1,
      dex: 2,
      natural: 3
    },
    baseAttack: 4,
    grapple: 15,
    attacks: [
      { name: 'Bite', attackBonus: 11, damage: '1d8+10', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 25, DEX: 15, CON: 17, INT: 2, WIS: 12, CHA: 10 },
    saves: { fortitude: 8, reflex: 7, will: 3 },
    skills: { Hide: 2, Listen: 7, 'Move Silently': 4, Spot: 7, Survival: 2 },
    feats: ['Alertness', 'Run', 'Track'],
    specialAttacks: [
      { name: 'Trip', type: 'Ex', description: 'If bite attack hits, can attempt to trip as a free action without provoking AoO' }
    ],
    specialQualities: [
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies, sniff out hidden foes, and track by sense of smell' }
    ],
    challengeRating: 3,
    environment: 'Temperate forests',
    organization: 'Solitary or pack (5-8)',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  {
    id: 'brown-bear',
    name: 'Brown Bear',
    size: 'Large',
    type: 'Animal',
    hitDice: '6d8+24',
    hitPoints: { average: 51, roll: '6d8+24' },
    initiative: 1,
    speed: { land: 40 },
    armorClass: {
      total: 15,
      touch: 10,
      flatFooted: 14,
      size: -1,
      dex: 1,
      natural: 5
    },
    baseAttack: 4,
    grapple: 15,
    attacks: [
      { name: 'Claw', attackBonus: 11, damage: '1d8+7', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Claws', attackBonus: 11, damage: '1d8+7', type: 'melee' },
      { name: 'Bite', attackBonus: 6, damage: '2d6+3', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 25, DEX: 13, CON: 19, INT: 2, WIS: 12, CHA: 6 },
    saves: { fortitude: 9, reflex: 6, will: 3 },
    skills: { Listen: 6, Spot: 6, Swim: 9 },
    feats: ['Endurance', 'Run'],
    specialAttacks: [
      { name: 'Improved Grab', type: 'Ex', description: 'Can grapple as a free action if both claw attacks hit' }
    ],
    specialQualities: [
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies, sniff out hidden foes, and track by sense of smell' }
    ],
    challengeRating: 4,
    environment: 'Cold forests',
    organization: 'Solitary or pair',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  // ===== DRAGONS =====
  {
    id: 'young-red-dragon',
    name: 'Young Red Dragon',
    size: 'Large',
    type: 'Dragon',
    subtype: ['Fire'],
    hitDice: '13d12+39',
    hitPoints: { average: 123, roll: '13d12+39' },
    initiative: 4,
    speed: { land: 40, fly: 150 },
    armorClass: {
      total: 21,
      touch: 9,
      flatFooted: 21,
      size: -1,
      dex: 0,
      natural: 12
    },
    baseAttack: 13,
    grapple: 22,
    attacks: [
      { name: 'Bite', attackBonus: 18, damage: '2d6+5', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 18, damage: '2d6+5', type: 'melee' },
      { name: '2 Claws', attackBonus: 16, damage: '1d8+2', type: 'melee' },
      { name: '2 Wings', attackBonus: 16, damage: '1d6+2', type: 'melee' },
      { name: 'Tail Slap', attackBonus: 16, damage: '1d8+7', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft. (10 ft. with bite)',
    abilities: { STR: 21, DEX: 10, CON: 17, INT: 14, WIS: 15, CHA: 14 },
    saves: { fortitude: 11, reflex: 8, will: 10 },
    skills: { Bluff: 13, Concentration: 14, Diplomacy: 4, 'Gather Information': 4, Intimidate: 16, Jump: 13, Knowledge: 8, Listen: 15, Search: 13, 'Sense Motive': 13, Spot: 15 },
    feats: ['Cleave', 'Improved Initiative', 'Power Attack', 'Weapon Focus (bite)', 'Weapon Focus (claw)'],
    specialAttacks: [
      { name: 'Breath Weapon', type: 'Su', description: '40-ft. cone of fire, damage 6d10, Reflex DC 19 half' },
      { name: 'Frightful Presence', type: 'Ex', description: 'Creatures within 150 feet with 12 HD or less make Will DC 18 or become frightened' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 120 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Immunity to fire', type: 'Ex', description: 'Immune to all fire damage' },
      { name: 'Vulnerability to cold', type: 'Ex', description: 'Takes +50% damage from cold' },
      { name: 'Blindsense', type: 'Ex', description: 'Blindsense 60 ft.' },
      { name: 'Keen Senses', type: 'Ex', description: 'See four times as far as humans' }
    ],
    challengeRating: 7,
    environment: 'Warm mountains',
    organization: 'Solitary or clutch (2-5)',
    treasure: 'Triple standard',
    alignment: 'Chaotic Evil',
    spellResistance: 18,
    damageReduction: { amount: 5, bypass: 'magic' }
  },

  // ===== CONSTRUCTS =====
  {
    id: 'stone-golem',
    name: 'Stone Golem',
    size: 'Large',
    type: 'Construct',
    hitDice: '14d10+30',
    hitPoints: { average: 107, roll: '14d10+30' },
    initiative: -1,
    speed: { land: 20 },
    armorClass: {
      total: 26,
      touch: 8,
      flatFooted: 26,
      size: -1,
      dex: -1,
      natural: 18
    },
    baseAttack: 10,
    grapple: 22,
    attacks: [
      { name: 'Slam', attackBonus: 18, damage: '2d10+8', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Slams', attackBonus: 18, damage: '2d10+8', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 27, DEX: 9, CON: 0, INT: 0, WIS: 11, CHA: 1 },
    saves: { fortitude: 4, reflex: 3, will: 4 },
    skills: {},
    feats: [],
    specialAttacks: [
      { name: 'Slow', type: 'Su', description: '10-ft. radius, Will DC 17 or affected by slow spell for 2d6 rounds' }
    ],
    specialQualities: [
      { name: 'Construct Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, disease, and similar effects' },
      { name: 'Damage Reduction', type: 'Ex', description: 'DR 10/adamantine' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Magic Immunity', type: 'Ex', description: 'Immune to most spells and spell-like abilities' }
    ],
    challengeRating: 11,
    environment: 'Any',
    organization: 'Solitary or gang (2-4)',
    treasure: 'None',
    alignment: 'True Neutral',
    damageReduction: { amount: 10, bypass: 'adamantine' },
    damageImmunity: ['magic'],
    spellResistance: 0
  },

  // ===== ELEMENTALS =====
  {
    id: 'large-fire-elemental',
    name: 'Large Fire Elemental',
    size: 'Large',
    type: 'Elemental',
    subtype: ['Fire', 'Extraplanar'],
    hitDice: '8d8+24',
    hitPoints: { average: 60, roll: '8d8+24' },
    initiative: 11,
    speed: { land: 50 },
    armorClass: {
      total: 18,
      touch: 16,
      flatFooted: 11,
      size: -1,
      dex: 7,
      natural: 2
    },
    baseAttack: 6,
    grapple: 14,
    attacks: [
      { name: 'Slam', attackBonus: 12, damage: '2d6+4', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Slams', attackBonus: 12, damage: '2d6+4', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 18, DEX: 25, CON: 16, INT: 6, WIS: 11, CHA: 11 },
    saves: { fortitude: 9, reflex: 13, will: 2 },
    skills: { Listen: 7, Spot: 8 },
    feats: ['Combat Reflexes', 'Dodge', 'Improved Initiative', 'Mobility', 'Spring Attack', 'Weapon Finesse'],
    specialAttacks: [
      { name: 'Burn', type: 'Ex', description: 'DC 17 Reflex save or catch fire for 1d4 rounds' }
    ],
    specialQualities: [
      { name: 'Elemental Traits', type: 'Ex', description: 'Immune to poison, sleep, paralysis, and stunning' },
      { name: 'Fire Subtype', type: 'Ex', description: 'Immune to fire damage, vulnerable to cold' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' }
    ],
    challengeRating: 5,
    environment: 'Elemental Plane of Fire',
    organization: 'Solitary',
    treasure: 'None',
    alignment: 'True Neutral',
    damageImmunity: ['fire'],
    vulnerability: ['cold']
  },

  // ===== FEY =====
  {
    id: 'dryad',
    name: 'Dryad',
    size: 'Medium',
    type: 'Fey',
    hitDice: '4d6+4',
    hitPoints: { average: 18, roll: '4d6+4' },
    initiative: 4,
    speed: { land: 30 },
    armorClass: {
      total: 17,
      touch: 14,
      flatFooted: 13,
      size: 0,
      dex: 4,
      natural: 3
    },
    baseAttack: 2,
    grapple: 2,
    attacks: [
      { name: 'Dagger', attackBonus: 6, damage: '1d4', type: 'melee' },
      { name: 'Masterwork longbow', attackBonus: 7, damage: '1d8', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 10, DEX: 19, CON: 13, INT: 14, WIS: 15, CHA: 18 },
    saves: { fortitude: 2, reflex: 8, will: 6 },
    skills: { Escape: 11, Handle: 11, Hide: 11, Knowledge: 9, Listen: 11, 'Move Silently': 11, Spot: 9, Survival: 9 },
    feats: ['Great Fortitude', 'Weapon Finesse'],
    specialAttacks: [
      { name: 'Spell-like Abilities', type: 'Sp', description: 'At will—entangle, speak with plants, tree shape. 3/day—charm person (DC 15), deep slumber (DC 16), tree stride' }
    ],
    specialQualities: [
      { name: 'Tree Dependent', type: 'Su', description: 'Dies if oak tree is destroyed, cannot travel more than 300 yards from tree' },
      { name: 'Wild Empathy', type: 'Ex', description: 'Can improve attitude of animals as druid of 4th level' }
    ],
    challengeRating: 3,
    environment: 'Temperate forests',
    organization: 'Solitary',
    treasure: 'Standard',
    alignment: 'Chaotic Good',
    spellResistance: 17
  },

  // ===== OUTSIDERS =====
  {
    id: 'bearded-devil',
    name: 'Bearded Devil (Barbazu)',
    size: 'Medium',
    type: 'Outsider',
    subtype: ['Evil', 'Extraplanar', 'Lawful'],
    hitDice: '6d8+18',
    hitPoints: { average: 45, roll: '6d8+18' },
    initiative: 6,
    speed: { land: 40 },
    armorClass: {
      total: 19,
      touch: 12,
      flatFooted: 17,
      size: 0,
      dex: 2,
      natural: 7
    },
    baseAttack: 6,
    grapple: 11,
    attacks: [
      { name: 'Glaive', attackBonus: 11, damage: '1d10+7', type: 'melee' },
      { name: 'Beard', attackBonus: 6, damage: '1d8+2', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Glaive', attackBonus: 11, damage: '1d10+7', type: 'melee' },
      { name: 'Beard', attackBonus: 6, damage: '1d8+2', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft. (10 ft. with glaive)',
    abilities: { STR: 21, DEX: 15, CON: 17, INT: 6, WIS: 12, CHA: 10 },
    saves: { fortitude: 8, reflex: 7, will: 6 },
    skills: { Climb: 14, Diplomacy: 2, Hide: 11, Intimidate: 9, Listen: 10, 'Move Silently': 11, 'Sense Motive': 10, Spot: 10 },
    feats: ['Improved Initiative', 'Power Attack', 'Weapon Focus (glaive)'],
    specialAttacks: [
      { name: 'Beard', type: 'Ex', description: 'Infernal wound causes 1 point of damage each round until healed (DC 16 Heal check)' },
      { name: 'Battle Frenzy', type: 'Ex', description: 'Can work into frenzy gaining +2 Str, +2 Con, +1 morale bonus on Will saves, -2 AC for remainder of encounter' },
      { name: 'Summon Devil', type: 'Sp', description: '1/day summon 1 bearded devil (35% chance)' }
    ],
    specialQualities: [
      { name: 'Damage Reduction', type: 'Su', description: 'DR 5/silver or good' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Immunity to fire and poison', type: 'Ex', description: 'Immune to fire and poison' },
      { name: 'Resistance to acid and cold', type: 'Ex', description: 'Resistance 10' },
      { name: 'See in darkness', type: 'Su', description: 'Can see in magical darkness' },
      { name: 'Spell-like abilities', type: 'Sp', description: 'At will—produce flame, pyrotechnics, teleport without error (self plus 50 pounds)' }
    ],
    challengeRating: 5,
    environment: 'Nine Hells of Baator',
    organization: 'Solitary, pair, team (3-5), or squad (6-10)',
    treasure: 'Standard',
    alignment: 'Lawful Evil',
    damageReduction: { amount: 5, bypass: 'silver or good' },
    damageImmunity: ['fire', 'poison'],
    energyResistance: { acid: 10, cold: 10 },
    spellResistance: 16
  },

  // ===== OOZES =====
  {
    id: 'gelatinous-cube',
    name: 'Gelatinous Cube',
    size: 'Large',
    type: 'Ooze',
    hitDice: '4d10+32',
    hitPoints: { average: 54, roll: '4d10+32' },
    initiative: -5,
    speed: { land: 15 },
    armorClass: {
      total: 3,
      touch: 4,
      flatFooted: 3,
      size: -1,
      dex: -5,
      natural: 0
    },
    baseAttack: 3,
    grapple: 7,
    attacks: [
      { name: 'Slam', attackBonus: 1, damage: '1d6', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 10, DEX: 1, CON: 26, INT: 0, WIS: 1, CHA: 1 },
    saves: { fortitude: 9, reflex: -4, will: -4 },
    skills: {},
    feats: [],
    specialAttacks: [
      { name: 'Acid', type: 'Ex', description: '1d6 acid damage, dissolves organic material and metal but not stone' },
      { name: 'Engulf', type: 'Ex', description: 'DC 13 Reflex save or be engulfed, paralyzed and take acid damage each round' },
      { name: 'Paralysis', type: 'Ex', description: 'DC 20 Fort save or paralyzed for 3d6 rounds' }
    ],
    specialQualities: [
      { name: 'Ooze Traits', type: 'Ex', description: 'Mindless, immune to mind-affecting effects' },
      { name: 'Blindsight', type: 'Ex', description: 'Blindsight 60 ft.' },
      { name: 'Immunity to electricity', type: 'Ex', description: 'Immune to electricity' },
      { name: 'Transparent', type: 'Ex', description: 'DC 15 Spot check to notice' }
    ],
    challengeRating: 3,
    environment: 'Underground',
    organization: 'Solitary',
    treasure: '1/8 coins, 50% goods, 50% items',
    alignment: 'True Neutral',
    damageImmunity: ['electricity']
  },

  // ===== VERMIN =====
  {
    id: 'giant-spider',
    name: 'Large Monstrous Spider',
    size: 'Large',
    type: 'Vermin',
    hitDice: '4d8+4',
    hitPoints: { average: 22, roll: '4d8+4' },
    initiative: 3,
    speed: { land: 30, climb: 20 },
    armorClass: {
      total: 14,
      touch: 12,
      flatFooted: 11,
      size: -1,
      dex: 3,
      natural: 2
    },
    baseAttack: 3,
    grapple: 9,
    attacks: [
      { name: 'Bite', attackBonus: 4, damage: '1d8+3', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 15, DEX: 17, CON: 12, INT: 0, WIS: 10, CHA: 2 },
    saves: { fortitude: 5, reflex: 7, will: 1 },
    skills: { Climb: 11, Hide: -1, Jump: 2, Spot: 4 },
    feats: [],
    specialAttacks: [
      { name: 'Poison', type: 'Ex', description: 'DC 14 Fort save, initial and secondary damage 1d6 Str' },
      { name: 'Web', type: 'Ex', description: 'Ranged touch attack, range 50 ft, DC 16 Escape Artist or DC 20 Strength to break' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Tremorsense', type: 'Ex', description: 'Tremorsense 60 ft.' },
      { name: 'Vermin Traits', type: 'Ex', description: 'Mindless' }
    ],
    challengeRating: 2,
    environment: 'Temperate forests',
    organization: 'Solitary or colony (2-5)',
    treasure: '1/10 coins, 50% goods, 50% items',
    alignment: 'True Neutral'
  },

  // ===== PLANTS =====
  {
    id: 'shambling-mound',
    name: 'Shambling Mound',
    size: 'Large',
    type: 'Plant',
    hitDice: '8d8+24',
    hitPoints: { average: 60, roll: '8d8+24' },
    initiative: 0,
    speed: { land: 20, swim: 20 },
    armorClass: {
      total: 20,
      touch: 9,
      flatFooted: 20,
      size: -1,
      dex: 0,
      natural: 11
    },
    baseAttack: 6,
    grapple: 15,
    attacks: [
      { name: 'Slam', attackBonus: 11, damage: '2d6+5', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Slams', attackBonus: 11, damage: '2d6+5', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 21, DEX: 10, CON: 17, INT: 7, WIS: 10, CHA: 9 },
    saves: { fortitude: 9, reflex: 2, will: 3 },
    skills: { Hide: -2, Listen: 8, 'Move Silently': 8 },
    feats: ['Iron Will', 'Power Attack', 'Weapon Focus (slam)'],
    specialAttacks: [
      { name: 'Improved Grab', type: 'Ex', description: 'Can grapple foes and constrict for 2d6+7 damage' },
      { name: 'Constrict', type: 'Ex', description: '2d6+7 damage' }
    ],
    specialQualities: [
      { name: 'Plant Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, sleep, paralysis, polymorph, and stunning' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Immunity to electricity', type: 'Ex', description: 'Immune to electricity, healed by it' },
      { name: 'Resistance to fire', type: 'Ex', description: 'Resistance 10' }
    ],
    challengeRating: 6,
    environment: 'Temperate marshes',
    organization: 'Solitary',
    treasure: '1/5 coins, 50% goods, standard items',
    alignment: 'True Neutral',
    damageImmunity: ['electricity'],
    energyResistance: { fire: 10 }
  },

  // ===== MORE HUMANOIDS =====
  {
    id: 'orc',
    name: 'Orc',
    size: 'Medium',
    type: 'Humanoid',
    subtype: ['Orc'],
    hitDice: '1d8+1',
    hitPoints: { average: 5, roll: '1d8+1' },
    initiative: 0,
    speed: { land: 30 },
    armorClass: {
      total: 13,
      touch: 10,
      flatFooted: 13,
      size: 0,
      dex: 0,
      natural: 0,
      armor: 3
    },
    baseAttack: 1,
    grapple: 4,
    attacks: [
      { name: 'Falchion', attackBonus: 4, damage: '2d4+4', type: 'melee' },
      { name: 'Javelin', attackBonus: 1, damage: '1d6+3', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 17, DEX: 11, CON: 12, INT: 8, WIS: 10, CHA: 8 },
    saves: { fortitude: 3, reflex: 0, will: -1 },
    skills: { Listen: 3, Spot: 3 },
    feats: ['Alertness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Light Sensitivity', type: 'Ex', description: '-1 penalty on attack rolls in bright sunlight' }
    ],
    challengeRating: '1/2',
    environment: 'Temperate hills',
    organization: 'Gang (2-4), squad (11-20 plus 2 3rd-level sergeants and 1 leader of 3rd-6th level), or band (30-100)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil',
    advancement: 'By character class',
    levelAdjustment: '+0'
  },

  {
    id: 'kobold',
    name: 'Kobold',
    size: 'Small',
    type: 'Humanoid',
    subtype: ['Reptilian'],
    hitDice: '1d8',
    hitPoints: { average: 4, roll: '1d8' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 12,
      flatFooted: 14,
      size: 1,
      dex: 1,
      natural: 1,
      armor: 2
    },
    baseAttack: 1,
    grapple: -4,
    attacks: [
      { name: 'Spear', attackBonus: 1, damage: '1d6-1', type: 'melee' },
      { name: 'Sling', attackBonus: 3, damage: '1d3-1', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 9, DEX: 13, CON: 10, INT: 10, WIS: 9, CHA: 8 },
    saves: { fortitude: 2, reflex: 1, will: -1 },
    skills: { Craft: 2, Hide: 6, Listen: 2, 'Move Silently': 2, 'Profession (miner)': 2, Search: 3, Spot: 2 },
    feats: ['Alertness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Light Sensitivity', type: 'Ex', description: '-1 penalty on attack rolls in bright sunlight' }
    ],
    challengeRating: '1/4',
    environment: 'Temperate underground',
    organization: 'Gang (4-9), warband (10-100 plus 100% noncombatants plus 1 3rd-level sergeant per 20 adults and 1 leader of 4th-6th level), or tribe (40-400 plus 100% noncombatants)',
    treasure: 'Standard',
    alignment: 'Lawful Evil',
    advancement: 'By character class',
    levelAdjustment: '+0'
  },

  {
    id: 'skeleton',
    name: 'Human Skeleton',
    size: 'Medium',
    type: 'Undead',
    hitDice: '1d12',
    hitPoints: { average: 6, roll: '1d12' },
    initiative: 5,
    speed: { land: 30 },
    armorClass: {
      total: 13,
      touch: 11,
      flatFooted: 12,
      size: 0,
      dex: 1,
      natural: 2
    },
    baseAttack: 0,
    grapple: 1,
    attacks: [
      { name: 'Claw', attackBonus: 1, damage: '1d4+1', type: 'melee' },
      { name: 'Scimitar', attackBonus: 1, damage: '1d6+1', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 13, DEX: 13, CON: 0, INT: 0, WIS: 10, CHA: 1 },
    saves: { fortitude: 0, reflex: 1, will: 2 },
    skills: {},
    feats: ['Improved Initiative'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Undead Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, sleep, paralysis, stunning, disease, death effects, and necromantic effects' },
      { name: 'Damage Reduction', type: 'Ex', description: 'DR 5/bludgeoning' }
    ],
    challengeRating: '1/3',
    environment: 'Any',
    organization: 'Any',
    treasure: 'None',
    alignment: 'Neutral Evil',
    damageReduction: { amount: 5, bypass: 'bludgeoning' },
    damageImmunity: ['mind-affecting', 'poison', 'sleep', 'paralysis', 'stunning', 'disease', 'death effects', 'necromantic effects']
  },

  {
    id: 'zombie',
    name: 'Human Zombie',
    size: 'Medium',
    type: 'Undead',
    hitDice: '2d12+3',
    hitPoints: { average: 16, roll: '2d12+3' },
    initiative: -1,
    speed: { land: 30 },
    armorClass: {
      total: 11,
      touch: 9,
      flatFooted: 11,
      size: 0,
      dex: -1,
      natural: 2
    },
    baseAttack: 1,
    grapple: 3,
    attacks: [
      { name: 'Slam', attackBonus: 3, damage: '1d6+3', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 15, DEX: 8, CON: 0, INT: 0, WIS: 10, CHA: 1 },
    saves: { fortitude: 0, reflex: -1, will: 3 },
    skills: {},
    feats: ['Toughness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Undead Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, sleep, paralysis, stunning, disease, death effects, and necromantic effects' },
      { name: 'Single Actions Only', type: 'Ex', description: 'Can only perform a single move or attack action each round' },
      { name: 'Partial Actions Only', type: 'Ex', description: 'Can only take partial actions' }
    ],
    challengeRating: '1/2',
    environment: 'Any',
    organization: 'Any',
    treasure: 'None',
    alignment: 'Neutral Evil',
    damageImmunity: ['mind-affecting', 'poison', 'sleep', 'paralysis', 'stunning', 'disease', 'death effects', 'necromantic effects']
  },

  {
    id: 'owlbear',
    name: 'Owlbear',
    size: 'Large',
    type: 'Magical Beast',
    hitDice: '5d10+25',
    hitPoints: { average: 52, roll: '5d10+25' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 10,
      flatFooted: 14,
      size: -1,
      dex: 1,
      natural: 5
    },
    baseAttack: 5,
    grapple: 16,
    attacks: [
      { name: 'Claw', attackBonus: 11, damage: '1d6+7', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Claws', attackBonus: 11, damage: '1d6+7', type: 'melee' },
      { name: 'Bite', attackBonus: 6, damage: '1d8+3', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 25, DEX: 12, CON: 21, INT: 2, WIS: 12, CHA: 10 },
    saves: { fortitude: 9, reflex: 5, will: 2 },
    skills: { Listen: 6, Spot: 6 },
    feats: ['Alertness', 'Track'],
    specialAttacks: [
      { name: 'Improved Grab', type: 'Ex', description: 'Can grapple as a free action if claw attack hits' }
    ],
    specialQualities: [
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies, sniff out hidden foes, and track by sense of smell' }
    ],
    challengeRating: 4,
    environment: 'Temperate forests',
    organization: 'Solitary, pair, or pack (3-8)',
    treasure: 'Standard',
    alignment: 'Chaotic Neutral'
  },

  {
    id: 'troll',
    name: 'Troll',
    size: 'Large',
    type: 'Giant',
    hitDice: '6d8+36',
    hitPoints: { average: 63, roll: '6d8+36' },
    initiative: 2,
    speed: { land: 30 },
    armorClass: {
      total: 16,
      touch: 11,
      flatFooted: 14,
      size: -1,
      dex: 2,
      natural: 5
    },
    baseAttack: 4,
    grapple: 14,
    attacks: [
      { name: 'Claw', attackBonus: 9, damage: '1d6+6', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Claws', attackBonus: 9, damage: '1d6+6', type: 'melee' },
      { name: 'Bite', attackBonus: 4, damage: '1d6+3', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 23, DEX: 14, CON: 23, INT: 6, WIS: 9, CHA: 6 },
    saves: { fortitude: 11, reflex: 4, will: 3 },
    skills: { Listen: 6, Spot: 6 },
    feats: ['Alertness', 'Iron Will', 'Track'],
    specialAttacks: [
      { name: 'Rend', type: 'Ex', description: 'If both claw attacks hit, deals additional 2d6+9 damage' }
    ],
    specialQualities: [
      { name: 'Regeneration', type: 'Ex', description: 'Regenerates 5 hp per round. Fire and acid deal normal damage' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies, sniff out hidden foes, and track by sense of smell' }
    ],
    challengeRating: 5,
    environment: 'Cold mountains',
    organization: 'Solitary or gang (2-4)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil',
    vulnerability: ['fire', 'acid']
  },

  {
    id: 'bugbear',
    name: 'Bugbear',
    size: 'Medium',
    type: 'Humanoid',
    subtype: ['Goblinoid'],
    hitDice: '3d8+3',
    hitPoints: { average: 16, roll: '3d8+3' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 17,
      touch: 11,
      flatFooted: 16,
      size: 0,
      dex: 1,
      natural: 3,
      armor: 3
    },
    baseAttack: 2,
    grapple: 4,
    attacks: [
      { name: 'Morningstar', attackBonus: 5, damage: '1d8+2', type: 'melee' },
      { name: 'Javelin', attackBonus: 3, damage: '1d6+2', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 15, DEX: 12, CON: 13, INT: 10, WIS: 10, CHA: 9 },
    saves: { fortitude: 4, reflex: 2, will: 1 },
    skills: { Climb: 3, Hide: 4, Listen: 4, 'Move Silently': 6, Spot: 4 },
    feats: ['Alertness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies, sniff out hidden foes, and track by sense of smell' }
    ],
    challengeRating: 2,
    environment: 'Temperate mountains',
    organization: 'Solitary, pair, gang (3-5), or band (6-15)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'ogre',
    name: 'Ogre',
    size: 'Large',
    type: 'Giant',
    hitDice: '4d8+8',
    hitPoints: { average: 26, roll: '4d8+8' },
    initiative: -1,
    speed: { land: 30 },
    armorClass: {
      total: 16,
      touch: 8,
      flatFooted: 16,
      size: -1,
      dex: -1,
      natural: 5,
      armor: 3
    },
    baseAttack: 3,
    grapple: 12,
    attacks: [
      { name: 'Greatclub', attackBonus: 8, damage: '2d8+7', type: 'melee' },
      { name: 'Javelin', attackBonus: 1, damage: '1d8+5', type: 'ranged' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 21, DEX: 8, CON: 15, INT: 6, WIS: 10, CHA: 7 },
    saves: { fortitude: 6, reflex: 0, will: 1 },
    skills: { Climb: 5, Listen: 2, Spot: 2 },
    feats: ['Weapon Focus (greatclub)'],
    specialAttacks: [],
    specialQualities: [],
    challengeRating: 3,
    environment: 'Temperate hills',
    organization: 'Solitary, pair, gang (3-4), or band (5-8)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'minotaur',
    name: 'Minotaur',
    size: 'Large',
    type: 'Monstrous Humanoid',
    hitDice: '6d8+12',
    hitPoints: { average: 39, roll: '6d8+12' },
    initiative: 0,
    speed: { land: 30 },
    armorClass: {
      total: 14,
      touch: 9,
      flatFooted: 14,
      size: -1,
      dex: 0,
      natural: 5
    },
    baseAttack: 6,
    grapple: 14,
    attacks: [
      { name: 'Greataxe', attackBonus: 9, damage: '3d6+6', type: 'melee' },
      { name: 'Gore', attackBonus: 4, damage: '1d8+2', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Greataxe', attackBonus: 9, damage: '3d6+6', type: 'melee' },
      { name: 'Gore', attackBonus: 4, damage: '1d8+2', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 19, DEX: 10, CON: 15, INT: 7, WIS: 10, CHA: 8 },
    saves: { fortitude: 4, reflex: 5, will: 6 },
    skills: { Intimidate: 4, Jump: 8, Listen: 7, Search: 7, Spot: 7 },
    feats: ['Great Fortitude', 'Power Attack', 'Track'],
    specialAttacks: [
      { name: 'Powerful Charge', type: 'Ex', description: 'When charging, gore attack deals 4d6+6 damage' }
    ],
    specialQualities: [
      { name: 'Natural Cunning', type: 'Ex', description: 'Never becomes lost and can track enemies' }
    ],
    challengeRating: 4,
    environment: 'Underground',
    organization: 'Solitary, pair, or gang (3-4)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'gnoll',
    name: 'Gnoll',
    size: 'Medium',
    type: 'Humanoid',
    subtype: ['Gnoll'],
    hitDice: '2d8+2',
    hitPoints: { average: 11, roll: '2d8+2' },
    initiative: 0,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 10,
      flatFooted: 15,
      size: 0,
      dex: 0,
      natural: 1,
      armor: 4
    },
    baseAttack: 1,
    grapple: 3,
    attacks: [
      { name: 'Battleaxe', attackBonus: 3, damage: '1d8+2', type: 'melee' },
      { name: 'Shortbow', attackBonus: 1, damage: '1d6', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 15, DEX: 10, CON: 13, INT: 8, WIS: 11, CHA: 8 },
    saves: { fortitude: 4, reflex: 0, will: 0 },
    skills: { Listen: 2, Spot: 3 },
    feats: ['Power Attack'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' }
    ],
    challengeRating: 1,
    environment: 'Warm plains',
    organization: 'Solitary, pair, gang (3-5), band (10-100 plus 50% noncombatants plus 1 3rd-level sergeant per 20 adults and 1 leader of 4th-6th level), or tribe (20-200 plus 1 3rd-level sergeant per 20 adults, 1 or 2 lieutenants of 4th or 5th level, 1 leader of 6th-8th level, and 1-4 brown bears)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'dire-wolf',
    name: 'Dire Wolf',
    size: 'Large',
    type: 'Animal',
    hitDice: '6d8+18',
    hitPoints: { average: 45, roll: '6d8+18' },
    initiative: 2,
    speed: { land: 50 },
    armorClass: {
      total: 14,
      touch: 11,
      flatFooted: 12,
      size: -1,
      dex: 2,
      natural: 3
    },
    baseAttack: 4,
    grapple: 15,
    attacks: [
      { name: 'Bite', attackBonus: 11, damage: '1d8+10', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 25, DEX: 15, CON: 17, INT: 2, WIS: 12, CHA: 10 },
    saves: { fortitude: 8, reflex: 7, will: 3 },
    skills: { Hide: 2, Listen: 7, 'Move Silently': 4, Spot: 7, Survival: 2 },
    feats: ['Alertness', 'Run', 'Track'],
    specialAttacks: [
      { name: 'Trip', type: 'Ex', description: 'If bite attack hits, can attempt to trip as a free action without provoking AoO' }
    ],
    specialQualities: [
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies, sniff out hidden foes, and track by sense of smell' }
    ],
    challengeRating: 3,
    environment: 'Temperate forests',
    organization: 'Solitary or pack (5-8)',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  // ===== MAGICAL BEASTS =====
  {
    id: 'bulette',
    name: 'Bulette',
    size: 'Huge',
    type: 'Magical Beast',
    hitDice: '9d10+45',
    hitPoints: { average: 94, roll: '9d10+45' },
    initiative: 2,
    speed: { land: 40, burrow: 10 },
    armorClass: {
      total: 22,
      touch: 10,
      flatFooted: 20,
      size: -2,
      dex: 2,
      natural: 12
    },
    baseAttack: 9,
    grapple: 23,
    attacks: [
      { name: 'Bite', attackBonus: 15, damage: '2d8+8', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 15, damage: '2d8+8', type: 'melee' },
      { name: '2 Claws', attackBonus: 10, damage: '2d6+4', type: 'melee' }
    ],
    space: '15 ft.',
    reach: '10 ft.',
    abilities: { STR: 27, DEX: 15, CON: 20, INT: 2, WIS: 13, CHA: 6 },
    saves: { fortitude: 11, reflex: 8, will: 4 },
    skills: { Jump: 16, Listen: 9, Spot: 9 },
    feats: ['Alertness', 'Iron Will', 'Weapon Focus (bite)'],
    specialAttacks: [
      { name: 'Leap', type: 'Ex', description: 'Can jump up to 30 feet high or forward as part of charge attack' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies by scent' },
      { name: 'Tremorsense', type: 'Ex', description: 'Tremorsense 60 ft.' }
    ],
    challengeRating: 7,
    environment: 'Temperate hills',
    organization: 'Solitary or pair',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  {
    id: 'displacer-beast',
    name: 'Displacer Beast',
    size: 'Large',
    type: 'Magical Beast',
    hitDice: '6d10+12',
    hitPoints: { average: 45, roll: '6d10+12' },
    initiative: 2,
    speed: { land: 40 },
    armorClass: {
      total: 16,
      touch: 11,
      flatFooted: 14,
      size: -1,
      dex: 2,
      natural: 5
    },
    baseAttack: 6,
    grapple: 14,
    attacks: [
      { name: 'Tentacle', attackBonus: 9, damage: '1d6+4', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Tentacles', attackBonus: 9, damage: '1d6+4', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 18, DEX: 15, CON: 14, INT: 6, WIS: 12, CHA: 8 },
    saves: { fortitude: 7, reflex: 7, will: 3 },
    skills: { Hide: 9, Listen: 9, Spot: 9 },
    feats: ['Alertness', 'Dodge', 'Mobility'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Displacement', type: 'Su', description: '50% miss chance from ranged and melee attacks' }
    ],
    challengeRating: 3,
    environment: 'Temperate forests',
    organization: 'Solitary or pack (3-6)',
    treasure: 'None',
    alignment: 'Lawful Evil'
  },

  // ===== MORE DRAGONS =====
  {
    id: 'white-dragon-wyrmling',
    name: 'White Dragon Wyrmling',
    size: 'Tiny',
    type: 'Dragon',
    subtype: ['Cold'],
    hitDice: '2d12+2',
    hitPoints: { average: 15, roll: '2d12+2' },
    initiative: 0,
    speed: { land: 60, burrow: 30, fly: 100, swim: 60 },
    armorClass: {
      total: 16,
      touch: 12,
      flatFooted: 16,
      size: 2,
      dex: 0,
      natural: 4
    },
    baseAttack: 2,
    grapple: -7,
    attacks: [
      { name: 'Bite', attackBonus: 5, damage: '1d4', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 5, damage: '1d4', type: 'melee' },
      { name: '2 Claws', attackBonus: 0, damage: '1d3', type: 'melee' }
    ],
    space: '2-1/2 ft.',
    reach: '0 ft.',
    abilities: { STR: 11, DEX: 10, CON: 13, INT: 6, WIS: 11, CHA: 6 },
    saves: { fortitude: 4, reflex: 3, will: 3 },
    skills: { Hide: 15, Listen: 5, 'Move Silently': 4, Search: 4, Spot: 5 },
    feats: ['Weapon Finesse'],
    specialAttacks: [
      { name: 'Breath Weapon', type: 'Su', description: '15-ft. cone of cold, damage 1d6, Reflex DC 12 half' }
    ],
    specialQualities: [
      { name: 'Immunity to cold', type: 'Ex', description: 'Immune to cold damage' },
      { name: 'Vulnerability to fire', type: 'Ex', description: 'Takes +50% damage from fire' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 120 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Blindsense', type: 'Ex', description: 'Blindsense 60 ft.' },
      { name: 'Keen Senses', type: 'Ex', description: 'See four times as far as humans' }
    ],
    challengeRating: 2,
    environment: 'Cold mountains',
    organization: 'Solitary or clutch (2-5)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil',
    spellResistance: 11,
    damageImmunity: ['cold'],
    vulnerability: ['fire']
  },

  // ===== MORE UNDEAD =====
  {
    id: 'ghast',
    name: 'Ghast',
    size: 'Medium',
    type: 'Undead',
    hitDice: '4d12',
    hitPoints: { average: 26, roll: '4d12' },
    initiative: 7,
    speed: { land: 30 },
    armorClass: {
      total: 17,
      touch: 13,
      flatFooted: 14,
      size: 0,
      dex: 3,
      natural: 4
    },
    baseAttack: 2,
    grapple: 6,
    attacks: [
      { name: 'Bite', attackBonus: 4, damage: '1d8+2', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 4, damage: '1d8+2', type: 'melee' },
      { name: '2 Claws', attackBonus: 2, damage: '1d4+1', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 17, DEX: 17, CON: 0, INT: 13, WIS: 14, CHA: 16 },
    saves: { fortitude: 1, reflex: 4, will: 6 },
    skills: { Balance: 7, Climb: 10, Hide: 10, Jump: 10, 'Move Silently': 10, Spot: 8 },
    feats: ['Improved Initiative', 'Multiattack'],
    specialAttacks: [
      { name: 'Paralysis', type: 'Su', description: 'DC 15 Fort save or paralyzed for 1d6+4 rounds, affects elves' },
      { name: 'Stench', type: 'Ex', description: '10-ft. radius, DC 15 Fort save or sickened for 1d6+4 minutes' }
    ],
    specialQualities: [
      { name: 'Undead Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, sleep, paralysis, stunning, disease, death effects' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Turn Resistance', type: 'Ex', description: '+2 turn resistance' }
    ],
    challengeRating: 3,
    environment: 'Any',
    organization: 'Solitary, gang (2-4), or pack (7-12)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil',
    damageReduction: { amount: 5, bypass: 'bludgeoning' }
  },

  {
    id: 'wraith',
    name: 'Wraith',
    size: 'Medium',
    type: 'Undead',
    subtype: ['Incorporeal'],
    hitDice: '5d12',
    hitPoints: { average: 32, roll: '5d12' },
    initiative: 7,
    speed: { land: 0, fly: 60 },
    armorClass: {
      total: 15,
      touch: 15,
      flatFooted: 12,
      size: 0,
      dex: 3,
      natural: 0,
      deflection: 2
    },
    baseAttack: 2,
    grapple: 0,
    attacks: [
      { name: 'Incorporeal Touch', attackBonus: 5, damage: '1d4', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 0, DEX: 16, CON: 0, INT: 14, WIS: 14, CHA: 15 },
    saves: { fortitude: 1, reflex: 4, will: 6 },
    skills: { Diplomacy: 4, Hide: 11, Intimidate: 12, Listen: 12, Search: 10, 'Sense Motive': 8, Spot: 12 },
    feats: ['Alertness', 'Combat Reflexes', 'Improved Initiative'],
    specialAttacks: [
      { name: 'Constitution Drain', type: 'Su', description: 'Touch attack drains 1d6 Constitution, Fort DC 14 negates' },
      { name: 'Create Spawn', type: 'Su', description: 'Humanoid killed by wraith becomes wraith in 1d4 rounds' }
    ],
    specialQualities: [
      { name: 'Undead Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, sleep, paralysis, stunning, disease, death effects' },
      { name: 'Incorporeal', type: 'Ex', description: 'Can only be harmed by other incorporeal creatures, +1 or better magic weapons, spells' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Daylight Powerlessness', type: 'Ex', description: 'Powerless in natural sunlight' },
      { name: 'Unnatural Aura', type: 'Su', description: 'Animals do not willingly approach within 30 feet' }
    ],
    challengeRating: 5,
    environment: 'Any',
    organization: 'Solitary, gang (2-5), or pack (6-11)',
    treasure: 'None',
    alignment: 'Lawful Evil'
  },

  // ===== MORE ANIMALS =====
  {
    id: 'brown-bear',
    name: 'Brown Bear',
    size: 'Large',
    type: 'Animal',
    hitDice: '6d8+24',
    hitPoints: { average: 51, roll: '6d8+24' },
    initiative: 1,
    speed: { land: 40 },
    armorClass: {
      total: 15,
      touch: 10,
      flatFooted: 14,
      size: -1,
      dex: 1,
      natural: 5
    },
    baseAttack: 4,
    grapple: 17,
    attacks: [
      { name: 'Claw', attackBonus: 12, damage: '1d8+9', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Claws', attackBonus: 12, damage: '1d8+9', type: 'melee' },
      { name: 'Bite', attackBonus: 7, damage: '2d6+4', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 27, DEX: 13, CON: 19, INT: 2, WIS: 12, CHA: 6 },
    saves: { fortitude: 9, reflex: 6, will: 3 },
    skills: { Listen: 4, Spot: 6, Swim: 13 },
    feats: ['Endurance', 'Run', 'Track'],
    specialAttacks: [
      { name: 'Improved Grab', type: 'Ex', description: 'Can grapple on successful claw attack' }
    ],
    specialQualities: [
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies by scent' }
    ],
    challengeRating: 4,
    environment: 'Cold forests',
    organization: 'Solitary or pair',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  {
    id: 'hawk',
    name: 'Hawk',
    size: 'Tiny',
    type: 'Animal',
    hitDice: '1d8',
    hitPoints: { average: 4, roll: '1d8' },
    initiative: 3,
    speed: { land: 10, fly: 60 },
    armorClass: {
      total: 17,
      touch: 15,
      flatFooted: 14,
      size: 2,
      dex: 3,
      natural: 2
    },
    baseAttack: 0,
    grapple: -10,
    attacks: [
      { name: 'Talons', attackBonus: 5, damage: '1d4-2', type: 'melee' }
    ],
    space: '2-1/2 ft.',
    reach: '0 ft.',
    abilities: { STR: 6, DEX: 17, CON: 10, INT: 2, WIS: 14, CHA: 6 },
    saves: { fortitude: 2, reflex: 5, will: 2 },
    skills: { Listen: 2, Spot: 14 },
    feats: ['Weapon Finesse'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' }
    ],
    challengeRating: '1/3',
    environment: 'Temperate forests',
    organization: 'Solitary or pair',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  // ===== ABERRATIONS =====
  {
    id: 'owlbear',
    name: 'Owlbear',
    size: 'Large',
    type: 'Magical Beast',
    hitDice: '5d10+25',
    hitPoints: { average: 52, roll: '5d10+25' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 10,
      flatFooted: 14,
      size: -1,
      dex: 1,
      natural: 5
    },
    baseAttack: 5,
    grapple: 14,
    attacks: [
      { name: 'Claw', attackBonus: 9, damage: '1d6+5', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Claws', attackBonus: 9, damage: '1d6+5', type: 'melee' },
      { name: 'Bite', attackBonus: 4, damage: '1d8+2', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 21, DEX: 12, CON: 21, INT: 2, WIS: 12, CHA: 10 },
    saves: { fortitude: 9, reflex: 5, will: 2 },
    skills: { Listen: 8, Spot: 8 },
    feats: ['Alertness', 'Track'],
    specialAttacks: [
      { name: 'Improved Grab', type: 'Ex', description: 'Can grapple on successful claw attack' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies by scent' }
    ],
    challengeRating: 4,
    environment: 'Temperate forests',
    organization: 'Solitary, pair, or pack (3-8)',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  {
    id: 'rust-monster',
    name: 'Rust Monster',
    size: 'Medium',
    type: 'Aberration',
    hitDice: '5d8+5',
    hitPoints: { average: 27, roll: '5d8+5' },
    initiative: 3,
    speed: { land: 40 },
    armorClass: {
      total: 18,
      touch: 13,
      flatFooted: 15,
      size: 0,
      dex: 3,
      natural: 5
    },
    baseAttack: 3,
    grapple: 4,
    attacks: [
      { name: 'Antennae', attackBonus: 4, damage: '0', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Antennae', attackBonus: 4, damage: '0', type: 'melee' },
      { name: 'Bite', attackBonus: -1, damage: '1d3', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 12, DEX: 17, CON: 13, INT: 2, WIS: 13, CHA: 8 },
    saves: { fortitude: 2, reflex: 7, will: 2 },
    skills: { Listen: 5, Spot: 5 },
    feats: ['Alertness', 'Track'],
    specialAttacks: [
      { name: 'Rust', type: 'Su', description: 'Touch attacks against metal items cause them to rust and fall apart' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Scent', type: 'Ex', description: 'Can detect metal by scent' }
    ],
    challengeRating: 3,
    environment: 'Underground',
    organization: 'Solitary or pair',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  // ===== MORE OUTSIDERS =====
  {
    id: 'imp',
    name: 'Imp',
    size: 'Tiny',
    type: 'Outsider',
    subtype: ['Evil', 'Extraplanar', 'Lawful'],
    hitDice: '3d8',
    hitPoints: { average: 13, roll: '3d8' },
    initiative: 3,
    speed: { land: 20, fly: 50 },
    armorClass: {
      total: 17,
      touch: 15,
      flatFooted: 14,
      size: 2,
      dex: 3,
      natural: 2
    },
    baseAttack: 3,
    grapple: -5,
    attacks: [
      { name: 'Sting', attackBonus: 8, damage: '1d4', type: 'melee' }
    ],
    space: '2-1/2 ft.',
    reach: '0 ft.',
    abilities: { STR: 10, DEX: 17, CON: 10, INT: 10, WIS: 12, CHA: 14 },
    saves: { fortitude: 3, reflex: 6, will: 4 },
    skills: { Diplomacy: 4, Hide: 17, Knowledge: 3, Listen: 7, 'Move Silently': 9, Search: 6, Spellcraft: 6, Spot: 7, Survival: 1 },
    feats: ['Dodge', 'Weapon Finesse'],
    specialAttacks: [
      { name: 'Poison', type: 'Ex', description: 'Sting, Fort DC 13, initial damage 1d4 Dex, secondary damage 2d4 Dex' },
      { name: 'Spell-like Abilities', type: 'Sp', description: 'At will—detect good, detect magic, invisibility (self only), suggestion (DC 15)' }
    ],
    specialQualities: [
      { name: 'Damage Reduction', type: 'Su', description: 'DR 5/silver or good' },
      { name: 'Fast Healing', type: 'Ex', description: 'Fast healing 1' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Immunity to poison', type: 'Ex', description: 'Immune to poison' },
      { name: 'Resistance to fire', type: 'Ex', description: 'Resistance 5' }
    ],
    challengeRating: 2,
    environment: 'Nine Hells of Baator',
    organization: 'Solitary',
    treasure: 'Standard',
    alignment: 'Lawful Evil',
    damageReduction: { amount: 5, bypass: 'silver or good' },
    energyResistance: { fire: 5 },
    spellResistance: 13
  },

  // ===== MORE VERMIN =====
  {
    id: 'giant-centipede',
    name: 'Large Monstrous Centipede',
    size: 'Large',
    type: 'Vermin',
    hitDice: '3d8+6',
    hitPoints: { average: 19, roll: '3d8+6' },
    initiative: 2,
    speed: { land: 40, climb: 40 },
    armorClass: {
      total: 14,
      touch: 11,
      flatFooted: 12,
      size: -1,
      dex: 2,
      natural: 3
    },
    baseAttack: 2,
    grapple: 7,
    attacks: [
      { name: 'Bite', attackBonus: 2, damage: '1d8+1', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 13, DEX: 15, CON: 14, INT: 0, WIS: 10, CHA: 2 },
    saves: { fortitude: 5, reflex: 3, will: 1 },
    skills: { Climb: 9, Hide: 2, Spot: 4 },
    feats: [],
    specialAttacks: [
      { name: 'Poison', type: 'Ex', description: 'DC 14 Fort save, initial and secondary damage 1d4 Dex' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Vermin Traits', type: 'Ex', description: 'Mindless' }
    ],
    challengeRating: 2,
    environment: 'Underground',
    organization: 'Solitary or colony (2-5)',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  // ===== ICONIC MONSTERS =====
  {
    id: 'beholder',
    name: 'Beholder',
    size: 'Large',
    type: 'Aberration',
    hitDice: '11d8+44',
    hitPoints: { average: 93, roll: '11d8+44' },
    initiative: 8,
    speed: { land: 0, fly: 20 },
    armorClass: {
      total: 22,
      touch: 13,
      flatFooted: 18,
      size: -1,
      dex: 4,
      natural: 9
    },
    baseAttack: 8,
    grapple: 13,
    attacks: [
      { name: 'Eye Rays', attackBonus: 11, damage: 'Special', type: 'ranged' },
      { name: 'Bite', attackBonus: 8, damage: '2d4', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 10, DEX: 18, CON: 18, INT: 17, WIS: 15, CHA: 15 },
    saves: { fortitude: 7, reflex: 7, will: 10 },
    skills: { Hide: 7, Knowledge: 16, Listen: 16, Search: 16, Spot: 16, Survival: 2 },
    feats: ['Alertness', 'Flyby Attack', 'Improved Initiative', 'Iron Will', 'Shot on the Run'],
    specialAttacks: [
      { name: 'Eye Rays', type: 'Su', description: '10 different magical rays, each usable once per round' },
      { name: 'Antimagic Cone', type: 'Su', description: '150-ft. cone of antimagic from central eye' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'All-around vision', type: 'Ex', description: 'Cannot be flanked' }
    ],
    challengeRating: 13,
    environment: 'Underground',
    organization: 'Solitary, pair, or cluster (3-6)',
    treasure: 'Double standard',
    alignment: 'Lawful Evil'
  },

  {
    id: 'mind-flayer',
    name: 'Mind Flayer',
    size: 'Medium',
    type: 'Aberration',
    hitDice: '8d8+8',
    hitPoints: { average: 44, roll: '8d8+8' },
    initiative: 7,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 13,
      flatFooted: 12,
      size: 0,
      dex: 3,
      natural: 2
    },
    baseAttack: 6,
    grapple: 7,
    attacks: [
      { name: '4 Tentacles', attackBonus: 7, damage: '1d4+1', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 12, DEX: 16, CON: 12, INT: 19, WIS: 17, CHA: 17 },
    saves: { fortitude: 3, reflex: 5, will: 10 },
    skills: { Bluff: 14, Concentration: 12, Hide: 14, Intimidate: 14, Knowledge: 15, Listen: 14, 'Move Silently': 14, Search: 14, 'Sense Motive': 14, Spot: 14 },
    feats: ['Combat Casting', 'Improved Initiative', 'Weapon Finesse'],
    specialAttacks: [
      { name: 'Mind Blast', type: 'Sp', description: '60-ft. cone, Will DC 17 or stunned for 3d4 rounds' },
      { name: 'Improved Grab', type: 'Ex', description: 'Can grapple with tentacle attacks' },
      { name: 'Extract', type: 'Ex', description: 'Can extract brain from helpless opponent' },
      { name: 'Psionics', type: 'Sp', description: 'At will—astral projection, charm monster, detect thoughts, levitate, plane shift, suggestion' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Magic Resistance', type: 'Ex', description: 'SR 25' }
    ],
    challengeRating: 8,
    environment: 'Underground',
    organization: 'Solitary, pair, inquisition (3-5), or cult (3-5 plus 6-10 grimlocks)',
    treasure: 'Double standard',
    alignment: 'Lawful Evil',
    spellResistance: 25
  },

  {
    id: 'lich',
    name: 'Lich',
    size: 'Medium',
    type: 'Undead',
    hitDice: '11d12',
    hitPoints: { average: 71, roll: '11d12' },
    initiative: 2,
    speed: { land: 30 },
    armorClass: {
      total: 23,
      touch: 15,
      flatFooted: 21,
      size: 0,
      dex: 2,
      natural: 5,
      armor: 6
    },
    baseAttack: 5,
    grapple: 8,
    attacks: [
      { name: 'Touch', attackBonus: 8, damage: '1d8+5', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 16, DEX: 14, CON: 0, INT: 20, WIS: 17, CHA: 17 },
    saves: { fortitude: 3, reflex: 5, will: 11 },
    skills: { Concentration: 23, Craft: 19, Hide: 16, Knowledge: 24, Listen: 17, 'Move Silently': 16, Search: 19, 'Sense Motive': 17, Spellcraft: 24, Spot: 17 },
    feats: ['Combat Casting', 'Craft Wondrous Item', 'Scribe Scroll', 'Still Spell'],
    specialAttacks: [
      { name: 'Paralyzing Touch', type: 'Su', description: 'Fort DC 18 or permanently paralyzed' },
      { name: 'Fear Aura', type: 'Su', description: '60-ft. radius, Will DC 18 or affected as fear spell' },
      { name: 'Spells', type: 'Sp', description: 'Casts as 11th-level wizard' }
    ],
    specialQualities: [
      { name: 'Undead Traits', type: 'Ex', description: 'Immune to mind-affecting, poison, sleep, paralysis, stunning, disease, death effects' },
      { name: 'Damage Reduction', type: 'Su', description: 'DR 15/bludgeoning and magic' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Turn Resistance', type: 'Ex', description: '+4 turn resistance' }
    ],
    challengeRating: 13,
    environment: 'Any',
    organization: 'Solitary',
    treasure: 'Standard coins; double goods; standard items',
    alignment: 'Neutral Evil',
    damageReduction: { amount: 15, bypass: 'bludgeoning and magic' }
  },

  // ===== MORE DRAGONS =====
  {
    id: 'adult-red-dragon',
    name: 'Adult Red Dragon',
    size: 'Huge',
    type: 'Dragon',
    subtype: ['Fire'],
    hitDice: '22d12+110',
    hitPoints: { average: 253, roll: '22d12+110' },
    initiative: 4,
    speed: { land: 40, fly: 150 },
    armorClass: {
      total: 27,
      touch: 8,
      flatFooted: 27,
      size: -2,
      dex: 0,
      natural: 19
    },
    baseAttack: 22,
    grapple: 38,
    attacks: [
      { name: 'Bite', attackBonus: 30, damage: '2d8+8', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 30, damage: '2d8+8', type: 'melee' },
      { name: '2 Claws', attackBonus: 28, damage: '2d6+4', type: 'melee' },
      { name: '2 Wings', attackBonus: 28, damage: '1d8+4', type: 'melee' },
      { name: 'Tail Slap', attackBonus: 28, damage: '2d6+12', type: 'melee' }
    ],
    space: '15 ft.',
    reach: '10 ft. (15 ft. with bite)',
    abilities: { STR: 27, DEX: 10, CON: 21, INT: 16, WIS: 17, CHA: 16 },
    saves: { fortitude: 18, reflex: 13, will: 16 },
    skills: { Appraise: 28, Bluff: 28, Concentration: 30, Diplomacy: 7, Intimidate: 30, Jump: 12, Knowledge: 28, Listen: 28, Search: 28, 'Sense Motive': 28, Spot: 28 },
    feats: ['Cleave', 'Great Cleave', 'Improved Initiative', 'Iron Will', 'Multiattack', 'Power Attack', 'Weapon Focus (bite)', 'Weapon Focus (claw)'],
    specialAttacks: [
      { name: 'Breath Weapon', type: 'Su', description: '50-ft. cone of fire, damage 12d10, Reflex DC 26 half' },
      { name: 'Frightful Presence', type: 'Ex', description: 'Creatures within 180 feet with 21 HD or less make Will DC 24 or become frightened' },
      { name: 'Crush', type: 'Ex', description: 'Medium or smaller opponents take 2d8+12 bludgeoning damage' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 120 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Immunity to fire', type: 'Ex', description: 'Immune to all fire damage' },
      { name: 'Vulnerability to cold', type: 'Ex', description: 'Takes +50% damage from cold' },
      { name: 'Blindsense', type: 'Ex', description: 'Blindsense 60 ft.' },
      { name: 'Keen Senses', type: 'Ex', description: 'See four times as far as humans' }
    ],
    challengeRating: 15,
    environment: 'Warm mountains',
    organization: 'Solitary or pair',
    treasure: 'Triple standard',
    alignment: 'Chaotic Evil',
    spellResistance: 21,
    damageReduction: { amount: 5, bypass: 'magic' },
    damageImmunity: ['fire'],
    vulnerability: ['cold']
  },

  {
    id: 'black-dragon-adult',
    name: 'Adult Black Dragon',
    size: 'Large',
    type: 'Dragon',
    subtype: ['Water'],
    hitDice: '19d12+76',
    hitPoints: { average: 199, roll: '19d12+76' },
    initiative: 4,
    speed: { land: 60, fly: 150, swim: 60 },
    armorClass: {
      total: 24,
      touch: 9,
      flatFooted: 24,
      size: -1,
      dex: 0,
      natural: 15
    },
    baseAttack: 19,
    grapple: 29,
    attacks: [
      { name: 'Bite', attackBonus: 26, damage: '2d6+6', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 26, damage: '2d6+6', type: 'melee' },
      { name: '2 Claws', attackBonus: 24, damage: '1d8+3', type: 'melee' },
      { name: '2 Wings', attackBonus: 24, damage: '1d6+3', type: 'melee' },
      { name: 'Tail Slap', attackBonus: 24, damage: '1d8+9', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft. (10 ft. with bite)',
    abilities: { STR: 23, DEX: 10, CON: 19, INT: 14, WIS: 15, CHA: 14 },
    saves: { fortitude: 15, reflex: 11, will: 13 },
    skills: { Bluff: 24, Concentration: 26, Diplomacy: 4, Hide: 18, Intimidate: 26, Knowledge: 9, Listen: 26, Search: 24, 'Sense Motive': 24, Spot: 26, Swim: 14 },
    feats: ['Alertness', 'Cleave', 'Improved Initiative', 'Power Attack', 'Weapon Focus (bite)'],
    specialAttacks: [
      { name: 'Breath Weapon', type: 'Su', description: '80-ft. line of acid, damage 10d4, Reflex DC 23 half' },
      { name: 'Frightful Presence', type: 'Ex', description: 'Creatures within 150 feet with 18 HD or less make Will DC 21 or become frightened' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 120 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Immunity to acid', type: 'Ex', description: 'Immune to all acid damage' },
      { name: 'Water breathing', type: 'Ex', description: 'Can breathe underwater indefinitely' },
      { name: 'Blindsense', type: 'Ex', description: 'Blindsense 60 ft.' },
      { name: 'Keen Senses', type: 'Ex', description: 'See four times as far as humans' }
    ],
    challengeRating: 11,
    environment: 'Warm marshes',
    organization: 'Solitary or pair',
    treasure: 'Triple standard',
    alignment: 'Chaotic Evil',
    spellResistance: 19,
    damageReduction: { amount: 5, bypass: 'magic' },
    damageImmunity: ['acid']
  },

  // ===== MORE GIANTS =====
  {
    id: 'hill-giant',
    name: 'Hill Giant',
    size: 'Large',
    type: 'Giant',
    hitDice: '12d8+48',
    hitPoints: { average: 102, roll: '12d8+48' },
    initiative: -1,
    speed: { land: 30 },
    armorClass: {
      total: 20,
      touch: 8,
      flatFooted: 20,
      size: -1,
      dex: -1,
      natural: 9,
      armor: 3
    },
    baseAttack: 9,
    grapple: 21,
    attacks: [
      { name: 'Greatclub', attackBonus: 16, damage: '2d8+10', type: 'melee' },
      { name: 'Slam', attackBonus: 16, damage: '1d4+7', type: 'melee' },
      { name: 'Rock', attackBonus: 6, damage: '2d6+7', type: 'ranged' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 25, DEX: 8, CON: 19, INT: 6, WIS: 10, CHA: 7 },
    saves: { fortitude: 12, reflex: 3, will: 4 },
    skills: { Climb: 10, Jump: 4, Spot: 6 },
    feats: ['Cleave', 'Improved Bull Rush', 'Power Attack', 'Weapon Focus (greatclub)'],
    specialAttacks: [
      { name: 'Rock Throwing', type: 'Ex', description: 'Range increment 120 ft.' }
    ],
    specialQualities: [
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Rock Catching', type: 'Ex', description: 'Can catch Small, Medium, or Large rocks' }
    ],
    challengeRating: 7,
    environment: 'Temperate hills',
    organization: 'Solitary, gang (2-5), band (6-8), hunting/raiding party (9-12 plus 1d4 dire wolves), or tribe (13-30 plus 35% noncombatants plus 1 barbarian or fighter chief of 4th-6th level, 2-4 dire wolves, and 1d4 brown bears)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'frost-giant',
    name: 'Frost Giant',
    size: 'Large',
    type: 'Giant',
    subtype: ['Cold'],
    hitDice: '14d8+70',
    hitPoints: { average: 133, roll: '14d8+70' },
    initiative: -1,
    speed: { land: 40 },
    armorClass: {
      total: 21,
      touch: 8,
      flatFooted: 21,
      size: -1,
      dex: -1,
      natural: 9,
      armor: 4
    },
    baseAttack: 10,
    grapple: 24,
    attacks: [
      { name: 'Greataxe', attackBonus: 19, damage: '3d6+13', type: 'melee' },
      { name: 'Slam', attackBonus: 19, damage: '1d4+9', type: 'melee' },
      { name: 'Rock', attackBonus: 8, damage: '2d6+9', type: 'ranged' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 29, DEX: 9, CON: 21, INT: 10, WIS: 14, CHA: 11 },
    saves: { fortitude: 14, reflex: 3, will: 6 },
    skills: { Climb: 13, Craft: 5, Intimidate: 8, Jump: 17, Spot: 14 },
    feats: ['Cleave', 'Great Cleave', 'Improved Overrun', 'Power Attack', 'Weapon Focus (greataxe)'],
    specialAttacks: [
      { name: 'Rock Throwing', type: 'Ex', description: 'Range increment 120 ft.' }
    ],
    specialQualities: [
      { name: 'Immunity to cold', type: 'Ex', description: 'Immune to cold damage' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Rock Catching', type: 'Ex', description: 'Can catch Small, Medium, or Large rocks' }
    ],
    challengeRating: 9,
    environment: 'Cold mountains',
    organization: 'Solitary, gang (2-5), band (6-8), hunting/raiding party (9-12 plus 2d4 winter wolves), or tribe (13-30 plus 35% noncombatants plus 1 barbarian or ranger jarl of 4th-6th level, 2-4 winter wolves, and 1d4 polar bears)',
    treasure: 'Standard (chainmail, greataxe, other treasure)',
    alignment: 'Chaotic Evil',
    damageImmunity: ['cold']
  },

  // ===== MORE MAGICAL BEASTS =====
  {
    id: 'griffon',
    name: 'Griffon',
    size: 'Large',
    type: 'Magical Beast',
    hitDice: '7d10+21',
    hitPoints: { average: 59, roll: '7d10+21' },
    initiative: 2,
    speed: { land: 30, fly: 80 },
    armorClass: {
      total: 17,
      touch: 11,
      flatFooted: 15,
      size: -1,
      dex: 2,
      natural: 6
    },
    baseAttack: 7,
    grapple: 16,
    attacks: [
      { name: 'Bite', attackBonus: 11, damage: '2d6+5', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 11, damage: '2d6+5', type: 'melee' },
      { name: '2 Claws', attackBonus: 9, damage: '1d4+2', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 20, DEX: 15, CON: 16, INT: 5, WIS: 13, CHA: 8 },
    saves: { fortitude: 8, reflex: 7, will: 3 },
    skills: { Jump: 9, Listen: 6, Spot: 10 },
    feats: ['Dive Attack', 'Flyby Attack', 'Multiattack'],
    specialAttacks: [
      { name: 'Pounce', type: 'Ex', description: 'Can make full attack after charge while flying' },
      { name: 'Rake', type: 'Ex', description: '2 claws +9 melee, damage 1d6+2, when pouncing' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies by scent' }
    ],
    challengeRating: 4,
    environment: 'Temperate hills',
    organization: 'Solitary, pair, or pride (6-10)',
    treasure: 'Incidental',
    alignment: 'True Neutral'
  },

  {
    id: 'pegasus',
    name: 'Pegasus',
    size: 'Large',
    type: 'Magical Beast',
    hitDice: '4d10+12',
    hitPoints: { average: 34, roll: '4d10+12' },
    initiative: 2,
    speed: { land: 60, fly: 120 },
    armorClass: {
      total: 14,
      touch: 11,
      flatFooted: 12,
      size: -1,
      dex: 2,
      natural: 3
    },
    baseAttack: 4,
    grapple: 12,
    attacks: [
      { name: 'Hoof', attackBonus: 7, damage: '1d6+4', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Hooves', attackBonus: 7, damage: '1d6+4', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 18, DEX: 15, CON: 16, INT: 10, WIS: 13, CHA: 13 },
    saves: { fortitude: 7, reflex: 6, will: 2 },
    skills: { Listen: 7, 'Sense Motive': 6, Spot: 8 },
    feats: ['Flyby Attack', 'Iron Will'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies by scent' },
      { name: 'Spell-like abilities', type: 'Sp', description: '1/day—detect good, detect evil' }
    ],
    challengeRating: 3,
    environment: 'Temperate forests',
    organization: 'Solitary, pair, or herd (6-10)',
    treasure: 'None',
    alignment: 'Chaotic Good'
  },

  // ===== MORE HUMANOIDS =====
  {
    id: 'goblin',
    name: 'Goblin',
    size: 'Small',
    type: 'Humanoid',
    subtype: ['Goblinoid'],
    hitDice: '1d8+1',
    hitPoints: { average: 5, roll: '1d8+1' },
    initiative: 1,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 12,
      flatFooted: 14,
      size: 1,
      dex: 1,
      natural: 0,
      armor: 2,
      shield: 1
    },
    baseAttack: 1,
    grapple: -3,
    attacks: [
      { name: 'Morningstar', attackBonus: 2, damage: '1d6', type: 'melee' },
      { name: 'Light crossbow', attackBonus: 3, damage: '1d6', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 11, DEX: 13, CON: 12, INT: 10, WIS: 9, CHA: 6 },
    saves: { fortitude: 3, reflex: 1, will: -1 },
    skills: { Hide: 5, Listen: 2, 'Move Silently': 5, Ride: 4, Spot: 2 },
    feats: ['Alertness'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' }
    ],
    challengeRating: '1/3',
    environment: 'Temperate plains',
    organization: 'Gang (4-9), band (10-100 plus 100% noncombatants plus 1 3rd-level sergeant per 20 adults and 1 leader of 4th-6th level), warband (10-24), or tribe (40-400 plus 100% noncombatants)',
    treasure: 'Standard',
    alignment: 'Neutral Evil'
  },

  {
    id: 'lizardfolk',
    name: 'Lizardfolk',
    size: 'Medium',
    type: 'Humanoid',
    subtype: ['Reptilian'],
    hitDice: '2d8+2',
    hitPoints: { average: 11, roll: '2d8+2' },
    initiative: 0,
    speed: { land: 30, swim: 15 },
    armorClass: {
      total: 17,
      touch: 10,
      flatFooted: 17,
      size: 0,
      dex: 0,
      natural: 5,
      shield: 2
    },
    baseAttack: 1,
    grapple: 2,
    attacks: [
      { name: 'Club', attackBonus: 2, damage: '1d6+1', type: 'melee' },
      { name: 'Claw', attackBonus: 2, damage: '1d4+1', type: 'melee' },
      { name: 'Javelin', attackBonus: 1, damage: '1d6+1', type: 'ranged' }
    ],
    fullAttacks: [
      { name: 'Club', attackBonus: 2, damage: '1d6+1', type: 'melee' },
      { name: 'Bite', attackBonus: 0, damage: '1d4', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 13, DEX: 10, CON: 13, INT: 9, WIS: 12, CHA: 10 },
    saves: { fortitude: 4, reflex: 0, will: 1 },
    skills: { Balance: 4, Jump: 5, Swim: 9 },
    feats: ['Multiattack'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Hold Breath', type: 'Ex', description: 'Can hold breath for number of rounds equal to 4 × Constitution modifier' }
    ],
    challengeRating: 1,
    environment: 'Temperate marshes',
    organization: 'Gang (2-3), band (6-10 plus 50% noncombatants plus 1 3rd-level sergeant), or tribe (30-60 plus 100% noncombatants plus 1 3rd-level sergeant per 10 adults plus 1 leader of 4th-6th level)',
    treasure: 'Standard',
    alignment: 'True Neutral'
  },

  // ===== MORE OUTSIDERS =====
  {
    id: 'angel-solar',
    name: 'Solar',
    size: 'Large',
    type: 'Outsider',
    subtype: ['Angel', 'Extraplanar', 'Good'],
    hitDice: '22d8+110',
    hitPoints: { average: 209, roll: '22d8+110' },
    initiative: 9,
    speed: { land: 50, fly: 150 },
    armorClass: {
      total: 35,
      touch: 14,
      flatFooted: 30,
      size: -1,
      dex: 5,
      natural: 21
    },
    baseAttack: 22,
    grapple: 35,
    attacks: [
      { name: '+5 dancing vorpal greatsword', attackBonus: 35, damage: '2d6+18', type: 'melee' },
      { name: '+2 mighty composite longbow', attackBonus: 28, damage: '2d6+17', type: 'ranged' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 28, DEX: 20, CON: 20, INT: 23, WIS: 25, CHA: 25 },
    saves: { fortitude: 18, reflex: 18, will: 20 },
    skills: { Concentration: 30, Craft: 31, Diplomacy: 36, Escape: 29, Hide: 25, Knowledge: 31, Listen: 32, 'Move Silently': 29, Search: 31, 'Sense Motive': 32, Spellcraft: 31, Spot: 32, Use: 31 },
    feats: ['Cleave', 'Dodge', 'Great Cleave', 'Improved Initiative', 'Improved Sunder', 'Mobility', 'Power Attack', 'Weapon Focus (greatsword)'],
    specialAttacks: [
      { name: 'Spell-like Abilities', type: 'Sp', description: 'At will—aid, animate objects, commune, continual flame, dimensional anchor, greater dispel magic, holy smite, imprisonment, invisibility, lesser restoration, remove curse, remove disease, remove fear, resist energy, summon monster VII, speak with dead, waves of fatigue' },
      { name: 'Spells', type: 'Sp', description: 'Casts divine spells as 20th-level cleric' }
    ],
    specialQualities: [
      { name: 'Damage Reduction', type: 'Su', description: 'DR 15/epic and evil' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Immunity', type: 'Ex', description: 'Immune to acid, cold, and petrification' },
      { name: 'Resistance', type: 'Ex', description: 'Resistance to electricity 10 and fire 10' },
      { name: 'Protective Aura', type: 'Su', description: '+4 deflection bonus to AC and +4 resistance bonus on saves within 20 feet' },
      { name: 'Regeneration', type: 'Ex', description: 'Regeneration 15 (evil weapons and spells)' },
      { name: 'Tongues', type: 'Su', description: 'Can speak with any creature that has a language' }
    ],
    challengeRating: 23,
    environment: 'Any good-aligned plane',
    organization: 'Solitary or pair',
    treasure: 'No coins; double goods; standard items',
    alignment: 'Lawful Good',
    damageReduction: { amount: 15, bypass: 'epic and evil' },
    energyResistance: { electricity: 10, fire: 10 },
    spellResistance: 32
  },

  {
    id: 'demon-balor',
    name: 'Balor',
    size: 'Large',
    type: 'Outsider',
    subtype: ['Chaotic', 'Demon', 'Evil', 'Extraplanar'],
    hitDice: '20d8+200',
    hitPoints: { average: 290, roll: '20d8+200' },
    initiative: 11,
    speed: { land: 40, fly: 90 },
    armorClass: {
      total: 35,
      touch: 16,
      flatFooted: 28,
      size: -1,
      dex: 7,
      natural: 19
    },
    baseAttack: 20,
    grapple: 33,
    attacks: [
      { name: '+1 vorpal greatsword', attackBonus: 31, damage: '2d6+9', type: 'melee' },
      { name: '+1 flaming whip', attackBonus: 26, damage: '1d4+4', type: 'melee' }
    ],
    fullAttacks: [
      { name: '+1 vorpal greatsword', attackBonus: 31, damage: '2d6+9', type: 'melee' },
      { name: '+1 flaming whip', attackBonus: 26, damage: '1d4+4', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft. (20 ft. with whip)',
    abilities: { STR: 35, DEX: 25, CON: 31, INT: 24, WIS: 24, CHA: 26 },
    saves: { fortitude: 22, reflex: 19, will: 19 },
    skills: { Bluff: 31, Climb: 35, Concentration: 33, Diplomacy: 12, Disguise: 8, Hide: 26, Intimidate: 35, Jump: 39, Knowledge: 30, Listen: 30, 'Move Silently': 30, Search: 30, 'Sense Motive': 30, Spellcraft: 30, Spot: 30, 'Use Rope': 7 },
    feats: ['Cleave', 'Great Cleave', 'Improved Initiative', 'Improved Two-Weapon Fighting', 'Power Attack', 'Two-Weapon Fighting', 'Weapon Focus (greatsword)', 'Weapon Focus (whip)'],
    specialAttacks: [
      { name: 'Death Throes', type: 'Ex', description: 'Explodes in 100-ft. radius blast dealing 50 points of damage' },
      { name: 'Entangle', type: 'Ex', description: 'Whip entangles opponents up to Huge size' },
      { name: 'Fear Aura', type: 'Su', description: 'Fear in 15-ft. radius, Will DC 26 negates' },
      { name: 'Flaming Body', type: 'Su', description: 'Deals 6d6 fire damage to attackers in melee' },
      { name: 'Spell-like Abilities', type: 'Sp', description: 'At will—blasphemy, dominate person, greater dispel magic, greater teleport, power word stun, telekinesis, unholy aura' },
      { name: 'Summon Demon', type: 'Sp', description: '1/day summon 1 nalfeshnee, 1d4 hezrous, or 1d6 vrocks' }
    ],
    specialQualities: [
      { name: 'Damage Reduction', type: 'Su', description: 'DR 15/cold iron and good' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Immunity to electricity, fire, and poison', type: 'Ex', description: 'Immune to electricity, fire, and poison' },
      { name: 'Resistance to acid and cold', type: 'Ex', description: 'Resistance 10' },
      { name: 'See in darkness', type: 'Su', description: 'Can see in magical darkness' },
      { name: 'Telepathy', type: 'Su', description: 'Telepathy 100 ft.' }
    ],
    challengeRating: 20,
    environment: 'Infinite Layers of the Abyss',
    organization: 'Solitary or troupe (1 balor, 1 marilith, and 2-5 hezrous)',
    treasure: 'Standard coins; double goods; standard items',
    alignment: 'Chaotic Evil',
    damageReduction: { amount: 15, bypass: 'cold iron and good' },
    damageImmunity: ['electricity', 'fire', 'poison'],
    energyResistance: { acid: 10, cold: 10 },
    spellResistance: 28
  },

  // ===== MORE UNDEAD =====
  {
    id: 'vampire',
    name: 'Vampire',
    size: 'Medium',
    type: 'Undead',
    hitDice: '4d12+3',
    hitPoints: { average: 29, roll: '4d12+3' },
    initiative: 8,
    speed: { land: 30 },
    armorClass: {
      total: 20,
      touch: 14,
      flatFooted: 16,
      size: 0,
      dex: 4,
      natural: 6
    },
    baseAttack: 2,
    grapple: 5,
    attacks: [
      { name: 'Slam', attackBonus: 5, damage: '1d6+4', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 16, DEX: 18, CON: 0, INT: 13, WIS: 14, CHA: 16 },
    saves: { fortitude: 1, reflex: 5, will: 6 },
    skills: { Bluff: 9, Hide: 9, Listen: 11, 'Move Silently': 11, Search: 8, 'Sense Motive': 9, Spot: 11 },
    feats: ['Alertness', 'Combat Reflexes', 'Dodge', 'Improved Initiative', 'Lightning Reflexes'],
    specialAttacks: [
      { name: 'Blood Drain', type: 'Ex', description: 'Drains blood for 1d4 Constitution damage each round while grappling' },
      { name: 'Children of the Night', type: 'Su', description: 'Can command rats, bats, and wolves' },
      { name: 'Dominate', type: 'Su', description: 'As dominate person spell, Will DC 14 negates' },
      { name: 'Create Spawn', type: 'Su', description: 'Humanoid or monstrous humanoid killed becomes vampire spawn' },
      { name: 'Energy Drain', type: 'Su', description: 'Living creatures hit gain two negative levels' }
    ],
    specialQualities: [
      { name: 'Undead Traits', type: 'Ex', description: 'Immune to mind-affecting, poison, sleep, paralysis, stunning, disease, death effects' },
      { name: 'Damage Reduction', type: 'Su', description: 'DR 10/silver and magic' },
      { name: 'Fast Healing', type: 'Ex', description: 'Fast healing 5' },
      { name: 'Gaseous Form', type: 'Su', description: 'Can assume gaseous form at will' },
      { name: 'Resistances', type: 'Ex', description: 'Cold and electricity resistance 10' },
      { name: 'Spider Climb', type: 'Ex', description: 'Can climb on walls and ceilings as if under spider climb spell' },
      { name: 'Turn Resistance', type: 'Ex', description: '+4 turn resistance' }
    ],
    challengeRating: 9,
    environment: 'Any',
    organization: 'Solitary or family (vampire plus 2-5 spawn)',
    treasure: 'Double standard',
    alignment: 'Lawful Evil',
    damageReduction: { amount: 10, bypass: 'silver and magic' },
    energyResistance: { cold: 10, electricity: 10 }
  },

  // ===== MORE CONSTRUCTS =====
  {
    id: 'iron-golem',
    name: 'Iron Golem',
    size: 'Large',
    type: 'Construct',
    hitDice: '18d10+30',
    hitPoints: { average: 129, roll: '18d10+30' },
    initiative: -1,
    speed: { land: 20 },
    armorClass: {
      total: 30,
      touch: 8,
      flatFooted: 30,
      size: -1,
      dex: -1,
      natural: 22
    },
    baseAttack: 13,
    grapple: 28,
    attacks: [
      { name: 'Slam', attackBonus: 23, damage: '2d10+11', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Slams', attackBonus: 23, damage: '2d10+11', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 33, DEX: 9, CON: 0, INT: 0, WIS: 11, CHA: 1 },
    saves: { fortitude: 6, reflex: 5, will: 6 },
    skills: {},
    feats: [],
    specialAttacks: [
      { name: 'Breath Weapon', type: 'Su', description: '10-ft. cube of poisonous gas, Fort DC 19 or die' }
    ],
    specialQualities: [
      { name: 'Construct Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, disease, and similar effects' },
      { name: 'Damage Reduction', type: 'Ex', description: 'DR 15/adamantine' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Magic Immunity', type: 'Ex', description: 'Immune to most spells and spell-like abilities' }
    ],
    challengeRating: 13,
    environment: 'Any',
    organization: 'Solitary or gang (2-4)',
    treasure: 'None',
    alignment: 'True Neutral',
    damageReduction: { amount: 15, bypass: 'adamantine' },
    damageImmunity: ['magic'],
    spellResistance: 0
  },

  // ===== MORE ANIMALS & BEASTS =====
  {
    id: 'tiger',
    name: 'Tiger',
    size: 'Large',
    type: 'Animal',
    hitDice: '6d8+18',
    hitPoints: { average: 45, roll: '6d8+18' },
    initiative: 2,
    speed: { land: 40 },
    armorClass: {
      total: 14,
      touch: 11,
      flatFooted: 12,
      size: -1,
      dex: 2,
      natural: 3
    },
    baseAttack: 4,
    grapple: 14,
    attacks: [
      { name: 'Claw', attackBonus: 9, damage: '1d8+6', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Claws', attackBonus: 9, damage: '1d8+6', type: 'melee' },
      { name: 'Bite', attackBonus: 4, damage: '2d6+3', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 23, DEX: 15, CON: 17, INT: 2, WIS: 12, CHA: 6 },
    saves: { fortitude: 8, reflex: 7, will: 3 },
    skills: { Balance: 6, Hide: 3, Jump: 12, Listen: 3, 'Move Silently': 7, Spot: 3, Swim: 11 },
    feats: ['Alertness', 'Improved Grab'],
    specialAttacks: [
      { name: 'Improved Grab', type: 'Ex', description: 'Can grapple on successful claw attack' },
      { name: 'Pounce', type: 'Ex', description: 'Can make full attack after charge' },
      { name: 'Rake', type: 'Ex', description: '2 claws +9 melee, damage 1d8+3, when pouncing or grappling' }
    ],
    specialQualities: [
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies by scent' }
    ],
    challengeRating: 4,
    environment: 'Warm forests',
    organization: 'Solitary',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  {
    id: 'giant-eagle',
    name: 'Giant Eagle',
    size: 'Large',
    type: 'Magical Beast',
    hitDice: '4d10+4',
    hitPoints: { average: 26, roll: '4d10+4' },
    initiative: 3,
    speed: { land: 10, fly: 80 },
    armorClass: {
      total: 15,
      touch: 12,
      flatFooted: 12,
      size: -1,
      dex: 3,
      natural: 3
    },
    baseAttack: 4,
    grapple: 12,
    attacks: [
      { name: 'Claw', attackBonus: 7, damage: '1d6+4', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Claws', attackBonus: 7, damage: '1d6+4', type: 'melee' },
      { name: 'Bite', attackBonus: 2, damage: '1d8+2', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 18, DEX: 17, CON: 12, INT: 10, WIS: 14, CHA: 10 },
    saves: { fortitude: 5, reflex: 7, will: 3 },
    skills: { Knowledge: 2, Listen: 5, 'Sense Motive': 2, Spot: 15 },
    feats: ['Alertness', 'Flyby Attack'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' }
    ],
    challengeRating: 3,
    environment: 'Temperate mountains',
    organization: 'Solitary, pair, or eyrie (5-12)',
    treasure: 'None',
    alignment: 'Neutral Good'
  },

  // ===== MORE ELEMENTALS =====
  {
    id: 'water-elemental-large',
    name: 'Large Water Elemental',
    size: 'Large',
    type: 'Elemental',
    subtype: ['Water', 'Extraplanar'],
    hitDice: '8d8+32',
    hitPoints: { average: 68, roll: '8d8+32' },
    initiative: 2,
    speed: { land: 20, swim: 90 },
    armorClass: {
      total: 17,
      touch: 11,
      flatFooted: 15,
      size: -1,
      dex: 2,
      natural: 6
    },
    baseAttack: 6,
    grapple: 15,
    attacks: [
      { name: 'Slam', attackBonus: 10, damage: '2d8+5', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Slams', attackBonus: 10, damage: '2d8+5', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 20, DEX: 14, CON: 19, INT: 6, WIS: 11, CHA: 11 },
    saves: { fortitude: 10, reflex: 8, will: 2 },
    skills: { Listen: 7, Spot: 8 },
    feats: ['Cleave', 'Great Cleave', 'Power Attack'],
    specialAttacks: [
      { name: 'Water Mastery', type: 'Ex', description: '+1 attack and damage if opponent touches water' },
      { name: 'Drench', type: 'Ex', description: 'Extinguishes torches and small fires automatically' },
      { name: 'Vortex', type: 'Su', description: 'Can transform into whirlpool in water' }
    ],
    specialQualities: [
      { name: 'Elemental Traits', type: 'Ex', description: 'Immune to poison, sleep, paralysis, and stunning' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' }
    ],
    challengeRating: 5,
    environment: 'Elemental Plane of Water',
    organization: 'Solitary',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  {
    id: 'earth-elemental-large',
    name: 'Large Earth Elemental',
    size: 'Large',
    type: 'Elemental',
    subtype: ['Earth', 'Extraplanar'],
    hitDice: '8d8+32',
    hitPoints: { average: 68, roll: '8d8+32' },
    initiative: -1,
    speed: { land: 20 },
    armorClass: {
      total: 18,
      touch: 8,
      flatFooted: 18,
      size: -1,
      dex: -1,
      natural: 10
    },
    baseAttack: 6,
    grapple: 16,
    attacks: [
      { name: 'Slam', attackBonus: 12, damage: '2d8+7', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Slams', attackBonus: 12, damage: '2d8+7', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 25, DEX: 8, CON: 19, INT: 6, WIS: 11, CHA: 11 },
    saves: { fortitude: 10, reflex: 1, will: 2 },
    skills: { Listen: 7, Spot: 8 },
    feats: ['Cleave', 'Great Cleave', 'Power Attack'],
    specialAttacks: [
      { name: 'Earth Mastery', type: 'Ex', description: '+1 attack and damage if opponent is touching the ground' },
      { name: 'Push', type: 'Ex', description: 'Can start bull rush without provoking AoO' }
    ],
    specialQualities: [
      { name: 'Elemental Traits', type: 'Ex', description: 'Immune to poison, sleep, paralysis, and stunning' },
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Earth Glide', type: 'Ex', description: 'Can burrow through stone and earth' }
    ],
    challengeRating: 5,
    environment: 'Elemental Plane of Earth',
    organization: 'Solitary',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  // ===== MORE ABERRATIONS =====
  {
    id: 'carrion-crawler',
    name: 'Carrion Crawler',
    size: 'Large',
    type: 'Aberration',
    hitDice: '3d8+6',
    hitPoints: { average: 19, roll: '3d8+6' },
    initiative: 1,
    speed: { land: 30, climb: 15 },
    armorClass: {
      total: 17,
      touch: 10,
      flatFooted: 16,
      size: -1,
      dex: 1,
      natural: 7
    },
    baseAttack: 2,
    grapple: 8,
    attacks: [
      { name: 'Tentacle', attackBonus: 3, damage: '0', type: 'melee' }
    ],
    fullAttacks: [
      { name: '8 Tentacles', attackBonus: 3, damage: '0', type: 'melee' },
      { name: 'Bite', attackBonus: 1, damage: '1d4+1', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 14, DEX: 13, CON: 14, INT: 1, WIS: 12, CHA: 5 },
    saves: { fortitude: 5, reflex: 2, will: 2 },
    skills: { Climb: 10, Listen: 6, Spot: 6 },
    feats: ['Weapon Finesse'],
    specialAttacks: [
      { name: 'Paralysis', type: 'Ex', description: 'Tentacle hit, Fort DC 13 or paralyzed for 2d6+2 rounds' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies by scent' }
    ],
    challengeRating: 4,
    environment: 'Underground',
    organization: 'Solitary or cluster (2-5)',
    treasure: 'None',
    alignment: 'True Neutral'
  },

  // ===== MORE FEY =====
  {
    id: 'pixie',
    name: 'Pixie',
    size: 'Small',
    type: 'Fey',
    hitDice: '1d6',
    hitPoints: { average: 3, roll: '1d6' },
    initiative: 4,
    speed: { land: 20, fly: 60 },
    armorClass: {
      total: 16,
      touch: 15,
      flatFooted: 12,
      size: 1,
      dex: 4,
      natural: 1
    },
    baseAttack: 0,
    grapple: -9,
    attacks: [
      { name: 'Short sword', attackBonus: 1, damage: '1d4-2', type: 'melee' },
      { name: 'Longbow', attackBonus: 5, damage: '1d6-2', type: 'ranged' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 7, DEX: 18, CON: 11, INT: 16, WIS: 15, CHA: 16 },
    saves: { fortitude: 0, reflex: 6, will: 4 },
    skills: { Concentration: 4, Escape: 8, Hide: 12, Listen: 6, 'Move Silently': 8, Ride: 8, Search: 7, Spot: 6 },
    feats: ['Dodge', 'Weapon Finesse'],
    specialAttacks: [
      { name: 'Spell-like Abilities', type: 'Sp', description: '1/day—confusion, dancing lights, detect chaos/evil/good/law, detect thoughts, dispel magic, entangle, permanent image, polymorph, sleep' },
      { name: 'Special Arrows', type: 'Su', description: 'Sleep arrows and memory loss arrows' }
    ],
    specialQualities: [
      { name: 'Invisibility', type: 'Su', description: 'Can become invisible at will as greater invisibility' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' }
    ],
    challengeRating: 4,
    environment: 'Temperate forests',
    organization: 'Gang (2-5), band (6-11), or tribe (20-80)',
    treasure: '1/8 coins; no goods; no items',
    alignment: 'Neutral Good',
    spellResistance: 15
  },

  // ===== MORE MONSTROUS HUMANOIDS =====
  {
    id: 'medusa',
    name: 'Medusa',
    size: 'Medium',
    type: 'Monstrous Humanoid',
    hitDice: '6d8+6',
    hitPoints: { average: 33, roll: '6d8+6' },
    initiative: 2,
    speed: { land: 30 },
    armorClass: {
      total: 15,
      touch: 12,
      flatFooted: 13,
      size: 0,
      dex: 2,
      natural: 3
    },
    baseAttack: 6,
    grapple: 7,
    attacks: [
      { name: 'Dagger', attackBonus: 8, damage: '1d4+1', type: 'melee' },
      { name: 'Longbow', attackBonus: 8, damage: '1d8', type: 'ranged' }
    ],
    fullAttacks: [
      { name: 'Snakes', attackBonus: 3, damage: '1d4 poison', type: 'melee' },
      { name: 'Dagger', attackBonus: 8, damage: '1d4+1', type: 'melee' }
    ],
    space: '5 ft.',
    reach: '5 ft.',
    abilities: { STR: 12, DEX: 15, CON: 12, INT: 12, WIS: 13, CHA: 15 },
    saves: { fortitude: 3, reflex: 7, will: 6 },
    skills: { Bluff: 9, Disguise: 9, 'Move Silently': 9, Spot: 8 },
    feats: ['Point Blank Shot', 'Precise Shot', 'Weapon Finesse'],
    specialAttacks: [
      { name: 'Petrifying Gaze', type: 'Su', description: 'Turn to stone permanently, Fort DC 15 negates, 30 ft. range' },
      { name: 'Poison', type: 'Ex', description: 'Snake bite, Fort DC 14, initial 1d6 Str, secondary 2d6 Str' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' }
    ],
    challengeRating: 7,
    environment: 'Temperate marshes and underground',
    organization: 'Solitary',
    treasure: 'Double standard',
    alignment: 'Lawful Evil'
  },

  // ===== MORE PLANTS =====
  {
    id: 'treant',
    name: 'Treant',
    size: 'Huge',
    type: 'Plant',
    hitDice: '12d8+60',
    hitPoints: { average: 114, roll: '12d8+60' },
    initiative: -1,
    speed: { land: 30 },
    armorClass: {
      total: 20,
      touch: 7,
      flatFooted: 20,
      size: -2,
      dex: -1,
      natural: 13
    },
    baseAttack: 9,
    grapple: 25,
    attacks: [
      { name: 'Slam', attackBonus: 15, damage: '2d6+8', type: 'melee' }
    ],
    fullAttacks: [
      { name: '2 Slams', attackBonus: 15, damage: '2d6+8', type: 'melee' }
    ],
    space: '15 ft.',
    reach: '15 ft.',
    abilities: { STR: 27, DEX: 8, CON: 21, INT: 12, WIS: 16, CHA: 12 },
    saves: { fortitude: 13, reflex: 3, will: 9 },
    skills: { Diplomacy: 3, Hide: -9, Intimidate: 16, Knowledge: 13, Listen: 16, 'Sense Motive': 13, Spot: 16, Survival: 13 },
    feats: ['Alertness', 'Great Fortitude', 'Iron Will', 'Power Attack', 'Weapon Focus (slam)'],
    specialAttacks: [
      { name: 'Trample', type: 'Ex', description: '2d6+12 damage, Reflex DC 23 for half' },
      { name: 'Animate Trees', type: 'Sp', description: 'Can animate 2 trees within 180 feet at will' }
    ],
    specialQualities: [
      { name: 'Plant Traits', type: 'Ex', description: 'Immune to mind-affecting effects, poison, sleep, paralysis, polymorph, and stunning' },
      { name: 'Damage Reduction', type: 'Ex', description: 'DR 10/slashing' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' }
    ],
    challengeRating: 8,
    environment: 'Temperate forests',
    organization: 'Solitary or grove (2-5)',
    treasure: 'Standard',
    alignment: 'Neutral Good',
    damageReduction: { amount: 10, bypass: 'slashing' }
  },

  // ===== FINAL COLLECTION: ICONIC & ESSENTIAL MONSTERS =====
  {
    id: 'tarrasque',
    name: 'Tarrasque',
    size: 'Colossal',
    type: 'Magical Beast',
    hitDice: '48d10+594',
    hitPoints: { average: 858, roll: '48d10+594' },
    initiative: 7,
    speed: { land: 20 },
    armorClass: {
      total: 35,
      touch: 5,
      flatFooted: 32,
      size: -8,
      dex: 3,
      natural: 40
    },
    baseAttack: 48,
    grapple: 81,
    attacks: [
      { name: 'Bite', attackBonus: 57, damage: '4d8+17', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 57, damage: '4d8+17', type: 'melee' },
      { name: '2 Claws', attackBonus: 55, damage: '1d12+8', type: 'melee' },
      { name: '2 Gores', attackBonus: 55, damage: '1d10+8', type: 'melee' },
      { name: 'Tail Slap', attackBonus: 55, damage: '3d8+8', type: 'melee' }
    ],
    space: '30 ft.',
    reach: '20 ft.',
    abilities: { STR: 45, DEX: 16, CON: 35, INT: 3, WIS: 14, CHA: 14 },
    saves: { fortitude: 38, reflex: 29, will: 18 },
    skills: { Listen: 17, Search: 14, Spot: 17 },
    feats: ['Alertness', 'Awesome Blow', 'Blind-Fight', 'Cleave', 'Combat Reflexes', 'Dodge', 'Great Cleave', 'Improved Bull Rush', 'Improved Initiative', 'Iron Will', 'Mobility', 'Power Attack', 'Toughness', 'Weapon Focus (bite)'],
    specialAttacks: [
      { name: 'Improved Grab', type: 'Ex', description: 'Can grapple foes with bite' },
      { name: 'Swallow Whole', type: 'Ex', description: 'Can swallow Medium or smaller opponents whole' },
      { name: 'Frightful Presence', type: 'Su', description: '300-ft. radius, creatures with fewer than 48 HD make Will DC 36 or become frightened' },
      { name: 'Rush', type: 'Ex', description: 'Once per minute can move up to 150 feet and make full attack' }
    ],
    specialQualities: [
      { name: 'Damage Reduction', type: 'Ex', description: 'DR 15/epic' },
      { name: 'Spell Resistance', type: 'Ex', description: 'SR 32' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies by scent' },
      { name: 'Carapace', type: 'Su', description: 'Reflects targeted spells, spell-like abilities, and supernatural abilities back at caster' },
      { name: 'Regeneration', type: 'Ex', description: 'Regeneration 40' }
    ],
    challengeRating: 20,
    environment: 'Any',
    organization: 'Solitary',
    treasure: 'None',
    alignment: 'True Neutral',
    damageReduction: { amount: 15, bypass: 'epic' },
    spellResistance: 32
  },

  {
    id: 'chimera',
    name: 'Chimera',
    size: 'Large',
    type: 'Magical Beast',
    hitDice: '9d10+18',
    hitPoints: { average: 67, roll: '9d10+18' },
    initiative: 2,
    speed: { land: 30, fly: 50 },
    armorClass: {
      total: 19,
      touch: 11,
      flatFooted: 17,
      size: -1,
      dex: 2,
      natural: 8
    },
    baseAttack: 9,
    grapple: 17,
    attacks: [
      { name: 'Bite', attackBonus: 12, damage: '2d6+4', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 12, damage: '2d6+4', type: 'melee' },
      { name: 'Bite', attackBonus: 12, damage: '1d8+4', type: 'melee' },
      { name: 'Gore', attackBonus: 12, damage: '1d8+4', type: 'melee' },
      { name: '2 Claws', attackBonus: 10, damage: '1d6+2', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 19, DEX: 15, CON: 15, INT: 4, WIS: 13, CHA: 10 },
    saves: { fortitude: 8, reflex: 8, will: 4 },
    skills: { Hide: 5, Listen: 7, Spot: 7 },
    feats: ['Alertness', 'Hover', 'Iron Will', 'Multiattack'],
    specialAttacks: [
      { name: 'Breath Weapon', type: 'Su', description: '40-ft. cone of fire, 3d8 damage, Reflex DC 16 half, usable once every 1d4 rounds' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies by scent' }
    ],
    challengeRating: 7,
    environment: 'Temperate hills',
    organization: 'Solitary, pride (3-5), or flight (6-8)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'ettin',
    name: 'Ettin',
    size: 'Large',
    type: 'Giant',
    hitDice: '10d8+20',
    hitPoints: { average: 65, roll: '10d8+20' },
    initiative: 3,
    speed: { land: 40 },
    armorClass: {
      total: 18,
      touch: 8,
      flatFooted: 18,
      size: -1,
      dex: 0,
      natural: 9
    },
    baseAttack: 7,
    grapple: 17,
    attacks: [
      { name: 'Morningstar', attackBonus: 12, damage: '2d6+6', type: 'melee' },
      { name: 'Javelin', attackBonus: 6, damage: '1d8+6', type: 'ranged' }
    ],
    fullAttacks: [
      { name: 'Morningstar', attackBonus: 12, damage: '2d6+6', type: 'melee' },
      { name: 'Morningstar', attackBonus: 12, damage: '2d6+6', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 23, DEX: 10, CON: 15, INT: 6, WIS: 10, CHA: 11 },
    saves: { fortitude: 9, reflex: 3, will: 3 },
    skills: { Listen: 10, Search: 4, Spot: 10 },
    feats: ['Alertness', 'Improved Initiative', 'Iron Will', 'Two-Weapon Fighting'],
    specialAttacks: [],
    specialQualities: [
      { name: 'Superior Two-Weapon Fighting', type: 'Ex', description: 'Fights with two weapons without penalty due to having two heads' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' }
    ],
    challengeRating: 6,
    environment: 'Cold hills',
    organization: 'Solitary, gang (2-4), troupe (1-2 plus 1-2 brown bears), band (3-5 plus 1-2 brown bears), or colony (3-5 plus 1-2 brown bears and 7-12 orcs)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil'
  },

  {
    id: 'roper',
    name: 'Roper',
    size: 'Large',
    type: 'Aberration',
    hitDice: '12d8+60',
    hitPoints: { average: 114, roll: '12d8+60' },
    initiative: 1,
    speed: { land: 10 },
    armorClass: {
      total: 24,
      touch: 10,
      flatFooted: 23,
      size: -1,
      dex: 1,
      natural: 14
    },
    baseAttack: 9,
    grapple: 20,
    attacks: [
      { name: 'Bite', attackBonus: 15, damage: '2d6+10', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Bite', attackBonus: 15, damage: '2d6+10', type: 'melee' },
      { name: '6 Strands', attackBonus: 10, damage: '0', type: 'ranged' }
    ],
    space: '10 ft.',
    reach: '10 ft.',
    abilities: { STR: 25, DEX: 12, CON: 21, INT: 13, WIS: 16, CHA: 12 },
    saves: { fortitude: 9, reflex: 5, will: 11 },
    skills: { Climb: 15, Hide: 8, Listen: 18, Spot: 18 },
    feats: ['Alertness', 'Improved Bull Rush', 'Iron Will', 'Power Attack', 'Weapon Focus (strand)'],
    specialAttacks: [
      { name: 'Strands', type: 'Ex', description: '50-ft. range, strength drain 1d8, can pull victims' },
      { name: 'Improved Grab', type: 'Ex', description: 'Can grapple with strands' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Vulnerability to electricity', type: 'Ex', description: 'Takes +50% damage from electricity' },
      { name: 'Resistance to cold', type: 'Ex', description: 'Resistance 30' }
    ],
    challengeRating: 12,
    environment: 'Underground',
    organization: 'Solitary or cluster (2-4)',
    treasure: 'Standard',
    alignment: 'Chaotic Evil',
    vulnerability: ['electricity'],
    energyResistance: { cold: 30 }
  },

  {
    id: 'manticore',
    name: 'Manticore',
    size: 'Large',
    type: 'Magical Beast',
    hitDice: '6d10+12',
    hitPoints: { average: 45, roll: '6d10+12' },
    initiative: 2,
    speed: { land: 30, fly: 50 },
    armorClass: {
      total: 17,
      touch: 11,
      flatFooted: 15,
      size: -1,
      dex: 2,
      natural: 6
    },
    baseAttack: 6,
    grapple: 14,
    attacks: [
      { name: 'Claw', attackBonus: 9, damage: '2d4+4', type: 'melee' },
      { name: 'Tail spikes', attackBonus: 7, damage: '1d8+2', type: 'ranged' }
    ],
    fullAttacks: [
      { name: '2 Claws', attackBonus: 9, damage: '2d4+4', type: 'melee' },
      { name: 'Bite', attackBonus: 4, damage: '1d8+2', type: 'melee' },
      { name: '4 Tail spikes', attackBonus: 7, damage: '1d8+2', type: 'ranged' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 18, DEX: 15, CON: 15, INT: 7, WIS: 12, CHA: 9 },
    saves: { fortitude: 7, reflex: 7, will: 3 },
    skills: { Listen: 5, Spot: 9, Survival: 1 },
    feats: ['Flyby Attack', 'Multiattack', 'Weapon Focus (tail spikes)'],
    specialAttacks: [
      { name: 'Spikes', type: 'Ex', description: 'Can fire up to 4 tail spikes per round, range increment 180 ft.' }
    ],
    specialQualities: [
      { name: 'Darkvision', type: 'Ex', description: 'Darkvision 60 ft.' },
      { name: 'Low-light vision', type: 'Ex', description: 'Can see twice as far as humans in dim light' },
      { name: 'Scent', type: 'Ex', description: 'Can detect approaching enemies by scent' }
    ],
    challengeRating: 5,
    environment: 'Warm marshes and underground',
    organization: 'Solitary, pair, or pride (3-6)',
    treasure: 'Standard',
    alignment: 'Lawful Evil'
  },

  {
    id: 'unicorn',
    name: 'Unicorn',
    size: 'Large',
    type: 'Magical Beast',
    hitDice: '4d10+20',
    hitPoints: { average: 42, roll: '4d10+20' },
    initiative: 4,
    speed: { land: 60 },
    armorClass: {
      total: 18,
      touch: 13,
      flatFooted: 14,
      size: -1,
      dex: 4,
      natural: 5
    },
    baseAttack: 4,
    grapple: 12,
    attacks: [
      { name: 'Horn', attackBonus: 11, damage: '1d8+8', type: 'melee' },
      { name: 'Hoof', attackBonus: 6, damage: '1d4+4', type: 'melee' }
    ],
    fullAttacks: [
      { name: 'Horn', attackBonus: 11, damage: '1d8+8', type: 'melee' },
      { name: '2 Hooves', attackBonus: 6, damage: '1d4+4', type: 'melee' }
    ],
    space: '10 ft.',
    reach: '5 ft.',
    abilities: { STR: 20, DEX: 19, CON: 21, INT: 10, WIS: 21, CHA: 24 },
    saves: { fortitude: 9, reflex: 8, will: 8 },
    skills: { Listen: 13, 'Move Silently': 9, 'Sense Motive': 7, Spot: 13, Survival: 8 },
    feats: ['Alertness', 'Skill Focus (Survival)'],
    specialAttacks: [
      { name: 'Pounce', type: 'Ex', description: 'Can make full attack after charge' },
      { name: 'Spell-like abilities', type: 'Sp', description: 'At will—detect evil; 1/day cure light wounds, cure moderate wounds, neutralize poison, greater teleport' }
    ],
    specialQualities: [
      { name: 'Magic Circle against Evil', type: 'Su', description: 'Constantly surrounded by magic circle against evil effect' },
      { name: 'Spell Resistance', type: 'Ex', description: 'SR 25' },
      { name: 'Wild Empathy', type: 'Ex', description: 'Can improve attitude of animals as druid' }
    ],
    challengeRating: 3,
    environment: 'Temperate forests',
    organization: 'Solitary, pair, or grace (3-6)',
    treasure: 'None',
    alignment: 'Chaotic Good',
    spellResistance: 25
  }
]

// Helper functions for monster database
export function getMonsterById(id: string): MonsterData | undefined {
  return MONSTER_DATABASE.find(monster => monster.id === id)
}

export function getMonstersByType(type: MonsterData['type']): MonsterData[] {
  return MONSTER_DATABASE.filter(monster => monster.type === type)
}

export function getMonstersBySize(size: MonsterData['size']): MonsterData[] {
  return MONSTER_DATABASE.filter(monster => monster.size === size)
}

export function getMonstersByCR(cr: number | string): MonsterData[] {
  return MONSTER_DATABASE.filter(monster => monster.challengeRating === cr)
}

export function getRandomMonster(): MonsterData {
  return MONSTER_DATABASE[Math.floor(Math.random() * MONSTER_DATABASE.length)]
}

export function getRandomMonsterByCR(maxCR: number): MonsterData {
  const eligibleMonsters = MONSTER_DATABASE.filter(monster => {
    const cr = typeof monster.challengeRating === 'string' 
      ? parseFloat(monster.challengeRating) || 0.25
      : monster.challengeRating
    return cr <= maxCR
  })
  
  if (eligibleMonsters.length === 0) {
    return MONSTER_DATABASE[0] // Return first monster as fallback
  }
  
  return eligibleMonsters[Math.floor(Math.random() * eligibleMonsters.length)]
}

// Search and filter functions
export function searchMonsters(query: string): MonsterData[] {
  const lowercaseQuery = query.toLowerCase()
  return MONSTER_DATABASE.filter(monster => 
    monster.name.toLowerCase().includes(lowercaseQuery) ||
    monster.type.toLowerCase().includes(lowercaseQuery) ||
    monster.environment.toLowerCase().includes(lowercaseQuery)
  )
}

export function filterMonsters(filter: {
  type?: MonsterData['type']
  size?: MonsterData['size']
  maxCR?: number
  minCR?: number
  alignment?: MonsterData['alignment']
}): MonsterData[] {
  return MONSTER_DATABASE.filter(monster => {
    if (filter.type && monster.type !== filter.type) return false
    if (filter.size && monster.size !== filter.size) return false
    if (filter.alignment && monster.alignment !== filter.alignment) return false
    
    const cr = typeof monster.challengeRating === 'string' 
      ? parseFloat(monster.challengeRating) || 0.25
      : monster.challengeRating
    
    if (filter.maxCR && cr > filter.maxCR) return false
    if (filter.minCR && cr < filter.minCR) return false
    
    return true
  })
}
