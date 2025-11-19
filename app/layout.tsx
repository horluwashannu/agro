import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import PWAInstallPrompt from '@/components/pwa-install-prompt'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'AgriBridge - Connect Farmers & Customers',
  description: 'Direct agricultural marketplace connecting farmers with customers',
  applicationName: 'AgriBridge',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AgriBridge',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/apple-icon.png' },
  ],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AgriBridge" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('[v0] SW registered:', reg))
                .catch(err => console.log('[v0] SW registration failed:', err));
            }
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              window.deferredPrompt = e;
              const installBtn = document.getElementById('install-btn');
              if (installBtn) installBtn.style.display = 'block';
            });
            window.addEventListener('appinstalled', () => {
              console.log('PWA installed');
              const installBtn = document.getElementById('install-btn');
              if (installBtn) installBtn.style.display = 'none';
            });
          `
        }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <PWAInstallPrompt />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
