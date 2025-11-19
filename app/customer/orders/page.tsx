'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerHeader } from '@/components/customer/customer-header'
import { Card } from '@/components/ui/card'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function OrdersPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        setOrders(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [supabase, router])

  return (
    <div>
      <CustomerHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading orders...</p>
        ) : orders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-2xl font-bold">₦{order.total_amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'unpaid' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
