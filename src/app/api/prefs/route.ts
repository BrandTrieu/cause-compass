import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { validatePrefs } from '@/lib/validation/prefs'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    
    // First try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session debug:', { session: session?.user?.email, sessionError })
    
    // Then try to get the user
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('Auth debug - User:', user?.email, 'Error:', error)

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized', debug: { user, error, session: session?.user?.email, sessionError } },
        { status: 401 }
      )
    }

    const appUser = await prisma.appUser.findUnique({
      where: { email: user.email }
    })

    if (!appUser) {
      // Create user if they don't exist (fallback for users who signed up before this fix)
      const defaultPrefs = {
        lgbtq: 0.5,
        child_labour: 0.5,
        data_privacy: 0.5,
        animal_cruelty: 0.5,
        free_palestine: 0.5,
        justice_for_ukraine: 0.5,
        ethical_sourcing: 0.5,
        women_workplace: 0.5,
        environmentally_friendly: 0.5
      }
      
      const newUser = await prisma.appUser.create({
        data: {
          email: user.email,
          prefsJson: defaultPrefs
        }
      })
      return NextResponse.json({ prefs: newUser.prefsJson || defaultPrefs })
    }

    return NextResponse.json({ prefs: appUser.prefsJson || {} })
  } catch (error) {
    console.error('Get prefs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // First try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Session debug POST:', { session: session?.user?.email, sessionError })
    
    // Then try to get the user
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('Auth debug POST - User:', user?.email, 'Error:', error)

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized', debug: { user, error, session: session?.user?.email, sessionError } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prefs } = body

    console.log('Received prefs:', prefs)

    // Validate preferences
    const validatedPrefs = validatePrefs(prefs)
    console.log('Validated prefs:', validatedPrefs)

    // Upsert user preferences
    const appUser = await prisma.appUser.upsert({
      where: { email: user.email },
      update: { 
        prefsJson: validatedPrefs,
        updatedAt: new Date()
      },
      create: {
        email: user.email,
        prefsJson: validatedPrefs
      }
    })

    return NextResponse.json({ prefs: appUser.prefsJson })
  } catch (error) {
    console.error('Save prefs error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    )
  }
}
