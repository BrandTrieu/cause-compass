import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { validatePrefs, type Prefs } from '@/lib/validation/prefs'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const appUser = await prisma.appUser.findUnique({
      where: { email: user.email }
    })

    if (!appUser) {
      return NextResponse.json({ prefs: {} })
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
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prefs } = body

    // Validate preferences
    const validatedPrefs = validatePrefs(prefs)

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
