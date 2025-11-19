'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DeliveryHeader } from '@/components/delivery/delivery-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function AvailableJobsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('status', 'confirmed')
          .is('delivery_agent_id', null)
          .order('created_at', { ascending: false })

        setJobs(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [supabase, router])

  const handleAcceptJob = async (orderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('orders')
        .update({ delivery_agent_id: user.id, status: 'in_transit' })
        .eq('id', orderId)

      setJobs(jobs.filter(j => j.id !== orderId))
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to accept job')
    }
  }

  return (
    <div>
      <DeliveryHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Available Delivery Jobs</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No available jobs at the moment. Check back soon!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">Order #{job.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">Amount: ₦{job.total_amount.toLocaleString()}</p>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Created: {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAcceptJob(job.id)}
                  >
                    Accept Job
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
