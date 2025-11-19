'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export function FarmerHeader() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/farmer/dashboard" className="text-2xl font-bold text-primary">
          AgriBridge Farmer
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/farmer/products" className="text-foreground hover:text-primary">
            My Products
          </Link>
          <Link href="/farmer/orders" className="text-foreground hover:text-primary">
            Orders
          </Link>
          <Link href="/farmer/negotiations" className="text-foreground hover:text-primary">
            Negotiations
          </Link>
          <Link href="/farmer/earnings" className="text-foreground hover:text-primary">
            Earnings
          </Link>
          <Link href="/farmer/profile" className="text-foreground hover:text-primary">
            Profile
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </nav>
      </div>
    </header>
  )
}
