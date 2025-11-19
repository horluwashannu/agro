'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FarmerHeader } from '@/components/farmer/farmer-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    quantity_available: '',
    unit: 'kg',
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data } = await supabase.from('categories').select('*')
        setCategories(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [supabase, router])

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('products').insert([
        {
          farmer_id: user.id,
          name: formData.name,
          description: formData.description,
          category_id: formData.category_id,
          price: parseFloat(formData.price),
          quantity_available: parseInt(formData.quantity_available),
          unit: formData.unit,
          is_active: true,
        },
      ])

      router.push('/farmer/products')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create product')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <FarmerHeader />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <FarmerHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Add New Product</h1>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Fresh Tomatoes"
                value={formData.name}
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
                placeholder="Describe your product..."
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
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="quantity_available">Quantity Available</Label>
                <Input
                  id="quantity_available"
                  name="quantity_available"
                  type="number"
                  placeholder="0"
                  value={formData.quantity_available}
                  onChange={handleChange}
                  required
                  min="0"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full mt-2 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="piece">Piece</option>
                  <option value="bunch">Bunch</option>
                  <option value="liter">Liter (L)</option>
                  <option value="crate">Crate</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Product'}
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
      </main>
    </div>
  )
}
