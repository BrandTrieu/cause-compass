'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Prefs } from '@/lib/validation/prefs'

interface PreferenceSlidersProps {
  initialPrefs: Prefs
  onSave: (prefs: Prefs) => Promise<void>
  className?: string
}

const tagLabels: Record<string, string> = {
  free_palestine: 'Free Palestine',
  russia_ukraine: 'Russia Ukraine',
  feminism_workplace: 'Feminism/Workplace',
  child_labour: 'Child Labour',
  lgbtq: 'LGBTQ+',
  animal_cruelty: 'Animal Cruelty',
  environmentally_friendly: 'Environment',
  ethical_sourcing: 'Ethical Sourcing',
  data_privacy: 'Data Privacy'
}

const tagDescriptions: Record<string, string> = {
  free_palestine: 'Support for Palestinian rights and opposition to Israeli occupation',
  russia_ukraine: 'Position on Russia-Ukraine conflict and support for Ukraine',
  feminism_workplace: 'Gender equality, women\'s rights, and workplace diversity',
  child_labour: 'Opposition to child labor and support for children\'s rights',
  lgbtq: 'Support for LGBTQ+ rights and equality',
  animal_cruelty: 'Opposition to animal cruelty and support for animal welfare',
  environmentally_friendly: 'Environmental sustainability and climate action',
  ethical_sourcing: 'Ethical supply chain and fair trade practices',
  data_privacy: 'Protection of user data and privacy rights'
}

export function PreferenceSliders({ initialPrefs, onSave, className }: PreferenceSlidersProps) {
  const [prefs, setPrefs] = useState<Prefs>(initialPrefs)
  const [isSaving, setIsSaving] = useState(false)

  const handleSliderChange = (tagKey: string, value: number) => {
    setPrefs(prev => ({
      ...prev,
      [tagKey]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(prefs)
    } finally {
      setIsSaving(false)
    }
  }

  const getSliderLabel = (value: number) => {
    if (value <= 0.2) return 'Low'
    if (value <= 0.5) return 'Medium'
    if (value <= 0.8) return 'High'
    return 'Very High'
  }

  const getSliderColor = (value: number) => {
    if (value <= 0.2) return '#6C757D'
    if (value <= 0.5) return '#A2B29F'
    if (value <= 0.8) return '#BDD2B6'
    return '#E63946'
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Set Your Values</CardTitle>
          <p className="text-sm text-text-muted">
            Adjust the importance of each cause to personalize your company recommendations.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(tagLabels).map(([tagKey, label]) => (
            <div key={tagKey} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <label className="font-medium text-sm text-foreground">{label}</label>
                  <p className="text-xs text-text-muted">{tagDescriptions[tagKey]}</p>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {getSliderLabel(prefs[tagKey] || 0)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={prefs[tagKey] || 0}
                  onChange={(e) => handleSliderChange(tagKey, parseFloat(e.target.value))}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, ${getSliderColor(prefs[tagKey] || 0)} 0%, ${getSliderColor(prefs[tagKey] || 0)} ${(prefs[tagKey] || 0) * 100}%, #E9ECEF ${(prefs[tagKey] || 0) * 100}%, #E9ECEF 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>Not Important</span>
                  <span>Very Important</span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
