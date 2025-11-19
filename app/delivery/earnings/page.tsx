'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DeliveryHeader } from '@/components/delivery/delivery-header'
import { Card } from '@/components/ui/card'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function DeliveryEarningsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    completedDeliveries: 0,
    averagePerDelivery: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: deliveries } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('delivery_agent_id', user.id)
          .eq('status', 'delivered')

        if (deliveries && deliveries.length > 0) {
          // Calculate 10% of order total as delivery earning
          const totalEarnings = deliveries.reduce((sum, d) => sum + (d.total_amount * 0.1), 0)
          setEarnings({
            totalEarnings,
            completedDeliveries: deliveries.length,
            averagePerDelivery: totalEarnings / deliveries.length,
          })
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [supabase, router])

  return (
    <div>
      <DeliveryHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Your Earnings</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading earnings...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <p className="text-muted-foreground mb-2">Total Earnings</p>
              <p className="text-4xl font-bold text-primary">
                ₦{earnings.totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-2">10% per delivery</p>
            </Card>

            <Card className="p-8">
              <p className="text-muted-foreground mb-2">Completed Deliveries</p>
              <p className="text-4xl font-bold">{earnings.completedDeliveries}</p>
            </Card>

            <Card className="p-8">
              <p className="text-muted-foreground mb-2">Average per Delivery</p>
              <p className="text-4xl font-bold">
                ₦{earnings.averagePerDelivery.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
