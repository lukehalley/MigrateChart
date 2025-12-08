/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use separate dev directory to avoid conflicts with production builds
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  webpack: (config) => {
    // Suppress webpack cache serialization warnings
    config.infrastructureLogging = {
      level: 'error',
    }
    return config
  },
}

module.exports = nextConfig
