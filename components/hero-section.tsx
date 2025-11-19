'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Leaf, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-white overflow-hidden pt-20 pb-16 md:pb-20">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl bg-white" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl bg-accent" />
      </div>

      <div className="relative container mx-auto px-4 flex flex-col items-center justify-center h-full text-center">
        {/* Main heading */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <Leaf className="w-4 h-4" />
            <span className="text-sm font-medium">Farm Fresh Direct to Your Door</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-balance">
            Fresh Produce From
            <br />
            <span className="bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent">
              Nigerian Farmers
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect with local farmers, get premium agricultural products at fair prices with fast, reliable delivery
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full max-w-2xl mb-12">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search products, farmers, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 px-6 rounded-xl bg-white text-foreground placeholder:text-muted-foreground border-0 shadow-lg"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
            <Button
              size="lg"
              className="h-14 px-8 bg-white text-primary hover:bg-white/90 rounded-xl font-semibold shadow-lg"
            >
              Search
            </Button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Link href="/customer/products">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 h-12 rounded-xl shadow-lg group"
            >
              Browse Products
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
            </Button>
          </Link>
          <Link href="/auth/login?role=farmer">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-semibold px-8 h-12 rounded-xl"
            >
              Become a Seller
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 pt-8 border-t border-white/20 w-full max-w-2xl">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-1">300+</div>
            <p className="text-sm text-white/70">Products</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-1">50+</div>
            <p className="text-sm text-white/70">Farmers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-1">24/7</div>
            <p className="text-sm text-white/70">Support</p>
          </div>
        </div>
      </div>
    </section>
  )
}
