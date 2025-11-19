'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto pb-20 lg:pb-0 pt-16 lg:pt-0">
        {children}
      </main>

      {/* Mobile bottom nav only on small screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <MobileBottomNav />
      </div>
    </div>
  )
}
