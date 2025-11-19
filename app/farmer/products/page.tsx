'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FarmerHeader } from '@/components/farmer/farmer-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function FarmerProductsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data } = await supabase
          .from('products')
          .select(`
            *,
            categories (name)
          `)
          .eq('farmer_id', user.id)
          .order('created_at', { ascending: false })

        setProducts(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [supabase, router])

  const handleToggleProduct = async (productId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)

      setProducts(products.map(p =>
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <FarmerHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">My Products</h1>
          <Link href="/farmer/products/new">
            <Button className="bg-primary hover:bg-primary/90">Add Product</Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading products...</p>
        ) : products.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't listed any products yet.</p>
            <Link href="/farmer/products/new">
              <Button className="bg-primary hover:bg-primary/90">List Your First Product</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-muted h-40 flex items-center justify-center">
                  <span className="text-5xl">🌾</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{product.categories?.name}</p>
                  <p className="text-2xl font-bold text-primary mb-2">₦{product.price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {product.quantity_available} {product.unit} in stock
                  </p>

                  <div className="space-y-2">
                    <Button
                      variant={product.is_active ? 'outline' : 'default'}
                      className="w-full"
                      onClick={() => handleToggleProduct(product.id, product.is_active)}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Button>
                    <Link href={`/farmer/products/${product.id}/edit`} className="block">
                      <Button variant="outline" className="w-full">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
