'use client'

import { Button } from '@/components/ui/Button'

export function ErrorHandler() {
  return (
    <div className="flex gap-4 justify-center">
      <Button onClick={() => {
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }}>
        Try Again
      </Button>
      <Button variant="outline" onClick={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/search'
        }
      }}>
        Back to Search
      </Button>
    </div>
  )
}
