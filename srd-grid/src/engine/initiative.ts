export interface Combatant {
  id: string
  initiative: number
  dexMod: number
}

export class InitiativeTracker {
  private order: Combatant[] = []
  private index = 0

  setCombatants(list: Combatant[]) {
    this.order = [...list].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative
      return b.dexMod - a.dexMod
    })
    this.index = 0
  }

  current(): Combatant | undefined {
    return this.order[this.index]
  }

  next(): Combatant | undefined {
    if (this.order.length === 0) return undefined
    this.index = (this.index + 1) % this.order.length
    return this.current()
  }

  getIndex() { return this.index }
  count() { return this.order.length }
  firstId(): string | undefined { return this.order[0]?.id }

  delay(id: string) {
    // Place the delaying combatant just after current highest lower init; for MVP push to end of round
    const i = this.order.findIndex(c => c.id === id)
    if (i === -1) return
    const [c] = this.order.splice(i, 1)
    this.order.push(c)
    if (i <= this.index) this.index = Math.max(0, this.index - 1)
  }

  serialize() {
    return { order: this.order.map(c => ({ ...c })), index: this.index }
  }

  deserialize(data: { order: Combatant[]; index: number }) {
    this.order = [...data.order]
    this.index = Math.min(Math.max(0, data.index|0), Math.max(0, this.order.length - 1))
  }
}
