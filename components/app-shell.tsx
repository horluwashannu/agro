'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import MobileMenu from './mobile-menu'
import { LogOut, Home, ShoppingCart, Settings } from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
  userRole?: string
  userName?: string
  menuItems?: Array<{ href: string; label: string; icon?: React.ReactNode }>
}

export default function AppShell({
  children,
  userRole = 'customer',
  userName = 'User',
  menuItems = [],
}: AppShellProps) {
  const router = useRouter()
  const [signOutLoading, setSignOutLoading] = useState(false)

  const handleSignOut = async () => {
    setSignOutLoading(true)
    try {
      const response = await fetch('/api/auth/signout', { method: 'POST' })
      if (response.ok) {
        router.refresh()
        router.push('/auth/login')
      } else {
        console.error('[v0] Sign out failed:', await response.text())
      }
    } catch (error) {
      console.error('[v0] Sign out error:', error)
    } finally {
      setSignOutLoading(false)
    }
  }

  const defaultMenuItems = [
    { href: `/${userRole}/dashboard`, label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { href: `/${userRole}/settings`, label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  const finalMenuItems = menuItems.length > 0 ? menuItems : defaultMenuItems

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu */}
      <MobileMenu links={finalMenuItems} brand="AgriBridge" />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border">
          <div className="p-6">
            <Link href="/" className="font-bold text-xl">
              AgriBridge
            </Link>
            <p className="text-sm text-muted-foreground mt-2">{userRole}</p>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {finalMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
            <Button
              onClick={handleSignOut}
              disabled={signOutLoading}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {signOutLoading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}
