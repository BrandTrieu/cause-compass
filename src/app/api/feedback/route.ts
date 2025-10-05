import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, company, feedbackText, urls } = body

    // Validate required fields
    if (!user || !company || !feedbackText || !urls || !Array.isArray(urls)) {
      return NextResponse.json(
        { error: 'Missing required fields: user, company, feedbackText, and urls are required' },
        { status: 400 }
      )
    }

    // Validate that feedbackText is not empty
    if (feedbackText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback text cannot be empty' },
        { status: 400 }
      )
    }

    // Validate that at least one URL is provided
    const validUrls = urls.filter((url: string) => url.trim().length > 0)
    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one URL is required' },
        { status: 400 }
      )
    }

    // Validate URLs format
    for (const url of validUrls) {
      try {
        new URL(url)
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format provided' },
          { status: 400 }
        )
      }
    }

    // Create feedback entry
    const feedback = await prisma.feedback.create({
      data: {
        user: user.trim(),
        company: company.trim(),
        feedbackText: feedbackText.trim(),
        urls: validUrls
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        feedback: {
          id: feedback.id,
          user: feedback.user,
          company: feedback.company,
          feedbackText: feedback.feedbackText,
          urls: feedback.urls,
          createdAt: feedback.createdAt
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')
    const user = searchParams.get('user')

    const whereClause: Record<string, string> = {}
    
    if (company) {
      whereClause.company = company
    }
    
    if (user) {
      whereClause.user = user
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ feedbacks })

  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
