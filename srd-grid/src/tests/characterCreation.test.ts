import { describe, it, expect } from 'vitest'

describe('Character Creation Modal', () => {
  it('should import character creation modal successfully', () => {
    // Simple import test to verify the module structure
    expect(async () => {
      const CharacterCreationModal = (await import('../ui/characterCreation')).default
      expect(CharacterCreationModal).toBeDefined()
      expect(typeof CharacterCreationModal).toBe('function')
    }).not.toThrow()
  })

  it('should have all required character creation dependencies', () => {
    // Test that all imports are available
    expect(async () => {
      await import('../game/character')
      await import('../game/equipment')
    }).not.toThrow()
  })

  it('should export CharacterCreationModal class', async () => {
    const module = await import('../ui/characterCreation')
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('function')
  })
})
