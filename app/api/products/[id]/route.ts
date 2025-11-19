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

    const productId = params.id
    const body = await request.json()

    // Verify ownership or admin status
    const { data: product } = await supabase
      .from('products')
      .select('farmer_id')
      .eq('id', productId)
      .single()

    if (!product || product.farmer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update product
    const { data, error } = await supabase
      .from('products')
      .update({
        title: body.title,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        inventory: body.inventory ? parseInt(body.inventory) : undefined,
        is_active: body.is_active !== undefined ? body.is_active : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, product: data[0] })
  } catch (error: any) {
    console.error('[v0] Product update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productId = params.id

    // Verify ownership
    const { data: product } = await supabase
      .from('products')
      .select('farmer_id')
      .eq('id', productId)
      .single()

    if (!product || product.farmer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[v0] Product deletion error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    )
  }
}
