import { Stance } from '@prisma/client'

export type Prefs = Record<string, number> // tag key -> weight

export type Fact = {
  tagKey: string
  stance: Stance
  confidence: number
}

/**
 * Convert stance to evidence score
 * +1 for supports, -1 for opposes/alleged_violation, 0 for neutral
 */
export function stanceToEvidence(stance: Stance): number {
  switch (stance) {
    case 'supports':
      return 1
    case 'opposes':
    case 'alleged_violation':
      return -1
    case 'neutral':
      return 0
    default:
      return 0
  }
}

/**
 * Calculate company score based on user preferences and facts
 * Returns normalized score from -1 to +1
 */
export function companyScore(prefs: Prefs, facts: Fact[]): number {
  if (Object.keys(prefs).length === 0) {
    return 0
  }

  let weightedSum = 0
  let totalWeight = 0

  for (const fact of facts) {
    const weight = prefs[fact.tagKey] || 0
    if (weight > 0) {
      const evidence = stanceToEvidence(fact.stance)
      const weightedEvidence = evidence * fact.confidence * weight
      weightedSum += weightedEvidence
      totalWeight += weight
    }
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

/**
 * Default guest preferences with even weights across all tags
 */
export const defaultGuestPrefs: Prefs = {
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

/**
 * Get top weighted tags from preferences
 */
export function getTopWeightedTags(prefs: Prefs, limit: number = 3): string[] {
  return Object.entries(prefs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([tagKey]) => tagKey)
}

/**
 * Check if company score is below threshold for showing alternatives
 */
export function shouldShowAlternatives(score: number, threshold: number = -0.2): boolean {
  return score < threshold
}
