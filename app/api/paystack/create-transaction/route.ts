import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * POST /api/paystack/create-transaction
 * Initialize Paystack payment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, email, orderId, metadata } = body

    if (!amount || !email) {
      return NextResponse.json(
        { error: 'Missing amount or email' },
        { status: 400 }
      )
    }

    // Get Paystack public key from env (should be in env var)
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!paystackKey) {
      return NextResponse.json(
        { error: 'Paystack not configured' },
        { status: 500 }
      )
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        order_id: orderId,
        amount,
        currency: 'NGN',
        status: 'pending',
        metadata: { ...metadata, user_id: user.id },
      })
      .select()
      .single()

    if (paymentError) {
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // Call Paystack API to initialize transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack uses kobo
        reference: payment.id,
        metadata: {
          user_id: user.id,
          order_id: orderId,
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || 'Paystack error' },
        { status: 500 }
      )
    }

    // Update payment with Paystack reference
    await supabase
      .from('payments')
      .update({ paystack_ref: paystackData.data.reference })
      .eq('id', payment.id)

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
    })
  } catch (error: any) {
    console.error('[v0] Paystack transaction error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
