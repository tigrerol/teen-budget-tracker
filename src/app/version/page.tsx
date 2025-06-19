'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VersionInfo } from '@/components/ui/version-info'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

export default function VersionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Version Information</h1>
          <p className="text-muted-foreground">Application build and deployment details</p>
        </div>
      </div>

      {/* Version Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Build Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VersionInfo />
        </CardContent>
      </Card>

      {/* Migration Strategy Info */}
      <Card>
        <CardHeader>
          <CardTitle>Migration & Deployment Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Build Number Usage</h4>
            <p className="text-sm text-muted-foreground">
              The build number is a Unix timestamp generated at build time. Use this to identify 
              which version is running in production and plan deployment rollbacks if needed.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Version Strategy</h4>
            <p className="text-sm text-muted-foreground">
              Version follows semantic versioning (MAJOR.MINOR.PATCH). The version is automatically 
              included in builds and can be used for feature flags and migration planning.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Git Integration</h4>
            <p className="text-sm text-muted-foreground">
              Git commit hash and branch information are captured at build time to track 
              exact source code state for debugging and rollback purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}