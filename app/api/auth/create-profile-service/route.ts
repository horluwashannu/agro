// This endpoint uses the service role to bypass RLS and create profiles
import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName, role } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email' },
        { status: 400 }
      )
    }

    // Create server client with service_role key
    const supabase = await createClient()

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        profile: existingProfile,
      })
    }

    // Create profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName || email.split('@')[0],
        role: role || 'customer',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Profile creation error:', error)
      return NextResponse.json(
        { error: `Profile creation failed: ${error.message}` },
        { status: 500 }
      )
    }

    // Create wallet
    await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        balance: 0,
        total_topup: 0,
        total_spent: 0,
      })
      .single()

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error: any) {
    console.error('[v0] Create profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
