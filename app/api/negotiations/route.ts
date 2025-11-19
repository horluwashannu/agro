import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, offered_price } = body

    if (!product_id || !offered_price || offered_price <= 0) {
      return NextResponse.json(
        { error: 'Invalid product_id or offered_price' },
        { status: 400 }
      )
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Create negotiation
    const { data, error } = await supabase
      .from('negotiations')
      .insert([
        {
          product_id,
          customer_id: user.id,
          farmer_id: product.farmer_id,
          initial_price: product.price,
          negotiated_price: offered_price,
          status: 'pending',
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, negotiation: data[0] })
  } catch (error: any) {
    console.error('[v0] Negotiation creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create negotiation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get negotiations for current user (as customer or farmer)
    const { data, error } = await supabase
      .from('negotiations')
      .select(`
        *,
        products:product_id (title, price, description),
        customer_profile:customer_id (full_name, email),
        farmer_profile:farmer_id (full_name, email)
      `)
      .or(`customer_id.eq.${user.id},farmer_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ negotiations: data || [] })
  } catch (error: any) {
    console.error('[v0] Negotiation fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch negotiations' },
      { status: 500 }
    )
  }
}
