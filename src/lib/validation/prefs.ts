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

// Create a schema for preferences - make values optional and provide defaults
export const prefsSchema = z.record(
  z.enum(validTagKeys),
  z.number().min(0).max(1).optional()
).transform((prefs) => {
  // Ensure all required keys have the specified default values
  const defaultPrefs: Record<string, number> = {
    lgbtq: 0.5,
    child_labour: 0.5,
    data_privacy: 0.5,
    animal_cruelty: 0.5,
    free_palestine: 0.5,
    russia_ukraine: 0.5,
    ethical_sourcing: 0.5,
    feminism_workplace: 0.5,
    environmentally_friendly: 0.5
  }
  
  // Override with provided values
  validTagKeys.forEach(key => {
    if (prefs[key] !== undefined) {
      defaultPrefs[key] = prefs[key]!
    }
  })
  
  return defaultPrefs as Prefs
})

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
