import { DungeonMasterMCPServer } from '../src/index'

async function main() {
  console.log('Starting in-process MCP server...')
  const server = new DungeonMasterMCPServer()
  // wait for HTTP adapter
  await new Promise((r) => setTimeout(r, 200))

  const base = `http://localhost:${process.env.PORT || 3001}/api/dm/tool`
  const payload = { tool: 'roll_initiative', arguments: { participants: [{ id: 'p1', name: 'Hero', type: 'player', initiativeBonus: 2 }] } }

  try {
    const res = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const json = await res.json()
    console.log('HTTP tool result:', json)
  } catch (err) {
    console.error('HTTP call failed', err)
    process.exitCode = 2
    } finally {
      try {
        await server.stopHttpServer()
      } catch (e) {
        console.error('Error while stopping HTTP server', e)
        process.exitCode = 3
      }
    }
}

main().catch((e) => { console.error(e); process.exit(1) })
