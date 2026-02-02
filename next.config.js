/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Serverless function configuration
  serverMinification: true,
  serverSourceMaps: false,
  webpack: (config, { isServer, nextRuntime }) => {
    // Fix for Supabase SSR module issue with Next.js 15
    if (!isServer && nextRuntime === 'edge') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Enable static optimization where possible
  // swcMinify is now enabled by default in Next.js 15
  turbopack: {}, // Use empty turbopack config to silence warning
};

module.exports = nextConfig;
