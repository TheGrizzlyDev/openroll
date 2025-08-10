import type { Character } from './GameContext'

export function sortCharactersByLastAccess(
  characters: Character[],
  lastAccess: Record<string, number>
): number[] {
  return characters
    .map((c, i) => ({ idx: i, id: c.id }))
    .sort((a, b) => (lastAccess[b.id] ?? 0) - (lastAccess[a.id] ?? 0))
    .map(c => c.idx)
}
