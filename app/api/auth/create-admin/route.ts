import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// Should only be called from backend/scripts during setup
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authorization check if needed
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.ADMIN_SETUP_SECRET || 'dev-only-change-this'
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'admin@agro.com')
      .single()

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        profile: existingAdmin,
      })
    }

    // Create admin user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@agro.com',
      password: 'admin',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrator',
        role: 'admin',
      },
    })

    if (authError) {
      console.error('[v0] Auth creation error:', authError)
      // If user already exists in auth, continue
      if (!authError.message.includes('already')) {
        return NextResponse.json(
          { error: 'Failed to create admin user' },
          { status: 500 }
        )
      }
    }

    const adminId = authData?.user?.id

    if (!adminId) {
      return NextResponse.json(
        { error: 'Failed to get admin user ID' },
        { status: 500 }
      )
    }

    // Create profile for admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: adminId,
        email: 'admin@agro.com',
        full_name: 'Administrator',
        role: 'admin',
      })
      .select()
      .single()

    if (profileError && !profileError.message.includes('duplicate')) {
      console.error('[v0] Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create admin profile' },
        { status: 500 }
      )
    }

    // Create wallet for admin
    await supabase.from('wallets').insert({
      user_id: adminId,
      balance: 0,
      total_topup: 0,
      total_spent: 0,
    }).select()

    console.warn(
      '[v0] ⚠️  SECURITY WARNING: Admin user created with default password "admin". CHANGE THIS IMMEDIATELY in production!'
    )

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully. Default password is "admin" - CHANGE IMMEDIATELY!',
      profile,
    })
  } catch (error: any) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
