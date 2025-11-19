'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FarmerHeader } from '@/components/farmer/farmer-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function FarmerOrdersPage() {
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
          .from('order_items')
          .select(`
            *,
            orders (id, total_amount, status, payment_status, created_at),
            products (name, price, farmer_id)
          `)
          .eq('products.farmer_id', user.id)
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
      <FarmerHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Orders</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading orders...</p>
        ) : orders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No orders yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((item: any) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{item.products?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Order #{item.orders?.id.slice(0, 8)}... | {item.quantity} units
                    </p>
                    <p className="text-sm mt-2 font-semibold">
                      Total: ₦{(item.quantity * item.price_per_unit).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <div>
                      <span className={`px-4 py-2 rounded-full text-xs font-semibold ${
                        item.orders?.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        item.orders?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.orders?.status}
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
