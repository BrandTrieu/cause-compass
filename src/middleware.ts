import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // For now, we'll handle auth protection in the page components
  // This middleware can be enhanced later with proper Supabase SSR support
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
