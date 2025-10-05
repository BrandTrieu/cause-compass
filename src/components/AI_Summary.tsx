'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface AI_SummaryProps {
  companyId: string
  mode: 'user' | 'guest'
}

export function AI_Summary({ companyId, mode }: AI_SummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [citations, setCitations] = useState<{ url: string; title?: string | null }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 🔹 Automatically run the fetch when the component mounts
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/ai/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId, mode }),
        })

        if (!response.ok) throw new Error('Failed to generate summary')

        const data = await response.json()
        setSummary(data.paragraph)
        setCitations(data.citations || [])
      } catch (err) {
        console.error(err)
        setError('Failed to generate AI summary. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummary()
  }, [companyId, mode])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary — Powered by Gemini</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center text-gray-600">
            <p>Generating summary...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        ) : summary ? (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{summary}</p>

            {citations.length > 0 && (
              <div className="mt-3 text-sm">
                <p className="font-semibold">Sources:</p>
                <ul className="list-disc ml-4">
                  {citations.map((c, i) => (
                    <li key={i}>
                      <a href={c.url} target="_blank" rel="noreferrer" className="underline">
                        {c.title || c.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No summary available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
