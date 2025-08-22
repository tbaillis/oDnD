// Component shape declarations (initial minimal forms); wiring to bitECS will come next.
export interface GridPosition { x: number; y: number; layer: number }
export interface SpriteComp { spriteRef: string | null; z: number }
export interface Team { id: string }
export type SizeCategory = 'fine'|'diminutive'|'tiny'|'small'|'medium'|'large'|'huge'|'gargantuan'|'colossal'
export interface Size { category: SizeCategory; reach: number }
export interface Vision { sight: number; darkvision?: number; blindsense?: number }
export interface Stats { STR: number; DEX: number; CON: number; INT: number; WIS: number; CHA: number; BAB: number; Fort: number; Ref: number; Will: number }
export interface HP { current: number; max: number; temp: number }
export interface ACBreakdown { base: number; armor: number; shield: number; natural: number; deflection: number; dodge: number; misc: number }
export interface Movement { speed: number; encumberedSpeed?: number }
export interface EffectsEntry { id: string; durationRounds: number; source?: string }
export interface EntityComponents {
  id: number
  pos?: GridPosition
  sprite?: SpriteComp
  team?: Team
  size?: Size
  vision?: Vision
  stats?: Stats
  hp?: HP
  ac?: ACBreakdown
  move?: Movement
  effects?: EffectsEntry[]
}
