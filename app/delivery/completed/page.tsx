'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DeliveryHeader } from '@/components/delivery/delivery-header'
import { Card } from '@/components/ui/card'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function CompletedDeliveriesPage() {
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
          .eq('status', 'delivered')
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

  return (
    <div>
      <DeliveryHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Completed Deliveries</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading deliveries...</p>
        ) : deliveries.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No completed deliveries yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">Order #{delivery.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">Amount: ₦{delivery.total_amount.toLocaleString()}</p>
                    <p className="text-sm mt-2 text-green-600 font-semibold">✓ Delivered</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(delivery.updated_at).toLocaleDateString()}
                    </p>
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
