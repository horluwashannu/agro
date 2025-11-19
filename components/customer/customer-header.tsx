'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export function CustomerHeader() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          console.error('[v0] Auth error:', authError)
          setUser(null)
          setLoading(false)
          return
        }

        if (authUser) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', authUser.id)
            .single()

          if (profileError) {
            console.log('[v0] Profile fetch error (profile may not exist yet):', profileError.message)
            // Use email as fallback name
            setUser({ full_name: authUser.email?.split('@')[0] || 'User', role: 'customer' })
          } else if (profile) {
            setUser(profile)
          } else {
            setUser({ full_name: authUser.email?.split('@')[0] || 'User', role: 'customer' })
          }
        }
      } catch (err) {
        console.error('[v0] Unexpected error:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || '?'
  }

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/customer/dashboard" className="text-2xl font-bold">
          AgriBridge
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/customer/products" className="hover:text-primary-foreground/80 transition">
            Shop
          </Link>
          <Link href="/customer/negotiations" className="hover:text-primary-foreground/80 transition">
            Negotiations
          </Link>
          <Link href="/customer/orders" className="hover:text-primary-foreground/80 transition">
            Orders
          </Link>
          <Link href="/customer/wallet" className="hover:text-primary-foreground/80 transition">
            Wallet
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!loading && user ? (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-sm font-bold">{getInitials(user.full_name)}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">{user.full_name}</p>
                <p className="text-xs opacity-80">{user.role}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm opacity-75">{loading ? 'Loading...' : 'Guest'}</div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hover:bg-primary-foreground/20"
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="md:hidden flex justify-around border-t border-primary-foreground/20">
        <Link href="/customer/products" className="flex-1 text-center py-2 text-xs hover:bg-primary-foreground/10">
          Shop
        </Link>
        <Link href="/customer/negotiations" className="flex-1 text-center py-2 text-xs hover:bg-primary-foreground/10">
          Negotiations
        </Link>
        <Link href="/customer/orders" className="flex-1 text-center py-2 text-xs hover:bg-primary-foreground/10">
          Orders
        </Link>
        <Link href="/customer/wallet" className="flex-1 text-center py-2 text-xs hover:bg-primary-foreground/10">
          Wallet
        </Link>
      </div>
    </header>
  )
}
