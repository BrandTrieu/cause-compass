import { z } from 'zod'

// Define the valid tag keys
const validTagKeys = [
  'free_palestine',
  'russia_ukraine',
  'feminism_workplace',
  'child_labour',
  'lgbtq',
  'animal_cruelty',
  'environmentally_friendly',
  'ethical_sourcing',
  'data_privacy'
] as const

// Create a schema for preferences
export const prefsSchema = z.record(
  z.enum(validTagKeys),
  z.number().min(0).max(1)
)

export type Prefs = z.infer<typeof prefsSchema>

// Validation function for preferences
export function validatePrefs(prefs: unknown): Prefs {
  return prefsSchema.parse(prefs)
}

// Check if preferences object is valid
export function isValidPrefs(prefs: unknown): prefs is Prefs {
  try {
    prefsSchema.parse(prefs)
    return true
  } catch {
    return false
  }
}
