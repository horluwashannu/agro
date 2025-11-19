'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DeliveryHeader } from '@/components/delivery/delivery-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function DeliveryDashboard() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
    availableJobs: 0,
  })
  const [activeOrders, setActiveOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/auth/login?role=delivery_agent')
          return
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile?.role !== 'delivery_agent') {
          router.push('/')
          return
        }

        setUser(profile)

        // Fetch stats
        const [activeData, completedData, availableData] = await Promise.all([
          supabase.from('orders').select('id', { count: 'exact' }).eq('delivery_agent_id', authUser.id).eq('status', 'in_transit'),
          supabase.from('orders').select('id', { count: 'exact' }).eq('delivery_agent_id', authUser.id).eq('status', 'delivered'),
          supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'confirmed').is('delivery_agent_id', null),
        ])

        setStats({
          activeDeliveries: activeData.count || 0,
          completedDeliveries: completedData.count || 0,
          totalEarnings: 0,
          availableJobs: availableData.count || 0,
        })

        // Fetch active orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('delivery_agent_id', authUser.id)
          .eq('status', 'in_transit')
          .order('created_at', { ascending: false })
          .limit(3)

        setActiveOrders(orders || [])
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
        <DeliveryHeader />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DeliveryHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.full_name}!</h1>
          <p className="text-muted-foreground">Manage your deliveries and earn money</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Active Deliveries</p>
            <p className="text-3xl font-bold">{stats.activeDeliveries}</p>
            <Link href="/delivery/active">
              <Button className="mt-4 w-full bg-primary hover:bg-primary/90" size="sm">View</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Completed</p>
            <p className="text-3xl font-bold">{stats.completedDeliveries}</p>
            <Link href="/delivery/completed">
              <Button variant="outline" className="mt-4 w-full" size="sm">View</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Available Jobs</p>
            <p className="text-3xl font-bold text-accent">{stats.availableJobs}</p>
            <Link href="/delivery/jobs">
              <Button variant="outline" className="mt-4 w-full" size="sm">Browse</Button>
            </Link>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-primary">₦{stats.totalEarnings.toLocaleString()}</p>
            <Link href="/delivery/earnings">
              <Button variant="outline" className="mt-4 w-full" size="sm">Details</Button>
            </Link>
          </Card>
        </div>

        {/* Active Deliveries */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Active Deliveries</h2>
          {activeOrders.length === 0 ? (
            <p className="text-muted-foreground">No active deliveries. <Link href="/delivery/jobs" className="text-primary hover:underline">Find available jobs!</Link></p>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="p-4 border border-border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Order: {order.id.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">Amount: ₦{order.total_amount.toLocaleString()}</p>
                  </div>
                  <Link href={`/delivery/active/${order.id}`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Update Status
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Looking for more jobs?</h2>
          <p className="text-muted-foreground mb-6">Check out available delivery jobs and start earning today.</p>
          <Link href="/delivery/jobs">
            <Button className="bg-primary hover:bg-primary/90">Browse Available Jobs</Button>
          </Link>
        </Card>
      </main>
    </div>
  )
}
