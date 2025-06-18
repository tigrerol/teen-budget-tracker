import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone build for Docker deployment
  output: 'standalone',
  
  // Optimize images for production
  images: {
    unoptimized: true // For self-hosted deployment
  },
  
  // Experimental features
  experimental: {
    // Enable server components optimizations
    serverComponentsExternalPackages: ['@prisma/client']
  }
};

export default nextConfig;
