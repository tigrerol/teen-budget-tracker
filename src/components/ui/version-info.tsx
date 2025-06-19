'use client'

import { BUILD_INFO } from '@/lib/build-info'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'

interface VersionInfoProps {
  compact?: boolean
  className?: string
  clickable?: boolean
}

export function VersionInfo({ compact = false, className = '', clickable = true }: VersionInfoProps) {
  const buildDate = new Date(BUILD_INFO.buildTimestamp)
  
  if (compact) {
    const content = (
      <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className} ${clickable ? 'hover:text-foreground transition-colors cursor-pointer' : ''}`}>
        <span>v{BUILD_INFO.version}</span>
        <span>•</span>
        <span>#{BUILD_INFO.buildNumber}</span>
        {BUILD_INFO.gitCommit !== 'unknown' && (
          <>
            <span>•</span>
            <span>{BUILD_INFO.gitCommit}</span>
          </>
        )}
      </div>
    )
    
    if (clickable) {
      return <Link href="/version">{content}</Link>
    }
    
    return content
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Badge variant="outline">v{BUILD_INFO.version}</Badge>
        <Badge variant="secondary">Build #{BUILD_INFO.buildNumber}</Badge>
        {BUILD_INFO.gitCommit !== 'unknown' && (
          <Badge variant="outline">{BUILD_INFO.gitCommit}</Badge>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Built: {format(buildDate, 'MMM dd, yyyy • HH:mm')} UTC</div>
        {BUILD_INFO.gitBranch !== 'unknown' && (
          <div>Branch: {BUILD_INFO.gitBranch}</div>
        )}
        <div>Environment: {BUILD_INFO.environment}</div>
        <div>Node: {BUILD_INFO.nodeVersion}</div>
      </div>
    </div>
  )
}

export function useVersionInfo() {
  return BUILD_INFO
}