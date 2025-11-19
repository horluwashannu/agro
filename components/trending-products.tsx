'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  title: string
  price: number
  image: string
  rating: number
  reviews: number
  inStock: boolean
}

const trendingProducts: Product[] = [
  {
    id: '1',
    title: 'Premium Tomatoes (2kg)',
    price: 1600,
    image: '/premium-tomatoes.jpg',
    rating: 4.8,
    reviews: 124,
    inStock: true,
  },
  {
    id: '2',
    title: 'Organic Spinach (500g)',
    price: 900,
    image: '/organic-spinach.png',
    rating: 4.9,
    reviews: 89,
    inStock: true,
  },
  {
    id: '3',
    title: 'Fresh Mangoes (3kg)',
    price: 4500,
    image: '/fresh-mangoes.jpg',
    rating: 4.7,
    reviews: 156,
    inStock: true,
  },
  {
    id: '4',
    title: 'Quality Rice Bag (10kg)',
    price: 35000,
    image: '/quality-rice.jpg',
    rating: 4.9,
    reviews: 234,
    inStock: true,
  },
  {
    id: '5',
    title: 'Fresh Eggs Crate (30)',
    price: 2000,
    image: '/farm-fresh-eggs.png',
    rating: 4.8,
    reviews: 178,
    inStock: true,
  },
  {
    id: '6',
    title: 'Palm Oil (1L)',
    price: 2500,
    image: '/palm-oil-plantation.png',
    rating: 4.6,
    reviews: 92,
    inStock: true,
  },
]

export function TrendingProducts() {
  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-balance">
              Trending <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">This Week</span>
            </h2>
            <p className="text-muted-foreground">Best selling products from our farmers</p>
          </div>
          <Link href="/customer/products?sort=trending">
            <Button variant="outline" className="hidden md:flex">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingProducts.map((product) => (
            <Link key={product.id} href={`/customer/products/${product.id}`}>
              <Card className="overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group h-full cursor-pointer">
                <div className="relative overflow-hidden bg-muted aspect-square">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-primary/90">Trending</Badge>
                  <button className="absolute top-3 left-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors">
                    <Heart className="w-4 h-4 text-primary" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-primary">₦{product.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">per unit</p>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-lg">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Link href="/customer/products?sort=trending">
            <Button className="bg-primary hover:bg-primary/90">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
