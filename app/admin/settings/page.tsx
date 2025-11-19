'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [paystackKeys, setPaystackKeys] = useState({
    public_key: '',
    secret_key: '',
  })
  const [deliveryFee, setDeliveryFee] = useState({
    default: 500,
    per_km: 100,
  })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        const [paystackData, deliveryData] = await Promise.all([
          supabase.from('settings').select('value').eq('key', 'paystack_config').single(),
          supabase.from('settings').select('value').eq('key', 'delivery_fee').single(),
        ])

        if (paystackData.data?.value) {
          setPaystackKeys(paystackData.data.value)
        }
        if (deliveryData.data?.value) {
          setDeliveryFee(deliveryData.data.value)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase, router])

  const handleSaveSettings = async () => {
    try {
      await Promise.all([
        supabase.from('settings').upsert({
          key: 'paystack_config',
          value: paystackKeys,
        }),
        supabase.from('settings').upsert({
          key: 'delivery_fee',
          value: deliveryFee,
        }),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-2xl">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          {saved && (
            <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
              Settings saved successfully!
            </div>
          )}

          {loading ? (
            <p className="text-muted-foreground">Loading settings...</p>
          ) : (
            <div className="space-y-8">
              {/* Paystack Configuration */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Paystack Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="public_key">Public Key</Label>
                    <Input
                      id="public_key"
                      value={paystackKeys.public_key}
                      onChange={(e) => setPaystackKeys({ ...paystackKeys, public_key: e.target.value })}
                      placeholder="pk_live_..."
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secret_key">Secret Key</Label>
                    <Input
                      id="secret_key"
                      type="password"
                      value={paystackKeys.secret_key}
                      onChange={(e) => setPaystackKeys({ ...paystackKeys, secret_key: e.target.value })}
                      placeholder="sk_live_..."
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              {/* Delivery Fee Configuration */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Delivery Fee</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="default_fee">Default Delivery Fee (₦)</Label>
                    <Input
                      id="default_fee"
                      type="number"
                      value={deliveryFee.default}
                      onChange={(e) => setDeliveryFee({ ...deliveryFee, default: parseInt(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="per_km">Per Kilometer (₦)</Label>
                    <Input
                      id="per_km"
                      type="number"
                      value={deliveryFee.per_km}
                      onChange={(e) => setDeliveryFee({ ...deliveryFee, per_km: parseInt(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              <Button
                onClick={handleSaveSettings}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Save Settings
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
