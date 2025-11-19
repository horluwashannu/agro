'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [mounted, setMounted] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      console.log('[v0] beforeinstallprompt event fired')
      setInstallPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    const timer = setTimeout(() => {
      if (!installPrompt && !isIOSDevice) {
        const lastDismissed = localStorage.getItem('pwa-dismiss-time')
        if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 24 * 60 * 60 * 1000) {
          setShowPrompt(true)
        }
      }
    }, 2000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [mounted, installPrompt])

  const handleInstall = async () => {
    if (!installPrompt) return
    try {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        console.log('[v0] PWA installed successfully')
        setShowPrompt(false)
        localStorage.removeItem('pwa-dismiss-time')
      }
      setInstallPrompt(null)
    } catch (error) {
      console.error('[v0] Install error:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-dismiss-time', Date.now().toString())
  }

  if (!mounted || !showPrompt) return null

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm md:bottom-8">
        <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-semibold flex items-center gap-2">
              <Download className="w-4 h-4" />
              Install AgriBridge
            </p>
            <p className="text-sm opacity-90 mt-2">
              Tap the share icon and select "Add to Home Screen"
            </p>
          </div>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-primary-foreground hover:bg-primary/80 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm md:bottom-8 animate-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg shadow-xl p-4 flex items-center justify-between gap-4 border border-primary/20">
        <div className="flex-1">
          <p className="font-semibold flex items-center gap-2">
            <Download className="w-5 h-5" />
            Get AgriBridge App
          </p>
          <p className="text-sm opacity-90 mt-1">Install on your device for quick access</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
          >
            Install
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-primary-foreground hover:bg-primary/80"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
