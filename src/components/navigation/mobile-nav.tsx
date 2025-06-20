'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { 
  Home, 
  PiggyBank, 
  Receipt, 
  BarChart3, 
  Trophy,
  Tags
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: Receipt,
  },
  {
    label: 'Budget',
    href: '/budget',
    icon: PiggyBank,
  },
  {
    label: 'Categories',
    href: '/categories',
    icon: Tags,
  },
  // Temporarily disabled
  // {
  //   label: 'Analytics',
  //   href: '/analytics',
  //   icon: BarChart3,
  // },
  // {
  //   label: 'Goals',
  //   href: '/achievements',
  //   icon: Trophy,
  // },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item: NavItem) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 text-xs transition-colors',
                isActive 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon 
                className={cn(
                  'h-5 w-5 mb-1',
                  isActive ? 'fill-current' : ''
                )} 
              />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}