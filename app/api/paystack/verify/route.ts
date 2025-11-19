import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { verifyPaystackPayment } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const secretKey = process.env.PAYSTACK_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      )
    }

    // Verify payment with Paystack
    const verifyResponse = await verifyPaystackPayment(reference, secretKey)

    if (!verifyResponse.status) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Get payment record
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('paystack_reference', reference)
      .single()

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      )
    }

    if (verifyResponse.data?.status === 'success') {
      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'success' })
        .eq('id', payment.id)

      // Update wallet if it's a top-up
      if (payment.payment_type === 'wallet_topup') {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', payment.user_id)
          .single()

        if (wallet) {
          await supabase
            .from('wallets')
            .update({
              balance: wallet.balance + payment.amount,
              total_topup: wallet.total_topup + payment.amount,
            })
            .eq('id', wallet.id)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
      })
    } else {
      // Update payment status as failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)

      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
