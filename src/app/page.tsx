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
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Discover How Companies
          <span className="text-blue-600 block">Align With Your Values</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <h2 className="text-2xl font-semibold text-center mb-8">Popular Searches</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {popularSearches.map((company) => (
            <button
              key={company}
              onClick={() => router.push(`/search?q=${encodeURIComponent(company)}`)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              {company}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Causes */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center mb-8">Causes We Track</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCauses.map((cause) => (
            <Card key={cause.key} className="text-center">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{cause.name}</h3>
                <p className="text-gray-600 text-sm">{cause.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold mb-2">Set Your Values</h3>
            <p className="text-gray-600 text-sm">
              Choose which causes matter most to you and set their importance levels.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold mb-2">Search Companies</h3>
            <p className="text-gray-600 text-sm">
              Find companies and see how they align with your values based on verified data.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold mb-2">Make Informed Choices</h3>
            <p className="text-gray-600 text-sm">
              Get detailed breakdowns, AI summaries, and discover better alternatives.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}