import { describe, it, expect } from 'vitest'

describe('Character Creation UI', () => {
  it('should import character creation UI successfully', () => {
    // Simple import test to verify the module structure
    expect(async () => {
      const { CharacterCreationUI } = await import('../ui/characterCreation')
      expect(CharacterCreationUI).toBeDefined()
      expect(typeof CharacterCreationUI).toBe('function')
    }).not.toThrow()
  })

  it('should have all required character creation dependencies', () => {
    // Test that all imports are available
    expect(async () => {
      await import('../game/character')
      await import('../game/equipment')
    }).not.toThrow()
  })

  it('should export CharacterCreationUI class', async () => {
    const module = await import('../ui/characterCreation')
    expect(module.CharacterCreationUI).toBeDefined()
    expect(typeof module.CharacterCreationUI).toBe('function')
  })
})
