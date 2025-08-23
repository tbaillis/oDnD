import { createCharacter, type AbilityScores } from '../game/character'
import { sampleSpells } from '../game/magic'
import { sampleWeapons, sampleArmor } from '../game/equipment'
import { createEntity, type World } from '../engine/world'
import { GridPosition, SpriteComp, Team, Stats, HP, ACBreakdown, Movement } from '../engine/components'
import { addComponent } from 'bitecs'

// Sample characters for testing
export function createSampleFighter() {
  const abilities: AbilityScores = {
    STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 12, CHA: 8
  }
  
  const fighter = createCharacter({
    name: 'Sir Garrett',
    race: 'human',
    class: 'fighter',
    abilityScores: abilities
  })
  
  // Add equipment
  fighter.equipment.weapons = [sampleWeapons.longsword]
  fighter.equipment.armor = sampleArmor['chainmail']
  
  // Add some feats
  fighter.feats = ['Power Attack', 'Cleave', 'Weapon Focus (Longsword)']
  
  // Add some skills
  fighter.skills = {
    'Climb': { ranks: 4, total: 9, classSkill: true }, // 4 ranks + 3 STR + 2 synergy
    'Jump': { ranks: 2, total: 5, classSkill: true },
    'Intimidate': { ranks: 3, total: 2, classSkill: true }, // 3 ranks - 1 CHA
    'Ride': { ranks: 1, total: 3, classSkill: true },
    'Swim': { ranks: 2, total: 3, classSkill: false } // Cross-class
  }
  
  return fighter
}

export function createSampleWizard() {
  const abilities: AbilityScores = {
    STR: 8, DEX: 14, CON: 12, INT: 16, WIS: 13, CHA: 10
  }
  
  const wizard = createCharacter({
    name: 'Elara the Wise',
    race: 'elf',
    class: 'wizard',
    abilityScores: abilities
  })
  
  // Add equipment
  wizard.equipment.weapons = [sampleWeapons.dagger]
  
  // Add feats
  wizard.feats = ['Scribe Scroll', 'Spell Focus (Evocation)']
  
  // Add skills
  wizard.skills = {
    'Spellcraft': { ranks: 4, total: 7, classSkill: true }, // 4 ranks + 3 INT
    'Knowledge (Arcana)': { ranks: 4, total: 7, classSkill: true },
    'Concentration': { ranks: 4, total: 5, classSkill: true }, // 4 ranks + 1 CON
    'Craft (Alchemy)': { ranks: 2, total: 5, classSkill: true },
    'Decipher Script': { ranks: 2, total: 5, classSkill: true }
  }
  
  // Add spells
  wizard.spells = {
    known: {
      0: ['detect-magic', 'read-magic', 'mage-hand', 'light'],
      1: ['magic-missile', 'shield', 'identify', 'sleep']
    },
    perDay: {
      0: 3,
      1: 2
    }
  }
  
  return wizard
}

export function createSampleCleric() {
  const abilities: AbilityScores = {
    STR: 13, DEX: 10, CON: 14, INT: 12, WIS: 16, CHA: 14
  }
  
  const cleric = createCharacter({
    name: 'Brother Marcus',
    race: 'human',
    class: 'cleric',
    abilityScores: abilities
  })
  
  // Add equipment
  cleric.equipment.weapons = [sampleWeapons.dagger]
  cleric.equipment.armor = sampleArmor['chainmail']
  
  // Add feats
  cleric.feats = ['Extra Turning', 'Combat Casting']
  
  // Add skills
  cleric.skills = {
    'Concentration': { ranks: 4, total: 6, classSkill: true }, // 4 ranks + 2 CON
    'Heal': { ranks: 4, total: 7, classSkill: true }, // 4 ranks + 3 WIS
    'Knowledge (Religion)': { ranks: 4, total: 5, classSkill: true }, // 4 ranks + 1 INT
    'Spellcraft': { ranks: 2, total: 3, classSkill: true }
  }
  
  // Add spells
  cleric.spells = {
    known: {
      0: ['detect-magic', 'guidance', 'light', 'mending'],
      1: ['cure-light-wounds', 'bless', 'divine-favor', 'sanctuary']
    },
    perDay: {
      0: 3,
      1: 2
    }
  }
  
  return cleric
}

// Create entities in the ECS world from characters
export function createEntityFromCharacter(world: World, character: ReturnType<typeof createSampleFighter>, x: number, y: number): number {
  const entity = createEntity(world)
  
  // Add position component
  addComponent(world.ecs, GridPosition, entity)
  GridPosition.x[entity] = x
  GridPosition.y[entity] = y
  GridPosition.layer[entity] = 0
  
  // Add sprite component
  addComponent(world.ecs, SpriteComp, entity)
  SpriteComp.spriteRef[entity] = 1 // Reference to sprite
  SpriteComp.z[entity] = 1
  
  // Add team component
  addComponent(world.ecs, Team, entity)
  Team.id[entity] = 1 // Player team
  
  // Add stats component
  addComponent(world.ecs, Stats, entity)
  Stats.STR[entity] = character.abilityScores.STR
  Stats.DEX[entity] = character.abilityScores.DEX
  Stats.CON[entity] = character.abilityScores.CON
  Stats.INT[entity] = character.abilityScores.INT
  Stats.WIS[entity] = character.abilityScores.WIS
  Stats.CHA[entity] = character.abilityScores.CHA
  Stats.BAB[entity] = 1 // Simplified for level 1
  Stats.Fort[entity] = character.savingThrows.fortitude
  Stats.Ref[entity] = character.savingThrows.reflex
  Stats.Will[entity] = character.savingThrows.will
  
  // Add HP component
  addComponent(world.ecs, HP, entity)
  HP.current[entity] = character.hitPoints.current
  HP.max[entity] = character.hitPoints.max
  HP.temp[entity] = character.hitPoints.temporary
  
  // Add AC component
  addComponent(world.ecs, ACBreakdown, entity)
  ACBreakdown.base[entity] = 10
  ACBreakdown.armor[entity] = character.equipment.armor?.acBonus || 0
  ACBreakdown.shield[entity] = 0
  ACBreakdown.natural[entity] = 0
  ACBreakdown.deflection[entity] = 0
  ACBreakdown.dodge[entity] = 0
  ACBreakdown.misc[entity] = 0
  
  // Add movement component
  addComponent(world.ecs, Movement, entity)
  Movement.speed[entity] = 30 // Base speed
  Movement.encumberedSpeed[entity] = 30
  
  return entity
}

// Sample encounter setup
export function createSampleEncounter(world: World) {
  const fighter = createSampleFighter()
  const wizard = createSampleWizard()
  const cleric = createSampleCleric()
  
  // Create entities
  const fighterEntity = createEntityFromCharacter(world, fighter, 5, 5)
  const wizardEntity = createEntityFromCharacter(world, wizard, 4, 5)
  const clericEntity = createEntityFromCharacter(world, cleric, 6, 5)
  
  // Create some enemies
  const orc1 = createEntityFromCharacter(world, fighter, 8, 3) // Reuse fighter template
  const orc2 = createEntityFromCharacter(world, fighter, 8, 7)
  
  // Change enemy team
  Team.id[orc1] = 2 // Enemy team
  Team.id[orc2] = 2
  
  return {
    party: [
      { entity: fighterEntity, character: fighter },
      { entity: wizardEntity, character: wizard },
      { entity: clericEntity, character: cleric }
    ],
    enemies: [
      { entity: orc1, character: { ...fighter, name: 'Orc Warrior 1' } },
      { entity: orc2, character: { ...fighter, name: 'Orc Warrior 2' } }
    ]
  }
}

export const sampleData = {
  characters: {
    fighter: createSampleFighter,
    wizard: createSampleWizard,
    cleric: createSampleCleric
  },
  spells: sampleSpells,
  equipment: {
    weapons: sampleWeapons,
    armor: sampleArmor
  }
}
