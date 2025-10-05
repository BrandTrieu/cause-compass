'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PreferenceSliders } from '@/components/PreferenceSliders'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase/client'
import { Prefs } from '@/lib/validation/prefs'
import { defaultGuestPrefs } from '@/lib/db/scoring'

export default function PreferencesPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [prefs, setPrefs] = useState<Prefs>(defaultGuestPrefs)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await loadPreferences()
    }
    getUser()
  }, [router])

  const loadPreferences = async () => {
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
      
      // Show success toast
      setToastMessage('Preferences saved successfully!')
      setToastType('success')
      setShowToast(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Unknown error')
      
      // Show error toast
      setToastMessage('Failed to save preferences. Please try again.')
      setToastType('error')
      setShowToast(true)
    } finally {
      // Save completed
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
          <div className="h-8 bg-border rounded w-1/3 mb-8"></div>
          <div className="h-96 bg-border rounded"></div>
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
            <h1 className="text-3xl font-bold text-foreground">Your Preferences</h1>
            <p className="text-text-muted mt-2">
              Customize how companies are scored based on your values
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-accent-2 bg-red-50">
          <CardContent className="p-4">
            <p className="text-accent-2">{error}</p>
          </CardContent>
        </Card>
      )}

      <PreferenceSliders
        initialPrefs={prefs}
        onSave={handleSave}
      />

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
