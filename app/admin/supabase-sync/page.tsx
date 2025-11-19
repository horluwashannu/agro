'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'

export default function SupabaseSyncPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')

  const handleSync = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setMessage('Please provide both Supabase URL and API Key')
      setStatus('error')
      return
    }

    setStatus('loading')
    setMessage('Starting database sync...')

    try {
      const response = await fetch('/api/admin/supabase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseUrl, supabaseKey }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Database synced successfully!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Sync failed')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'An error occurred during sync')
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Supabase Sync & Migration</h1>
        <p className="text-muted-foreground mb-6">
          Migrate your database to a different Supabase instance and automatically import all tables and schema
        </p>

        <Card className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Create a new Supabase project</li>
              <li>Copy your new project's URL and API key</li>
              <li>Paste them below</li>
              <li>Click sync to automatically create all tables and import data</li>
            </ol>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Supabase Project URL</label>
              <input
                type="url"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Supabase API Key (anon)</label>
              <input
                type="password"
                placeholder="eyJh..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div
              className={`flex gap-3 p-4 rounded-lg ${
                status === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-900'
                  : status === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-900'
                  : 'bg-blue-50 border border-blue-200 text-blue-900'
              }`}
            >
              {status === 'loading' && <Loader className="w-5 h-5 animate-spin" />}
              {status === 'success' && <CheckCircle className="w-5 h-5" />}
              {status === 'error' && <AlertCircle className="w-5 h-5" />}
              <span>{message}</span>
            </div>
          )}

          {/* Sync Button */}
          <Button
            onClick={handleSync}
            disabled={status === 'loading' || !supabaseUrl || !supabaseKey}
            className="w-full bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            {status === 'loading' ? 'Syncing...' : 'Start Sync'}
          </Button>

          {/* Success Steps */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-green-900">Next steps:</p>
              <ul className="list-disc list-inside text-green-900/80 space-y-1">
                <li>Update your environment variables to use the new Supabase instance</li>
                <li>Restart your application</li>
                <li>Test all functionality</li>
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
