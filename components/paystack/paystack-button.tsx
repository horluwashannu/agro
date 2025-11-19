'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Script from 'next/script'

interface PaystackButtonProps {
  amount: number
  email: string
  paymentType: 'wallet_topup' | 'product_purchase'
  onSuccess?: () => void
  onError?: (error: string) => void
  disabled?: boolean
  children?: React.ReactNode
}

declare global {
  interface Window {
    PaystackPop: any
  }
}

export function PaystackButton({
  amount,
  email,
  paymentType,
  onSuccess,
  onError,
  disabled,
  children,
}: PaystackButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Initialize payment
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type: paymentType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // Make payment with Paystack
      if (window.PaystackPop) {
        window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email,
          amount: amount * 100,
          ref: data.reference,
          onClose: () => {
            setLoading(false)
            onError?.('Payment window closed')
          },
          onSuccess: async () => {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/paystack/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: data.reference }),
              })

              if (verifyResponse.ok) {
                onSuccess?.()
              } else {
                throw new Error('Payment verification failed')
              }
            } catch (error: any) {
              onError?.(error.message)
            } finally {
              setLoading(false)
            }
          },
        })
        window.PaystackPop.openIframe()
      }
    } catch (error: any) {
      onError?.(error.message)
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" />
      <Button
        onClick={handlePayment}
        disabled={disabled || loading}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {loading ? 'Processing...' : children || 'Pay Now'}
      </Button>
    </>
  )
}
