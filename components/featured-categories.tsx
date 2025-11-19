'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Vegetables',
    icon: '🥬',
    description: 'Fresh greens and produce',
    color: 'from-green-500/10 to-green-500/5',
  },
  {
    id: '2',
    name: 'Fruits',
    icon: '🍎',
    description: 'Seasonal sweet fruits',
    color: 'from-red-500/10 to-red-500/5',
  },
  {
    id: '3',
    name: 'Grains',
    icon: '🌾',
    description: 'Quality grains & cereals',
    color: 'from-amber-500/10 to-amber-500/5',
  },
  {
    id: '4',
    name: 'Dairy',
    icon: '🥛',
    description: 'Fresh dairy products',
    color: 'from-blue-500/10 to-blue-500/5',
  },
  {
    id: '5',
    name: 'Eggs',
    icon: '🥚',
    description: 'Farm fresh eggs',
    color: 'from-yellow-500/10 to-yellow-500/5',
  },
  {
    id: '6',
    name: 'Herbs',
    icon: '🌿',
    description: 'Fresh herbs & spices',
    color: 'from-emerald-500/10 to-emerald-500/5',
  },
]

export function FeaturedCategories() {
  return (
    <section className="py-16 md:py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Shop by <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Category</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our wide selection of fresh agricultural products organized by category
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/customer/products?category=${category.name.toLowerCase()}`}>
              <Card
                className={`p-6 text-center hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:scale-105 cursor-pointer h-full bg-gradient-to-br ${category.color}`}
              >
                <div className="text-4xl md:text-5xl mb-3 flex justify-center">{category.icon}</div>
                <h3 className="font-bold text-sm md:text-base mb-1 text-foreground">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
