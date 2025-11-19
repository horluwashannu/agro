import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/products - Fetch products with optional filters
 * Query params: 
 *   - search: search in product name/description
 *   - category: filter by category name
 *   - farmer_id: filter by farmer
 *   - skip: pagination offset (default: 0)
 *   - limit: results per page (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const farmerId = searchParams.get('farmer_id')
    const skip = parseInt(searchParams.get('skip') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = await createClient()

    let query = supabase
      .from('products')
      .select(
        `
        id,
        name,
        description,
        price,
        quantity_available,
        unit,
        image_urls,
        is_active,
        created_at,
        farmer:farmer_id(id, full_name, email),
        category:category_id(name)
        `,
        { count: 'exact' }
      )
      .eq('is_active', true)

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('category.name', category)
    }

    if (farmerId) {
      query = query.eq('farmer_id', farmerId)
    }

    const { data, count, error } = await query
      .range(skip, skip + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Products fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      products: data || [],
      count: count || 0,
      hasMore: (count || 0) > skip + limit,
    })
  } catch (error: any) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
