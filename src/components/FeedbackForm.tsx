'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface FeedbackFormProps {
  companyId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function FeedbackForm({ companyId, onSuccess, onCancel }: FeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [complaintText, setComplaintText] = useState('')
  const [urls, setUrls] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Check user authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email) {
        setUserEmail(user.email)
      }
    }

    checkAuthStatus()
  }, [])

  const addUrlField = () => {
    setUrls([...urls, ''])
  }

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index))
    }
  }

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  const handleClose = () => {
    setIsOpen(false)
    setComplaintText('')
    setUrls([''])
    setError('')
    setSuccess(false)
    if (onCancel) {
      onCancel()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Validate form
      if (!complaintText.trim()) {
        setError('Please describe your disagreement with the analysis')
        return
      }

      // Check if user is authenticated
      if (!userEmail) {
        setError('Please log in to submit feedback')
        return
      }

      const validUrls = urls.filter(url => url.trim().length > 0)
      if (validUrls.length === 0) {
        setError('Please provide at least one URL with evidence')
        return
      }

      // Validate URLs
      for (const url of validUrls) {
        try {
          new URL(url)
        } catch {
          setError('Please provide valid URLs')
          return
        }
      }

      // Submit to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userEmail,
          company: companyId,
          feedbackText: complaintText.trim(),
          urls: validUrls
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit feedback')
      }

      // Reset form and show success
      setComplaintText('')
      setUrls([''])
      setError('')
      setSuccess(true)
      
      setTimeout(() => {
        setSuccess(false)
        setIsOpen(false)
        if (onSuccess) {
          onSuccess()
        }
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user is not authenticated, show login prompt
  if (!userEmail) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Want to report an issue?</h3>
            <p className="text-sm text-text-muted mb-4">
              Please log in to submit feedback about our company analysis
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/login'}
            variant="outline"
          >
            Log In to Report Issue
          </Button>
        </CardContent>
      </Card>
    )
  }

  // If form is closed, show toggle button
  if (!isOpen) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="text-4xl mb-2">💭</div>
            <h3 className="text-lg font-semibold mb-2">Disagree with our analysis?</h3>
            <p className="text-sm text-text-muted mb-4">
              Help us improve by reporting any issues with our company analysis
            </p>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
          >
            Report Issue
          </Button>
        </CardContent>
      </Card>
    )
  }

  // If success state, show success message
  if (success) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-green-600 mb-2">✅</div>
          <h3 className="text-lg font-semibold mb-2">Feedback Submitted!</h3>
          <p className="text-sm text-text-muted">
            Thank you for your feedback. We will review it and update our analysis accordingly.
          </p>
        </CardContent>
      </Card>
    )
  }

  // If form is open, show the form
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Disagreement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="What do you disagree with in this analysis?"
            placeholder="Please describe what you believe is incorrect or missing in our analysis of this company..."
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            rows={4}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Evidence URLs (provide links to articles or sources that support your claim)
            </label>
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  className="flex-1"
                  required={index === 0}
                />
                {urls.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeUrlField(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addUrlField}
            >
              + Add Another URL
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
