'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoginModal } from '@/components/login-modal'
import { ChatBot } from '@/components/chat-bot'
import { HeroSection } from '@/components/hero-section'
import { FeaturedCategories } from '@/components/featured-categories'
import { TrendingProducts } from '@/components/trending-products'
import { Leaf, CheckCircle, Zap, Lock, Truck, BarChart3, Users, MapPin, Mail, Phone } from 'lucide-react'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

export default function Home() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstall(false)
    }
    setInstallPrompt(null)
  }

  const features = [
    {
      icon: Leaf,
      title: 'Farm Fresh Quality',
      description: 'Direct from farmers to your table - no middlemen',
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'Safe checkout with Paystack integration',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Real-time tracking of your orders',
    },
    {
      icon: BarChart3,
      title: 'Fair Pricing',
      description: 'Best value for both farmers and customers',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Direct connection with local producers',
    },
    {
      icon: Zap,
      title: '24/7 Support',
      description: 'Round-the-clock customer assistance',
    },
  ]

  const userRoles = [
    {
      role: 'customer',
      title: 'Shop Fresh Produce',
      description: 'Browse and buy directly from Nigerian farmers with transparent pricing and fast delivery',
      action: 'Start Shopping',
      href: '/auth/login?role=customer',
      icon: '🛒',
      color: 'from-blue-500/10 to-blue-500/5',
    },
    {
      role: 'farmer',
      title: 'Sell Your Harvest',
      description: 'Reach customers directly, control your prices, and eliminate middlemen profits',
      action: 'Become a Seller',
      href: '/auth/login?role=farmer',
      icon: '🌾',
      color: 'from-green-500/10 to-green-500/5',
    },
    {
      role: 'delivery_agent',
      title: 'Earn on Your Time',
      description: 'Take flexible delivery jobs and earn competitive rates with real-time tracking',
      action: 'Join Drivers',
      href: '/auth/login?role=delivery_agent',
      icon: '🚚',
      color: 'from-orange-500/10 to-orange-500/5',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <ChatBot />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-primary/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:inline">
              AgriBridge
            </span>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            <Link href="#features" className="text-sm text-foreground/70 hover:text-primary transition">
              Features
            </Link>
            <Link href="#products" className="text-sm text-foreground/70 hover:text-primary transition">
              Products
            </Link>
            <Link href="#roles" className="text-sm text-foreground/70 hover:text-primary transition">
              Get Started
            </Link>
            <Button onClick={() => setShowLoginModal(true)} className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </div>

          <div className="md:hidden">
            <Button onClick={() => setShowLoginModal(true)} size="sm" className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {showInstall && (
        <div className="bg-primary/10 border-b border-primary/20 sticky top-16 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Install AgriBridge App</p>
              <p className="text-sm text-muted-foreground">Quick access from your home screen</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInstallClick} size="sm" className="bg-primary hover:bg-primary/90">
                Install
              </Button>
              <Button onClick={() => setShowInstall(false)} variant="outline" size="sm">
                Later
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Trending Products */}
      <TrendingProducts />

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Why Choose <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AgriBridge?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We revolutionize agriculture by connecting farmers directly with consumers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card key={idx} className="p-6 hover:shadow-lg hover:border-primary/30 transition-all group">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="roles" className="py-16 md:py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Choose Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Role</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join AgriBridge as a customer, farmer, or delivery agent
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {userRoles.map((role) => (
              <Link key={role.role} href={role.href}>
                <Card
                  className={`p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full bg-gradient-to-br ${role.color} border-primary/10 hover:border-primary/30`}
                >
                  <div className="text-5xl mb-4">{role.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 text-foreground">{role.title}</h3>
                  <p className="text-muted-foreground mb-6 line-clamp-3">{role.description}</p>
                  <Button className="w-full bg-primary hover:bg-primary/90 font-semibold">
                    {role.action}
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-r from-primary via-primary/80 to-accent text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">300+</div>
              <p className="text-white/80">Fresh Products</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <p className="text-white/80">Local Farmers</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">5K+</div>
              <p className="text-white/80">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <p className="text-white/80">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground">Have questions? We're here to help</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-semibold mb-1">Email</p>
              <p className="text-muted-foreground text-sm">hello@agribridge.com</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-semibold mb-1">Phone</p>
              <p className="text-muted-foreground text-sm">+234 800 000 0000</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="font-semibold mb-1">Location</p>
              <p className="text-muted-foreground text-sm">Lagos, Nigeria</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 AgriBridge. Connecting farmers with customers across Nigeria.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </main>
  )
}
