import { describe, it, expect, afterEach } from 'vitest'
import { DiceRoller, NumberGenerator, type DiceRoll } from '@dice-roller/rpg-dice-roller'

describe('dice expressions', () => {
  afterEach(() => {
    // restore default RNG
    NumberGenerator.generator.engine = NumberGenerator.engines.nativeMath
  })

  it('evaluates complex expressions with correct total and breakdown', () => {
    NumberGenerator.generator.engine = NumberGenerator.engines.min
    const roller = new DiceRoller()
    const result = roller.roll('4d6kh3+2') as DiceRoll
    expect(result.total).toBe(5)
    expect(result.output).toMatch(/^4d6kh3\+2: \[(?:\d+d?,\s){3}\d+d?\]\+2 = 5$/)
  })
})
