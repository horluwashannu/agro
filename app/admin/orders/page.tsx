'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card } from '@/components/ui/card'
import { getSupabaseClient } from '@/lib/supabase-client'

interface OrderWithDetails {
  id: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
}

export default function OrdersPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
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
          .order('created_at', { ascending: false })

        setOrders(data || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [supabase, router])

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8">Orders</h1>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : (
            <Card className="p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 font-semibold">Order ID</th>
                    <th className="text-left py-3 font-semibold">Amount</th>
                    <th className="text-left py-3 font-semibold">Order Status</th>
                    <th className="text-left py-3 font-semibold">Payment Status</th>
                    <th className="text-left py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                      <td className="py-3 font-semibold">₦{order.total_amount.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.payment_status === 'unpaid' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
