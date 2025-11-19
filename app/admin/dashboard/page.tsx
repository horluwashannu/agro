'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { StatsCard } from '@/components/admin/stats-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase-client'

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  activeProducts: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'customer',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login?role=admin')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'admin') {
          router.push('/')
          return
        }

        // Fetch stats
        const [usersData, ordersData, productsData, paymentsData] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('orders').select('id', { count: 'exact' }),
          supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
          supabase.from('payments').select('amount').eq('status', 'success'),
        ])

        const totalRevenue = paymentsData.data?.reduce((sum, p) => sum + p.amount, 0) || 0

        setStats({
          totalUsers: usersData.count || 0,
          totalOrders: ordersData.count || 0,
          totalRevenue: totalRevenue,
          activeProducts: productsData.count || 0,
        })

        // Fetch recent orders
        const { data: orders } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentOrders(orders || [])

        await fetchUsers()
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, router])

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(data || [])
    } catch (error) {
      console.error('[v0] Fetch users error:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreating(true)

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      setFormData({ email: '', password: '', fullName: '', role: 'customer' })
      setShowCreateUser(false)
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <StatsCard
              label="Total Users"
              value={stats.totalUsers}
              change="12%"
              icon="👥"
            />
            <StatsCard
              label="Total Orders"
              value={stats.totalOrders}
              change="8%"
              icon="📦"
            />
            <StatsCard
              label="Total Revenue"
              value={`₦${stats.totalRevenue.toLocaleString()}`}
              change="15%"
              icon="💰"
            />
            <StatsCard
              label="Active Products"
              value={stats.activeProducts}
              change="5%"
              icon="🌾"
            />
          </div>

          {/* Recent Orders */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 font-semibold">Order ID</th>
                    <th className="text-left py-3 font-semibold">Amount</th>
                    <th className="text-left py-3 font-semibold">Status</th>
                    <th className="text-left py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 text-sm font-mono">{order.id.slice(0, 8)}...</td>
                      <td className="py-3 font-semibold">₦{order.total_amount.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* User Management Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">User Management</h2>
              <Button onClick={() => setShowCreateUser(!showCreateUser)} className="bg-primary hover:bg-primary/90">
                Create User
              </Button>
            </div>

            {showCreateUser && (
              <form onSubmit={handleCreateUser} className="bg-muted p-6 rounded-lg mb-6">
                {error && (
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    >
                      <option value="customer">Customer</option>
                      <option value="farmer">Farmer</option>
                      <option value="delivery_agent">Delivery Agent</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button type="submit" disabled={creating} className="bg-primary hover:bg-primary/90">
                    {creating ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2">{u.full_name}</td>
                      <td className="py-2">{u.email}</td>
                      <td className="py-2 capitalize">{u.role?.replace('_', ' ')}</td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
