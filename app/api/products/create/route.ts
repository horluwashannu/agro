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
    const { title, description, price, inventory, category_id, sku } = body

    // Validate required fields
    if (!title || !price || !inventory || !category_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create product
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          sku: sku || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description,
          price: parseFloat(price),
          inventory: parseInt(inventory),
          category_id,
          farmer_id: user.id,
          is_active: true,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, product: data[0] })
  } catch (error: any) {
    console.error('[v0] Product creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}
