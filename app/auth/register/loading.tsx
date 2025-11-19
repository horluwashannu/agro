'use client'

import { Card } from '@/components/ui/card'

export default function RegisterLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <div className="h-9 bg-muted rounded-lg mb-2 w-32 animate-pulse" />
          <div className="h-4 bg-muted rounded w-40 animate-pulse" />
        </div>

        <div className="space-y-4">
          <div>
            <div className="h-4 bg-muted rounded w-12 mb-2 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>

          <div>
            <div className="h-4 bg-muted rounded w-20 mb-2 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>

          <div>
            <div className="h-4 bg-muted rounded w-12 mb-2 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>

          <div>
            <div className="h-4 bg-muted rounded w-16 mb-2 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>

          <div>
            <div className="h-4 bg-muted rounded w-28 mb-2 animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>

          <div className="h-10 bg-primary/50 rounded animate-pulse" />
        </div>

        <div className="mt-6 text-center">
          <div className="h-4 bg-muted rounded w-48 mx-auto animate-pulse" />
        </div>
      </Card>
    </div>
  )
}
