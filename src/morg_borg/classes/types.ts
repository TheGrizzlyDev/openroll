export interface ClassData {
  name: string
  stats: Partial<Record<'str' | 'agi' | 'pre' | 'tou', number>>
  gear: string[]
  abilities: string[]
}
