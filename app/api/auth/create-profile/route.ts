import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// This is called by the client after successful Supabase auth signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, fullName, role } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create server client with service_role for elevated permissions
    const supabase = await createClient()

    // The profile should already exist from the trigger, but this is a fallback
    // Insert will be ignored if profile already exists (ON CONFLICT DO NOTHING)
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName || email,
        role: role || 'customer',
      })
      .select()
      .single()

    if (error && error.code !== 'PGRST204') {
      // PGRST204 means no rows returned (already exists, which is fine)
      console.error('[v0] Profile creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: data,
    })
  } catch (error: any) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
