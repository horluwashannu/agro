'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = getSupabaseClient()
  const productId = params.id as string

  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    inventory: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Fetch categories
        const { data: cats } = await supabase.from('categories').select('*')
        setCategories(cats || [])

        // Fetch product
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('farmer_id', user.id)
          .single()

        if (error || !product) {
          router.push('/farmer/products')
          return
        }

        setFormData({
          title: product.title,
          description: product.description,
          category_id: product.category_id,
          price: product.price.toString(),
          inventory: product.inventory.toString(),
        })
      } catch (error) {
        console.error('[v0] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId, supabase, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          price: formData.price,
          inventory: formData.inventory,
        }),
      })

      if (!response.ok) throw new Error('Failed to update product')

      router.push('/farmer/products')
    } catch (error) {
      console.error('[v0] Error:', error)
      alert('Failed to update product')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Product Name</Label>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full mt-2 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="category_id">Category</Label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="price">Price per Unit (₦)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="inventory">Quantity Available</Label>
            <Input
              id="inventory"
              name="inventory"
              type="number"
              value={formData.inventory}
              onChange={handleChange}
              required
              min="0"
              className="mt-2"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
