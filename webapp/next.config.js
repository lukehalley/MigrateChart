/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use different build directory for production builds to avoid conflicts with dev server
  distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
}

module.exports = nextConfig
