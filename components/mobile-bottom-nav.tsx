'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, ShoppingBag, MessageCircle, Wallet, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

export function MobileBottomNav() {
  const pathname = usePathname()
  const supabase = getSupabaseClient()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const getRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          if (error || !profile?.role) {
            console.log('[v0] Profile not yet available, using guest role')
            setRole('guest')
          } else {
            setRole(profile.role)
          }
        }
      } catch (err) {
        console.error('[v0] Error fetching role:', err)
        setRole('guest')
      }
    }

    getRole()
  }, [supabase])

  if (!role) return null

  const navItems: Record<string, Array<{ href: string; icon: any; label: string }>> = {
    customer: [
      { href: '/customer/dashboard', icon: Home, label: 'Home' },
      { href: '/customer/products', icon: ShoppingBag, label: 'Shop' },
      { href: '/customer/negotiations', icon: MessageCircle, label: 'Negotiate' },
      { href: '/customer/wallet', icon: Wallet, label: 'Wallet' },
      { href: '/customer/profile', icon: User, label: 'Profile' },
    ],
    farmer: [
      { href: '/farmer/dashboard', icon: Home, label: 'Home' },
      { href: '/farmer/products', icon: ShoppingBag, label: 'Products' },
      { href: '/farmer/orders', icon: MessageCircle, label: 'Orders' },
      { href: '/farmer/earnings', icon: Wallet, label: 'Earnings' },
      { href: '/farmer/profile', icon: User, label: 'Profile' },
    ],
    delivery_agent: [
      { href: '/delivery/dashboard', icon: Home, label: 'Home' },
      { href: '/delivery/jobs', icon: ShoppingBag, label: 'Jobs' },
      { href: '/delivery/active', icon: MessageCircle, label: 'Active' },
      { href: '/delivery/earnings', icon: Wallet, label: 'Earnings' },
      { href: '/delivery/profile', icon: User, label: 'Profile' },
    ],
    admin: [
      { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
      { href: '/admin/users', icon: User, label: 'Users' },
      { href: '/admin/products', icon: ShoppingBag, label: 'Products' },
      { href: '/admin/orders', icon: MessageCircle, label: 'Orders' },
      { href: '/admin/settings', icon: Wallet, label: 'Settings' },
    ],
    guest: [] as any[],
  }

  const items = navItems[role] || []

  if (items.length === 0) return null

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 md:hidden shadow-lg">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                  isActive
                    ? 'text-primary border-t-2 border-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1 truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-20 md:h-0" />
    </>
  )
}
