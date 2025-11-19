'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'
import { Trash2, Edit2 } from 'lucide-react'

interface Product {
  id: string
  title: string
  description: string
  price: number
  inventory: number
  is_active: boolean
  farmer_id: string
  category_id: string
  created_at: string
  profiles?: { full_name: string }
  categories?: { name: string }
}

export default function AdminProductsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          id, title, description, price, inventory, is_active, farmer_id, category_id, created_at,
          profiles:farmer_id (full_name),
          categories:category_id (name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('[v0] Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setDeleting(productId)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      setProducts(products.filter(p => p.id !== productId))
    } catch (error) {
      console.error('[v0] Delete error:', error)
      alert('Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)

      if (error) throw error

      setProducts(products.map(p => p.id === productId ? { ...p, is_active: !currentStatus } : p))
    } catch (error) {
      console.error('[v0] Toggle error:', error)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Button onClick={() => router.push('/admin/products/new')} className="bg-primary hover:bg-primary/90">
          Add Product
        </Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading products...</p>
        </Card>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No products found</p>
          <Button onClick={() => router.push('/admin/products/new')} className="bg-primary hover:bg-primary/90">
            Create First Product
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <span className="text-primary font-semibold">₦{product.price.toLocaleString()}</span>
                    <span className="text-muted-foreground">Stock: {product.inventory}</span>
                    <span className="text-muted-foreground">Category: {product.categories?.name}</span>
                    <span className="text-muted-foreground">Farmer: {product.profiles?.full_name}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(product.id, product.is_active)}
                  >
                    {product.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleting === product.id}
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
