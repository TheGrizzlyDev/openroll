import type { Character } from './GameContext'

interface CharacterWithAccess extends Character {
  lastAccess?: number
}

export function sortCharactersByLastAccess(
  characters: CharacterWithAccess[]
): CharacterWithAccess[] {
  return [...characters].sort(
    (a, b) => (b.lastAccess ?? 0) - (a.lastAccess ?? 0)
  )
}
