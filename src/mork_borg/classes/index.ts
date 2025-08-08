import type { ClassData } from './types'
import fangedDeserter from './fanged_deserter'
import gutterbornScum from './gutterborn_scum'
import esotericHermit from './esoteric_hermit'
import hereticalPriest from './heretical_priest'
import occultHerbalist from './occult_herbalist'
import wretchedRoyalty from './wretched_royalty'

export const classes: ClassData[] = [
  fangedDeserter,
  gutterbornScum,
  esotericHermit,
  hereticalPriest,
  occultHerbalist,
  wretchedRoyalty
]

export const classMap: Record<string, ClassData> = Object.fromEntries(
  classes.map(c => [c.name, c])
)

export const classNames = classes.map(c => c.name)

export type { ClassData }

export default classNames
