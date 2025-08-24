import type { MonsterData } from './types'
import { 
  MONSTER_DATABASE, 
  getRandomMonster, 
  getRandomMonsterByCR, 
  searchMonsters,
  getMonsterById 
} from './database'
import { addEntity, addComponent } from 'bitecs'
import { 
  GridPosition, 
  SpriteComp, 
  Team, 
  Stats, 
  HP, 
  ACBreakdown, 
  Movement 
} from '../../engine/components'
import type { World } from '../../engine/world'

// Monster selection and management service
export class MonsterService {
  private selectedMonsterId: string | null = null
  private availableMonsters = MONSTER_DATABASE

  /**
   * Get the currently selected monster
   */
  getCurrentMonster(): MonsterData | null {
    if (!this.selectedMonsterId) {
      return null
    }
    return getMonsterById(this.selectedMonsterId) || null
  }

  /**
   * Set a specific monster as selected
   */
  setMonster(monsterId: string): MonsterData | null {
    const monster = getMonsterById(monsterId)
    if (monster) {
      this.selectedMonsterId = monsterId
      return monster
    }
    return null
  }

  /**
   * Select a random monster
   */
  selectRandomMonster(): MonsterData {
    const monster = getRandomMonster()
    this.selectedMonsterId = monster.id
    return monster
  }

  /**
   * Select a random monster with challenge rating constraint
   */
  selectRandomMonsterByCR(maxCR: number): MonsterData {
    const monster = getRandomMonsterByCR(maxCR)
    this.selectedMonsterId = monster.id
    return monster
  }

  /**
   * Search for monsters by name or type
   */
  searchMonsters(query: string): MonsterData[] {
    return searchMonsters(query)
  }

  /**
   * Get all available monsters
   */
  getAllMonsters(): MonsterData[] {
    return this.availableMonsters
  }

  /**
   * Convert a monster to ECS entity components (for Pawn B)
   */
  createMonsterEntity(world: World, monster: MonsterData, x: number, y: number): number {
    const entity = addEntity(world.ecs)

    // Grid position
    addComponent(world.ecs, GridPosition, entity)
    GridPosition.x[entity] = x
    GridPosition.y[entity] = y

    // Sprite - use generic monster sprite for now
    addComponent(world.ecs, SpriteComp, entity)
    SpriteComp.spriteRef[entity] = this.getMonsterSpriteId(monster)

    // Team (enemy team)
    addComponent(world.ecs, Team, entity)
    Team.id[entity] = 2 // Enemy team

    // Stats conversion from D&D to game system
    addComponent(world.ecs, Stats, entity)
    Stats.STR[entity] = monster.abilities.STR
    Stats.DEX[entity] = monster.abilities.DEX
    Stats.CON[entity] = monster.abilities.CON
    Stats.INT[entity] = monster.abilities.INT
    Stats.WIS[entity] = monster.abilities.WIS
    Stats.CHA[entity] = monster.abilities.CHA
    Stats.BAB[entity] = monster.baseAttack
    Stats.Fort[entity] = monster.saves.fortitude
    Stats.Ref[entity] = monster.saves.reflex
    Stats.Will[entity] = monster.saves.will

    // HP - use average HP from monster data
    addComponent(world.ecs, HP, entity)
    HP.current[entity] = monster.hitPoints.average
    HP.max[entity] = monster.hitPoints.average

    // AC breakdown - map monster AC to component structure
    addComponent(world.ecs, ACBreakdown, entity)
    ACBreakdown.base[entity] = 10 // Base AC
    ACBreakdown.armor[entity] = monster.armorClass.armor || 0
    ACBreakdown.shield[entity] = monster.armorClass.shield || 0
    ACBreakdown.natural[entity] = monster.armorClass.natural || 0
    ACBreakdown.deflection[entity] = 0
    ACBreakdown.dodge[entity] = 0
    ACBreakdown.misc[entity] = 0

    // Movement
    addComponent(world.ecs, Movement, entity)
    Movement.speed[entity] = monster.speed.land
    Movement.encumberedSpeed[entity] = monster.speed.land

    return entity
  }

  /**
   * Get appropriate sprite ID for monster type
   */
  private getMonsterSpriteId(monster: MonsterData): number {
    // Map monster types to sprite IDs
    const spriteMapping: { [key: string]: number } = {
      'goblin': 10,
      'orc': 11,
      'kobold': 12,
      'skeleton': 13,
      'zombie': 14,
      'owlbear': 15,
      'troll': 16,
      'bugbear': 17,
      'ogre': 18,
      'minotaur': 19,
      'gnoll': 20,
      'dire-wolf': 21
    }

    return spriteMapping[monster.id] || 10 // Default to goblin sprite if not found
  }

  /**
   * Calculate attack bonus for monster
   */
  calculateAttackBonus(monster: MonsterData, attackName?: string): number {
    if (attackName && monster.attacks) {
      const attack = monster.attacks.find(a => a.name === attackName)
      if (attack) {
        return attack.attackBonus
      }
    }
    
    // Return base attack bonus plus strength modifier
    const strMod = Math.floor((monster.abilities.STR - 10) / 2)
    return monster.baseAttack + strMod
  }

  /**
   * Calculate damage for monster attack
   */
  calculateDamage(monster: MonsterData, attackName?: string): string {
    if (attackName && monster.attacks) {
      const attack = monster.attacks.find(a => a.name === attackName)
      if (attack) {
        return attack.damage
      }
    }

    // Default attack based on size and strength
    const strMod = Math.floor((monster.abilities.STR - 10) / 2)
    const baseDamage = monster.size === 'Large' ? '1d8' : 
                      monster.size === 'Small' ? '1d4' : '1d6'
    
    return strMod > 0 ? `${baseDamage}+${strMod}` : baseDamage
  }

  /**
   * Get monster's special abilities that affect combat
   */
  getCombatAbilities(monster: MonsterData): MonsterData['specialAttacks'] {
    return monster.specialAttacks || []
  }

  /**
   * Check if monster has specific damage resistance/immunity
   */
  hasDamageResistance(monster: MonsterData, damageType: string): boolean {
    return monster.damageReduction?.bypass.includes(damageType) || false
  }

  /**
   * Check if monster is immune to damage type
   */
  isDamageImmune(monster: MonsterData, damageType: string): boolean {
    return monster.damageImmunity?.includes(damageType) || false
  }

  /**
   * Get damage reduction amount for monster
   */
  getDamageReduction(monster: MonsterData): { amount: number; bypass: string } | null {
    return monster.damageReduction || null
  }

  /**
   * Check if monster has energy resistance to specific type
   */
  getEnergyResistance(monster: MonsterData, energyType: string): number {
    return monster.energyResistance?.[energyType] || 0
  }
}

// Singleton instance
export const monsterService = new MonsterService()
