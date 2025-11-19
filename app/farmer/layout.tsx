'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/farmer/dashboard" className="text-2xl font-bold text-primary">
            AgriBridge
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/farmer/dashboard" className="text-foreground hover:text-primary transition">
              Dashboard
            </Link>
            <Link href="/farmer/products" className="text-foreground hover:text-primary transition">
              Products
            </Link>
            <Link href="/farmer/orders" className="text-foreground hover:text-primary transition">
              Orders
            </Link>
            <Link href="/farmer/negotiations" className="text-foreground hover:text-primary transition">
              Negotiations
            </Link>
            <Link href="/farmer/earnings" className="text-foreground hover:text-primary transition">
              Earnings
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav only on small screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <MobileBottomNav />
      </div>
    </div>
  )
}
