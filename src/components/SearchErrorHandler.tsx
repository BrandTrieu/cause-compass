'use client'

import { Button } from '@/components/ui/Button'

interface SearchErrorHandlerProps {
  variant?: 'retry' | 'home'
}

export function SearchErrorHandler({ variant = 'retry' }: SearchErrorHandlerProps) {
  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  if (variant === 'home') {
    return (
      <Button onClick={handleGoHome}>
        Browse All Companies
      </Button>
    )
  }

  return (
    <Button onClick={handleRetry}>
      Try Again
    </Button>
  )
}
