import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()
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

    // Create new user in app_users table
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

    return NextResponse.json({ 
      message: 'User created successfully',
      user: newUser 
    })
  } catch (error) {
    console.error('User initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize user' },
      { status: 500 }
    )
  }
}
