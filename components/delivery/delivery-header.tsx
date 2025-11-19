'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export function DeliveryHeader() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/delivery/dashboard" className="text-2xl font-bold text-primary">
          AgriBridge Delivery
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/delivery/jobs" className="text-foreground hover:text-primary">
            Available Jobs
          </Link>
          <Link href="/delivery/active" className="text-foreground hover:text-primary">
            Active Deliveries
          </Link>
          <Link href="/delivery/completed" className="text-foreground hover:text-primary">
            Completed
          </Link>
          <Link href="/delivery/earnings" className="text-foreground hover:text-primary">
            Earnings
          </Link>
          <Link href="/delivery/profile" className="text-foreground hover:text-primary">
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
