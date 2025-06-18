import { AuthGuard } from '@/components/auth/auth-guard'
import { DesktopNav } from '@/components/navigation/desktop-nav'
import { MobileNav } from '@/components/navigation/mobile-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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