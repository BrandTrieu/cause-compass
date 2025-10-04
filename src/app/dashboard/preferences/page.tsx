'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PreferenceSliders } from '@/components/PreferenceSliders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase/client'
import { Prefs } from '@/lib/validation/prefs'
import { defaultGuestPrefs } from '@/lib/db/scoring'

export default function PreferencesPage() {
  const [user, setUser] = useState<any>(null)
  const [prefs, setPrefs] = useState<Prefs>(defaultGuestPrefs)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await loadPreferences(user.email!)
    }
    getUser()
  }, [router])

  const loadPreferences = async (email: string) => {
    try {
      const response = await fetch('/api/prefs')
      if (response.ok) {
        const data = await response.json()
        setPrefs(data.prefs || defaultGuestPrefs)
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (newPrefs: Prefs) => {
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch('/api/prefs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefs: newPrefs })
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      setPrefs(newPrefs)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Preferences</h1>
            <p className="text-gray-600 mt-2">
              Customize how companies are scored based on your values
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <PreferenceSliders
        initialPrefs={prefs}
        onSave={handleSave}
      />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Scoring Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Personalized Scoring</h3>
            <p className="text-gray-600 text-sm">
              Companies are scored based on how their actions align with your weighted preferences. 
              Higher weights mean those causes have more influence on the overall score.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Score Interpretation</h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• <strong>Aligned (0.3+):</strong> Company generally supports your values</li>
              <li>• <strong>Mixed (-0.3 to 0.3):</strong> Company has mixed record on your values</li>
              <li>• <strong>Conflicts (-0.3-):</strong> Company generally opposes your values</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Data Sources</h3>
            <p className="text-gray-600 text-sm">
              All company data comes from verified sources including company reports, 
              news articles, and third-party assessments. Each fact includes confidence 
              levels and source citations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
