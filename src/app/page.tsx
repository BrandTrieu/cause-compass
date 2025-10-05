'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import InfiniteCauseCards from '@/components/InfiniteCauseCards'
import InfiniteCompanyCards from '@/components/InfiniteCompanyCards'
import { supabase } from '@/lib/supabase/client'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleGuestMode = () => {
    // Use useEffect for localStorage access to avoid hydration issues
    router.push('/search')
  }



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Discover How Companies
          <span className="text-secondary block">Align With Your Values</span>
        </h1>
        <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto">
          Get personalized ethical scores, detailed breakdowns, and find better alternatives 
          based on causes you care about.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search for a company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button type="submit" size="lg">
              Search
            </Button>
          </div>
        </form>

        {/* Guest Mode Button - Only show if not signed in */}
        {!isLoading && !user && (
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleGuestMode}>
              Continue as Guest
            </Button>
            <Button variant="primary" onClick={() => router.push('/login')}>
              Sign In for Personalized Results
            </Button>
          </div>
        )}
      </div>

      {/* Featured Causes */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8 text-foreground">Causes We Track</h2>
        <InfiniteCauseCards />
      </div>

      {/* Popular Companies */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8 text-foreground">Popular Companies</h2>
        <InfiniteCompanyCards />
      </div>

      {/* How It Works */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-8 text-foreground">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Set Your Values</h3>
            <p className="text-text-muted text-sm">
              Choose which causes matter most to you and set their importance levels.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-secondary">2</span>
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Search Companies</h3>
            <p className="text-text-muted text-sm">
              Find companies and see how they align with your values based on verified data.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-1/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-accent-1">3</span>
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Make Informed Choices</h3>
            <p className="text-text-muted text-sm">
              Get detailed breakdowns, AI summaries, and discover better alternatives.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}