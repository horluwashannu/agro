'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase-client'
import { Profile } from '@/lib/types'

export default function UsersPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        setUsers(profiles || [])
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [supabase, router])

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Users</h1>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <Card className="p-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 font-semibold">Name</th>
                    <th className="text-left py-3 font-semibold">Email</th>
                    <th className="text-left py-3 font-semibold">Role</th>
                    <th className="text-left py-3 font-semibold">Phone</th>
                    <th className="text-left py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3">{user.full_name || 'N/A'}</td>
                      <td className="py-3 text-sm">{user.email}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'farmer' ? 'bg-green-100 text-green-800' :
                          user.role === 'delivery_agent' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-sm">{user.phone || '-'}</td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
