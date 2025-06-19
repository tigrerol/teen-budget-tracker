#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Get package.json version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const version = packageJson.version

// Generate build number (timestamp-based)
const buildTimestamp = new Date().toISOString()
const buildNumber = Math.floor(Date.now() / 1000) // Unix timestamp

// Get git info if available
let gitCommit = 'unknown'
let gitBranch = 'unknown'

try {
  gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
} catch (error) {
  console.log('Git info not available:', error.message)
}

// Build info object
const buildInfo = {
  version,
  buildNumber,
  buildTimestamp,
  gitCommit,
  gitBranch,
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || 'development'
}

// Write to public directory for runtime access
const publicBuildInfo = path.join('public', 'build-info.json')
fs.writeFileSync(publicBuildInfo, JSON.stringify(buildInfo, null, 2))

// Write to src for compile-time access
const srcBuildInfo = path.join('src', 'lib', 'build-info.ts')
const buildInfoTs = `// Auto-generated build info - DO NOT EDIT
export const BUILD_INFO = ${JSON.stringify(buildInfo, null, 2)} as const

export type BuildInfo = typeof BUILD_INFO
`

// Ensure src/lib directory exists
fs.mkdirSync(path.dirname(srcBuildInfo), { recursive: true })
fs.writeFileSync(srcBuildInfo, buildInfoTs)

console.log('✅ Build info generated:')
console.log(`   Version: ${version}`)
console.log(`   Build: ${buildNumber}`)
console.log(`   Commit: ${gitCommit}`)
console.log(`   Branch: ${gitBranch}`)
console.log(`   Timestamp: ${buildTimestamp}`)