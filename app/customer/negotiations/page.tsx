'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerHeader } from '@/components/customer/customer-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function NegotiationsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [negotiations, setNegotiations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNegotiations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data } = await supabase
          .from('negotiations')
          .select(`
            *,
            products (name, price),
            profiles!farmer_id (full_name)
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        setNegotiations(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNegotiations()
  }, [supabase, router])

  return (
    <div>
      <CustomerHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Negotiations</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading negotiations...</p>
        ) : negotiations.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No negotiations yet. Start by negotiating prices with farmers!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {negotiations.map((negotiation: any) => (
              <Card key={negotiation.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{negotiation.products?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Farmer: {negotiation.profiles?.full_name}
                    </p>
                    <p className="text-sm mt-2">
                      Original Price: ₦{negotiation.products?.price?.toLocaleString()} | Quantity: {negotiation.quantity}
                    </p>
                    {negotiation.proposed_price && (
                      <p className="text-sm text-accent font-semibold mt-1">
                        Proposed: ₦{negotiation.proposed_price.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      negotiation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      negotiation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      negotiation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {negotiation.status}
                    </span>
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
