'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [roleParam, setRoleParam] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (searchParams) {
      const role = searchParams.get('role')
      setRoleParam(role)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError

      if (data.user) {
        // Fetch user profile to determine their role and redirect accordingly
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        const userRole = profile?.role || 'customer'

        // Redirect to appropriate dashboard
        switch (userRole) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'farmer':
            router.push('/farmer/dashboard')
            break
          case 'delivery_agent':
            router.push('/delivery/dashboard')
            break
          case 'customer':
          default:
            router.push('/customer/dashboard')
            break
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-muted-foreground">
            {roleParam ? `Sign in as ${roleParam.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}` : 'Welcome back to AgriBridge'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline font-semibold">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  )
}
