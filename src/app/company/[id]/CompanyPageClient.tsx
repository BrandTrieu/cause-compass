'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface CompanyPageClientProps {
  id: string
}

export default function CompanyPageClient({ id }: CompanyPageClientProps) {
  const [mode, setMode] = useState<'user' | 'guest'>('guest')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          setMode('user')
          console.log('User authenticated, using personalized preferences for company page')
        } else {
          setMode('guest')
          console.log('No user found, using guest preferences for company page')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setMode('guest')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      // Redirect to the company page with the mode parameter
      router.push(`/company/${id}?mode=${mode}`)
    }
  }, [mode, isLoading, router, id])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <div>Redirecting...</div>
}
