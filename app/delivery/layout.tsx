'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/delivery/dashboard" className="text-2xl font-bold text-primary">
            AgriBridge
          </Link>
          <nav className="flex items-center gap-6 md:flex hidden">
            <Link href="/delivery/dashboard" className="text-foreground hover:text-primary">
              Dashboard
            </Link>
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
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  )
}
