'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface AI_SummaryProps {
  companyId: string
  mode: 'user' | 'guest'
}

export function AI_Summary({ companyId, mode }: AI_SummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSummary = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          mode
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      setSummary(data.paragraph)
    } catch (err) {
      setError('Failed to generate AI summary. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{summary}</p>
            <Button
              variant="outline"
              onClick={generateSummary}
              disabled={isLoading}
              className="mt-4"
            >
              Regenerate Summary
            </Button>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={generateSummary} disabled={isLoading}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {mode === 'user' 
                ? 'Get a personalized summary based on your values'
                : 'Get an AI-generated summary of this company\'s ethical stance'
              }
            </p>
            <Button onClick={generateSummary} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Summary'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
