'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FarmerHeader } from '@/components/farmer/farmer-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function FarmerDashboard() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    activeProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingNegotiations: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/auth/login?role=farmer')
          return
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile?.role !== 'farmer') {
          router.push('/')
          return
        }

        setUser(profile)

        // Fetch stats
        const [productsData, ordersData, negotiationsData] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact' }).eq('farmer_id', authUser.id).eq('is_active', true),
          supabase.from('order_items').select('orders!inner(id)', { count: 'exact' }).eq('orders.delivery_agent_id', null),
          supabase.from('negotiations').select('id', { count: 'exact' }).eq('farmer_id', authUser.id).eq('status', 'pending'),
        ])

        setStats({
          activeProducts: productsData.count || 0,
          totalOrders: ordersData.count || 0,
          totalEarnings: 0,
          pendingNegotiations: negotiationsData.count || 0,
        })

        // Fetch recent orders
        const { data: orders } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            price_per_unit,
            created_at,
            orders (id, status)
          `)
          .order('created_at', { ascending: false })
          .limit(3)

        setRecentOrders(orders || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  if (loading) {
    return (
      <div>
        <FarmerHeader />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <FarmerHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.full_name}!</h1>
          <p className="text-muted-foreground">Manage your products and orders efficiently</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Active Products</p>
            <p className="text-3xl font-bold">{stats.activeProducts}</p>
            <Link href="/farmer/products">
              <Button className="mt-4 w-full bg-primary hover:bg-primary/90" size="sm">Manage</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Orders</p>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
            <Link href="/farmer/orders">
              <Button variant="outline" className="mt-4 w-full" size="sm">View</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Pending Negotiations</p>
            <p className="text-3xl font-bold text-accent">{stats.pendingNegotiations}</p>
            <Link href="/farmer/negotiations">
              <Button variant="outline" className="mt-4 w-full" size="sm">Review</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-primary">₦{stats.totalEarnings.toLocaleString()}</p>
            <Link href="/farmer/earnings">
              <Button variant="outline" className="mt-4 w-full" size="sm">Details</Button>
            </Link>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground">No recent orders yet.</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((item: any) => (
                <div key={item.id} className="p-4 border border-border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Order: {item.orders?.id.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} units @ ₦{item.price_per_unit.toLocaleString()} each
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.orders?.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    item.orders?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.orders?.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Ready to sell more?</h2>
          <p className="text-muted-foreground mb-6">Upload new products or manage existing listings to increase your sales.</p>
          <div className="flex gap-4">
            <Link href="/farmer/products">
              <Button className="bg-primary hover:bg-primary/90">Manage Products</Button>
            </Link>
            <Link href="/farmer/products/new">
              <Button variant="outline">Add New Product</Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  )
}
