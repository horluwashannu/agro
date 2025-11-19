import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/checkout/initialize
 * Create a Paystack payment reference for checkout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, orderId, userId } = body

    if (!amount || !userId) {
      return NextResponse.json(
        { error: 'Missing amount or userId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        order_id: orderId || null,
        amount,
        payment_type: orderId ? 'product_purchase' : 'wallet_topup',
        status: 'pending',
      })
      .select()
      .single()

    if (paymentError) {
      console.error('[v0] Payment creation error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'customer@example.com', // Should come from user
          amount: Math.round(amount * 100), // Paystack expects amount in kobo
          metadata: {
            payment_id: payment.id,
            user_id: userId,
            order_id: orderId,
          },
        }),
      }
    )

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      console.error('[v0] Paystack error:', paystackData.message)
      return NextResponse.json(
        { error: paystackData.message },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        paystack_reference: paystackData.data.reference,
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('[v0] Update error:', updateError)
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paystackData.data.authorization_url,
      paymentReference: paystackData.data.reference,
      paymentId: payment.id,
    })
  } catch (error: any) {
    console.error('[v0] Checkout error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
