'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { DesktopNav } from '@/components/navigation/desktop-nav'
import { MobileNav } from '@/components/navigation/mobile-nav'

interface DashboardLayoutClientProps {
  children: React.ReactNode
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  // Redirect unauthenticated users to signin (except if already on auth pages)
  useEffect(() => {
    if (status === 'unauthenticated' && !pathname.startsWith('/auth')) {
      router.push('/auth/signin')
    }
  }, [status, pathname, router])

  // If on auth pages, don't wrap with dashboard layout
  if (pathname.startsWith('/auth')) {
    return <>{children}</>
  }

  // If authenticated, wrap with dashboard layout
  if (status === 'authenticated') {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <DesktopNav />
          
          <main className="pb-16 md:pb-0">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              {children}
            </div>
          </main>

          <MobileNav />
        </div>
      </AuthGuard>
    )
  }

  // Loading state or unauthenticated - will redirect
  return <>{children}</>
}