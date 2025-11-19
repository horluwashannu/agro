import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const negotiationId = params.id
    const body = await request.json()
    const { status } = body

    if (!['pending', 'accepted', 'rejected', 'counter'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Verify ownership (farmer or customer)
    const { data: negotiation } = await supabase
      .from('negotiations')
      .select('farmer_id, customer_id')
      .eq('id', negotiationId)
      .single()

    if (!negotiation || (negotiation.farmer_id !== user.id && negotiation.customer_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update negotiation
    const { data, error } = await supabase
      .from('negotiations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', negotiationId)
      .select()

    if (error) throw error

    // If accepted, create order
    if (status === 'accepted') {
      const negotiationData = data[0]
      await supabase.from('orders').insert([
        {
          customer_id: negotiationData.customer_id,
          total_amount: negotiationData.negotiated_price,
          status: 'pending_payment',
          currency: 'NGN',
        },
      ])
    }

    return NextResponse.json({ success: true, negotiation: data[0] })
  } catch (error: any) {
    console.error('[v0] Negotiation update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update negotiation' },
      { status: 500 }
    )
  }
}
