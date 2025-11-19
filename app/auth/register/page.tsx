'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function Register() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role, setRole] = useState<string>('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })

  useEffect(() => {
    if (searchParams) {
      const roleParam = searchParams.get('role')
      if (roleParam) {
        setRole(roleParam)
      }
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Verify profile was created by trigger
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', authData.user.id)
          .single()

        if (!profile || profileError) {
          console.warn('[v0] Profile not found after trigger, calling API fallback')
          // Fallback: call API to create profile
          const response = await fetch('/api/auth/create-profile-service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: authData.user.id,
              email: formData.email,
              fullName: formData.fullName,
              role: role,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error('[v0] Profile creation API failed:', errorData)
            setError('Account created but profile setup failed. Please try signing in.')
            setLoading(false)
            return
          }
        }

        // Redirect to appropriate dashboard
        switch (role) {
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
      setError(err.message || 'Failed to register')
      console.error('[v0] Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join AgriBridge today</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="role">I am a</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-2 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="customer">Customer (Buy produce)</option>
              <option value="farmer">Farmer (Sell produce)</option>
              <option value="delivery_agent">Delivery Agent (Deliver orders)</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}
