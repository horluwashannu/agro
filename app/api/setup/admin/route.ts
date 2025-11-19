import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/setup/admin
 * Creates admin user if it doesn't exist (idempotent)
 * Requires ADMIN_SETUP_SECRET for security
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const secret = body.secret || request.headers.get('x-admin-secret')

    if (!secret || secret !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json(
        { error: 'Invalid or missing admin secret' },
        { status: 401 }
      )
    }

    // Use service role for admin creation
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const adminEmail = 'admin@agro.com'
    const adminPassword = 'oluwashannu'

    // Check if admin already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const adminExists = existingUser.users.find(u => u.email === adminEmail)

    if (adminExists) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        email: adminEmail,
      })
    }

    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'System Admin',
        role: 'admin',
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: `Failed to create admin user: ${authError.message}` },
        { status: 500 }
      )
    }

    // Update profile to admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('[v0] Failed to update admin profile:', profileError)
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      email: adminEmail,
      warning: 'IMPORTANT: Change the admin password immediately after setup!',
    })
  } catch (error: any) {
    console.error('[v0] Admin setup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to setup admin' },
      { status: 500 }
    )
  }
}
