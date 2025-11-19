import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * POST /api/paystack/webhook - Paystack webhook receiver
 * Receives payment verification and updates payment status in database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(body)
      .digest('hex')

    const signature = request.headers.get('x-paystack-signature')

    if (hash !== signature) {
      console.error('[v0] Invalid Paystack webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    const supabase = await createClient()

    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data
      const userId = event.data.metadata?.user_id

      if (!userId) {
        return NextResponse.json(
          { error: 'No user_id in metadata' },
          { status: 400 }
        )
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'success',
          updated_at: new Date().toISOString(),
        })
        .eq('paystack_reference', reference)

      if (paymentError) {
        console.error('[v0] Payment update error:', paymentError)
        return NextResponse.json(
          { error: 'Failed to update payment' },
          { status: 500 }
        )
      }

      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('paystack_reference', reference)
        .single()

      if (payment?.payment_type === 'wallet_topup') {
        // Get user's wallet
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (wallet) {
          const { error: walletError } = await supabase
            .from('wallets')
            .update({
              balance: wallet.balance + payment.amount,
              total_topup: wallet.total_topup + payment.amount,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

          if (walletError) {
            console.error('[v0] Wallet update error:', walletError)
          }
        }
      }
    }

    if (event.event === 'charge.failed') {
      const { reference } = event.data

      await supabase
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('paystack_reference', reference)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
