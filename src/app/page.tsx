'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleGuestMode = () => {
    localStorage.setItem('guest', 'true')
    router.push('/search')
  }

  const popularSearches = [
    'Apple', 'Nike', 'Patagonia', 'Starbucks', 'Tesla', 'Meta'
  ]

  const featuredCauses = [
    { key: 'environmentally_friendly', name: 'Environment', description: 'Climate action and sustainability' },
    { key: 'lgbtq', name: 'LGBTQ+ Rights', description: 'Equality and inclusion' },
    { key: 'data_privacy', name: 'Data Privacy', description: 'Protection of personal information' },
    { key: 'ethical_sourcing', name: 'Ethical Sourcing', description: 'Fair trade and supply chains' }
  ]

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

        {/* Guest Mode Button */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={handleGuestMode}>
            Continue as Guest
          </Button>
          <Button variant="primary" onClick={() => router.push('/login')}>
            Sign In for Personalized Results
          </Button>
        </div>
      </div>

      {/* Popular Searches */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8 text-foreground">Popular Searches</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {popularSearches.map((company) => (
            <button
              key={company}
              onClick={() => router.push(`/search?q=${encodeURIComponent(company)}`)}
              className="px-4 py-2 bg-white border border-border rounded-full hover:bg-background transition-colors text-foreground"
            >
              {company}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Causes */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8 text-foreground">Causes We Track</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCauses.map((cause) => (
            <Card key={cause.key} className="text-center">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-foreground">{cause.name}</h3>
                <p className="text-text-muted text-sm">{cause.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
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