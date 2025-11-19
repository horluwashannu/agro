'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Products', href: '/admin/products', icon: '🌾' },
  { name: 'Orders', href: '/admin/orders', icon: '📦' },
  { name: 'Payments', href: '/admin/payments', icon: '💳' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border flex items-center px-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-sidebar-accent rounded-lg"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-sidebar-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-sidebar-foreground" />
          )}
        </button>
        <h1 className="text-xl font-bold text-sidebar-primary ml-4">AgriBridge</h1>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-primary">AgriBridge</h1>
          <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-auto">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}>
          <div
            className="absolute top-16 left-0 w-64 bg-sidebar border-r border-sidebar-border max-h-[calc(100vh-64px)] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={pathname === item.href ? 'default' : 'ghost'}
                    className="w-full justify-start gap-3"
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-sidebar-border">
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
