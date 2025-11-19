// Only accessible by admin users
import { createClient as createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get current user
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()

    if (!currentUser || userError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if current user is admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create users' },
        { status: 403 }
      )
    }

    const { email, password, fullName, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create user via Supabase Auth with service role
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName || email.split('@')[0],
        role: role || 'customer',
      },
      email_confirm: true, // Auto-confirm email
    })

    if (createError || !newUser.user) {
      console.error('[v0] User creation error:', createError)
      return NextResponse.json(
        { error: `User creation failed: ${createError?.message}` },
        { status: 500 }
      )
    }

    // Profile should be created by trigger, but ensure it exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        email: newUser.user.email || '',
        full_name: fullName || email.split('@')[0],
        role: role || 'customer',
      })
      .select()
      .single()

    if (profileError) {
      console.error('[v0] Profile creation error:', profileError)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
      },
      profile,
    })
  } catch (error: any) {
    console.error('[v0] Create user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
