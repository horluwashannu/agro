'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerHeader } from '@/components/customer/customer-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaystackButton } from '@/components/paystack/paystack-button'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function WalletPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [wallet, setWallet] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [topupAmount, setTopupAmount] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/auth/login')
          return
        }

        setUser(authUser)

        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', authUser.id)
          .single()

        const { data: walletData } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', authUser.id)
          .single()

        setWallet(walletData)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWallet()
  }, [supabase, router])

  const handleTopupSuccess = async () => {
    setSuccessMessage('Wallet top-up successful!')
    setTopupAmount('')
    setShowPayment(false)

    // Refresh wallet
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: walletData } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', authUser.id)
          .single()

        setWallet(walletData)
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error)
    }

    setTimeout(() => setSuccessMessage(null), 5000)
  }

  return (
    <div>
      <CustomerHeader />

      <main className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-4xl font-bold mb-8">My Wallet</h1>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800 text-sm">
            {successMessage}
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading wallet...</p>
        ) : (
          <div className="space-y-6">
            {/* Balance Card */}
            <Card className="p-8 bg-gradient-to-br from-primary to-primary/80">
              <p className="text-white/80 mb-2">Current Balance</p>
              <p className="text-4xl font-bold text-white">
                ₦{wallet?.balance?.toLocaleString() || 0}
              </p>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Top-up</p>
                <p className="text-lg font-bold">₦{wallet?.total_topup?.toLocaleString() || 0}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                <p className="text-lg font-bold">₦{wallet?.total_spent?.toLocaleString() || 0}</p>
              </Card>
            </div>

            {/* Top-up Form */}
            {!showPayment ? (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Top up Your Wallet</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={topupAmount}
                      onChange={(e) => setTopupAmount(e.target.value)}
                      min="100"
                      className="mt-2"
                    />
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => {
                      if (topupAmount && parseFloat(topupAmount) > 0) {
                        setShowPayment(true)
                      } else {
                        alert('Please enter a valid amount')
                      }
                    }}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Confirm Payment</h2>
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Amount to pay:</p>
                  <p className="text-2xl font-bold">₦{parseFloat(topupAmount || '0').toLocaleString()}</p>
                </div>

                {user && (
                  <div className="space-y-3">
                    <PaystackButton
                      amount={parseFloat(topupAmount || '0')}
                      email={user.email}
                      paymentType="wallet_topup"
                      onSuccess={handleTopupSuccess}
                      onError={(error) => alert(`Payment failed: ${error}`)}
                    >
                      Pay with Paystack
                    </PaystackButton>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowPayment(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-accent/10 border-accent/20">
              <p className="text-sm text-foreground/80">
                Use your wallet to pay for products and deliveries. Your balance is secure and available anytime.
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
