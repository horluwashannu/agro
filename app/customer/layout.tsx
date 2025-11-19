'use client'

import { CustomerHeader } from '@/components/customer/customer-header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav' // added MobileBottomNav for mobile app design

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  )
}
