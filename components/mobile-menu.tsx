'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface MenuLink {
  href: string
  label: string
  icon?: React.ReactNode
}

interface MobileMenuProps {
  links?: MenuLink[]
  brand?: string
}

export default function MobileMenu({
  links = [],
  brand = 'AgriBridge',
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (links.length === 0) return null

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between bg-background border-b border-border px-4 py-3 sticky top-0 z-40">
        <div className="font-bold text-lg">{brand}</div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-muted rounded-lg"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="bg-card border-b border-border">
          <nav className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-muted transition-colors last:border-b-0"
              >
                {link.icon && <span className="w-5 h-5">{link.icon}</span>}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
