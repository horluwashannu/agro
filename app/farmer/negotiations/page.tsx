'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FarmerHeader } from '@/components/farmer/farmer-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function FarmerNegotiationsPage() {
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
            profiles!customer_id (full_name)
          `)
          .eq('farmer_id', user.id)
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

  const handleUpdateNegotiation = async (negotiationId: string, status: 'accepted' | 'rejected') => {
    try {
      await supabase
        .from('negotiations')
        .update({ status })
        .eq('id', negotiationId)

      setNegotiations(negotiations.map(n =>
        n.id === negotiationId ? { ...n, status } : n
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <FarmerHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Negotiations</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading negotiations...</p>
        ) : negotiations.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No negotiations yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {negotiations.map((negotiation: any) => (
              <Card key={negotiation.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{negotiation.products?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      From: {negotiation.profiles?.full_name}
                    </p>
                    <p className="text-sm mt-2">
                      Original: ₦{negotiation.products?.price?.toLocaleString()} | Proposed: ₦{negotiation.proposed_price?.toLocaleString()} | Qty: {negotiation.quantity}
                    </p>
                  </div>
                  <div className="space-y-2 text-right">
                    <span className={`px-4 py-2 rounded-full text-xs font-semibold block ${
                      negotiation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      negotiation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {negotiation.status}
                    </span>
                    {negotiation.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateNegotiation(negotiation.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateNegotiation(negotiation.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
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
