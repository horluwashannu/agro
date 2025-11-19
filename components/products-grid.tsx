'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity_available: number
  unit: string
  image_urls: string[]
  farmer: {
    full_name: string
  }
  category: {
    name: string
  }
}

interface ProductsGridProps {
  searchQuery?: string
  categoryFilter?: string
}

export default function ProductsGrid({
  searchQuery = '',
  categoryFilter = '',
}: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (categoryFilter) params.append('category', categoryFilter)
        params.append('limit', '50')

        const response = await fetch(`/api/products?${params}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load products')
        }

        setProducts(data.products || [])
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchQuery, categoryFilter])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="h-64 bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/customer/products/${product.id}`}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
            <div className="aspect-square bg-muted">
              <img
                src={product.image_urls?.[0] || '/placeholder.svg?height=200&width=200'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{product.category.name}</p>
              <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">₦{product.price.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">per {product.unit}</p>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                By {product.farmer.full_name}
              </p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
