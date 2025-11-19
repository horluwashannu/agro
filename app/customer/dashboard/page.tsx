'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CustomerHeader } from '@/components/customer/customer-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function CustomerDashboard() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    walletBalance: 0,
    pendingNegotiations: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/auth/login?role=customer')
          return
        }

        // Fetch profile with retry logic
        let profile = null
        let retries = 0
        while (!profile && retries < 3) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (profileData) {
            profile = profileData
            break
          }
          
          retries++
          if (retries < 3) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }

        if (!profile) {
          console.error('[v0] Profile not found after retries, redirecting to create profile')
          // Fallback: call API to create profile
          const response = await fetch('/api/auth/create-profile-service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: authUser.id,
              email: authUser.email,
              fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
              role: 'customer',
            }),
          })

          if (response.ok) {
            const { profile: createdProfile } = await response.json()
            profile = createdProfile
          } else {
            throw new Error('Failed to create profile')
          }
        }

        if (profile?.role !== 'customer') {
          router.push('/')
          return
        }

        setUser(profile)

        // Fetch stats
        const [ordersData, walletData, negotiationsData] = await Promise.all([
          supabase.from('orders').select('id', { count: 'exact' }).eq('customer_id', authUser.id),
          supabase.from('wallets').select('balance').eq('user_id', authUser.id).single(),
          supabase.from('negotiations').select('id', { count: 'exact' }).eq('customer_id', authUser.id).eq('status', 'pending'),
        ])

        setStats({
          totalOrders: ordersData.count || 0,
          walletBalance: walletData.data?.balance || 0,
          pendingNegotiations: negotiationsData.count || 0,
        })

        // Fetch recent orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(3)

        setRecentOrders(orders || [])
      } catch (error) {
        console.error('[v0] Dashboard error:', error)
        // Don't redirect on error, show loading state
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  if (loading) {
    return (
      <div>
        <CustomerHeader />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div>
        <CustomerHeader />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Unable to load your profile</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <CustomerHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.full_name}!</h1>
          <p className="text-muted-foreground">Browse fresh produce from local farmers</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Wallet Balance</p>
            <p className="text-3xl font-bold text-primary">₦{stats.walletBalance.toLocaleString()}</p>
            <Link href="/customer/wallet">
              <Button className="mt-4 w-full bg-primary hover:bg-primary/90">Top up Wallet</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Orders</p>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
            <Link href="/customer/orders">
              <Button variant="outline" className="mt-4 w-full">View Orders</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Active Negotiations</p>
            <p className="text-3xl font-bold text-accent">{stats.pendingNegotiations}</p>
            <Link href="/customer/negotiations">
              <Button variant="outline" className="mt-4 w-full">View Negotiations</Button>
            </Link>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet. <Link href="/customer/products" className="text-primary hover:underline">Start shopping!</Link></p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 border border-border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{order.id.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">₦{order.total_amount.toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Ready to shop?</h2>
          <p className="text-muted-foreground mb-6">Browse fresh produce from local farmers or negotiate prices directly.</p>
          <div className="flex gap-4">
            <Link href="/customer/products">
              <Button className="bg-primary hover:bg-primary/90">Browse Products</Button>
            </Link>
            <Link href="/customer/negotiations">
              <Button variant="outline">Make a Negotiation</Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  )
}
