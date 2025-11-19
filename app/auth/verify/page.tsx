'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Verify() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/customer/dashboard')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="text-3xl font-bold mb-4">Welcome to AgriBridge!</h1>
        <p className="text-muted-foreground mb-6">
          Your account has been created successfully. Redirecting to your dashboard...
        </p>
        <Button onClick={() => router.push('/customer/dashboard')} className="w-full bg-primary hover:bg-primary/90">
          Go to Dashboard
        </Button>
      </Card>
    </div>
  )
}
