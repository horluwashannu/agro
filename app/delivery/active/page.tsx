'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DeliveryHeader } from '@/components/delivery/delivery-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function ActiveDeliveriesPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('delivery_agent_id', user.id)
          .eq('status', 'in_transit')
          .order('created_at', { ascending: false })

        setDeliveries(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveries()
  }, [supabase, router])

  const handleCompleteDelivery = async (orderId: string) => {
    try {
      await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId)

      setDeliveries(deliveries.filter(d => d.id !== orderId))
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to complete delivery')
    }
  }

  return (
    <div>
      <DeliveryHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Active Deliveries</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading deliveries...</p>
        ) : deliveries.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No active deliveries.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">Order #{delivery.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">Amount: ₦{delivery.total_amount.toLocaleString()}</p>
                    <p className="text-sm mt-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        {delivery.status}
                      </span>
                    </p>
                  </div>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleCompleteDelivery(delivery.id)}
                  >
                    Mark as Delivered
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
