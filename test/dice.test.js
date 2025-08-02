import { describe, it, expect, afterEach } from 'vitest'
import { DiceRoller, NumberGenerator } from '@dice-roller/rpg-dice-roller'

describe('dice expressions', () => {
  afterEach(() => {
    // restore default RNG
    NumberGenerator.generator.engine = NumberGenerator.engines.nativeMath
  })

  it('evaluates complex expressions with correct total and breakdown', () => {
    NumberGenerator.generator.engine = NumberGenerator.engines.min
    const roller = new DiceRoller()
    const result = roller.roll('4d6kh3+2')
    expect(result.total).toBe(5)
    expect(result.output).toBe('4d6kh3+2: [1d, 1, 1, 1]+2 = 5')
  })
})
