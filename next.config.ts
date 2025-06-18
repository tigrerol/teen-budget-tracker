import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone build for Docker deployment
  output: 'standalone',
  
  // Optimize images for production
  images: {
    unoptimized: true // For self-hosted deployment
  },
  
  // Server external packages (moved from experimental)
  serverExternalPackages: ['@prisma/client'],
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true, // Ignore lint errors during build for now
  },
};

export default nextConfig;
