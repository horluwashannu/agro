import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { initializePaystackPayment, generatePaystackReference } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const { amount, type, order_id } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let profile
    try {
      const { data } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single()

      profile = data

      if (!profile) {
        // Try API fallback
        const fallbackRes = await fetch(`/api/auth/create-profile-service`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id }),
        })

        if (!fallbackRes.ok) {
          return NextResponse.json(
            { error: 'Profile initialization failed' },
            { status: 400 }
          )
        }

        const { profile: createdProfile } = await fallbackRes.json()
        profile = createdProfile
      }
    } catch (error) {
      console.error('[v0] Profile lookup error:', error)
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 400 }
      )
    }

    const reference = generatePaystackReference()
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    let paystackResponse
    try {
      paystackResponse = await initializePaystackPayment(
        {
          email: profile.email,
          amount,
          reference,
          metadata: {
            user_id: user.id,
            order_id,
            payment_type: type,
          },
        },
        secretKey
      )
    } catch (error: any) {
      console.error('[v0] Paystack initialization error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to initialize payment' },
        { status: 400 }
      )
    }

    // Create payment record
    const { error: insertError } = await supabase.from('payments').insert([
      {
        user_id: user.id,
        order_id,
        amount,
        currency: 'NGN',
        paystack_ref: reference,
        status: 'pending',
        metadata: { type },
      },
    ])

    if (insertError) {
      console.error('[v0] Failed to create payment record:', insertError)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code,
      reference,
    })
  } catch (error: any) {
    console.error('[v0] Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
