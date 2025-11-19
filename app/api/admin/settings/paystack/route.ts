import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/settings/paystack
 * Updates Paystack settings (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { publicKey, secretKey } = body

    // Store in settings table (encrypted at rest if possible)
    const { error } = await supabase
      .from('settings')
      .upsert(
        [
          { key: 'paystack_public_key', value: { key: publicKey }, updated_by: user.id },
          { key: 'paystack_secret_key', value: { key: secretKey }, updated_by: user.id },
        ],
        { onConflict: 'key' }
      )

    if (error) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Paystack settings updated' })
  } catch (error: any) {
    console.error('[v0] Settings update error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
