import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.appUser.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({
        message: 'User already exists',
        user: existingUser
      })
    }

    // Create new user
    const newUser = await prisma.appUser.create({
      data: {
        email,
        prefsJson: {}
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
