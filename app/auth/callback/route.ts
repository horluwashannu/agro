import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams?.get('code')

  if (code) {
    try {
      const supabase = await createClient()
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('[v0] Auth callback error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=auth_callback', request.url))
    }
  }

  return NextResponse.redirect(new URL('/', request.url))
}
