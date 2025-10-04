import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { validatePrefs } from '@/lib/validation/prefs'

export async function GET(request: NextRequest) {
  try {
    // For now, let's create a test user to see if the database connection works
    console.log('Testing database connection...')
    
    // Create a test user
    const testUser = await prisma.appUser.create({
      data: {
        email: 'test@example.com',
        prefsJson: {}
      }
    })
    
    console.log('Test user created:', testUser)
    
    return NextResponse.json({ 
      message: 'Test user created successfully',
      user: testUser 
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { error: 'Database test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prefs } = body

    // Validate preferences
    const validatedPrefs = validatePrefs(prefs)

    // Create a test user with preferences
    const testUser = await prisma.appUser.create({
      data: {
        email: 'test-with-prefs@example.com',
        prefsJson: validatedPrefs
      }
    })

    return NextResponse.json({ 
      message: 'Test user with preferences created',
      user: testUser 
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { error: 'Database test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
