// Environment variable validation
export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }

  // Optional but recommended
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set - AI summaries will be disabled')
  }
}

// Call validation on import
validateEnv()
