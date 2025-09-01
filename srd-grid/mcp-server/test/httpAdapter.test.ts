import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { DungeonMasterMCPServer } from '../src/index'

let server: DungeonMasterMCPServer | null = null
let httpServer: any = null

describe('MCP HTTP adapter and tool dispatch', () => {
  beforeAll(async () => {
    server = new DungeonMasterMCPServer()
    // Give the internal HTTP adapter a moment to start
    await new Promise((r) => setTimeout(r, 200))
  })

  afterAll(async () => {
    // nothing to shutdown for now - server listens on process env port and will exit with process
    server = null
  })

  it('dispatches start_encounter and spawn_monster via handleToolCall', async () => {
    if (!server) throw new Error('server not initialized')
    const res = await (server as any).handleToolCall('start_encounter', {
      name: 'test-enc',
      monsters: [{ id: 'gob-1', name: 'Goblin', count: 1, positions: [{ x: 2, y: 2 }], hp: 8 }]
    })

    expect(res).toBeDefined()
    // start_encounter returns content array with text
    expect(res.content && Array.isArray(res.content)).toBe(true)

    const spawnRes = await (server as any).handleToolCall('spawn_monster', { id: 'spawn-1', name: 'Imp', x: 5, y: 5, hp: 6 })
    expect(spawnRes).toBeDefined()
    expect(spawnRes.content && spawnRes.content[0] && typeof spawnRes.content[0].text === 'string').toBe(true)
  })

  it('responds to HTTP POST /api/dm/tool', async () => {
    // call the HTTP adapter endpoint
    const base = `http://localhost:${process.env.PORT || 3001}/api/dm/tool`
    const payload = { tool: 'roll_initiative', arguments: { participants: [{ id: 'p1', name: 'Hero', type: 'player', initiativeBonus: 2 }] } }
    const res = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    expect(res.ok).toBe(true)
    const json = await res.json()
    expect(json).toBeDefined()
    // roll_initiative returns content array
    expect(json.content && Array.isArray(json.content)).toBe(true)
  })
})
