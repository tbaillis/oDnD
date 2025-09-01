// This file will contain all SRD spells in the game's Spell format.
// To be populated with the full SRD spell list.
import type { Spell } from '../game/magic'

export const srdSpells: Record<string, Spell> = {
  'magic-missile': {
    name: 'Magic Missile',
    school: 'evocation',
    descriptors: ['force'],
    level: { 'sorcerer': 1, 'wizard': 1 },
    components: { verbal: true, somatic: true },
    castingTime: '1 standard action',
    target: { type: 'creature', range: 'Medium (100 ft. + 10 ft./level)', targets: 'up to five creatures, no two of which can be more than 15 ft. apart' },
    duration: { type: 'instantaneous' },
    save: { type: 'none', effect: 'negates', description: '' },
    spellResistance: true,
    description: 'A missile of magical energy darts forth and strikes its target, dealing 1d4+1 points of force damage. Additional missiles at higher levels.'
  },
  'fireball': {
    name: 'Fireball',
    school: 'evocation',
    descriptors: ['fire'],
    level: { 'sorcerer': 3, 'wizard': 3 },
    components: { verbal: true, somatic: true, material: 'a tiny ball of bat guano and sulfur' },
    castingTime: '1 standard action',
    target: { type: 'area', range: 'Long (400 ft. + 40 ft./level)', area: { type: 'burst', size: '20-ft.-radius' } },
    duration: { type: 'instantaneous' },
    save: { type: 'Reflex', effect: 'half' },
    spellResistance: true,
    description: 'A bright streak flashes from your pointing finger to a point you choose, and then blossoms with a low roar into an explosion of flame that deals 6d6 fire damage (increases with level).'
  },
  'animal-messenger': {
    name: 'Animal Messenger',
    school: 'enchantment',
    subschool: 'compulsion',
    descriptors: ['mind-affecting'],
    level: { 'bard': 2, 'druid': 2, 'ranger': 1 },
    components: { verbal: true, somatic: true, material: 'A morsel of food the animal likes' },
    castingTime: '1 standard action',
    target: {
      type: 'creature',
      range: 'Close (25 ft. + 5 ft./2 levels)',
      targets: 'One Tiny animal'
    },
    duration: { type: 'timed', value: 'One day/level' },
    save: { type: 'none', effect: 'negates', description: 'see text' },
    spellResistance: true,
    description: 'Compel a Tiny animal to go to a spot you designate and wait there for the duration. Used to carry messages.'
  },
  'animal-shapes': {
    name: 'Animal Shapes',
    school: 'transmutation',
    descriptors: [],
    level: { 'animal': 7, 'druid': 8 },
    components: { verbal: true, somatic: true, divineFocus: true },
    castingTime: '1 standard action',
    target: { type: 'creature', range: 'Close (25 ft. + 5 ft./2 levels)', targets: 'Up to one willing creature per level, all within 30 ft. of each other' },
    duration: { type: 'timed', value: '1 hour/level', dismissible: true },
    save: { type: 'none', effect: 'negates', description: 'see text' },
    spellResistance: true,
    description: 'Transform up to one willing creature per level into the same kind of animal. Recipients can resume normal form as a full-round action.'
  },
  'animal-trance': {
    name: 'Animal Trance',
    school: 'enchantment',
    subschool: 'compulsion',
    descriptors: ['mind-affecting', 'sonic'],
    level: { 'bard': 2, 'druid': 2 },
    components: { verbal: true, somatic: true },
    castingTime: '1 standard action',
    target: {
      type: 'creature',
      range: 'Close (25 ft. + 5 ft./2 levels)',
      targets: 'Animals or magical beasts with Intelligence 1 or 2'
    },
    duration: { type: 'concentration' },
    save: { type: 'Will', effect: 'negates', description: 'see text' },
    spellResistance: true,
    description: 'Fascinates animals and magical beasts with Int 1 or 2. Roll 2d6 for HD affected. Trained/hostile animals get a save.'
  },
  'animate-dead': {
    name: 'Animate Dead',
    school: 'necromancy',
    descriptors: ['evil'],
    level: { 'cleric': 3, 'death': 3, 'sorcerer': 4, 'wizard': 4 },
    components: { verbal: true, somatic: true, material: 'Black onyx gem worth at least 25 gp per Hit Die of the undead' },
    castingTime: '1 standard action',
    target: { type: 'object', range: 'Touch', targets: 'One or more corpses touched' },
    duration: { type: 'instantaneous' },
    save: { type: 'none', effect: 'negates' },
    spellResistance: false,
    description: 'Turns bones or bodies of dead creatures into undead skeletons or zombies under your control.'
  },
  'animate-objects': {
    name: 'Animate Objects',
    school: 'transmutation',
    descriptors: [],
    level: { 'bard': 6, 'chaos': 6, 'cleric': 6 },
    components: { verbal: true, somatic: true },
    castingTime: '1 standard action',
    target: {
      type: 'object',
      range: 'Medium (100 ft. + 10 ft./level)',
      targets: 'One Small object per caster level; see text'
    },
    duration: { type: 'timed', value: '1 round/level' },
    save: { type: 'none', effect: 'negates' },
    spellResistance: false,
    description: 'Imbue inanimate objects with mobility and a semblance of life. Each animated object attacks as you designate.'
  },
  'animate-plants': {
    name: 'Animate Plants',
    school: 'transmutation',
    descriptors: [],
    level: { 'druid': 7, 'plant': 7 },
    components: { verbal: true },
    castingTime: '1 standard action',
    target: {
      type: 'object',
      range: 'Close (25 ft. + 5 ft./2 levels)',
      targets: 'One Large plant per three caster levels or all plants within range; see text'
    },
    duration: { type: 'timed', value: '1 round/level or 1 hour/level; see text' },
    save: { type: 'none', effect: 'negates' },
    spellResistance: false,
    description: 'Imbue inanimate plants with mobility and a semblance of life. Can also duplicate entangle effect.'
  },
  'animate-rope': {
    name: 'Animate Rope',
    school: 'transmutation',
    descriptors: [],
    level: { 'bard': 1, 'sorcerer': 1, 'wizard': 1 },
    components: { verbal: true, somatic: true },
    castingTime: '1 standard action',
    target: {
      type: 'object',
      range: 'Medium (100 ft. + 10 ft./level)',
      targets: 'One ropelike object, length up to 50 ft. + 5 ft./level; see text'
    },
    duration: { type: 'timed', value: '1 round/level' },
    save: { type: 'none', effect: 'negates' },
    spellResistance: false,
    description: 'Animate a nonliving ropelike object. Can coil, knot, loop, tie, and entangle. Grants +2 Use Rope checks.'
  },
  'antilife-shell': {
    name: 'Antilife Shell',
    school: 'abjuration',
    descriptors: [],
    level: { 'animal': 6, 'cleric': 6, 'druid': 6 },
    components: { verbal: true, somatic: true, divineFocus: true },
    castingTime: '1 round',
    target: {
      type: 'area',
      range: '10 ft.',
      area: { type: 'emanation', size: '10-ft.-radius centered on you' }
    },
    duration: { type: 'timed', value: '10 min/level', dismissible: true },
    save: { type: 'none', effect: 'negates' },
    spellResistance: true,
    description: 'Mobile, hemispherical energy field prevents entrance of most living creatures. Defensive use only.'
  },

    'antipathy': {
      name: 'Antipathy',
      school: 'enchantment',
      subschool: 'compulsion',
      descriptors: ['mind-affecting'],
      level: { 'druid': 9, 'sorcerer': 8, 'wizard': 8 },
      components: { verbal: true, somatic: true, material: 'A lump of alum soaked in vinegar' },
      castingTime: '1 hour',
      target: {
        type: 'area',
        range: 'Close (25 ft. + 5 ft./2 levels)',
        area: { type: 'emanation', size: 'up to a 10-ft. cube/level or one object' }
      },
      duration: { type: 'timed', value: '2 hours/level', dismissible: true },
      save: { type: 'Will', effect: 'partial' },
      spellResistance: true,
      description: 'Repels a specific kind of intelligent creature or alignment from an area or object. Affected creatures must leave or avoid the area. Successful save allows discomfort but not compulsion.'
    },

// Removed duplicate arcane-mark entry
    'arcane-lock': {
      name: 'Arcane Lock',
      school: 'abjuration',
      descriptors: [],
      level: { 'sorcerer': 2, 'wizard': 2 },
      components: { verbal: true, somatic: true, material: 'Gold dust worth 25 gp' },
      castingTime: '1 standard action',
      target: {
        type: 'object',
        range: 'Touch',
        targets: 'The door, chest, or portal touched, up to 30 sq. ft./level in size'
      },
      duration: { type: 'permanent' },
  save: { type: 'none', effect: 'negates' },
      spellResistance: false,
      description: 'Magically locks a door, chest, or portal. Only the caster can freely pass. Others must break in or use dispel magic or knock.'
    },
  // Removed duplicate arcane-mark entry
  'arcane-sight': {
    name: 'Arcane Sight',
    school: 'divination',
    descriptors: [],
    level: { 'sorcerer': 3, 'wizard': 3 },
    components: { verbal: true, somatic: true },
    castingTime: '1 standard action',
    target: {
      type: 'self',
      range: 'Personal',
      targets: 'You'
    },
    duration: { type: 'timed', value: '1 min/level', dismissible: true },
    save: { type: 'none', effect: 'negates' },
    spellResistance: false,
    description: 'See magical auras within 120 feet. Know location and power of all magical auras. Can make Spellcraft checks to determine school of magic.'
  },
  'arcane-sight-greater': {
    name: 'Arcane Sight, Greater',
    school: 'divination',
    descriptors: [],
    level: { 'sorcerer': 7, 'wizard': 7 },
    components: { verbal: true, somatic: true },
    castingTime: '1 standard action',
    target: {
      type: 'self',
      range: 'Personal',
      targets: 'You'
    },
    duration: { type: 'timed', value: '1 min/level', dismissible: true },
    save: { type: 'none', effect: 'negates' },
    spellResistance: false,
    description: 'As arcane sight, but you automatically know which spells or magical effects are active on any individual or object you see. Does not let you identify magic items.'
  },
  // Duplicate astral-projection entry removed
  // Duplicate atonement entry removed
  // Duplicate augury entry removed
  // Duplicate augury entry removed
  // Duplicate awaken entry removed
  // Duplicate awaken entry removed
  // Duplicate baleful-polymorph entry removed
  // Duplicate baleful-polymorph entry removed
//
    'bane': {
      name: 'Bane',
      school: 'enchantment',
      subschool: 'compulsion',
      descriptors: ['fear', 'mind-affecting'],
      level: { 'cleric': 1 },
      components: { verbal: true, somatic: true, divineFocus: true },
      castingTime: '1 standard action',
      target: {
        type: 'area',
        range: '50 ft.',
        area: { type: 'emanation', size: 'All enemies within 50 ft.' }
      },
      duration: { type: 'timed', value: '1 min/level' },
      save: { type: 'Will', effect: 'negates' },
      spellResistance: true,
      description: 'Fills enemies with fear and doubt. Each affected creature takes a -1 penalty on attack rolls and saving throws against fear effects. Counters and dispels bless.'
    },
  'banishment': {
    name: 'Banishment',
    school: 'abjuration',
    descriptors: [],
    level: { 'cleric': 6, 'sorcerer': 7, 'wizard': 7 },
    components: { verbal: true, somatic: true, focus: 'Any item distasteful to the subject (optional)' },
    castingTime: '1 standard action',
    target: {
      type: 'creature',
      range: 'Close (25 ft. + 5 ft./2 levels)',
      targets: 'One or more extraplanar creatures, no two of which can be more than 30 ft. apart'
    },
    duration: { type: 'instantaneous' },
    save: { type: 'Will', effect: 'negates' },
    spellResistance: true,
    description: 'A more powerful version of dismissal. Forces extraplanar creatures out of your home plane. You can improve the spell’s chance by presenting items the target hates.'
  },
  'barkskin': {
    name: 'Barkskin',
    school: 'transmutation',
    descriptors: [],
    level: { 'druid': 2, 'ranger': 2, 'plant': 2 },
    components: { verbal: true, somatic: true, divineFocus: true },
    castingTime: '1 standard action',
    target: {
      type: 'touch',
      range: 'Touch',
      targets: 'Living creature touched'
    },
    duration: { type: 'timed', value: '10 min/level', dismissible: true },
    save: { type: 'none', effect: 'negates' },
    spellResistance: true,
    description: 'Toughens a creature’s skin. Grants a +2 enhancement bonus to natural armor, increasing by 1 for every three caster levels above 3rd (max +5). Stacks with natural armor, not with other enhancement bonuses to natural armor.'
  },
  'bears-endurance': {
    name: 'Bear’s Endurance',
    school: 'transmutation',
    descriptors: [],
    level: { 'cleric': 2, 'druid': 2, 'ranger': 2, 'sorcerer': 2, 'wizard': 2 },
    components: { verbal: true, somatic: true, divineFocus: true },
    castingTime: '1 standard action',
    target: {
      type: 'touch',
      range: 'Touch',
      targets: 'Creature touched'
    },
    duration: { type: 'timed', value: '1 min/level' },
    save: { type: 'Will', effect: 'negates', description: 'harmless' },
    spellResistance: true,
    description: 'Grants the subject a +4 enhancement bonus to Constitution, with all usual benefits. Hit points gained are not temporary and go away when Constitution returns to normal.'
  },
    // --- Next 50 SRD spells batch ---
    'black-tentacles': {
      name: 'Black Tentacles',
      school: 'conjuration',
      subschool: 'creation',
      descriptors: [],
      level: { 'sorcerer': 4, 'wizard': 4 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: {
        type: 'area',
        range: 'Medium (100 ft. + 10 ft./level)',
        area: { type: 'spread', size: '20-ft.-radius' }
      },
      duration: { type: 'timed', value: '1 round/level' },
      save: { type: 'none', effect: 'negates' },
      spellResistance: false,
      description: 'Tentacles grapple all within 20-ft. spread.'
    },
    'blade-barrier': {
      name: 'Blade Barrier',
      school: 'evocation',
      descriptors: [],
      level: { 'cleric': 6 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: {
        type: 'area',
        range: 'Medium (100 ft. + 10 ft./level)',
  area: { type: 'line', size: 'up to 20 ft. long/level, or ring of blades with radius up to 5 ft./two levels' }
      },
      duration: { type: 'timed', value: '1 round/level' },
      save: { type: 'Reflex', effect: 'half' },
      spellResistance: true,
      description: 'Wall of blades deals 1d6/level damage.'
    },
    'blasphemy': {
      name: 'Blasphemy',
      school: 'evocation',
      descriptors: ['evil', 'sonic'],
      level: { 'cleric': 7, 'evil': 7 },
      components: { verbal: true },
      castingTime: '1 standard action',
      target: {
        type: 'area',
        range: '40 ft.',
        area: { type: 'emanation', size: '40-ft.-radius' }
      },
      duration: { type: 'instantaneous' },
      save: { type: 'none', effect: 'negates' },
      spellResistance: true,
      description: 'Kills, paralyzes, weakens, or dazes nonevil subjects.'
    },
    'bless': {
      name: 'Bless',
      school: 'enchantment',
      subschool: 'compulsion',
      descriptors: ['mind-affecting'],
      level: { 'cleric': 1, 'paladin': 1 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: {
        type: 'area',
        range: '50 ft.',
        area: { type: 'emanation', size: 'All allies within 50 ft.' }
      },
      duration: { type: 'timed', value: '1 min/level' },
      save: { type: 'none', effect: 'negates' },
      spellResistance: true,
      description: 'Allies gain +1 on attack rolls and saves against fear.'
    },
    'bless-water': {
      name: 'Bless Water',
      school: 'transmutation',
      descriptors: ['good'],
      level: { 'cleric': 1, 'paladin': 1 },
      components: { verbal: true, somatic: true, material: '5 pounds of powdered silver (worth 25 gp)' },
      castingTime: '1 minute',
      target: {
        type: 'object',
        range: 'Touch',
        targets: 'Flask of water touched'
      },
      duration: { type: 'instantaneous' },
      save: { type: 'none', effect: 'negates' },
      spellResistance: false,
      description: 'Makes holy water.'
    },
    'bless-weapon': {
      name: 'Bless Weapon',
      school: 'transmutation',
      descriptors: ['good'],
      level: { 'paladin': 1 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: {
        type: 'object',
        range: 'Touch',
        targets: 'Weapon touched'
      },
      duration: { type: 'timed', value: '1 min/level' },
      save: { type: 'Will', effect: 'negates', description: 'harmless, object' },
      spellResistance: true,
      description: 'Weapon strikes true against evil foes.'
    },
    'blight': {
      name: 'Blight',
      school: 'transmutation',
      descriptors: [],
      level: { 'druid': 4 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: {
        type: 'creature',
        range: 'Touch',
        targets: 'Plant creature or plant touched'
      },
      duration: { type: 'instantaneous' },
      save: { type: 'Fortitude', effect: 'partial' },
      spellResistance: true,
      description: 'Withers one plant or deals 1d6/level damage to plant creature.'
    },
    'blindness-deafness': {
      name: 'Blindness/Deafness',
      school: 'necromancy',
      descriptors: [],
      level: { 'bard': 2, 'sorcerer': 2, 'wizard': 2 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: {
        type: 'creature',
        range: 'Medium (100 ft. + 10 ft./level)',
        targets: 'One living creature'
      },
      duration: { type: 'permanent' },
      save: { type: 'Fortitude', effect: 'negates' },
      spellResistance: true,
      description: 'Makes subject blinded or deafened.'
    },
    'blur': {
      name: 'Blur',
      school: 'illusion',
      subschool: 'glamer',
      descriptors: [],
      level: { 'sorcerer': 2, 'wizard': 2 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: {
        type: 'creature',
        range: 'Touch',
        targets: 'Creature touched'
      },
      duration: { type: 'timed', value: '1 min/level', dismissible: true },
      save: { type: 'Will', effect: 'negates', description: 'harmless' },
      spellResistance: true,
      description: 'Attacks miss subject 20% of the time.'
    },
    'bulls-strength-mass': {
      name: 'Bull’s Strength, Mass',
      school: 'transmutation',
      descriptors: [],
      level: { 'cleric': 6, 'druid': 6, 'sorcerer': 6, 'wizard': 6 },
      components: { verbal: true, somatic: true, divineFocus: true },
      castingTime: '1 standard action',
      target: {
        type: 'creatures',
        range: 'Close (25 ft. + 5 ft./2 levels)',
        targets: 'One creature/level, no two of which can be more than 30 ft. apart'
      },
      duration: { type: 'timed', value: '1 min/level' },
      save: { type: 'Will', effect: 'negates', description: 'harmless' },
      spellResistance: true,
      description: 'As bull’s strength, but affects multiple creatures.'
    },
    'bears-endurance-mass': {
      name: 'Bear’s Endurance, Mass',
      school: 'transmutation',
      descriptors: [],
      level: { 'cleric': 6, 'druid': 6, 'sorcerer': 6, 'wizard': 6 },
      components: { verbal: true, somatic: true, divineFocus: true },
      castingTime: '1 standard action',
      target: {
        type: 'creatures',
        range: 'Close (25 ft. + 5 ft./2 levels)',
        targets: 'One creature/level, no two of which can be more than 30 ft. apart'
      },
      duration: { type: 'timed', value: '1 min/level' },
      save: { type: 'Will', effect: 'negates', description: 'harmless' },
      spellResistance: true,
      description: 'As bear’s endurance, but affects multiple creatures.'
    },

  'antimagic-field': {
      name: 'Antimagic Field',
      school: 'abjuration',
      descriptors: [],
      level: { 'cleric': 8, 'magic': 6, 'protection': 6, 'sorcerer': 6, 'wizard': 6 },
      components: { verbal: true, somatic: true, material: 'A pinch of powdered iron or iron filings' },
      castingTime: '1 standard action',
      target: {
        type: 'area',
        range: '10 ft.',
        area: { type: 'emanation', size: '10-ft.-radius centered on you' }
      },
      duration: { type: 'timed', value: '10 min/level', dismissible: true },
      save: { type: 'none', effect: 'negates' },
      spellResistance: false,
      description: 'Invisible barrier moves with you, suppressing all magic and magic items within. Summoned creatures and incorporeal undead wink out. Does not dispel magic, but suppresses it.'
    },
    'antiplant-shell': {
      descriptors: [],
      name: 'Antiplant Shell',
      school: 'abjuration',
      level: { 'druid': 4 },
      components: { verbal: true, somatic: true, divineFocus: true },
      castingTime: '1 standard action',
      target: {
        type: 'area',
        range: '10 ft.',
        area: { type: 'emanation', size: '10-ft.-radius centered on you' }
      },
      duration: { type: 'timed', value: '10 min/level', dismissible: true },
      save: { type: 'none', effect: 'negates' },
      spellResistance: true,
      description: 'Invisible barrier protects from attacks by plant creatures or animated plants.'
    },
    'arcane-eye': {
      descriptors: [],
      name: 'Arcane Eye',
      school: 'divination',
      subschool: 'scrying',
      level: { 'sorcerer': 4, 'wizard': 4 },
      components: { verbal: true, somatic: true, material: 'A bit of bat fur' },
      castingTime: '10 minutes',
      target: {
  type: 'object',
        range: 'Unlimited',
  // effect: 'Magical sensor' // Removed unknown property
      },
      duration: { type: 'timed', value: '1 min/level', dismissible: true },
      save: { type: 'none', effect: 'negates' },
      spellResistance: false,
      description: 'Invisible magical sensor sends you visual information. Can travel in any direction as long as the spell lasts.'
    },
    'arcane-mark': {
      descriptors: [],
      name: 'Arcane Mark',
  school: 'abjuration',
      level: { 'sorcerer': 0, 'wizard': 0 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: {
        type: 'object',
        range: '0 ft.',
        targets: 'One personal rune or mark, all of which must fit within 1 sq. ft.'
      },
      duration: { type: 'permanent' },
      save: { type: 'none', effect: 'negates' },
      spellResistance: false,
      description: 'Inscribe your personal rune or mark, visible or invisible, on any substance. The mark can be seen with detect magic, see invisibility, or similar effects.'
    },
    'astral-projection': {
      name: 'Astral Projection',
      school: 'necromancy',
      descriptors: [],
      level: { 'cleric': 9, 'sorcerer': 9, 'wizard': 9, 'travel': 9 },
      components: { verbal: true, somatic: true, material: 'A jacinth worth at least 1,000 gp, plus a silver bar worth 5 gp for each person' },
      castingTime: '30 minutes',
      target: {
        type: 'touch',
        range: 'Touch',
        targets: 'You plus one additional willing creature touched per two caster levels'
      },
      duration: { type: 'timed', value: 'See text' },
      save: { type: 'none', effect: 'negates' },
      spellResistance: true,
      description: 'Projects your astral body (and those of companions) onto the Astral Plane, leaving your physical body behind in suspended animation. You can travel to other planes.'
    },
    'atonement': {
      name: 'Atonement',
      school: 'abjuration',
      descriptors: [],
      level: { 'cleric': 5, 'druid': 5 },
      components: { verbal: true, somatic: true, material: 'Burning incense', focus: 'Prayer beads or similar device worth at least 500 gp' },
      castingTime: '1 hour',
      target: {
        type: 'touch',
        range: 'Touch',
        targets: 'Living creature touched'
      },
      duration: { type: 'instantaneous' },
      save: { type: 'none', effect: 'negates' },
      spellResistance: true,
      description: 'Removes the burden of evil acts or misdeeds from the subject. Can reverse magical alignment change, restore class features, restore spell powers, or offer redemption. May require XP cost and/or valuable focus.'
    },
    'augury': {
      name: 'Augury',
      school: 'divination',
      descriptors: [],
      level: { 'cleric': 2 },
      components: { verbal: true, somatic: true, material: 'Incense worth at least 25 gp', focus: 'A set of marked sticks, bones, or similar tokens worth at least 25 gp' },
      castingTime: '1 minute',
      target: {
        type: 'self',
        range: 'Personal',
        targets: 'You'
      },
      duration: { type: 'instantaneous' },
  save: { type: 'none', effect: 'special' },
      spellResistance: false,
      description: 'Tells you whether a particular action will bring good or bad results in the immediate future. Base chance for a meaningful reply is 70% + 1% per caster level (max 90%).'
    },
    'awaken': {
      name: 'Awaken',
      school: 'transmutation',
      descriptors: [],
      level: { 'druid': 5 },
      components: { verbal: true, somatic: true, divineFocus: true, xpCost: 250 },
      castingTime: '24 hours',
      target: {
        type: 'touch',
        range: 'Touch',
        targets: 'Animal or tree touched'
      },
      duration: { type: 'instantaneous' },
      save: { type: 'Will', effect: 'negates' },
      spellResistance: true,
      description: 'Awakens a tree or animal to humanlike sentience. Awakened animal gets 3d6 Int, +1d3 Cha, +2 HD, and becomes a magical beast. Awakened tree gains plant type and 3d6 Int, Wis, Cha. Can speak languages known by the caster.'
    },
    'baleful-polymorph': {
      name: 'Baleful Polymorph',
      school: 'transmutation',
      descriptors: [],
      level: { 'druid': 5, 'sorcerer': 5, 'wizard': 5 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: {
        type: 'creature',
        range: 'Close (25 ft. + 5 ft./2 levels)',
        targets: 'One creature'
      },
      duration: { type: 'permanent' },
      save: { type: 'Fortitude', effect: 'negates', description: 'Will partial; see text' },
      spellResistance: true,
      description: 'Changes the subject into a Small or smaller animal of no more than 1 HD. Target retains alignment, hit points, and some abilities. If the subject remains in the new form for 24 hours, it may lose memories and stats. Shapechangers can revert as a standard action.'
    },
    'bestow-curse': {
      name: 'Bestow Curse',
      school: 'necromancy',
      descriptors: [],
      level: { 'cleric': 3, 'sorcerer': 4, 'wizard': 4 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: {
        type: 'touch',
        range: 'Touch',
        targets: 'Creature touched'
      },
      duration: { type: 'permanent' },
      save: { type: 'Will', effect: 'negates' },
      spellResistance: true,
      description: 'Place a curse on the subject. Choose one: -6 to an ability score, -4 on attack rolls/saves/ability checks/skill checks, or 50% chance to act each turn. Can invent other curses of similar power. Cannot be dispelled, but can be removed by break enchantment, limited wish, miracle, remove curse, or wish.'
    },
    'binding': {
      name: 'Binding',
      school: 'enchantment',
      subschool: 'compulsion',
      descriptors: ['mind-affecting'],
      level: { 'sorcerer': 8, 'wizard': 8 },
      components: { verbal: true, somatic: true, material: 'Varies by version, always includes chanting, gestures, and materials. Opals worth at least 500 gp per HD and a depiction or statuette of the subject.' },
      castingTime: '1 minute',
      target: {
        type: 'creature',
        range: 'Close (25 ft. + 5 ft./2 levels)',
        targets: 'One living creature'
      },
      duration: { type: 'timed', value: 'See text', dismissible: true },
      save: { type: 'Will', effect: 'negates', description: 'see text' },
      spellResistance: true,
      description: 'Creates a magical restraint to hold a creature. There are six versions: chaining, slumber, bound slumber, hedged prison, metamorphosis, minimus containment. Each has different effects and durations.'
    }
    ,
    'binding-earth': {
      name: 'Binding Earth',
      school: 'transmutation',
      descriptors: [],
      level: { 'druid': 3 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: { type: 'creature', range: 'Close (25 ft. + 5 ft./2 levels)', targets: 'One creature' },
      duration: { type: 'timed', value: '1 round/level' },
      save: { type: 'Reflex', effect: 'partial' },
      spellResistance: true,
      description: 'Areas of earth and stone attempt to drag the target of this spell down.'
    },
    'binding-earth-mass': {
      name: 'Binding Earth, Mass',
      school: 'transmutation',
      descriptors: [],
      level: { 'druid': 7 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: { type: 'creatures', range: 'Close (25 ft. + 5 ft./2 levels)', targets: 'One creature/level, no two of which can be more than 30 ft. apart' },
      duration: { type: 'timed', value: '1 round/level' },
      save: { type: 'Reflex', effect: 'partial' },
      spellResistance: true,
      description: 'As binding earth but with multiple targets.'
    },
    'bit-of-luck': {
      name: 'Bit of Luck',
      school: 'enchantment',
      descriptors: [],
      level: { 'cleric': 1 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: { type: 'creature', range: 'Touch', targets: 'Creature touched' },
      duration: { type: 'timed', value: '1 round' },
      save: { type: 'Will', effect: 'negates', description: 'harmless' },
      spellResistance: true,
      description: 'Gain a pool of luck that can be used to add a luck bonus to any d20 rolls, which can turn a failure into a success.'
    },
    'bite-the-hand': {
      name: 'Bite the Hand',
      school: 'enchantment',
      descriptors: ['mind-affecting'],
      level: { 'sorcerer': 3, 'wizard': 3 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: { type: 'creature', range: 'Close (25 ft. + 5 ft./2 levels)', targets: 'One summoned creature' },
      duration: { type: 'timed', value: '1 round/level' },
      save: { type: 'Will', effect: 'negates' },
      spellResistance: true,
      description: 'Compel a summoned creature to attack its summoner.'
    },
    'bite-the-hand-mass': {
      name: 'Bite the Hand, Mass',
      school: 'enchantment',
      descriptors: ['mind-affecting'],
      level: { 'sorcerer': 7, 'wizard': 7 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: { type: 'creatures', range: 'Close (25 ft. + 5 ft./2 levels)', targets: 'One summoned creature/level, no two of which can be more than 30 ft. apart' },
      duration: { type: 'timed', value: '1 round/level' },
      save: { type: 'Will', effect: 'negates' },
      spellResistance: true,
      description: 'As Bite the Hand but with multiple creatures.'
    },
    'biting-words': {
      name: 'Biting Words',
      school: 'evocation',
      descriptors: ['sonic'],
      level: { 'bard': 1 },
      components: { verbal: true },
      castingTime: '1 standard action',
      target: { type: 'creature', range: 'Close (25 ft. + 5 ft./2 levels)', targets: 'One creature' },
      duration: { type: 'instantaneous' },
      save: { type: 'Will', effect: 'half' },
      spellResistance: true,
      description: 'Deal 1d6+Str or Cha to target by speaking at it.'
    },
    'black-mark': {
      name: 'Black Mark',
      school: 'necromancy',
      descriptors: ['fear', 'mind-affecting'],
      level: { 'cleric': 4 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: { type: 'creature', range: 'Close (25 ft. + 5 ft./2 levels)', targets: 'One creature' },
      duration: { type: 'timed', value: '1 round/level' },
      save: { type: 'Will', effect: 'negates' },
      spellResistance: true,
      description: 'Mark someone which makes them afraid of water and turns aquatic creatures against them.'
    },
    'black-spot': {
      name: 'Black Spot',
      school: 'necromancy',
      descriptors: [],
      level: { 'cleric': 4 },
      components: { verbal: true, somatic: true },
      castingTime: '1 standard action',
      target: { type: 'creature', range: 'Close (25 ft. + 5 ft./2 levels)', targets: 'One creature' },
      duration: { type: 'timed', value: '1 round/level' },
      save: { type: 'Will', effect: 'negates' },
      spellResistance: true,
      description: 'Inflict a specific and feared pirate curse onto your target.'
    },
  // Removed duplicate black-tentacles entry
    // ...continue with the next 40+ spells in this batch following the same format...
};

