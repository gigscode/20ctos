/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use file-based source maps in development to avoid eval() CSP warnings
  webpack(config, { dev }) {
    if (dev) config.devtool = 'cheap-module-source-map'
    return config
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
      {
        // Prevent the admin dashboard from being cached or framed
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
