'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'

interface CheckoutButtonProps {
  amount: number
  orderId?: string
  onSuccess?: () => void
  className?: string
}

export default function CheckoutButton({
  amount,
  orderId,
  onSuccess,
  className,
}: CheckoutButtonProps) {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          orderId: orderId || null,
          userId: user.user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      window.location.href = data.paymentUrl
    } catch (error: any) {
      console.error('[v0] Checkout error:', error)
      alert(error.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className || 'bg-primary hover:bg-primary/90'}
    >
      {loading ? 'Processing...' : `Pay ₦${amount.toLocaleString()}`}
    </Button>
  )
}
