import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Simple test API called')
    return NextResponse.json({ message: 'Simple test works' })
  } catch (error) {
    console.error('Simple test error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
