import { character } from './morkBorgData'

export const characterNames = character.names

export const getRandomName = (): string => {
  return characterNames[Math.floor(Math.random() * characterNames.length)]
}

export const getRandomNames = (count: number): string[] => {
  const shuffled = [...characterNames].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, characterNames.length))
}
