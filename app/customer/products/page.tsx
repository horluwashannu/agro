'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerHeader } from '@/components/customer/customer-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getSupabaseClient } from '@/lib/supabase-client'
import ProductsGrid from '@/components/products-grid'

export default function ProductsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')

        setCategories(categoriesData || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  return (
    <div>
      <CustomerHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Fresh Produce</h1>

        <div className="mb-8 space-y-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('')}
              className="bg-primary hover:bg-primary/90"
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.name ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.name)}
                className={selectedCategory === cat.name ? 'bg-primary hover:bg-primary/90' : ''}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        ) : (
          <ProductsGrid 
            searchQuery={searchTerm}
            categoryFilter={selectedCategory}
          />
        )}
      </main>
    </div>
  )
}
