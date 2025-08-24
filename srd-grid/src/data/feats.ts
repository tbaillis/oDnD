import type { Feat } from '../game/character'

/**
 * Complete D&D 3.5 SRD Feat Database
 * All feat data sourced from official D&D 3.5 System Reference Document
 * Implements comprehensive feat system with prerequisites, benefits, and mechanical effects
 */

export const FEATS_DATABASE: Record<string, Feat> = {
  // === GENERAL FEATS ===
  
  'Acrobatic': {
    name: 'Acrobatic',
    type: 'general',
    prerequisites: [],
    description: 'You have excellent body awareness and coordination.',
    benefits: ['+2 bonus on Jump checks', '+2 bonus on Tumble checks'],
    special: undefined
  },

  'Agile': {
    name: 'Agile',
    type: 'general', 
    prerequisites: [],
    description: 'You are particularly flexible and poised.',
    benefits: ['+2 bonus on Balance checks', '+2 bonus on Escape Artist checks'],
    special: undefined
  },

  'Alertness': {
    name: 'Alertness',
    type: 'general',
    prerequisites: [],
    description: 'You have finely tuned senses.',
    benefits: ['+2 bonus on Listen checks', '+2 bonus on Spot checks'],
    special: 'The master of a familiar gains the benefit of the Alertness feat whenever the familiar is within arm\'s reach.'
  },

  'Animal Affinity': {
    name: 'Animal Affinity',
    type: 'general',
    prerequisites: [],
    description: 'You are good with animals.',
    benefits: ['+2 bonus on Handle Animal checks', '+2 bonus on Ride checks'],
    special: undefined
  },

  'Armor Proficiency (Light)': {
    name: 'Armor Proficiency (Light)',
    type: 'general',
    prerequisites: [],
    description: 'You are proficient with light armor.',
    benefits: ['When wearing light armor, armor check penalty applies only to Balance, Climb, Escape Artist, Hide, Jump, Move Silently, Sleight of Hand, and Tumble checks'],
    special: 'All characters except wizards, sorcerers, and monks automatically have this feat. They need not select it.'
  },

  'Armor Proficiency (Medium)': {
    name: 'Armor Proficiency (Medium)',
    type: 'general',
    prerequisites: [{ type: 'feat', name: 'Armor Proficiency (Light)' }],
    description: 'You are proficient with medium armor.',
    benefits: ['Same as Armor Proficiency (Light)'],
    special: 'Fighters, barbarians, paladins, clerics, druids, and bards automatically have this feat. They need not select it.'
  },

  'Armor Proficiency (Heavy)': {
    name: 'Armor Proficiency (Heavy)',
    type: 'general',
    prerequisites: [
      { type: 'feat', name: 'Armor Proficiency (Light)' },
      { type: 'feat', name: 'Armor Proficiency (Medium)' }
    ],
    description: 'You are proficient with heavy armor.',
    benefits: ['Same as Armor Proficiency (Light)'],
    special: 'Fighters, paladins, and clerics automatically have this feat. They need not select it.'
  },

  'Athletic': {
    name: 'Athletic',
    type: 'general',
    prerequisites: [],
    description: 'You have a knack for athletic endeavors.',
    benefits: ['+2 bonus on Climb checks', '+2 bonus on Swim checks'],
    special: undefined
  },

  'Augment Summoning': {
    name: 'Augment Summoning',
    type: 'general',
    prerequisites: [{ type: 'feat', name: 'Spell Focus (Conjuration)' }],
    description: 'Your summoned creatures are more powerful than normal.',
    benefits: ['+4 enhancement bonus to Strength and Constitution for all summoned creatures'],
    special: undefined
  },

  'Blind-Fight': {
    name: 'Blind-Fight',
    type: 'fighter-bonus',
    prerequisites: [],
    description: 'You are skilled at fighting in conditions with poor visibility.',
    benefits: [
      'In melee, reroll miss chances due to concealment',
      'Invisible attackers gain no bonuses against you in melee',
      'Speed reduced to 3/4 instead of 1/2 when unable to see'
    ],
    special: 'A fighter may select Blind-Fight as one of his fighter bonus feats.'
  },

  'Combat Casting': {
    name: 'Combat Casting',
    type: 'general',
    prerequisites: [],
    description: 'You are adept at casting spells in combat.',
    benefits: ['+4 bonus on Concentration checks to cast spells defensively or while grappling'],
    special: undefined
  },

  'Combat Expertise': {
    name: 'Combat Expertise',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'ability', name: 'INT', value: 13 }],
    description: 'You are trained at using your combat skill for defense as well as offense.',
    benefits: [
      'When using attack or full attack action in melee, you can take up to -5 penalty on attack rolls to gain equal dodge bonus to AC',
      'Penalty cannot exceed base attack bonus'
    ],
    special: 'A fighter may select Combat Expertise as one of his fighter bonus feats.'
  },

  'Combat Reflexes': {
    name: 'Combat Reflexes',
    type: 'fighter-bonus',
    prerequisites: [],
    description: 'You can respond quickly and repeatedly to opponents who let their defenses down.',
    benefits: [
      'Make additional attacks of opportunity equal to Dexterity bonus',
      'Can make attacks of opportunity while flat-footed'
    ],
    special: 'A fighter may select Combat Reflexes as one of his fighter bonus feats.'
  },

  'Cleave': {
    name: 'Cleave',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'STR', value: 13 },
      { type: 'feat', name: 'Power Attack' }
    ],
    description: 'You can follow through with powerful blows.',
    benefits: ['If you deal enough damage to drop an opponent, you get an immediate extra melee attack against another creature within reach'],
    special: 'A fighter may select Cleave as one of his fighter bonus feats.'
  },

  'Deceitful': {
    name: 'Deceitful',
    type: 'general',
    prerequisites: [],
    description: 'You have a talent for misleading others.',
    benefits: ['+2 bonus on Disguise checks', '+2 bonus on Forgery checks'],
    special: undefined
  },

  'Deflect Arrows': {
    name: 'Deflect Arrows',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 13 },
      { type: 'feat', name: 'Improved Unarmed Strike' }
    ],
    description: 'You can deflect incoming arrows, crossbow bolts, spears, and other ranged weapons.',
    benefits: ['Once per round, you can deflect one ranged weapon attack that would normally hit you'],
    special: 'A fighter may select Deflect Arrows as one of his fighter bonus feats. A monk may select this feat at 2nd level even without prerequisites.'
  },

  'Deft Hands': {
    name: 'Deft Hands',
    type: 'general',
    prerequisites: [],
    description: 'You have exceptional manual dexterity.',
    benefits: ['+2 bonus on Sleight of Hand checks', '+2 bonus on Use Rope checks'],
    special: undefined
  },

  'Diehard': {
    name: 'Diehard',
    type: 'general',
    prerequisites: [{ type: 'feat', name: 'Endurance' }],
    description: 'You are especially hard to kill.',
    benefits: [
      'When reduced to between -1 and -9 hit points, you automatically become stable',
      'You can choose to act as if disabled rather than dying',
      'Can take move actions without penalty, standard actions deal 1 damage'
    ],
    special: undefined
  },

  'Diligent': {
    name: 'Diligent',
    type: 'general',
    prerequisites: [],
    description: 'Your attention to detail serves you well.',
    benefits: ['+2 bonus on Appraise checks', '+2 bonus on Decipher Script checks'],
    special: undefined
  },

  'Dodge': {
    name: 'Dodge',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'ability', name: 'DEX', value: 13 }],
    description: 'You are adept at dodging blows.',
    benefits: ['+1 dodge bonus to AC against attacks from one designated opponent'],
    special: 'A fighter may select Dodge as one of his fighter bonus feats. Dodge bonuses stack with each other.'
  },

  'Endurance': {
    name: 'Endurance',
    type: 'general',
    prerequisites: [],
    description: 'You have exceptional endurance.',
    benefits: [
      '+4 bonus on Swim checks to resist nonlethal damage',
      '+4 bonus on Constitution checks for running, forced march, holding breath, starvation, or thirst',
      '+4 bonus on Fortitude saves against hot or cold environments and suffocation',
      'May sleep in light or medium armor without becoming fatigued'
    ],
    special: 'A ranger automatically gains Endurance as a bonus feat at 3rd level.'
  },

  'Eschew Materials': {
    name: 'Eschew Materials',
    type: 'general',
    prerequisites: [],
    description: 'You can cast spells without relying on material components.',
    benefits: ['Cast spells with material components costing 1 gp or less without the component'],
    special: undefined
  },

  'Exotic Weapon Proficiency': {
    name: 'Exotic Weapon Proficiency',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'bab', value: 1 }
    ],
    description: 'Choose a type of exotic weapon. You understand how to use that type of exotic weapon in combat.',
    benefits: ['Make attack rolls with selected exotic weapon normally'],
    special: 'A fighter may select this as a fighter bonus feat. Bastard sword and dwarven waraxe require Str 13. You can gain this feat multiple times.'
  },

  'Extra Turning': {
    name: 'Extra Turning',
    type: 'general',
    prerequisites: [{ type: 'class', name: 'Turn Undead' }],
    description: 'You can turn or rebuke undead more often.',
    benefits: ['Use turn/rebuke undead four additional times per day'],
    special: 'You can gain this feat multiple times. Its effects stack.'
  },

  'Far Shot': {
    name: 'Far Shot',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'feat', name: 'Point Blank Shot' }],
    description: 'You can get greater distance out of a ranged weapon.',
    benefits: [
      'Projectile weapons have 1.5× range increment',
      'Thrown weapons have 2× range increment'
    ],
    special: 'A fighter may select Far Shot as one of his fighter bonus feats.'
  },

  'Great Cleave': {
    name: 'Great Cleave',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'STR', value: 13 },
      { type: 'feat', name: 'Cleave' },
      { type: 'feat', name: 'Power Attack' },
      { type: 'bab', value: 4 }
    ],
    description: 'You can wield weapons with exceptional force.',
    benefits: ['As Cleave, except with no limit on the number of times you can use it per round'],
    special: 'A fighter may select Great Cleave as one of his fighter bonus feats.'
  },

  'Great Fortitude': {
    name: 'Great Fortitude',
    type: 'general',
    prerequisites: [],
    description: 'You are tougher than normal.',
    benefits: ['+2 bonus on all Fortitude saving throws'],
    special: undefined
  },

  'Greater Spell Focus': {
    name: 'Greater Spell Focus',
    type: 'general',
    prerequisites: [{ type: 'feat', name: 'Spell Focus' }],
    description: 'Your spells of a particular school are even more potent than normal.',
    benefits: ['+1 to Difficulty Class for all saving throws against spells from selected school (stacks with Spell Focus)'],
    special: 'You can gain this feat multiple times. Its effects do not stack. Each time applies to a new school of magic.'
  },

  'Greater Spell Penetration': {
    name: 'Greater Spell Penetration',
    type: 'general',
    prerequisites: [{ type: 'feat', name: 'Spell Penetration' }],
    description: 'Your spells are especially potent, breaking through spell resistance more readily than normal.',
    benefits: ['+2 bonus on caster level checks to overcome spell resistance (stacks with Spell Penetration)'],
    special: undefined
  },

  'Greater Two-Weapon Fighting': {
    name: 'Greater Two-Weapon Fighting',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 19 },
      { type: 'feat', name: 'Improved Two-Weapon Fighting' },
      { type: 'feat', name: 'Two-Weapon Fighting' },
      { type: 'bab', value: 11 }
    ],
    description: 'You are a master at fighting two-handed.',
    benefits: ['Get a third attack with off-hand weapon at -10 penalty'],
    special: 'A fighter may select this as a fighter bonus feat. An 11th-level ranger with two-weapon combat style is treated as having this feat when wearing light or no armor.'
  },

  'Greater Weapon Focus': {
    name: 'Greater Weapon Focus',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'feat', name: 'Weapon Focus' },
      { type: 'class', name: 'Fighter', value: 8 }
    ],
    description: 'Choose one type of weapon for which you have already selected Weapon Focus. You are especially good with this weapon.',
    benefits: ['+1 bonus on attack rolls with selected weapon (stacks with Weapon Focus)'],
    special: 'A fighter may select this as a fighter bonus feat. You can gain this feat multiple times.'
  },

  'Greater Weapon Specialization': {
    name: 'Greater Weapon Specialization',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'feat', name: 'Greater Weapon Focus' },
      { type: 'feat', name: 'Weapon Focus' },
      { type: 'feat', name: 'Weapon Specialization' },
      { type: 'class', name: 'Fighter', value: 12 }
    ],
    description: 'Choose one type of weapon for which you have already selected Weapon Specialization. You deal extra damage with this weapon.',
    benefits: ['+2 bonus on damage rolls with selected weapon (stacks with Weapon Specialization)'],
    special: 'A fighter may select this as a fighter bonus feat. You can gain this feat multiple times.'
  },

  'Improved Bull Rush': {
    name: 'Improved Bull Rush',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'STR', value: 13 },
      { type: 'feat', name: 'Power Attack' }
    ],
    description: 'You know how to push opponents back.',
    benefits: [
      'Do not provoke attack of opportunity when bull rushing',
      '+4 bonus on Strength check to push back defender'
    ],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Improved Counterspell': {
    name: 'Improved Counterspell',
    type: 'general',
    prerequisites: [],
    description: 'You understand the nuances of magic to such an extent that you can counter your opponents\' spells with great efficiency.',
    benefits: ['When counterspelling, may use a spell of the same school that is one or more levels higher'],
    special: undefined
  },

  'Improved Critical': {
    name: 'Improved Critical',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'bab', value: 8 }
    ],
    description: 'Choose one type of weapon. With that weapon, you know how to hit where it hurts.',
    benefits: ['Double the threat range of selected weapon'],
    special: 'A fighter may select this as a fighter bonus feat. You can gain this feat multiple times. Effect doesn\'t stack with other threat range increases.'
  },

  'Improved Disarm': {
    name: 'Improved Disarm',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'INT', value: 13 },
      { type: 'feat', name: 'Combat Expertise' }
    ],
    description: 'You know how to disarm opponents in melee combat.',
    benefits: [
      'Do not provoke attack of opportunity when disarming',
      'Opponent cannot disarm you in return',
      '+4 bonus on attack roll to disarm'
    ],
    special: 'A fighter may select this as a fighter bonus feat. A monk may select this at 6th level without prerequisites.'
  },

  'Improved Familiar': {
    name: 'Improved Familiar',
    type: 'general',
    prerequisites: [
      { type: 'class', name: 'Familiar' }
    ],
    description: 'This feat allows spellcasters to acquire a new familiar from a nonstandard list.',
    benefits: ['Select more powerful familiars based on alignment and level'],
    special: 'Spellcaster may choose familiar with alignment up to one step away on each alignment axis.'
  },

  'Improved Feint': {
    name: 'Improved Feint',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'INT', value: 13 },
      { type: 'feat', name: 'Combat Expertise' }
    ],
    description: 'You are skilled at misdirecting your opponent\'s attention in combat.',
    benefits: ['Make Bluff check to feint in combat as a move action'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Improved Grapple': {
    name: 'Improved Grapple',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 13 },
      { type: 'feat', name: 'Improved Unarmed Strike' }
    ],
    description: 'You are skilled at grappling opponents.',
    benefits: [
      'Do not provoke attack of opportunity when making touch attack to start grapple',
      '+4 bonus on all grapple checks'
    ],
    special: 'A fighter may select this as a fighter bonus feat. A monk may select this at 1st level without prerequisites.'
  },

  'Improved Initiative': {
    name: 'Improved Initiative',
    type: 'fighter-bonus',
    prerequisites: [],
    description: 'You can react more quickly than normal in a fight.',
    benefits: ['+4 bonus on initiative checks'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Improved Overrun': {
    name: 'Improved Overrun',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'STR', value: 13 },
      { type: 'feat', name: 'Power Attack' }
    ],
    description: 'You are skilled at knocking down opponents.',
    benefits: [
      'Target may not choose to avoid you when overrunning',
      '+4 bonus on Strength check to knock down opponent'
    ],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Improved Precise Shot': {
    name: 'Improved Precise Shot',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 19 },
      { type: 'feat', name: 'Point Blank Shot' },
      { type: 'feat', name: 'Precise Shot' },
      { type: 'bab', value: 11 }
    ],
    description: 'Your ranged attacks can strike opponents with deadly accuracy.',
    benefits: [
      'Ranged attacks ignore AC bonus from anything less than total cover',
      'Ignore miss chance from anything less than total concealment',
      'Automatically strike chosen opponent in grapple'
    ],
    special: 'A fighter may select this as a fighter bonus feat. An 11th-level ranger with archery combat style is treated as having this feat when wearing light or no armor.'
  },

  'Improved Shield Bash': {
    name: 'Improved Shield Bash',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'feat', name: 'Shield Proficiency' }],
    description: 'You can bash with a shield while retaining its AC bonus.',
    benefits: ['Retain shield\'s AC bonus when shield bashing'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Improved Sunder': {
    name: 'Improved Sunder',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'STR', value: 13 },
      { type: 'feat', name: 'Power Attack' }
    ],
    description: 'You are skilled at attacking your opponents\' weapons and armor.',
    benefits: [
      'Do not provoke attack of opportunity when sundering',
      '+4 bonus on attack roll to sunder'
    ],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Improved Trip': {
    name: 'Improved Trip',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'INT', value: 13 },
      { type: 'feat', name: 'Combat Expertise' }
    ],
    description: 'You know how to trip opponents in melee combat.',
    benefits: [
      'Do not provoke attack of opportunity when tripping',
      '+4 bonus on Strength check to trip',
      'If you trip opponent in melee, get immediate melee attack'
    ],
    special: 'A fighter may select this as a fighter bonus feat. A monk may select this at 6th level without prerequisites.'
  },

  'Improved Turning': {
    name: 'Improved Turning',
    type: 'general',
    prerequisites: [{ type: 'class', name: 'Turn Undead' }],
    description: 'Your turning or rebuking attempts are more powerful than normal.',
    benefits: ['Turn or rebuke undead as if you were one level higher'],
    special: undefined
  },

  'Improved Two-Weapon Fighting': {
    name: 'Improved Two-Weapon Fighting',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 17 },
      { type: 'feat', name: 'Two-Weapon Fighting' },
      { type: 'bab', value: 6 }
    ],
    description: 'You are an expert in fighting two-handed.',
    benefits: ['Get a second attack with off-hand weapon at -5 penalty'],
    special: 'A fighter may select this as a fighter bonus feat. A 6th-level ranger with two-weapon combat style is treated as having this feat when wearing light or no armor.'
  },

  'Improved Unarmed Strike': {
    name: 'Improved Unarmed Strike',
    type: 'fighter-bonus',
    prerequisites: [],
    description: 'You are skilled at fighting while unarmed.',
    benefits: [
      'Considered armed when unarmed',
      'Unarmed strikes can deal lethal or nonlethal damage'
    ],
    special: 'A monk automatically gains this feat at 1st level. A fighter may select this as a fighter bonus feat.'
  },

  'Investigator': {
    name: 'Investigator',
    type: 'general',
    prerequisites: [],
    description: 'You have a knack for finding information.',
    benefits: ['+2 bonus on Gather Information checks', '+2 bonus on Search checks'],
    special: undefined
  },

  'Iron Will': {
    name: 'Iron Will',
    type: 'general',
    prerequisites: [],
    description: 'You have a stronger will than normal.',
    benefits: ['+2 bonus on all Will saving throws'],
    special: undefined
  },

  'Leadership': {
    name: 'Leadership',
    type: 'general',
    prerequisites: [{ type: 'level', value: 6 }],
    description: 'You are a leader of men and a magnet for followers.',
    benefits: [
      'Attract a loyal cohort and a number of devoted followers',
      'Leadership score equals level + Charisma modifier'
    ],
    special: 'Having this feat enables the character to attract loyal companions and devoted followers.'
  },

  'Lightning Reflexes': {
    name: 'Lightning Reflexes',
    type: 'general',
    prerequisites: [],
    description: 'You have faster than normal reflexes.',
    benefits: ['+2 bonus on all Reflex saving throws'],
    special: undefined
  },

  'Magical Aptitude': {
    name: 'Magical Aptitude',
    type: 'general',
    prerequisites: [],
    description: 'You have a knack for magical endeavors.',
    benefits: ['+2 bonus on Spellcraft checks', '+2 bonus on Use Magic Device checks'],
    special: undefined
  },

  'Manyshot': {
    name: 'Manyshot',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 17 },
      { type: 'feat', name: 'Point Blank Shot' },
      { type: 'feat', name: 'Rapid Shot' },
      { type: 'bab', value: 6 }
    ],
    description: 'You can fire multiple arrows simultaneously.',
    benefits: ['Fire two or more arrows at single target'],
    special: 'A fighter may select this as a fighter bonus feat. A 6th-level ranger with archery combat style is treated as having this feat when wearing light or no armor. Precision-based damage applies only once.'
  },

  'Martial Weapon Proficiency': {
    name: 'Martial Weapon Proficiency',
    type: 'general',
    prerequisites: [],
    description: 'Choose a type of martial weapon. You understand how to use that type of martial weapon in combat.',
    benefits: ['Make attack rolls with selected martial weapon normally'],
    special: 'Barbarians, fighters, paladins, and rangers are proficient with all martial weapons. You can gain this feat multiple times.'
  },

  'Mobility': {
    name: 'Mobility',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 13 },
      { type: 'feat', name: 'Dodge' }
    ],
    description: 'You can dodge attacks of opportunity caused by moving out of a threatened square.',
    benefits: ['+4 dodge bonus to AC against attacks of opportunity caused by moving'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Mounted Archery': {
    name: 'Mounted Archery',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'skill', name: 'Ride', value: 1 },
      { type: 'feat', name: 'Mounted Combat' }
    ],
    description: 'You are skilled at making ranged attacks while mounted.',
    benefits: ['Penalty for ranged attacks while mounted is halved'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Mounted Combat': {
    name: 'Mounted Combat',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'skill', name: 'Ride', value: 1 }],
    description: 'You are adept at guiding your mount through combat.',
    benefits: ['Once per round, attempt Ride check to negate hit against mount'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Natural Spell': {
    name: 'Natural Spell',
    type: 'general',
    prerequisites: [
      { type: 'ability', name: 'WIS', value: 13 },
      { type: 'class', name: 'Wild Shape' }
    ],
    description: 'You can cast spells while in a wild shape.',
    benefits: ['Complete verbal and somatic components while in wild shape'],
    special: undefined
  },

  'Negotiator': {
    name: 'Negotiator',
    type: 'general',
    prerequisites: [],
    description: 'You are good at gauging and swaying attitudes.',
    benefits: ['+2 bonus on Diplomacy checks', '+2 bonus on Sense Motive checks'],
    special: undefined
  },

  'Nimble Fingers': {
    name: 'Nimble Fingers',
    type: 'general',
    prerequisites: [],
    description: 'You are adept at manipulating small, delicate objects.',
    benefits: ['+2 bonus on Disable Device checks', '+2 bonus on Open Lock checks'],
    special: undefined
  },

  'Persuasive': {
    name: 'Persuasive',
    type: 'general',
    prerequisites: [],
    description: 'You have a way with words and body language.',
    benefits: ['+2 bonus on Bluff checks', '+2 bonus on Intimidate checks'],
    special: undefined
  },

  'Point Blank Shot': {
    name: 'Point Blank Shot',
    type: 'fighter-bonus',
    prerequisites: [],
    description: 'You are especially accurate when making ranged attacks against close targets.',
    benefits: ['+1 bonus on attack and damage rolls with ranged weapons at ranges up to 30 feet'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Power Attack': {
    name: 'Power Attack',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'ability', name: 'STR', value: 13 }],
    description: 'You can make exceptionally deadly melee attacks by sacrificing accuracy for damage.',
    benefits: [
      'Trade attack bonus for damage bonus on melee attacks',
      'Two-handed weapons get double damage bonus'
    ],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Precise Shot': {
    name: 'Precise Shot',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'feat', name: 'Point Blank Shot' }],
    description: 'You can shoot or throw ranged weapons at an opponent engaged in melee without penalty.',
    benefits: ['No -4 penalty for ranged attacks against opponents engaged in melee'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Quick Draw': {
    name: 'Quick Draw',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'bab', value: 1 }],
    description: 'You can draw weapons with startling speed.',
    benefits: [
      'Draw weapon as free action',
      'Draw hidden weapon as move action',
      'Throw weapons at full attack rate'
    ],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Rapid Reload': {
    name: 'Rapid Reload',
    type: 'fighter-bonus',
    prerequisites: [],
    description: 'Choose a type of crossbow. You can reload that type of crossbow quickly.',
    benefits: ['Reload selected crossbow as free action'],
    special: 'A fighter may select this as a fighter bonus feat. You can gain this feat multiple times.'
  },

  'Rapid Shot': {
    name: 'Rapid Shot',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 13 },
      { type: 'feat', name: 'Point Blank Shot' }
    ],
    description: 'You can use ranged weapons with exceptional speed.',
    benefits: ['Get one extra ranged attack per round at highest BAB, but all attacks take -2 penalty'],
    special: 'A fighter may select this as a fighter bonus feat. A 2nd-level ranger with archery combat style is treated as having this feat when wearing light or no armor.'
  },

  'Ride-By Attack': {
    name: 'Ride-By Attack',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'skill', name: 'Ride', value: 1 },
      { type: 'feat', name: 'Mounted Combat' }
    ],
    description: 'You are skilled at fast attack and retreat tactics while mounted.',
    benefits: ['When mounted and charging, move before and after attack'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Run': {
    name: 'Run',
    type: 'general',
    prerequisites: [],
    description: 'You are fleet of foot.',
    benefits: [
      'Run at 5× speed (or 4× in heavy armor/heavy load)',
      '+4 bonus on Jump checks after running start',
      'Retain Dex bonus to AC while running'
    ],
    special: undefined
  },

  'Self-Sufficient': {
    name: 'Self-Sufficient',
    type: 'general',
    prerequisites: [],
    description: 'You can take care of yourself in harsh environments and situations.',
    benefits: ['+2 bonus on Heal checks', '+2 bonus on Survival checks'],
    special: undefined
  },

  'Shield Proficiency': {
    name: 'Shield Proficiency',
    type: 'general',
    prerequisites: [],
    description: 'You are proficient with bucklers, small shields, and large shields.',
    benefits: ['Use shields without armor check penalty on attacks or skill checks'],
    special: 'Barbarians, bards, clerics, druids, fighters, paladins, and rangers automatically have this feat.'
  },

  'Shot on the Run': {
    name: 'Shot on the Run',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 13 },
      { type: 'feat', name: 'Dodge' },
      { type: 'feat', name: 'Mobility' },
      { type: 'feat', name: 'Point Blank Shot' },
      { type: 'bab', value: 4 }
    ],
    description: 'You are highly trained in skirmish ranged attack tactics.',
    benefits: ['When using attack action with ranged weapon, move both before and after attack'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Simple Weapon Proficiency': {
    name: 'Simple Weapon Proficiency',
    type: 'general',
    prerequisites: [],
    description: 'You understand how to use all types of simple weapons in combat.',
    benefits: ['Make attack rolls with simple weapons normally'],
    special: 'All characters except druids, monks, and wizards are automatically proficient with simple weapons.'
  },

  'Skill Focus': {
    name: 'Skill Focus',
    type: 'general',
    prerequisites: [],
    description: 'Choose a skill. You are particularly good at that skill.',
    benefits: ['+3 bonus on all checks involving selected skill'],
    special: 'You can gain this feat multiple times. Its effects do not stack. Each time applies to a new skill.'
  },

  'Snatch Arrows': {
    name: 'Snatch Arrows',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 15 },
      { type: 'feat', name: 'Deflect Arrows' },
      { type: 'feat', name: 'Improved Unarmed Strike' }
    ],
    description: 'You can snatch projectiles and thrown weapons out of the air.',
    benefits: ['When using Deflect Arrows, catch weapon instead of deflecting it'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Spell Focus': {
    name: 'Spell Focus',
    type: 'general',
    prerequisites: [],
    description: 'Choose a school of magic. Your spells of that school are more potent than normal.',
    benefits: ['+1 to Difficulty Class for all saving throws against spells from selected school'],
    special: 'You can gain this feat multiple times. Its effects do not stack. Each time applies to a new school of magic.'
  },

  'Spell Mastery': {
    name: 'Spell Mastery',
    type: 'general',
    prerequisites: [{ type: 'class', name: 'Wizard', value: 1 }],
    description: 'You have mastered a small handful of spells, and can prepare these spells without a spellbook.',
    benefits: ['Prepare selected spells without referring to spellbook'],
    special: 'Each time you take this feat, choose a number of spells equal to your Int modifier that you already know.'
  },

  'Spell Penetration': {
    name: 'Spell Penetration',
    type: 'general',
    prerequisites: [],
    description: 'Your spells are especially potent, breaking through spell resistance more readily than normal.',
    benefits: ['+2 bonus on caster level checks to overcome spell resistance'],
    special: undefined
  },

  'Spirited Charge': {
    name: 'Spirited Charge',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'skill', name: 'Ride', value: 1 },
      { type: 'feat', name: 'Mounted Combat' },
      { type: 'feat', name: 'Ride-By Attack' }
    ],
    description: 'You are trained at making devastating charging attacks while mounted.',
    benefits: ['When mounted and charging, deal double damage (or triple with lance)'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Spring Attack': {
    name: 'Spring Attack',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 13 },
      { type: 'feat', name: 'Dodge' },
      { type: 'feat', name: 'Mobility' },
      { type: 'bab', value: 4 }
    ],
    description: 'You are trained in fast melee attack and retreat tactics.',
    benefits: ['When using attack action with melee weapon, move both before and after attack'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Stealthy': {
    name: 'Stealthy',
    type: 'general',
    prerequisites: [],
    description: 'You are particularly good at avoiding notice.',
    benefits: ['+2 bonus on Hide checks', '+2 bonus on Move Silently checks'],
    special: undefined
  },

  'Stunning Fist': {
    name: 'Stunning Fist',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 13 },
      { type: 'ability', name: 'WIS', value: 13 },
      { type: 'feat', name: 'Improved Unarmed Strike' },
      { type: 'bab', value: 8 }
    ],
    description: 'You can stun opponents with an unarmed strike.',
    benefits: ['Force opponent to make Fortitude save or be stunned for 1 round'],
    special: 'A monk may select this at 1st level without prerequisites and gains additional uses per day. A fighter may select this as a fighter bonus feat.'
  },

  'Toughness': {
    name: 'Toughness',
    type: 'general',
    prerequisites: [],
    description: 'You are tougher than normal.',
    benefits: ['+3 hit points'],
    special: 'A character may gain this feat multiple times. Its effects stack.'
  },

  'Tower Shield Proficiency': {
    name: 'Tower Shield Proficiency',
    type: 'general',
    prerequisites: [{ type: 'feat', name: 'Shield Proficiency' }],
    description: 'You are proficient with tower shields.',
    benefits: ['Use tower shields without armor check penalty'],
    special: 'Fighters automatically have this feat.'
  },

  'Track': {
    name: 'Track',
    type: 'general',
    prerequisites: [],
    description: 'You can follow the trails of creatures and characters across most types of terrain.',
    benefits: ['Use Survival skill to find and follow tracks'],
    special: 'A ranger automatically gains Track as a bonus feat. He need not select it.'
  },

  'Trample': {
    name: 'Trample',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'skill', name: 'Ride', value: 1 },
      { type: 'feat', name: 'Mounted Combat' }
    ],
    description: 'You can knock down opponents when you overrun them.',
    benefits: ['Target cannot avoid you when overrunning while mounted, mount may make hoof attack against knocked down targets'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Two-Weapon Defense': {
    name: 'Two-Weapon Defense',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 15 },
      { type: 'feat', name: 'Two-Weapon Fighting' }
    ],
    description: 'You are skilled at defending yourself while dual-wielding.',
    benefits: ['+1 shield bonus to AC when wielding double weapon or two weapons'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  'Two-Weapon Fighting': {
    name: 'Two-Weapon Fighting',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'ability', name: 'DEX', value: 15 }],
    description: 'You can fight with a weapon in each hand.',
    benefits: ['Reduce two-weapon fighting penalties by 2 for primary hand and 6 for off hand'],
    special: 'A fighter may select this as a fighter bonus feat. A 2nd-level ranger with two-weapon combat style is treated as having this feat when wearing light or no armor.'
  },

  'Weapon Finesse': {
    name: 'Weapon Finesse',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'bab', value: 1 }],
    description: 'You are especially skilled at using weapons that can benefit as much from Dexterity as from Strength.',
    benefits: ['Use Dexterity modifier instead of Strength modifier on attack rolls with light weapons, rapiers, whips, and spiked chains'],
    special: 'A fighter may select this as a fighter bonus feat. Natural weapons are always considered light weapons.'
  },

  'Weapon Focus': {
    name: 'Weapon Focus',
    type: 'fighter-bonus',
    prerequisites: [{ type: 'bab', value: 1 }],
    description: 'Choose one type of weapon. You are especially good with that weapon.',
    benefits: ['+1 bonus on attack rolls with selected weapon'],
    special: 'A fighter may select this as a fighter bonus feat. You can gain this feat multiple times. A fighter must have Weapon Focus with a weapon to gain Weapon Specialization with it.'
  },

  'Weapon Specialization': {
    name: 'Weapon Specialization',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'feat', name: 'Weapon Focus' },
      { type: 'class', name: 'Fighter', value: 4 }
    ],
    description: 'Choose one type of weapon for which you have already selected Weapon Focus. You deal extra damage with this weapon.',
    benefits: ['+2 bonus on damage rolls with selected weapon'],
    special: 'A fighter may select this as a fighter bonus feat. You can gain this feat multiple times.'
  },

  'Whirlwind Attack': {
    name: 'Whirlwind Attack',
    type: 'fighter-bonus',
    prerequisites: [
      { type: 'ability', name: 'DEX', value: 13 },
      { type: 'ability', name: 'INT', value: 13 },
      { type: 'feat', name: 'Combat Expertise' },
      { type: 'feat', name: 'Dodge' },
      { type: 'feat', name: 'Mobility' },
      { type: 'feat', name: 'Spring Attack' },
      { type: 'bab', value: 4 }
    ],
    description: 'You can strike out at every foe within reach.',
    benefits: ['When using full attack action, make one melee attack against each opponent within reach'],
    special: 'A fighter may select this as a fighter bonus feat.'
  },

  // === METAMAGIC FEATS ===

  'Empower Spell': {
    name: 'Empower Spell',
    type: 'metamagic',
    prerequisites: [],
    description: 'You can cast spells to greater effect.',
    benefits: ['All variable, numeric effects increased by 1/2 (spell uses slot 2 levels higher)'],
    special: undefined
  },

  'Enlarge Spell': {
    name: 'Enlarge Spell',
    type: 'metamagic',
    prerequisites: [],
    description: 'You can cast spells farther than normal.',
    benefits: ['Double range of spells with range of close, medium, or long (spell uses slot 1 level higher)'],
    special: undefined
  },

  'Extend Spell': {
    name: 'Extend Spell',
    type: 'metamagic',
    prerequisites: [],
    description: 'You can cast spells that last longer than normal.',
    benefits: ['Double duration of spells (spell uses slot 1 level higher)'],
    special: 'Spells with duration of concentration, instantaneous, or permanent are not affected.'
  },

  'Heighten Spell': {
    name: 'Heighten Spell',
    type: 'metamagic',
    prerequisites: [],
    description: 'You can cast a spell as if it were higher level than it actually is.',
    benefits: ['Increase effective spell level up to 9th level maximum'],
    special: 'Unlike other metamagic feats, Heighten Spell actually increases the effective level of the spell.'
  },

  'Maximize Spell': {
    name: 'Maximize Spell',
    type: 'metamagic',
    prerequisites: [],
    description: 'You can cast spells to maximum effect.',
    benefits: ['All variable, numeric effects are maximized (spell uses slot 3 levels higher)'],
    special: undefined
  },

  'Quicken Spell': {
    name: 'Quicken Spell',
    type: 'metamagic',
    prerequisites: [],
    description: 'You can cast spells with a moment\'s thought.',
    benefits: ['Cast spell as swift action (spell uses slot 4 levels higher)'],
    special: 'Casting a quickened spell doesn\'t provoke attacks of opportunity. You may cast only one quickened spell per round.'
  },

  'Silent Spell': {
    name: 'Silent Spell',
    type: 'metamagic',
    prerequisites: [],
    description: 'You can cast spells silently.',
    benefits: ['Cast spell with no verbal components (spell uses slot 1 level higher)'],
    special: 'Bard spells cannot be enhanced by this metamagic feat.'
  },

  'Still Spell': {
    name: 'Still Spell',
    type: 'metamagic',
    prerequisites: [],
    description: 'You can cast spells without somatic components.',
    benefits: ['Cast spell with no somatic components (spell uses slot 1 level higher)'],
    special: undefined
  },

  'Widen Spell': {
    name: 'Widen Spell',
    type: 'metamagic',
    prerequisites: [],
    description: 'You can cast spells that affect a larger area.',
    benefits: ['Double area of burst, emanation, line, or spread spells (spell uses slot 3 levels higher)'],
    special: undefined
  },

  // === ITEM CREATION FEATS ===

  'Brew Potion': {
    name: 'Brew Potion',
    type: 'item-creation',
    prerequisites: [{ type: 'level', value: 3 }],
    description: 'You can create magical potions.',
    benefits: ['Create potions of 3rd level or lower spells that target creatures'],
    special: 'Base price: spell level × caster level × 50 gp. XP cost: 1/25 of base price. Time: 1 day per 1,000 gp of base price.'
  },

  'Craft Magic Arms and Armor': {
    name: 'Craft Magic Arms and Armor',
    type: 'item-creation',
    prerequisites: [{ type: 'level', value: 5 }],
    description: 'You can create magic weapons, armor, and shields.',
    benefits: ['Create magic weapons, armor, and shields whose prerequisites you meet'],
    special: 'Time: 1 day per 1,000 gp of magical features. XP cost: 1/25 of features\' price. Raw materials: half of features\' price.'
  },

  'Craft Rod': {
    name: 'Craft Rod',
    type: 'item-creation',
    prerequisites: [{ type: 'level', value: 9 }],
    description: 'You can create magic rods.',
    benefits: ['Create any rod whose prerequisites you meet'],
    special: 'Time: 1 day per 1,000 gp of base price. XP cost: 1/25 of base price. Raw materials: half of base price.'
  },

  'Craft Staff': {
    name: 'Craft Staff',
    type: 'item-creation',
    prerequisites: [{ type: 'level', value: 12 }],
    description: 'You can create magic staffs.',
    benefits: ['Create any staff whose prerequisites you meet'],
    special: 'Time: 1 day per 1,000 gp of base price. XP cost: 1/25 of base price. Raw materials: half of base price. Newly created staff has 50 charges.'
  },

  'Craft Wand': {
    name: 'Craft Wand',
    type: 'item-creation',
    prerequisites: [{ type: 'level', value: 5 }],
    description: 'You can create magic wands.',
    benefits: ['Create wands of 4th level or lower spells you know'],
    special: 'Base price: caster level × spell level × 750 gp. XP cost: 1/25 of base price. Time: 1 day per 1,000 gp. Newly created wand has 50 charges.'
  },

  'Craft Wondrous Item': {
    name: 'Craft Wondrous Item',
    type: 'item-creation',
    prerequisites: [{ type: 'level', value: 3 }],
    description: 'You can create wondrous items, a type of magic item.',
    benefits: ['Create any wondrous item whose prerequisites you meet'],
    special: 'Time: 1 day per 1,000 gp of price. XP cost: 1/25 of item\'s price. Raw materials: half of price.'
  },

  'Forge Ring': {
    name: 'Forge Ring',
    type: 'item-creation',
    prerequisites: [{ type: 'level', value: 12 }],
    description: 'You can create magic rings.',
    benefits: ['Create any ring whose prerequisites you meet'],
    special: 'Time: 1 day per 1,000 gp of base price. XP cost: 1/25 of base price. Raw materials: half of base price.'
  },

  'Scribe Scroll': {
    name: 'Scribe Scroll',
    type: 'item-creation',
    prerequisites: [{ type: 'level', value: 1 }],
    description: 'You can create magic scrolls.',
    benefits: ['Create scrolls of any spell you know'],
    special: 'Base price: spell level × caster level × 25 gp. XP cost: 1/25 of base price. Time: 1 day per 1,000 gp of base price.'
  }
}

/**
 * Get feat by name from database
 */
export function getFeatByName(name: string): Feat | null {
  return FEATS_DATABASE[name] || null
}

/**
 * Get all feats by type
 */
export function getFeatsByType(type: Feat['type']): Feat[] {
  return Object.values(FEATS_DATABASE).filter(feat => feat.type === type)
}

/**
 * Get all fighter bonus feats
 */
export function getFighterBonusFeats(): Feat[] {
  return Object.values(FEATS_DATABASE).filter(feat => feat.type === 'fighter-bonus')
}

/**
 * Get all general feats (available to all classes)
 */
export function getGeneralFeats(): Feat[] {
  return Object.values(FEATS_DATABASE).filter(feat => feat.type === 'general')
}

/**
 * Get all metamagic feats
 */
export function getMetamagicFeats(): Feat[] {
  return Object.values(FEATS_DATABASE).filter(feat => feat.type === 'metamagic')
}

/**
 * Get all item creation feats
 */
export function getItemCreationFeats(): Feat[] {
  return Object.values(FEATS_DATABASE).filter(feat => feat.type === 'item-creation')
}

/**
 * Search feats by partial name
 */
export function searchFeats(query: string): Feat[] {
  const lowerQuery = query.toLowerCase()
  return Object.values(FEATS_DATABASE).filter(feat => 
    feat.name.toLowerCase().includes(lowerQuery) ||
    feat.description.toLowerCase().includes(lowerQuery) ||
    feat.benefits.some(benefit => benefit.toLowerCase().includes(lowerQuery))
  )
}
