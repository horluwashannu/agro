import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    
    const response = NextResponse.json({ success: true })
    response.cookies.delete('sb-auth-token')
    response.cookies.delete('sb-refresh-token')
    
    return response
  } catch (error: any) {
    console.error('[v0] Sign out error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
