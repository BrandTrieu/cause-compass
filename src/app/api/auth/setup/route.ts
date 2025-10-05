import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { defaultGuestPrefs } from '@/lib/db/scoring'

export async function POST() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user already exists in app_users table
    const existingUser = await prisma.appUser.findUnique({
      where: { email: user.email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        message: 'User already exists',
        user: existingUser 
      })
    }

    // Create new user in app_users table with default preferences
    const newUser = await prisma.appUser.create({
      data: {
        email: user.email,
        prefsJson: defaultGuestPrefs
      }
    })

    return NextResponse.json({ 
      message: 'User created successfully',
      user: newUser 
    })
  } catch (error) {
    console.error('User setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup user' },
      { status: 500 }
    )
  }
}
