'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FarmerHeader } from '@/components/farmer/farmer-header'
import { Card } from '@/components/ui/card'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function FarmerEarningsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    averageOrderValue: 0,
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

        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('payment_status', 'paid')

        if (orders && orders.length > 0) {
          const total = orders.reduce((sum, o) => sum + o.total_amount, 0)
          setEarnings({
            totalEarnings: total,
            totalOrders: orders.length,
            averageOrderValue: total / orders.length,
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
      <FarmerHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Earnings</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading earnings...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <p className="text-muted-foreground mb-2">Total Earnings</p>
              <p className="text-4xl font-bold text-primary">
                ₦{earnings.totalEarnings.toLocaleString()}
              </p>
            </Card>

            <Card className="p-8">
              <p className="text-muted-foreground mb-2">Total Paid Orders</p>
              <p className="text-4xl font-bold">{earnings.totalOrders}</p>
            </Card>

            <Card className="p-8">
              <p className="text-muted-foreground mb-2">Average Order Value</p>
              <p className="text-4xl font-bold">
                ₦{earnings.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
