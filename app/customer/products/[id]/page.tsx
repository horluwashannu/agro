'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getSupabaseClient } from '@/lib/supabase-client'
import { ChevronLeft, Heart, Share2 } from 'lucide-react'

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
    phone?: string
    email: string
  }
  category: {
    name: string
  }
}

export default function ProductDetail() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
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
            farmer:farmer_id(full_name, phone, email),
            category:category_id(name)
            `
          )
          .eq('id', productId)
          .single()

        if (error) throw error
        setProduct(data)
      } catch (error) {
        console.error('[v0] Product fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) fetchProduct()
  }, [productId])

  const handleAddToCart = async () => {
    if (!product) return

    setAddingToCart(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        alert('Please login to add items to cart')
        return
      }

      const { error } = await supabase
        .from('cart_items')
        .upsert(
          {
            customer_id: user.user.id,
            product_id: product.id,
            quantity,
          },
          {
            onConflict: 'customer_id,product_id',
          }
        )

      if (error) throw error
      alert('Added to cart!')
    } catch (error) {
      console.error('[v0] Cart error:', error)
      alert('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/customer/products"
        className="flex items-center gap-2 text-primary hover:underline mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={product.image_urls?.[0] || '/placeholder.svg?height=400&width=400'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {product.category.name}
            </p>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground mb-4">{product.description}</p>
          </div>

          {/* Price & Availability */}
          <Card className="p-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">₦{product.price.toLocaleString()}</span>
              <span className="text-muted-foreground">per {product.unit}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {product.quantity_available} {product.unit}(s) available
            </p>
          </Card>

          {/* Quantity Selector */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Quantity</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(product.quantity_available, parseInt(e.target.value) || 1))
                }
                className="w-16 text-center"
                min="1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setQuantity(Math.min(product.quantity_available, quantity + 1))
                }
              >
                +
              </Button>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="w-full bg-primary hover:bg-primary/90 h-12"
            size="lg"
          >
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>

          {/* Favorite & Share */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  isFavorite ? 'fill-red-500 text-red-500' : ''
                }`}
              />
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Farmer Info */}
          <Card className="p-4 bg-muted/50">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              SOLD BY
            </p>
            <h3 className="font-semibold mb-2">{product.farmer.full_name}</h3>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">{product.farmer.email}</p>
              {product.farmer.phone && (
                <p className="text-muted-foreground">{product.farmer.phone}</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              Contact Farmer
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
