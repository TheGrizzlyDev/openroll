# Mörk Borg Data Collection

This directory contains the complete extracted and organized data from the Mörk Borg Bare Bones Edition rulebook.

## Data Structure

### Overview
All data is organized into logical categories and stored as JSON files for easy integration into the Openroll application.

### File Structure

```
data/mork_borg/
├── character/
│   └── character.json     # Character names, abilities, creation data
├── equipment/
│   └── equipment.json     # Weapons, armor, gear, services
├── magic/
│   └── magic.json         # Occult treasures and magical items
├── tables/
│   └── tables.json        # Random tables (traps, weather, etc.)
├── rules/
│   └── rules.json         # Game mechanics and rules
└── lore/
    └── lore.json          # World lore and locations
```

## Data Categories

### Character Data (`character/character.json`)
- **names**: 48 character names for random generation
- **abilities**: Four core abilities (Agility, Presence, Strength, Toughness) with descriptions
- **creation**: Character creation rules and starting equipment

### Equipment (`equipment/equipment.json`)
- **weapons**: 10 different weapons with damage values
- **armor**: 4 armor types with protective properties
- **gear**: 45 equipment items with costs and descriptions
- **services**: Various services and their costs

### Magic (`magic/magic.json`)
- **occultTreasures**: 10 magical items with detailed descriptions
- **scrolls**: Scroll magic rules (placeholder for future expansion)

### Tables (`tables/tables.json`)
- **traps**: 12 random trap descriptions
- **weather**: 12 weather conditions
- **corpsePlundering**: 26 items for corpse plundering table
- **reactions**: 5 creature reaction results

### Rules (`rules/rules.json`)
- **combat**: Combat mechanics, initiative, critical hits/fumbles
- **tests**: Difficulty ratings and test mechanics
- **healing**: Rest and recovery rules
- **improvement**: Character advancement rules

### Lore (`lore/lore.json`)
- **world**: World information (placeholder for future expansion)
- **locations**: Key locations (placeholder)
- **calendar**: Calendar system (placeholder)
- **scriptures**: Religious texts (placeholder)

## Usage Examples

### Loading Character Names
```javascript
import characterData from './data/mork_borg/character/character.json';
const randomName = characterData.names[Math.floor(Math.random() * characterData.names.length)];
```

### Getting Random Equipment
```javascript
import equipmentData from './data/mork_borg/equipment/equipment.json';
const randomWeapon = equipmentData.weapons[Math.floor(Math.random() * equipmentData.weapons.length)];
```

### Rolling on Random Tables
```javascript
import tablesData from './data/mork_borg/tables/tables.json';
const trapRoll = Math.floor(Math.random() * 12) + 1;
const trap = tablesData.traps.find(t => t.roll === trapRoll.toString());
```

## Data Quality

- All data has been manually verified against the source PDF
- Character names include proper diacritical marks (ü, ö, ä)
- Equipment costs and properties are accurately preserved
- Magical item descriptions are complete and unedited
- Random tables maintain their original roll ranges

## Integration Notes

### For Character Creation
1. Use `character.names` for random name generation
2. Apply `character.abilities` for character stats
3. Reference `equipment.weapons` and `equipment.armor` for starting gear

### For Game Masters
1. Use `tables.traps` for dungeon encounters
2. Reference `tables.weather` for environmental conditions
3. Use `tables.corpsePlundering` for loot generation
4. Apply `magic.occultTreasures` for magical item discovery

### For Combat Mechanics
1. Implement `rules.combat` for battle resolution
2. Use `rules.tests` for skill checks
3. Apply `rules.healing` for recovery mechanics

## Future Expansion

The data structure is designed to accommodate additional content:
- **Lore section** can be expanded with detailed world information
- **Magic section** can include more scroll types and spells
- **Rules section** can accommodate additional mechanics
- **Tables section** can include more random generation tables

## Source

Data extracted from Mörk Borg Bare Bones Edition, published by Ockult Örtmästare Games & Stockholm Kartell 2019.

## Technical Notes

- All JSON files are properly formatted and validated
- Unicode characters are preserved for proper names
- Roll ranges are maintained as strings for flexibility
- Costs are stored with currency suffix (s = silver)
- Damage values use standard dice notation (d4, d6, d8, d10)
