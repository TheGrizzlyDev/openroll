// Import the extracted Mörk Borg data
import characterData from '../../../data/mork_borg/character/character.json'
import equipmentData from '../../../data/mork_borg/equipment/equipment.json'
import magicData from '../../../data/mork_borg/magic/magic.json'
import rulesData from '../../../data/mork_borg/rules/rules.json'

export const morkBorgData = {
  character: characterData,
  equipment: equipmentData,
  magic: magicData,
  rules: rulesData
} as const

// Export specific data for easier imports
export const { character, equipment, magic, rules } = morkBorgData
